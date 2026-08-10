# Interface Contracts — Import / Export

> Bulk data entry via CSV/Excel files (FR-1.3, FR-2.2). Imports are the only
> supported file-based interfaces in v1. All imports validate rows, report
> rejected rows, and never partially apply a file silently.

## 1. Product Import (FR-1.3)

**Endpoint:** `POST /products/import`
**Template:** downloadable at `GET /products/import/template`.

### Columns

| Column | Required | Type | Rules |
| --- | --- | --- | --- |
| sku | yes | string | unique (domain V1); blank/invalid rejected |
| name | yes | string | non-empty |
| barcode | no | string | unique when non-empty (domain V2) |
| category | no | string | matched by name; created if new |
| unit | yes | string | e.g. piece, box, kg |
| cost_price | yes | number ≥ 0 | GHS (decimal); stored as pesewas (ADR-0006) |
| selling_price | yes | number ≥ 0 | GHS (decimal); stored as pesewas |
| reorder_threshold | no | integer ≥ 0 | default 0 |

### Semantics
- Files accepted: `.csv`, `.xlsx` (Excel). Size cap: 2,000 rows (catalog cap from NFR-1).
- **Mode:** upsert by `sku` — a row whose SKU already exists updates that Product (name, prices, threshold, unit); a new SKU creates a Product.
- Header row required; a column-name map is validated up front.

### Error report (all-rows report, no partial silence)
The response includes (or points to) a per-row report:
- Counts: total rows, imported, updated, rejected.
- For each rejected row: row number, column(s), reason (e.g. "sku duplicate within file", "barcode already in use by SKU X", "cost_price not a number").
- Rows in a file are validated independently; the file applies the valid rows and reports the invalid ones (FR-1.3).

## 2. Stock Import (FR-2.2)

**Endpoint:** `POST /stock/import`

### Columns

| Column | Required | Type | Rules |
| --- | --- | --- | --- |
| sku | yes (if no barcode) | string | must match an existing active product |
| barcode | yes (if no sku) | string | must match an existing product |
| quantity | yes | integer > 0 | units added (restock) |
| note | no | string | supplier note |
| occurred_at | no | date | default today |

### Semantics
- Every row creates a `restock` StockMovement (FR-2.2).
- Rejected rows: unknown SKU/barcode, quantity ≤ 0, or a product matched by both sku and barcode inconsistently.
- Same error-report shape as product import.

## 3. Data Backup Export (NFR-5)

**Endpoint:** `GET /backup/download`

- Produces a single portable file (SQLite database snapshot or an archival dump) that a non-technical owner can save to a USB drive.
- Includes all catalog, movement, sale, and user data.
- A short written backup routine is delivered to the client (see F07).
