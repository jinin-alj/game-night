import { weeksBetween } from "@/lib/dates";

const NEVER_PLAYED_RATING = 10;
const PLAYED_UNRATED_RATING = 5;
const MAX_RECENCY_WEEKS = 5;

export type PlannerGame = {
  id: string;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  playtimeMinutes: number;
};

export type PlannerRating = {
  userId: string;
  gameId: string;
  score: number;
};

export type PlannerInput = {
  games: PlannerGame[];
  attendeeIds: string[];
  guestCount: number;
  availableMinutes: number;
  ratings: PlannerRating[];
  // Game id → YYYY-MM-DD of the latest night it was played in this group.
  lastPlayedDates: Record<string, string>;
  today: string;
};

export type LineupPick = {
  gameId: string;
  title: string;
  playtimeMinutes: number;
  score: number;
  reasons: string[];
};

export type Lineup = {
  playerCount: number;
  fittingGameCount: number;
  picks: LineupPick[];
  minutesUsed: number;
  minutesLeft: number;
};

/** Picks the best games for a night that fit the players and the time (rules in PLAN §6). */
export function planNight(input: PlannerInput): Lineup {
  const playerCount = input.attendeeIds.length + input.guestCount;

  const candidates: LineupPick[] = [];
  for (const game of input.games) {
    if (game.minPlayers <= playerCount && playerCount <= game.maxPlayers) {
      candidates.push(scoreGame(game, input));
    }
  }

  const emptyLineup: Lineup = {
    playerCount,
    fittingGameCount: candidates.length,
    picks: [],
    minutesUsed: 0,
    minutesLeft: input.availableMinutes,
  };
  // Without a member there is nobody's taste to plan for.
  if (input.attendeeIds.length === 0) {
    return emptyLineup;
  }

  candidates.sort(compareCandidates);

  const picks: LineupPick[] = [];
  let minutesLeft = input.availableMinutes;
  for (const candidate of candidates) {
    if (candidate.playtimeMinutes <= minutesLeft) {
      picks.push(candidate);
      minutesLeft = minutesLeft - candidate.playtimeMinutes;
    }
  }

  return {
    ...emptyLineup,
    picks,
    minutesUsed: input.availableMinutes - minutesLeft,
    minutesLeft,
  };
}

function scoreGame(game: PlannerGame, input: PlannerInput): LineupPick {
  const lastPlayed = input.lastPlayedDates[game.id];
  const neverPlayed = lastPlayed === undefined;

  let ratingTotal = 0;
  let ratedByAttendee = false;
  for (const attendeeId of input.attendeeIds) {
    const ownRating = findRating(input.ratings, attendeeId, game.id);
    if (ownRating !== null) {
      ratingTotal = ratingTotal + ownRating;
      ratedByAttendee = true;
    } else if (neverPlayed) {
      ratingTotal = ratingTotal + NEVER_PLAYED_RATING;
    } else {
      ratingTotal = ratingTotal + PLAYED_UNRATED_RATING;
    }
  }
  const ratingPart =
    input.attendeeIds.length > 0 ? ratingTotal / input.attendeeIds.length : 0;

  const reasons: string[] = [];
  if (ratedByAttendee) {
    reasons.push(`avg rating ${Math.round(ratingPart * 10) / 10}`);
  }

  let recencyPart = MAX_RECENCY_WEEKS;
  if (neverPlayed) {
    reasons.push("never played");
  } else {
    const weeks = weeksBetween(lastPlayed, input.today);
    recencyPart = Math.min(weeks, MAX_RECENCY_WEEKS);
    reasons.push(describeRecency(weeks));
  }

  return {
    gameId: game.id,
    title: game.title,
    playtimeMinutes: game.playtimeMinutes,
    score: ratingPart + recencyPart,
    reasons,
  };
}

function findRating(
  ratings: PlannerRating[],
  userId: string,
  gameId: string,
): number | null {
  for (const rating of ratings) {
    if (rating.userId === userId && rating.gameId === gameId) {
      return rating.score;
    }
  }
  return null;
}

function describeRecency(weeks: number): string {
  if (weeks === 0) {
    return "played this week";
  }
  if (weeks === 1) {
    return "not played in 1 week";
  }
  return `not played in ${weeks} weeks`;
}

// Ties: higher score first, then shorter playtime, then title A–Z.
function compareCandidates(first: LineupPick, second: LineupPick): number {
  if (first.score !== second.score) {
    return second.score - first.score;
  }
  if (first.playtimeMinutes !== second.playtimeMinutes) {
    return first.playtimeMinutes - second.playtimeMinutes;
  }
  return first.title.localeCompare(second.title);
}
