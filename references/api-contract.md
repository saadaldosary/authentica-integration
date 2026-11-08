# Authentica API contract

Reviewed 2026-11-08 against [OpenAPI](https://docs.authentica.sa/openapi.yaml), version 2.0.0. All five operations below inherit `ApiKeyAuth`. Production base: `https://api.authentica.sa/api/v2`. All requests carry `X-Authorization: <raw key>` and `Accept: application/json`; POST bodies are JSON with `Content-Type: application/json`.

## Endpoint matrix

| Operation | Method/path | Request | Positive result |
|---|---|---|---|
| Balance | GET `/balance` | No body | `success === true`, numeric `data.balance` |
| Send OTP | POST `/send-otp` | `method`, appropriate destination, `template_id` | `success === true` |
| Verify OTP | POST `/verify-otp` | Same destination + string `otp` | `status === true` |
| Compare faces | POST `/verify-by-face` | `user_id`, `registered_face_image`, `query_face_image` | `success === true` and `data.result === true` |
| Compare voices | POST `/verify-by-voice` | `user_id`, `registered_audio`, `query_audio` | `success === true` and `data.result === true` |

The above positive verdicts also require an HTTP success. Compare returned biometric `data.user_id` with the expected server-side user ID. Reject missing, malformed, differently typed or contradictory fields. Never use a single generic success parser across these endpoints.

## Send OTP

Source: https://docs.authentica.sa/api-reference/otp-verification/send-otp.md

- `method`: enum `sms`, `whatsapp`, `email`. Documented as required unless a default channel exists; always set it explicitly in application integrations.
- `phone`: required for SMS/WhatsApp; international format matching `^\+[1-9]\d{1,14}$`. This regex is a syntax check, not proof a number exists. Use a phone-number library for country-aware parsing and show the normalized destination for confirmation. Do not silently repair malformed identifiers in imported data.
- `email`: required for email; valid email string. Keep the destination consistent between send and verify; avoid unapproved transformations of the local part.
- `template_id`: integer; documented default 1. Example 31 is not a universally recommended template. Map approved channel/language choices server-side.

Illustrative bodies (never send example recipients):

```json
{"method":"sms","phone":"<validated international number>","template_id":31}
```
```json
{"method":"whatsapp","phone":"<validated international number>","template_id":1}
```
```json
{"method":"email","email":"user@example.com","template_id":1}
```

Documented response example:
```json
{"success":true,"data":null,"message":"OTP send successfully"}
```

Treat as provider acceptance, not recipient delivery or proof of ownership. There is no documented challenge ID, tracking ID or TTL in this response. Do not send arbitrary client-supplied template IDs.

### Custom OTP/fallback caveat

The [OTP workflow](https://docs.authentica.sa/guides/otp-workflow.md) says custom OTPs are supported and illustrates `otp` and `fallback_email` on send. It says fallback uses template IDs 1 and 2 according to the main template language, but does not state the language-to-ID mapping. These fields do not appear in the send OpenAPI schema. It does not specify fallback trigger/order, channel configuration, duplicate-send charging or which destination verifies a fallback code.

Do not enable these options by copying the guide blindly. Obtain exact supported fields/types, template mappings and verification behavior from support and authorized tests. If custom generation is required, do it server-side with a cryptographic RNG, approved length/lifetime, no logs and a documented verification owner; never let unauthenticated clients choose codes. Do not assume undocumented options such as `fallback_method`, `expires_in` or `otp_length` exist.

## Verify OTP

Source: https://docs.authentica.sa/api-reference/otp-verification/verify-otp.md

`otp` is required and must be a string. Phone is required if SMS/WhatsApp was used; email if email was used. Send the canonical destination from the server's challenge record, never a new destination supplied at verification time.

```json
{"phone":"<same phone as send>","otp":"<user-entered string>"}
```
```json
{"email":"user@example.com","otp":"<user-entered string>"}
```

Documented positive response:
```json
{"status":true,"message":"OTP verified successfully"}
```

The workflow example includes both phone and email, but precedence/fallback binding is unspecified. Use exactly one for the normal single-channel flow. Neither `method` nor a challenge ID is documented for this request. No invalid/expired OTP status code or response body is specified. Treat `status: false` as negative if returned; do not claim this negative response shape is guaranteed. Missing or nonboolean `status` is a contract failure, not success.

## Face and voice comparison

Sources:
- https://docs.authentica.sa/api-reference/face-verification/verify-by-face.md
- https://docs.authentica.sa/api-reference/voice-verification/verify-by-voice.md

All three fields are required strings on each endpoint:

```json
{"user_id":"<server-bound user>","registered_face_image":"<base64 reference image bytes>","query_face_image":"<base64 query image bytes>"}
```
```json
{"user_id":"<server-bound user>","registered_audio":"<base64 reference audio bytes>","query_audio":"<base64 query audio bytes>"}
```

The OpenAPI uses `format: byte`: encode bytes as Base64 in JSON, not multipart, a remote URL or an entire `data:...;base64,` URI. Do not treat the truncated example strings ending in `...` as usable payloads. Supported image/audio encodings, MIME types, duration, resolution, size and quality limits are not documented; ask before implementation choices become dependencies.

Documented match and mismatch:
```json
{"success":true,"data":{"user_id":"user123","result":true}}
```
```json
{"success":true,"data":{"user_id":"user123","result":false}}
```

The API compares caller-supplied reference/query pairs. No separate enrollment, template storage, deletion, liveness, score or threshold endpoint appears in the reviewed documentation. Do not infer provider retention policy or that a match proves a live person or legal identity.

## Balance

Source: https://docs.authentica.sa/api-reference/balance-monitoring/get-current-balance.md

```json
{"success":true,"data":{"balance":21934},"message":"Balance retrieved successfully"}
```

`balance` is a number of credits. Validate a finite numeric value; do not assume integer-only balances, currency, a top-up API or unit pricing. Fetch on a bounded monitoring schedule and cache for authorized operator dashboards. A positive balance does not guarantee any particular channel is enabled.

## Errors and transport

All operations document HTTP `401` for missing/invalid key and the common error schema:
```json
{"errors":[{"message":"Unauthorized"}]}
```

Only 200 and 401 are explicitly enumerated. Robust clients must handle other 4xx, 429, 5xx, timeout, non-JSON, empty responses and schema drift, but must label those handlers as defensive engineering rather than documented Authentica error contracts.

- 401: stop retrying; inspect key/environment configuration without printing secrets.
- Unexpected 4xx: fail closed; examine redacted diagnostics and ask support for actual validation/error semantics.
- 429 if observed: enforce cooldown and honor valid `Retry-After` within application bounds; do not hammer the provider.
- 5xx/network timeout: do not authenticate. A POST outcome can be ambiguous; no automatic resend or verification retry without a reconciliation policy.
- Safe read retries: bounded exponential backoff/jitter for transient balance failures. Never retry authorization errors.
- Refuse redirects carrying credentials; HTTPS with certificate verification is mandatory.

OpenAPI caveats: `nullable: true` appears although the document declares OpenAPI 3.1; check generator compatibility and preserve `data: null` for send. Required-response properties are not fully constrained by the schema, so runtime validation remains necessary.
