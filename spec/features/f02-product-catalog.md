# Feature F02 — Product / Catalog Management

SRS: FR-1.1, FR-1.2, FR-1.4. Status: Draft.

## Overview

The Owner manages a finite catalog of products. Products carry name, SKU,
optional barcode, category, unit, cost price, selling price, and reorder
threshold. Duplicate SKUs and duplicate barcodes are prevented. Products are
deactivated (never deleted) so history stays intact (domain §3).

## Requirements

| ID | Requirement |
| --- | --- |
| FR-1.1 | Create, edit, deactivate products with: name, SKU/code, barcode (optional), category, unit, cost price, selling price, reorder threshold. |
| FR-1.2 | Prevent duplicate SKUs and duplicate barcodes within the catalog. |
| FR-1.4 | Assign a product's barcode by scanning into the barcode field, or by typing manually. |
| NFR-1 | Search/autocomplete under 1s for catalogs up to 2,000 products. |

## Flows

### Create product (happy path)
1. Owner opens Products → "Add product".
2. Fills form: name, SKU, unit, prices (GHS), threshold, optional category + barcode.
3. Saves → product appears in catalog with 0 stock.
4. Optional: barcode assigned by focusing the barcode field and scanning
   (keyboard-wedge input auto-fills, FR-1.4), or typed manually.

### Edit / deactivate
1. Owner opens a product → Edit.
2. Fields update in place; SKU/barcode uniqueness re-validated (FR-1.2).
3. Deactivate hides the product from POS and new sales; it remains visible in
   Products (marked inactive) and in all history.

## Rules & edge cases

- **Uniqueness (V1, V2):** `sku` unique always; `barcode` unique when non-null.
  Duplicates rejected with a field-level error.
- **Deactivated product:** cannot be added to a new sale; existing movements and
  line items remain intact via `product_snapshot`.
- **Bulk entry:** CSV/Excel import is a separate flow (F06) but shares the same
  validation rules.
- **Prices:** entered as GHS decimal, stored as integer pesewas (ADR-0006);
  negative prices rejected.

## Acceptance criteria

1. Create, edit, and deactivate all succeed for valid input.
2. Creating a product with an existing SKU fails with a clear error.
3. Creating a product with an existing barcode fails with a clear error.
4. Deactivated products disappear from POS search within the same render cycle.
5. Barcode field accepts either keyboard scan input or typed characters (FR-1.4).
6. Product search returns results in under 1s at the 2,000-product cap (NFR-1).
