# Design

<!-- impeccable:design-schema 1 -->

## Overview

A point-of-sale and inventory system for a single-owner retail shop (Akomapa Neat Enterprise, Ghana). It is a real working tool — dense, fast, warm — for work at the counter and on a tablet, not a marketing page. The visual authority is the confirmed Behance POS reference (Prafful Kumar): warm Linen paper background, Cultured White cards, Raisin Black navigation and text, Amber as the single primary accent, Green reserved for positive/money/in-stock states, Spanish Gray for everything muted.

This document reflects the **implemented UI** (T1–T12 complete). Component styles below match the live codebase.

## Problem Statement

The owner is busy at the counter during a rush. They need to sell fast (type/search, or scan — both instant), keep stock right, and know what to reorder. The app must feel fast, warm, and trustworthy on both a desktop and a tablet, in a shop that may have no internet. Nothing here is a demo splash; every screen is a tool.

## Product Direction

The brand is quiet and real, not loud: a warm paper-and-ink shop ledger with a single confident amber accent. The flagship is the POS — a full-height split screen, instant product search on the left, a live cart on the right. Structure of the product: **Login → Dashboard → POS (flagship) → Products → Stock → Reports**.

## Visual Direction

- **Warm Linen paper world.** The whole app sits on Linen, not near-white or gray. Cards are Cultured White; they never blend into the page and never go pure `#fff`. Light theme only in v1; dark mode is out of scope.
- **Raisin Black ink.** Text, and the navigation chrome (sidebar, topbar), are Raisin. Chrome and light workspace never invert — the sidebar is the only dark surface.
- **One amber action.** Amber is the single interactive accent: primary buttons, active nav, focus, sale/confirm actions. It never competes with Green.
- **Green is for money and stock truth.** Green says "in stock, positive, money in". Amber says "act here". They never trade roles (see Amber–Green Rule).
- **Spanish Gray, quiet.** Secondary text, placeholders, disabled, dividers live in Spanish Gray. Muted stays muted.

## Systems

### Color

`palette:`

| name           | hex       | role                                                                         |
| -------------- | --------- | ---------------------------------------------------------------------------- |
| `amber`        | `#FFBF00` | primary action accent: primary buttons, active nav, focus ring, sale/confirm |
| `amber-deep`   | `#D49100` | hover/pressed of amber; focus on amber                                       |
| `green`        | `#00AD43` | positive/money/in-stock: low-stock off, profit, success                      |
| `green-deep`   | `#00993B` | hover/pressed of green                                                       |
| `linen`        | `#FAF0E6` | app background (warm paper)                                                  |
| `white`        | `#F5F5F5` | card surfaces (cultured white)                                               |
| `line`         | `#EAE0CF` | hairline borders on light                                                    |
| `raisin`       | `#242124` | primary text; sidebar & topbar chrome                                        |
| `raisin-soft`  | `#3B363B` | dark-surface secondary text                                                  |
| `spanish-gray` | `#989898` | muted/secondary text, placeholders, disabled                                 |
| `danger`       | `#C13E2F` | errors, void actions                                                         |
| `danger-deep`  | `#9E2F22` | hover/pressed of danger                                                      |

Named rules:

- The **Warm Paper Rule**: page background is always Linen; card surfaces are Cultured White; no surface is pure `#fff`.
- The **Amber–Green Rule**: amber is the one "act here" accent; green is reserved for positive/money/in-stock. Never swap roles.
- The **One-Action Rule**: one primary action per view. Secondary buttons are plain (transparent, Raisin text).

### Typography

`font: Nunito Sans` (loaded with `font-display: swap`; Latin — no diacritic-heavy text planned).

- `display` — 28px / 600 / tight — page titles (Dashboard, Products…)
- `headline` — 20px / 700 — panel titles (POS cart header)
- `title` — 16px / 600 — card titles, list item names
- `body` — 14px / 400 — default app text (POS density)
- `label` — 12px / 600 — field labels, table headers, tabs, badges
- `figure` — 13–18px / 600 / tabular — all prices, quantities, money
- `wordmark` — 20px / 700 — "Akomapa Neat" in the sidebar (typographic only, no logo)

