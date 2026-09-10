---
title: Schedule tool design
date: 2026-09-10
status: design, not built
supersedes: partially amends 2026-09-01-timetable-builder-design.md
---

# Schedule tool: my schedule + find group time

One widget with two modes and two exports. Mode 1 is a student's own
weekly schedule. Mode 2 combines several students' schedules to find when
a group can actually meet.

This design absorbs the Timetable Builder from
`2026-09-01-timetable-builder-design.md` rather than replacing it. See
**Amendments to the Timetable Builder spec** at the end for what changed
and why.

## Motivation

Group projects are scheduled by a chain of WhatsApp messages in which five
people each say when they are not free, somebody writes it down wrong, and
the meeting gets booked over somebody's class. The information needed to
solve this is already sitting in five timetables. Nothing collects it.

The Timetable Builder alone solves a smaller and less painful problem: it
gives one student a tidy copy of a schedule they already know. Feeding the
group tool is what makes it worth building.

## Scope

```
                 ┌─────────────────────────────┐
                 │   My Schedule  (mode 1)     │
                 │   editable 30-min grid      │
                 │   + courses + custom blocks │
                 └──────────────┬──────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
                .ics export            group code
              (your timetable)       (paste-shareable)
                                            │
                 ┌──────────────────────────┘
                 ▼
       ┌─────────────────────────────┐
       │   Find Group Time (mode 2)  │
       │   paste N codes → free      │
       │   slots → shortlist →       │
       │   message → .ics booking    │
       └─────────────────────────────┘
```

## Non-goals

- **No backend, no accounts, no server-side storage.** This is a static
  Quartz site. Everything runs in the browser and nothing is transmitted.
  The group code is the entire transport mechanism. Data may sit in the
  user's own `sessionStorage` for the life of the tab (see
  *Session storage*), which is theirs to clear and never reaches us.
- **No course catalogue.** Nothing in the wiki holds
  `course → (day, period)` for the current term, and maintaining such a
  list would go stale every trimester. Courses are entered by the student,
  either by hand or by PDF import.
- **No shared or persistent groups.** Group assembly is ad-hoc, done once,
  and thrown away. Nothing survives the browser tab, and no group is ever
  addressable by anyone else.
- **No attendee invitations.** No email addresses are collected, so the
  exported calendar file carries no `ATTENDEE` lines.

## Time representation

**Every block is stored as minutes from midnight.** There is exactly one
time representation in the system and it has no concept of periods.

This matters because IUJ's class times do not align to a 30-minute grid:

| Period | Time | Lands on :00/:30 |
|---|---|---|
| 1st | 8:50–10:20 | no |
| 2nd | 10:30–12:00 | yes |
| 3rd | 13:00–14:30 | yes |
| 4th | 14:40–16:10 | no |
| 5th | 16:20–17:50 | no |
| 6th | 18:00–19:30 | yes |

Storing minutes means imported class blocks keep their true times while
hand-drawn blocks snap to 30-minute boundaries, with no second coordinate
system. **Snapping is a constraint on the drag interaction, not a storage
format.** Blocks render proportionally against 30-minute gridlines, the
way any calendar application already does.

**Do not display period numbers.** IUJ students say "my 10:30 class", not
"second period". The UI shows clock times throughout.

**The grid covers all 24 hours**, scrollable, with the viewport opening at
roughly 07:00–23:00. Group work happens at whatever hour it happens; the
early morning is reachable but not in the way.

## Data model

```
Member { id, name }

Block  {
  memberId
  day: 0-6            // Monday = 0, Sunday = 6
  start: int          // minutes from midnight
  end: int            // minutes from midnight
  kind: "course" | "custom"
  source: "manual" | "imported"
  label?: string      // optional, display only
}
```

Three layers of time, kept distinct:

| Layer | Origin | Effect |
|---|---|---|
| Courses | timetable, entered or imported | hard busy |
| Custom blockers | job, club, commute, "never before 10" | hard busy |
| Group selection | tapping candidates in mode 2 | soft, this meeting only |

Courses and custom blockers subtract from the week. Mode 2 operates on
what is left. **Custom blockers are first-class, not an afterthought**:
for many students a part-time shift or club practice constrains the week
more than classes do.

## Free-slot computation

Per weekday: union every member's hard blocks, complement across the 24
hours, keep the gaps. Plain interval arithmetic on integers, with no
special handling for where a block came from.

**Minimum meeting length** is a user control (30 / 60 / 90 minutes).
Without a floor the tool proudly offers every 20-minute gap between
classes. With five members the list is long and mostly useless otherwise.

## Input paths

### Manual entry (primary, phase 1)

