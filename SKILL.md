---
name: authentica-integration
description: Use when integrating Authentica in web or mobile apps.
version: 1.0.0
author: Saad, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [authentica, authentication, otp, sms, whatsapp, email, biometrics, mobile]
---

# Authentica integration

Integrate Authentica REST API v2 into web and mobile authentication flows through a trusted backend. Covers SMS, WhatsApp and email OTP, face/voice comparison, balance monitoring, operational safeguards and release verification. Authentica proves a verification result; your application owns users, authorization and sessions.

## When to use

- Build, review, debug or migrate an Authentica integration in browser, server-rendered, native, Flutter or React Native applications.
- Design OTP login, contact verification, recovery or step-up authentication.
- Evaluate face/voice verification, templates, fallback behavior or account credits.
- Not a substitute for an identity provider, passkeys, KYC, liveness detection, compliance review or a production security assessment.

## Source authority and loading

Read `references/api-contract.md` before implementing any provider request. Read `references/application-patterns.md` for app/backend flows and `references/verification.md` before testing or release. `references/sources-and-gaps.md` records evidence, documentation conflicts and unanswered provider questions. `references/openapi.snapshot.yaml` preserves the reviewed contract; do not silently treat a snapshot as current. `references/documentation.snapshot.md` archives all reviewed pages, and `references/source-manifest.json` records their URLs, retrieval time, hashes and sitemap coverage. Provider source material retains its original rights; the MIT declaration applies to authored guidance and code.

Sources reviewed on 2026-11-08: every page in https://docs.authentica.sa/llms.txt, cross-checked against the sitemap, plus the OpenAPI specification (info.version 2.0.0). Refresh the relevant live page and https://docs.authentica.sa/openapi.yaml before a new implementation or when behavior differs. The `.md` page variants expose readable API details. If `web_extract` fails on these public URLs, fetch directly with an HTTP client via `terminal` or use `browser_exec`; do not mistake a retrieval failure for service downtime.

**Evidence labels:** the API reference describes provider contracts; application patterns are recommended controls, not provider guarantees. Missing behavior must remain unknown until provider confirmation or authorized live testing.

## Prerequisites

1. Inspect the app's stack, identity/session system, deployment environments and existing auth flows. Do not create a parallel user store by default.
2. Create/configure an application at https://portal.authentica.sa/applications/create. Use separate environments/applications where available; verify isolation rather than assume sandbox support.
3. Store the key in the backend secret manager as `AUTHENTICA_API_KEY` (an integration convention, not a provider-mandated environment variable). Never expose it in client bundles, mobile resources, public env prefixes, logs, crash reports or source control.
4. Record the selected channels, enabled sender identities, template IDs/languages, dashboard OTP settings and credit balance. Confirm unknown expiration, length and retry rules. Do not infer these from example codes.
5. Obtain explicit authorization for live sends, recipients and any biometric processing. Reading documentation requires no credentials; this skill's offline tests require no credentials.

## Hard invariants

- Browser/mobile → your HTTPS backend → `https://api.authentica.sa/api/v2`. Never call the provider directly from shipped clients.
- Provider authentication is the raw API key in `X-Authorization`, not `Authorization: Bearer`.
- Set `Accept: application/json` and JSON `Content-Type` on POST. Explicitly set the send channel and approved template instead of relying on mutable dashboard defaults.
- Verify OTP only when HTTP succeeds **and `status === true`**. Send acceptance uses **`success === true`**. Biometrics require **`success === true` AND `data.result === true`**, plus matching `data.user_id`.
- Do not authenticate from HTTP 200 alone, a success message string, a client-side flag, a send result or a truthy string such as `"true"`.
- The documented send result has `data: null`: do not invent a provider challenge ID. Generate and bind your own opaque challenge server-side.
- Never promise delivery from send acceptance. No delivery receipts/webhook contract is documented.
- Do not blindly retry POST after timeout or 5xx: the operation may already have happened. No provider idempotency contract is documented.
- OTPs are strings; preserve leading zeros. Do not hard-code six digits or a lifetime from examples.
- Biometric comparison is not documented liveness, anti-spoofing, enrollment, identity proofing or native Face ID/Android biometric authentication.

## Procedure

