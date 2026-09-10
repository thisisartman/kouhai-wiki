# Schedule Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Quartz widget on the Kouhai Wiki where a student builds their weekly schedule, exports it as a pasteable code, and a group pastes several codes to find when they can all meet.

**Architecture:** A local Quartz plugin, `quartz-plugins/schedule-tool`, following the same scaffolding as the existing `site-notice` and `status-badge` plugins. All logic (interval arithmetic, code encoding, ICS generation, message building) lives in pure `src/lib/*.ts` modules unit-tested with vitest under a node environment. The DOM lives in a single `.inline.ts` bundled to a string by tsup's `inlineScriptPlugin` and attached via `Component.afterDOMLoaded`. The component renders only on pages whose frontmatter carries `tool: schedule`, so it appears on exactly one content page.

**Tech Stack:** TypeScript, Preact (component shell only), vitest, tsup, Quartz v5.

**Spec:** `docs/superpowers/specs/2026-09-10-schedule-tool-design.md` — read it before starting. This plan implements phases 1 to 4; phase 5 (PDF import) is deliberately out of scope and gets its own plan.

## Global Constraints

- **All times are integer minutes from midnight.** There is no other time representation anywhere in this codebase. Never store, pass, or compare a `Date` for a weekly block.
- **Never display period numbers.** IUJ students say "my 10:30 class", not "second period". The UI shows clock times only.
- **Days are `0` = Monday through `6` = Sunday.**
- **No network calls whatsoever.** No `fetch`, no analytics, no CDN fonts inside the widget. The privacy copy must remain literally true.
- **Hand-drawn blocks snap to 30-minute boundaries; imported blocks keep true minute times.** Snapping is a constraint applied at input time, never a storage format.
- **Payload version is `1`.** Any code whose version is not recognised is refused with a clear message, never partially parsed.
- **JST is a fixed UTC+9 with no daylight saving.** ICS times are emitted in UTC with a flat +9 offset applied. Do not add a `VTIMEZONE` block.
- **Plugin `dist/` is committed**, matching every other local plugin, so CI needs no plugin build step.
- Copy style: no em dashes in user-facing strings, plain vocabulary, no "seamless" / "effortless" / "powerful".

---

## File Structure

```
quartz-plugins/schedule-tool/
  package.json                       plugin manifest, quartz block, vitest script
  tsup.config.ts                     copied verbatim from site-notice
  tsconfig.json, tsconfig.build.json copied verbatim from site-notice
  vitest.config.ts                   node environment, test/**/*.test.ts
  src/
    index.ts                         re-exports ScheduleTool
    types.ts                         re-exports Quartz component types
    lib/
      model.ts                       Block, Member, Slot, Day types + constants
      intervals.ts                   merge, invert, and per-member free-slot search
      code.ts                        encode/decode the v1 group code
      ics.ts                         RFC 5545 output with weekly COUNT recurrence
      message.ts                     WhatsApp text with dates resolved
    components/
      ScheduleTool.tsx               Preact shell, CSS, frontmatter gate
      index.ts
      scripts/
        schedule.inline.ts           all DOM wiring and event handling
  test/
    intervals.test.ts
    code.test.ts
    ics.test.ts
    message.test.ts
```

`lib/` is pure and has no DOM references, which is what makes it testable in a node environment. `schedule.inline.ts` imports from `lib/` and owns everything that touches the document.

**Verification note:** tasks 1 to 5 are true TDD with vitest. Tasks 6 onward are DOM work that a node-environment test runner cannot meaningfully cover; those are verified by a passing `npx quartz build` plus the explicit manual checks written into each task. That difference is deliberate, not an oversight.

---

### Task 1: Plugin scaffolding

**Files:**
- Create: `quartz-plugins/schedule-tool/package.json`
- Create: `quartz-plugins/schedule-tool/vitest.config.ts`
- Copy: `tsup.config.ts`, `tsconfig.json`, `tsconfig.build.json`, `LICENSE` from `quartz-plugins/site-notice/`
- Create: `quartz-plugins/schedule-tool/src/types.ts`

**Interfaces:**
- Consumes: nothing
- Produces: a buildable plugin directory; `npm test` and `npm run build` both runnable inside it

- [ ] **Step 1: Copy the scaffolding from the existing plugin**

```bash
cd quartz-plugins
mkdir -p schedule-tool/src/lib schedule-tool/src/components/scripts schedule-tool/test
cp site-notice/tsup.config.ts site-notice/tsconfig.json \
   site-notice/tsconfig.build.json site-notice/LICENSE schedule-tool/
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "@kouhai-wiki/schedule-tool",
  "version": "0.1.0",
  "description": "Weekly schedule builder and group meeting-time finder.",
  "type": "module",
  "license": "MIT",
  "author": "Kouhai Wiki",
  "files": ["dist", "LICENSE"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./types": { "types": "./dist/types.d.ts", "import": "./dist/types.js" },
    "./components": { "types": "./dist/components/index.d.ts", "import": "./dist/components/index.js" },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": { "preact": "^10.0.0" },
  "peerDependenciesMeta": { "preact": { "optional": false } },
  "dependencies": { "@quartz-community/types": "github:quartz-community/types" },
  "devDependencies": {
    "@types/node": "^24.10.0",
    "preact": "^10.28.2",
    "sass": "^1.97.3",
    "tsup": "^8.5.0",
    "typescript": "^5.9.3",
    "vitest": "^3.0.0"
  },
  "quartz": {
    "name": "schedule-tool",
    "displayName": "Schedule Tool",
    "category": "component",
    "version": "0.1.0",
    "quartzVersion": ">=5.0.0",
    "dependencies": [],
    "defaultOrder": 22,
    "defaultEnabled": true,
    "defaultOptions": {},
    "components": {
      "ScheduleTool": {
        "displayName": "Schedule Tool",
        "defaultPosition": "beforeBody",
        "defaultPriority": 14
      }
    }
  },
  "engines": { "node": ">=22", "npm": ">=10.9.2" }
}
```

