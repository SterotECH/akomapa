# Interface Contracts — Data Models

> Wire-level data shapes. The application is an Inertia SPA (ADR-0001): page
> props are serialized to JSON by the server and consumed as typed objects by
> the React client. These shapes are the contract between the server layer and
> the frontend. Field names are camelCase on the wire.

> **Identifiers:** every `*_id` / `id` field is a **ULID string** (ADR-0008).
> No integer identifiers anywhere on the wire.

## 1. Product

```ts
type Product = {
  id: string            // ULID
  sku: string
  name: string
  barcode: string | null
  category: Category | null
  unit: string
  cost_price: number       // integer pesewas
  selling_price: number    // integer pesewas
  reorder_threshold: number
  is_active: boolean
  stock_on_hand: number    // derived (domain V5)
  is_low_stock: boolean    // derived (domain V2.4)
  stock_value: number      // cost_price * stock_on_hand (minor units)
  created_at: string | null
  updated_at: string | null
}
```

## 2. Category

```ts
type Category = {
  id: string            // ULID
  name: string
}
```

## 3. StockMovement

```ts
type StockMovement = {
  id: string            // ULID
  product_id: string    // ULID
  type: 'restock' | 'sale' | 'adjustment'
  quantity: number          // signed, per domain V4
  occurred_at: string       // ISO-8601
  note: string | null
  sale_id: string | null    // ULID, set for sale movements
  product?: ProductSummary  // when expanded
}

type ProductSummary = {
  id: string            // ULID
  sku: string
  name: string
  unit: string
}
```

## 4. Sale

```ts
type Sale = {
  id: string            // ULID
  sale_number: string
  customer_id: string | null  // ULID, optional
  customer?: CustomerSummary  // when expanded
  sold_at: string           // ISO-8601
  total: number             // integer pesewas
  items_count: number
  voided_at: string | null
  void_reason: string | null
  line_items: SaleLineItem[]
}

type SaleLineItem = {
  id: string            // ULID
  product_id: string    // ULID
  product_snapshot: string
  quantity: number
  unit_price: number        // pesewas; may be overridden (FR-3.3)
  line_total: number        // pesewas
}
```

## 4a. Customer

```ts
type Customer = {
  id: string            // ULID
  name: string
  phone: string | null
  created_at: string | null
  updated_at: string | null
}

type CustomerSummary = {
  id: string            // ULID
  name: string
  phone: string | null
}
```

## 5. User (session)

```ts
type AuthUser = {
  id: string            // ULID
  name: string
  username: string
}
```

## 6. Cart (checkout draft)

The cart is **client-only state** in v1 (nothing is persisted until Complete
Sale). Shared page props carry catalog data; the cart itself lives in the POS
page component.

```ts
type CartLine = {
  product_id: string    // ULID
  sku: string
  name: string
  unit: string
  unit_price: number        // selling price; may be overridden
  quantity: number
  line_total: number
  stock_on_hand: number     // for over-sell guard (NFR-3)
}
```

## 7. Common envelope

All page props are passed under their page name (e.g. `PosPageProps`).
Shared props (via `HandleInertiaRequests`) always include `auth.user` and
`flash` (success/error messages).

```ts
type Flash = {
  success: string | null
  error: string | null
}
```
