# Contributing to the IUJ Kouhai Wiki

Thanks for helping future kouhai! There are two ways to suggest changes — pick
whichever fits you.

## 1. Suggest an edit — no GitHub account needed

Every article has a **"Suggest an edit"** button. Click it, change the text, add
your name (optional) and a short note about what you changed, and submit. Your
suggestion is turned into a proposal for a maintainer to review — you don't need
a GitHub account or any git knowledge.

> This web editor is part of the wiki's suggestion pipeline. If the button isn't
> live yet, use option 2 below.

## 2. Edit on GitHub (needs a free GitHub account)

1. Open the article on the wiki, or find its file under `content/` in the repo:
   <https://github.com/thisisartman/kouhai-wiki>
2. Click the pencil icon (✏️) — GitHub forks the repo for you automatically.
3. Make your changes, write a short description, and click **Propose changes**.
4. Click **Create pull request**. A maintainer will review it.

### Git workflow (for the comfortable)

```bash
git clone git@github.com:thisisartman/kouhai-wiki.git
cd kouhai-wiki
git checkout -b fix/your-edit-description
# edit files in content/
git add . && git commit -m "fix: brief description"
git push origin fix/your-edit-description
# then open a PR on GitHub
```

## Branch rules

- `main` is protected — no direct pushes. Everything lands via reviewed PR.
- Feature branches are named `fix/description` or `add/description`.

## Review

- PRs touching a section are auto-assigned via [CODEOWNERS](.github/CODEOWNERS).
- Merged PRs deploy to the live site automatically.

## What makes a good edit

- Fix outdated info — deadlines, prices, contacts, procedures.
- Add things you wish you'd known as a new student.
- Prefer simpler, clearer language.
- Keep the frontmatter (`title`, and any `tags`/`status`) accurate.

## Please avoid

- Removing content without explaining why in the PR.
- Renaming files or moving folders without checking with a maintainer (it changes
  URLs and breaks links).
- Personal opinions — keep it factual and useful for future students.
