#!/usr/bin/env python3
"""Generate static redirect pages for old URLs, as a post-build step.

Run AFTER `npx quartz build` (writes directly into public/, not content/).

Background: this repo used to preserve old URLs via `aliases:` frontmatter
(the alias-redirects Quartz plugin). That broke site-wide internal
navigation -- the note-properties plugin pushes every alias into Quartz's
global slug list, which the shortest-link-resolution strategy uses to
match bare [[Title]] wikilinks. Since a folder-only move keeps the same
filename, the alias and the real new slug shared a basename, so every
moved article had two colliding candidate matches and link resolution
fell back to a broken guess. See commit "Fix broken internal navigation:
remove aliases: frontmatter (live-site bug)" (2026-07-31) for the full
root-cause writeup.

This script reproduces the same redirect *behavior* (a small HTML page at
the old URL with a meta-refresh to the new one) without touching Quartz's
content pipeline at all, so it can never cause that collision again --
the redirect pages are generated straight into `public/` after Quartz has
already finished building and resolving every link.

Manifest: redirect-manifest.json in this same directory, mapping
old-slug -> new-slug (no leading/trailing slashes, no .html extension).
Regenerate the manifest by hand when adding new redirects -- there's no
automatic way to know an "old" slug once the aliases: mechanism is gone,
so this is intentionally a static, manually-maintained list going
forward, not a live mechanism.
"""
import json
import pathlib
import sys

SCRIPT_DIR = pathlib.Path(__file__).parent
MANIFEST_PATH = SCRIPT_DIR / "redirect-manifest.json"


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: generate-redirects.py <path-to-public-dir>", file=sys.stderr)
        sys.exit(1)

    public_dir = pathlib.Path(sys.argv[1])
    if not public_dir.is_dir():
        print(f"error: {public_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    written = 0
    skipped = 0
    for old_slug, new_slug in manifest.items():
        target_html = public_dir / f"{new_slug}.html"
        if not target_html.exists():
            print(f"warning: skipping {old_slug!r} -> {new_slug!r}, target page not found", file=sys.stderr)
            skipped += 1
            continue

        redirect_path = public_dir / f"{old_slug}.html"
        redirect_path.parent.mkdir(parents=True, exist_ok=True)

        depth = old_slug.count("/") + 1
        relative_target = "../" * (depth - 1) + new_slug if depth > 1 else new_slug

        redirect_path.write_text(
            f"""<!DOCTYPE html>
<html lang="en-us">
<head>
<title>{old_slug}</title>
<link rel="canonical" href="{relative_target}">
<meta name="robots" content="noindex">
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url={relative_target}">
</head>
</html>
""",
            encoding="utf-8",
        )
        written += 1

    print(f"Generated {written} redirect pages ({skipped} skipped, target not found)")


if __name__ == "__main__":
    main()
