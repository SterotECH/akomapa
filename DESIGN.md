# Design

<!-- impeccable:design-schema 1 -->
<!-- impeccable:seed-marker 1 -->

## Overview

A point-of-sale and inventory system for a single-owner retail shop (Akomapa Neat Enterprise, Ghana). It is a real working tool — dense, fast, warm — for work at the counter and on a tablet, not a marketing page. The visual authority is the confirmed Behance POS reference (Prafful Kumar): warm Linen paper background, Cultured White cards, Raisin Black navigation and text, Amber as the single primary accent, Green reserved for positive/money/in-stock states, Spanish Gray for everything muted.

This document is in **seed mode**: the design system tokens and color palette are established (confirmed by the client), but no components or screens exist yet. Re-run `document` after the first build pass to carbonize real component styles.

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

## Design Rules & Constraints

- **The Warm Paper Rule** — page is Linen, cards are Cultured White, no pure `#fff` surfaces.
- **The Amber–Green Rule** — amber acts, green affirms (money/in-stock). Never swapped.
- **The One-Action Rule** — one primary CTA per view.
- **The Counter Rule** — tabular figures; money and numbers right-aligned in columns, never centered.
- **The Raisin Sidebar Rule** — dark raisin chrome, light linen workspace; never invert.
- **The One-Line Rule** — product names truncate on one line in grids.
- **Print is designed too** — reports use a print stylesheet (`print.css`) tuned for GHS paper: no nav, no shadows, a thin amber rule on the header, black text only.
- Accessibility: WCAG AA contrast (amber text/links never carry body text on Linen — amber is for fills and buttons with raisin text), touch targets ≥44px on the tablet path, keyboard-first POS, `prefers-reduced-motion` honored.
