---
name: secure-code
description: Apply secure implementation discipline while writing or reviewing generated code. Use during implementation, bug fixes, refactors, or reviews when code handles untrusted input, auth/authz, sensitive data, secrets, cryptography, storage, files, network calls, dependencies, errors, logging, or any security-sensitive behavior.
metadata:
  featurekit-version: "0.5.3"
---

# Secure Code

Generate and change code defensively without adding unrequested complexity.

Apply the target repo's `Agent Operating Principles` before coding, refactoring, or verification work.

## Process

1. Read the PRD or slice, `AGENTS.md`, `docs/agents/security.md` if present, relevant ADRs, and relevant code.
2. Identify every untrusted input, sensitive output, privilege boundary, and persistence boundary touched by the change.
3. Prefer established framework, platform, and repo helpers over custom security code.
4. Use `tdd` for security-relevant behavior that can be expressed through public interfaces.
5. Implement the smallest change that satisfies the plan and security requirements.
6. Use `verify-tests` when auth, authorization, permissions, data loss, secrets, generated code, or security behavior is protected by new or changed tests.
7. Do not add security dependencies, scanners, crypto primitives, or infrastructure changes without user approval.

## Baseline References

Use these as guidance, not compliance claims:

- OWASP Developer Guide and Cheat Sheet Series for secure coding practices.
- OWASP ASVS 5.0.0 for verifiable application controls.
- OWASP Top 10 2025 for application risk categories.
- OpenSSF AI assistant guidance: treat generated code as untrusted until reviewed.

## Implementation Checks

For touched code paths, check:

- validation: constrain external inputs by type, length, format, range, and business rules at the boundary,
- encoding: use context-aware output encoding or safe framework rendering,
- injection: use parameterized database, shell, LDAP, template, and query APIs,
- auth: use repo-approved auth/session/token helpers,
- authorization: enforce object, function, role, tenant, and ownership checks server-side,
- secrets: never hardcode credentials; use the repo's configured secret source,
- crypto: avoid custom crypto; use vetted libraries and repo-approved algorithms,
- storage: avoid overexposure, mass assignment, unsafe deserialization, and insecure file handling,
- network: validate destinations for outbound requests and protect against SSRF where user-controlled URLs exist,
- errors: fail closed where possible and do not expose stack traces, secrets, paths, or tokens,
- logging: log useful security events without secrets or sensitive payloads,
- dependencies: justify new dependencies and prefer maintained packages with existing repo approval.

## Generated-Code Skepticism

Before accepting generated or agent-written security-sensitive code:

- review the code path against the checklist above,
- confirm tests would fail if the security behavior were wrong,
- search for similar established patterns in the repo,
- reject plausible-looking custom security logic that bypasses repo conventions.

## Output

```markdown
Secure code checks:
<what security-relevant paths were touched>

Controls used:
- <validation/authz/secrets/etc.>

Tests:
<security tests added or updated>

Test verification:
<verify-tests result | skipped and why>

Remaining risk:
<none | risk, owner, and follow-up>
```
