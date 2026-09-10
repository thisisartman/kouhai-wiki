export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Hand-drawn blocks snap to this; imported blocks do not. */
export const SNAP_MINUTES = 30;

export interface Member {
  id: string;
  name: string;
}

export interface Block {
  memberId: string;
  day: Day;
  /** minutes from midnight, inclusive */
  start: number;
  /** minutes from midnight, exclusive */
  end: number;
  kind: "course" | "custom";
  source: "manual" | "imported";
  label?: string;
}

export interface Interval {
  start: number;
  end: number;
}

/** A candidate meeting window and who can make it. */
export interface Slot {
  day: Day;
  start: number;
  end: number;
  freeIds: string[];
  busyIds: string[];
}

/** 630 -> "10:30". Always 24-hour, always zero-padded. */
export function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