Named rules:

- The **Counter Rule**: every price and quantity uses tabular figures (`font-variant-numeric: tabular-nums`); money and numbers are always right-aligned in columns, never centered. A total reads like a cash register, not a headline.
- The **One-Line Rule**: product names truncate on one line with ellipsis; grids never break into ragged two-line names.

### Spacing

- `space-sm` 8px · `space-md` 16px · `space-lg` 24px · `space-xl` 32px.
- Page content: 24px padding on the workspace.
- Cards: 16px padding, 16px internal gaps.
- Dense screens (POS) use 8–12px gaps between controls.

### Rounded

- `rounded-sm` 8px — inputs, search fields, table cells
- `rounded-md` 12px — buttons, chips, badges, mini panels
- `rounded-lg` 20px — cards, panels, drawers, modals
- `rounded-full` — pills, stock-dot indicators, toggle thumbs

### Elevation

Warm-tinted, soft, layered shadows (never hard or neon):

- `shadow-card`: `0 1px 2px rgba(36,33,36,.04), 0 8px 24px rgba(36,33,36,.06)` — resting cards
- `shadow-raised`: `0 12px 32px rgba(36,33,36,.12)` — hover/popovers, drag-overlay cart cards
- `shadow-modal`: `0 24px 64px rgba(36,33,36,.24)` — modals, drawers

### Motion

Defaults from the Apple/Spring palette (see UI_BUILD.md):

- Spring `wobbly`: `{ type: 'spring', bounce: .35, duration: .55 }` — page-section entrance, cart item add
- Spring `gentle`: `{ type: 'spring', bounce: .25, duration: .45 }` — drawers, modals
- Linear `fast`: `duration .12`, ease — hover states, focus
- Motion only supports the product: never decorative. `prefers-reduced-motion` collapses all springs to `fast`.
- Only the two springs above are permitted; do not invent new curves.

## Behavior

Interaction and state conventions:

- **One primary action per view**, via amber; destructive actions are plain text/ghost in danger color with a confirm step, never amber.
- **Press = preview**: hover/press lifts cards (shadow-raised), plus a 3px raise on the POS product grid; click-to-add is a real-time response, not a navigation.
- **Optimistic where safe**: adding a line to the cart, toggling a flag, and restocking are instant; money always recomputes live and totals always match.
- **Keyboard is first**: the POS runs fully from the keyboard — `/` focuses search, `Enter`/`Tab` adds from suggestions, `Up/Down` steps quantity, `Escape` closes drawers, barcode scan adds directly.
- **States are explicit**: every item shows live low-stock (`amber` pill) or healthy (`green` dot); empty states teach ("Start typing to add the first product"); destructive actions confirm.
- **Feedback is instant and cheap**: button press and toggles animate in `fast`; success on save/restock is a quiet green line, not a full-screen toast.

## Implementation

Documentation of the canonical implementation lives in **UI_BUILD.md** (screens, components, states, responsive breakpoints, the build pass order). This section records only the non-obvious decisions that bind the whole build:

- **Tailwind is the canvas**: the palette/tokens above are `@theme` variables in `app.css`; components never invent raw hex values.
- **No icon library, hand-drawn icons**: the flagship screens use crisp inline SVG icons (24px, stroke 1.75, currentColor) with a shared `Icon` component; no dependency, fully styleable. Numbers/prices are always `tabular-nums`.
- **One shared `AppLayout`** (sidebar + topbar) wraps every authenticated screen so chrome, active states, and the print/offline banner stay consistent.
- **POS layout is fixed**: a full-height split — left search + product grid, right cart — that never scrolls behind a page scroll. This is the flagship; it gets the most polish.
- **Ink follows the system, not the preview**: components named after roles (Button `primary`/`plain`/`danger`, Badge `amber`/`green`/`muted`) so the palette can shift in one place without touching screens.
- **Motion order is decided**: add-to-cart `wobbly`, drawers/modals `gentle`, everything else `fast`. Reduced motion collapses to `fast`. No new curves.

## Components

All components live in `resources/js/components/`. Tokens come from `@theme` in `app.css`; no raw hex in JSX.

