# Application integration patterns

These are recommended application controls, not features promised by Authentica. Choose framework-native implementations after inspecting the existing project.

## Trust boundary

```text
Browser / iOS / Android / Flutter / React Native
    | app HTTPS routes; no provider key
Backend / BFF / serverless function
    | secret manager + shared challenge/rate-limit store
    | raw key in X-Authorization
Authentica API v2
```

Serverless/edge execution still requires server-only secrets, durable cross-instance state, atomic operations, bounded execution time and no public caching of auth responses. In Next.js or similar frameworks, place the adapter in a server-only module and avoid public environment prefixes. CORS does not protect a key embedded in a client. Obfuscation does not protect a key in a mobile binary.

## Suggested app-owned routes

The following paths are proposals for YOUR backend, not Authentica endpoints:

- `POST /auth/challenges`: accept approved purpose, channel and destination. Validate, rate-limit and bind to a pre-auth session; return opaque challenge ID, masked destination, app expiry and resend eligibility time.
- `POST /auth/challenges/:id/verify`: accept only code and binding/CSRF proof. Load the stored destination/purpose; call provider verify; atomically finalize the authorized action.
- `POST /auth/challenges/:id/resend`: enforce binding, limits and serialized destination policy; create a new generation and invalidate the old local generation.
- Contact change or biometric enrollment: require existing authenticated session plus fresh proof under an explicit security policy, not merely a public challenge ID.

Use non-cacheable responses (`Cache-Control: no-store`). Bind anonymous flows to an unguessable pre-auth session. Consider signed short-lived bindings for mobile; a freely transferable challenge ID alone is not enough. Use generic public responses for existing/nonexistent accounts without masking infrastructure outages from operators.

## Durable challenge record

Store opaque random ID; tenant; provider application/environment; exact canonical destination; allowed channel; purpose/action hash; authenticated user ID if applicable; pre-auth/device session binding; creation and local expiry; resend-not-before; generation; attempts/max attempts; state; operation lease/version. Store only necessary PII, encrypted as appropriate. Prefer keyed hashes for destination correlation/rate-limit keys. Do not store raw OTPs or key material in challenge records.

Example state machine:

```text
created -> sending -> pending -> verifying -> consumed
                 \-> send_unknown / failed
pending -> expired / locked / superseded
verifying -> pending (explicit negative with attempts remaining)
          -> verify_unknown / failed (ambiguous transport)
```

All transitions are compare-and-swap/transactional. Do not hold a database transaction open across slow network calls; use a leased in-flight operation token and versioned finalization. Reserve an attempt before calling the provider. Only the worker owning the current operation/version can finalize. Define crash/lease-expiry recovery; do not automatically repeat a POST when its previous result is unknown. Reject verification outside `pending` or the matching reserved operation. Serialize concurrent taps and replayed requests.

After positive verification, consume the challenge once and transactionally create the app authorization/session record or a short-lived single-use grant. Delivery of a session cookie/token can be retried under the same client binding without re-verifying the OTP. Do not expose a reusable `verified=true` client flag. Never run the protected action twice after a dropped HTTP response.

### Important provider-scope limitation

The provider verifies by destination and code, not your challenge ID or purpose. Local IDs cannot cryptographically bind a provider code to a purpose or generation. Until isolation is confirmed, serialize active flows across **all purposes/channels sharing a destination within one provider application**, not only within one browser. Determine provider scope across applications with support; do not assume tenant isolation simply from local table keys.

Invalidating a local challenge does not prove its provider code is invalidated. Resend, SMS-to-WhatsApp switching, parallel login/recovery and restarting a challenge may leave reusable/overlapping codes. Confirm code replacement, one-time consumption, verification scope and TTL. For high-risk purposes, do not ship until these semantics are known or isolated by a confirmed provider mechanism. Local attempt/TTL controls cannot fix provider replay across newly created challenges on their own.

## Anti-abuse and authorization

- Rate-limit sends and verifies independently per destination, IP, pre-auth session, account and tenant; enforce global spending limits. Include challenge creation and resend in the same abuse budget.
- Use shared atomic counters with expiry; process-local memory is insufficient on multi-instance systems.
- Configure app limits explicitly; they are not provider limits. Align local expiry with confirmed provider expiry, never extend it on app resume.
- Bound body sizes and OTP string lengths from verified settings; preserve leading zeros. Never infer the configured length from the six-digit example.
- Add risk-based bot controls; avoid allowing an attacker to permanently lock out a victim through destination-only counters.
- Prevent account enumeration using consistent messaging and timing where practical. Audit account creation/linking races with unique identity constraints.
- Contact changes prove possession of the NEW contact and require authorization from the existing account; never silently merge accounts by destination.
- Recovery is not an unrestricted fallback around MFA. Define recovery assurance and notify existing trusted contacts when appropriate.
- Prefer phishing-resistant authentication for administrators/high-risk actions. OTP channel switching must not silently downgrade the required assurance.

