import { DAY_NAMES, fmtTime } from "./model";
import type { Day, Member, Slot } from "./model";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** JS getDay is Sunday-first; our Day is Monday-first. */
function jsDayToOurs(js: number): Day {
  return ((js + 6) % 7) as Day;
}

/** The next occurrence of `day` strictly after `from`. Same weekday means next week. */
export function nextDateFor(day: Day, from: Date): Date {
  const out = new Date(from.getTime());
  const today = jsDayToOurs(out.getDay());
  const delta = ((day - today + 7) % 7) || 7;
  out.setDate(out.getDate() + delta);
  return out;
}

export function buildMessage(slots: Slot[], members: Member[], from: Date): string {
  if (slots.length === 0) {
    return "No times work for everyone right now. Try a shorter meeting length.";
  }

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "someone";

  const lines = slots.map((s) => {
    const d = nextDateFor(s.day, from);
    const when =
      `${DAY_NAMES[s.day]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ` +
      `${fmtTime(s.start)}-${fmtTime(s.end)}`;
    const who =
      s.busyIds.length === 0
        ? `all ${s.freeIds.length} free`
        : `${s.freeIds.length} of ${members.length}, ${s.busyIds.map(nameOf).join(" and ")} busy`;
    return `• ${when} — ${who}`;
  });

  return [
    "Group project — when works?",
    "",
    ...lines,
    "",
    "Reply with whichever works and I'll lock it in.",
  ].join("\n");
}
