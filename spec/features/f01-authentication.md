# Feature F01 — Owner Authentication & Password Reset

SRS: FR-5.1, FR-5.2, NFR-6. Status: Draft.

## Overview

The Owner logs in with username/password to use the system. Exactly one Owner
account exists in v1 (domain V7, ADR-0005). The Owner can reset their own
password. Access is restricted to the shop's local network.

## Requirements

| ID | Requirement |
| --- | --- |
| FR-5.1 | System requires login (username/password) for the single Owner account. |
| FR-5.2 | Owner can reset their own password. |
| NFR-6 | Passwords stored hashed; access restricted to the shop's local network. |

## Flows

### Login (happy path)
1. Owner opens the app → redirected to `/login`.
2. Enters username + password.
3. Valid credentials → session created → redirected to POS.
4. Invalid credentials → inline error, no account enumeration detail.

### Logout
1. Owner selects Logout in the navigation.
2. POST `/logout` → session destroyed → redirect to `/login`.

### Password reset
1. From `/login`, Owner selects "Forgot password".
2. Submits username → reset link delivered locally (email/print depending on
   deployment; link is valid for a short window).
3. Opens link → sets new password (confirmation required).
4. New password works for subsequent logins.

## Rules & edge cases

- Passwords hashed with Laravel's default bcrypt/argon hasher (NFR-6).
- Session expires after idle timeout (configurable; default 120 min).
- Login rate-limited to slow brute force on the local network.
- Only one Owner record may be active (V7). Seeding creates the initial Owner
  from `config/shop.php` or first-run setup, with a forced password change.

## Acceptance criteria

1. Unauthenticated navigation to any protected route redirects to `/login`.
2. Wrong password shows a generic error and logs the attempt.
3. Successful login lands on the POS screen.
4. Logout clears the session; back-button replay does not restore access.
5. Password reset flow completes end-to-end and old password stops working.
