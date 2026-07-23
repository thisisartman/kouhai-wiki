# Changelog

## [2026-07-23] — Arrival & First Week / Dorm / Registration: personal-mail fact-check continued

Continuation of the same-day personal-mail sweep (`Mail/IUJ/Personal Pre-Admission/`), extended past Pre-Arrival into the articles covering what those emails actually described (dorm check-in, city registration day, course registration prerequisites):

- `content/06_Academics/Course Registration.md` — added a "Before You Can Register: Get Your Computer Account" section: the student portal is gated behind a separate IUJ computer-account application (own deadline, ~2–3 weeks before registration), processed by MLIC; documented the birthdate-format initial password and the IUJ-account-only Google Drive gate for course materials.
- `content/03_Housing/Dorm Life & Facilities.md` — added a "Check-In Process" section (room assignment timing, luggage-shipping window of 2–3 days before check-in, go straight to the SD1 Dorm Staff Office); added two real facts to the SD1–3 section: no washlets/bathroom sockets, and dorms run at full capacity so room changes usually aren't possible.
- `content/05_Legal & Administrative/Municipal Registration — Minami-Uonuma City Office.md` — clarified the on-campus session is actually two parts (a mandatory prep session, then the registration day itself with city/pension/bank officials together); partially answered the article's own "senior input needed" note with a real prep-session location (MLIC building, one past cohort); added the bring-a-non-erasable-pen detail.
- `content/02_Arrival & First Week/First Week Checklist.md` — added the prep-session step, corrected the WiFi/portal-credentials item (the account is created *before* arrival, not on-site), added HOUSE-system and incoming-student-Facebook-group items, cross-linked the bank-account-same-day-as-registration fact already in this file to the new Municipal Registration detail.
- Noted but not actioned: a family/elementary-school-children pre-arrival email (school enrollment survey, language-readiness expectations) has no home in the wiki yet — no existing article covers bringing school-aged children. Flagged as a possible future stub, not created unprompted.

## [2026-07-23] — Pre-Arrival section pass: suggestion fixes + personal-mail fact-check