Priority `14` places it after `site-notice` (12), so the order down the page is status banner, title, unofficial notice, widget, then the page's own prose.

- [ ] **Step 3: Write `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    reporters: ["default"],
  },
});
```

- [ ] **Step 4: Write `src/types.ts`**

```typescript
export type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
```

- [ ] **Step 5: Install and confirm the toolchain runs**

```bash
cd quartz-plugins/schedule-tool && npm install
npx vitest run
```

Expected: vitest reports "No test files found". That is success for this task; it proves the runner works.

- [ ] **Step 6: Commit**

```bash
git add quartz-plugins/schedule-tool
git commit -m "Scaffold schedule-tool plugin"
```

---

### Task 2: Core model types

**Files:**
- Create: `quartz-plugins/schedule-tool/src/lib/model.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Day`, `Block`, `Member`, `Interval`, `Slot`, `SNAP_MINUTES`, `DAY_NAMES`, `fmtTime`

- [ ] **Step 1: Write the module**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add quartz-plugins/schedule-tool/src/lib/model.ts
git commit -m "Add schedule tool core model types"
```

---

### Task 3: Interval arithmetic

This is the heart of the tool. Everything else is presentation.

**Files:**
- Create: `quartz-plugins/schedule-tool/src/lib/intervals.ts`
- Test: `quartz-plugins/schedule-tool/test/intervals.test.ts`

**Interfaces:**
- Consumes: `Block`, `Day`, `Interval`, `Slot` from `lib/model.ts`
- Produces: `mergeIntervals(list: Interval[]): Interval[]`, `invertIntervals(busy: Interval[], dayEnd?: number): Interval[]`, `findSlots(members: Member[], blocks: Block[], minMinutes: number): Slot[]`

- [ ] **Step 1: Write the failing tests**

```typescript
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
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `cd quartz-plugins/schedule-tool && npx vitest run test/intervals.test.ts`
Expected: FAIL, cannot resolve `../src/lib/intervals`.

- [ ] **Step 3: Implement the module**

```typescript
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

  return out.filter(
    (s) => s.end - s.start >= minMinutes && s.freeIds.length > 0,
  );
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npx vitest run test/intervals.test.ts`
Expected: PASS, all cases.

- [ ] **Step 5: Commit**

```bash
git add quartz-plugins/schedule-tool/src/lib/intervals.ts quartz-plugins/schedule-tool/test/intervals.test.ts
git commit -m "Add interval arithmetic and free-slot search"
```

---

### Task 4: Group code encode and decode

**Files:**
- Create: `quartz-plugins/schedule-tool/src/lib/code.ts`
- Test: `quartz-plugins/schedule-tool/test/code.test.ts`

**Interfaces:**
- Consumes: `Block`, `Day` from `lib/model.ts`
- Produces: `encodeCode(payload: Payload): string`, `decodeCode(text: string): DecodeResult`, and the `Payload` / `DecodeResult` types

Format is a compact delimited string, base64url encoded so it survives a chat message and cannot collide with a name containing a separator.

```
1|<name>|<term>|<day>:<start>:<end>:<kind>;<day>:<start>:<end>:<kind>;...
```

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { encodeCode, decodeCode } from "../src/lib/code";
import type { Block } from "../src/lib/model";

const blocks: Block[] = [
  { memberId: "me", day: 0, start: 530, end: 620, kind: "course", source: "manual" },
  { memberId: "me", day: 2, start: 780, end: 870, kind: "custom", source: "manual" },
];

