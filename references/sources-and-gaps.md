# Sources, coverage and open questions

Reviewed live documentation on 2026-11-08. The live `llms.txt` and sitemap enumerate the same nine documentation pages. All nine and the standalone OpenAPI were retrieved and read; the source snapshot and manifest accompany this skill. These are documentation findings, not a live account certification.

## Sources

- Index: https://docs.authentica.sa/llms.txt
- Sitemap: https://docs.authentica.sa/sitemap.xml
- Introduction: https://docs.authentica.sa/introduction/welcome.md
- OTP workflow: https://docs.authentica.sa/guides/otp-workflow.md
- Face workflow: https://docs.authentica.sa/guides/face-verification-workflow.md
- Voice workflow: https://docs.authentica.sa/guides/voice-verification-workflow.md
- Balance: https://docs.authentica.sa/api-reference/balance-monitoring/get-current-balance.md
- Send: https://docs.authentica.sa/api-reference/otp-verification/send-otp.md
- Verify: https://docs.authentica.sa/api-reference/otp-verification/verify-otp.md
- Face: https://docs.authentica.sa/api-reference/face-verification/verify-by-face.md
- Voice: https://docs.authentica.sa/api-reference/voice-verification/verify-by-voice.md
- OpenAPI: https://docs.authentica.sa/openapi.yaml
- Portal: https://portal.authentica.sa
- Key creation: https://portal.authentica.sa/applications/create
- Official support: https://wa.me/966536553944 (do not contact without user authorization).

## Documentation differences

| Finding | Consequence |
|---|---|
| Workflow includes custom `otp` and `fallback_email`; send schema omits them | Treat as guide-described but incompletely specified extensions; disabled until confirmed |
| Workflow sends phone and email together for verification; schema prose is channel-conditional | Use one stored destination for normal path; confirm precedence/fallback behavior |
| Send uses `success`; verify uses `status` | Separate strict response parsers |
| Biometrics use operation `success` and separate match `data.result` | `success: true` alone never authenticates |
| Phone examples contain asterisks or X placeholders | Examples are not usable phone numbers |
| OpenAPI 3.1 contains legacy `nullable` | Test codegen and runtime null handling |
| Few required response properties; only 200/401 documented | Validate runtime verdicts and handle unlisted responses defensively |

## Questions requiring confirmation

Ask only those relevant to the selected feature; attach a redacted request shape, operation and observed status, never credentials or OTPs.

### OTP/replay: provider support + application security owner

- Configured code length/alphabet/expiry and dashboard precedence?
- Does verifying consume the code once? Does resending invalidate every old code? What happens after timeout or repeated verification?
- Scope: destination, channel, provider application, API key or account? How do multiple apps/tenants interact?
- Are concurrent login/recovery/contact-change codes isolated? Can a previous challenge's code validate a new flow?
- Exact failed/expired/locked OTP bodies and HTTP codes? Provider attempt and send limits?
- Are custom OTPs verified by `/verify-otp`, and what constraints apply?

### Channels/fallback: provider support + product owner

- Allowed sender registration/setup, channel availability, template IDs/languages and approval rules?
- Exact fallback controls, trigger timing, destination verification, charging and template mapping for IDs 1/2?
- Delivery tracking/webhook availability and, if available, actual signing/replay contract?
- Message template control sufficient for web/iOS/Android autofill?

### Operational: provider support + backend owner

- Sandbox/test credentials or safe test mode? No sandbox is listed in the reviewed server list.
- Idempotency/reconciliation options? Timeout and SLA guidance? Rate-limit and Retry-After behavior?
- Credit pricing, failed/duplicate/fallback costs, low-balance behavior and key rotation process?

### Biometrics: provider support + security/privacy owner

- Supported formats, byte limits, image resolution/quality, audio codec/sample rate/channels/duration?
- Any liveness/replay/deepfake checks, thresholds/scores, accuracy/error rates or minimum quality guidance?
- Processing location, subprocessors, data retention, deletion, training use and contractual safeguards?
- Enrollment/reference-update recommendations, accessibility alternatives and match-result stability?

## Release handling

Each relevant unknown needs an owner, evidence and a release decision. Block high-risk features on unresolved replay, enrollment, liveness or privacy assumptions. Ship only the independently verified lower-risk scope if acceptable; keep unsupported options disabled. Never turn an unknown into a provider fact to complete a checklist.
