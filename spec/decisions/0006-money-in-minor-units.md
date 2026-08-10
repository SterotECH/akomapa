# ADR-0006 — Money Stored as Integer Minor Units (Pesewas)

**Status:** Proposed
**Date:** 2026-08-10

## Context

All monetary values — cost price, selling price, line totals, sale totals,
report values — are in Ghana Cedi (GHS, SRS §2.4). Floating-point storage of
currency causes rounding drift (e.g. 0.1 + 0.2), and GHS has 100 pesewas per
cedi.

## Decision

Store every monetary field as an **integer count of pesewas**. Display layers
and CSV import/export convert between decimal GHS and integer pesewas at the
boundary (formatting helpers on the frontend; cast/accessor on the backend).
Prices are entered as decimal GHS and immediately converted.

## Consequences

- **Enables:** exact totals (invariant V6), no floating-point drift, simple
  comparison and summation in SQL.
- **Constrains:** every boundary must convert; a single shared helper is used
  for format and parse to avoid drift.
- **Accepted trade-off:** two extra code sites (parse/format) versus a class of
  currency bugs.

## Supersedes / Superseded by
None.
