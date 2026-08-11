---
paths:
  - 'resources/js/**'
---

# Js

## UI must follow DESIGN.md → UI_BUILD.md
The binding UI conventions live in DESIGN.md (Warm Paper palette, Amber–Green Rule, One-Action Rule, Counter Rule, Raisin Sidebar) and the build recipe in UI_BUILD.md. Tokens come from the @theme block in app.css; no raw hex in JSX. Motion limited to wobbly/gentle/fast springs. Keep one amber primary CTA per view; destructive actions are plain + confirm.

## Wayfinder groups dotted route names into folders
Wayfinder maps dotted route names to nested modules: `pos.index` → `@/routes/pos` exporting `index`. Use `import { index as pos } from '@/routes/pos'`, not `import { pos } from '@/routes'` (that export does not exist and the build fails with MISSING_EXPORT). Non-namespaced routes (dashboard, logout) export directly from `@/routes`.
