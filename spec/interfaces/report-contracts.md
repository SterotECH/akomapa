# Interface Contracts — Reports

> All three reports (SRS §3.4) read live data from StockMovement and
> Sale/SaleLineItem history. There is no reporting database (SRS §5). Reports
> render on-screen and export to PDF via the browser print dialog (FR-4.4,
> ADR-0004). Each report carries a printable layout with a minimal brand header
> (shop name, address, generated date) and no interactive chrome.

## 1. Current Stock Levels Report (FR-4.1)

**Endpoint:** `GET /reports/stock-levels`

### Data
| Column | Source |
| --- | --- |
| SKU | Product.sku |
| Product | Product.name |
| Category | Category.name (nullable) |
| Unit | Product.unit |
| Stock On Hand | derived Σ StockMovement.quantity (domain V4) |
| Cost Value | cost_price × stock_on_hand (pesewas) |
| Selling Value | selling_price × stock_on_hand (pesewas) |

### Ordering & scope
- All products, active first, then grouped/sorted by category then name.
- Grand totals row: total cost value, total selling value.

## 2. Low Stock Report (FR-4.2)

**Endpoint:** `GET /reports/low-stock`

### Data
| Column | Source |
| --- | --- |
| SKU | Product.sku |
| Product | Product.name |
| Stock On Hand | derived |
| Reorder Threshold | Product.reorder_threshold |
| Shortfall | reorder_threshold − stock_on_hand (≥ 0) |

### Scope
- Only products where `stock_on_hand ≤ reorder_threshold` (domain V5 / FR-2.4).
- Sorted by shortfall descending (most urgent first).

## 3. Sales Report (FR-4.3)

**Endpoint:** `GET /reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Data
Two views on the same query:

1. **Summary** — for the range: number of Sales, total revenue (sum of non-voided `Sale.total`), items sold count.
2. **Items sold** — grouped per product: SKU, Product, Unit, Quantity Sold, Gross Revenue, plus a grand-total row.

### Scope & rules
- Only non-voided Sales count toward revenue and quantities.
- Voided Sales are listed separately (count + value) so the owner can reconcile.
- Default range: today. Validation: `from ≤ to`, dates ISO.

## 4. Common report behavior

- All reports: on-screen table + "Print / Save as PDF" action (window print).
- Printable stylesheet hides navigation, sidebar, and buttons (`@media print`).
- No scanning requirement — reports are generated from stored data (SRS §3.4 heading).
