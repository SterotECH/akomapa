# Feature F06 — CSV/Excel Bulk Import

SRS: FR-1.3, FR-2.2. Status: Draft.

## Overview

Bulk entry for the catalog and for stock. Imports are validated, produce an
error report for rejected rows, and never apply rows silently (FR-1.3).

## Requirements

| ID | Requirement |
| --- | --- |
| FR-1.3 | Bulk import of products via CSV/Excel, with validation and an error report for rejected rows. |
| FR-2.2 | Bulk stock updates via CSV/Excel import. |

## Flows

### Product import
1. Owner opens Products → "Import".
2. Downloads the template (or uses a formatted file).
3. Uploads `.csv`/`.xlsx` (≤ 2,000 rows).
4. System validates headers, then each row (upsert by SKU).
5. Result screen: counts (imported / updated / rejected) + per-row error report
   (row number, field, reason).
6. Valid rows are applied; invalid rows are listed for correction.

### Stock import
1. Owner opens Stock → "Bulk receive".
2. Uploads file with SKU-or-barcode, quantity, optional note/date.
3. Each valid row creates a `restock` movement (FR-2.2).
4. Unknown SKU/barcode or quantity ≤ 0 rows are rejected in the report.

## Rules & edge cases

- Shared validation rules with F02/F03; duplicate SKUs/barcodes in-file or
  in-catalog are rejected per row (V1, V2).
- An entirely invalid file applies nothing and reports all rows.
- Partial-file semantics: valid rows apply, invalid rows reported (no silent
  partial writes, no whole-file rollback).
- Excel `.xlsx` only (no legacy `.xls`).

## Acceptance criteria

1. Valid product file imports/updates all rows with correct counts.
2. File with a bad header is rejected up front with a clear message.
3. Rows with duplicate SKU or in-use barcode appear in the error report with a
   reason, and valid rows still apply.
4. Stock import creates restock movements and updates Stock On Hand.
5. Unknown SKU/barcode rows are reported and skipped.
