# Verification and release checklist

Separate documentation review, local mocked tests and authorized live integration evidence. Passing mocked tests does not establish delivery, provider configuration or production readiness.

## Offline adapter checks

Run via `terminal`: `node --test <skill-dir>/scripts/authentica-client.test.mjs` (Node.js 20+).

The bundled adapter is transport/contract reference code, not a challenge store or complete auth service. Its tests use explicitly mocked responses, never a real recipient. Expand tests in the target project using its existing test runner.

- Exact base URL, methods, headers and JSON fields; no Bearer prefix or caller-controlled URL.
- OTP string and leading zeros preserved; exactly one destination; channel/template validated.
- Send `success: true`; verify `status: true`; reject `success: true` as OTP proof.
- Biometric `success: true/result: false` denies; returned user mismatch denies.
- Boolean verdicts only, no string/number coercion; malformed/missing fields fail closed.
- 401, unexpected 4xx, 429, 5xx, timeout, connection error, invalid JSON and redirects deny.
- No automatic POST retry, no credentials in thrown errors, no raw response leakage.
- Balance is finite numeric credits, not a string or boolean.

## Application integration tests (not supplied by the adapter)

Use a transactional test database/shared-store implementation, not just frontend unit tests.

1. Send → verify → app session or action grant; only correct subject/purpose receives it.
2. Wrong/expired code, exhausted attempts and expired local challenge deny.
3. Altered destination, tenant, user, purpose, challenge ID or pre-auth binding deny.
4. Duplicate/parallel verification and action requests create at most one grant/action; retries cannot steal a completed result.
5. Concurrent send/resend/channel switch does not permit stale generation finalization. Unknown provider outcomes do not trigger silent resend.
6. Atomic rate limits work across multiple instances and survive restarts; new challenges do not reset the destination abuse budget.
7. Provider outage/malformed success/false verdict never issues a session.
8. Account linking/contact changes/recovery cannot bypass existing identity ownership/MFA policy.
9. CSRF, unsafe CORS, session fixation and client-side-only validation are rejected.
10. Logs, traces, error reporting, screenshots, bundles and mobile resources contain no provider keys, OTPs or raw media.
11. Biometric reference is server-selected; malicious user IDs, replacement references, oversized/invalid media and mismatch deny.
12. Session expiry, refresh/revocation and logout work in the existing application auth system.

## Web/mobile interaction tests

Exercise real browser and applicable emulator/device:
- Paste/autofill, leading zeros, accessible labels/focus/error announcements and Arabic RTL/LTR isolation.
- Invalid destination/code, edit destination, resend cooldown, channel switch and back navigation.
- Double taps, delayed/stale responses, offline/reconnect, app background/resume and expired challenges.
- No raw provider request or credential visible client-side.
- Secure cookie/CSRF policy on web; secure token storage and logout on mobile.
- Permission denied/interrupted camera or microphone; cancel capture; cleanup; non-biometric alternative.
- Do not claim all devices supported from a single desktop browser test.

## Authorized live tests

Do not automatically run live sends, spend credits or process biometrics while installing this skill. First record approved test account, environment, destinations/channels and consent. Never request the API key or OTP in chat; use secure secret provisioning and have the user enter the code through the application.

1. `GET /balance` validates credentials and records credits without exposing the key.
2. Send through each configured channel to approved recipients with approved templates.
3. Separately record API acceptance and observed recipient receipt; acceptance is not delivery.
4. Verify a real code through the app; ensure the application session/action is issued once.
5. Test wrong, expired, repeated, resent and overlapping codes under an agreed abuse/cost budget. Record actual provider error shapes and replay semantics without saving the codes.
6. Verify phone/email normalization, fallback only if enabled, and template/autofill compatibility.
7. For biometrics, use consented test samples under approved retention controls; test a match and mismatch without interpreting them as a comprehensive accuracy benchmark.
8. Test an allowed key rotation/deployment procedure and observe operational alerts without disrupting production.
9. Delete temporary samples/test secrets according to policy and record remaining gaps.

## Evidence report

Record environment, commit/config version, selected channel/template IDs, documentation version, timestamp, test case, expected result, observed result and sanitized evidence reference. State which results are mocked, browser/device-tested or provider-live-tested. Never include raw codes, key headers or personal biometric samples in the report.

Release gates: security owner signs off challenge/replay semantics; privacy owner signs off biometric processing if used; backend owner signs off rate limits/monitoring/failure handling; product owner signs off channel/UX behavior. If any required evidence is missing, report the precise blocker, responsible owner, next confirmation/test and the working scope already delivered.
