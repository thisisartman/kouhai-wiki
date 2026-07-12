# Maintenance Manual — MyIUJ! Kouhai Wiki

Operational reference for whoever maintains this site. Written after the initial
build-out (July 2026). If something here goes stale, fix the doc, not just the site.

---

## 1. The Big Picture

```
 Obsidian vault (personal drafting copy)
 ~/Documents/Obsidian Vaults/ARTman's Vault/IUJ/Indojins/Wiki/
              │
              │  NOT auto-synced — copy manually (see §3)
              ▼
 Quartz repo content/  ◄── THIS is what the live site is built from
 ~/Documents/Quartz/content/
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

**The one thing to never forget:** editing a file in the Obsidian vault does **not**
touch the live site. Until May 2026 `content/` was a symlink to the vault, so edits
were instant — that's gone. Since July 2026, `content/` holds real files committed to
git, and the vault is just wherever you like to draft. If you edit the vault and forget
to copy the change into `content/`, the live site silently keeps the old version. (This
bit us once already — see the note in `.claude`/session history from 2026-07-12.)

---

## 2. Local Preview (before publishing anything)

```bash
cd ~/Documents/Quartz
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

before `quartz build` — plugin sources live in the gitignored `.quartz/` cache and
won't exist on a clean clone.

---

## 3. Editing an Existing Article

**Option A — edit directly in the repo (simplest, recommended for quick fixes):**

```bash
cd ~/Documents/Quartz/content
# edit the .md file directly — e.g. content/07_Daily Life/Waste Disposal & Recycling.md
```

**Option B — draft in Obsidian, then sync:**

1. Edit the file in the Obsidian vault as usual.
2. Copy it into the repo:
   ```bash
   cp "/home/artman/Documents/Obsidian Vaults/ARTman's Vault/IUJ/Indojins/Wiki/<path>/<file>.md" \
      "/home/artman/Documents/Quartz/content/<path>/<file>.md"
   ```
   Match the folder path exactly — sections are numbered folders like `07_Daily Life/`.

Either way, after editing:

```bash
cd ~/Documents/Quartz
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
3. Link it from somewhere (its section's folder gets an auto-generated listing already —
   no extra step needed for that). To hand-link from another article, use a wikilink:
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
4. Numeric prefix (`14_`) controls sidebar order — the explorer sorts by the raw
   slug, not the display name, so sections stay in reading order (see
   `quartz.config.yaml`, the `sortFn` under the `explorer` plugin, if this ever needs
   revisiting).

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
cd ~/Documents/Quartz/content
git mv "07_Daily Life" "07b_Daily Life"   # or fully renumber the affected folders
```

If you're renumbering several sections to make room, do all the folder moves in one
commit so the sidebar order and the homepage list (`content/index.md`) don't drift out
of sync with each other.

**Moving an article to a different section:**

```bash
cd ~/Documents/Quartz/content
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

Every suggestion arrives in the maintainer's inbox (the address currently wired to the
hashed Formsubmit endpoint — see §9) as a table-formatted email from Formsubmit,
containing:

- **article** — which page it's about
- **page_url** — direct link to that page
- **passage** — the text the reader selected (may be blank)
- **suggestion** — what they think should change, and why
- **reply_email** — their `@iuj.ac.jp` address (required, validated client-side)
- **name** — optional

Workflow:
1. Read the suggestion, judge it.
2. If it's good: edit the article per §3, commit, push. Done — no need to reply unless
   you want to (their email address is right there if you do).
3. If it needs more info: email them back at `reply_email`.
4. If it's spam/junk: ignore and delete. The honeypot field filters most bots, but a
   determined human can still submit garbage — no automated moderation beyond that.

There's no dashboard or queue — it's just your inbox. If volume grows large, filter on
subject `Kouhai Wiki suggestion:` in Gmail.

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

---

## 9. Changing the Suggest-an-Edit Destination Email

The button POSTs to a Formsubmit **hashed alias** (keeps the address off the page):

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
| `.github/CODEOWNERS` | PR review routing |
| `CONTRIBUTING.md` | Public-facing contributor guide |
| `quartz-plugins/suggest-edit/` | The "Suggest an edit" button + modal (local plugin, pre-built dist committed) |

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
