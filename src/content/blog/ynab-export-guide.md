---
title: 'YNAB export: a full guide'
description: 'Where YNAB''s export lives, what the two files contain column by column, and what to watch for when you open them in a spreadsheet or another app.'
standfirst: 'Your budget is your record of your own money. Here is exactly what comes out of YNAB when you ask for it back, and what each column means.'
published: 2026-08-16
sourcesCheckedOn: 2026-08-16
---

People usually look this up at a particular moment: they have decided to leave,
or they are doing their taxes, or they have just realised that years of their
own financial history live somewhere they do not control. The question underneath
all three is the same — **can I get it out, and is what comes out any use?**

Short answer: yes, and yes. Here is what to expect.

## Where the export is

Exporting is a **web app** job. Sign in on a computer rather than reaching for
the phone app — YNAB's own help pages for exporting describe the web app, and
that is where the menu item lives.

Open the plan you want, then **click its name at the top of the left sidebar**.
That name is a menu, which is the part people miss: it does not look like one.
In the drop-down you will find **Export Plan**.

If the menu says **Export Budget** instead, nothing is wrong — YNAB renamed
budgets to plans, and which word you see depends on when you are reading this.
The item is in the same place either way. YNAB's own page on it is
[Exporting Plan Data in YNAB](https://support.ynab.com/en_us/how-to-export-plan-data-Sy_CouWA9),
and it is worth a glance because their labels move and this article does not.

There is a second export worth knowing about: select some transactions in the
register and you are offered **Export _n_ Transactions**, which gives you just
those. Useful at tax time, no use at all for moving house.

## What you get

Two files, named after the plan and the day you asked:

```
My Budget as of 2026-08-15 - Register.csv
My Budget as of 2026-08-15 - Budget.csv
```

Two files is all there is. They are comma-separated, or **tab**-separated for
currencies that use a comma as the decimal separator — the extension may still
say `.csv`, so if a spreadsheet opens it as one long column, that is why. Tell
the import dialog the separator is a tab.

### Register.csv — every transaction

One row per transaction. These are the columns that carry the history, and the
ones our own importer reads by name:

| Column | What is in it |
|---|---|
| Account | The account name as you typed it |
| Date | The transaction date |
| Payee | Who it went to |
| Category Group | The group the category sits in |
| Category | The category |
| Category Group/Category | Both, joined — a convenience column |
| Memo | Your note |
| Outflow | Money out, as a positive number |
| Inflow | Money in, as a positive number |
| Cleared | `Uncleared`, `Cleared` or `Reconciled` |

Your file may carry more columns than these — YNAB has added some over the
years. That is not a problem for anything that looks columns up by their
heading rather than by counting from the left, which is worth knowing if you
are writing a formula: insert a column upstream and position-based formulas
break silently.

Three things about that table catch people out.

**Outflow and Inflow are two columns, not one signed one.** A spend is a
positive number in Outflow and an empty or zero Inflow. If you are summing this
in a spreadsheet, you want `Inflow − Outflow`, not a sum of one column. Anything
that reads the file has to do the same, and an importer that reads only one of
them will be wrong about half your history.

**Transfers appear twice, once from each side**, and the payee reads
`Transfer : Some Account`. That is not a payee called Transfer — it is the other
end of the move. Sum the file naively and transfers count twice; treat the two
rows as one movement and the totals come out right.

**Dates in the exports we have worked with are month/day/year.** Check yours
before a spreadsheet quietly reads 03/04 as the fourth of March.

### Budget.csv — what you assigned, month by month

One row per category per month:

| Column | What is in it |
|---|---|
| Month | The month, like `Aug 2026` |
| Category Group | The group |
| Category | The category |
| Budgeted | What you assigned to it that month |
| Activity | What moved through it that month |
| Available | What was left at the end of it |

This is the half people forget to keep. The register says what you spent;
this file says what you had *decided*, month after month, which is the actual
record of how you have been budgeting. If you only keep one file, keep both.

## What to do with it once you have it

**Keep a copy somewhere that is not a budgeting app.** Two CSV files are small
enough to live in the same folder as your tax records, and they will still open
in thirty years, which is not something anyone can say about an account on a
service.

**Open it in a spreadsheet before you trust anything else with it.** Sort the
register by date and look at the oldest rows: that is where truncation and
date-format mistakes show up first.

**If you are moving to another app, expect to check its arithmetic.** Any
importer is somebody's reading of a file format, including ours. The question
to ask a new app is not "can it import YNAB" — everything says yes — but "will
it show me what it made of my numbers before it commits them?"

## Bringing it into Fundkeep

That last question is one we have to answer about ourselves, so: Fundkeep reads
both files, rebuilds your categories, accounts and history from them, and then
shows a **reconciliation report** — what YNAB said each balance was, what
Fundkeep makes it, and every difference it found. You read the differences and
decide. Nothing is saved until you do.

We would rather show you a list of disagreements than a green tick, because a
green tick from an importer is a claim, and a list of differences is evidence.

If you want the rest of it — what Fundkeep is, what it costs, and what you give
up by moving — that is on [the page for people leaving YNAB](/ynab-alternative).
And whatever you decide, take the export. It is your record either way.
