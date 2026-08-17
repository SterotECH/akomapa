# SPEC

## G · Goal

UI-first functional prototype of Akomapa Neat Inventory & POS, per `/spec` domain + confirmed Behance design system. Build order below; screenshots per screen, DESIGN.md carbonized after pass. Prototype → accepted → real stack behind same UI.

## C · Constraints

- No real data. Sample catalog = realistic Ghanaian items, labeled synthetic.
- SRS scope sacred. Barcode optional. No multi-user, no cloud, no payment gateways.
- Currency GHS, integer pesewas. Responsive: desktop + tablet, one codebase.
- UI-first: mock data, Inertia React shell. Follow DESIGN.md → UI_BUILD.md. No new curves beyond `wobbly`/`gentle`/`fast`.
- Wire contracts fixed: `spec/interfaces/data-models.md` + `http-routes.md`.
- Route/UI screens order: Login → Dashboard → POS → Products → Stock → Reports.

## I · Interfaces

Routes (Inertia React, single session):

| route            | purpose             |
| ---------------- | ------------------- |
| `login`          | owner sign-in       |
| `dashboard`      | today overview      |
| `pos.index`      | flagship POS        |
| `products.index` | catalog CRUD        |
| `stock.index`    | restock + movements |
| `reports.index`  | 3 tabs + print      |
| `logout`         | end session         |

Screen signatures (wire, `spec/interfaces/data-models.md`):

```
screen: POS → {products: Product[], categories, today_sales, cart: CartLine[] (client-only)}
screen: Products → {products: Product[], categories, filter{search, category}, form}
screen: Stock → {movements: StockMovement[], lowStock: Product[], restockForm, adjustments}
screen: Reports → {tabs: stock-levels|low-stock|sales, range{from, to}, printable}
screen: Dashboard → {today{sales, items, lowStock}, recentMovements[]}
```

Money invariant: `price ≥ 0 int pesewas` → GHS `pesewas/100`, tabular.

## V · Invariants

```
V1: SKU & barcode unique → save block
V2: product inactive → ⊥ in POS grid & search
V3: low-stock = stock_on_hand ≤ reorder_threshold → amber pill
V4: sale → decrement stock; ∀ line stock_on_hand ≥ qty else line blocked
V5: void → restore stock + ledger row `voided`
V6: restock → ledger + stock_on_hand += qty; on-hand ⊥ < 0 ∀ ops
V7: scan input → exact barcode match → add line (keyboard-wedge, trailing Enter)
V8: ∀ money show/print → GHS format, tabular-nums
V9: every screen listed in SPEC screenshot pass → detect.mjs clean
V10: one primary CTA per view → amber; destructive = plain, confirms
V11: reduced motion → collapse springs to `fast`
V12: ⊥ real data in screenshots; synthetic labeled
```

## T · Tasks (build order)

| id  | status | task                                                                                               | cites       |
| --- | ------ | -------------------------------------------------------------------------------------------------- | ----------- |
| T1  | x      | design system: fonts, `@theme` tokens, print.css                                                   | V10         |
| T2  | x      | AppLayout shell: sidebar/topbar, icons, reduced-motion                                             | V11         |
| T3  | x      | UI primitives: Button, Input, Badge, Card, Modal/Drawer, Table, EmptyState, Skeleton, format utils | V10         |
| T4  | x      | Login screen                                                                                       | V1-V12      |
| T5  | x      | Dashboard screen                                                                                   | V12         |
| T6  | x      | POS screen: grid, cart, scan, checkout                                                             | V3,V4,V7,V8 |
| T7  | x      | Products screen: list/filter, add/edit drawer, deactivate                                          | V1,V2,V8    |
| T8  | x      | Stock screen: restock, movements, low-stock, adjustment                                            | V3,V5,V6,V8 |
| T9  | x      | Reports screen: 3 tabs, range, print stylesheet                                                    | V8,V12      |
| T10 | x      | mock-data module + route wiring                                                                    | V12         |
| T11 | x      | responsive tablet pass (breakpoints, touch targets)                                                | V10,V11     |
| T12 | x      | screenshot pass: detect.mjs per screen + DESIGN.md carbonize                                       | V9,V12      |
| T13 | x      | hand-off: pending decisions, synthetic-data label                                                  | V12         |

Order rules: T1→T3 foundation. T6 flagship after primitives, before others. T4/T5 early for scaffold proof. T7→T9 after T6. T10 any time after T3 (mock data). T11 after screens exist. T12 last, blocks hand-off. T13 requires T12.

## B · Bugs

| id  | date | cause | fix |
| --- | ---- | ----- | --- |

## Backend Tasks (phased)

Reference: SRS v0.2, `spec/interfaces/*.md`, `spec/features/*.md`.

### Phase 1 — Data Layer

