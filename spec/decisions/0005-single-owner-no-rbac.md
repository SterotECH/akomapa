# ADR-0005 — Single Owner, No RBAC in v1

**Status:** Proposed
**Date:** 2026-08-10

## Context

The SRS defines a single user: the shop owner (SRS §1.3). Multi-staff accounts
and role-based permissions are explicitly out of scope for v1 (SRS §6).

## Decision

Model exactly one Owner account. No roles, permissions, or staff profiles in
v1. Domain invariant V7 enforces at most one active User.

## Consequences

- **Enables:** the simplest possible auth surface (login/logout/reset), less UI
  chrome (no user switcher), faster builds.
- **Constrains:** there is no audit trail by-staff in v1; sales are attributed
  to the single Owner. If multi-user is added later, `Sales.recorded_by` can be
  introduced without reshaping the domain.

## Supersedes / Superseded by
None.
