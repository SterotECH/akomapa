---
paths:
  - resources/js/pages/Pos.tsx
  - resources/js/pages/Products.tsx
  - resources/js/pages/Stock.tsx
---

# Pages

## POS register heights differ per breakpoint; cart never stacks below products
The AppLayout chrome consumes 10rem (<sm), 11rem (sm–lg, bottom nav visible), or 7rem (lg+, bottom nav hidden) of vertical space. The POS container must be h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-11rem)] lg:h-[calc(100dvh-7rem)] — a single 11rem calc leaves a 4rem gap on lg. Products pane scrolls internally (min-h-0 flex-1 overflow-y-auto). Below md the cart is NOT rendered in-flow under the grid; instead a fixed cart bar (bottom-16) opens the cart in a Drawer with the footer pinned to Complete Sale. Inline feedback is toasts (Toast.tsx/useToasts), never a line that shifts the grid.

## Products catalog is per-page mock state (no shared store)
The Products page keeps its own `catalog` in useState seeded from mock-data; add/edit/deactivate only mutate that local list. There is no shared store, so deactivation does NOT propagate to the POS page (which reads activeProducts from mock-data.ts). New ids are client-generated fake ULIDs via `createMockId()` from `resources/js/lib/mock-id.ts` (shared with the Stock page). V1 uniqueness is validated client-side against the local catalog, excluding the row being edited.

## Stock catalog + movements are per-page mock state
The Stock page keeps its own `catalog` (seeded from activeProducts) and `movements` (seeded from stockMovements) in useState. Restock/adjustment mutate only that local state; they do NOT propagate to Products/POS (no shared store). New movement ids come from `createMockId()` in `resources/js/lib/mock-id.ts`. Restock uses the date field via dateToIso(); adjustments must never drive stock_on_hand below 0 (blocked with inline error + danger toast, V6). Low-stock recomputes live from the local catalog.
