import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { primaryButtonClassName, textLinkClassName } from "@/components/styles";
import { listGames } from "@/features/games/queries";
import { listGroupMembers } from "@/features/groups/queries";
import { getSessionContext } from "@/features/groups/session";
import { deleteNight } from "@/features/nights/actions";
import { AttendeeChecklist } from "@/features/nights/components/AttendeeChecklist";
import { EditNightForm } from "@/features/nights/components/EditNightForm";
import { GuestList } from "@/features/nights/components/GuestList";
import { Lineup } from "@/features/nights/components/Lineup";
import {
  getNight,
  listAttendeeIds,
  listGuests,
} from "@/features/nights/queries";
import { nightIdSchema } from "@/features/nights/schemas";
import { PlaysSection } from "@/features/plays/components/PlaysSection";
import {
  getGroupLastPlayedDates,
  listPlaysForNight,
} from "@/features/plays/queries";
import { formatDuration, formatNightDate, getTodayInMadrid } from "@/lib/dates";
import { planNight } from "@/lib/planner/planner";
import { listGroupRatings } from "@/features/ratings/queries";

export const metadata: Metadata = {
  title: "Night · Game Night Planner",
};

/** One game night: who's coming, guests, hours, and the planned lineup. */
export default async function NightPage({
  params,
  searchParams,
}: PageProps<"/app/nights/[nightId]">) {
  const { nightId } = await params;
  const { plan } = await searchParams;

  const parsedNightId = nightIdSchema.safeParse(nightId);
  if (!parsedNightId.success) {
    notFound();
  }

  const { supabase } = await getSessionContext();
  // Row security hides nights from other groups, so they show the same 404 as missing ones.
  const night = await getNight(supabase, parsedNightId.data);
  if (!night) {
    notFound();
  }

  const members = await listGroupMembers(supabase, night.groupId);
  const attendeeIds = await listAttendeeIds(supabase, night.id);
  const guests = await listGuests(supabase, night.id);
  const games = await listGames(supabase, night.groupId);
  const plays = await listPlaysForNight(supabase, night.id);
  const lastPlayedDates = await getGroupLastPlayedDates(
    supabase,
    night.groupId,
  );
  const ratings = await listGroupRatings(supabase, night.groupId);
  if (
    !members ||
    !attendeeIds ||
    !guests ||
    !games ||
    !plays ||
    !lastPlayedDates ||
    !ratings
  ) {
    return (
      <p role="alert" className="text-canyon-dark">
        Couldn’t load this night. Refresh the page to try again.
      </p>
    );
  }

  const today = getTodayInMadrid();
  // Plays can only be logged on the night itself or later.
  const canLogPlays = night.nightDate <= today;
  const loggedGameIds: string[] = [];
  for (const play of plays) {
    if (play.gameId) {
      loggedGameIds.push(play.gameId);
    }
  }

  const showLineup = plan === "1";
  const lineup = showLineup
    ? planNight({
        games,
        attendeeIds,
        guestCount: guests.length,
        availableMinutes: night.availableMinutes,
        ratings,
        lastPlayedDates,
        today,
      })
    : null;

  return (
    <div className="flex flex-col gap-8">
      <Link href="/app" className={`self-start ${textLinkClassName}`}>
        ← All nights
      </Link>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold break-words">{night.name}</h1>
        <p>
          {formatNightDate(night.nightDate)} ·{" "}
          {formatDuration(night.availableMinutes)}
        </p>
        <EditNightForm
          key={`${night.name}-${night.nightDate}-${night.availableMinutes}`}
          night={night}
        />
      </div>

      <NightSection id="coming" title="Who’s coming">
        <AttendeeChecklist
          key={attendeeIds.join(",")}
          nightId={night.id}
          members={members}
          attendeeIds={attendeeIds}
        />
      </NightSection>

      <NightSection id="guests" title="Guests">
        <GuestList nightId={night.id} guests={guests} />
      </NightSection>

      <NightSection id="lineup" title="Lineup">
        <Link
          href={`/app/nights/${night.id}?plan=1#lineup`}
          className={`self-start ${primaryButtonClassName}`}
        >
          {showLineup ? "Plan again" : "Plan my night"}
        </Link>
        {lineup ? (
          <Lineup
            lineup={lineup}
            attendeeCount={attendeeIds.length}
            availableMinutes={night.availableMinutes}
            nightId={night.id}
            canLogPlays={canLogPlays}
            loggedGameIds={loggedGameIds}
          />
        ) : null}
      </NightSection>

      <NightSection id="played" title="Played this night">
        <PlaysSection
          nightId={night.id}
          plays={plays}
          games={games}
          canLogPlays={canLogPlays}
          firstDayText={formatNightDate(night.nightDate)}
        />
      </NightSection>

      <ConfirmActionButton
        action={deleteNight}
        buttonLabel="Delete night"
        question={`Delete ${night.name}? Its attendees and guests go too.`}
        confirmLabel="Yes, delete"
        isDangerous={true}
        hiddenFields={{ nightId: night.id }}
      />
    </div>
  );
}

type NightSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

function NightSection({ id, title, children }: NightSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="flex scroll-mt-4 flex-col gap-4 rounded-2xl bg-paper-light p-5"
    >
      <h2 id={headingId} className="text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
