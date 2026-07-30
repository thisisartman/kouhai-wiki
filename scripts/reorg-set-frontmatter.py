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
