# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The **shop owner** of **Akomapa Neat Enterprise** (Ablekuma 10 Plot, GC-104-444, Ghana) — a single-operator small retail shop. Their job, day to day: keep the catalog up to date, record stock received and sold, take money at the counter during busy hours, and hand over printable reports. There is exactly one user; no staff accounts in v1.

## Product Purpose

A web-based **Inventory & Sales Management System** for a small retail shop: product catalog, stock-in / stock-out, a point-of-sale for recording sales, and printable reports. Success = the owner runs the whole day (catalog, stock, sales, low-stock, reports) from one tool that works **entirely on the shop's own LAN with no internet** — no paper, no manual stock ledger.

## Positioning

The mechanism a neighboring product could not truthfully copy: a **complete POS + inventory system that runs fully offline on the shop's own network, is optional-barcode by design, and is built for one owner-operator** — no cloud account, no subscription, no internet dependency for core operation, architected so it can later move to cloud without a rebuild.

## Operating Context

- The owner works at the shop counter, often during a rush; speed on a 3–5 item sale matters (NFR-2).
- Devices: desktop (monitor + keyboard + optional USB/Bluetooth barcode scanner) and tablet, both in the shop; **responsive layout, one codebase** (confirmed).
- Currency is Ghana Cedi (GHS); cash / manual reconciliation only in v1 (no payment gateways).
- Barcode scanning is an optional accelerator (keyboard-wedge, no drivers); typing/search always works.
- All money stored as integer pesewas; all IDs are ULIDs (ADR-0006, ADR-0008).
- Reports are read on screen and printed/saved as PDF from the shop's own printer.

## Capabilities and Constraints

- **Catalog:** create/edit/deactivate products (name, SKU, optional barcode, category, unit, cost price, selling price, reorder threshold); unique SKU & barcode; CSV/Excel bulk import with per-row error report.
- **Stock:** restock entry (with supplier note + date, barcode-locate), bulk stock import, auto-decrement on sale, low-stock flag, per-product movement history, manual adjustments; stock never goes negative.
- **Sales (mini POS):** search/autocomplete by name or SKU, scan-to-add, quantity, optional per-line price override, auto totals, same-day void restores stock.
- **Reports:** current stock levels, low stock, sales by date range; on-screen + printable PDF.
- **Auth:** single owner login (username/password, hashed), own password reset; access restricted to the local network.
- **Backup:** on-demand full data backup export (e.g. USB), with a documented routine.
- **Constraints:** single user, no RBAC; LAN-only, no remote access in v1; no payment integration; no scale/weighed-goods integration; VAT treatment to be confirmed with client.

## Brand Commitments

- **Real shop identity:** "Akomapa Neat Enterprise" and its address (Ablekuma 10 Plot, GC-104-444) appear in the app and on printed reports. No invented logo or brand — typographic wordmark only.
- **Ghanaian realism:** GHS throughout; sample data uses realistic Ghanaian product names, categories, and prices, labeled synthetic.
- **SRS scope is sacred:** nothing outside the SRS gets invented as a feature (no multi-user, no cloud, no gateways, barcode stays optional).
- **Pinned visual system:** the confirmed Behance POS design system — Linen warm background, Cultured White cards, Raisin Black nav/text, Amber primary accent + Green positive accent, Spanish Gray secondary — is the binding visual language.

## Evidence on Hand

- Source of truth: `Inventory_Management_SRS.docx` (v0.2, 2026-08-09) → distilled into `/spec` (domain, features, interfaces, decisions).
- Behance reference: POS for Restaurant | Table Booking POS System (Prafful Kumar) — design-system palette confirmed by the client.
- **Absences (do not fabricate):** no real catalog data, no verified prices, no shop logo, no supplier list, no staff. Any demonstration data is explicitly synthetic and labeled.

## Product Principles

1. **Offline-first trust.** The app never depends on the internet for core operation; nothing in the data layer assumes a hosted environment.
2. **Speed at the counter wins.** Default entry is type/search; scan is a bonus; a 3–5 item sale is a few taps, under a minute.
3. **The history is the inventory.** Stock is derived from movements; every change is traceable; stock can never go negative.
4. **One owner, one truth.** No staff roles, no tenant complexity — the domain stays as small as the shop.
5. **Realism over decoration.** Ghanaian context and the confirmed Behance visual language; anything invented is labeled synthetic.

## Accessibility & Inclusion

- NFR-4: current Chrome, Edge, Safari on desktop and tablet; responsive down to tablet portrait.
- WCAG AA contrast on text and controls; larger touch targets (≥44px) for the tablet path; keyboard-first POS flow.
- Money and quantities render with tabular figures for legible scanning.
