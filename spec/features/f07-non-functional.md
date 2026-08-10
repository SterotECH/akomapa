# Feature F07 — Non-Functional Requirements

SRS: NFR-1–NFR-8. Status: Draft. These apply to every feature.

## Requirements

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-1 | Performance | Product search/autocomplete returns in under 1 second for catalogs up to 2,000 products. |
| NFR-2 | Usability | A typical 3–5 item sale is completable in under 60 seconds by the Owner after basic training. |
| NFR-3 | Data integrity | Stock quantities never go negative through normal sale/restock flows; block or warn on over-selling. |
| NFR-4 | Availability | Accessible via standard web browsers (Chrome, Edge, Safari, current versions) on desktop and tablet. |
| NFR-5 | Backup | Full data backup export on demand (e.g. USB drive); simple documented backup routine. |
| NFR-6 | Security | Passwords stored hashed; access restricted to the shop's local network. |
| NFR-7 | Hosting | Runs entirely on a local server/PC within the shop's LAN, no internet dependency; built so a future cloud migration does not require a full rebuild. |
| NFR-8 | Barcode input | Accepts standard USB/Bluetooth barcode scanner as keyboard-wedge, no driver install. |

## Design consequences

### NFR-1 (performance)
- Search index on name + SKU; server-side limit; client-side autocomplete with
  debounce. Verified by a load test at 2,000 products.

### NFR-2 (usability)
- Keyboard-first POS: scan or type → add → quantity → complete. Tap targets ≥
  44px for tablet use. Measured in acceptance testing (F04).

### NFR-3 (data integrity)
- Enforced at two layers: UI guard on the cart (F04) and a hard validation on
  the server (`sales.store`, `stock.adjustments`) that blocks any movement that
  would drive stock below zero. See domain V3.

### NFR-4 (browsers)
- Target Chromium, Edge, Safari current releases; responsive desktop + tablet.
- The POS layout degrades gracefully to tablet widths.

### NFR-5 (backup)
- `GET /backup/download` produces a portable backup file (SQLite snapshot or
  dump). The owner is given a simple routine (e.g. "download backup every
  Friday to the USB drive"). Tested by restore-to-fresh-instance.

### NFR-6 (security)
- bcrypt/argon hashed passwords; login rate-limited; app bound to the LAN
  interface in deployment docs. No internet-facing exposure in v1.

### NFR-7 (local-first, cloud-ready)
- All data access through Eloquent (no raw SQLite-specific SQL). Config-driven
  DB connection so switching to MySQL/Postgres in the cloud is a config change,
  not a rebuild. No hard-coded absolute file paths or localhost URLs in the
  data layer. Full local operation with zero internet calls.

### NFR-8 (barcode)
- Keyboard-wedge protocol: a scan is a fast character burst ending in
  Enter/Return. Detection logic lives in the POS and restock entry components
  (F04/F03) and requires no driver.

## Verification

- NFR-1: timed search test at the catalog cap.
- NFR-2: timed 3–5 item checkout test.
- NFR-3: property test — no sequence of valid operations yields negative stock.
- NFR-4: browser matrix smoke test (Chrome/Edge/Safari, desktop + tablet).
- NFR-5: backup export + restore drill.
- NFR-6: password-hash check + LAN-only binding review.
- NFR-7: offline run (airplane mode) works; DB driver swap test passes.
- NFR-8: scan-input test with a keyboard-wedge emulator.
