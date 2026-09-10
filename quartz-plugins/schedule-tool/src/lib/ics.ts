import { nextDateFor } from "./message";
import type { Day } from "./model";

export interface IcsOptions {
  title: string;
  day: Day;
  start: number;
  end: number;
  sessions: number;
  from: Date;
}

/** JST is a fixed UTC+9 with no daylight saving, so a flat offset is always correct. */
const JST_OFFSET_MINUTES = 9 * 60;

function stampUtc(date: Date, minutesFromMidnightJst: number): string {
  const utc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    minutesFromMidnightJst - JST_OFFSET_MINUTES,
  );
  const d = new Date(utc);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`
  );
}

export function buildIcs(opts: IcsOptions): string {
  const first = nextDateFor(opts.day, opts.from);
  const uid = `kouhai-${first.getTime()}-${opts.start}@kouhai-wiki`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kouhai Wiki//Schedule Tool//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stampUtc(first, opts.start)}`,
    `DTSTART:${stampUtc(first, opts.start)}`,
    `DTEND:${stampUtc(first, opts.end)}`,
    `RRULE:FREQ=WEEKLY;COUNT=${opts.sessions}`,
    `SUMMARY:${opts.title}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