- `content/01_Pre-Arrival/Visa & Documentation.md`:
  - Suggestion-form fixes: added a "Work Permit on Entry" section (資格外活動許可 at the airport counter, scholarship exclusions), cross-linked to `Part-Time Work — Permits & Visa Rules.md`.
  - Personal-mail fact-check (maintainer's own 2024–2025 pre-admission emails, scrubbed of PII, `Mail/IUJ/Personal Pre-Admission/`): corrected CoE delivery — it's forwarded **by email** (a copy of the Immigration Bureau's own notice), not by mail/post/courier as both the original article and the suggestion-form correction claimed. Added a "What IUJ Needs From You to Apply" subsection (CoE application document checklist: form, passport copy, ID photos, proof-of-funds rules) and a note distinguishing Visit Japan Web (pre-registration tool) from the actual visa, plus the Residence-Card-at-the-airport fact.
- `content/01_Pre-Arrival/Packing List.md` — suggestion-form fix: added a "Customs Allowances (Duty-Free)" section (alcohol/tobacco/perfume/gift-value limits).
- Suggestion-form items are from maintainer self-submissions; logged in `MAINTENANCE.md` §16 for tracking, not added to the About page Contributors list.
- `Remittances & Forex Setup.md` and the Pre-Arrival index checked against the personal-mail sweep — no factual issues found, no changes needed.

## [2026-07-19] — Official-site fact-check pass: all ~54 findings fixed

Scraped IUJ's public OSS/current-student site (121 pages + 95 PDFs,
`Resources/IUJ-site/` outside the repo) and ran 6 parallel fact-check
agents against it, one per wiki section. Full findings in
`Resources/IUJ-site/fact-check-report-2026-07-19.md`.

### Fixed
- `content/05_Legal & Administrative/Residence Card — What It Is & Renewal.md` — renewal office corrected from "Nagaoka Regional Immigration Services Bureau" to the actual **Niigata Immigration Office** (Nagaoka is only a train-transfer stop en route); fee corrected from ¥4,000 revenue stamp to **¥6,000 cash paid afterward**; added the full required-document list the article was missing.
- `content/08_Health & Wellness/Emergency & Disaster Preparedness/Emergency Contacts & Procedures.md` and `content/08_Health & Wellness/Nearby Clinics & Hospitals.md` — both routed serious cases toward "Nagaoka," which IUJ's own Hospital Guide never mentions; corrected to **Uonuma Kikan Hospital** (10 min from campus, 24/7 ER). Replaced the generic 119 script with IUJ's actual one; added AED locations, the two-guarantor hospitalization requirement, and a real clinic/hospital/dentist directory with phones and English-availability days.
- `content/08_Health & Wellness/Mental Health Resources.md` — added the actual on-campus counselor contact (SEKI, ext. 506, MLIC 2F, free sessions), which was missing entirely.
- `content/08_Health & Wellness/National Health Insurance.md` — replaced an invented October-manual-payment narrative with IUJ's real mechanism (no April/May charge, combined and auto-withdrawn end of June); added the mandatory "Gakken Sai" liability/injury insurance and the ¥100/month low-balance penalty.
- `content/07_Daily Life/Waste Disposal & Recycling.md` — IUJ's own dorm garbage guide puts plastic packaging and PET bottles in **Burnable**, not a separate category as the article claimed; added the tiered big-item ticket system and the ¥4,000 appliance disposal charge.
- `content/07_Daily Life/Transport/Bicycle — Buying, Renting, Storage, Winter.md` — added the mandatory Niigata Prefecture bicycle insurance law (since April 2023), missing entirely; corrected the registration process to the real 4-document Dorm Staff submission.
- `content/07_Daily Life/Transport/Driving License — Foreign Conversion & Fresh (Step-by-Step).md` and `Car Rental — Requirements & Services.md` — corrected the license center location (Seiroumachi + Nagaoka branch, not a Niigata-City address) and the IDP validity clock (1 year from landing in Japan, not from issue); added real unlicensed/drunk-driving penalties, the Daiko service, and the 2008 seatbelt law.
- `content/07_Daily Life/Transport/Car Ownership — Buying Used.md` — added car tax deadlines (Apr 30 light vehicles, May 31 sedans) and the graduating-student tax-liability trap for undischarged vehicles.
- `content/04_Finance & Banking/Sending Money Home.md` and `content/01_Pre-Arrival/Remittances & Forex Setup.md` — added the non-resident banking status trap (first 6 months in Japan), which can turn domestic-looking payments into ~¥7,500-fee international remittances and delay scholarship deposits.
- `content/04_Finance & Banking/Scholarship Management — Stipend & Tax Notes.md` — added the JASSO stipend amount, the exact 20th/25th MyIUJ billing cycle, and the ¥1,000/month late fee with forced-withdrawal risk.
- `content/09_Social Life & Culture/Clubs & Student Organizations.md` — the club-formation process was wrong (invented a Student Council proposal, minimum-member count, and faculty-advisor requirement; IUJ's own page says there's no stated policy at all). Replaced the club catalog with the current roster and added the HOUSE program; flagged a likely-fabricated club name ("IUJ Alpine and Trekking Society").
- `content/03_Housing/Dorm Life & Facilities.md` and `Room Setup Tips.md` — MSA lottery availability was off by ~5-8x (wiki said 2-3 rooms/year; official is ~16-18/year); SD4 corrected from "standard" 2nd-year placement to a capacity-contingent fallback; added Quiet Policy hours, BBQ/lounge booking requirements, the weekly bedding-exchange system, MSA's married-couples-only framing, and real room dimensions.
- `content/02_Arrival & First Week/Urasa Station — Full Guide & Quirks.md` — removed a "bear statue" story that conflated the real Hadaka Oshiai Matsuri into an invented statue at the wrong exit.
- `content/09_Social Life & Culture/Festivals — Campus & Local.md` — fixed the Naked Man Festival date (1st Saturday of March, not "first or second weekend"); flagged a naming conflict between two official pages for the fall town festival; added Ojiya Balloon Festival/Bull Fights/Fireworks and Echigo Tsumari.
- `content/07_Daily Life/Transport/Bus & Local Routes.md` and `Shinkansen Strategy.md` — replaced a stale weekend-bus description with the actual fixed schedule (residency-based seating priority, not run order) and real stop list; removed an outdated "pending" night-bus claim (the current timetable already runs to 22:44); flagged the only available Shinkansen fare as a decade-stale reference and added the Gakuwari partial-discount nuance.
- `content/04_Finance & Banking/Part-Time Work — Income & Finding Jobs.md`, `05_Legal & Administrative/Part-Time Work — Permits & Visa Rules.md`, and `JP Bank vs Daishi — Comparison & How to Open.md` — added the TA/RA vs. library work-permit distinction, on-campus pay rate, scholarship-specific work-permit bans (JICA/ADB/IMF), the real airport/OSS-mediated permit path, and Daishi's branch hours/card-reissue fee.
- `content/08_Health & Wellness/Nearby Clinics & Hospitals.md` — added the ¥5,500 dental referral fee and the school infectious disease policy (COVID/flu return-to-class rules).
- `content/11_IT & Productivity/Printing & Scanning — Campus & Conbini.md` and `SIM & Internet Setup.md` — replaced a pricing hedge with the actual current campus printing costs and gotchas (B&W-default-on-color, A4/A3-only, jam refunds); named the campus WiFi network (iuj-air1) and added the free wired-LAN option.
- `content/06_Academics/Research Databases & Academic Tools.md` — "Bloomberg Terminal" replaced with the real **LSEG Workspace**; resolved the STATA/NVivo licensing hedges; corrected Microsoft Word's license from "Office 365" to the actual perpetual **Office 2021 Professional Plus**.
- `content/06_Academics/Course Registration.md` — resolved the "not confirmed" withdrawal-deadline hedge with the real 2026-27 per-term dates.
- `content/06_Academics/Term-wise Advice/Spring — Post-Winter Blues & Sakura.md` — corrected the Golden Week framing (IUJ holds classes as scheduled through it) and added confirmed 2026-27 milestone dates.

## [2026-07-18/19] — Status/tag redesign, live badge, suggestion backlog cleared

### Added
- `MAINTENANCE.md` §16 — permanent suggestion log; every "Suggest an edit"/
  "Suggest a new page" submission tracked with status, replacing a
  short-lived external `suggestions-log.md` draft (folded in and deleted
  same day). Multi-item submissions split into individually-numbered,
  individually-creditable action items.
- `quartz-plugins/status-badge/` — new local plugin rendering a colored
  full-width banner above the article title on any `status: needs-work`
  page, one line per reason tag present (`unverified` amber, `needs-input`
  violet, `empty` slate). `ready` pages render nothing. Registered
  `beforeBody` priority 8, just ahead of `article-title`.
- Community-folder template: 3 stub articles (Festivals & Celebrations,
  Community & Events at IUJ, Cultural Information & Etiquette) for any
  country under `13_Country-Specific/`. Scaffolded for **Kyrgyzstan** (new
  folder) and **India** (added alongside its existing Pre-Departure
  Checklist/Food Sources/OCI Card articles).
- `content/11_IT & Productivity/SIM & Internet Setup.md` — eSIM/Trip.com
  pre-arrival option (Sree's suggestion): ~¥1,000/mo or ¥14/day/GB, no
  Japanese bank account or Residence Card needed.
- `content/index.md` — homepage welcome blurb encouraging new students to
  ask senpais for help, linking to Bus & Local Routes and Useful Apps.
- `content/07_Daily Life/Seasons & Weather — Month by Month.md` — bear
  (ツキノワグマ) safety note in Niigata-Specific Notes, spring/autumn
  activity near Minami-Uonuma.
- `content/03_Housing/Dorm Life & Facilities.md` — Classrooms and MLIC Hall
  stub subsections in Campus Common Spaces (resolves the Campus Facilities
  & Bookings backlog item — chose to extend this file rather than write a
  new standalone article, since Gym/CNP already had real homes).
- About page: credited **Sree** (DXP, Class of 2026, India) and **Koshoi**
  (MBA, Class of 2027, Kyrgyzstan).

### Changed
- `status:` frontmatter simplified from 3 values
  (`ready`/`needs-verification`/`needs-senior-input`) to 2
  (`ready`/`needs-work`); the "why" moved to 3 independent tags
  (`unverified`, `needs-input`, `empty`) across all 24 non-ready articles.
  2 articles (Gym Rules, Bus & Local Routes) flipped straight to `ready` —
  content was already fact-checked, tag was just stale.
- `content/00_About Wiki/How to Use This Wiki.md` — Status Indicators
  section rewritten for the new scheme; the old version described a
  4-symbol system (✅/🔶/⚠️/🔴) and claimed status was invisible metadata,
  both stale after this session's changes.
- 21 articles' `last_updated: 2025` (bare year) replaced with real dates,
  derived from git history rather than guessed.

### Fixed
- `quartz-plugins/suggest-edit/src/components/SuggestEdit.tsx` — "new page"
  mode was leaking stale passage text into suggestion emails (textarea
  pre-filled on page-selection, never cleared on mode switch). Now omits
  the `passage` field entirely outside edit mode.

### Open
- `Dorm Life & Facilities.md` now covers dorm-specific *and* campus-wide
  content under a dorm-only title — reorder/rename/split not yet decided.
- Topic-category tags (e.g. "IUJ") explicitly deferred to a separate
  future discussion.

## [2026-07-17] — Stub-page cleanup (post fact-check)

### Added
- `content/03_Housing/Gym Rules.md` — new article: Women's Only Hour (Tue/Wed/Sun 6-8PM, 2nd floor), shoe/locker policy (1st floor), drinking-water-only fountain rule. Sourced from "IUJ Gym Facilities Guidelines" and "Proper Use of Drinking Water Facilities at the Gym" emails; deliberately excluded specific tennis-court/outdoor-facility reopening-closing dates from other gym emails as not necessary for a rules reference. Added a note that the gym (like classrooms, CNP, MLIC Hall) can be booked for events and closed during others — flagged a future "Campus Facilities & Bookings" article/section as not-yet-done, not built now.
- `content/02_Arrival & First Week/Room Setup Tips.md` — added as an explicit **stub awaiting senior contributions**, not a researched article. No official IUJ email documents dormitory furniture/fixtures, and `Dorm Life & Facilities.md` already flags this exact gap in its own Senior Submissions list — nothing to fact-check, so this stays a placeholder rather than inventing content.

### Fixed
- `content/13_Country-Specific/India/Indian Food Sources.md` — merged two inconsistent wikilink names (`[[Community & Festivals]]` and `[[Community & Festivals — India]]`, neither ever had a target page) into a single link to `[[Festivals — Campus & Local]]` — the wiki's actual general festivals article, most recently updated in the 2026-07-16 fact-check pass. No official or informal source exists for India-specific community festivals separately from that article, so this avoids creating a redundant/empty page.
- `content/03_Housing/Dorm Life & Facilities.md` — added a Gym entry to the Campus Common Spaces section, cross-linking the new Gym Rules article.

### Stub-page backlog status
Of the 5 originally identified stub links: **Gym Rules** written, **Community & Festivals** (×2 names) merged into an existing article, **Room Setup Tips** kept as an explicit contribution-needed stub, **Part-Time Work** was already resolved in the 2026-07-14 link audit (no remaining unqualified link). All 5 are now accounted for.

## [2026-07-16] — Fact-check pass: Academics, IT & Productivity

### Fixed
- `content/06_Academics/Course Registration.md` — Registration Timeline table was wrong: claimed the registration window opens ~1–2 weeks before term; actual official OAA "Course Registration" emails for all three 2025-26 terms show it opens **6–8 weeks** before term (Fall: Aug 14–21 for an Oct 6 start; Winter: Nov 12–19 for a mid-Jan start; Spring: Feb 12–19 for an early-April start). The "add/drop" row was really describing a separate one-week "Completion/Change of Registration" window right at term start (e.g. Oct 6–13), not a loose 1–2 week period — corrected. Withdrawal/W-grade mid-term deadline had no supporting email (only special deadlines for intensive/irregular-schedule courses exist) — changed to an honest "not confirmed" rather than leaving an unsourced specific.
- `content/06_Academics/Term-wise Advice/Spring — Post-Winter Blues & Sakura.md` — added IUJ's own campus sakura lane to the "best spots" list; it was missing entirely despite being the most obvious spot and having an official annual nighttime illumination event (confirmed via a 2026 "Sakura Lane Lit-Up" announcement email, ~7:15–9:30 PM mid-April).

### Fact-checked, no changes needed
- Rest of `06_Academics` (Japanese Language Courses, Library & Research Tools, Research Databases & Academic Tools, Study Groups & Peer Culture, Fall/Winter term-wise advice, Thesis Guide) — no contradicting official emails found; existing ⚠️ verify-against-official-source hedges left as-is rather than inventing sourcing.
- All of `11_IT & Productivity` (SIM & Internet Setup, Printing & Scanning, AI for Task Scheduling, Useful Apps in Japan) — no IUJ email exists covering SIM/carrier setup, printing procedures, or campus network provisioning specifically (bodies parsed as base64 MIME, not naive-grepped, to rule out false negatives). An MLIC IT-section WiFi thread and a power-outage notice confirm the wiki's generic "IT office" framing is directionally correct without adding new specifics. The Academic Honor Pledge email confirms no AI-specific policy exists, so `AI for Task Scheduling & Academic Productivity.md`'s hedge stands.

### Fixed/added — Daily Life
- `content/07_Daily Life/Transport/Bicycle — Buying, Renting, Storage, Winter.md` — article only covered Japan's national anti-theft registration; missing IUJ's own separate mandatory bicycle registration (one bike/person, via `sites.google.com/iuj.ac.jp/bicycle/home`), with unregistered/graduated-student bikes subject to unannounced confiscation sweeps. Source: "Registration / Bicycle, Car, Others" (2025-10-30), "Reminder: Bicycle Registration Required" (2025-11-10).
- `content/07_Daily Life/Transport/Car Ownership — Buying Used.md` — added mandatory IUJ vehicle registration (separate from any government process) and a winter note that the owner, not the contractor, is responsible for clearing snow off their own vehicle (IUJ disclaims damage liability). Source: same Oct/Nov 2025 emails, plus "Notice for Winter Safety" (2026-01-09), "Notes: Snow!" (2025-12-05), "Notice to Students Who Own a Car" (2026-01-23).
- `Transport/Car Ownership — Buying Used.md` and `Transport/Driving License — Foreign Conversion & Fresh (Step-by-Step).md` — added a prominent warning that JICA- and JDS-sponsored students are barred from driving in Japan entirely regardless of licence/IDP status — a restriction neither article mentioned despite being directly on-topic. Source: "👮🚨Know the Rules! Driving in Japan🚨👮" (2026-01-20).
- Checked and left alone (corroborated, no changes needed): Waste Disposal & Recycling (no official email exists; already correctly hedged), Mail & Packages, Seasons & Weather (cross-checked against multiple snow/winter-safety emails), Bus & Local Routes (matches the Nov 2025 timetable-change + Dec 2025 night-bus emails almost verbatim), Driving License/Car Rental IDP eligibility details. Laundry, Shopping/*, Food/* are experiential content with no official source to check against.

### Fixed/added — Social Life & Culture
- `content/09_Social Life & Culture/CAT Program.md` — added 6 missing partner schools (Miyo, Yabukami, Ishiuchi, Shiozawa, Omaki, Nakanoshima — was 8, now 14), confirmed the program restarts in June for the next academic year, added the ¥282 school-lunch detail. Source: five CAT sign-up emails from Counselor SEKI (Oct–Nov 2025, Jan 2026).
- `Festivals — Campus & Local.md` — added two events missing entirely: the **International Festival/Open Day** (a separate ~2,000-visitor event from Culti-Fiesta, late May, 16 food booths + 16 performances, OSS/GSO-EC organized) and the **Naked Man Festival** (裸押合大祭) at Bishamon-do Temple, Urasa — IUJ runs its own dedicated shuttle buses for it.
- `Clubs & Student Organizations.md` — added TEDxIUJ (confirmed real, ~100-seat annual event), corrected a generic "Hiking/Outdoor Club" placeholder to its real name (IUJ Alpine and Trekking Society, per a March 2026 new-club announcement), added UMEX (local exchange group, not an IUJ club, that hosts potlucks IUJ students attend).
- `Parties — Venues, Norms & Dorm Rules.md` — replaced vague hedges with concrete official rules: overnight guests strictly prohibited in single-occupancy dorm rooms (enforced), per OSS's "Dormitory Rules and Responsibilities" reminder (2026-03-19); added specifics on what noise complaints were actually about (late-night/off-campus noise, not just in-building quiet hours) per OSS's "Please Be Considerate of Our Community and Neighbors" (2026-05-22).
- Checked and left alone: Campus Life & Vibe, Japanese Social Norms & Etiquette, Survival Japanese, all four Interacting-with-International-Student-Body articles (Humour, Inclusivity, Making Friends, Romance/Consent) — experiential/cultural-advice content with no official source to check against.

### Fixed/added — Travel & Leisure
- `content/10_Travel & Leisure/Seasonal Activities — Skiing, Hanami, Matsuri.md` — the Minamiuonuma ski-voucher "eligible resorts" list was incomplete (4 of 7 official resorts, missing Hakkaisanroku — the closest resort to campus and the one used for GSO Ski Day). Expanded to match "Discounted Ski Lift Tickets for Minamiuonuma City Residents (2025–2026 Season)" (2025-12-05) and its follow-up (2026-02-10); voucher amount/distribution/validity were already correct.
- `Seasonal Activities` and `Local Attractions — Urasa, Nagaoka, Niigata City.md` — added the Naked Man Festival (same event found via Social Life & Culture) and cross-linked both articles; Bishamon-do Temple was already named but the festival tied to it was never mentioned.
- Checked and left alone: GSO Ski Day details (confirmed accurate), term-break table in "How to Plan & Budget.md" (already hedged, no clean contradiction available), Nagaoka Fireworks timing (general knowledge, not IUJ-sourced), everything in How to Book/Domestic Itineraries/International Travel (pure travel-planning advice, no official angle).

### Fact-check pass complete
All 8 sections now checked: Legal & Administrative, Finance & Banking, Health & Wellness (2026-07-14); Academics, IT & Productivity, Daily Life, Social Life & Culture, Travel & Leisure (2026-07-16). Total: 2 critical errors fixed in the first pass (pension/tax) plus the fixes/additions above in this pass. Remaining wiki backlog: the 5 stub-page wikilinks (Gym Rules, Community & Festivals ×2, Room Setup Tips, Part-Time Work) identified during the 2026-07-14 link audit are now unblocked and can be written using the sourcing confirmed here.

## [2026-07-14 05:30] — Session: search UX, mobile nav overhaul, branding, link audit, color scheme

### Changed
- `quartz/styles/custom.scss` — search results panel dialed from flat `var(--light)` to a 90%-opacity fill with matching corner radius on input/results (search panel transparency fix from earlier in session, superseded/refined here); removed the redundant in-content H1 (duplicated the frontmatter-driven title already rendered below the breadcrumbs) and pinned `.article-title`'s top margin, which was collapsing to 0 against the breadcrumbs; **desktop explorer collapse disabled entirely** — the collapsed state's fixed `1.2rem` flex-basis was shorter than the ~30px toggle button itself, clipping its own bottom edge, so removed the affordance (hidden fold chevron, inert toggle) rather than patch the height mismatch; **mobile hamburger→X** via pure CSS transform on the existing 3-line SVG, repositioned to the opposite side while open; **SPA-navigation flash fixed** — explorer's fresh server-rendered markup has no `collapsed` class until its own script re-adds it ~100ms later, visibly flashing the mobile nav open then shut on every navigation; mutes the relevant transitions for a beat around each nav event instead; breadcrumbs' last (active) crumb now ends in the same pointed arrow shape as every other crumb (was a flat square edge); added a 1px border that actually traces the chevron outline — a plain CSS `border` can't follow clip-path's diagonal edges, so inverted the layering (box's own background becomes the border color, a `::before` layered on top at 1px inset becomes the visible fill); added padding to the overlay search's `results-container` (cards sat flush against the panel's rounded border); **accent color changed from purple to pastel blue** — traced to the `quartz-themes` (Obsidian) layer computing `--secondary`/`--tertiary` from Obsidian's own `--accent-h/-s/-l` (hue 258, purple) rather than our configured palette; fixed at the root by disabling the plugin (see Removed) and retuning our own `secondary`/`tertiary` colors in `quartz.config.yaml`; **mobile header title/logo restored** — the same Obsidian layer had `.page-title{display:none}` below 800px (an Obsidian-mobile-app convention that doesn't apply here), forced back on and given a compact size + ellipsis truncation; added the existing favicon (`static/icon.png`) as a `::before` logo icon next to the title site-wide, reduced title font-size generally (1.75rem → 1.35rem, 1.1rem on mobile)
- `quartz.config.yaml` — `pageTitle` renamed "MyIUJ! Kouhai Wiki" → "MyKouhai! Wiki"; `content-index` plugin's `includeEmptyFiles` set to `false` — auto-generated tag archive pages (e.g. `/tags/visa`) have no authored content, only a title, so they were surfacing in search results as bare, description-less entries indistinguishable from a broken result; `lightMode`/`darkMode` `secondary`/`tertiary` colors changed from the old dark-navy/muted-green pair to a consistent pastel-blue family (`#2E6F9E`/`#5B9BD5` light, `#6FA8D8`/`#8FC1E8` dark) — `tertiary` was previously an unrelated muted green, so hover states used to jump hue; both now the same blue family
- `quartz-plugins/home-search/src/components/HomeSearch.tsx` — fixed a bright-yellow results background (Quartz's generic `.internal` link class — a subtle highlight pill meant for small inline wikilink mentions — was applying to the whole card since each result renders as one whole-card `<a>`); added container padding; Enter key now navigates to the top-scored result (previously did nothing at all — bare `<input>`, no `<form>`, no keydown handler); softened the search input/results border from an outlier `2px solid var(--darkgray)` to the `1px solid var(--lightgray)` convention used everywhere else on the site
- `quartz-plugins/suggest-edit/src/components/SuggestEdit.tsx` — "Suggest an edit" button's pencil emoji replaced with a monochrome inline SVG icon
- `content/index.md` — title/description updated to match the site rename
- 18 content files — 28 broken internal wikilinks fixed (renamed/moved pages: `Vacation Planning` articles missing their subfolder path segment, `Japanese Language Courses at IUJ` renamed from `Japanese Language Learning`, `CAT Program` renamed from `What is CAT?`, `Country-Specific` needing its `13_` numeric-prefix segment, a `Part-Time Work` article split into two that left one stale combined-title reference); found via a full static link-integrity check (6,568 internal links crawled against the actual build output)

### Added
- `quartz-plugins/close-nav-on-outside-tap/` — new local Quartz component (no visible markup, `afterDOMLoaded` script only) holding site-level fixes for the gitignored third-party `explorer`/`search` plugins, which reset to their pinned upstream commit on every install: tap-outside-to-close and swipe-right-from-center-to-open for the mobile nav (edges excluded — most mobile OSes bind those to back/forward gesture navigation already); the SPA-nav flash-suppression from Changed above; Enter-key fallback for the overlay search (only acts when no result is already focused via arrow keys/hover, so existing keyboard nav is untouched); resize-based collapse correction (explorer only recalculates its collapsed state on SPA "nav" events, never on window resize — crossing the mobile breakpoint by resizing alone, e.g. rotating a tablet, left the sidebar stuck in whatever state it loaded in)

### Removed
- `quartz-themes` plugin (`saberzero1/quartz-themes`, `theme: default`) disabled in `quartz.config.yaml`. This plugin ports whole Obsidian community CSS themes wholesale as one large snapshot layer, and turned out to be the root cause of nearly every unexplained CSS override fought this session and prior ones: search panel transparency, corner-radius mismatches, the purple accent hijack, and the mobile title/logo disappearing. Disabling it is a one-line config change but touches the whole site's visual baseline — **flagged for the user's sign-off before this ships**, not yet pushed.

### Fact-checked but not fixed
- 5 internal wikilinks point to pages that were never written (`Gym Rules`, `Community & Festivals` ×2, `Room Setup Tips`, one ambiguous `Part-Time Work` reference resolved to both split articles rather than picking one) — left as-is rather than inventing destination content; natural candidates for the planned stub-page pass once the IUJ email fact-check (550 `.eml` files, not started this session — flagged as its own dedicated pass) determines what's actually sourced.

### Notes
- Local dev-server testing hit a self-inflicted false alarm: `quartz build --serve` generates relative hrefs for local testing, but interleaved `npx quartz build` (production mode) calls — run to sanity-check each change — share the same `public/` output dir and overwrite those with production's absolute `/kouhai-wiki/`-prefixed paths, breaking click-through navigation in the dev server until the next `--serve` restart. Not a site bug; a testing-methodology gap now known for next time.
- Cross-device tested at 390px (mobile), 768px/800px/801px (tablet, including the exact breakpoint boundary), and 1280px/1920px (desktop) — all clean except the resize-uncollapse bug above, which was mobile→tablet-without-reload specific and is fixed.
- Commits #1–7 below are pushed and live. Commit #8 is committed locally but not pushed. Everything else (the 28-link fix sweep, site rename, mobile title/logo, `quartz-themes` disable + color retune, monochrome suggest-edit icon, home-search border fix) is **uncommitted** — sitting in the working tree, verified on the local dev server, held pending the user's review of the `quartz-themes` disable specifically.

### Commits this session (local, not yet pushed unless noted)
1. `92499d2` — Fix search results panel transparency (obsidian-theme layer clobbers plugin bg) — **pushed**
2. `bc44b86` — Search panel: subtle 90% opacity bg, matching corner radius on input/results — **pushed**
3. `7402610` — Remove duplicate in-content H1 titles, add breadcrumb-to-title spacing — **pushed**
4. `ee30ac4` — Mobile explorer nav: no desktop collapse, hamburger→X, gestures, no SPA flash — **pushed**
5. `b75ad4d` — Breadcrumbs: matching arrow tip on last crumb, shape-following border — **pushed**
6. `560729c` — Fix homepage search yellow background, add padding to both search results — **pushed**
7. `3385098` — Exclude auto-generated tag pages from search results — **pushed**
8. `4ca5dc8` — Search: Enter navigates to top result; nav: fix stuck-collapsed on resize — **local only**
9. Uncommitted: 28-link fix sweep, site rename, mobile title/logo, quartz-themes disable + color retune, monochrome suggest-edit icon, home-search border fix — **awaiting review, not committed**

## [2026-07-13 18:15] — Session: UI polish (search backdrop, breadcrumbs, suggest-edit button, explorer label fix)

### Changed
- `quartz/styles/custom.scss` — added a dim scrim behind the search overlay's blur (it had `backdrop-filter: blur` but no `background-color`, so page content underneath read through, looking like a transparent/missing background); redesigned breadcrumbs as interlocking chevron/ribbon blocks via `clip-path` polygons instead of plain "A > B > C" text, with the current page highlighted in the accent color; moved the mobile "Explorer" label (added in the previous session's mobile sidebar polish) down so it no longer sits under the hamburger toggle button and gets occluded by it (z-index 101 > label)
- `quartz-plugins/suggest-edit/src/components/SuggestEdit.tsx` — enlarged the "Suggest an edit" button into a filled accent-colored CTA (was a small ghost-outline button)

### Notes
- All from user-reported screenshots (transparent search bar, hamburger overlapping "Explorer" text, request for nicer breadcrumbs and a bigger suggest-edit button).
- Pushed and deployed live.

## [2026-07-13 17:52] — Session: India-content cleanup, homepage redesign, mobile explorer polish, clickable cards

### Changed
- `content/00_Meta/How to Use This Wiki.md` — rewrote Obsidian-specific instructions (search, wikilinks, "no GitHub account") to describe what a reader actually sees on the website; stripped `NN_` numeric prefixes from the section table; generalized the India-specific "if you're Indian" pointer to a general Country-Specific pointer
- `content/01_Pre-Arrival/Packing List.md`, `Remittances & Forex Setup.md` — removed India-only asides (spice-kit callout, forex card recommendation); generalized remaining forex guidance
- `content/04_Finance & Banking/Sending Money Home.md` — removed the India-only "SBI Remit" subsection
- `content/07_Daily Life/Food/Cooking Basics & Cheap Meal Prep.md`, `Dietary Restrictions — Halal, Gluten-Free & Allergies.md`, `Vegetarian & Vegan in Rural Niigata.md`, `Shopping/Local Grocery Options.md`, `Shopping/Online Shopping — Amazon JP, Shein, Temu.md`, `Transport/Driving License — Foreign Conversion & Fresh (Step-by-Step).md` — removed or generalized India-only asides and dangling links to the relocated `Indian Food Sources` article
- `content/08_Health & Wellness/Mental Health Resources.md` — removed the India-only iCall helpline subsection (flagged to user as a judgment call; can be restored on the India country page if wanted)
- `content/09_Social Life & Culture/Clubs & Student Organizations.md` — removed "active Indian/South Asian presence" note from Cricket Club bullet
- `content/10_Travel & Leisure/Vacation Planning/How to Plan & Budget.md`, `International Travel — SEA & Korea.md` — removed/generalized six India-only visa bullets and a dedicated "Visa Note for Indian Passport Holders" section; folded the underlying universal advice ("verify before booking, requirements vary by passport") into the general notes instead
- `content/index.md` — replaced the old plain "Sections" list with a short curated "Pinned" list; moved the welcome text into frontmatter `description` so it renders above the search box instead of below it
- `quartz-plugins/home-search/src/components/HomeSearch.tsx` — darkened/lightened the search input border per theme (`--darkgray`, auto-flips light/dark), added shadow, centered the box with a `max-width` instead of stretching full-width, added the intro paragraph render
- `quartz.config.yaml` — enabled `recent-notes` (was `enabled: false`) scoped to the homepage; excluded `note-properties` and the toolbar `search` button on the homepage (redundant with the new inline search box); emptied `footer` `links` (dropped GitHub/Discord, kept the Quartz credit)
- `quartz.ts` — registered a new `is-index` layout condition (positive counterpart to the built-in `not-index`) to scope homepage-only components
- `quartz/styles/custom.scss` — replaced the mobile explorer's bare full-bleed flat overlay with an inset "sheet" panel (width cap, shadow, border, added "Explorer" label, larger touch targets on folder/file rows); added a stretched-link overlay so folder/section cards are clickable anywhere in the card, not just the title text

### Added
- `quartz-plugins/home-search/` — new local Quartz component: a big inline search box embedded directly in the homepage body, backed by the site's existing `contentIndex.json` (no new search backend). Excludes tag-index and folder-index pages from results; ranks exact/prefix title matches above content matches.
- `13_Country-Specific/India/India — Pre-Departure Checklist.md`, `13_Country-Specific/India/Indian Food Sources.md` — relocated here from `01_Pre-Arrival/` and `07_Daily Life/Food/` respectively (git-tracked as renames)

### Removed
- `content/02_Arrival & First Week/SIM & Internet Setup.md` — deleted duplicate-titled redirect stub that collided with the real article under `11_IT & Productivity/`, which was silently breaking every `[[SIM & Internet Setup]]` wikilink site-wide (site-wide broken-link audit confirmed zero broken wikilinks after removal)
- Footer GitHub/Discord links (see Changed above)
- Toolbar search button and note-properties metadata box, homepage only (see Changed above)

### Renamed
- `content/00_Meta/` → `content/00_About Wiki/` (user-made, not part of the planned work this session; committed at the user's request)

### Notes
- Renamed the local project folder `~/Documents/Claude/Projects/Indojin Wiki` → `Kouhai Wiki` (filesystem only, not part of this repo).
- Formsubmit "suggestions not arriving" issue investigated but not resolved — backend/CORS/deployment all confirmed healthy via repeated curl tests; likely spam-folder or client-side (ad-blocker) on the reporting user's end. Parked pending a DevTools Network-tab check next time it's reproduced.
- Clickable-cards fix required a detour: the originally-planned target (`quartz/components/PageList.tsx`) turned out to be dead code, unused by any page template in this fork's config. The real card markup comes from vendored `folder-page`/`tag-page` community plugins (fetched into gitignored `.quartz/`, not part of this repo) — forking two ~170KB largely-boilerplate plugins wasn't worth it for one JSX tweak, so the fix is a pure CSS stretched-link overlay instead, which survives plugin refetches.
- Mobile explorer CSS changes were written without browser verification — no Chrome extension connected this session. Recommend a visual check on a real phone.
- All commits below were pushed to `main` and deployed live.

### Commits this session
1. `8035530` — How to Use This Wiki copy fixes, numbering strip, India article relocation, SIM & Internet Setup stub removal
2. `8cc2873` — India-only asides removed from general articles
3. `1cae6f3` — Homepage rework: home-search plugin, recent-notes enabled, pinned list, footer cleanup
4. `88f2414` — Homepage search prominence/centering/reordering, toolbar search hidden on homepage
5. `656bab1` — Mobile explorer sheet-panel styling
6. `20e70e3` — Add this CHANGELOG.md
7. `13e0205` — Clickable folder/section cards (stretched-link CSS)
8. `3dacf76` — Rename `00_Meta` → `00_About Wiki`
