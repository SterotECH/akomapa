# Feature F04 — Mini POS (Sales Recording)

SRS: FR-3.1–FR-3.5, NFR-1, NFR-2, NFR-8. Status: Draft.

## Overview

The POS screen is the primary daily surface. The Owner starts a new sale, adds
products by search/autocomplete or barcode scan, adjusts quantities (and
optionally unit prices), and completes the sale. Completed sales are recorded
permanently and can be voided the same day with stock restored.

## Requirements

| ID | Requirement |
| --- | --- |
| FR-3.1 | Start a new sale, add products by name/SKU search or barcode scan, set quantity, complete the sale. |
| FR-3.2 | Fast product search/autocomplete (name or SKU) as the default entry; barcode scan as the faster optional path. |
| FR-3.2a | When a barcode scanner is used, detect the scanned input (keyboard-wedge) and add the matching product automatically, without extra button presses. |
| FR-3.3 | Calculate line totals and sale total automatically from catalog prices, with per-line price override when permitted. |
| FR-3.4 | Record each completed sale with timestamp, items, quantities, unit prices, and total. |
| FR-3.5 | Void/reverse a sale within the same day, restoring stock accordingly. |
| NFR-1 | Search/autocomplete < 1s for catalogs up to 2,000 products. |
| NFR-2 | Typical 3–5 item transaction completable in under 60s after basic training. |
| NFR-8 | Accept input from a standard USB/Bluetooth barcode scanner as keyboard-wedge, no driver. |

## Flows

### New sale (happy path)
1. Owner opens POS (default screen after login).
2. Type in the search box → autocomplete list of matching active products
   (name or SKU, NFR-1). Scan a barcode → product added instantly (FR-3.2a).
3. Tap a product (or its qty control) to add/increase a line; adjust quantity.
4. Optional: override a line's unit price (FR-3.3) — explicitly marked.
5. Review cart, sale total auto-calculated.
6. "Complete sale" → Sale + line items + `sale` movements written; stock
   decremented (FR-3.4, F03).
7. Receipt confirmation shown (print optional via F05 print path).

### Void sale (same day, FR-3.5)
1. From recent-sales view, open a sale recorded today.
2. Confirm void + reason.
3. Compensating `sale` movements (positive) restore stock; sale marked voided.

## Rules & edge cases

- **Default price (FR-3.3):** line uses catalog Selling Price. Overrides are
  per-line, recorded, and never mutate the catalog (domain V9).
- **Over-sell guard (NFR-3):** cart quantity per product validated against
  current `stock_on_hand`; blocked with an inline warning. Low-stock items are
  visibly marked during entry.
- **Scan detection (FR-3.2a):** a scan is detected as a fast keyboard burst
  ending in Enter/return and resolved automatically; manual typing never
  triggers an accidental add.
- **Unknown barcode:** scanned code not in catalog → audible/visual alert,
  prompt to create the product (optional).
- **Void window (V8):** only sales whose `sold_at` is today may be voided.
  Voided sales excluded from revenue reports (F05).
- **Empty cart:** Complete is disabled until at least one line.
- **Concurrency:** single-Owner local deployment; stock guard re-checked at
  submit time so two devices cannot oversell the same unit.

## Acceptance criteria

1. Search returns ≤ 2000-catalog results in under 1s (NFR-1).
2. Scanning a barcode adds the product with no click (FR-3.2a).
3. Line total = quantity × unit price; sale total = Σ line totals (V6).
4. Price override changes the line total and is recorded (V9).
5. Completing a sale decrements stock and writes one movement per line (F03).
6. A cart line exceeding stock is blocked with a warning (NFR-3).
7. Same-day void restores stock exactly and marks the sale voided (V4, V8).
8. A typical 3–5 item sale completes in under 60s (NFR-2).