### 1. Define the application contract

Select signup/login/contact-change/recovery/step-up purpose, allowed channels and verified destination policy. Identify the existing account/session owner. Define risk controls, consent and test recipients. For high-value actions prefer stronger factors; SMS and email have takeover risks, and face/voice replay resistance is unproven here.

**Complete when:** destination ownership, session issuance, challenge lifecycle and threat boundaries are explicit.

### 2. Implement a server-only provider adapter

Use `references/api-contract.md` for exact payloads. `templates/authentica-client.mjs` is a dependency-free Node.js 20+ reference adapter with injected transport, strict verdict parsing, timeouts, redirect rejection and no automatic retries. It is not a complete authentication service. Port it into the app's normal server architecture; do not import it in client code. Keep the provider base URL fixed/trusted, never user-supplied.

**Complete when:** malformed responses fail closed, errors contain no key/OTP/biometric data, and every provider operation is tested offline.

### 3. Implement durable challenge orchestration

Follow `references/application-patterns.md`. Store an opaque challenge ID, tenant/provider-application scope, destination, purpose, pre-auth binding, expiry, attempts and state in a shared store. Reserve attempts and enforce cooldown atomically. Serialize send/verify/resend for the provider's destination scope; the provider payload cannot bind a code to your purpose or challenge ID. Do not claim local challenge IDs solve provider-side code reuse or overlap. Resolve provider invalidation/replay semantics before enabling concurrent purposes.

**Complete when:** wrong-purpose, other-user, expired, duplicate, parallel and already-consumed challenges cannot issue a session or authorize an action.

### 4. Integrate web/mobile UX

Use only your own backend routes from clients. Add accessible destination/code entry, paste/autofill, resend countdown based on server timestamps, destination editing, safe channel switching and generic account-existence responses. Handle background/resume, lost connectivity, stale responses and duplicate taps. Store app sessions correctly for the platform; never persist OTPs.

**Complete when:** an actual browser or device/emulator exercises the flow and no provider credential is present in delivered assets or network requests.

### 5. Add biometrics only if justified

Establish trusted reference enrollment, authorization, consent, retention/deletion and provider processing terms before collecting samples. Load reference samples server-side; never trust a client to submit both the reference and query or choose another user's ID. Confirm formats and limits with Authentica before choosing recording/encoding settings. Provide an accessible alternative and an assurance policy for mismatch, unavailable hardware and provider failure.

**Complete when:** identity binding and privacy controls are tested and liveness limitations are stated, not hidden by UI language.

### 6. Operate and verify

Monitor credits via `GET /balance` from an authorized server job, not every user login. Track redacted operation/channel/outcome/latency metrics and alert on auth failures, throttling, provider errors and depleted credits. Apply bounded retries only for safe reads; reconcile ambiguous writes. Run the matrix in `references/verification.md` and review unresolved questions in `references/sources-and-gaps.md`.

**Complete when:** offline tests and authorized live evidence are separately reported; release-critical gaps have owners and decisions. If no credentials/consent exist, deliver the integration and offline evidence without claiming live delivery or authentication was tested.

## Pitfalls

- Generated clients may miss conditional destination requirements: the send schema has no required-field list even though its prose requires phone/email by channel.
- The workflow shows `otp` and `fallback_email` on send and both phone/email on verify; the endpoint schemas do not define full behavior for these combinations. Gate them behind confirmed contracts; use one destination for the normal path.
- A successful biometric operation can return `result: false`.
- `template_id: 31`, masked phone strings and `123456` are examples, not universal defaults or valid test credentials. The documented template default is 1; select an approved template explicitly.
- Balance is in credits, not SAR or a published per-message price.
- Account creation, JWT/session issuance, refresh, logout, MFA policy and account linking are app responsibilities, not documented Authentica endpoints.
- SDKs, sandbox URLs, registration endpoints, custom headers, OTP TTL parameters, webhook signatures and error codes must not be invented.

## Verification commands

Resolve this skill's directory using `skill_view`, then run through `terminal`:

```text
node --test <skill-dir>/scripts/authentica-client.test.mjs
```

No network or secrets are used by that test suite. Read the test names and report actual results. Live requests are a separate authorized step, not part of the skill installation.
