# Maintenance Manual — MyKouhai! Wiki

Operational reference for whoever maintains this site. Written after the initial
build-out (July 2026), last revised 2026-07-14. If something here goes stale, fix
the doc, not just the site.

---

## 1. The Big Picture

```
 Obsidian vault (personal drafting copy, optional)
 ~/Documents/Obsidian Vaults/ARTman's Vault/IUJ/Indojins/Wiki/
              │
              │  NOT auto-synced — copy manually (see §3)
              ▼
 Quartz repo content/  ◄── THIS is what the live site is built from
 ~/Documents/Claude/Projects/Kouhai Wiki/Quartz/content/
              │
              │  git push (or merged PR)
              ▼
 GitHub Actions (.github/workflows/deploy.yml)
              │
              │  npm ci → quartz plugin install → quartz build
              ▼
 GitHub Pages
 https://thisisartman.github.io/kouhai-wiki/
```

**The repo location changed on 2026-07-14** — it used to live at `~/Documents/Quartz`
(a standalone folder). It's now nested inside the project folder at
`~/Documents/Claude/Projects/Kouhai Wiki/Quartz`, alongside the (separate,
non-git) `~/Documents/Claude/Projects/Kouhai Wiki/` project-management folder, to
reduce redundancy between the two. If any of your own shell aliases, IDE workspace
settings, or shortcuts still point at the old path, update them.

**The one thing to never forget:** editing a file in the Obsidian vault does **not**
touch the live site. Until May 2026 `content/` was a symlink to the vault, so edits
were instant — that's gone. Since July 2026, `content/` holds real files committed to
git, and the vault is just wherever you like to draft. If you edit the vault and forget
to copy the change into `content/`, the live site silently keeps the old version. (This
bit us once already — see the note in `.claude`/session history from 2026-07-12.)

---

## 2. Local Preview (before publishing anything)

```bash
cd ~/Documents/Claude/Projects/Kouhai Wiki/Quartz
npx quartz build --serve
```

Open `http://localhost:8080`. Ctrl+C to stop. If the dev server is already running
(port 8080 busy), free it first:

```bash
fuser -k 8080/tcp
```

First time on a fresh checkout, or after changing `quartz.config.yaml` plugins, run:

```bash
npx quartz plugin install
```

before `quartz build` — plugin sources live in `.quartz/` (a folder Quartz downloads
plugin code into automatically; it's "gitignored," meaning git deliberately doesn't
track it, so it's empty right after cloning the repo fresh and needs this command to
populate it).

**If you edit one of the local plugins in `quartz-plugins/`** (`suggest-edit`,
`home-search`, `close-nav-on-outside-tap`, or `status-badge` — these are
custom-written, not downloaded, so they live in the repo itself and get
git-tracked) — a plain edit to
the `.tsx` source file isn't enough on its own. These plugins ship as pre-compiled
JavaScript (in each plugin's own `dist/` folder — "dist" is short for
"distribution," i.e. the built/compiled output actually used at runtime, as opposed
to the human-edited source). You have to rebuild that `dist/` first, *then* restart
the dev server cleanly, or it can keep serving the old compiled code from before
your change even though the source file changed:

```bash
cd quartz-plugins/suggest-edit   # or whichever plugin you touched
npx tsup                          # "tsup" is the tool that compiles the .tsx
                                   # source into dist/ — rebuilds it here

# then, back at the repo root, kill and restart the dev server cleanly:
pkill -f "quartz build --serve"   # pkill finds and stops the running process by name
npx quartz build --serve
```

A plain hot-reload (the dev server automatically noticing and reloading when you
edit `content/` or `custom.scss` while `--serve` is already running) does *not* have
this problem — only plugin-`dist/` changes need the manual rebuild + restart. This
gotcha cost real time during the 2026-07-14 session before the pattern was pinned
down.

### Using VS Code

VS Code (with the Claude Code extension installed) is set up for this project
specifically, opened at `~/Documents/Claude/Projects/Kouhai Wiki/Quartz` — the
integrated terminal there is a fine place to run every command in this guide, and
its built-in editor works for markdown content, `.scss`, `.yaml`, and `.tsx` alike;
nothing here requires a specific editor.

**One gotcha:** running `npx quartz build` (a one-off build, not `--serve`) while
VS Code has this same repo open can hang or time out. VS Code's own file watcher
(it watches the whole project folder to keep its file explorer, git status, and
search index up to date) can contend with Quartz's build process, which does a lot
of file I/O in a short burst. If a build seems stuck past ~30 seconds — normal build
time is 15–25 seconds for the current ~94 content files — kill any stray build
processes and retry:

```bash
pkill -f "quartz build"
pkill -9 -f "esbuild --service"
```

This is more likely with a one-off `quartz build` than with `quartz build --serve`
(the dev server), but can affect either.

---

## 3. Editing an Existing Article

