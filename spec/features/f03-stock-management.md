# Feature F03 — Stock Management

SRS: FR-2.1, FR-2.3, FR-2.4, FR-2.5, FR-2.6. Status: Draft.

## Overview

Inventory changes only through **Stock Movements** (domain V5). The Owner
records stock received (restock), the system decrements stock on every sale,
flags products at or below their reorder threshold, and keeps a per-product
movement history. Over-selling is blocked or warned (NFR-3).

## Requirements

| ID | Requirement |
| --- | --- |
| FR-2.1 | Manual entry of stock received (restock) with quantity, date, optional supplier note. |
| FR-2.2 | Bulk stock updates via CSV/Excel import (see F06). |
| FR-2.3 | Automatically decrement stock on hand when a sale is recorded. |
| FR-2.4 | Automatically flag a product as low stock when stock on hand ≤ reorder threshold. |
| FR-2.5 | Maintain stock movement history (restock, sale, manual adjustment) per product. |
| FR-2.6 | Locate a restock line by scanning the product's barcode, as an alternative to search. |
| NFR-3 | Stock quantities never go negative through normal sale/restock flows; block or warn on over-selling. |

## Flows

### Restock (happy path)
1. Owner opens Stock → "Receive stock".
2. Adds lines by scanning the barcode (FR-2.6) or searching name/SKU.
3. Per line: quantity, unit checked. Optional supplier note + date (FR-2.1).
4. Saves → `restock` Stock Movements created; Stock On Hand increases.

### Movement history
1. Owner selects a product on the Stock screen.
2. History lists all movements: type, quantity (±), date, note, linked sale
   number — newest first (FR-2.5).

### Manual adjustment
1. Owner records a correction (e.g. breakage, count error) as an `adjustment`
   movement with a reason note.
2. If the adjustment would take stock negative, it is blocked (NFR-3).

## Rules & edge cases

- **Sign convention (V4):** `restock`/`adjustment` positive, `sale` negative.
- **Low stock (V5):** a product is Low Stock when `stock_on_hand ≤ reorder_threshold`.
  The Stock screen and POS surface the Low Stock badge.
- **Over-sell guard (V3/NFR-3):** a sale or adjustment may not drive stock below
  zero. POS shows remaining stock; checkout validates the full cart against
  current stock before committing.
- **Barcode-locate (FR-2.6):** scanning in the restock entry auto-resolves the
  product without an extra button press (same keyboard-wedge path as POS, NFR-8).
- **Deactivated products** cannot receive restock lines; only re-activate first.

## Acceptance criteria

1. Restock increases Stock On Hand and writes one movement per line.
2. Completing a sale decrements each product by the sold quantity (FR-2.3).
3. A product hitting its threshold shows the Low Stock flag immediately (FR-2.4).
4. Movement history shows correct ± quantities and sources for every change (FR-2.5).
5. Scanning a barcode in restock entry resolves the product without typing (FR-2.6).
6. A sale larger than available stock is blocked/warned; stock never goes negative (NFR-3).
7. Voiding a sale restores the exact quantities sold (F04, V4).
