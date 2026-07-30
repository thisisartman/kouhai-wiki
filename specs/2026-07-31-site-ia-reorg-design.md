# Site IA Reorg — Design

**Date:** 2026-07-31
**Status:** Approved, not yet implemented

## Problem

The wiki's 11 flat top-level sections (`01_Pre-Arrival` through `11_IT & Productivity`,
plus `13_Country-Specific`) are organized by topic (Housing, Finance, IT, etc.).
This doesn't match how a student actually thinks about the wiki: not "what
category is this," but "where am I in my IUJ journey." The reorg groups
everything into three journey-phase buckets, plus a fourth bucket for
nationality-specific content that doesn't fit the phase logic at all.

## Definition of the Split

Arrived at through iteration, not a single clean axis — the final composite
rule:

- **Pre-IUJ**: everything before you're settled in — pre-arrival prep through
  the arrival/first-week transition.
- **On-Campus**: tied to *being an IUJ student specifically* — daily
  necessities, admin, academics, health, finance, campus-organized social
  life — generally within Minami-Uonuma. Mandatory errands that happen in
  town (bank, city hall, clinic) still count, since they're part of being a
  student here, not a location test.
- **Off-Campus**: either takes you *outside Minami-Uonuma* (Shinkansen, car
  rental, vacation travel), or isn't *specifically about being an IUJ
  student* even if it happens locally (general Japanese social norms/
  language, regional festivals IUJ doesn't organize).
- **Country-Specific**: stays a separate top-level bucket, orthogonal to the
  phase logic — organized by nationality, not by journey stage.

The last rule (student-specific vs. not) is what splits `Festivals — Campus &
Local` into two articles, and pulls `Japanese Social Norms & Etiquette` /
`Survival Japanese` out of On-Campus despite being about daily local life.

## Target Folder Architecture

```
content/
├── 01_Pre-IUJ/
│   ├── 01_Pre-Arrival/                  (Packing List, Remittances & Forex Setup, Visa & Documentation,
│   │                                     Cost of Attending IUJ — Budgeting for Year One)
│   └── 02_Arrival & First Week/         (Airport to IUJ Routes, First Week Checklist, Room Setup Tips, Urasa Station Guide)
│
├── 02_On-Campus/
│   ├── 01_Housing/                      (Dorm Life & Facilities, Gym Rules)
│   ├── 02_Finance & Banking/            (5 articles: JP Bank vs Daishi, Part-Time Work — Income & Finding
│   │                                     Jobs, PayPay Setup, Scholarship Management, Sending Money Home —
│   │                                     Cost of Attending IUJ moved to Pre-IUJ/Pre-Arrival, see above)
│   ├── 03_Legal & Administrative/       (6 articles, unchanged)
│   ├── 04_Academics/                    (10 articles incl. Term-wise Advice/, unchanged)
│   ├── 05_Daily Life/
│   │   ├── Food/                        (6, unchanged)
│   │   ├── Shopping/                    (4, unchanged)
│   │   ├── Transport/                   (6: everything except Shinkansen Strategy, Car Rental)
│   │   └── (root: Laundry, Mail & Packages, Seasons & Weather, Waste Disposal & Recycling)
│   ├── 06_Health & Wellness/            (6, incl. Emergency & Disaster Preparedness/, unchanged)
│   ├── 07_Social Life & Culture/        (Campus Life & Vibe, CAT Program, Clubs & Student Organizations,
│   │                                     IUJ Campus Events [new, split from Festivals],
│   │                                     Interacting with an International Student Body/ [5])
│   └── 08_IT & Productivity/            (8 articles, unchanged)
│
├── 03_Off-Campus/
│   ├── 01_Travel & Leisure/             (Local Attractions, Seasonal Activities, Vacation Planning/ [4],
│   │                                     Shinkansen Strategy, Car Rental,
│   │                                     Local Niigata Festivals [new, split from Festivals])
│   └── 02_Japanese Language & Culture/  (Japanese Social Norms & Etiquette, Survival Japanese)
│
└── 04_Country-Specific/                 (India/, Kyrgyzstan/ — unchanged internally, just renumbered from 13_)
```

## Exception: Cost of Attending IUJ

`Cost of Attending IUJ — Budgeting for Year One.md` moves to
`01_Pre-IUJ/01_Pre-Arrival/` rather than staying with the rest of Finance &
Banking in On-Campus — it's budgeting/planning you do before arrival, not an
ongoing on-campus task like the other 5 Finance & Banking articles.

## Article Split: Festivals — Campus & Local

Source content genuinely has two distinct halves (confirmed by reading the
file, not assumed):
- **"IUJ Campus Events"** section (Cultural Nights, Culti-Fiesta, International
  Festival/Open Day, Community & Religious Celebrations, Grad Ball, Graduation
  Ceremony, Other Recurring Campus Events, Sports Events) → becomes
  `02_On-Campus/07_Social Life & Culture/IUJ Campus Events.md`
- **"Local Niigata Festivals"** section (Naked Man Festival, Hakkaisan Fire
  Walking, Ojiya Events, Nagaoka Fireworks, Tanabata, Yuki Matsuri, Hanami) →
  becomes `03_Off-Campus/01_Travel & Leisure/Local Niigata Festivals.md`

The "Planning Around Festivals" section (Nagaoka Fireworks booking, Golden
Week, Obon) and Related Articles/Senior Submissions footers need splitting
between the two new files by relevance, not copied wholesale into both.

## Redirects

`alias-redirects` plugin is already enabled in `quartz.config.yaml` (confirmed
2026-07-31) — generates HTML redirect pages from an `aliases:` frontmatter
field, pointing old slugs at the new canonical page. Every moved/renamed
article gets its **pre-move slug** added as an alias, so old bookmarks and
slugs referenced in past Suggest-an-Edit emails keep resolving.

For the Festivals 1→2 split, only one new file can carry the original slug as
an alias (`IUJ Campus Events`, since it's listed first in the source content)
— the other half (`Local Niigata Festivals`) gets no alias back to the old
URL. Note this explicitly in the CHANGELOG so the split isn't invisible to
anyone tracking the old link.

## Execution Plan

Phased, one bucket at a time — each phase is independently reviewable and
rollback-able, chosen over a single full-repo move because of the scale
(~91 articles, one content split, per-file frontmatter/link updates).

1. **Phase 1 — Pre-IUJ**: create `01_Pre-IUJ/`, move Pre-Arrival + Arrival &
   First Week into it, add aliases, update `section:` frontmatter across all
   7 articles, fix internal wikilinks/relative paths, update/create
   `index.md` files, `npx quartz build` to verify, commit.
2. **Phase 2 — On-Campus**: same mechanics for Housing, Finance, Legal,
   Academics, Daily Life (incl. Transport split-out), Health, Social Life &
   Culture (incl. Festivals split), IT. Largest phase — likely broken into
   per-section sub-commits rather than one commit, given size.
3. **Phase 3 — Off-Campus**: Travel & Leisure (incl. the 2 Transport
   articles + Local Niigata Festivals), new Japanese Language & Culture
   folder.
4. **Phase 4 — Country-Specific**: rename `13_Country-Specific/` →
   `04_Country-Specific/`, no internal changes.
5. **Final**: full-site `npx quartz build` check for broken links, spot-check
   a handful of redirects in the browser, update `MAINTENANCE.md` (§11 Key
   Files reference and general structure notes), CHANGELOG entry summarizing
   the whole reorg.

## Out of Scope

- No other content edits beyond the Festivals split — this is a structural
  move, not a fact-check pass.
- No change to `13_Country-Specific`'s internal per-country pattern (India's
  5 articles, Kyrgyzstan's 3) beyond the folder renumbering.
- No change to the Suggest-an-Edit form or any other plugin behavior.
