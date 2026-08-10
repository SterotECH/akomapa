# UI Build

How the Akomapa UI is built, screen by screen. Tokens and design rules live in
**DESIGN.md**; this file is the build recipe. Scope: the **UI-first prototype**
(SPEC §T): mock data, Inertia React shell, same UI that the real stack will
inherit.

## Build pass order

Follow SPEC §T (T1 foundation → T6 flagship → T7–T9 → T11 responsive → T12
screenshot pass). Golden rule: **the foundation ships once** — tokens, layout,
and primitives are all shared, so every later screen is composition, not invention.

## Design tokens → Tailwind `@theme`

All DESIGN.md tokens become `@theme` variables in `resources/css/app.css`
(fonts, colors, radii, shadows, spacing). Screens and components use **only**
these; no raw hex in JSX.

```css
@theme {
    --font-sans: 'Nunito Sans', ui-sans-serif, system-ui, sans-serif;
    --color-amber: #ffbf00;
    --color-amber-deep: #d49100;
    --color-green: #00ad43;
    --color-green-deep: #00993b;
    --color-linen: #faf0e6;
    --color-white: #f5f5f5;
    --color-line: #eae0cf;
    --color-raisin: #242124;
    --color-raisin-soft: #3b363b;
    --color-spanish-gray: #989898;
    --color-danger: #c13e2f;
    --color-danger-deep: #9e2f22;
    --shadow-card:
        0 1px 2px rgb(36 33 36 / 0.04), 0 8px 24px rgb(36 33 36 / 0.06);
    --shadow-raised: 0 12px 32px rgb(36 33 36 / 0.12);
    --shadow-modal: 0 24px 64px rgb(36 33 36 / 0.24);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 20px;
}
```

Print: `print.css` imported last, tuned for GHS paper — hides nav/sidebar/
interactive chrome, removes shadows, black text, thin amber rule under the
report header.

## Icons

No icon library. Shared `Icon` component renders crisp inline SVGs
(24px, stroke 1.75, `currentColor`). Icon set grows only as screens need it:
sidebar/topbar glyphs (dashboard, POS, box, stock, report, logout), plus
search, cart, plus, minus, close, check, print, download, warning, clock,
barcode, filter.

## Shared primitives (`resources/js/components`)

| primitive               | purpose                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `Button`                | `primary` (amber, raisin text), `plain` (transparent, raisin), `danger` (ghost, danger), sizes sm/md |
| `Input` / `SearchField` | 12px radius, raisin text, spanish-gray placeholder, amber focus ring                                 |
| `Badge`                 | `amber` (low-stock pill), `green` (healthy dot / in-stock), `muted` (counts, labels)                 |
| `Card`                  | cultured white, `radius-lg`, `shadow-card`, hover → `shadow-raised`                                  |
| `Modal` / `Drawer`      | enter `gentle` spring, raisin scrim, `Escape` closes                                                 |
| `Table`                 | header rows in label/uppercase, raisin rows, right-aligned figure cells                              |
| `EmptyState`            | teaches: icon + one-line instruction, no invented copy                                               |
| `Skeleton`              | for the deferred/`optional` prop states (pulse)                                                      |
| `StockDot`              | green when healthy, amber pulse when low                                                             |
| `Money`                 | formats pesewas → GHS, always `tabular-nums`, right-aligned                                          |
| `AppLayout`             | dark raisin sidebar + topbar, active-state nav, wraps all authed screens                             |

## Screens

### Login

Split layout: left, raisin panel with typographic wordmark "Akomapa Neat";
right on linen, the username/password form. One amber `primary` submit
(One-Action Rule). Error state: danger text under the field, never a toast.
Logo is typographic only — no invented logo.

### Dashboard

Four `StatCard`s across the top — Today's Sales (GHS), Items Sold, Low Stock
count, Stock Value — values in tabular figures, low-stock card edges toward
amber when > 0. Below: Recent Movements table (right-aligned figures) + a
Low-Stock list that links to `stock.index`. Empty dashboard (no sales yet)
shows EmptyState pointing at the POS.

