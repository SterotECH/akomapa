# ADR-0004 — Reports as HTML Views + Browser Print/PDF

**Status:** Proposed
**Date:** 2026-08-10

## Context

Three reports must be viewable on screen and exportable/printable as PDF
(FR-4.4), generated from live StockMovement and Sale history (SRS §5). A PDF
generation library adds a dependency and server complexity for little gain.

## Decision

Render each report as an on-screen HTML table styled for print, and export PDF
via the browser's print dialog using a dedicated `@media print` stylesheet that
hides navigation, sidebar, and buttons while keeping a minimal brand header
(shop name, address, generated date).

## Consequences

- **Enables:** identical on-screen and printed output, no extra dependency,
  "Save as PDF" on any modern browser.
- **Constrains:** exact pagination control (page-break fiddling) lives in CSS;
  not suitable for producing thousands of pages.
- **Accepted trade-off:** print fidelity depends on browser; acceptable for a
  shop printing a few pages per report.

## Supersedes / Superseded by
None.
