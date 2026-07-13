# Changelog

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