| id   | status | task                                                                 | cites                          |
| ---- | ------ | -------------------------------------------------------------------- | ------------------------------ |
| BT1  | x      | migrations: categories, products, stock_movements, customers, sales, sale_line_items | data-models.md, SRS §5        |
| BT2  | x      | Eloquent models: Category, Product, Customer, StockMovement, Sale, SaleLineItem (ULIDs, relationships, scopes) | data-models.md, ADR-0008      |
| BT3  | x      | Product stock_on_hand accessor: Σ stock_movements.quantity (derived, not stored) | V4, data-models.md §1         |
| BT4  | x      | Form Requests: ProductStoreRequest, ProductUpdateRequest             | http-routes.md §3             |
| BT5  | x      | Form Requests: SaleStoreRequest, RestockRequest, AdjustmentRequest   | http-routes.md §2, §4         |
| BT6  | x      | Eloquent API Resources: ProductResource, CategoryResource, StockMovementResource, SaleResource, SaleLineItemResource, CustomerResource | data-models.md                |
| BT7  | x      | Factories: CategoryFactory, ProductFactory, CustomerFactory, StockMovementFactory, SaleFactory, SaleLineItemFactory | tests, seeding                |
| BT8  | x      | Seeders: realistic Ghanaian catalog (~20 products, 5 categories)     | SRS, PRODUCT.md               |

### Phase 2 — POS & Sales

| id   | status | task                                                                 | cites                          |
| ---- | ------ | -------------------------------------------------------------------- | ------------------------------ |
| BT9  | x      | ProductsController: index (real data), store, update, deactivate     | http-routes.md §3, FR-1.1     |
| BT10 | x      | StockController: index (real data), restock, adjustments             | http-routes.md §4, FR-2.1     |
| BT11 | x      | PosController: index (active products + categories + today_sales)    | http-routes.md §2, FR-3.1     |
| BT12 | x      | SalesController: store (complete sale with line items, decrement stock) | http-routes.md §2, FR-3.4, V4 |
| BT13 | x      | SalesController: void (same-day only, restore stock)                 | http-routes.md §2, FR-3.5, V5 |
| BT14 | x      | DashboardController: index (today summary + recent movements + low stock) | SRS §3.4, screen signatures   |
| BT15 | x      | ReportsController: stock-levels, low-stock, sales reports            | http-routes.md §5, report-contracts.md |
| BT16 | x      | Stock movement ledger: auto-create movement rows on sale/restock/adjust | V5, V6, FR-2.5                |
| BT17 | x      | Over-sell guard: DB-level check + controller validation (NFR-3)     | SRS NFR-3, V4                 |

### Phase 3 — Import & Reports

| id   | status | task                                                                 | cites                          |
| ---- | ------ | -------------------------------------------------------------------- | ------------------------------ |
| BT18 | x      | install maatwebsite/excel, configure import pipeline                 | import-contracts.md            |
| BT19 | x      | ProductImport: upsert by SKU, validate rows, error report            | FR-1.3, import-contracts.md §1 |
| BT20 | x      | StockImport: restock rows, validate, error report                    | FR-2.2, import-contracts.md §2 |
| BT21 | x      | Import template download (GET /products/import/template)             | import-contracts.md §1         |
| BT22 | x      | Reports: stock-levels query (all products, cost/selling value)       | report-contracts.md §1         |
| BT23 | x      | Reports: low-stock query (stock_on_hand ≤ threshold, by shortfall)  | report-contracts.md §2         |
| BT24 | x      | Reports: sales query (date range, summary + items-sold breakdown)   | report-contracts.md §3         |

### Phase 4 — Backup & Polish

| id   | status | task                                                                 | cites                          |
| ---- | ------ | -------------------------------------------------------------------- | ------------------------------ |
| BT25 | x      | BackupController: SQLite snapshot download                           | NFR-5, import-contracts.md §3  |
| BT26 | x      | Flash messages: wire HandleInertiaRequests to share flash.success/error | data-models.md §7             |
| BT27 | .      | Wire frontend to real data: replace mock-data imports with Inertia props | screen signatures §I           |
| BT28 | .      | Feature tests: Products CRUD, Stock restock/adjust, Sales store/void | SRS, all FRs                   |
| BT29 | .      | Feature tests: Reports (stock-levels, low-stock, sales)              | FR-4.1–4.3                     |
| BT30 | .      | Feature tests: Import (product upsert, stock restock, error report)  | FR-1.3, FR-2.2                 |
| BT31 | .      | Unit tests: stock_on_hand accessor, over-sell guard, sale total      | V4, NFR-3                      |
| BT32 | .      | Pest + Pint + types:check clean on all new code                      | all                            |

Phase order: P1 → P2 → P3 → P4. Each phase is shippable independently.

## H · Hand-off

Pending decisions before the prototype becomes a real stack:

| id  | area | decision needed | notes |
| --- | ---- | --------------- | ----- |
| H1  | Data | Replace mock data with real database | Migrations, factories, seeders needed. Wire to Eloquent models. |
| H2  | Auth | Real user authentication | Fortify is scaffolded; needs real user model, login flow, session handling. |
| H3  | POS | Barcode scanner input method | Currently keyboard-wedge only. Consider camera-based scanning for tablets without physical scanners. |
| H4  | POS | Price override permissions | Unit price is editable inline. Decide if owner-only or configurable. |
| H5  | Stock | Supplier management | Restock forms have optional supplier note. Full supplier CRUD is out of scope for v1 but may be needed. |
| H6  | Reports | Export/print format | Currently uses browser print dialog. Consider PDF export for shareable reports. |
| H7  | Deploy | Hosting and deployment | Laravel Cloud or traditional hosting? Offline-first considerations for spotty internet. |
| H8  | UI | Dark mode scope | Dark mode CSS variables are implemented. Decide if v1 ships dark mode or defers. |
| H9  | Multi | Multi-location support | Currently single-shop. Decide if multi-location is a future requirement. |
| H10 | Data | Real product catalog | ~20 synthetic Ghanaian items. Replace with actual shop inventory when ready. |
