# Site IA Reorg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Kouhai Wiki's `content/` tree from 11 flat topic sections into 4 journey-phase buckets (Pre-IUJ, On-Campus, Off-Campus, Country-Specific), per the approved spec at `specs/2026-07-31-site-ia-reorg-design.md`.

**Architecture:** Physical folder moves via `git mv` (this Quartz install's Explorer plugin builds its nav tree from the real filesystem, confirmed in `quartz.config.yaml` — there's no virtual-grouping option). Old URLs are preserved via the already-enabled `alias-redirects` plugin (`aliases:` frontmatter → auto-generated redirect page). One content split (`Festivals — Campus & Local` → two files) happens alongside the moves. Phased execution, one bucket at a time, each phase ending in its own `npx quartz build` verification and commit.

**Tech Stack:** Quartz v5 (this repo's custom YAML-config fork), git, bash, python3 (for frontmatter edits).

## Global Constraints

- Every moved/renamed file gets an `aliases:` frontmatter entry with its **pre-move slug**, so old bookmarks/emailed links keep resolving (per spec's Redirects section).
- Every moved file's `section:` frontmatter value must be updated to match its new folder path (this field isn't consumed by any plugin — grep-confirmed against `quartz/`, `.quartz/plugins/note-properties`, `.quartz/plugins/content-meta`, `.quartz/plugins/breadcrumbs` — but every existing article has it and it should stay accurate).
- No content edits beyond the Festivals split — this is a structural move only.
- After every phase: run `npx quartz build` and confirm the output has no new `Warning:` lines about missing files/broken links beyond the pre-existing "isn't yet tracked by git" date warnings, and the emitted file count is sane (should only grow — new index/redirect pages — never shrink except for the one Festivals file becoming two).
- Commit after each phase (or each sub-task within Phase 2) — never batch multiple phases into one commit.
- Bare `[[Article Title]]` wikilinks (no folder prefix) resolve globally by title/slug suffix match and do **not** need fixing when files move — confirmed by grep: only 14 wikilinks in the whole `content/` tree use an explicit folder-path prefix (`\[\[[0-9]{2}_...\]\]`), and all of them target either `10_Travel & Leisure/...`, `13_Country-Specific/index`, or `00_About Wiki/...` (the last one isn't moving). Only those need rewriting, in Phases 3 and 4.

---

### Task 1: Phase 1 — Pre-IUJ

**Files:**
- Create: `content/01_Pre-IUJ/` (new parent folder)
- Create: `scripts/reorg-set-frontmatter.py` (shared helper, used by every later task)
- Move: `content/01_Pre-Arrival/` → `content/01_Pre-IUJ/01_Pre-Arrival/`
- Move: `content/02_Arrival & First Week/` → `content/01_Pre-IUJ/02_Arrival & First Week/`
- Move: `content/04_Finance & Banking/Cost of Attending IUJ — Budgeting for Year One.md` → `content/01_Pre-IUJ/01_Pre-Arrival/Cost of Attending IUJ — Budgeting for Year One.md`
- Create: `content/01_Pre-IUJ/index.md`

**Interfaces:**
- Produces: `scripts/reorg-set-frontmatter.py <file> <old_slug> <new_section>` — rewrites the `section:` line and inserts an `aliases: ["<old_slug>"]` line right after it. Every later task calls this per moved file.

- [ ] **Step 1: Write the shared frontmatter-editing helper**

```python
#!/usr/bin/env python3
"""Usage: reorg-set-frontmatter.py <file> <old_slug> <new_section>
Rewrites the `section:` frontmatter line to <new_section> and inserts
`aliases: ["<old_slug>"]` immediately after it. Idempotent: if an
`aliases:` line already exists, its value is replaced instead of
duplicated.
"""
import re
import sys


def main() -> None:
    path, old_slug, new_section = sys.argv[1], sys.argv[2], sys.argv[3]
    text = open(path, encoding="utf-8").read()

    if not re.search(r"(?m)^section:.*$", text):
        raise SystemExit(f"no 'section:' line found in {path}")

    text = re.sub(r"(?m)^section:.*$", f"section: {new_section}", text, count=1)

    if re.search(r"(?m)^aliases:.*$", text):
        text = re.sub(
            r"(?m)^aliases:.*$", f'aliases: ["{old_slug}"]', text, count=1
        )
    else:
        text = re.sub(
            r"(?m)^(section: .*)$", rf'\1\naliases: ["{old_slug}"]', text, count=1
        )

    open(path, "w", encoding="utf-8").write(text)


if __name__ == "__main__":
    main()
```

Save this to `scripts/reorg-set-frontmatter.py` and make it executable:

```bash
mkdir -p scripts
chmod +x scripts/reorg-set-frontmatter.py
```

- [ ] **Step 2: Capture pre-move slugs**

Run a fresh build so `public/` reflects the current (pre-move) URLs, then save a full slug listing:

```bash
npx quartz build
find public -name "*.html" | sed 's|^public/||; s|\.html$||' | sort > /tmp/pre-move-slugs.txt
wc -l /tmp/pre-move-slugs.txt   # sanity check — should be > 100
```

Every later task starts with this same step (re-run it fresh at the start of each task, since the previous task's moves changed `public/`).

- [ ] **Step 3: Move the folders**

```bash
mkdir -p "content/01_Pre-IUJ"
git mv "content/01_Pre-Arrival" "content/01_Pre-IUJ/01_Pre-Arrival"
git mv "content/02_Arrival & First Week" "content/01_Pre-IUJ/02_Arrival & First Week"
git mv "content/04_Finance & Banking/Cost of Attending IUJ — Budgeting for Year One.md" \
       "content/01_Pre-IUJ/01_Pre-Arrival/Cost of Attending IUJ — Budgeting for Year One.md"
```

- [ ] **Step 4: Update frontmatter on all 8 moved files**

For each of the 8 files now under `content/01_Pre-IUJ/`, find its matching line in `/tmp/pre-move-slugs.txt` (the slug is recognizable — e.g. `Packing List.md` matches a line ending in `packing-list`), then run:

```bash
python3 scripts/reorg-set-frontmatter.py \
  "content/01_Pre-IUJ/01_Pre-Arrival/Packing List.md" \
  "<matched-old-slug>" \
  "01_Pre-IUJ/01_Pre-Arrival"
```

Repeat for: `Remittances & Forex Setup.md`, `Visa & Documentation.md`, `Cost of Attending IUJ — Budgeting for Year One.md` (all four get `new_section = "01_Pre-IUJ/01_Pre-Arrival"`), and `Airport to IUJ Routes.md`, `First Week Checklist.md`, `Room Setup Tips.md`, `Urasa Station — Full Guide & Quirks.md` (these four get `new_section = "01_Pre-IUJ/02_Arrival & First Week"`).

Don't touch `content/01_Pre-IUJ/01_Pre-Arrival/index.md` or `content/01_Pre-IUJ/02_Arrival & First Week/index.md` — leave their existing frontmatter as-is (index pages don't carry a `section:`/`aliases:` pair in this repo's convention — confirm by checking one, e.g. `content/11_IT & Productivity/index.md`, which only has `title:`).

- [ ] **Step 5: Create the new top-level index page**

```markdown
---
title: Pre-IUJ
---

Everything to sort out before you arrive, plus the arrival and first-week transition.
```

Save as `content/01_Pre-IUJ/index.md`.

- [ ] **Step 6: Build and verify**

```bash
npx quartz build 2>&1 | tail -30
```

Expected: no new warnings beyond "isn't yet tracked by git" for files git hasn't committed yet in this session. Confirm the redirect pages exist:

```bash
find public/01_pre-iuj -name "*.html" | wc -l   # should be >= 8 content pages + redirects
```

Spot-check one redirect works: start `npx quartz build --serve` in the background, then `curl -sI http://localhost:8080/<one-old-slug-from-step-4>` — expect a `200` (the redirect HTML loads) and check its body contains a `meta http-equiv="refresh"` pointing at the new URL. Kill the server after checking.

- [ ] **Step 7: Commit**

```bash
git add scripts/reorg-set-frontmatter.py "content/01_Pre-IUJ/"
git status --short   # confirm content/01_Pre-Arrival and content/02_Arrival & First Week no longer appear as separate top-level paths
git commit -m "IA reorg phase 1: Pre-IUJ (Pre-Arrival + Arrival & First Week + Cost of Attending IUJ)"
```

---

### Task 2: Phase 2a — On-Campus: Housing

**Files:**
- Create: `content/02_On-Campus/` (new parent folder, first sub-task to touch it)
- Move: `content/03_Housing/` → `content/02_On-Campus/01_Housing/`
- Create: `content/02_On-Campus/index.md`

**Interfaces:**
- Consumes: `scripts/reorg-set-frontmatter.py` (from Task 1)

- [ ] **Step 1:** Re-run the slug capture from Task 1 Step 2 (fresh, since Task 1's moves changed `public/`).

- [ ] **Step 2: Move**

```bash
mkdir -p "content/02_On-Campus"
git mv "content/03_Housing" "content/02_On-Campus/01_Housing"
```

- [ ] **Step 3:** Update frontmatter on `Dorm Life & Facilities.md` and `Gym Rules.md` with `new_section = "02_On-Campus/01_Housing"`, using the pattern from Task 1 Step 4.

- [ ] **Step 4: Create the On-Campus index page**

```markdown
---
title: On-Campus
---

Everything tied to being an IUJ student day-to-day: housing, finance, legal admin, academics, daily life, health, social life, and campus IT.
```

Save as `content/02_On-Campus/index.md`.

- [ ] **Step 5:** Build, verify, spot-check a redirect (same commands as Task 1 Step 6, adjusted paths).

- [ ] **Step 6: Commit**

```bash
git add "content/02_On-Campus/"
git commit -m "IA reorg phase 2a: On-Campus / Housing"
```

---

### Task 3: Phase 2b — On-Campus: Finance & Banking

**Files:**
- Move: `content/04_Finance & Banking/` → `content/02_On-Campus/02_Finance & Banking/`

Note: `Cost of Attending IUJ — Budgeting for Year One.md` already left this folder in Task 1 — it won't be present to move here.

- [ ] **Step 1:** Re-run slug capture.
- [ ] **Step 2:**

```bash
git mv "content/04_Finance & Banking" "content/02_On-Campus/02_Finance & Banking"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "02_On-Campus/02_Finance & Banking"`) on: `JP Bank vs Daishi — Comparison & How to Open.md`, `Part-Time Work — Income & Finding Jobs.md`, `PayPay — Setup, Linking Banks, Loading Money.md`, `Scholarship Management — Stipend & Tax Notes.md`, `Sending Money Home.md`.
- [ ] **Step 4:** Build, verify, spot-check.
- [ ] **Step 5: Commit**

```bash
git add "content/02_On-Campus/02_Finance & Banking/"
git commit -m "IA reorg phase 2b: On-Campus / Finance & Banking"
```

---

### Task 4: Phase 2c — On-Campus: Legal & Administrative

**Files:**
- Move: `content/05_Legal & Administrative/` → `content/02_On-Campus/03_Legal & Administrative/`

- [ ] **Step 1:** Re-run slug capture.
- [ ] **Step 2:**

```bash
git mv "content/05_Legal & Administrative" "content/02_On-Campus/03_Legal & Administrative"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "02_On-Campus/03_Legal & Administrative"`) on all 6: `Municipal Registration — Minami-Uonuma City Office.md`, `My Number Card — How to Get It & Why.md`, `Part-Time Work — Permits & Visa Rules.md`, `Pension Exemption — How to Apply.md`, `Residence Card — What It Is & Renewal.md`, `Tax Filing for Students.md`.
- [ ] **Step 4:** Build, verify, spot-check.
- [ ] **Step 5: Commit**

```bash
git add "content/02_On-Campus/03_Legal & Administrative/"
git commit -m "IA reorg phase 2c: On-Campus / Legal & Administrative"
```

---

### Task 5: Phase 2d — On-Campus: Academics

**Files:**
- Move: `content/06_Academics/` → `content/02_On-Campus/04_Academics/` (includes `Term-wise Advice/` subfolder intact)

- [ ] **Step 1:** Re-run slug capture.
- [ ] **Step 2:**

```bash
git mv "content/06_Academics" "content/02_On-Campus/04_Academics"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "02_On-Campus/04_Academics"`) on: `Course Registration.md`, `GSIM Exchange Program — Study Abroad.md`, `Japanese Language Courses at IUJ.md`, `Library & Research Tools.md`, `Research Databases & Academic Tools.md`, `Study Groups & Peer Culture.md`, and the 4 files under `Term-wise Advice/`: `Fall — Hectic, Settle In Fast.md`, `Spring — Post-Winter Blues & Sakura.md`, `Thesis Guide (IR) — Supervisor, Timeline, Tips.md`, `Winter — Credits & Survival.md`.
- [ ] **Step 4:** Build, verify, spot-check.
- [ ] **Step 5: Commit**

```bash
git add "content/02_On-Campus/04_Academics/"
git commit -m "IA reorg phase 2d: On-Campus / Academics"
```

---

### Task 6: Phase 2e — On-Campus: Daily Life

**Files:**
- Move: `content/07_Daily Life/` → `content/02_On-Campus/05_Daily Life/` (whole folder, including `Food/`, `Shopping/`, `Transport/` — Shinkansen Strategy and Car Rental get extracted to Off-Campus later, in Task 10, not here)

- [ ] **Step 1:** Re-run slug capture.
- [ ] **Step 2:**

```bash
git mv "content/07_Daily Life" "content/02_On-Campus/05_Daily Life"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "02_On-Campus/05_Daily Life"`) on all 22 non-index files:
  - `Food/`: `Campus Dining.md`, `Convenience Store Food Guide.md`, `Cooking Basics & Cheap Meal Prep.md`, `Dietary Restrictions — Halal, Gluten-Free & Allergies.md`, `Food Delivery — What Works Near Urasa.md`, `Vegetarian & Vegan in Rural Niigata.md`
  - `Shopping/`: `100 Yen & Recycle Shops — Budget Furnishing.md`, `Local Grocery Options.md`, `Online Shopping — Amazon JP, Shein, Temu.md`, `Student Discounts.md`
  - `Transport/`: `Bicycle — Buying, Renting, Storage, Winter.md`, `Bus & Local Routes.md`, `Car Ownership — Buying Used.md`, `Carpooling — Student Networks.md`, `Car Rental — Requirements & Services.md`, `Driving License — Foreign Conversion & Fresh (Step-by-Step).md`, `IC Cards — Suica & Pasmo Setup.md`, `Shinkansen Strategy.md` (yes, set these last two's section too, even though they move again in Task 10 — leaving stale frontmatter for one phase would be inconsistent with the "always accurate" constraint)
  - root: `Laundry — Facilities & Winter Challenges.md`, `Mail & Packages.md`, `Seasons & Weather — Month by Month.md`, `Waste Disposal & Recycling.md`
- [ ] **Step 4:** Build, verify, spot-check.
- [ ] **Step 5: Commit**

```bash
git add "content/02_On-Campus/05_Daily Life/"
git commit -m "IA reorg phase 2e: On-Campus / Daily Life"
```

---

### Task 7: Phase 2f — On-Campus: Health & Wellness

**Files:**
- Move: `content/08_Health & Wellness/` → `content/02_On-Campus/06_Health & Wellness/` (includes `Emergency & Disaster Preparedness/` subfolder)

- [ ] **Step 1:** Re-run slug capture.
- [ ] **Step 2:**

```bash
git mv "content/08_Health & Wellness" "content/02_On-Campus/06_Health & Wellness"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "02_On-Campus/06_Health & Wellness"`) on: `Mental Health Resources.md`, `National Health Insurance.md`, `Nearby Clinics & Hospitals.md`, and the 3 files under `Emergency & Disaster Preparedness/`: `Earthquake Preparedness.md`, `Emergency Contacts & Procedures.md`, `Heavy Snow Emergency.md`.
- [ ] **Step 4:** Build, verify, spot-check.
- [ ] **Step 5: Commit**