The editable grid. Tap an empty cell to create a 30-minute block; a drag
handle appears on its lower edge; drag to extend in 30-minute steps. Tap
an existing block to select, tap again to clear. Multiple blocks may be
selected at once.

### PDF import (phase 2)

Parsing the IUJ Registration Form, per the original Timetable Builder
spec. Deliberately **phase 2**: it is the most complex and highest-risk
component in either tool (column-scrambled text streams, glyph-position
row reconstruction, a `pdf.js` dependency, the `Wed.2〜3` range subtlety),
and its marginal value once manual entry exists is saving a student a few
minutes once per term. Building it first would let the risky part gate the
useful part.

When it lands, it produces `kind: "course"`, `source: "imported"` blocks
at true minute times, and the student can edit them like any other.

## Mobile input

The audience is on phones. A 7 × 48 grid with drag handles on a 375px
screen gives cells roughly 50px by 15px, where drag-to-resize does not
work and mis-taps are the default.

| Context | Input |
|---|---|
| Phone, entering | List entry: "Monday, 10:30, 2 hours" |
| Phone, reviewing | Day-swipe grid, one day per screen |
| Desktop | Full week grid with drag |
| Group view (both) | Week grid, read-only |

List entry is not a downgrade. For the six to ten blocks a typical student
has, it is faster than dragging and far less error-prone.

## Group code

**Format:** the payload compressed and base64-encoded into a single
string, roughly 150–250 characters. A pasteable message, not a file.

```
{ v: 1, name: string, term: string, blocks: Block[] }
```

**Paste-code only, no file download.** The flow is WhatsApp on a phone,
where a file means download, locate in Files, attach, and the recipient
reverses all of it. Every step loses people. Copy and paste has none.

**Version from day one.** `v: 1` in the payload; refuse anything
unrecognised with a clear message. Without this the first format change
silently corrupts imports.

**Everyone exports a code, including the person collecting them.** Mode 2
could read the driver's own schedule directly, but then the instruction in
the group chat becomes "everyone send a code, except me", which is worse
to explain than one redundant paste.

### Session storage

Mode 2 keeps the pasted codes in **`sessionStorage`** so a refresh or an
accidental back-navigation does not force the collector to chase five
people for their codes again. `sessionStorage` rather than `localStorage`
is deliberate: it clears when the tab closes, which matches "temporary"
literally rather than by intention.

This does not weaken the privacy position. Nothing is transmitted and
nothing is collected by the site; the data sits in the user's own browser
and the user can clear it. A visible **Clear all** control in mode 2 empties
it immediately for anyone who would rather not wait for the tab to close.

**Privacy line, shown beside the export button, not buried:**

> This code contains your weekly schedule. Nothing is sent to any server
> — it only goes where you paste it.

**And in mode 2, beside the paste box:**

> Pasted codes stay in this browser tab and are forgotten when you close
> it. Nothing is uploaded.

Both lines must remain literally true. If a future change introduces any
transmission, these strings are the first thing to fix.

## Group view

**Bulk paste.** One textarea accepting all codes at once, newline
separated, rather than N separate paste actions.

**Rank by how many are free; do not filter to unanimous.** With five
people, "everyone free" is frequently empty, and that is the normal case
rather than an edge case. A tool that shows nothing there is useless
exactly when it is needed.

```
Tue 16:30–18:00    all 5 free
Wed 13:00–14:30    4 of 5   (Bogisha in class)
Thu 18:00–19:30    4 of 5   (Sree — part-time work)
```

**Name who is missing.** This is what makes the result actionable: the
group can see that one person's shift is the only obstacle and negotiate
it. Without the name it is merely a shorter list.

**Tap a busy slot to see who blocks it.** Same data, no extra state. Turns
"we can't do Tuesday" into "we can't do Tuesday because of your seminar",
which is the conversation people are trying to have.

## Shortlist and message

Tap a candidate slot to shortlist it, tap again to drop it; several may be
shortlisted. A **Generate message** button (opt-in, not automatic)
produces pasteable text:

```
Group project — when works?

• Tue 16 Sep, 16:30–18:00 — all 5 free
• Wed 17 Sep, 13:00–14:30 — 4 of 5, Bogisha has class
• Thu 18 Sep, 18:00–19:30 — 4 of 5, Sree working

Reply with whichever works and I'll lock it in.
```

**The grid is weekly; the message resolves dates.** The data only
knows weekdays, and a weekly grid is the correct model for a
timetable. But a message saying "Tuesday" invites three people to arrive
on the wrong Tuesday, so dates for the coming week are filled in at
message-generation time only.

## Booking and calendar export

**Two stages, deliberately separate.** The message proposes options; the
calendar file records the decision. Conflating them is tempting and wrong.

