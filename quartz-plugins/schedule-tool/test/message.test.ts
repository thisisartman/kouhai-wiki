import { describe, it, expect } from "vitest";
import { buildMessage, nextDateFor } from "../src/lib/message";
import type { Member, Slot } from "../src/lib/model";

const members: Member[] = [
  { id: "a", name: "Appu" },
  { id: "b", name: "Bogisha" },
];

describe("nextDateFor", () => {
  // Constructed with local-component form on purpose. An ISO string with an
  // offset would be reinterpreted in the runner's timezone, so these tests
  // would pass in JST and fail on a UTC CI box.
  const thursday = new Date(2026, 8, 10); // 10 Sep 2026 is a Thursday

  it("returns the coming occurrence of a weekday", () => {
    expect(nextDateFor(0, thursday).getDate()).toBe(14); // Monday 14 Sep
  });

  it("returns seven days ahead when the day is today", () => {
    expect(nextDateFor(3, thursday).getDate()).toBe(17); // next Thursday
  });
});

describe("buildMessage", () => {
  it("lists slots with dates and names who is missing", () => {
    const slots: Slot[] = [
      { day: 0, start: 990, end: 1080, freeIds: ["a", "b"], busyIds: [] },
      { day: 2, start: 780, end: 870, freeIds: ["a"], busyIds: ["b"] },
    ];
    const text = buildMessage(slots, members, new Date(2026, 8, 10));
    expect(text).toContain("16:30");
    expect(text).toContain("Mon 14 Sep");
    expect(text).toContain("all 2 free");
    expect(text).toContain("Bogisha");
  });

  it("says so when there is nothing to propose", () => {
    expect(buildMessage([], members, new Date())).toContain("No times");
  });
});
