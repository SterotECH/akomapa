---
paths:
  - 'resources/css/**'
---

# Css

## Never define --spacing-* named tokens in @theme
Tailwind v4 resolves max-w-*/w-*/min-w-* from the namespaces ["--max-width"/"--width"/"--min-width", "--spacing", "--container"] in order. Defining --spacing-sm/md/lg/xl (8/16/24/32px) shadows the container scale, so max-w-sm collapsed to 8px, max-w-md to 16px, max-w-lg to 24px — crushing Login, Placeholder, Modal, Drawer. Fixed 2026-08-11 by removing those tokens; max-w-sm/md/lg now resolve to --container-sm/md/lg (24/28/32rem). Keep using named max-w-sm/md/lg and numeric spacing utilities; never reintroduce --spacing-* static tokens.

## Dark theme = CSS-variable flip, not dark: variants
Semantic colors (linen, white, line, raisin, spanish-gray) and shadows are CSS vars defined in :root and overridden in .dark — so every utility adapts automatically; never write per-component dark: classes. Static tokens (same both themes): amber*, green*, danger*, chrome (#242124 sidebar/scrim), chrome-text (#f5f5f5), amber-ink (#242124 text on amber fills). Radii: sm 6px / md 8px / lg 12px — all components use the tokens, no hardcoded radii.