describe("group code", () => {
  it("round-trips a payload without loss", () => {
    const code = encodeCode({ v: 1, name: "Appu", term: "2026 Fall", blocks });
    const result = decodeCode(code);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.name).toBe("Appu");
    expect(result.payload.term).toBe("2026 Fall");
    expect(result.payload.blocks).toHaveLength(2);
    expect(result.payload.blocks[0]).toMatchObject({ day: 0, start: 530, end: 620, kind: "course" });
  });

  it("survives a name containing the field separator", () => {
    const code = encodeCode({ v: 1, name: "A|B", term: "2026 Fall", blocks: [] });
    const result = decodeCode(code);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.name).toBe("A|B");
  });

  it("produces a code short enough to paste in a chat", () => {
    const many: Block[] = Array.from({ length: 12 }, (_, i) => ({
      memberId: "me", day: (i % 6) as Block["day"],
      start: 540 + i * 10, end: 630 + i * 10,
      kind: "course" as const, source: "manual" as const,
    }));
    const code = encodeCode({ v: 1, name: "Apoorv", term: "2026 Fall", blocks: many });
    expect(code.length).toBeLessThan(400);
  });

  it("refuses an unknown version", () => {
    const code = encodeCode({ v: 1, name: "Appu", term: "2026 Fall", blocks: [] });
    const tampered = btoa("9|Appu|2026 Fall|").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(decodeCode(tampered).ok).toBe(false);
    expect(decodeCode(code).ok).toBe(true);
  });

  it("refuses corrupt input rather than throwing", () => {
    expect(decodeCode("not a real code!!").ok).toBe(false);
    expect(decodeCode("").ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run test/code.test.ts`
Expected: FAIL, cannot resolve `../src/lib/code`.

- [ ] **Step 3: Implement the module**

```typescript
import type { Block, Day } from "./model";

export const CODE_VERSION = 1;

export interface Payload {
  v: number;
  name: string;
  term: string;
  blocks: Block[];
}

export type DecodeResult =
  | { ok: true; payload: Payload }
  | { ok: false; reason: string };

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\p");
const unesc = (s: string) => s.replace(/\\p/g, "|").replace(/\\\\/g, "\\");

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeCode(payload: Payload): string {
  const blocks = payload.blocks
    .map((b) => `${b.day}:${b.start}:${b.end}:${b.kind === "course" ? "c" : "x"}`)
    .join(";");
  const raw = `${payload.v}|${esc(payload.name)}|${esc(payload.term)}|${blocks}`;
  return toBase64Url(raw);
}

export function decodeCode(text: string): DecodeResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, reason: "That code is empty." };

  let raw: string;
  try {
    raw = fromBase64Url(trimmed);
  } catch {
    return { ok: false, reason: "That does not look like a schedule code." };
  }

  const parts = raw.split("|");
  if (parts.length < 4) {
    return { ok: false, reason: "That does not look like a schedule code." };
  }

  const v = Number(parts[0]);
  if (v !== CODE_VERSION) {
    return {
      ok: false,
      reason: `That code was made by a different version of this tool (v${parts[0]}). Ask for a fresh one.`,
    };
  }

  const name = unesc(parts[1]);
  const term = unesc(parts[2]);
  const blockText = parts.slice(3).join("|");

  const blocks: Block[] = [];
  if (blockText) {
    for (const chunk of blockText.split(";")) {
      const [d, s, e, k] = chunk.split(":");
      const day = Number(d);
      const start = Number(s);
      const end = Number(e);
      if (![day, start, end].every(Number.isInteger)) {
        return { ok: false, reason: "That code is damaged. Ask for a fresh one." };
      }
      if (day < 0 || day > 6 || start < 0 || end > 1440 || end <= start) {
        return { ok: false, reason: "That code is damaged. Ask for a fresh one." };
      }
      blocks.push({
        memberId: "",
        day: day as Day,
        start,
        end,
        kind: k === "c" ? "course" : "custom",
        source: "imported",
      });
    }
  }

  return { ok: true, payload: { v, name, term, blocks } };
}
```

Note `memberId` is left empty by the decoder; the importer assigns it when it creates the member. That keeps `code.ts` free of any id-generation concern.

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npx vitest run test/code.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add quartz-plugins/schedule-tool/src/lib/code.ts quartz-plugins/schedule-tool/test/code.test.ts
git commit -m "Add versioned group code encode and decode"
```

---

### Task 5: Message and ICS output

**Files:**
- Create: `quartz-plugins/schedule-tool/src/lib/message.ts`
- Create: `quartz-plugins/schedule-tool/src/lib/ics.ts`
- Test: `quartz-plugins/schedule-tool/test/message.test.ts`
- Test: `quartz-plugins/schedule-tool/test/ics.test.ts`

**Interfaces:**
- Consumes: `Slot`, `Member`, `Day`, `fmtTime`, `DAY_NAMES` from `lib/model.ts`
- Produces: `buildMessage(slots: Slot[], members: Member[], from: Date): string`, `nextDateFor(day: Day, from: Date): Date`, `buildIcs(opts: IcsOptions): string`

- [ ] **Step 1: Write the failing tests**

```typescript
// test/message.test.ts
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
```

```typescript
// test/ics.test.ts
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
    // Monday 14 Sep 16:30 JST is 07:30 UTC the same day
    const ics = buildIcs(base);
    expect(ics).toContain("DTSTART:20260914T073000Z");
    expect(ics).toContain("DTEND:20260914T083000Z");
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
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npx vitest run test/message.test.ts test/ics.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `message.ts`**

```typescript
import { DAY_NAMES, fmtTime } from "./model";
import type { Day, Member, Slot } from "./model";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
    const when = `${DAY_NAMES[s.day]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${fmtTime(s.start)}-${fmtTime(s.end)}`;
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
```

- [ ] **Step 4: Implement `ics.ts`**

```typescript
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
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npx vitest run`
Expected: PASS, all four test files.

- [ ] **Step 6: Commit**

```bash
git add quartz-plugins/schedule-tool/src/lib quartz-plugins/schedule-tool/test
git commit -m "Add message builder and ICS output with fixed JST offset"
```

---

### Task 6: Component shell and frontmatter gate

**Files:**
- Create: `quartz-plugins/schedule-tool/src/components/ScheduleTool.tsx`
- Create: `quartz-plugins/schedule-tool/src/components/index.ts`
- Create: `quartz-plugins/schedule-tool/src/index.ts`

**Interfaces:**
- Consumes: `QuartzComponentConstructor` from `src/types.ts`
- Produces: default-exported `ScheduleTool` component; renders a mount point with `id="schedule-tool"` only when frontmatter has `tool: schedule`

- [ ] **Step 1: Write the component**

```tsx
import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";

const css = `
.st-root { margin: 1.5rem 0 2rem; font-family: var(--bodyFont); }
.st-tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
.st-tab { padding: .45em .9em; border-radius: 5px; border: 1px solid var(--lightgray);
  background: transparent; color: var(--darkgray); cursor: pointer; font-weight: 600; }
.st-tab[aria-selected="true"] { background: var(--secondary); color: var(--light); border-color: var(--secondary); }
.st-panel[hidden] { display: none; }
.st-note { font-size: .78rem; color: var(--gray); margin-top: .6rem; line-height: 1.5; }
.st-grid { display: grid; grid-template-columns: 3.5rem repeat(7, 1fr); gap: 1px;
  background: var(--lightgray); border: 1px solid var(--lightgray); overflow-x: auto; }
.st-cell { background: var(--light); min-height: 14px; cursor: pointer; }
.st-cell.st-busy { background: var(--secondary); }
.st-hour { background: var(--light); font-size: .68rem; color: var(--gray);
  padding: 2px 4px; text-align: right; }
.st-head { background: var(--light); font-size: .75rem; font-weight: 700;
  text-align: center; padding: 4px 0; }
.st-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
.st-actions button, .st-actions select { padding: .45em .9em; border-radius: 5px;
  border: 1px solid var(--lightgray); background: var(--light); color: var(--darkgray);
  cursor: pointer; font-weight: 600; }
.st-code { width: 100%; min-height: 5rem; font-family: var(--codeFont); font-size: .8rem;
  padding: .5rem; border-radius: 5px; border: 1px solid var(--lightgray); }
.st-slot { display: flex; justify-content: space-between; gap: 1rem; padding: .5em .75em;
  border: 1px solid var(--lightgray); border-radius: 5px; margin-bottom: .4rem;
  cursor: pointer; background: var(--light); }
.st-slot[aria-selected="true"] { border-color: var(--secondary); background: var(--highlight); }
.st-slot-who { font-size: .78rem; color: var(--gray); }
.st-error { color: #a33; font-size: .8rem; margin-top: .5rem; }
@media (max-width: 800px) { .st-grid { font-size: .7rem; } }
`;

const ScheduleTool: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    if (fileData.frontmatter?.tool !== "schedule") return null;
    // The inline script builds everything inside this mount point.
    return <div id="schedule-tool" class="st-root" />;
  };

  Component.css = css;
  return Component;
};

