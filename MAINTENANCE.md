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
`home-search`, or `close-nav-on-outside-tap` — these are custom-written, not
downloaded, so they live in the repo itself and get git-tracked) — a plain edit to
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
- **name** — optional
- **country** — optional
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
   see §15 for where that section will live once built (not live yet as of this
   writing — keep a running note of who consented until it exists).
5. If it needs more info: email them back at `reply_email`.
6. If it's spam/junk: ignore and delete. The honeypot field filters most bots, but a
   determined human can still submit garbage — no automated moderation beyond that.

There's no dashboard or queue — it's just your inbox. If volume grows large, filter on
subject `Kouhai Wiki suggestion:` (edits) or `Kouhai Wiki new page suggestion` (new
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

- **About page — Contributors list.** Plan: an "about me" blurb on
  `content/00_About Wiki/index.md`, plus a **Contributors** section listing everyone
  who's submitted a suggestion with `credit_consent: yes` (§7), by name, with their
  contribution count in brackets (e.g. `Jane Doe (3)`) — optionally grouped by
  graduating class using the `grad_year` field already collected on the form. This
  is **manually maintained** (there's no database to automate it from — Formsubmit
  only emails submissions, nothing is logged anywhere queryable), so it's on
  whoever's maintaining the site to keep a running tally as suggestions come in and
  periodically update the page.
- **Fact-check remaining sections** against source material (official IUJ emails/
  documents) — Legal/Administrative, Finance/Banking, and Health/Wellness were
  checked and corrected in July 2026; Academics, Daily Life, Social Life & Culture,
  Travel & Leisure, and IT & Productivity have not been checked yet.
- **iOS-specific behavior parity check** — confirm mobile nav, search overlay,
  breadcrumbs, and the suggest-edit modal all behave identically on iOS Safari as on
  Android/desktop browsers. Not yet done.
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
- **Reconcile stale duplicate files** — `CHANGELOG.md`/`CONTRIBUTING.md`/
  `CODEOWNERS` exist both in this repo and, as older copies, in the separate
  project-management folder (`~/Documents/Claude/Projects/Kouhai Wiki/`, not a git
  repo). They've drifted out of sync. Worth a cleanup pass to decide which folder is
  the source of truth and stop duplicating.