**Option A — edit directly in the repo (simplest, recommended for quick fixes):**

```bash
cd ~/Documents/Claude/Projects/Kouhai\ Wiki/Quartz/content
# edit the .md file directly — e.g. content/07_Daily Life/Waste Disposal & Recycling.md
```

**Option B — draft in Obsidian, then sync:**

1. Edit the file in the Obsidian vault as usual.
2. Copy it into the repo:
   ```bash
   cp "/home/artman/Documents/Obsidian Vaults/ARTman's Vault/IUJ/Indojins/Wiki/<path>/<file>.md" \
      "/home/artman/Documents/Claude/Projects/Kouhai Wiki/Quartz/content/<path>/<file>.md"
   ```
   Match the folder path exactly — sections are numbered folders like `07_Daily Life/`.

Either way, after editing:

```bash
cd ~/Documents/Claude/Projects/Kouhai\ Wiki/Quartz
git add content/
git commit -m "content: <describe the change>"
git push origin main
```

Branch protection on `main` requires 1 PR approval **except for the repo admin**
(`thisisartman`), who can push straight to `main` or self-approve a PR. If you add
other maintainers later, they'll need to go through a PR.

Pushing to `main` auto-triggers the deploy — check progress:

```bash
gh run list -R thisisartman/kouhai-wiki -L 1 --workflow=deploy.yml
gh run watch <run-id> -R thisisartman/kouhai-wiki
```

Or just watch the Actions tab: `github.com/thisisartman/kouhai-wiki/actions`.
Deploy takes roughly 30–60 seconds once the run starts. Live in ~1 minute after push.

---

## 4. Adding a New Article

1. Create the `.md` file inside the right numbered section folder in `content/`
   (and in the vault too, if you want a local draft copy).
2. Frontmatter — minimum viable:
   ```yaml
   ---
   title: Article Title
   ---
   ```
   ("Frontmatter" is the block of `key: value` metadata at the very top of a
   markdown file, fenced by `---` lines — it's not part of the visible article
   text, it's instructions to Quartz: what to title the page, what to tag it,
   etc. `title:` is the only field every article needs.)
3. Link it from somewhere (its section's folder gets an auto-generated listing already —
   no extra step needed for that). To hand-link from another article, use a wikilink
   (double-bracket syntax borrowed from Obsidian — Quartz turns `[[Page Name]]` into
   a real `<a>` link at build time, resolving it to whichever file has that title):
   `[[Article Title]]` or `[[07_Daily Life/Article Title|Display Text]]`.
4. Commit, push — same as above.

## 5. Adding a New Section

1. Create a new numbered folder in `content/`, e.g. `14_New Section/`.
2. Add a folder note so the section gets a clean title instead of the raw folder name:
   ```
   content/14_New Section/index.md
   ```
   ```yaml
   ---
   title: New Section
   ---

   One-line description of what this section covers.
   ```
   (This pattern — clean title + short intro — matches all existing sections.)
3. Add it to the homepage list in `content/index.md`.
4. Numeric prefix (`14_`) controls sidebar order — the "explorer" (the sidebar's
   collapsible folder/article tree) sorts by the raw **slug** (the URL-safe version
   of a file/folder's path — e.g. `content/07_Daily Life/` becomes the slug
   `07_daily-life`, all lowercase with spaces turned into hyphens), not the
   human-readable display name, so sections stay in reading order. The sorting rule
   itself is a small function (`sortFn`) under the `explorer` plugin's settings in
   `quartz.config.yaml`, if this ever needs revisiting.

---

## 6. Rearranging, Renaming, and Moving Pages

**Reordering articles within a section:** not manually controllable right now — the
card grid sorts automatically (folders first, then by date newest-first, then
alphabetically as a tiebreaker). Most articles currently share the same migration date,
so in practice it's alphabetical. If you want manual ordering later, the `folder-page`
plugin in `quartz.config.yaml` accepts a custom `sort` option — not currently set.

**Reordering sections:** controlled by each section folder's numeric prefix
(`07_Daily Life/`) — the sidebar sorts by that prefix, not by name (the `sortFn` under
the `explorer` plugin in `quartz.config.yaml`). To move a section, renumber its folder:

```bash
cd ~/Documents/Claude/Projects/Kouhai\ Wiki/Quartz/content
git mv "07_Daily Life" "07b_Daily Life"   # or fully renumber the affected folders
```

If you're renumbering several sections to make room, do all the folder moves in one
commit so the sidebar order and the homepage list (`content/index.md`) don't drift out
of sync with each other.

**Moving an article to a different section:**

```bash
cd ~/Documents/Claude/Projects/Kouhai\ Wiki/Quartz/content
git mv "07_Daily Life/Some Article.md" "09_Social Life & Culture/Some Article.md"
```

