# ADR-0008 — ULID Primary Keys

**Status:** Proposed
**Date:** 2026-08-10

## Context

Identifiers must not be sequential integers. Integer auto-increment IDs leak
catalog size and business volume (e.g. `GET /products/12` reveals the 12th
product) and create predictable enumeration targets. The two standard
non-sequential formats are UUID (128-bit, random, e.g. UUIDv4/v7) and ULID
(128-bit, time-ordered Crockford base32, e.g. `01J1ZK...`).

## Decision

Use **ULIDs** for all primary and foreign keys across all entities (User,
Category, Product, StockMovement, Sale, SaleLineItem). Eloquent models use
Laravel's `HasUlids` trait; migrations use `$table->ulid('id')->primary()`.
Human-readable business numbers (e.g. `Sale.sale_number`, `Product.sku`) are
separate, readable fields — they are never the primary key.

## Consequences

- **Enables:** no enumeration of records; globally-unique, collision-safe IDs;
  and ULIDs are time-ordered, so PK-indexed inserts stay append-friendly and
  sorting by `id` roughly matches creation order (useful for pagination).
- **Constrains:** IDs are 26-char strings — slightly larger than a bigint; UI
  and API code must treat IDs as opaque strings (never parse or display them
  unless truncated).
- **Accepted trade-off:** chosen over UUIDv4 because ULIDs sort by time (better
  index locality); UUIDv7 offers the same property and can be swapped in if the
  client later standardizes on UUID — the decision is confined to the data
  layer and does not reshape the domain.

## Supersedes / Superseded by
None.