### POS (flagship)

Full-height split, no page scroll, `pos.index` props:

- **Left: search + product grid.** `SearchField` at top, `/` focuses it.
  Filter by name or SKU as you type; optional category chips. Grid:
  `auto-fill minmax(160px, 1fr)`, product cards with one-line name, price in
  `figure`, `StockDot`. Press lifts `shadow-raised` + 3px translate; click adds
  to cart instantly (`wobbly`).
- **Scan:** any keystrokes resolving to an exact barcode match add that product
  directly (keyboard-wedge; trailing Enter swallowed). Barcode icon signals
  the field is listening.
- **Right: cart.** Header with live total (large, `figure`, tabular). Lines:
  name (one line), `Up/Down` quantity steppers, unit price (editable inline per
  FR-3.3), line total, remove. Over-sell guard: quantity capped at
  `stock_on_hand` (NFR-3); blocked line shows danger message. Footer: one amber
  **Complete Sale** button (One-Action Rule) that saves and collapses the cart.
- States: empty cart → EmptyState; successful sale → cart resets with a quiet
  green success line (not a toast).

### Products

List (Table) with search + category filter, inactive products marked with a
`muted` badge but visible (per http-routes §7). Row actions: Edit, Deactivate
(plain danger, confirms; reactivation allowed). Add/Edit in a `Drawer` with
the full form: name, SKU, barcode (optional), category, unit, cost price,
selling price, reorder threshold — SKU/barcode uniqueness enforced (V1). Save:
amber primary; save failure returns server errors inline under fields.

### Stock

- **Low-stock panel** top: amber pills, each with "Restock" shortcut that
  prefills the form.
- **Restock form** (`stock.restock`): item picker (type or scan, barcode-locate
  resolves code → product, FR-2.6), quantity, optional supplier note + date.
  Submit decrements nothing — it adds `stock_on_hand` and writes a `restock`
  movement (V6).
- **Adjustments:** manual entry with reason → `adjustment` movement; on-hand
  never goes below 0 (V6).
- **Movement History:** table of `restock` / `sale` / `adjustment` with signed
  quantities, right-aligned; filters by product.

### Reports

Three tabs: **Stock Levels** (`reports.stock-levels`), **Low Stock**
(`reports.low-stock`), **Sales** (`reports.sales`, with `from`/`to` date range).
Every tab: on-screen table + a `plain` **Print** button that opens the browser
print dialog (ADR-0004). Print stylesheet renders a clean report header
(wordmark + shop address, thin amber rule, black text, no chrome). Report
header shows "Akomapa Neat Enterprise · Ablekuma 10 Plot, GC-104-444".

### Mock data (`resources/js/lib`)

Synthetic catalog: ~20 realistic Ghanaian products (e.g. FanIce sachet,
Ghana pepper sauce, Ideal milk, sachet gari), GHS prices in pesewas, labeled
`(synthetic)` wherever visible. `products`, `categories`, `today_sales`,
`movements`, and flash are served from this module in the prototype; the
screens consume the same wire shapes as the real stack (`data-models.md`).

## Responsive (T11)

- Desktop ≥ 1024px: sidebar + full split POS.
- Tablet (≥ 768px, portrait): sidebar collapses to a bottom nav with ≥ 44px
  touch targets; POS stack becomes search on top, cart below, sticky totals.
- `prefers-reduced-motion` → all springs collapse to `fast` (V11).
- Tablets get larger tap targets; hover-only affordances get a visible pressed
  state.

## Motion (from DESIGN.md)

`wobbly` spring: add-to-cart, section entrances. `gentle` spring: drawers,
modals. `fast` linear: hover, focus, toggles. Nothing else.

## Verify before pass ends

1. `npm run format` (prettier) clean.
2. `npm run build` passes; `composer run dev` serves the app.
3. Screenshot pass: open each SPEC screen, run `detect.mjs` for drift vs
   DESIGN.md, no errors in browser logs; screenshots attached to SPEC §T rows.
4. Then run `document` to carbonize real component styles into DESIGN.md.