export default ScheduleTool;
```

- [ ] **Step 2: Write the barrel files**

```typescript
// src/components/index.ts
export { default as ScheduleTool } from "./ScheduleTool";
```

```typescript
// src/index.ts
export { default as ScheduleTool } from "./components/ScheduleTool";
```

- [ ] **Step 3: Confirm it builds**

Run: `cd quartz-plugins/schedule-tool && npm run build`
Expected: tsup succeeds and writes `dist/index.js`, `dist/components/index.js`, `dist/types.js`.

- [ ] **Step 4: Commit**

```bash
git add quartz-plugins/schedule-tool/src
git commit -m "Add schedule tool component shell with frontmatter gate"
```

---

### Task 7: Mode 1, the schedule grid

**Files:**
- Create: `quartz-plugins/schedule-tool/src/components/scripts/schedule.inline.ts`
- Modify: `quartz-plugins/schedule-tool/src/components/ScheduleTool.tsx` (attach the script)

**Interfaces:**
- Consumes: `Block`, `Day`, `SNAP_MINUTES`, `DAY_NAMES`, `fmtTime` from `lib/model.ts`
- Produces: a working mode 1 that stores blocks in memory and renders them on a 30-minute grid

- [ ] **Step 1: Write the inline script for mode 1**

Create the file with the grid rendering and tap-to-toggle behaviour. Desktop drag is added in Task 8; this task delivers tap-to-create and tap-to-clear, which is the whole of the mobile interaction.

```typescript
import { DAY_NAMES, SNAP_MINUTES, fmtTime } from "../../lib/model";
import type { Block, Day } from "../../lib/model";

const ME = "me";
const ROWS = (24 * 60) / SNAP_MINUTES; // 48

const state: { blocks: Block[]; name: string; term: string } = {
  blocks: [],
  name: "",
  term: "",
};

function overlaps(b: Block, day: Day, start: number, end: number): boolean {
  return b.day === day && b.start < end && b.end > start;
}

function toggleCell(day: Day, start: number): void {
  const end = start + SNAP_MINUTES;
  const hit = state.blocks.find((b) => overlaps(b, day, start, end));
  if (hit) {
    state.blocks = state.blocks.filter((b) => b !== hit);
  } else {
    state.blocks.push({
      memberId: ME, day, start, end, kind: "custom", source: "manual",
    });
  }
  renderGrid();
}

function renderGrid(): void {
  const grid = document.getElementById("st-grid");
  if (!grid) return;
  grid.innerHTML = "";

  grid.appendChild(Object.assign(document.createElement("div"), { className: "st-head" }));
  for (const name of DAY_NAMES) {
    const h = document.createElement("div");
    h.className = "st-head";
    h.textContent = name;
    grid.appendChild(h);
  }

  for (let row = 0; row < ROWS; row++) {
    const minutes = row * SNAP_MINUTES;
    const label = document.createElement("div");
    label.className = "st-hour";
    label.textContent = minutes % 60 === 0 ? fmtTime(minutes) : "";
    grid.appendChild(label);

    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("div");
      cell.className = "st-cell";
      const busy = state.blocks.some((b) =>
        overlaps(b, day as Day, minutes, minutes + SNAP_MINUTES),
      );
      if (busy) cell.classList.add("st-busy");
      cell.dataset.day = String(day);
      cell.dataset.start = String(minutes);
      cell.addEventListener("click", () => toggleCell(day as Day, minutes));
      grid.appendChild(cell);
    }
  }

  // open the viewport at a sensible hour without hiding the rest
  if (!grid.dataset.scrolled) {
    grid.scrollTop = (7 * 60) / SNAP_MINUTES * 14;
    grid.dataset.scrolled = "1";
  }
}

