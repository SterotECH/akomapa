# ADR-0002 — Local-First Storage That Can Migrate to Cloud

**Status:** Proposed
**Date:** 2026-08-10

## Context

The client requires the system to run entirely on a local server/PC inside the
shop's LAN with no internet dependency (SRS §2.3, NFR-7), while explicitly
planning a possible future move to cloud hosting without a full rebuild.

## Decision

Use Laravel's default relational storage behind Eloquent. SQLite is the v1
default driver (zero-setup, single-file, perfect for LAN backup to USB), but
the data layer uses only portable Eloquent features — no raw SQLite-specific
SQL, no absolute paths, no localhost assumptions in code. Switching to
MySQL/Postgres for cloud hosting is a config change plus a data migration.

## Consequences

- **Enables:** single-file `database.sqlite` snapshot for backups (NFR-5),
  offline operation (NFR-7), and a low-friction cloud migration path.
- **Constrains:** migration/dumper tooling must remain DB-agnostic; SQLite
  locking characteristics (single-writer) are acceptable for a one-owner shop.
- **Accepted trade-off:** SQLite is not designed for heavy concurrent writes;
  acceptable given single-Owner usage (ADR-0005).

## Supersedes / Superseded by
None.
