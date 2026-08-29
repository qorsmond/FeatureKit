---
name: security-review
description: Perform a focused security review of a PRD, plan, slice, diff, pull request, API change, deployment plan, generated code, or suspicious implementation. Use explicitly when the user asks for security review, hardening review, OWASP review, threat review, secure code review, API security review, deployment security review, or when review-change finds material security risk.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.1"
---

# Security Review

Review for exploitable risk, missing security requirements, and weak verification.

Apply the target repo's `Agent Operating Principles` when checking scope, simplicity, and unrelated changes.

## Process

1. Read the PRD, slice, stated goal, or deployment plan.
2. Read `AGENTS.md`, `docs/agents/security.md` if present, relevant `docs/agents/`, accepted ADRs, and relevant code or diff.
3. Identify assets, actors, trust boundaries, sensitive data, external inputs, and deployment/runtime surfaces.
4. Use `secure-design`, `secure-code`, `secure-api`, and `secure-deploy` as applicable.
5. Check whether tests and verification would catch the security failure, not just the happy path.
6. Lead with findings ordered by severity. Do not bury security bugs in a summary.

## Baseline References

Use these as guidance, not compliance claims:

- OWASP Top 10 2025 and OWASP ASVS 5.0.0 for application security.
- OWASP API Security Top 10 2023 for API changes.
- OWASP CI/CD Security, SLSA, and OpenSSF guidance for deployment and supply-chain changes.
- NIST SSDF 1.1 and OWASP SAMM for lifecycle gaps.

## Severity

- P0: likely active compromise, credential exposure, remote code execution, cross-tenant data exposure, irreversible data loss, or release-blocking security failure.
- P1: serious exploitable issue, broken auth/authz, sensitive data exposure, unsafe deployment path, or missing control for high-impact behavior.
- P2: important hardening gap, incomplete security test, risky default, weak logging, or dependency/config risk with plausible impact.
- P3: low-risk cleanup, documentation gap, or defense-in-depth improvement.

## Review Areas

Check:

- spec and slice security requirements,
- threat model and abuse cases,
- auth, authorization, tenant isolation, and privilege boundaries,
- input validation, output encoding, injection, SSRF, deserialization, file handling, and mass assignment,
- secrets, tokens, keys, crypto, and sensitive data handling,
- API object/function/property authorization and resource limits,
- deployment, CI/CD, artifact integrity, environment separation, IAM, and rollback,
- logging, alerting, auditability, and incident evidence,
- tests, negative cases, and `verify-tests` needs.

## Output

Lead with findings:

```markdown
Findings:
- P1: <security issue with evidence and impact>
- P2: <important security risk>

Threat-model gaps:
- <missing asset, actor, trust boundary, or abuse case>

Verification gaps:
- <missing test, scanner, manual check, or runtime evidence>

ADR gaps:
- <none | security posture decision to record or conflict to resolve>

Summary:
<brief context only after findings>
```

If there are no findings, say so clearly and mention residual risk or unrun checks.