function mount(): void {
  const root = document.getElementById("schedule-tool");
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = "1";

  root.innerHTML = `
    <div class="st-tabs" role="tablist">
      <button class="st-tab" id="st-tab-mine" role="tab" aria-selected="true">My schedule</button>
      <button class="st-tab" id="st-tab-group" role="tab" aria-selected="false">Find group time</button>
    </div>
    <section class="st-panel" id="st-panel-mine" role="tabpanel">
      <div class="st-grid" id="st-grid" style="max-height:60vh"></div>
      <p class="st-note">Tap a cell to mark yourself busy. Tap it again to clear it.</p>
    </section>
    <section class="st-panel" id="st-panel-group" role="tabpanel" hidden></section>
  `;

  document.getElementById("st-tab-mine")?.addEventListener("click", () => switchTab("mine"));
  document.getElementById("st-tab-group")?.addEventListener("click", () => switchTab("group"));

  renderGrid();
}

function switchTab(which: "mine" | "group"): void {
  for (const key of ["mine", "group"] as const) {
    const tab = document.getElementById(`st-tab-${key}`);
    const panel = document.getElementById(`st-panel-${key}`);
    if (tab) tab.setAttribute("aria-selected", String(key === which));
    if (panel) (panel as HTMLElement).hidden = key !== which;
  }
}

document.addEventListener("nav", mount);
mount();
```

Quartz is an SPA, so `nav` fires on client-side navigation; the `dataset.mounted` guard stops a double mount on first load.

- [ ] **Step 2: Attach the script in the component**

Add to `ScheduleTool.tsx`, after the `css` constant:

```tsx
// @ts-expect-error - inline script imported as a string by the esbuild loader
import script from "./scripts/schedule.inline.ts";
```

and inside the constructor, before `return Component`:

```tsx
  Component.afterDOMLoaded = script;
```

- [ ] **Step 3: Build the plugin**

Run: `cd quartz-plugins/schedule-tool && npm run build`
Expected: succeeds; `dist/index.js` now contains the bundled script as a string.

- [ ] **Step 4: Commit**

```bash
git add quartz-plugins/schedule-tool/src
git commit -m "Add mode 1 schedule grid with tap to toggle"
```

---

### Task 8: Export the code, and desktop drag

**Files:**
- Modify: `quartz-plugins/schedule-tool/src/components/scripts/schedule.inline.ts`

**Interfaces:**
- Consumes: `encodeCode` from `lib/code.ts`
- Produces: a Copy-my-code button producing a v1 code from the current grid

- [ ] **Step 1: Add the export controls to the mode 1 panel**

Replace the `st-panel-mine` markup in `mount()` with:

```html
    <section class="st-panel" id="st-panel-mine" role="tabpanel">
      <div class="st-grid" id="st-grid" style="max-height:60vh"></div>
      <p class="st-note">Tap a cell to mark yourself busy. Tap it again to clear it.</p>
      <div class="st-actions">
        <input id="st-name" placeholder="Your name" style="padding:.45em .6em;border-radius:5px;border:1px solid var(--lightgray)">
        <input id="st-term" placeholder="Term, e.g. 2026 Fall" style="padding:.45em .6em;border-radius:5px;border:1px solid var(--lightgray)">
        <button id="st-copy">Copy my code</button>
      </div>
      <p class="st-note">This code contains your weekly schedule. Nothing is sent to any server, it only goes where you paste it.</p>
    </section>
```

- [ ] **Step 2: Wire the copy button**

Add the import at the top of the file:

```typescript
import { encodeCode } from "../../lib/code";
```

and inside `mount()`, after the tab listeners:

```typescript
  document.getElementById("st-copy")?.addEventListener("click", async () => {
    const nameEl = document.getElementById("st-name") as HTMLInputElement | null;
    const termEl = document.getElementById("st-term") as HTMLInputElement | null;
    state.name = nameEl?.value.trim() || "Someone";
    state.term = termEl?.value.trim() || "";
    const code = encodeCode({ v: 1, name: state.name, term: state.term, blocks: state.blocks });
    const btn = document.getElementById("st-copy");
    try {
      await navigator.clipboard.writeText(code);
      if (btn) btn.textContent = "Copied";
    } catch {
      // clipboard can be blocked; fall back to showing the code to copy by hand
      const box = document.createElement("textarea");
      box.className = "st-code";
      box.value = code;
      btn?.after(box);
      box.select();
    }
    setTimeout(() => { if (btn) btn.textContent = "Copy my code"; }, 1500);
  });
