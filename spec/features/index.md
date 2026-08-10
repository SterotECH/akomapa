# Features — Index

Active features for v1, each mapped to SRS functional requirements (FR-*).

| Doc | Feature | Covers (SRS) |
| --- | --- | --- |
| [f01-authentication.md](./f01-authentication.md) | Owner authentication & password reset | FR-5.1, FR-5.2, NFR-6 |
| [f02-product-catalog.md](./f02-product-catalog.md) | Product / catalog management | FR-1.1, FR-1.2, FR-1.4 |
| [f03-stock-management.md](./f03-stock-management.md) | Stock received, movements, low-stock flag | FR-2.1, FR-2.3, FR-2.4, FR-2.5, FR-2.6 |
| [f04-sales-pos.md](./f04-sales-pos.md) | Mini POS — new sale, checkout, void | FR-3.1–FR-3.5, NFR-1, NFR-2, NFR-8 |
| [f05-reports.md](./f05-reports.md) | Printable reports (stock, low stock, sales) | FR-4.1–FR-4.4 |
| [f06-import-export.md](./f06-import-export.md) | CSV/Excel bulk import + error report | FR-1.3, FR-2.2 |
| [f07-non-functional.md](./f07-non-functional.md) | Non-functional requirements | NFR-1–NFR-8 |

Cross-cutting rules shared by all features live in the domain model invariants
(V1–V9) and the decision records (`/spec/decisions/`).