```bash
git add "content/02_On-Campus/06_Health & Wellness/"
git commit -m "IA reorg phase 2f: On-Campus / Health & Wellness"
```

---

### Task 8: Phase 2g — On-Campus: Social Life & Culture

**Files:**
- Move: `content/09_Social Life & Culture/` → `content/02_On-Campus/07_Social Life & Culture/` (whole folder as-is — the Festivals split and the Japanese Social Norms/Survival Japanese extraction both happen later, in Tasks 10–11, not here)

- [ ] **Step 1:** Re-run slug capture.
- [ ] **Step 2:**

```bash
git mv "content/09_Social Life & Culture" "content/02_On-Campus/07_Social Life & Culture"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "02_On-Campus/07_Social Life & Culture"`) on all 11 non-index files: `Campus Life & Vibe.md`, `CAT Program.md`, `Clubs & Student Organizations.md`, `Festivals — Campus & Local.md`, `Japanese Social Norms & Etiquette.md`, `Survival Japanese — Phrases & Apps.md`, and the 5 files under `Interacting with an International Student Body/`: `Humour Across Cultures.md`, `Inclusivity & Sensitivity.md`, `Making Friends.md`, `Parties — Venues, Norms & Dorm Rules.md`, `Romance, Consent & Adults Being Adults.md`.

