import { describe, it, expect } from "vitest";
import { buildIcs } from "../src/lib/ics";

describe("buildIcs", () => {
  const base = {
    title: "Group project",
    day: 0 as const,
    start: 990,
    end: 1080,
    sessions: 4,
    from: new Date(2026, 8, 10), // local-component form, see message.test.ts
  };

  it("emits a single event with a weekly count", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("RRULE:FREQ=WEEKLY;COUNT=4");
  });

  it("converts JST to UTC with a flat nine hour offset", () => {
    // 990 min = 16:30 JST = 07:30 UTC; 1080 min = 18:00 JST = 09:00 UTC
    const ics = buildIcs(base);
    expect(ics).toContain("DTSTART:20260914T073000Z");
    expect(ics).toContain("DTEND:20260914T090000Z");
  });

  it("rolls the UTC date back when a JST time is before 09:00", () => {
    // 08:00 JST on Mon 14 Sep is 23:00 UTC on Sun 13 Sep
    const ics = buildIcs({ ...base, start: 480, end: 600 });
    expect(ics).toContain("DTSTART:20260913T230000Z");
  });

  it("does not emit a VTIMEZONE block", () => {
    expect(buildIcs(base)).not.toContain("VTIMEZONE");
  });

  it("folds in required calendar headers", () => {
    const ics = buildIcs(base);
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
  });

  it("uses CRLF line endings as the RFC requires", () => {
    expect(buildIcs(base)).toContain("\r\n");
  });
});
