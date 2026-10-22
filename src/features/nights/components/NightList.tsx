import { DecorativeArt } from "@/components/DecorativeArt";
import { formatDuration, formatNightDate } from "@/lib/dates";
import { splitNights } from "../split";
import type { NightSummary } from "../types";

type NightListProps = {
  nights: NightSummary[];
  today: string;
};

/** Lists a group's nights in two parts: upcoming, then past. */
export function NightList({ nights, today }: NightListProps) {
  if (nights.length === 0) {
    return <p>No game nights yet. Create your first one above.</p>;
  }

  const { upcoming, past } = splitNights(nights, today);

  return (
    <div className="flex flex-col gap-8">
      <NightSection title="Upcoming" nights={upcoming} />
      <NightSection title="Past" nights={past} />
    </div>
  );
}

type NightSectionProps = {
  title: string;
  nights: NightSummary[];
};

function NightSection({ title, nights }: NightSectionProps) {
  if (nights.length === 0) {
    return null;
  }

  const headingId = `${title.toLowerCase()}-nights-heading`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-xl font-bold">
        {title}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {nights.map((night) => (
          <li
            key={night.id}
            data-testid="core-item"
            className="flex items-center gap-3 rounded-2xl bg-paper-light p-3"
          >
            <DecorativeArt
              src="/art/zone-4.svg"
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-lg"
            />
            <div className="min-w-0">
              <p className="font-semibold break-words">{night.name}</p>
              <p className="text-sm">
                {formatNightDate(night.nightDate)} ·{" "}
                {formatDuration(night.availableMinutes)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