### Button

| Prop | Values | Default |
| --- | --- | --- |
| `variant` | `primary` · `plain` · `danger` | `primary` |
| `size` | `sm` · `md` | `md` |

- **primary**: `bg-amber text-amber-ink hover:bg-amber-deep` — solid gold, dark text
- **plain**: `bg-transparent text-raisin hover:bg-raisin/5` — ghost, faint hover tint
- **danger**: `bg-transparent text-danger hover:bg-danger/5` — ghost danger, faint red hover
- **sm**: `px-3 py-1.5 text-label min-h-10` (40px on md+)
- **md**: `px-4 py-2.5 text-title min-h-11` (44px)
- Base: `inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-fast active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40`
- Forces `type="button"`. Press-down micro-animation via `active:scale-[0.98]`.

### Badge

| Prop | Values | Default |
| --- | --- | --- |
| `variant` | `amber` · `green` · `muted` | `muted` |

- **amber**: `bg-amber/15 text-amber-deep` — 15% gold background
- **green**: `bg-green/10 text-green-deep` — 10% green background
- **muted**: `bg-line/60 text-spanish-gray` — 60% line color background
- Base: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-label font-semibold`
- Always pill-shaped (`rounded-full`). Single size.

### Input / SearchField

- **Input**: `w-full rounded-sm border border-line bg-white px-3 py-2.5 text-body text-raisin transition-shadow duration-fast outline-none placeholder:text-spanish-gray focus:ring-2 focus:ring-amber`
- **SearchField**: Wraps Input in `relative` div with `Icon name="search"` (size-5, left-3, vertically centered). Input gets `pl-10`. Forces `type="search"`.
- Focus ring is amber. Border-radius is `rounded-sm` (6px).

### Card

| Prop | Values | Default |
| --- | --- | --- |
| `interactive` | `boolean` | `false` |

- Base: `rounded-lg bg-white shadow-card`
- Interactive adds: `transition-shadow duration-fast hover:shadow-raised`
- Shadow elevation: base = `shadow-card`, hover = `shadow-raised`

### Modal

| Prop | Type |
| --- | --- |
| `open` | `boolean` (required) |
| `onClose` | `() => void` (required) |
| `title` | `string` (required) |

- Fixed overlay (`z-50`, `bg-chrome/60`), centered flex container
- Dialog panel: `w-full max-w-lg rounded-lg bg-white shadow-modal`
- Header: `flex items-center justify-between border-b border-line px-6 py-4`
- Title: `text-headline text-raisin`. Close button: `size-11 rounded-md`
- Body: `px-6 py-4`
- Animation: `gentle` spring. Panel enters `opacity 0, scale 0.95, y: 8`
- Escape key and backdrop click close. `role="dialog"`, `aria-modal`.

### Drawer

| Prop | Type |
| --- | --- |
| `open` | `boolean` (required) |
| `onClose` | `() => void` (required) |
| `title` | `string` (required) |
| `footer` | `ReactNode` (optional) |

- Fixed overlay (`z-50`, `bg-chrome/60`). Panel: `absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-modal`
- Slides from right (`x: 100%` → `x: 0`) using `gentle` spring
- Header same as Modal. Content: `flex-1 overflow-y-auto px-6 py-4`
- Footer (optional): `border-t border-line px-6 py-4`

### DataTable / Table

| Export | Purpose |
| --- | --- |
| `DataTable` | Table with optional `stickyHeader` prop |
| `Table` | Alias for `DataTable` |
| `TableHead` | `<thead>` with `border-b border-line bg-linen/95 backdrop-blur-sm` |
| `TableBody` | `<tbody>` |
| `TableRow` | `<tr>` with `border-b border-line hover:bg-raisin/[0.02] last:border-0` |
| `HeaderCell` | `<th>` — `px-3 py-2.5 text-label font-semibold tracking-wide text-spanish-gray uppercase` |
| `Cell` | `<td>` — `px-3 py-3 text-raisin whitespace-nowrap`. Right alignment adds `tabular-nums`. |

- Sticky header: `[&>thead]:sticky [&>thead]:top-0 [&>thead]:z-10`
- Wrapper: `w-full overflow-x-auto`

### EmptyState

| Prop | Type |
| --- | --- |
| `icon` | `IconName` (required) |
| `title` | `string` (required) |
| `description` | `string` (optional) |

- `flex flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-white/50 px-6 py-12 text-center`
- Icon: `size-8 text-spanish-gray`. Title: `text-title text-raisin`. Description: `text-body text-spanish-gray`

### Money

| Prop | Type |
| --- | --- |
| `pesewas` | `number` (required) — amount in pesewas |
| `className` | `string` (optional) |

- Renders `GH₵ X,XXX.XX` via `formatGhs()`. Always `text-figure tabular-nums`.
- Divides by 100, formats with `en-GH` locale (2 decimal places).

### StockDot

| Prop | Type |
| --- | --- |
| `low` | `boolean` (required) |

- `low=true`: Pulsing amber dot — two stacked `span` elements, `size-2.5 rounded-full bg-amber`, background span has `motion-safe:animate-ping`
- `low=false`: Static green dot — `size-2.5 rounded-full bg-green`
- Ping animation respects `prefers-reduced-motion` via `motion-safe:` prefix.

### Toast (useToasts + ToastStack)

- `useToasts()` returns `{ toasts, push, dismiss }`
- Tones: `success` (green icon), `warning` (amber icon), `danger` (red icon)
- Toast card: `w-full max-w-sm rounded-md border border-line bg-white py-2 pr-3 pl-2 shadow-modal`
- Position: `fixed inset-x-0 top-20 z-50`, centered
- Auto-dismiss: 2000ms for success, 3200ms for others. Max 3 visible.
- Animation: enters from `y: -14, scale: 0.95`, exits to `scale: 0.95`. `gentle` spring.

### Icon

| Prop | Type |
| --- | --- |
| `name` | `IconName` (required) |

- 22 icons: `dashboard`, `pos`, `products`, `stock`, `reports`, `logout`, `search`, `cart`, `plus`, `minus`, `close`, `check`, `print`, `download`, `warning`, `clock`, `barcode`, `filter`, `arrow-right`, `sun`, `moon`, `menu`
- SVG: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.75}`
- Default size: `size-6` (24px). Pure inline SVG, no external library.