## Web implementation

Use HTTPS, secure HttpOnly cookies and appropriate SameSite settings for app sessions; add CSRF protection and Origin checks for cookie-authenticated state changes. Rotate session identifiers on authentication, expire sessions, support logout/revocation, and apply CSP/XSS protections. Do not put long-lived session tokens in localStorage by default.

Use a single accessible OTP input or correctly labeled grouped inputs with paste support. `autocomplete="one-time-code"` is useful; numeric `inputmode` only when the confirmed code format is numeric. Normalize localized digits only under an explicit UI policy before server validation; do not trim leading zeroes. Render destination/code in readable LTR isolation inside Arabic RTL screens. Use neutral error copy, focus management and screen-reader announcements. A countdown is UX, not enforcement.

WebOTP/SMS autofill depends on browser/platform support and required message format; confirm template control before promising it. On camera/microphone capture use secure contexts, explicit permission, cleanup of tracks, no third-party analytics capture and no raw sample console logging.

## Mobile implementation

Use the same backend contract for Swift/Kotlin, Flutter and React Native. Store issued app refresh/session secrets in Keychain/Keystore-backed storage appropriate to the framework, not ordinary preferences/AsyncStorage. Keep access tokens short-lived and implement refresh rotation/revocation according to the existing auth system; these are not Authentica features.

Offer platform OTP autofill where supported, with manual entry fallback. Verify iOS one-time-code behavior and Android SMS Retriever/User Consent template/hash requirements against the actual sender/template capabilities. Avoid broad SMS read permissions. Do not invent an Authentica SDK or depend on an unofficial package without review.

Persist at most the nonsecret challenge reference and server timestamps if necessary. On resume recompute remaining time from server state, not a paused timer. Cancel/ignore stale responses when destination or challenge changes, disable duplicate submissions, and reconcile backend state after reconnect. Never automatically re-send queued OTP requests on network restoration.

For biometric capture handle permission denial, interruptions, unsupported formats, orientation/lighting for face and background noise for voice. Confirm provider format limits before transcoding. Native Face ID/Touch ID/BiometricPrompt normally unlock local keys; they are distinct from sending face/audio samples to Authentica and cannot be advertised as equivalent.

## Biometric privacy and enrollment

First enroll a reference through an authenticated, authorized and auditable process; otherwise an attacker can enroll themselves as the victim. Store the reference under the server's authoritative user ID with encryption, restricted access, version and retention metadata. On verification load that reference server-side and accept only a query sample from the client. Reject a client-supplied reference or unbound user ID. Bind the operation to a fresh server challenge and intended action, while acknowledging this alone does not provide media liveness.

Set local encoded/decoded size limits before parsing/decoding; validate Base64 and actual file signatures. Use supported media formats only after confirmation; MIME labels alone are not validation. Enforce upload/time limits. Prevent arbitrary URL fetching/SSRF by accepting bounded bytes rather than remote URLs. Avoid temporary public storage and signed URLs in logs.

Record informed consent and accessible alternatives. Confirm provider retention/deletion, subprocessors, processing region and applicable Saudi PDPL/cross-border obligations with the responsible privacy/legal owner; a `.sa` domain is not proof of residency or compliance. Establish deletion/export/incident procedures and prohibit model-training reuse unless explicitly agreed. Do not claim liveness, deepfake resistance, biometric accuracy or KYC assurance without evidence.

## Operations and rollout

Log internal request correlation ID, operation, channel, HTTP status category, verdict category, duration and pseudonymous destination/user reference. Exclude headers, codes, full destinations and media. Redact APM request bodies and SDK debug logs as well as application logs. User-facing errors must not forward raw provider responses.

Use bounded balance polling, configurable low-credit alerts, spend anomaly detection and an operator runbook. Credits are not currency; obtain actual pricing and failure/fallback charging rules. On provider outage, fail closed and offer only pre-approved recovery—not an auth bypass. Roll out behind a feature flag, test rollback without orphaning active challenges, and retain safe provider diagnostics for support.
