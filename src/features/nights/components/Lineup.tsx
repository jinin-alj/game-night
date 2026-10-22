import { formatDuration } from "@/lib/dates";
import type { Lineup as PlannedLineup } from "@/lib/planner/planner";

type LineupProps = {
  lineup: PlannedLineup;
  attendeeCount: number;
  availableMinutes: number;
};

/** The planned games for the night, with the minutes used and left and a reason for each. */
export function Lineup({
  lineup,
  attendeeCount,
  availableMinutes,
}: LineupProps) {
  if (attendeeCount === 0) {
    return <p>Tick at least one member who’s coming, then plan.</p>;
  }

  const playerText =
    lineup.playerCount === 1 ? "1 player" : `${lineup.playerCount} players`;

  if (lineup.picks.length === 0) {
    return (
      <p>
        No game fits {playerText} in {formatDuration(availableMinutes)}. Add
        more time or more games to the shelf.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p>
        For {playerText} · {formatDuration(lineup.minutesUsed)} used ·{" "}
        {lineup.minutesLeft === 0
          ? "no time left"
          : `${formatDuration(lineup.minutesLeft)} left`}
      </p>
      <ol className="flex flex-col gap-3">
        {lineup.picks.map((pick, index) => (
          <li
            key={pick.gameId}
            className="flex gap-3 rounded-xl border border-ink/15 p-3"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mustard font-bold"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="font-semibold break-words">
                {pick.title} · {formatDuration(pick.playtimeMinutes)}
              </p>
              <p className="text-sm">{pick.reasons.join(" · ")}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
