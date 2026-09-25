---
name: secure-design
description: Apply lightweight secure design and threat modeling during planning, PRD creation, architecture work, API design, deployment planning, or security-sensitive feature work. Use when work touches trust boundaries, authentication, authorization, sensitive data, external inputs, third-party integrations, generated code, deployment/runtime behavior, or durable security posture.
metadata:
  featurekit-version: "0.10.0"
---

# Secure Design

Build security into the plan before implementation starts.

Apply the target repo's `Agent Operating Principles` before design or verification work.

## Process

1. Read `AGENTS.md`, `docs/agents/security.md` if present, relevant `docs/agents/`, accepted ADRs, the PRD or plan, and relevant code.
2. Identify assets, actors, data sensitivity, entry points, trust boundaries, and external systems.
3. Ask only for security decisions that cannot be discovered from repo context.
4. Add abuse cases for attacker, malicious tenant, compromised integration, accidental data exposure, and misconfiguration paths that fit the work.
5. Convert material threats into security requirements, acceptance criteria, verification steps, or ADR follow-ups.
6. Keep the result proportional: small changes get a small threat note; high-risk systems need explicit controls and review.

## Baseline References

Use these as guidance, not compliance claims:

- OWASP Top 10 2025 for common web application risk categories.
- OWASP ASVS 5.0.0 for verifiable application security control language.
- OWASP Threat Modeling Cheat Sheet for system modeling, threat identification, mitigations, and validation.
- NIST SSDF 1.1 and OWASP SAMM for secure development lifecycle framing.
- OpenSSF AI assistant guidance when generated code or agent-written code is involved.

## Design Checks

Check whether the plan names:

- security-relevant assets and sensitive data,
- authenticated and unauthenticated actors,
- tenant, user, role, service, and admin boundaries,
- authorization decision points and default-deny behavior,
- validation and output encoding requirements for untrusted input,
- secrets, credentials, tokens, keys, and rotation expectations,
- audit logging, alerting, incident evidence, and privacy constraints,
- dependency, build, deployment, and runtime trust boundaries,
- safe failure behavior for partial outages and exceptional conditions.

## ADR Triggers

Recommend `/record-adr` when the work establishes or changes durable rules for:

- authentication or session strategy,
- authorization model or tenant isolation,
- sensitive data classification or retention,
- secrets, cryptography, or key management,
- external integration trust model,
- deployment/runtime security posture,
- security logging or incident response expectations.

## Output

```markdown
Security design:
<assets, actors, trust boundaries, and sensitive data>

Threats:
- <realistic abuse case and impact>

Security requirements:
- <requirement to add to PRD, slice, or plan>

Verification:
- <tests, review, scanner, manual check, or runtime evidence>

ADR follow-ups:
<none | decisions to record with /record-adr>
```
