---
paths:
  - resources/js/pages/Pos.tsx
---

# Pages

## POS register heights differ per breakpoint; cart never stacks below products
The AppLayout chrome consumes 10rem (<sm), 11rem (sm–lg, bottom nav visible), or 7rem (lg+, bottom nav hidden) of vertical space. The POS container must be h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-11rem)] lg:h-[calc(100dvh-7rem)] — a single 11rem calc leaves a 4rem gap on lg. Products pane scrolls internally (min-h-0 flex-1 overflow-y-auto). Below md the cart is NOT rendered in-flow under the grid; instead a fixed cart bar (bottom-16) opens the cart in a Drawer with the footer pinned to Complete Sale. Inline feedback is toasts (Toast.tsx/useToasts), never a line that shifts the grid.
