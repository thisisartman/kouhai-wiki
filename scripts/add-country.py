#!/usr/bin/env python3
"""Usage: add-country.py <Country> [<Country> ...]

Creates `content/04_Country-Specific/<Country>/index.md` for each country
named, using the standard country-section template (MAINTENANCE.md §17).

Idempotent: a country that already has an index.md is skipped, never
overwritten, so this is safe to re-run over the whole list.

Run from the repo root. After running, add the country to the list in
`content/04_Country-Specific/index.md` by hand — that list is ordered and
annotated, so it is deliberately not generated.

Why one page and not three: the older three-page-per-country template
(Festivals / Community / Cultural Information) produced six pages across
India and Kyrgyzstan and all six are still `draft: true` and invisible.
A page nobody can see recruits nobody, and recruiting the student who can
write it is the only way this section ever fills in. See §17.
"""
import pathlib
import sys

BASE = pathlib.Path("content/04_Country-Specific")

TEMPLATE = """---
title: {country}
section: 04_Country-Specific/{country}
tags: [{tag}, country-specific, needs-input]
status: needs-work
last_updated: {today}
---

Nobody from {country} has written this section yet. If you came to IUJ from
{country}, this page is yours.

> 🔶 **This page is a request, not an article.** Everything below is a
> prompt with nothing behind it. No official source can answer these
> questions and no amount of research fills them in; only someone who has
> actually made the move from {country} knows the answers.

---

## What's worth writing down

**Before you flew.** What did you pack that turned out to matter, and what
did you carry all this way for nothing? Anything about the visa, the CoE, or
the flight that was specific to leaving {country}?

**Food from home.** Which ingredients you can get in Minami-Uonuma, which
need a trip to Niigata City or Tokyo, and which you should simply bring in
your suitcase. See [[Indian Food Sources]] for the shape this takes once
it is filled in.

**Festivals and celebrations.** Which ones matter, roughly when they fall,
and whether anyone at IUJ marks them. If a celebration has happened on
campus before, how it got organised is the useful part.

**Community at IUJ.** Is there a group chat, an informal crowd, or a student
association? How would a new arrival find it in their first week?

**Things everyone else should know.** Greetings, food restrictions, or
customs that classmates and dorm neighbours get wrong without meaning to.

**Money and calling home.** Anything about remittances or phone plans that
is particular to {country} and not already covered in
[[Sending Money Home]].

---

## Adding something

You do not need to write the whole page, and you do not need to write it
well. One paragraph on one of the prompts above is genuinely useful, and it
will be edited into shape for you. Click **✏️ Suggest an edit** near the
title of this page.

If your country is missing from this section entirely, use the same button
on any page here and it will be added.

---

## Related Articles
- [[First Week Checklist]]
- [[Making Friends]]
- [[Sending Money Home]]

---

## 🗣️ Senior Submissions
> *Have a tip, correction, or experience to add? Click **✏️ Suggest an edit** near the title.*
"""


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)

    if not BASE.is_dir():
        raise SystemExit(
            f"{BASE} not found — run this from the repo root, not scripts/"
        )

    # Written into `last_updated:`. Imported here rather than at module level
    # so the docstring stays the first thing a reader hits.
    from datetime import date

    today = date.today().isoformat()

    created = 0
    for country in sys.argv[1:]:
        path = BASE / country / "index.md"
        if path.exists():
            print(f"skip (exists): {path}")
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        # Tag is lowercase with hyphens stripped, so "Timor-Leste" tags as
        # "timorleste" and does not collide with Quartz's tag slugging.
        tag = country.lower().replace("-", "").replace(" ", "")
        path.write_text(
            TEMPLATE.format(country=country, tag=tag, today=today),
            encoding="utf-8",
        )
        print(f"created: {path}")
        created += 1

    print(f"\n{created} created, {len(sys.argv) - 1 - created} skipped")
    if created:
        print("Now add the new countries to content/04_Country-Specific/index.md")


if __name__ == "__main__":
    main()
