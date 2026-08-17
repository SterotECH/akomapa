---
paths:
    - resources/js/pages/Pos.tsx
    - resources/js/pages/Products.tsx
    - resources/js/pages/Stock.tsx
    - resources/js/pages/Reports.tsx
---

# Pages

## POS register heights differ per breakpoint; cart never stacks below products

The AppLayout chrome consumes 10rem (<sm), 11rem (sm–lg, bottom nav visible), or 7rem (lg+, bottom nav hidden) of vertical space. The POS container must be h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-11rem)] lg:h-[calc(100dvh-7rem)] — a single 11rem calc leaves a 4rem gap on lg. Products pane scrolls internally (min-h-0 flex-1 overflow-y-auto). Below md the cart is NOT rendered in-flow under the grid; instead a fixed cart bar (bottom-16) opens the cart in a Drawer with the footer pinned to Complete Sale. Inline feedback is toasts (Toast.tsx/useToasts), never a line that shifts the grid.

## Products catalog is per-page mock state (no shared store)

The Products page keeps its own `catalog` in useState seeded from mock-data; add/edit/deactivate only mutate that local list. There is no shared store, so deactivation does NOT propagate to the POS page (which reads activeProducts from mock-data.ts). New ids are client-generated fake ULIDs via `createMockId()` from `resources/js/lib/mock-id.ts` (shared with the Stock page). V1 uniqueness is validated client-side against the local catalog, excluding the row being edited.

## Stock forms live in drawers; catalog/movements are per-page mock state

Stock keeps its own `catalog` (seeded from activeProducts) and `movements` (seeded from stockMovements) in useState; mutations do NOT propagate to Products/POS (no shared store). Both forms (restock, adjustment) live in Drawers opened by the page-header buttons; the low-stock "Restock" shortcut opens the restock Drawer prefilled via restockPresetId. New movement ids come from `createMockId()` in lib/mock-id.ts. Restock uses the date field via dateToIso(); adjustments must never drive stock_on_hand below 0 (inline error + danger toast, V6); low-stock recomputes live.

## Reports is per-page mock state; tabs/range are client-side

Reports seeds products (activeProducts) and sales (mockSales) from mock-data.ts in useState-free prop defaults; tabs and the Sales from/to range are client state, no backend round-trips. mockSales is a generated Sale[] register spanning the last 7 days (sale_number TS-2026-xxxx, line_items with real totals). Print: the page wraps content in .print-area with a print-only .report-header (wordmark + "Ablekuma 10 Plot, GC-104-444"); controls carry .no-print. Print stylesheet (resources/css/print.css) forces black text + transparent backgrounds so dark theme never leaks into print. Money via Money/formatGhs, tabular-nums (V8).
