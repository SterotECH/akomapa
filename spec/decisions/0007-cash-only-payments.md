# ADR-0007 — Cash / Manual Reconciliation, No Payment Gateway in v1

**Status:** Proposed
**Date:** 2026-08-10

## Context

The SRS assumes cash and manual reconciliation for v1; mobile-money and card
payment gateways are out of scope unless the client confirms otherwise
(SRS §2.4, SRS §6). The system is also LAN-only (NFR-7), so internet-dependent
payment APIs are unavailable offline anyway.

## Decision

The POS records sales and prints/generates a receipt summary; it does not
integrate with any payment provider. Change and payment tracking are manual.
The domain keeps the door open for a future `payment_method` field without
requiring it now.

## Consequences

- **Enables:** full offline operation (NFR-7), no merchant/API setup, no
  liability around payment data in v1.
- **Constrains:** no automated reconciliation against mobile-money/card
  statements; the owner matches receipts manually.
- **Accepted trade-off:** a payment integration can be added later as a new
  feature spec without reshaping the sale model.

## Supersedes / Superseded by
None.
