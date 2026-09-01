---
title: Timetable Builder — Design Spec
date: 2026-09-01
status: approved
---

# Timetable Builder

A new Kouhai Wiki page + widget: a student uploads their official IUJ
**Registration Form** PDF and gets back a color-coded weekly timetable
preview, downloadable as an `.ics` calendar file and/or a PNG image.

## Motivation

Students already have this PDF — IUJ auto-generates it once registration
completes, and every student submits it to the Curriculum office. Instead
of asking students to re-type their schedule by hand, the widget reads it
directly from the file they already have.

## Non-goals

- No backend, no upload to any server — this is a static Quartz site.
  All parsing happens in the browser.
- No manual "add a course" form. Upload is the only input path (a student
  without one of these forms can't use the widget — acceptable, since
  every registered student has one).
- No attempt to auto-derive language-course or "unfixed" seminar times
  from any hardcoded per-level/term pattern — those change every
  trimester and the wiki already documents that they shouldn't be
  assumed stable (see `Japanese Language Courses at IUJ.md`).
- No precise per-course Module 1 vs Module 2 date bounding — the
  registration form doesn't say which module a course belongs to, so
  this is out of scope (see Known Limitations).

## Source document: the Registration Form PDF

Confirmed against 5 real sample forms (`Downloads/Course Registration/`,
GSIM MBA + JGDP programs, Fall 2025 and Spring 2026 terms). All five are
the same auto-generated template, text-based (not scanned — no OCR
needed).

**Header fields**: Name, ID, School, Program, Term (e.g. "Spring 2026"),
Print Date.

**Course table**, repeated under section headers (`Core Required Courses
(Basic)`, `Core Required Courses (Seminar)`, `Core Elective Courses`,
`Elective Courses (Language)` — section names may vary by program, the
parser should not assume this exact list): Course ID, Title, Instructor,
**D/P**, Credits.

