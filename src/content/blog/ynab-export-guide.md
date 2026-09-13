---
title: "How to export your YNAB data (and what's missing from the export)"
seoTitle: 'How to Export YNAB Data to CSV (Plan, Transactions, Targets) — 2026'
description: 'Step by step: where YNAB hides Export Plan, the two CSV files column by column, how to save the targets left out, and opening them in Excel or Sheets.'
standfirst: "In YNAB's web app, click your plan's name at the top of the left sidebar and choose Export Plan. Your plan, month by month, and every transaction come out as two CSV files (TSV if your currency uses a decimal comma). Targets and category notes are not in them — how to save those by hand is below."
published: 2026-08-16
updated: 2026-09-14
sourcesCheckedOn: 2026-09-14
howTo:
  name: 'Export your plan and all transactions from YNAB'
  steps:
    - name: 'Open YNAB in a web browser.'
      text: 'Exporting is only available in the web version of YNAB, not in its apps.'
    - name: 'Click the name of your plan.'
      text: 'It sits at the top of the left sidebar. It is a menu, even though it does not look like one.'
    - name: 'Choose Export Plan.'
      text: 'It is in the drop-down menu that opens under the plan name.'
    - name: 'Save the download.'
      text: 'Its name starts with “YNAB Export -” and your plan’s name. Your plan and your transaction history come as two separate files: CSV, or TSV (tab-separated) for currencies that use a comma for decimals.'
---

## What is NOT exported (targets, category notes, photos)

[YNAB's own help page](https://support.ynab.com/en_us/how-to-export-plan-data-Sy_CouWA9)
says it in one line: the export "does not include targets or category notes". Photos are not in it either — YNAB lets you download them
one at a time, never in bulk. If any of these matter to you, save them
**before** you close the account. Afterwards there is nothing left to export
them from.

**Targets.** Go through your plan one category at a time and write down what
each target asks for: the amount, and the date or rhythm it works to. The
plan file from the export is a good place for it — open it in a spreadsheet,
add a *Target* column, and fill it in by hand. It takes one sitting, and it is
the only record of those decisions you will keep.

**Category notes.** Same spreadsheet, one more column. Copy each note across
while you are going through the categories anyway.

**Photos.** In the account register, click the photo on a transaction and
choose **Download Image**. There is no faster way.

**Scheduled transactions.** YNAB's help pages do not say whether they come out
with the rest, and we could not confirm it either way. Note each one before you
leave — payee, amount, how often and the next date — so you can set it up again
wherever you go.

**Reports.** Reflection data — Spending Breakdown, Spending Trends, Income v
Expense and Net Worth — has its own export in YNAB and is not part of this one.

## What is in the two files

One file is your **plan**: a row for every category in every month. The other
is your **register**: a row for every transaction. The first column tells them
apart — `Month` in the plan, `Account` in the register.

The headings below come from a real YNAB export made in August 2026. YNAB's
help page does not list them, and they have changed before — older exports
called the plan's `Assigned` column `Budgeted` — so if your file disagrees with
this table, your file is right.

### The plan file

| Column | What is in it |
|---|---|
| `Month` | The month, written like `Aug 2026` |
| `Category Group/Category` | The group and the category, joined with a slash |
| `Category Group` | The group on its own |
| `Category` | The category on its own |
| `Assigned` | What you assigned to the category that month |
| `Activity` | What moved through it that month; spending shows as negative |
| `Available` | What was available in it for that month |

### The register file

| Column | What is in it |
|---|---|
| `Account` | The account the transaction belongs to |
| `Flag` | The flag colour, if you set one; otherwise empty |
| `Date` | The date — month first in the export we checked: `09/14/2026` |
| `Payee` | Who was paid, or who paid you |
| `Category Group/Category` | The group and the category, joined with a slash |
| `Category Group` | The group on its own |
| `Category` | The category on its own |
| `Memo` | Your memo, if you wrote one |
| `Outflow` | Money out, as a positive amount |
| `Inflow` | Money in, as a positive amount |
| `Cleared` | The transaction's cleared status |

Two things about the register catch people out.

**Money in and money out are separate columns.** A spend has its amount in
`Outflow` and zero in `Inflow`. For one signed figure per row, calculate
`Inflow − Outflow`.

**Every transfer appears twice**, once from each account, with a payee that
reads `Transfer : ` followed by the other account's name. Totals across all
your accounts come out right, because the two halves cancel. Totals of spending
do not, unless you leave those rows out.

## Exporting only some transactions

For tax season, or for one account, YNAB can export a selection instead:

1. Open an account, or **All Accounts**, from the left sidebar.
2. Tick the checkbox beside each transaction you want — or search and filter
   first, then tick the checkbox in the table header to select everything
   showing.
3. Click **More** in the action bar that appears, then **Export # Transactions**.

That file's name starts with "Selected Transactions for" and your plan's name.

## Opening the files in Excel or Google Sheets

**Import them rather than double-clicking.** A double-click lets the
spreadsheet guess the separator and the dates, and it can guess wrong. Use
**File → Import** in Google Sheets, or the text/CSV import on Excel's **Data**
tab, so you get to choose.

**If everything lands in one column, the file is tab-separated.** YNAB writes
TSV for currencies that use a comma for decimals. Choose *Tab* as the
separator.

**Check which way round the dates are.** In the export we checked they were
month first. A spreadsheet set to a region that writes the day first will read
`03/04/2026` as the 3rd of April instead of the 4th of March — silently, for
every date where both numbers are 12 or under. Look for a date with a number
above 12 to be sure, then set the import to match or keep the column as text.

**Amounts carry the currency sign.** In the dollar export we checked, each one
had its dollar sign attached, with no thousands separator, and a negative put
the minus in front of the sign. A spreadsheet set to another currency may take
them for text: find the sign, replace it with nothing, and format the column as
numbers.

**Use `Category Group` and `Category`, not the joined column.** A category name
can contain a slash of its own, so splitting `Category Group/Category` on the
slash can cut in the wrong place.

**If you read them with a script**, expect a byte-order mark in front of the
first heading, so the first column may not match `Account` or `Month` exactly.

**Keep a copy somewhere that is not a budgeting app.** Two plain text files will
still open in thirty years, which is more than anyone can promise about an
account on a service.

## Importing the export into another budget app

Any importer is somebody's reading of this format, ours included. The question
to ask a new app is not "can it import YNAB" — everything says yes — but "will
it show me what it made of my numbers before it saves them?"

Fundkeep reads both files, rebuilds your categories, accounts and history, and
shows you every difference between its balances and YNAB's before anything is
saved — [more on that for people leaving YNAB](/ynab-alternative).
