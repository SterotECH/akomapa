# Interface Contracts — HTTP Routes

> All routes are web routes rendered by Inertia (ADR-0001). Mutations are
> standard POST/PATCH/DELETE with CSRF, followed by an Inertia redirect to the
> canonical page. Names below are the route names (used via `route()` / Wayfinder).

## 1. Authentication

| Method | URI | Name | Purpose |
| --- | --- | --- | --- |
| GET | /login | `login` | Login page (FR-5.1) |
| POST | /login | `login` | Authenticate username/password (FR-5.1, NFR-6) |
| POST | /logout | `logout` | End session |
| GET | /forgot-password | `password.request` | Password reset request (FR-5.2) |
| POST | /forgot-password | `password.email` | Send reset link (local mail optional) |
| GET | /reset-password/{token} | `password.reset` | Reset form (FR-5.2) |
| POST | /reset-password | `password.store` | Apply new password |

## 2. Point of Sale

| Method | URI | Name | Purpose |
| --- | --- | --- | --- |
| GET | /pos | `pos.index` | New Sale screen (FR-3.1) |
| POST | /sales | `sales.store` | Complete a Sale (FR-3.4) |
| POST | /sales/{sale}/void | `sales.void` | Same-day void, restores stock (FR-3.5) |

`GET /pos` props:
- `products` — active products with `stock_on_hand`, `is_low_stock`
- `categories` — for the category filter
- `today_sales` — summary for the day (count, total)

`POST /sales` body (camelCase):
```jsonc
{
  "items": [
    { "product_id": "01J1Z...ULID", "quantity": 2, "unit_price": 4500 } // unit_price optional; default = selling price
  ],
  "void_reason": null
}
```
Validation: at least one item; `product_id` exists (ULID), is active, and is a
valid ULID; `quantity` ≥ 1; total requested per product must not exceed
`stock_on_hand` (NFR-3); `unit_price` ≥ 0.

## 3. Products / Catalog

| Method | URI | Name | Purpose |
| --- | --- | --- | --- |
| GET | /products | `products.index` | Catalog page (FR-1.1) |
| GET | /products/create | `products.create` | New product form |
| POST | /products | `products.store` | Create product (FR-1.1) |
| GET | /products/{product}/edit | `products.edit` | Edit product form |
| PATCH | /products/{product} | `products.update` | Update product (FR-1.1) |
| PATCH | /products/{product}/deactivate | `products.deactivate` | Deactivate product (FR-1.1) |
| POST | /products/import | `products.import` | CSV/Excel import (FR-1.3) |
| GET | /products/import/template | `products.import-template` | Download template CSV |

Validation (store/update): `sku` required + unique; `name` required; `barcode` nullable + unique; `unit` required; `cost_price`/`selling_price` numeric ≥ 0; `reorder_threshold` integer ≥ 0; `category_id` nullable FK. `sku` and `barcode` may not be changed to a value already in use (FR-1.2).

## 4. Stock Management

| Method | URI | Name | Purpose |
| --- | --- | --- | --- |
| GET | /stock | `stock.index` | Stock screen: movements + low-stock panel (FR-2.5) |
| POST | /stock/restock | `stock.restock` | Record Restock (FR-2.1) |
| POST | /stock/adjustments | `stock.adjustments` | Record Manual Adjustment |
| POST | /stock/import | `stock.import` | Bulk stock update via CSV/Excel (FR-2.2) |
| GET | /stock/movements | `stock.movements` | Movement History per product (FR-2.5) |

`POST /stock/restock` body:
```jsonc
{
  "items": [
    { "product_id": "01J1Z...ULID", "quantity": 50 }
  ],
  "note": "Supplier A delivery",   // optional supplier note (FR-2.1)
  "occurred_at": "2026-08-09T10:00:00Z"
}
```
Barcode-locate path (FR-2.6): the UI resolves a scanned code to a product before submitting; the payload still uses `product_id`.

## 5. Reports

| Method | URI | Name | Purpose |
| --- | --- | --- | --- |
| GET | /reports | `reports.index` | Reports hub (FR-4.1–4.3) |
| GET | /reports/stock-levels | `reports.stock-levels` | Current Stock Levels (FR-4.1) |
| GET | /reports/low-stock | `reports.low-stock` | Low Stock (FR-4.2) |
| GET | /reports/sales | `reports.sales` | Sales for date range (FR-4.3) |

Query params: `from`, `to` (ISO dates) for the Sales report. All reports render on-screen and are printable/exportable as PDF via the browser print dialog (FR-4.4, ADR-0004).

## 6. Backup

| Method | URI | Name | Purpose |
| --- | --- | --- | --- |
| GET | /backup/download | `backup.download` | Full Data Backup export (NFR-5) |

## 7. Route model binding & authorization

- All routes except the auth flows are behind the `auth` middleware (single Owner, ADR-0005).
- Deactivated products are excluded from `pos.index` and `sales.store` but remain visible in `products.index` (marked inactive) and in history.
- IDs are bound via route-model binding; a missing record returns a 404.
- **Identifiers are ULIDs (ADR-0008):** path segments such as `/sales/{sale}` and
  `/products/{product}` resolve ULIDs via Laravel's implicit model binding
  (`HasUlids`). Add a `whereUlid(...)` constraint on route segments that do not
  use implicit binding so malformed identifiers 404 instead of erroring.