Once a slot is chosen, the user sets **how many sessions** the group needs and
exports `.ics`. That emits one `VEVENT` with
`RRULE:FREQ=WEEKLY;COUNT=<n>` rather than n separate events, so the series
can be deleted in one action.

**Japan has no daylight saving.** JST is a fixed UTC+9 year-round, so
times can be emitted in UTC with a flat offset and can never drift. No
`VTIMEZONE` block is required and no DST edge cases exist. This is
recorded explicitly so that nobody later "fixes" it into something
breakable.

Everyone imports the same file, so the group ends up synced
rather than each person hand-entering it.

## Edge cases

| Case | Handling |
|---|---|
| **Duplicate code pasted twice** | Detect identical payloads and refuse with a clear message. This is a correctness issue, not a nicety: a member counted twice makes slots look *more* available than they are, silently. |
| **Stale code from a previous term** | Compare `term` labels on import and warn loudly on mismatch. A stale code is plausible but wrong, and produces confident bad answers. |
| **Member who will not paste a code** | The driver can add a member and enter their blocks by hand. In any group of five, someone will not use the tool; without this one holdout breaks it. |
| **No slots meet the minimum** | Do not show an empty list. Relax to the next duration down and say so: "No 90-minute slots work for everyone. Showing 60-minute options." The empty state is when help is most needed. |
| **Unrecognised `v`** | Refuse with a version message rather than attempting a partial parse. |

## Placement

Under **Academics**, alongside `Course Registration.md` and
`Study Groups & Peer Culture.md`, both of which are natural inbound links.
Worth adding to the homepage pinned list once it is built, since a tool
nobody finds is a tool nobody uses.

The empty state and footer should link back into the wiki: study spaces in
`Campus Facilities & Dorms`, the CNP lounge, MLIC Hall booking. It turns a
utility into a doorway back to the content.

## Phasing

1. **Grid and data model.** Manual entry, both mobile input paths, the
   three time layers.
2. **Code export and import.** Versioning, privacy line, duplicate and
   stale-term detection.
3. **Group view.** Combining, ranking, who-is-blocking, minimum length,
   auto-relax.
4. **Shortlist, message, `.ics` booking with session count.**
5. **PDF import.** Only after 1–4 are working.

Each phase is independently useful. Phase 1 alone is a schedule grid;
phases 1–3 already solve the actual problem.

## Testing

- Interval arithmetic against hand-computed cases, including blocks that
  touch exactly, overlap partially, and span midnight boundaries.
- Imported true-time blocks (8:50, 14:40, 16:20) rendering and
  intersecting correctly against 30-minute hand-drawn ones.
- Round-trip: export a schedule to a code, import it, confirm the block
  set is identical.
- Rejection paths: bad version, corrupt base64, duplicate payload, term
  mismatch.
- `sessionStorage`: codes survive a refresh, are gone after a simulated
  tab close, and **Clear all** empties them immediately. Also confirm the
  app still works with storage unavailable, since private-browsing modes
  and blocked site data make it throw rather than return empty.
- `.ics` output validated against an external parser, and a `COUNT=n`
  series confirmed to produce n occurrences at the right JST times.

## Resolved during design

- **Session persistence for pasted codes:** yes, in `sessionStorage`. The
  data is never collected by the site, so local caching does not
  contradict the privacy stance, and losing a collection of five codes to
  a stray refresh would be worse.
- **PNG export:** dropped. Nobody asked for it and `.ics` covers the real
  use. Removing it also removes a canvas-rendering path and its own layout
  code from the build.
- **Custom blockers:** confirmed as important as courses, not a secondary
  feature. Part-time shifts and club practice constrain a student's week
  at least as much as classes do.

## Amendments to the Timetable Builder spec

`2026-09-01-timetable-builder-design.md` remains the reference for the PDF
parser, the D/P range interpretation and the period times. Three of its
decisions are overturned here:

1. **"No manual add-a-course form. Upload is the only input path."**
   Overturned. Manual entry is now the *primary* path and upload is the
   accelerator. This was the right call when upload was the only way in;
   it excluded every student who no longer has the form.
2. **Upload as a phase-1 requirement.** Moved to phase 5. See
   *Input paths* for the reasoning.
3. **The widget as a standalone personal tool.** It is now mode 1 of a
   two-mode tool, and its most valuable output is the group code rather
   than the personal grid.
4. **PNG export.** Dropped. The original spec drew the grid to an
   off-screen `<canvas>` and exported via `canvas.toBlob()`. Nobody has
   asked for a picture of their timetable, `.ics` serves the actual need,
   and removing it deletes a whole rendering path.

Unchanged and still authoritative: the fixed period times, the finding
that `Wed.2〜3` means two separate weekly meetings rather than one
continuous block, and the hand-rolled RFC 5545 approach to `.ics`.