```

- [ ] **Step 3: Add pointer drag on the grid for desktop**

Inside `renderGrid()`, replace the cell click listener with:

```typescript
      cell.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        dragging = { day: day as Day, from: minutes, to: minutes };
        toggleCell(day as Day, minutes);
      });
      cell.addEventListener("pointerenter", () => {
        // the origin cell was already handled by pointerdown
        if (!dragging || dragging.day !== day || minutes === dragging.from) return;
        const start = Math.min(dragging.from, minutes);
        const end = Math.max(dragging.from, minutes) + SNAP_MINUTES;
        state.blocks = state.blocks.filter((b) => !overlaps(b, day as Day, start, end));
        state.blocks.push({
          memberId: ME, day: day as Day, start, end, kind: "custom", source: "manual",
        });
        renderGrid();
      });
```

and declare at module scope:

```typescript
let dragging: { day: Day; from: number; to: number } | null = null;
document.addEventListener("pointerup", () => { dragging = null; });
```

- [ ] **Step 4: Build and check manually**

Run from the repo root, having linked the plugin as in Task 11:

```bash
npx quartz build --serve
```

Manual check: open the tool page, tap a cell (it fills), tap again (it clears), drag down several cells on desktop (a single block forms), enter a name and press Copy my code, then paste it somewhere and confirm it is one line of text.

- [ ] **Step 5: Commit**

```bash
git add quartz-plugins/schedule-tool/src
git commit -m "Add code export and desktop drag to the schedule grid"
```

---

### Task 9: Mode 2, importing codes

**Files:**
- Modify: `quartz-plugins/schedule-tool/src/components/scripts/schedule.inline.ts`

**Interfaces:**
- Consumes: `decodeCode` from `lib/code.ts`
- Produces: a member list built from pasted codes, held in `sessionStorage` under `kw-schedule-codes`

- [ ] **Step 1: Render the group panel**

Replace the empty `st-panel-group` markup with:

```html
    <section class="st-panel" id="st-panel-group" role="tabpanel" hidden>
      <p class="st-note">Ask everyone to open this page, mark their busy times, and send you their code. Paste them all below, one per line.</p>
      <textarea class="st-code" id="st-codes" placeholder="Paste codes here, one per line"></textarea>
      <div class="st-actions">
        <button id="st-load">Load codes</button>
        <button id="st-clear">Clear all</button>
        <select id="st-min">
          <option value="30">30 min</option>
          <option value="60" selected>1 hour</option>
          <option value="90">1.5 hours</option>
        </select>
      </div>
      <p class="st-note">Pasted codes stay in this browser tab and are forgotten when you close it. Nothing is uploaded.</p>
      <div id="st-members"></div>
      <div id="st-errors" class="st-error"></div>
      <div id="st-results"></div>
    </section>
```

- [ ] **Step 2: Add the import handler**

```typescript
import { decodeCode } from "../../lib/code";
import type { Member } from "../../lib/model";

const SESSION_KEY = "kw-schedule-codes";
let members: Member[] = [];
let groupBlocks: Block[] = [];

function readSession(): string {
  try { return sessionStorage.getItem(SESSION_KEY) ?? ""; } catch { return ""; }
}

function writeSession(text: string): void {
  // private browsing and blocked site data make this throw rather than no-op
  try { sessionStorage.setItem(SESSION_KEY, text); } catch { /* not fatal */ }
}

function loadCodes(text: string): void {
  const errors: string[] = [];
  const seen = new Set<string>();
  members = [];
  groupBlocks = [];

  text.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line, i) => {
    if (seen.has(line)) {
      errors.push(`Line ${i + 1}: that is the same code twice. Each person needs their own.`);
      return;
    }
    seen.add(line);

    const res = decodeCode(line);
    if (!res.ok) {
      errors.push(`Line ${i + 1}: ${res.reason}`);
      return;
    }

    const id = `m${i}`;
    members.push({ id, name: res.payload.name });
    for (const b of res.payload.blocks) groupBlocks.push({ ...b, memberId: id });
  });

  const terms = new Set(
    text.split("\n").map((l) => l.trim()).filter(Boolean)
      .map((l) => { const r = decodeCode(l); return r.ok ? r.payload.term : ""; })
      .filter(Boolean),
  );
  if (terms.size > 1) {
    errors.push(`These codes are from different terms (${[...terms].join(", ")}). One of them is probably out of date.`);
  }

  const errBox = document.getElementById("st-errors");
  if (errBox) errBox.textContent = errors.join("  ");

  const list = document.getElementById("st-members");
  if (list) {
    list.innerHTML = members.length
      ? `<p class="st-note">Loaded: ${members.map((m) => m.name).join(", ")}</p>`
      : "";
  }

  writeSession(text);
  renderResults();
}

// Replaced in full by Task 10. Declared here so Task 9 is runnable on its own.
function renderResults(): void {
  const box = document.getElementById("st-results");
  if (box) box.innerHTML = "";
}
```

- [ ] **Step 3: Wire the buttons and restore the session**

Inside `mount()`:

```typescript
  const codesEl = document.getElementById("st-codes") as HTMLTextAreaElement | null;
  if (codesEl) {
    const saved = readSession();
    if (saved) { codesEl.value = saved; loadCodes(saved); }
  }
  document.getElementById("st-load")?.addEventListener("click", () => {
    loadCodes((document.getElementById("st-codes") as HTMLTextAreaElement).value);
  });
  document.getElementById("st-clear")?.addEventListener("click", () => {
    (document.getElementById("st-codes") as HTMLTextAreaElement).value = "";
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    loadCodes("");
  });
  document.getElementById("st-min")?.addEventListener("change", renderResults);