### TrendChart

| Prop | Type |
| --- | --- |
| `data` | `SalesPoint[]` (required) — `{ label: string, value: number }` |

- Recharts `AreaChart` with green gradient fill (22% → 0% opacity)
- Stroke: `green`, `strokeWidth={2}`, no data dots
- Custom tooltip: `rounded-md border px-3 py-2 shadow-card`, value formatted via `formatGhs()`
- Full dark mode support via CSS custom properties read from `document.documentElement`

### AppLayout

- Dark raisin sidebar (`w-32`, `bg-chrome`, `lg:flex`) + topbar (`h-16`, `bg-linen/95`)
- Bottom nav on `< lg`: `fixed inset-x-0 bottom-0`, `min-h-16` touch targets
- Content wrapper: `pt-16 pb-16 lg:pb-0`, sidebar margin `lg:ml-32`
- Sidebar toggle persisted in `localStorage` (`akomapa-sidebar`)

## Design Rules & Constraints

- **The Warm Paper Rule** — page is Linen, cards are Cultured White, no pure `#fff` surfaces.
- **The Amber–Green Rule** — amber acts, green affirms (money/in-stock). Never swapped.
- **The One-Action Rule** — one primary CTA per view.
- **The Counter Rule** — tabular figures; money and numbers right-aligned in columns, never centered.
- **The Raisin Sidebar Rule** — dark raisin chrome, light linen workspace; never invert.
- **The One-Line Rule** — product names truncate on one line in grids.
- **Print is designed too** — reports use a print stylesheet (`print.css`) tuned for GHS paper: no nav, no shadows, a thin amber rule on the header, black text only.
- Accessibility: WCAG AA contrast (amber text/links never carry body text on Linen — amber is for fills and buttons with raisin text), touch targets ≥44px on the tablet path, keyboard-first POS, `prefers-reduced-motion` honored.
