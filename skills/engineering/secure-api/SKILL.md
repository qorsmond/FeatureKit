---
name: secure-api
description: Apply API security guardrails during API planning, implementation, integration, testing, or review. Use when work adds or changes REST, GraphQL, RPC, webhook, event, internal service, third-party API, or public contract behavior.
metadata:
  featurekit-version: "0.4.1"
---

# Secure API

Design, implement, and review APIs with explicit trust and authorization boundaries.

Apply the target repo's `Agent Operating Principles` before design, coding, or verification work.

## Process

1. Read the PRD or slice, `docs/agents/security.md` if present, API docs or contracts, accepted ADRs, and relevant handlers/services/tests.
2. Identify consumers, authentication mode, object identifiers, roles, tenant boundaries, writable properties, external calls, and rate or resource limits.
3. Map material risks to acceptance criteria and tests before implementation.
4. Use repo-native API validation, authorization, serialization, and error helpers.
5. Use `secure-code` for implementation details and `verify-tests` for security-sensitive tests.

## Baseline References

Use these as guidance, not compliance claims:

- OWASP API Security Top 10 2023 for API-specific risks.
- OWASP REST Security Cheat Sheet and GraphQL guidance where relevant.
- OWASP ASVS 5.0.0 for verifiable controls.

## API Checks

Check each changed API for:

- object-level authorization on every user-controlled object ID,
- function-level authorization for admin, service, bulk, export, billing, and destructive actions,
- property-level authorization to prevent excessive exposure and mass assignment,
- authentication that matches the endpoint's intended audience,
- server-side validation for request body, query, path, headers, files, and webhook payloads,
- rate limits, quotas, pagination, payload limits, and timeout behavior where abuse could harm users or infrastructure,
- SSRF protection when the API fetches user-supplied or partner-supplied URLs,
- safe consumption of third-party APIs, including signature checks, schema validation, timeouts, retries, and distrust of partner data,
- stable error shape that does not leak internals,
- inventory impact for public routes, versions, docs, debug endpoints, and deprecated APIs,
- audit logging for security-relevant changes.

## Verification

Prefer behavior tests through public API boundaries:

- same-tenant allowed and cross-tenant denied,
- role allowed and lower-privilege denied,
- writable allowed properties accepted and forbidden properties ignored or rejected,
- unauthenticated and expired/invalid credentials rejected,
- rate/resource controls covered where repo tooling supports them,
- webhook signatures and replay protections checked when applicable,
- third-party API failures handled without trusting unsafe data.

## Output

```markdown
API security:
<endpoints, consumers, auth mode, and trust boundaries>

Risks checked:
- <BOLA/BFLA/property auth/resource/SSRF/etc.>

Verification:
- <tests or checks>

Gaps:
<none | remaining API security gaps>
```
