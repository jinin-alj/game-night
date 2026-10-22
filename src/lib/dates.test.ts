import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatNightDate,
  getNextFriday,
  getTodayInMadrid,
  isRealDate,
  weeksBetween,
} from "./dates";

describe("getTodayInMadrid", () => {
  it("returns the date in Madrid during the day", () => {
    expect(getTodayInMadrid(new Date("2026-10-22T10:00:00Z"))).toBe(
      "2026-10-22",
    );
  });

  it("is already tomorrow in Madrid while it is still today in UTC", () => {
    expect(getTodayInMadrid(new Date("2026-10-22T22:30:00Z"))).toBe(
      "2026-10-23",
    );
  });
});

describe("getNextFriday", () => {
  it("returns the coming Friday for every other weekday", () => {
    expect(getNextFriday("2026-10-17")).toBe("2026-10-23");
    expect(getNextFriday("2026-10-18")).toBe("2026-10-23");
    expect(getNextFriday("2026-10-19")).toBe("2026-10-23");
    expect(getNextFriday("2026-10-20")).toBe("2026-10-23");
    expect(getNextFriday("2026-10-21")).toBe("2026-10-23");
    expect(getNextFriday("2026-10-22")).toBe("2026-10-23");
  });

  it("returns today when today is a Friday", () => {
    expect(getNextFriday("2026-10-23")).toBe("2026-10-23");
  });

  it("moves into the next month", () => {
    expect(getNextFriday("2026-10-31")).toBe("2026-11-06");
  });

  it("moves into the next year", () => {
    expect(getNextFriday("2026-12-26")).toBe("2027-01-01");
  });
});

describe("isRealDate", () => {
  it("accepts real calendar dates", () => {
    expect(isRealDate("2026-10-23")).toBe(true);
    expect(isRealDate("2028-02-29")).toBe(true);
  });

  it("rejects dates that don't exist", () => {
    expect(isRealDate("2026-02-30")).toBe(false);
    expect(isRealDate("2027-02-29")).toBe(false);
    expect(isRealDate("2026-13-01")).toBe(false);
  });

  it("rejects text in the wrong format", () => {
    expect(isRealDate("")).toBe(false);
    expect(isRealDate("23/10/2026")).toBe(false);
    expect(isRealDate("2026-10-23T00:00")).toBe(false);
  });
});

describe("formatNightDate", () => {
  it("shows the weekday, day, month and year without shifting the date", () => {
    expect(formatNightDate("2026-10-30")).toBe("Fri, 30 Oct 2026");
    expect(formatNightDate("2027-01-01")).toBe("Fri, 1 Jan 2027");
  });
});

describe("formatDuration", () => {
  it("shows minutes under an hour", () => {
    expect(formatDuration(30)).toBe("30 min");
  });

  it("shows whole hours", () => {
    expect(formatDuration(180)).toBe("3 h");
  });

  it("shows hours and minutes", () => {
    expect(formatDuration(150)).toBe("2 h 30 min");
  });
});

describe("weeksBetween", () => {
  it("counts whole weeks", () => {
    expect(weeksBetween("2026-10-08", "2026-10-22")).toBe(2);
    expect(weeksBetween("2026-01-01", "2026-10-22")).toBe(42);
  });

  it("is 0 within the same week", () => {
    expect(weeksBetween("2026-10-16", "2026-10-22")).toBe(0);
    expect(weeksBetween("2026-10-22", "2026-10-22")).toBe(0);
  });

  it("is never negative", () => {
    expect(weeksBetween("2026-10-29", "2026-10-22")).toBe(0);
  });
});
