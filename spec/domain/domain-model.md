# Domain Model

> Core domain model, entities, relationships, and invariants for the Shop
> Inventory & Sales Management System (Akomapa Neat Enterprise).

## 1. Overview

The system manages five core entities (SRS §5): **User**, **Product**,
**StockMovement**, **Sale**, and **Sale Line Item**. A **Category** is an
auxiliary entity for grouping products. There is exactly one User (the Owner),
so no organization/tenant dimension exists in v1.

The single source of truth for inventory is the **Stock Movement** history.
**Stock On Hand** is derived by summing movements for a product; it is never a
freely-edited column.

**Identifier convention:** all primary and foreign keys are **ULIDs** (26-char
Crockford base32 strings, sortable and time-ordered) — see ADR-0008. Eloquent
models use the `HasUlids` trait. Human-readable business numbers (e.g.
`Sale.sale_number`) are separate from identifiers and remain readable.

## 2. Entities

### 2.1 User

| Field | Type | Notes |
| --- | --- | --- |
| id | ulid, PK | ADR-0008 |
| name | string | Owner display name |
| username | string, unique | Login identifier (FR-5.1) |
| password | string (hashed) | Password stored hashed (NFR-6) |
| timestamps | | |

Constraints: exactly one active user in v1 (ADR-0005).

### 2.2 Category

| Field | Type | Notes |
| --- | --- | --- |
| id | ulid, PK | ADR-0008 |
| name | string, unique | e.g. "Beverages", "Provisions" |
| timestamps | | |

### 2.3 Product

| Field | Type | Notes |
| --- | --- | --- |
| id | ulid, PK | ADR-0008 |
| sku | string, unique | Required (FR-1.1) |
| name | string | Required (FR-1.1) |
| barcode | string, nullable, unique | Optional; unique when present (FR-1.2) |
| category_id | ulid, nullable FK → Category | Optional; ULID |
| unit | string | e.g. piece, box, kg (FR-1.1) |
| cost_price | integer (pesewas) | Minor units (ADR-0006) |
| selling_price | integer (pesewas) | Minor units (ADR-0006) |
| reorder_threshold | integer ≥ 0 | Default 0 |
| is_active | boolean | Deactivated products are hidden from POS (FR-1.1) |
| timestamps | | |

Constraints:
- `sku` unique (FR-1.2).
- `barcode` unique when not null (FR-1.2).
- `selling_price` ≥ 0; `cost_price` ≥ 0.

### 2.4 StockMovement

| Field | Type | Notes |
| --- | --- | --- |
| id | ulid, PK | ADR-0008 |
| product_id | ulid FK → Product | ULID |
| type | enum `restock` \| `sale` \| `adjustment` | Movement kind (FR-2.5) |
| quantity | integer, signed | +restock/+adjustment, −sale; see invariant V4 |
| occurred_at | datetime | Movement date |
| note | string, nullable | Supplier note or adjustment reason (FR-2.1) |
| sale_id | ulid, nullable FK → Sale | Set when type = `sale`; ULID |
| reference | string, nullable | Optional external reference |
| timestamps | | |

### 2.5 Sale

| Field | Type | Notes |
| --- | --- | --- |
| id | ulid, PK | ADR-0008 |
| sale_number | string, unique | Human-readable receipt number |
| sold_at | datetime | When the sale occurred (FR-3.4) |
| total | integer (pesewas) | Sum of line totals (FR-3.4) |
| voided_at | datetime, nullable | Set when voided |
| void_reason | string, nullable | Required when voiding (FR-3.5) |
| timestamps | | |

### 2.6 SaleLineItem

| Field | Type | Notes |
| --- | --- | --- |
| id | ulid, PK | ADR-0008 |
| sale_id | ulid FK → Sale | ULID |
| product_id | ulid FK → Product | ULID |
| quantity | integer ≥ 1 | |
| unit_price | integer (pesewas) | May be overridden at checkout (FR-3.3) |
| line_total | integer (pesewas) | quantity × unit_price, snapshot |
| product_snapshot | string | Name + SKU snapshot for history integrity |
| timestamps | | |

## 3. Relationships

```
User (1) ── (owner)
Category (1) ── (N) Product
Product (1) ── (N) StockMovement
Sale (1) ── (N) SaleLineItem
Product (1) ── (N) SaleLineItem
Sale (1) ── (N) StockMovement   (one movement per line item, type=sale)
```

- Deleting a product is **not allowed**; deactivate it instead (`is_active = false`). Historical references (movements, line items) are preserved via `product_snapshot`.
- A Voided Sale restores stock via compensating Stock Movements (type `sale`, positive quantity) — see F04.

## 4. Derived Values

- **Stock On Hand(product)** = Σ `StockMovement.quantity` where `quantity` is signed (`restock`/`adjustment` positive, `sale` negative).
- **Low Stock(product)** = `Stock On Hand ≤ reorder_threshold` (FR-2.4).
- **Sale Total** = Σ `line_total`.

## 5. Invariants

> Invariants are load-bearing. Each new bug must be checked against this list
> before patching (see backprop process).

- **V1 — SKU uniqueness:** No two active-or-inactive products share a SKU.
- **V2 — Barcode uniqueness:** No two products share a non-null barcode.
- **V3 — Stock On Hand never negative:** A Sale or Manual Adjustment may never drive a product's Stock On Hand below zero; the system blocks or warns (NFR-3).
- **V4 — Movement sign convention:** `restock` and `adjustment` movements are positive; `sale` movements are negative; a Voided Sale writes compensating positive `sale` movements.
- **V5 — Every stock change is a Movement:** Stock On Hand changes only through StockMovement records, never by editing a Product directly.
- **V6 — Sale total consistency:** `Sale.total` must always equal the sum of its `SaleLineItem.line_total` values.
- **V7 — Single active owner:** At most one active User account in v1.
- **V8 — Same-day void only:** A Sale may only be Voided on the same calendar day as `sold_at` (FR-3.5).
- **V9 — Price override is explicit:** A price override on a Sale Line Item is recorded and attributable; the catalog Selling Price is never mutated by a sale.

## 6. Out of Scope (v1)

- Multi-user accounts and permission levels (FR/SRS §6).
- Multi-branch/location support.
- Cloud hosting and remote access (possible future phase — NFR-7).
- Payment gateway integration (cash/manual reconciliation assumed — ADR-0007).
- Bulk/weighed goods requiring scale integration (SRS §2.4).
