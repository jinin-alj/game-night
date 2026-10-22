import { describe, expect, it } from "vitest";
import { splitNights } from "./split";

function makeNight(id: string, nightDate: string) {
  return { id, name: `Night ${id}`, nightDate, availableMinutes: 180 };
}

describe("splitNights", () => {
  const nightsSortedByDate = [
    makeNight("a", "2026-10-01"),
    makeNight("b", "2026-10-15"),
    makeNight("c", "2026-10-22"),
    makeNight("d", "2026-10-23"),
    makeNight("e", "2026-11-06"),
  ];

  it("puts today and later under upcoming, soonest first", () => {
    const { upcoming } = splitNights(nightsSortedByDate, "2026-10-22");
    expect(upcoming.map((night) => night.id)).toEqual(["c", "d", "e"]);
  });

  it("puts earlier nights under past, latest first", () => {
    const { past } = splitNights(nightsSortedByDate, "2026-10-22");
    expect(past.map((night) => night.id)).toEqual(["b", "a"]);
  });

  it("returns two empty lists when there are no nights", () => {
    expect(splitNights([], "2026-10-22")).toEqual({ upcoming: [], past: [] });
  });
});
