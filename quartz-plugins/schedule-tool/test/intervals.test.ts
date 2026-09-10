import { describe, it, expect } from "vitest";
import { mergeIntervals, invertIntervals, findSlots } from "../src/lib/intervals";
import type { Block, Member } from "../src/lib/model";

describe("mergeIntervals", () => {
  it("merges overlapping intervals", () => {
    expect(mergeIntervals([{ start: 60, end: 120 }, { start: 90, end: 180 }]))
      .toEqual([{ start: 60, end: 180 }]);
  });

  it("merges intervals that exactly touch", () => {
    expect(mergeIntervals([{ start: 60, end: 120 }, { start: 120, end: 180 }]))
      .toEqual([{ start: 60, end: 180 }]);
  });

  it("keeps disjoint intervals separate and sorted", () => {
    expect(mergeIntervals([{ start: 200, end: 260 }, { start: 60, end: 120 }]))
      .toEqual([{ start: 60, end: 120 }, { start: 200, end: 260 }]);
  });

  it("returns an empty array for no input", () => {
    expect(mergeIntervals([])).toEqual([]);
  });
});

describe("invertIntervals", () => {
  it("returns the whole day when nothing is busy", () => {
    expect(invertIntervals([])).toEqual([{ start: 0, end: 1440 }]);
  });

  it("returns the gaps around a busy block", () => {
    expect(invertIntervals([{ start: 600, end: 660 }]))
      .toEqual([{ start: 0, end: 600 }, { start: 660, end: 1440 }]);
  });

  it("returns nothing when the whole day is busy", () => {
    expect(invertIntervals([{ start: 0, end: 1440 }])).toEqual([]);
  });
});

describe("findSlots", () => {
  const members: Member[] = [
    { id: "a", name: "Appu" },
    { id: "b", name: "Bogisha" },
  ];

  const block = (memberId: string, start: number, end: number): Block => ({
    memberId, day: 0, start, end, kind: "course", source: "manual",
  });

  it("finds a window where everyone is free", () => {
    // a busy 09:00-10:30, b busy 13:00-14:30
    const slots = findSlots(members, [block("a", 540, 630), block("b", 780, 870)], 60);
    const unanimous = slots.filter((s) => s.freeIds.length === 2);
    expect(unanimous.some((s) => s.start === 630 && s.end === 780)).toBe(true);
  });

  it("reports partial availability with who is busy", () => {
    // a busy all day Monday, b free
    const slots = findSlots(members, [block("a", 0, 1440)], 60);
    const partial = slots.find((s) => s.day === 0 && s.freeIds.length === 1);
    expect(partial).toBeDefined();
    expect(partial?.freeIds).toEqual(["b"]);
    expect(partial?.busyIds).toEqual(["a"]);
  });

  it("drops windows shorter than the minimum", () => {
    // a 20-minute gap between two blocks, minimum 60
    const slots = findSlots(members, [block("a", 0, 600), block("a", 620, 1440)], 60);
    expect(slots.some((s) => s.start === 600 && s.end === 620)).toBe(false);
  });

  it("merges adjacent windows that have the same free set", () => {
    const slots = findSlots(members, [block("a", 0, 540)], 60);
    const monday = slots.filter((s) => s.day === 0 && s.freeIds.length === 2);
    expect(monday).toHaveLength(1);
    expect(monday[0]).toMatchObject({ start: 540, end: 1440 });
  });
});
