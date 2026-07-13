# Changelog

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
