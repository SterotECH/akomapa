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
| T13 | .      | hand-off: pending decisions, synthetic-data label                                                  | V12         |

Order rules: T1→T3 foundation. T6 flagship after primitives, before others. T4/T5 early for scaffold proof. T7→T9 after T6. T10 any time after T3 (mock data). T11 after screens exist. T12 last, blocks hand-off. T13 requires T12.

## B · Bugs

| id  | date | cause | fix |
| --- | ---- | ----- | --- |