```

- [ ] **Step 4: Build and check manually**

Manual check: export two different codes from mode 1 (change the grid between them), paste both, press Load codes, and confirm both names appear. Paste the same code twice and confirm the duplicate error. Refresh the page and confirm the textarea repopulates. Press Clear all and confirm it empties and stays empty after a refresh.

- [ ] **Step 5: Commit**

```bash
git add quartz-plugins/schedule-tool/src
git commit -m "Add code import, duplicate and term checks, session restore"
```

---

### Task 10: Results, shortlist, message and booking

**Files:**
- Modify: `quartz-plugins/schedule-tool/src/components/scripts/schedule.inline.ts`

**Interfaces:**
- Consumes: `findSlots` from `lib/intervals.ts`, `buildMessage` from `lib/message.ts`, `buildIcs` from `lib/ics.ts`
- Produces: ranked results, tap-to-shortlist, a copyable message, and an `.ics` download

- [ ] **Step 1: Implement `renderResults`**

```typescript
import { findSlots } from "../../lib/intervals";
import { buildMessage } from "../../lib/message";
import { buildIcs } from "../../lib/ics";
import type { Slot } from "../../lib/model";

let shortlist: Slot[] = [];

function renderResults(): void {
  const box = document.getElementById("st-results");
  if (!box) return;
  if (members.length === 0) { box.innerHTML = ""; return; }

  const minEl = document.getElementById("st-min") as HTMLSelectElement | null;
  let min = Number(minEl?.value ?? 60);

  let slots = findSlots(members, groupBlocks, min);
  let relaxed = false;

  // the empty state is when help is most needed, so drop a step rather than show nothing
  if (!slots.some((s) => s.busyIds.length === 0) && min > 30) {
    const next = min === 90 ? 60 : 30;
    const retry = findSlots(members, groupBlocks, next);
    if (retry.some((s) => s.busyIds.length === 0)) { slots = retry; min = next; relaxed = true; }
  }

  slots.sort((a, b) => b.freeIds.length - a.freeIds.length || a.day - b.day || a.start - b.start);
  const top = slots.slice(0, 12);

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "someone";

  box.innerHTML = `
    ${relaxed ? `<p class="st-note">Nothing that long works for everyone. Showing ${min} minute options instead.</p>` : ""}
    ${top.map((s, i) => `
      <div class="st-slot" data-i="${i}" aria-selected="false">
        <span><strong>${DAY_NAMES[s.day]} ${fmtTime(s.start)}-${fmtTime(s.end)}</strong></span>
        <span class="st-slot-who">${
          s.busyIds.length === 0
            ? `all ${s.freeIds.length} free`
            : `${s.freeIds.length} of ${members.length} — ${s.busyIds.map(nameOf).join(", ")} busy`
        }</span>
      </div>`).join("")}
    <div class="st-actions">
      <button id="st-msg">Copy message</button>
      <select id="st-sessions">
        ${[1,2,3,4,6,8].map((n) => `<option value="${n}">${n} session${n > 1 ? "s" : ""}</option>`).join("")}
      </select>
      <button id="st-ics">Add to calendar</button>
    </div>
  `;

  box.querySelectorAll<HTMLElement>(".st-slot").forEach((el) => {
    el.addEventListener("click", () => {
      const slot = top[Number(el.dataset.i)];
      const on = el.getAttribute("aria-selected") === "true";
      el.setAttribute("aria-selected", String(!on));
      shortlist = on ? shortlist.filter((s) => s !== slot) : [...shortlist, slot];
    });
  });

  document.getElementById("st-msg")?.addEventListener("click", async () => {
    const text = buildMessage(shortlist.length ? shortlist : top.slice(0, 3), members, new Date());
    try { await navigator.clipboard.writeText(text); } catch { window.prompt("Copy this:", text); }
  });

  document.getElementById("st-ics")?.addEventListener("click", () => {
    const slot = shortlist[0] ?? top[0];
    if (!slot) return;
    const sessions = Number((document.getElementById("st-sessions") as HTMLSelectElement).value);
    const ics = buildIcs({
      title: "Group project", day: slot.day, start: slot.start,
      end: slot.end, sessions, from: new Date(),
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "group-meeting.ics";
    a.click();
    URL.revokeObjectURL(url);
  });
}
```

- [ ] **Step 2: Build and check manually**

Manual check: with two codes loaded, confirm slots appear ranked with "all N free" first and named busy members below. Tap two slots and confirm they highlight. Press Copy message and paste it, confirming it shows dates like "Mon 14 Sep". Choose 4 sessions, press Add to calendar, open the downloaded file and confirm four weekly occurrences at the right local time.

- [ ] **Step 3: Commit**

```bash
git add quartz-plugins/schedule-tool/src
git commit -m "Add ranked results, shortlist, message and calendar export"
```

---

### Task 11: Register the plugin and create the page

**Files:**
- Modify: `quartz.config.yaml`
- Create: `content/02_On-Campus/04_Academics/Schedule & Group Time Tool.md`
- Modify: `content/02_On-Campus/04_Academics/Study Groups & Peer Culture.md`
- Modify: `content/02_On-Campus/04_Academics/Course Registration.md`

**Interfaces:**
- Consumes: the built plugin from Task 10
- Produces: the tool live on one page, reachable from two articles

- [ ] **Step 1: Register the plugin**

In `quartz.config.yaml`, directly after the `site-notice` entry:

```yaml
  - source: ./quartz-plugins/schedule-tool
    enabled: true
    layout:
      position: beforeBody
      # after site-notice (12) so the widget sits between the notice and the prose
      priority: 14
```

- [ ] **Step 2: Link the plugin into the local build directory**

```bash
ln -sfn "$PWD/quartz-plugins/schedule-tool" ".quartz/plugins/schedule-tool"
```

- [ ] **Step 3: Create the page**

```markdown
---
title: Schedule & Group Time Tool
section: 02_On-Campus/04_Academics
tags: [academics, tools, collaboration, group-work]
status: ready
tool: schedule
---

Two things in one page. **My schedule** is a weekly grid where you mark when
you are busy. **Find group time** takes everyone's schedules and shows when
you can all actually meet.

Nothing here is sent anywhere. It all runs in your browser, and the codes you
paste are forgotten when you close the tab.

## How to use it with your group

1. Everyone opens this page and marks their busy times under **My schedule**.
   Classes, part-time work, club practice, anything.
2. Everyone types their name and presses **Copy my code**, then sends that
   code to whoever is organising.
3. The organiser opens **Find group time**, pastes every code (one per line),
   and presses **Load codes**.
4. The results list shows when people are free, best first. Tap the times that
   look good, then **Copy message** to paste the options into your group chat.
5. Once you agree on one, pick how many sessions you need and press
   **Add to calendar**. Everyone imports the same file.

Here is a message you can paste into your group chat to get started:

> Open this and mark when you're busy, then hit "Copy my code" and send me the
> code: https://thisisartman.github.io/kouhai-wiki/02_on-campus/04_academics/schedule-and-group-time-tool

## Things worth knowing

- **Your code is your schedule.** It does not contain your name unless you type
  one, and it goes nowhere except where you paste it.
- **Codes go stale between terms.** If someone sends you last term's code, the
  tool will warn you that the terms do not match.
- **Someone will refuse to use it.** Ask them when they are busy and mark it
  yourself before exporting; the tool cannot know what nobody tells it.
- **Everything is 30-minute blocks.** Class times like 8:50 do not sit neatly
  on that grid, so round outward. Being blocked slightly early is better than
  scheduling over a lecture.

## Where to actually meet

Once you have a time, you still need a room. See
[[Campus Facilities & Dorms]] for study spaces, the CNP lounge and MLIC Hall.

## Related Articles
- [[Study Groups & Peer Culture]]
- [[Course Registration]]
- [[Campus Facilities & Dorms]]

---

## 🗣️ Senior Submissions
> *Have a tip, correction, or experience to add? Click **✏️ Suggest an edit** near the title.*
```

- [ ] **Step 4: Add the inbound links**

In `Study Groups & Peer Culture.md`, under its Related Articles list, add:

```markdown
- [[Schedule & Group Time Tool]]
```

In `Course Registration.md`, under its Related Articles list, add the same line.

- [ ] **Step 5: Build and verify the whole site**

```bash
npx quartz build
```

Then confirm:

```bash
grep -c 'id="schedule-tool"' public/02_on-campus/04_academics/schedule-and-group-time-tool.html
grep -rl 'id="schedule-tool"' public --include="*.html" | wc -l
```

Expected: `1` from the first command, and `1` from the second. The widget must appear on exactly one page.

- [ ] **Step 6: Commit**

```bash
git add quartz.config.yaml content quartz-plugins/schedule-tool/dist
git commit -m "Register schedule tool and add its documentation page"
```

---

### Task 12: Changelog and tracker

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: Add the changelog entry**

Add at the top of `CHANGELOG.md`, under the `# Changelog` heading, a dated entry describing: the new `schedule-tool` plugin, that it renders only on pages with `tool: schedule` frontmatter, the code-based sharing model, and that PDF import remains unbuilt.

- [ ] **Step 2: Update `PROGRESS.md`**

Move the schedule tool from open items to current state, note the plugin count is now 6, and record that the spec's phase 5 (PDF import) is the remaining work.

- [ ] **Step 3: Commit both together**

```bash
git add CHANGELOG.md PROGRESS.md
git commit -m "Log the schedule tool in the changelog and tracker"
```

A single commit touching both trackers is deliberate: separate fixup commits leave one tracker stale relative to the other.

---

## Self-review notes

**Spec coverage.** Every section of the design maps to a task: time representation and data model to Tasks 2 and 3; free-slot computation with minimum length and auto-relax to Tasks 3 and 10; manual entry to Tasks 7 and 8; the group code with versioning, privacy copy and session storage to Tasks 4, 8 and 9; the group view with ranking and named blockers to Task 10; shortlist, message with resolved dates, and ICS with the flat JST offset to Tasks 5 and 10; edge cases (duplicate, stale term, storage unavailable) to Tasks 4 and 9; placement and documentation to Task 11.

**Deliberately not covered.** Phase 5, PDF import, which the spec places last and which needs its own plan. The mobile list-entry input from the spec's *Mobile input* section is also not built here: Task 7 delivers tap-to-toggle, which works acceptably on a phone, and list entry should be added once real users have tried the grid. That is a knowing deferral rather than a gap, and it belongs in `PROGRESS.md` as an open item in Task 12.

**Naming consistency.** `findSlots`, `encodeCode`, `decodeCode`, `buildMessage`, `buildIcs`, `nextDateFor`, `fmtTime`, `mergeIntervals`, `invertIntervals` are each defined once and used with the same signature everywhere they appear.
