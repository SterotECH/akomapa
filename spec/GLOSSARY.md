# GLOSSARY — Canonical Terminology

> This file is the canonical source for all domain terminology. Code, comments,
> feature specs, and UI copy must use these terms verbatim. If a term appears in
> code that is not listed here, add it before merging. If code uses a different
> word than the glossary, the code is wrong.

| Term | Definition |
| --- | --- |
| **Owner** | The single human user of the system. The shop owner/operator at Akomapa Neat Enterprise. No other user types exist in v1. |
| **Product** | A distinct sellable item in the catalog. |
| **Catalog** | The full set of active products the shop sells. |
| **SKU** | Stock Keeping Unit — a unique code that identifies a product. Must be unique across the catalog. |
| **ULID** | The identifier format for all primary/foreign keys — a 26-character, time-ordered, collision-safe string (ADR-0008). Always treated as an opaque string, never parsed. |
| **Barcode** | Optional machine-readable code assigned to a product. Must be unique across the catalog when present. |
| **Category** | Optional grouping applied to products (e.g. "Beverages", "Provisions"). |
| **Unit** | The unit of measure a product is counted in (e.g. piece, box, bottle, kg). |
| **Cost Price** | The price the shop pays to acquire one unit of a product. |
| **Selling Price** | The price at which one unit of a product is sold. |
| **Reorder Threshold** | The Stock On Hand level at or below which a product is flagged as Low Stock. |
| **Stock On Hand** | The current quantity of a product available for sale. Never negative (NFR-3). |
| **Low Stock** | The state of a Product whose Stock On Hand is at or below its Reorder Threshold. |
| **Restock** | A Stock Movement of type `restock` — manual entry of stock received into inventory. |
| **Manual Adjustment** | A Stock Movement of type `adjustment` — a correction to Stock On Hand outside a restock or sale. |
| **Stock Movement** | A single recorded change to a Product's stock (restock, sale, or manual adjustment). The only way Stock On Hand changes. |
| **Movement History** | The ordered list of Stock Movements for a Product. |
| **Sale** | A completed transaction recording items sold at the point of transaction. |
| **Sale Line Item** | One product/quantity/unit-price row within a Sale. |
| **Line Total** | Sale Line Item quantity × unit price. |
| **Sale Total** | The sum of all Line Totals for a Sale. |
| **Complete Sale** | The act of finishing a Sale, recording it permanently and decrementing stock. |
| **Voided Sale** | A completed Sale that has been reversed within the same day, restoring stock. |
| **Barcode Scanner** | A standard USB or Bluetooth barcode scanner operating as a keyboard-wedge device. |
| **Keyboard-wedge** | The scanner mode in which scanned data arrives as fast keyboard input, requiring no driver or integration. |
| **Checkout** | UI flow for adding items and completing a Sale (mini POS). |
| **GHS / Ghana Cedi** | The currency of the system. Monetary values are stored as integer minor units (pesewas) — see ADR-0006. |
| **Current Stock Levels Report** | Report listing all products with Stock On Hand and value. |
| **Low Stock Report** | Report listing products at or below Reorder Threshold. |
| **Sales Report** | Report of items sold, quantities, and revenue for a selected date range. |
| **Data Backup** | A full export of system data, taken on demand (e.g. to a USB drive). |
| **Local Network / LAN** | The shop's private Wi-Fi/LAN that hosts and serves the system. No internet dependency. |