**Critical parsing note**: the PDF's raw text stream comes out with
columns in a scrambled order — this is a known failure mode with
laid-out PDFs (confirmed once before on an unrelated document). The
parser must reconstruct table rows from each glyph's x/y position
(via `pdf.js`'s `getTextContent()` transform data), not read the text
stream in document order. `pdf.js` is not currently a dependency
anywhere in this repo — this is a new addition scoped to this one
plugin.

The parser should tolerate multi-page forms (all 5 samples were "Page 1
of 1", but nothing guarantees that for every student).

## D/P field interpretation

Format: `Day.Period` or `Day.Period〜Period` (fullwidth tilde), e.g.
`Wed.2〜3`, `Sat.3〜4`, `Mon.4〜5`.

**A period range is NOT one continuous time block.** Cross-checked
against the official term timetable (`tt2026Spring.pdf`): a course
listed as `Wed.2〜3` appears separately under both the "2nd period" and
"3rd period" rows of that timetable — i.e. it meets twice that day, once
per period, with the normal lunch gap between (period 2 ends 12:00,
period 3 starts 13:00). The parser must emit **one event per period
number in the inclusive range**, each using that period's own fixed
clock time, not a bridged span.

Fixed period times (confirmed via `tt2026Spring.pdf`):

| Period | Time |
|---|---|
| 1st | 8:50–10:20 |
| 2nd | 10:30–12:00 |
| 3rd | 13:00–14:30 |
| 4th | 14:40–16:10 |
| 5th | 16:20–17:50 |
| 6th | 18:00–19:30 |

Days: Mon–Sat (Saturday appears occasionally for makeup/intensive
sessions in the real timetable).

**Special D/P values**:
- `unfixed` (seminars with no fixed slot) — not plotted on the grid by
  default.
- blank (language electives — scheduled separately, not on this form) —
  not plotted on the grid by default.

Both cases are listed in a **"no fixed time — add yours"** section below
the grid, each with an inline day + period picker. The student fills
this in from their own known section time; nothing here is inferred or
guessed by the widget. Once filled in, that course joins the grid/export
like any parsed one.

## Term date bounds (for ICS recurrence)

The form's Term header (e.g. "Spring 2026") is shown to the student as
part of a confirmation line: *"Building timetable for: [Name] — [Program]
— [Term]"*, so they can confirm the right file was uploaded.

For the `.ics` export, each weekly-recurring event needs a bounded
`UNTIL` date. `Course Registration.md` documents the 2026-27 academic
year's term dates, but **the sample PDFs are Fall 2025 / Spring 2026 —
a year not covered by that table**, and that same doc explicitly warns
these dates "shift annually" and shouldn't be assumed to repeat. So:

- Term start/end date fields are **always shown and always editable**.
- They are pre-filled from a small local lookup table **only when we
  happen to have that year's dates entered** (currently just 2026-27,
  from `Course Registration.md`); otherwise they start blank and the
  student fills them in.
- The lookup table is a plain data file, easy to extend by hand each
  year — not something the widget tries to auto-derive or scrape.

**Known limitation**: the registration form doesn't indicate whether a
course is 1st-Module-only, 2nd-Module-only, or full-term. Rather than
guess, every recurring event is bounded to the *whole term's* start/end
date, which over-includes a few weeks for module-only electives. This is
a deliberate, stated simplification — not a bug to chase.

## Data model (client-side only)

```
ParsedCourse {
  id            // from Course ID column
  title
  instructor
  credits
  entries: [{ day, period }]   // one per period in the D/P range; empty if unfixed/blank
}

TermInfo { termLabel, studentName, program, startDate?, endDate? }

WidgetState {
  version: 1
  term: TermInfo
  courses: ParsedCourse[]
  overrides: { [courseId]: [{ day, period }] }  // manual entries for unfixed/blank courses
}
```

Stored under a single versioned `localStorage` key, namespaced by
student ID + term, so re-uploading the same file doesn't wipe overrides
already filled in, and a schema change later just resets cleanly instead
of crashing on old data.

## UI flow

1. Upload PDF (drag-drop or file picker)
2. Parse client-side; show confirmation line (name/program/term) and
   term start/end date fields (pre-filled if known, editable always)
3. Live weekly grid preview (Mon–Sat × Period 1–6), color-coded per
   course
4. "No fixed time — add yours" list below the grid, one inline day+period
   picker per unfixed/blank course
5. Download buttons: **Download .ics**, **Download PNG**

## Export logic

- **ICS**: hand-rolled RFC 5545 — one `VEVENT` per (course × period
  entry), `RRULE:FREQ=WEEKLY;UNTIL=<term end>`, `DTSTART` = first
  occurrence of that weekday/period on or after term start. No external
  ICS library needed.
- **PNG**: grid drawn directly to an off-screen `<canvas>`, exported via
  `canvas.toBlob()`. No rendering library — the layout is simple enough
  (grid lines, text, color blocks) to draw directly.
- Both triggered via `Blob` + temporary `<a download>` link.

## Component architecture

New Quartz plugin package `quartz-plugins/timetable-builder`, mirroring
the existing `home-search` plugin's shape (Preact component, `tsup`
build). Registered in `quartz.config.yaml` at `position: afterBody` with
a custom layout `condition` scoped to this page's slug — the same
pattern `home-search` already uses (`registerCondition` in
`quartz/plugins/loader/conditions.ts`) to appear only on the index page.

New content page: `content/02_On-Campus/04_Academics/Timetable
Builder.md`, linked from `Course Registration.md` and the Academics
`index.md`.

## Error handling / edge cases

- Overlapping periods (double-booked slot) — shown visually (stacked in
  the grid), not blocked. This is a planning tool, not the real
  registration system.
- Unparseable/corrupt PDF — clear error message, no partial/garbled
  state shown.
- Corrupt or old-schema `localStorage` data — versioned key means a
  mismatch resets to empty rather than crashing.
- GSIR forms are unverified (only GSIM MBA/JGDP samples were available)
  — the parser is written against the generic table/D-P structure
  rather than anything GSIM-specific, so it should hold, but this is an
  assumption to confirm once a real GSIR form is seen.

## Testing

Manual click-test in the dev server: upload each of the 5 sample PDFs,
confirm the grid matches the source form, fill in an unfixed/blank
override, download and import the `.ics` into a real calendar, check the
PNG. Matches the existing norm in this repo — other quartz-plugins
(`home-search`, `status-badge`) ship without automated test suites.
