---
title: About Wiki
---

About this wiki: how it's organised, how to use it, and how to contribute.

## About Wiki

<div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">

<img src="images/about-wiki/appu-dr-pepper.png" alt="Cutout illustration of Apoorv in a white lab coat, mid dance move" width="180" style="flex: 0 0 auto; width: 180px; max-width: 40%; height: auto;">

<div style="flex: 1 1 18rem; min-width: 0;">

Hi fellow IUJer! Apoorv here! Better known on campus as Dr. Pepper, or just Appu.
Class of 2027.

This wiki started as a personal project to see if I could simplify looking up
information about IUJ, without having to navigate their extensive but somewhat
confusing digital home.

</div>

</div>

This project, while developed by me, would not have been possible without the
extensive volunteering efforts of your senpais. Because that was always the plan:
leaving behind a legacy for our future kouhais, for generations to come.

If you ever feel lonely, remember that these people are all with you, in mind and
spirit.

## Senpai Contributors

Everyone listed here helped make this wiki better by submitting a suggestion through the site.

- **Koshoi** (7): MBA, Class of 2027, Kyrgyzstan
- **Namra Mehta** (5): MBA, Class of 2027, India
- **Adithya** (3): MBA, Class of 2026, India
- **Sree** (1): DXP, Class of 2026, India

<!--
  TODO (fill in yourself, as suggestions come in):
  - Manually maintained list, NOT automated: there's no database, Formsubmit
    just emails suggestions (see MAINTENANCE.md §7 for the workflow: when a
    submission has credit_consent: yes, add the person here)
  - Format: Name (contribution count), e.g. "Jane Doe (3)"
  - Once there are enough entries per class to justify it, group under
    `### Class of YYYY` headings using the grad_year field collected on the
    suggest-edit form. A flat list is fine until then.
  - Counts come from `suggestions-log.csv`, counting only rows whose
    credit_consent is "yes". Rebuild them rather than incrementing by hand:
      python3 -c "import csv,collections; \
        print(collections.Counter(r[3].strip() for r in \
        list(csv.reader(open('suggestions-log.csv')))[1:] \
        if r[4].strip().lower()=='yes').most_common())"
    Note the log uses submitter handles ("koshoi_k"), while this list uses
    real names, so map them by hand.
  - Adithya is listed but has no credit_consent: yes row in the log. Kept
    on the maintainer's word; confirm before the next audit.
  - The maintainer's own submissions are deliberately excluded.
  - Last updated 2026-09-11
-->