(Yes, `Festivals — Campus & Local.md` and the two Japanese-life files get updated here too, even though they move/split again shortly — same reasoning as Task 6.)

- [ ] **Step 4:** Build, verify, spot-check.
- [ ] **Step 5: Commit**

```bash
git add "content/02_On-Campus/07_Social Life & Culture/"
git commit -m "IA reorg phase 2g: On-Campus / Social Life & Culture"
```

---

### Task 9: Phase 2h — On-Campus: IT & Productivity

**Files:**
- Move: `content/11_IT & Productivity/` → `content/02_On-Campus/08_IT & Productivity/` (includes `images/` subfolder)

- [ ] **Step 1:** Re-run slug capture.
- [ ] **Step 2:**

```bash
git mv "content/11_IT & Productivity" "content/02_On-Campus/08_IT & Productivity"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "02_On-Campus/08_IT & Productivity"`) on all 8: `AI for Task Scheduling & Academic Productivity.md`, `Available Software & Computer Rooms.md`, `Campus WiFi & LAN Connection.md`, `IUJ Network & Email Accounts.md`, `Printing & Scanning — Campus & Conbini.md`, `SIM & Internet Setup.md`, `Useful Apps in Japan — Maps, Transit, Translation.md`, `Windows 11 Setup Guide.md`.

  Do **not** touch anything under `images/` — those are binary assets with no frontmatter, `git mv` on the parent folder already carried them along with correct relative paths intact (the markdown files reference images via `images/<slug>/<file>.png`, a path relative to the markdown file's own new location, which is unchanged).

- [ ] **Step 4:** Build, verify — this time also confirm the embedded screenshots in `Campus WiFi & LAN Connection` and `Windows 11 Setup Guide` still render (check `public/02_on-campus/08_it--and--productivity/images/` exists with all `.png` files present).
- [ ] **Step 5: Commit**

```bash
git add "content/02_On-Campus/08_IT & Productivity/"
git commit -m "IA reorg phase 2h: On-Campus / IT & Productivity"
```

---

### Task 10: Phase 3a — Off-Campus: Travel & Leisure (incl. Transport extraction + Festivals split)

**Files:**
- Create: `content/03_Off-Campus/` (new parent folder)
- Move: `content/10_Travel & Leisure/` → `content/03_Off-Campus/01_Travel & Leisure/`
- Move: `content/02_On-Campus/05_Daily Life/Transport/Shinkansen Strategy.md` → `content/03_Off-Campus/01_Travel & Leisure/Shinkansen Strategy.md`
- Move: `content/02_On-Campus/05_Daily Life/Transport/Car Rental — Requirements & Services.md` → `content/03_Off-Campus/01_Travel & Leisure/Car Rental — Requirements & Services.md`
- Create: `content/03_Off-Campus/01_Travel & Leisure/Local Niigata Festivals.md` (new, split from Festivals)
- Modify: `content/02_On-Campus/07_Social Life & Culture/Festivals — Campus & Local.md` → renamed to `IUJ Campus Events.md` (see Step 5)
- Modify (link fixes): `06_Academics/Term-wise Advice/Spring — Post-Winter Blues & Sakura.md`, `09_Social Life & Culture/Clubs & Student Organizations.md` (now under their new `02_On-Campus/...` paths), `10_Travel & Leisure/Vacation Planning/International Travel — SEA & Korea.md`, `07_Daily Life/Shopping/Student Discounts.md`, `10_Travel & Leisure/Local Attractions — Urasa, Nagaoka, Niigata City.md`, `11_IT & Productivity/Useful Apps in Japan — Maps, Transit, Translation.md`, `10_Travel & Leisure/Vacation Planning/How to Book — Flights, Stays, JR Pass.md`, `10_Travel & Leisure/Vacation Planning/Domestic Itineraries — Tokyo, Kyoto, Osaka, Hokkaido.md` (all now under their moved paths — see Step 7 for the actual current paths to edit)
- Modify (Festivals inbound links, 14 total across 11 files — see Step 6)
- Create: `content/03_Off-Campus/index.md`

**Interfaces:**
- Consumes: `scripts/reorg-set-frontmatter.py`

- [ ] **Step 1:** Re-run slug capture.

- [ ] **Step 2: Move Travel & Leisure**

```bash
mkdir -p "content/03_Off-Campus"
git mv "content/10_Travel & Leisure" "content/03_Off-Campus/01_Travel & Leisure"
```

- [ ] **Step 3: Extract Shinkansen Strategy and Car Rental from Daily Life/Transport**

```bash
git mv "content/02_On-Campus/05_Daily Life/Transport/Shinkansen Strategy.md" \
       "content/03_Off-Campus/01_Travel & Leisure/Shinkansen Strategy.md"
git mv "content/02_On-Campus/05_Daily Life/Transport/Car Rental — Requirements & Services.md" \
       "content/03_Off-Campus/01_Travel & Leisure/Car Rental — Requirements & Services.md"
```

- [ ] **Step 4: Update frontmatter for the moved/extracted files**

`new_section = "03_Off-Campus/01_Travel & Leisure"` for: `Local Attractions — Urasa, Nagaoka, Niigata City.md`, `Seasonal Activities — Skiing, Hanami, Matsuri.md`, `Shinkansen Strategy.md`, `Car Rental — Requirements & Services.md`, and the 4 files under `Vacation Planning/`: `Domestic Itineraries — Tokyo, Kyoto, Osaka, Hokkaido.md`, `How to Book — Flights, Stays, JR Pass.md`, `How to Plan & Budget.md`, `International Travel — SEA & Korea.md`.

Use the pre-move slugs for `Shinkansen Strategy.md` and `Car Rental...md` from their **original** `07_Daily Life/Transport/...` location (captured in Step 1, before Task 6 already moved them once — use whichever slug they currently have from the most recent build, since that's what's actually bookmarked/linked right now).

- [ ] **Step 5: Split Festivals — Campus & Local into two files**

Read the current file at `content/02_On-Campus/07_Social Life & Culture/Festivals — Campus & Local.md`. It has two top-level `##` sections: "IUJ Campus Events" and "Local Niigata Festivals", plus a "Planning Around Festivals" section and footers.

Create `content/03_Off-Campus/01_Travel & Leisure/Local Niigata Festivals.md`:
- Frontmatter: `title: Local Niigata Festivals`, `section: 03_Off-Campus/01_Travel & Leisure`, `tags:` carried over from the original plus keep festival-related tags, `status: ready`, `last_updated:` today's date. No `aliases:` (the original slug goes to the other half — see below).
- Body: the "Local Niigata Festivals" `##` section content verbatim (Naked Man Festival, Hakkaisan Fire Walking, Ojiya Events, Nagaoka Fireworks, Tanabata, Yuki Matsuri, Hanami), plus the "Planning Around Festivals" section (Nagaoka Fireworks booking, Golden Week, Obon — these are all about the off-campus/regional festivals, not campus events).
- Related Articles: `[[Seasonal Activities — Skiing, Hanami, Matsuri]]`, `[[Local Attractions — Urasa, Nagaoka, Niigata City]]`, `[[Vacation Planning — How to Book — Flights, Stays, JR Pass]]`.
- Senior Submissions footer: carry over "Nagaoka Fireworks practical tips" and "Local festivals near Urasa/Minami-Uonuma worth attending" prompts.

Rename the original file to `IUJ Campus Events.md` (same folder, `content/02_On-Campus/07_Social Life & Culture/`):

```bash
git mv "content/02_On-Campus/07_Social Life & Culture/Festivals — Campus & Local.md" \
       "content/02_On-Campus/07_Social Life & Culture/IUJ Campus Events.md"
```

Edit it: change `title:` to `IUJ Campus Events`, keep the "IUJ Campus Events" `##` section content (Cultural Nights, Culti-Fiesta, International Festival/Open Day, Community & Religious Celebrations, Grad Ball, Graduation Ceremony, Other Recurring Campus Events, Sports Events), drop the "Local Niigata Festivals" and "Planning Around Festivals" sections (now living in the new file), update Related Articles to `[[Campus Life & Vibe]]`, `[[Clubs & Student Organizations]]`, `[[Local Niigata Festivals]]`, and trim the Senior Submissions footer to the campus-events-relevant prompts ("IUJ cultural nights: standout events...", "Any annual IUJ events not mentioned above..."). Then run `python3 scripts/reorg-set-frontmatter.py "content/02_On-Campus/07_Social Life & Culture/IUJ Campus Events.md" "<original-festivals-slug-from-step-1>" "02_On-Campus/07_Social Life & Culture"`.

- [ ] **Step 6: Fix the 14 inbound links to the old Festivals article**

Contextual references (point to the specific matching new article):

| File | Line context | New target |
|---|---|---|
| `01_Pre-IUJ/02_Arrival & First Week/Urasa Station — Full Guide & Quirks.md` | Hadaka Oshiai Matsuri date | `[[Local Niigata Festivals]]` |
| `02_On-Campus/04_Academics/Term-wise Advice/Spring — Post-Winter Blues & Sakura.md` (2 refs) | "Japanese spring festivals (matsuri) begin" + Related Articles | `[[Local Niigata Festivals]]` |
| `02_On-Campus/07_Social Life & Culture/Clubs & Student Organizations.md` (2 refs) | Culti-Fiesta/Grad Ball mentions | `[[IUJ Campus Events]]` |
| `02_On-Campus/07_Social Life & Culture/Campus Life & Vibe.md` | Related Articles | `[[IUJ Campus Events]]` |
| `03_Off-Campus/01_Travel & Leisure/Local Attractions — Urasa, Nagaoka, Niigata City.md` (2 refs) | Ojiya Balloon Festival/bull-fighting + Related Articles | `[[Local Niigata Festivals]]` |
| `02_On-Campus/07_Social Life & Culture/Interacting with an International Student Body/Parties — Venues, Norms & Dorm Rules.md` | Related Articles | `[[IUJ Campus Events]]` |
| `02_On-Campus/07_Social Life & Culture/CAT Program.md` | Related Articles | `[[IUJ Campus Events]]` |
| `03_Off-Campus/01_Travel & Leisure/Seasonal Activities — Skiing, Hanami, Matsuri.md` (2 refs) | Nagaoka Fireworks mention + Related Articles | `[[Local Niigata Festivals]]` |

Bare/generic references (add links to **both** new articles, since there's no contextual signal to pick one):

| File | Line context |
|---|---|
| `04_Country-Specific/India/India — Festivals & Celebrations.md` | Related Articles |
| `04_Country-Specific/India/Indian Food Sources.md` (2 refs) | "See also" + Related Articles |
| `04_Country-Specific/Kyrgyzstan/Kyrgyzstan — Festivals & Celebrations.md` | Related Articles |

For these 4 files, replace the single `[[Festivals — Campus & Local]]` line with two lines: `[[IUJ Campus Events]]` and `[[Local Niigata Festivals]]`.

- [ ] **Step 7: Fix explicit-path wikilinks pointing at the old `10_Travel & Leisure/...` prefix**

These don't need per-link judgment — just a path-prefix rewrite, since the target articles' titles are unchanged:

```bash
grep -rl '\[\[10_Travel & Leisure/' content/ | while read -r f; do
  sed -i 's|\[\[10_Travel & Leisure/|[[03_Off-Campus/01_Travel \& Leisure/|g' "$f"
done
```

Verify no more matches: `grep -rn '\[\[10_Travel & Leisure/' content/` should return nothing.

- [ ] **Step 8: Create the Off-Campus index page**

```markdown
---
title: Off-Campus
---

Life beyond Minami-Uonuma and things that aren't specifically about being an IUJ student: travel, leisure, and general Japanese language/culture.
```

Save as `content/03_Off-Campus/index.md`.

- [ ] **Step 9:** Build, verify — check specifically for broken-wikilink warnings mentioning "Festivals" or "10_Travel" (should be none), and confirm both `IUJ Campus Events` and `Local Niigata Festivals` pages render.

- [ ] **Step 10: Commit**

```bash
git add "content/03_Off-Campus/" "content/02_On-Campus/" content/01_Pre-IUJ content/04_Country-Specific content/06_Academics 2>/dev/null
git add -u
git commit -m "IA reorg phase 3a: Off-Campus / Travel & Leisure, Transport extraction, Festivals split"
```

(Using `git add -u` here since Step 6/7's link fixes touch files scattered across already-moved folders from earlier tasks — safer than trying to enumerate every touched path by hand.)

---

### Task 11: Phase 3b — Off-Campus: Japanese Language & Culture

**Files:**
- Create: `content/03_Off-Campus/02_Japanese Language & Culture/`
- Move: `content/02_On-Campus/07_Social Life & Culture/Japanese Social Norms & Etiquette.md` → `content/03_Off-Campus/02_Japanese Language & Culture/Japanese Social Norms & Etiquette.md`
- Move: `content/02_On-Campus/07_Social Life & Culture/Survival Japanese — Phrases & Apps.md` → `content/03_Off-Campus/02_Japanese Language & Culture/Survival Japanese — Phrases & Apps.md`
- Create: `content/03_Off-Campus/02_Japanese Language & Culture/index.md`

- [ ] **Step 1:** Re-run slug capture.

- [ ] **Step 2:**

```bash
mkdir -p "content/03_Off-Campus/02_Japanese Language & Culture"
git mv "content/02_On-Campus/07_Social Life & Culture/Japanese Social Norms & Etiquette.md" \
       "content/03_Off-Campus/02_Japanese Language & Culture/Japanese Social Norms & Etiquette.md"
git mv "content/02_On-Campus/07_Social Life & Culture/Survival Japanese — Phrases & Apps.md" \
       "content/03_Off-Campus/02_Japanese Language & Culture/Survival Japanese — Phrases & Apps.md"
```

- [ ] **Step 3:** Update frontmatter (`new_section = "03_Off-Campus/02_Japanese Language & Culture"`) on both files, using their most recent pre-move slugs (from `02_On-Campus/07_Social Life & Culture/...`, captured in Step 1).

- [ ] **Step 4: Create the section index**

```markdown
---
title: Japanese Language & Culture
---

General Japanese social norms, etiquette, and survival phrases — useful anywhere in Japan, not specific to IUJ.
```

Save as `content/03_Off-Campus/02_Japanese Language & Culture/index.md`.

- [ ] **Step 5:** Build, verify.

- [ ] **Step 6: Commit**

```bash
git add "content/03_Off-Campus/02_Japanese Language & Culture/"
git commit -m "IA reorg phase 3b: Off-Campus / Japanese Language & Culture"
```

---

### Task 12: Phase 4 — Country-Specific rename

**Files:**
- Move: `content/13_Country-Specific/` → `content/04_Country-Specific/`
- Modify: `content/00_About Wiki/How to Use This Wiki.md` (one link fix)

- [ ] **Step 1:** Re-run slug capture.

- [ ] **Step 2:**

```bash
git mv "content/13_Country-Specific" "content/04_Country-Specific"
```

No `section:`/`aliases:` frontmatter changes needed here — check one of the India/Kyrgyzstan articles; per the existing convention these use `section: 13_Country-Specific/India` etc. Update all 8 non-index files' `section:` value's leading `13_Country-Specific` to `04_Country-Specific` (keep the rest, e.g. `/India`, identical) — same helper script, `new_section` values: `04_Country-Specific/India` for the 5 India files, `04_Country-Specific/Kyrgyzstan` for the 3 Kyrgyzstan files. Use each file's most recent pre-move slug from Step 1.

- [ ] **Step 3: Fix the one explicit-path link**

```bash
sed -i 's|\[\[13_Country-Specific/index|[[04_Country-Specific/index|' "content/00_About Wiki/How to Use This Wiki.md"
```

- [ ] **Step 4:** Build, verify.

- [ ] **Step 5: Commit**

```bash
git add "content/04_Country-Specific/" "content/00_About Wiki/How to Use This Wiki.md"
git commit -m "IA reorg phase 4: rename Country-Specific (13_ -> 04_)"
```

---

### Task 13: Final verification and documentation

**Files:**
- Modify: `MAINTENANCE.md` (§11 Key Files reference, plus a new backlog-done entry)
- Modify: `CHANGELOG.md` (summary entry for the whole reorg)

- [ ] **Step 1: Full-site build check**

```bash
npx quartz build 2>&1 | tee /tmp/final-build.log
grep -i "warning\|error" /tmp/final-build.log
```

Confirm every warning line is an expected "isn't yet tracked by git" note (there shouldn't be any of those left, either, since everything's committed by now) — investigate and fix anything else before proceeding.

- [ ] **Step 2: Confirm no old top-level folders remain**

```bash
ls content/ | grep -E "^(01_Pre-Arrival|02_Arrival|03_Housing|04_Finance|05_Legal|06_Academics|07_Daily|08_Health|09_Social|10_Travel|11_IT|13_Country)"
```

Expected: no output (all renamed/moved).

- [ ] **Step 3: Spot-check 5 redirects in the browser**

```bash
npx quartz build --serve &
sleep 5
```

Pick 5 old slugs from `/tmp/pre-move-slugs.txt` files captured across different tasks (one per phase), `curl -sI http://localhost:8080/<slug>` each, confirm `200` + redirect meta tag pointing at a `04_country-specific`/`03_off-campus`/`02_on-campus`/`01_pre-iuj`-prefixed URL as appropriate. Kill the server (`pkill -f "quartz build --serve"`).

- [ ] **Step 4: Update MAINTENANCE.md**

Find the "§11. Reference: Key Files" section and update any listed content paths to reflect the new 4-bucket structure. Add a line to §15 Backlog marking the IA reorg entry (if one exists from before) as done, referencing `specs/2026-07-31-site-ia-reorg-design.md` and this plan file.

- [ ] **Step 5: Add CHANGELOG entry**

```markdown
## [2026-07-31] — Site-wide IA reorg: 11 flat sections -> 4 journey-phase buckets

Restructured `content/` from 11 topic-based top-level sections into
Pre-IUJ / On-Campus / Off-Campus / Country-Specific, per
`specs/2026-07-31-site-ia-reorg-design.md`. All old URLs redirect via the
existing `alias-redirects` plugin. One content split: `Festivals — Campus &
Local` became two articles, `IUJ Campus Events` (On-Campus) and
`Local Niigata Festivals` (Off-Campus), since the source content was
genuinely two distinct halves. `Cost of Attending IUJ` moved to Pre-IUJ
(pre-arrival budgeting) rather than staying with Finance & Banking.
`Shinkansen Strategy` and `Car Rental` moved from Daily Life/Transport to
Off-Campus/Travel & Leisure (both involve leaving Minami-Uonuma).
```

Add this as a new entry at the top of `CHANGELOG.md`, above the existing most-recent entry.

- [ ] **Step 6: Final commit and push**

```bash
git add MAINTENANCE.md CHANGELOG.md
git commit -m "IA reorg: final verification, MAINTENANCE.md and CHANGELOG updates"
git log --oneline -15   # sanity check: should show all 12 reorg commits in order
git push origin main
```
