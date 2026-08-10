# ADR-0001 — Inertia + React SPA on Laravel

**Status:** Proposed
**Date:** 2026-08-10

## Context

The system is a local-first, single-owner inventory + POS tool served on the
shop's LAN (NFR-7), used on desktop and tablet (NFR-4), with a fast,
keyboard-first checkout (NFR-2). We need a responsive, stateful UI with instant
search/autocomplete (NFR-1) and rich cart interaction, without standing up a
separate JSON API or a second deployment.

## Decision

Build the frontend as an Inertia v3 + React SPA rendered from Laravel, styled
with Tailwind CSS v4. Pages and mutations are regular web routes; the React
tree owns cart/search state; server stays the single source of truth for data
and validation.

## Consequences

- **Enables:** fast client-side navigation, instant search, local cart state,
  no separate API surface to version/maintain.
- **Constrains:** UI depends on server-rendered Inertia props; mutations go
  through web routes (CSRF); the frontend cannot be deployed independently.
- **Accepted trade-off:** a small initial setup cost (Inertia middleware,
  Wayfinder) is amortized by one-codebase operation for a single shop.
- **Migration-safe (NFR-7):** data lives behind Eloquent (ADR-0002); if cloud
  hosting later requires a headless API, Inertia pages can be replaced by API
  resources without touching domain logic.

## Supersedes / Superseded by
None.
