# Feature F05 — Reports (Printable)

SRS: FR-4.1–FR-4.4. Status: Draft.

## Overview

Three on-screen, printable reports built from live StockMovement and
Sale/SaleLineItem history (SRS §5 — no reporting database). All export to PDF
via the browser print dialog with a printable stylesheet (ADR-0004).

## Requirements

| ID | Requirement |
| --- | --- |
| FR-4.1 | Current Stock Levels report: all products, quantity on hand, value. |
| FR-4.2 | Low Stock report: products at or below reorder threshold. |
| FR-4.3 | Sales report for a selected date range: items sold, quantities, revenue, summary total. |
| FR-4.4 | All reports viewable on screen and exportable/printable as PDF. |

## Flows

### View & export a report
1. Owner opens Reports.
2. Selects report (Stock Levels / Low Stock / Sales).
3. For Sales: picks `from`/`to` date range (default today).
4. Reads the on-screen table; presses "Print / Save as PDF".
5. Print dialog → PDF; navigation/sidebar/buttons hidden in print output.

## Report contracts

Exact columns, ordering, and totals are pinned in
`/spec/interfaces/report-contracts.md` — changes there must be mirrored here.

### Key rules
- **Sales revenue** counts only non-voided sales; voided sales listed
  separately (reconciliation).
- **Low Stock** = `stock_on_hand ≤ reorder_threshold`, sorted by shortfall
  descending.
- **Stock Levels** carries grand totals for cost value and selling value.
- All monetary values formatted as GHS from integer pesewas (ADR-0006).

## Acceptance criteria

1. Stock Levels lists every product with on-hand and value, with grand totals (FR-4.1).
2. Low Stock lists exactly the products at/below threshold, most urgent first (FR-4.2).
3. Sales report filters correctly by range and sums non-voided revenue (FR-4.3).
4. Each report renders on screen and prints to PDF with chrome hidden (FR-4.4).
5. Print output is readable on paper (tabular, header with shop name/date).
