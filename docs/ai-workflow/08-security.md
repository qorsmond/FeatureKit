# Security Workflow

FeatureKit security is a workflow layer, not a scanner bundle or compliance claim.

The goal is to make agents design, implement, and review generated code with security in mind while keeping stack choices in the product repo.

## Security Context

Run `/setup-featurekit` so the target repo has:

```text
docs/agents/security.md
```

That file should record the repo's security posture:

- authentication and session model,
- authorization, roles, tenant boundaries, and ownership rules,
- sensitive data, privacy, retention, and audit needs,
- API styles, webhooks, public/internal boundaries, and third-party API trust,
- secrets source and local secret handling,
- dependency, package, container, and artifact integrity policy,
- CI/CD security checks such as secret scanning, audits, SAST, and dependency checks,
- deployment security notes such as IAM, CORS, TLS, cookies, headers, and debug settings,
- logging, alerting, incident contacts, and vulnerability handling,
- accepted security ADRs and decisions that still need `/record-adr`.

If this file is missing and the work is security-sensitive, stop and create or update it before implementation.

## Security Skills

Most security skills are model-invoked disciplines. The agent should use them automatically when the work touches their surface area.

- `secure-design`: use during grilling, PRD, prototype, architecture, API design, and deployment planning to capture assets, actors, trust boundaries, abuse cases, requirements, verification, and ADR follow-ups.
- `secure-code`: use during implementation and review when code touches untrusted input, auth, authorization, sensitive data, secrets, crypto, storage, files, network calls, dependencies, errors, logging, or generated code.
- `secure-api`: use for REST, GraphQL, RPC, webhook, event, internal service, third-party API, and public contract work.
- `secure-deploy`: use for deployment, runtime, CI/CD, secrets, IAM, containers, artifacts, observability, rollback, migrations, and production operations.
- `security-review`: invoke explicitly for focused security review of a PRD, slice, diff, PR, API change, deployment plan, generated code, or suspicious implementation.

## Planning

For security-sensitive work, `/grill-with-docs` and `/to-prd` should capture:

- security-relevant assets and sensitive data,
- actors and abuse cases,
- trust boundaries,
- authorization decision points,
- unsafe input and output contexts,
- secrets and integration trust,
- failure modes and logging needs,
- security verification.

The PRD should include `Security And Abuse Cases`. If a durable security decision is made, use `/record-adr`.

## Slices

`/to-slices` should carry security requirements into the slices that need them.

Good slice security context is concrete:

```markdown
Security:
- Use `secure-api` for object-level authorization.
- Add cross-tenant negative tests for workspace IDs.
- Do not trust webhook payloads without signature verification.
```

Avoid vague checklist language like "make this secure" or "follow OWASP" without naming the relevant behavior.

## Implementation

Before coding a security-sensitive slice, `/implement` should:

- read `docs/agents/security.md`,
- use `secure-code`, `secure-api`, or `secure-deploy` as applicable,
- use repo-native helpers instead of inventing custom security code,
- use `tdd` for security behavior that can be tested through public interfaces,
- use `verify-tests` when tests protect auth, permissions, tenant boundaries, data loss, secrets, generated code, or other high-impact behavior.

Do not add security dependencies, scanners, crypto primitives, or infrastructure changes without user approval.

## JEV And External Context

Treat every JEV use as a separate data scope:

- metadata routing sends only bounded task metadata and never authorizes source, diffs, logs, raw output, transcripts, or secrets;
- source review requires explicit focused code/diff sharing and excludes unrelated repository content;
- deterministic context pruning runs locally and sends no text anywhere; JEV pruning is not provided;
- Claude transcript compaction requires explicit transcript permission and keeps native compaction as fallback.

Keep `TYPESAFE_API_KEY` and compatibility aliases in the launching environment, never in repo files, prompts, capsules, traces, caches, or command arguments. Do not use another provider to bypass a repo/user data restriction. Deterministic approval, security, authorization, evidence, and verification gates remain authoritative regardless of a JEV score or route suggestion.

## Review

Use `review-change` for normal risk-focused review.

Use `security-review` when the change has exploitable risk, such as:

- authentication or authorization changes,
- tenant isolation,
- sensitive data exposure,
- public or internal API changes,
- webhook or third-party API consumption,
- secrets, tokens, keys, or crypto,
- deployment, CI/CD, IAM, or runtime changes,
- generated code in a security-sensitive path.

Security findings should lead the output and be ranked by severity. Do not accept unresolved P0 or P1 security findings into the next slice.

## Standards

FeatureKit uses security standards as guidance, not as certification.

Use current primary sources when deeper review is needed:

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NIST SSDF](https://csrc.nist.gov/projects/ssdf)
- [OWASP SAMM](https://owaspsamm.org/model/)
- [SLSA](https://slsa.dev/)
- [OpenSSF Scorecard](https://openssf.org/projects/scorecard/)

Do not copy standards wholesale into FeatureKit or product repos. Summarize the applicable control, link the source, and turn it into a concrete requirement or test.

## Series Navigation

- Previous: [End-to-End Example](./06-end-to-end-example.md)
- Index: [FeatureKit Guide](./README.md)
- Next: [Troubleshooting](./07-troubleshooting.md)
