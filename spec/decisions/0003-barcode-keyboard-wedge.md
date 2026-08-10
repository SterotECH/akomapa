# ADR-0003 — Barcode Scanning via Keyboard-Wedge

**Status:** Proposed
**Date:** 2026-08-10

## Context

Barcode scanning is an optional accelerator (SRS §2.2, FR-3.2a, FR-2.6). The
client uses standard USB/Bluetooth scanners and must not install drivers or
specialized hardware (NFR-8). Camera scanning and scanner-SDK integrations
are explicitly out of scope.

## Decision

Treat the scanner as a keyboard-wedge device: scans arrive as fast character
bursts ending in Enter/Return. The app detects a burst (input cadence + a
terminating Enter) in the POS and restock entry fields, resolves the scanned
code against the catalog, and adds/locates the product automatically — no extra
button press. Manual typing never accidentally triggers an add.

## Consequences

- **Enables:** zero-driver operation on any USB/Bluetooth keyboard-wedge
  scanner, on desktop and tablet.
- **Constrains:** detection is heuristic (cadence + Enter); very slow manual
  typing near the field is distinguishable, but ambiguous cases can be tuned.
- **Accepted trade-off:** no camera/barcode-from-image support in v1; fine for
  a shop that scans physical items.

## Supersedes / Superseded by
None.