This changes the article's URL (the slug is derived from its file path). Two things to
check afterward:
1. **Wikilinks** (`[[Some Article]]`) elsewhere in the wiki keep resolving automatically
   at build time — Quartz's link crawler (`markdownLinkResolution: shortest`) finds the
   file wherever it currently lives. No manual link-fixing needed.
2. **Old bookmarks or external links** to the old URL will 404 once moved. To keep them
   working, add the old path as an alias in the moved file's frontmatter:
   ```yaml
   ---
   title: Some Article
   aliases:
     - 07_daily-life/some-article
   ---
   ```
   This generates a redirect page at the old URL. (To get the exact old slug, check the
   article's current live URL before moving it — lowercase, spaces become hyphens, `&`
   becomes `--and--`.)

**Renaming an article or section:** same mechanics as moving — the slug is just the
current file/folder path. Use `git mv`, and add an `aliases:` entry (articles only) if
you want the old URL to redirect instead of 404.

Always finish with the usual commit + push (§3).

---

## 7. Handling "Suggest an Edit" Emails

**As of 2026-07-14, the button lives in the site header** (a small pencil icon next
to search and dark-mode), not inline on individual articles — it's available on
every page, including the homepage and folder/tag listings. Clicking it opens a
modal with two tabs at the top: **"Suggest an edit"** and **"Suggest a new page"**
(defaults to the edit tab). Both tabs share the same name/email/country/grad-year/
consent fields; only the main question and the "on this page" line change.

Every suggestion arrives in the maintainer's inbox (the address currently wired to the
hashed Formsubmit endpoint — see §9) as a table-formatted email from Formsubmit,
containing:

- **type** — `"Edit"` or `"New page/topic"`, whichever tab they submitted from
- **article** — the page they were viewing when they opened the form (still tracked
  even in "new page" mode, as a "what were they reading when this occurred to them"
  signal — not dropped just because it's not about that specific page)
- **page_url** / **slug** — direct link to that page
- **passage** — the text the reader selected (edit mode only; blank in new-page mode)
- **suggestion** — what they think should change/be added, and why
- **reply_email** — their `@iuj.ac.jp` address (required, validated client-side)
- **name** — optional, paired with **country** (optional) in the same form row (2026-07-17)
- **country** — optional
- **program** — optional, free text (2026-07-17) — deliberately not a fixed
  dropdown; IUJ has many sub-programs/concentrations beyond just MBA/IR, so a
  closed option list would be too restrictive. Paired with **grad_year** in the
  same form row.
- **grad_year** — optional, their graduating class (dropdown, built fresh at page-load
  time so the year range never goes stale — not a fixed list anyone needs to update)
- **credit_consent** — `"yes"` or `"no"`. Only meaningful if `name` and/or
  `reply_email` are filled in — the checkbox itself stays hidden in the form until
  one of those fields has something in it, so a blank/`"no"` here from an anonymous
  submission isn't a real "no," just N/A.

Workflow:
1. Read the suggestion, judge it.
2. If it's an **edit** and it's good: make the change per §3, commit, push. Done — no
   need to reply unless you want to (their email address is right there if you do).
3. If it's a **new page suggestion** and it's good: create the article per §4 (or the
   section per §5, if it doesn't fit anywhere existing), citing them as the source if
   useful context, then commit/push as usual.
4. If `credit_consent` is `"yes"`: add them to the About page's Contributors list —
   it's live at `content/00_About Wiki/index.md` under "Senpai Contributors"
   (built 2026-07-17). Just add a `Name (count)` line; Adithya's entry there is
   the running example. Group under `### Class of YYYY` headings once there are
   enough entries per class to justify it — see the page's own HTML-comment
   maintenance note for details.
5. If it needs more info: email them back at `reply_email`.
6. If it's spam/junk: ignore and delete. The honeypot field filters most bots, but a
   determined human can still submit garbage — no automated moderation beyond that.
7. Log every submission in §16's table regardless of outcome — including skips and
   backlog items — so the inbox isn't the only record of what's been triaged.

There's no dashboard or queue beyond §16 — it's just your inbox plus that table. If
volume grows large, filter on subject `Kouhai Wiki suggestion:` (edits) or `Kouhai
Wiki new page suggestion` (new
page/topic) in Gmail.

---

## 8. Deploy Failing? Troubleshooting

```bash
gh run list -R thisisartman/kouhai-wiki -L 5
gh run view <run-id> -R thisisartman/kouhai-wiki --log-failed
```

Known past failure (fixed, but the shape may recur if the workflow is edited): the raw
`npm run install-plugins` script chokes on `.scss` imports in CI. The working step is
`npx quartz plugin install` (see `.github/workflows/deploy.yml`) — that's the Quartz
CLI's own installer, not the old tsup-driven script.

If a push is rejected (`hint: 'git pull' before pushing again`), someone else (or a
Dependabot auto-merge, or an edit made directly on GitHub) moved `main` forward. Fix:

```bash
git fetch origin
git rebase origin/main
git push origin main
```

**"Suggest an edit" form silently doesn't submit (no error, no success message):**
this happened in production and took a while to root-cause (fixed 2026-07-14,
commit `d578a28`) — the anti-spam honeypot field was hidden with
`position: absolute; left: -9999px`, which keeps the element technically rendered
just off-screen. Browser autofill can still see and fill off-screen fields like
that, and when it auto-filled name/email it sometimes filled the honeypot too,
silently tripping the bot trap and closing the modal with no error — indistinguishable
from a dead network connection. **If this recurs** (e.g. after any future edit to
`quartz-plugins/suggest-edit`'s honeypot field), the fix is: the honeypot's CSS must
use `display: none` (or `visibility: hidden`), never off-screen positioning alone —
autofill respects `display: none` as "skip this field" but not mere positioning.

---

## 9. Changing the Suggest-an-Edit Destination Email

The button "POSTs" (submits form data over the network, the same way any web form
does) to a Formsubmit **hashed alias** — Formsubmit is a free service that turns a
plain HTML/JS form into "emails arrive in an inbox," with no backend server of our
own needed. Instead of writing the destination email address directly into the
site's code (where anyone viewing page source could scrape it for spam), Formsubmit
gives you a random-looking ID string tied to that address — the "hash" — and you
submit to that instead:

```
quartz-plugins/suggest-edit/src/components/SuggestEdit.tsx
  → const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/<hash>"
```

To point it at a new address:

1. Submit once (any test payload) to `https://formsubmit.co/ajax/<new-email>` — this is
   a **new form**, so Formsubmit emails an activation link to that address.
2. Click "Activate Form" in that email — the confirmation page reveals the hashed alias
   for that address.
3. Update `FORMSUBMIT_ENDPOINT` in `SuggestEdit.tsx` with the new hash.
4. Rebuild the plugin and commit the compiled output (this repo ships a **pre-built**
   `dist/` so CI never needs to build it):
   ```bash
   cd quartz-plugins/suggest-edit
   npm run build
   cd ../..
   git add quartz-plugins/suggest-edit
   git commit -m "suggest-edit: point at new destination"
   git push origin main
   ```
5. **Important:** Formsubmit activation is **per domain**, not just per email. If the
   site ever moves off `thisisartman.github.io` (custom domain, different host), the
   *first* submission from the new domain will trigger another one-time activation
   email — expected, not a bug.

---

## 10. Changing the Favicon / Site Title

- **Favicon:** replace `quartz/static/icon.png` with a new image (any size — Quartz
  generates the various sizes/formats from it), then rebuild and push.
- **Site title:** appears in three places, keep them consistent —
  `quartz.config.yaml` (`configuration.pageTitle`), `content/index.md` (frontmatter
  `title:` + the welcome sentence), and `CONTRIBUTING.md`'s heading.

---

## 11. Reference: Key Files

| File | Purpose |
|---|---|
| `quartz.config.yaml` | Site title, plugins, theme colors, layout, explorer sort order |
| `quartz/styles/custom.scss` | All manual style overrides (sidebar icons, link highlight fix, content-meta visibility, etc.) — read the comments, each block explains *why* |
| `content/` | The actual live wiki content — source of truth |
| `content/<NN_Section>/index.md` | Folder note giving a section its clean title + intro |
| `.github/workflows/deploy.yml` | Build + deploy to Pages on push to `main` |
| `.github/CODEOWNERS` | PR review routing — which GitHub username(s) get auto-requested for review on a Pull Request touching a given path |
| `CONTRIBUTING.md` | Public-facing contributor guide |
| `quartz-plugins/suggest-edit/` | The "Suggest an edit" / "Suggest a new page" button + modal (local plugin, pre-built `dist/` committed) |
| `quartz-plugins/home-search/` | The big inline search box on the homepage (separate from the small header search icon) |
| `quartz-plugins/close-nav-on-outside-tap/` | Mobile nav behavior — tap-outside-to-close, swipe-to-open, the hamburger-to-X icon morph, and a few small navigation-transition fixes |
| `CHANGELOG.md` | Session-by-session history of what changed and why — read this first when picking work back up |
| `MAINTENANCE.md` | This file |

---

## 12. Accounts / Access Needed to Maintain This

- **GitHub** account with write access to `thisisartman/kouhai-wiki` (or admin, for
  direct-to-main pushes past branch protection).
- **`gh` CLI**, authenticated (`gh auth login`) — used for checking deploy status,
  managing repo settings. Not strictly required (the GitHub web UI covers everything)
  but much faster.
- **Formsubmit** needs no account — but whoever's email address suggestions go to must
  be able to click the one-time activation link (§9).
- No Cloudflare, no CMS, no other third-party service in the current setup.

---

## 13. The Header Toolbar Is a Narrow Sidebar Column, Not a Top Bar

This tripped up several rounds of changes on 2026-07-14, so it's worth writing down
explicitly: the site title, search icon, "Suggest an edit" button, dark-mode toggle,
and the sidebar's collapsible article tree ("explorer") all render inside
`.sidebar.left` — a **narrow, fixed-width column** (currently 320px, set by
`$sidePanelWidth` in `quartz/styles/variables.scss`) that sits down the *left edge*
of the page, at every screen size from phone to ultrawide monitor. It is **not** a
conventional full-width top navigation bar like most websites have, even though it
visually reads as "the header" because the title/toolbar happen to be the first
things in that column.

**Why this matters:** anything placed in that column has to stay compact (icon-only
buttons, no long text labels) or it will overflow and visually spill into the
article content next to it — which is exactly what happened when the suggest-edit
button briefly grew a text label ("Suggest an edit") on wider screens. There's a
separate, wider grid area (`grid-header`, defined in the same `variables.scss` file)
that a *real* top bar could use — but nothing currently renders there, and this
site's plugin config (`quartz.config.yaml`) only supports placing components at
`"left" | "right" | "beforeBody" | "afterBody"` (see
`quartz/plugins/loader/types.ts:11`) — `"header"` isn't an option exposed through
that declarative system. Actually using the wider header area would mean writing a
custom page-layout template by hand, not just editing the YAML config — a much
bigger undertaking than any of today's CSS-only fixes. (See §15 for this as a
possible future direction if the compact-icon approach ever feels too limiting.)

**Practical rule for any future header change:** keep every item in that column
icon-only, matching the existing style of search and dark-mode (small square button,
`title="..."` attribute for the hover tooltip, no visible text). If you need to
adjust spacing between the icons, that's the `toolbar` group's `gap` setting under
`layout.groups.toolbar` in `quartz.config.yaml` (currently `1.2rem`), not something
in `custom.scss`.

---

## 14. Color Scheme / Theme Reference

- **Accent colors** ("secondary"/"tertiary" in Quartz's naming) are set in
  `quartz.config.yaml` under `theme.colors.lightMode` / `.darkMode` — currently a
  pastel blue (verified for readable contrast — WCAG AA in light mode, AAA in dark
  mode — against the background in both modes).
- **The `quartz-themes` plugin is disabled** (`enabled: false` in
  `quartz.config.yaml`). This is a community plugin that reskins Quartz to look like
  Obsidian's own app — it was found to be the root cause of several style bugs
  earlier in the project (its CSS was overriding this site's own colors/spacing in
  ways that were hard to trace), and disabling it fixed them outright. Don't
  re-enable it without expecting to re-diagnose the same class of conflicts.
- **`quartz/styles/custom.scss`** is where every manual style fix in this project
  lives, and it's written so it *always wins* over any plugin's own CSS regardless
  of how specific the plugin's selector is — Quartz's stylesheets are organized into
  "cascade layers" (`@layer quartz-base, obsidian-theme, ...` — a CSS feature where
  rules in a later-declared layer beat an earlier layer's rules no matter how
  specific either selector is), and `custom.scss` deliberately isn't inside any of
  those layers, which under CSS's rules makes it the automatic winner. In practice:
  if you want to override anything about how the site looks, put the override here,
  don't try to fight specificity in the plugin's own file.

---

## 15. Backlog / Future Ideas (Not Started)

Things discussed but deliberately deferred — parked here instead of relying on
anyone's memory of a past conversation:

- **Status/tag system redesign — migration complete 2026-07-18.** `status:`
  frontmatter simplified from 3 values (`ready` / `needs-verification` /
  `needs-senior-input`) down to just 2 (`ready` / `needs-work`), with
  separate tags capturing *why* an article needs work instead of encoding
  that in the status value itself. A full audit of all 26 non-ready articles
  (cross-checked against CHANGELOG fact-check history) found the "why"
  splits into 3 independent, co-occurring gap types, each now a real tag:
  - **`unverified`** — an official source likely exists, hasn't been checked
    yet (e.g. Waste Disposal's city collection schedule, Library's DB list,
    Emergency Contacts' literal placeholder numbers).
  - **`needs-input`** — needs a firsthand student account; no official
    source will ever cover this (club activity levels, clinic recs, "what I
    wish I'd done differently").
  - **`empty`** — thin/stub content, barely anything regardless of source
    (Room Setup Tips, Campus Dining, Food Delivery, Indian Food Sources).

  Names picked with the maintainer 2026-07-18 (rejected reusing
  `needs-senior-input` verbatim for `needs-input`, to avoid confusion with
  the retired status value). All 24 remaining `needs-work` articles got their
  full mapping reviewed article-by-article and applied same day — see git
  history (`content/` diff, commit dated 2026-07-18) for the exact tag(s)
  each file received; several carry two reason-tags where gaps co-occur
  (e.g. Thesis Guide (IR), Car Ownership, Nearby Clinics & Hospitals all got
  both `needs-input` + `unverified`).
  - **Status flips to `ready` applied 2026-07-18** (content was already
    fact-checked, tag was just stale): `Gym Rules.md` and
    `Bus & Local Routes.md`.
  - **`Parties — Venues, Norms & Dorm Rules.md` — resolved 2026-07-18.** The
    stale blanket hedge ("must be verified against the current student
    handbook") was deleted — it was superseded by specific sourced content
    later in the same article (OSS enforcement reminders on overnight guests
    and noise complaints). The narrower, genuinely-open quiet-hours hedge was
    kept. Senior Submissions footer's first ask narrowed from "current dorm
    rules on gatherings, noise, and guests" (now sourced, too broad) to just
    "exact quiet hours times, if known." Status is now `needs-work` +
    `unverified` — the quiet-hours gap is real — `last_updated` bumped to
    2026-07-18.
  - **`last_updated` bumped to 2026-07-16** on 4 files whose content was
    fixed during the 2026-07-16 fact-check pass but never got the frontmatter
    field updated at the time: `Course Registration.md`, `Spring —
    Post-Winter Blues & Sakura.md`, `Clubs & Student Organizations.md`,
    `Car Ownership — Buying Used.md`.
  - **Not yet done**: a broader **topic-category tag taxonomy** (e.g. an
    "IUJ" tag) was raised in the same conversation but **explicitly deferred
    to a separate, later discussion** — don't conflate the two tag systems.
  - ~~Live status badge on articles~~ — **DONE 2026-07-18.** New local
    plugin `quartz-plugins/status-badge/` renders a full-width banner above
    the article title (the "B" placement approved earlier) whenever
    `status: needs-work`, with one colored line per reason tag present
    (`unverified` amber, `needs-input` violet, `empty` slate — colors match
    the design-review mockup). Ready pages render nothing. Registered in
    `quartz.config.yaml` at `beforeBody` priority 8, just ahead of
    `article-title`'s priority 10. Reviewed locally via `quartz build
    --serve` and approved by the maintainer before committing.
  - **Separately noticed, not yet fixed**: 21 articles have
    `last_updated: 2025` (bare year, not a full date) — pre-existing
    inconsistency unrelated to this migration, spotted while auditing
    frontmatter. Flagged for a future cleanup pass.
- ~~About page — Contributors list~~ — **DONE 2026-07-17.** Live at
  `content/00_About Wiki/index.md` under "Senpai Contributors": name + `(count)`
  format, flat list for now (Adithya's the first entry), grouping by
  graduating class deferred until there are enough entries per class to
  justify it. **Manually maintained** — there's no database to automate it
  from (Formsubmit only emails submissions), so keep a running tally as
  suggestions with `credit_consent: yes` come in (§7).
- ~~Fact-check remaining sections~~ — **DONE 2026-07-16.** All 8 sections checked
  against the 550 official IUJ emails (see CHANGELOG.md for the full per-section
  breakdown). Fixes/additions landed in Academics, Daily Life, Social Life &
  Culture, and Travel & Leisure; IT & Productivity had no official source to check
  against and needed no changes.
- ~~5 stub-page wikilinks~~ — **DONE 2026-07-17.** Gym Rules written (new article
  under `03_Housing/`); Community & Festivals's two inconsistent link names merged
  into a single link to the existing `Festivals — Campus & Local` article (no
  separate India-community page exists or has a source to justify one); Room
  Setup Tips deliberately kept as a stub awaiting senior contributions (no
  official or existing source for dorm furniture/fixtures — see CHANGELOG.md);
  Part-Time Work was already resolved in the 2026-07-14 link audit.
- ~~Campus Facilities & Bookings article~~ — **DECIDED & DONE 2026-07-19.**
  Chose separate coverage per space over a new combined article, since Gym
  and CNP already had natural homes with real content (Gym Rules; the CNP
  subsection in `Dorm Life & Facilities.md`) — a standalone page would've
  mostly just re-linked to those two. Added **Classrooms** and **MLIC Hall**
  as two new stub subsections in `Dorm Life & Facilities.md`'s existing
  "Campus Common Spaces" section, each honestly marked as needing senior
  input on the booking process rather than inventing details. File's tags
  gained `needs-input` alongside its existing `unverified`.
- **`Dorm Life & Facilities.md` naming/structure mismatch — flagged
  2026-07-19, not decided.** The file now covers both dorm-specific content
  (SD1–4, MSA) and campus-wide facilities (CNP, Gym, Classrooms, MLIC Hall,
  BBQ, Rooftop) under a title that only names the former. Maintainer wants
  to think it over before choosing between: (1) just reorder sections so
  Campus Common Spaces comes before Dormitory Buildings, same file/title;
  (2) rename the file (something other than "Campus Life & Facilities" —
  too close to the existing `Campus Life & Vibe` article in
  `09_Social Life & Culture`, which is social/cultural, not physical
  spaces); (3) split into two separate articles. Don't act on this without
  the maintainer picking one.
- **My Number ↔ Japanese phone number cross-reference — flagged 2026-07-17, not
  written yet.** `SIM & Internet Setup.md`'s "What You Need to Sign Up" list
  (Passport, Residence Card, address, payment method) doesn't mention My Number
  at all. **Tone for when this gets written**: it's carrier-dependent — some
  require My Number for a contract, some don't — user will confirm which is
  which before this goes in, so don't state it as a flat universal requirement.
  Regardless of which carriers require it, note that getting the physical My
  Number Card is worth doing anyway (see `My Number Card — How to Get It &
  Why.md`, which already covers the easy letter-based process — arrives at your
  dorm mailbox 1-2 weeks after city registration). User said they'll add this
  later; not actioned now.
- **"Pending pages" list — flagged 2026-07-17, not built.** Idea: a section
  (About Wiki page or standalone) listing articles that are incomplete/thin, so
  readers with relevant knowledge can pick one and contribute via Suggest an
  Edit. Feasible cheaply: 13 of 82 articles already carry `status:
  needs-verification` in frontmatter — that's the existing "needs work" signal,
  no new tagging required. Design question left open: for an article that
  already exists but is thin (e.g. Room Setup Tips), the natural flow is
  **"Suggest an edit" mode** on that page directly (auto-fills "On: <article>"),
  not "Suggest a new page" mode — confirm this is the intended flow before
  building, since the user's phrasing ("switch to the new topic section")
  suggested new-page mode, which is really for topics with no page at all.
- ~~iOS-specific behavior parity check~~ — **CLOSED 2026-07-17.** Turned out to
  be just a text-copy issue on Safari, not a broader nav/search/breadcrumb/
  suggest-edit parity problem. Resolved, no longer tracked.
- ~~Add a "courses" field to the suggest-edit form~~ — **SUPERSEDED
  2026-07-17.** Considered, then dropped in favor of a **Program** field
  instead (free text, e.g. "MBA", "IR" — not courses taken). See the form
  reorganization note below.
- **Suggest-edit form reorganized — DONE 2026-07-17.** Country moved to pair
  with Name (was paired with Class of); a new **Program** field (free text)
  takes Country's old slot next to Class of. New row order: [Name | Country],
  email (unchanged, standalone), [Program | Class of]. See §7 for the updated
  field list.
- **A floating action button (FAB)** for "Suggest an edit" instead of the header
  icon — would sidestep the narrow-sidebar-column constraint in §13 entirely, and be
  more thumb-reachable on mobile. Considered not worth doing for search/dark-mode
  (those are utility toggles, better as always-visible icons than a floating menu).
  Not an active problem right now since the icon-only header fixes already resolved
  the crowding that prompted the question — revisit if the header ever feels
  cramped again, or if "suggest an edit" specifically needs more visual prominence.
- **Real GitHub Pull Request workflow for collaboration**, instead of relying solely
  on the Formsubmit suggestion box — contributors fork/branch, maintainer reviews
  and merges. The `.github/CODEOWNERS` file already exists for this and would become
  actively useful once there's more than one reviewer.
- **Maintainership succession** — adding GitHub collaborators, transferring repo
  ownership, or converting the personal-account repo to a GitHub Organization so
  running the site isn't tied to one person's account. This is a genuine
  access-control change (only the current repo owner can grant it, via GitHub's own
  Settings — not something to script around), but the planning/structuring work
  (what roles should exist, what a CONTRIBUTING.md update would need to say) can
  happen ahead of actually granting anything.

**Done, no longer backlog:** the stale duplicate `CHANGELOG.md`/`CONTRIBUTING.md`/
`CODEOWNERS` copies that used to sit in the separate project-management folder
(`~/Documents/Claude/Projects/Kouhai Wiki/`, not a git repo) were deleted on
2026-07-14 — they were strictly older than this repo's own versions (the folder's
`CODEOWNERS` still had an unfilled `@YOUR_GITHUB_USERNAME` placeholder). This repo's
copies (`CHANGELOG.md`, `CONTRIBUTING.md`, `.github/CODEOWNERS`) are the only ones
that exist now — don't recreate copies elsewhere.

---

## 16. Suggestion Log — Every Submission Received

Every "Suggest an edit"/"Suggest a new page" email that's ever landed, tracked here
so nothing gets actioned twice or silently dropped. **This table is the single
source of truth** — a short-lived `suggestions-log.md` was drafted outside the repo
on 2026-07-18 and folded in here same-day; don't recreate a separate copy (same
stale-duplicate mistake as the old `CHANGELOG`/`CONTRIBUTING` copies above).

**"Senpai" vs "Self-test"** in the Source column just distinguishes real student
submissions from the maintainer's own test/debug traffic through the same form —
it is *not* the same thing as the About page's "Senpai Contributors" credit list
(§7 step 4), though a Senpai-sourced suggestion with `credit_consent: yes` often
ends up on both.

**Multi-item submissions get split.** If one email's `suggestion` text bundles
several distinct asks (e.g. "add a map, mention bus stops, warn about bears..."),
don't track it as one lump row — list the feedback entry once (date, article,
source, submitter, original text), then break it into individually-numbered
action items underneath, each with its own status. If `credit_consent` is
`"yes"`, each *actioned* item counts as a separate entry toward that person's
tally on the About page's Contributors list — a 6-item submission where 4 items
get built is 4 credited contributions, not 1.

| Date | Article | Source | Submitter | Summary | Status | Notes |
|---|---|---|---|---|---|---|
| 2026-07-13 | First Week Checklist | Senpai | Adithya | City-office staff visit campus for registration | Actioned | Backfilled — live in file since 2026-07-14, not logged at the time |
| 2026-07-13 | First Week Checklist | Senpai | Adithya | Bank staff visit campus for scholarship account setup | Actioned | Backfilled — live in file since 2026-07-14 |
| 2026-07-18 | SIM & Internet Setup | Senpai | Sree (consent: yes; DXP, Class of 2026, India) | Add eSIM/Trip.com option (~¥1000/mo or ¥14/day/GB) | Actioned | New "eSIM (Pre-Arrival Option)" bullet added under Airport (Immediate Options); credited on About page |
| 2026-07-18 | How to Use This Wiki (new-page mode) | Self-test | Terwadkar Apoorv Rajiv | Joke text, not a real suggestion | Skipped | Also the submission that surfaced the passage-field bug below |

**2026-07-18 — MyKouhai! Wiki (homepage) — Senpai — koshoi_k** (real name
Koshoi, MBA, Class of 2027, Kyrgyzstan, provided by the maintainer
2026-07-19; credited on
the About page for the 2 actioned items below)
Original text: map of IUJ and the city, bus stops and schedule, mention it's okay
to ask senpais for help/advice, don't forget the bear warning, mention winter is
hard and summer is hot, add photos in general.
Action items — resolved 2026-07-19, checked each against existing content first:
1. IUJ + city map — **Skipped.** Google Maps app coverage (with an offline-map
   tip) already exists in `Useful Apps in Japan — Maps, Transit,
   Translation.md`; no custom map graphic exists or is needed.
2. Bus stops/schedule — **Skipped.** `Bus & Local Routes.md` already exists,
   fact-checked, `ready`. Homepage now links to it directly (see item 3).
3. "It's okay to ask senpais for help" encouragement blurb — **Actioned.**
   Added as a welcoming line on the homepage (`content/index.md`), above the
   Pinned list, linking to `Bus & Local Routes` and `Useful Apps`.
4. Bear warning — **Actioned.** Was a genuine gap (zero coverage anywhere).
   Added as a new bullet in `Seasons & Weather — Month by Month.md`'s
   "Niigata-Specific Notes" section, alongside the existing avalanche/
   earthquake risk bullets — spring/autumn bear activity, not a daily
   campus concern.
5. Winter/summer hardship note — **Skipped.** Already thoroughly covered in
   `Seasons & Weather — Month by Month.md` (Month by Month + Key Weather
   Survival Points) and in the Winter/Spring term-wise advice articles.
6. More photos in general — **Stays Backlog.** No image-asset pipeline
   exists; needs actual senior-submitted photos, not something to generate.
Needs a decision (still open): homepage blurb vs. verify-and-link existing
articles, before any of these six get built.

**Bug found via the Self-test row above, fixed 2026-07-18:** the "new page"
mode's payload used to include a `passage` field carrying whatever text was
selected on the page *before* the modal opened — the field was hidden via CSS in
new-page mode but its value was never cleared, so new-page emails could show
stray, unrelated passage text. Edit-mode emails didn't have this problem (an
empty passage there is a legitimate "nothing selected", not stale data).
Fixed in `quartz-plugins/suggest-edit/src/components/SuggestEdit.tsx` by
omitting `passage` from the payload entirely when `mode === "new"`, rather than
just clearing the textarea — the field isn't structurally meaningful for a
new-page ask. Rebuilt via `npm run build` in that package (dist/ is committed,
not gitignored — always rebuild after editing src/).

**Process for handling new submissions** (see also §7 for the decision rules):
1. Scan `~/Downloads/Mail/IUJ/MyKouhai! Wiki/` for new `.eml` files, skipping
   known test/setup noise (subjects containing "Activate FormSubmit",
   "rate-limit test", "diagnostic", "hashed endpoint test", "PROD origin test",
   "TEST —").
2. Parse with Python's `email` module (handles base64 MIME bodies correctly).
3. Check the table above by article/date/submitter; skip anything already
   logged.
4. Decide per §7, act if it's a clear edit, then add a row here — don't leave
   it untracked even if the decision is "skip."
