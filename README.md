# Authentica integration skill

A reusable AI-agent skill for integrating [Authentica](https://docs.authentica.sa/) into web and mobile applications through a trusted backend.

**Independent community resource. Not an official Authentica SDK, not affiliated with or endorsed by Authentica, and not a complete authentication application.**

## Coverage

- SMS, WhatsApp and email OTP sending and verification.
- Face and voice comparison, identity binding and privacy requirements.
- Account balance monitoring and operational safeguards.
- Server-owned challenges, rate limiting, concurrency, resend handling and session issuance.
- Browser, iOS, Android, Flutter and React Native integration guidance.
- Provider documentation conflicts, unknowns and production release checks.

The source review covers all nine pages listed in the official documentation index/sitemap plus OpenAPI v2.0.0, retrieved on 2026-11-08. Snapshots are evidence of that review, not a promise of current provider behavior.

## Use the skill

Start with [SKILL.md](SKILL.md). It links to the detailed references and defines the implementation workflow.

For Hermes, copy the repository's `SKILL.md`, `references/`, `templates/` and `scripts/` into a new `authentica-integration` directory under your **active profile's** skills directory. Do not overwrite an existing installation without reviewing the changes. Start a new session and ask:

> Use the authentica-integration skill to integrate Authentica into this application.

Other agents can read `SKILL.md` and the linked files directly; adapt tool names to their environment. Never provide a provider API key in a prompt.

## Reference adapter and tests

Requires Node.js 20 or newer. No npm dependencies are needed.

```bash
node --test scripts/authentica-client.test.mjs
```

The suite contains 22 offline tests using mock responses. It does not send messages, spend credits or upload biometric samples.

`templates/authentica-client.mjs` exports `createAuthenticaClient` and `AuthenticaError`. Import it **only from server-side code** and supply the key through your backend secret manager. It provides `balance`, `sendOtp`, `verifyOtp`, `verifyFace` and `verifyVoice`. Its default timeout is an application choice, not an Authentica SLA.

The adapter is a starting point, not a production auth service: your app must provide durable challenge orchestration, enrollment, media limits, authorization, session management and end-to-end tests.

## Contents

| File | Purpose |
|---|---|
| [SKILL.md](SKILL.md) | Agent workflow and safety invariants |
| [API contract](references/api-contract.md) | Exact provider endpoints, payloads and response parsing |
| [Application patterns](references/application-patterns.md) | Backend, web/mobile, biometrics and operational design |
| [Verification](references/verification.md) | Offline, application, device and authorized live-test checklists |
| [Sources and gaps](references/sources-and-gaps.md) | Evidence, conflicts and provider questions |
| [OpenAPI snapshot](references/openapi.snapshot.yaml) | Reviewed provider specification |
| [Documentation snapshot](references/documentation.snapshot.md) | Reviewed official pages |
| [Source manifest](references/source-manifest.json) | URLs, retrieval time, hashes and coverage |
| [Reference adapter](templates/authentica-client.mjs) | Dependency-free server-side JavaScript example |
| [Tests](scripts/authentica-client.test.mjs) | Mocked contract and error-handling regression tests |

## Important limitations

- Verify OTP using `status === true`, not `success`.
- Biometric operation success is not a match: require `data.result === true` and the expected user ID.
- Send acceptance does not prove delivery.
- Custom OTP/fallback options are described incompletely; the adapter intentionally excludes them.
- Provider replay/expiry semantics, biometric formats/liveness and processing policies need confirmation for the selected deployment.
- Never embed the API key in a browser bundle or mobile app. A runtime guard is not a substitute for a server-only build boundary.

No live Authentica account, message delivery or biometric verification was exercised in preparing this repository. Production readiness requires authorized testing in your own environment.

## Contributing

Verify provider claims against the live official documentation, cite sources, keep recommendations separate from documented guarantees and run the offline tests. Do not commit credentials, OTPs, real recipient data or biometric media. Report suspected provider issues to Authentica rather than publishing sensitive evidence in an issue.

## License and attribution

Authored guidance and example code: [MIT](LICENSE), copyright 2026 Saad Aldosary. Prepared with Hermes Agent.

Provider documentation snapshots and specifications retain their original rights and attribution; the MIT license does not relicense Authentica's source material. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
