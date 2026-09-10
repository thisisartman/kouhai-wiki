import type { Block, Day, Interval, Member, Slot } from "./model";

const DAY_END = 1440;

export function mergeIntervals(list: Interval[]): Interval[] {
  if (list.length === 0) return [];
  const sorted = [...list].sort((x, y) => x.start - y.start);
  const out: Interval[] = [{ ...sorted[0] }];
  for (const cur of sorted.slice(1)) {
    const last = out[out.length - 1];
    // touching counts as overlapping: 60-120 and 120-180 become 60-180
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

export function invertIntervals(busy: Interval[], dayEnd = DAY_END): Interval[] {
  const merged = mergeIntervals(busy);
  const out: Interval[] = [];
  let cursor = 0;
  for (const b of merged) {
    if (b.start > cursor) out.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < dayEnd) out.push({ start: cursor, end: dayEnd });
  return out;
}

/**
 * Candidate meeting windows across the week, each carrying who is free.
 *
 * Windows are cut at every block boundary so that within one window the set
 * of free members never changes, then adjacent windows with an identical
 * free set are merged back together.
 */
export function findSlots(
  members: Member[],
  blocks: Block[],
  minMinutes: number,
): Slot[] {
  const out: Slot[] = [];

  for (let day = 0 as Day; day <= 6; day = (day + 1) as Day) {
    const dayBlocks = blocks.filter((b) => b.day === day);

    // every point where somebody's availability changes
    const cuts = new Set<number>([0, DAY_END]);
    for (const b of dayBlocks) {
      cuts.add(b.start);
      cuts.add(b.end);
    }
    const points = [...cuts].sort((a, b) => a - b);

    const segments: Slot[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      if (end <= start) continue;

      const busyIds = members
        .filter((m) =>
          dayBlocks.some(
            (b) => b.memberId === m.id && b.start < end && b.end > start,
          ),
        )
        .map((m) => m.id);
      const freeIds = members.filter((m) => !busyIds.includes(m.id)).map((m) => m.id);

      segments.push({ day, start, end, freeIds, busyIds });
    }

    // merge neighbours whose free set is identical
    for (const seg of segments) {
      const prev = out[out.length - 1];
      const sameSet =
        prev &&
        prev.day === day &&
        prev.end === seg.start &&
        prev.freeIds.join(",") === seg.freeIds.join(",");
      if (sameSet) {
        prev.end = seg.end;
      } else {
        out.push(seg);
      }
    }
  }

  return out.filter((s) => s.end - s.start >= minMinutes && s.freeIds.length > 0);
}
