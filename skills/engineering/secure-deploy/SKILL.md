---
name: secure-deploy
description: Apply deployment, runtime, CI/CD, secrets, and supply-chain hardening guidance during deployment planning, infrastructure changes, release workflows, production configuration, migration planning, or review. Use when work touches environments, hosting, pipelines, secrets, IAM, containers, artifacts, observability, rollback, or production operations.
metadata:
  featurekit-version: "0.8.0"
---

# Secure Deploy

Harden deployment and runtime changes without assuming a specific platform.

Apply the target repo's `Agent Operating Principles` before deployment, operations, or verification work.

## Process

1. Read `docs/agents/deployment.md`, `docs/agents/security.md` if present, `docs/agents/verification.md`, relevant CI/deploy config, ADRs, and the PRD or slice.
2. Identify environments, deploy actors, secrets, IAM/service accounts, artifacts, migrations, rollback path, runtime exposure, and observability.
3. Use repo-native deployment and infrastructure conventions.
4. Add security verification steps to the PRD, slice, or release checklist.
5. Do not change live deployment settings, rotate secrets, install scanners, or modify infrastructure outside the approved slice.

## Baseline References

Use these as guidance, not compliance claims:

- OWASP CI/CD Security Cheat Sheet and OWASP Top 10 CI/CD Security Risks.
- OWASP Secrets Management Cheat Sheet.
- SLSA for artifact integrity, provenance, and supply-chain hardening.
- OpenSSF Scorecard for dependency and open-source project risk signals.
- NIST SSDF 1.1 and OWASP SAMM for lifecycle and operations framing.

## Deployment Checks

Check whether the change preserves:

- environment separation for development, staging, preview, and production,
- least-privilege service accounts, IAM roles, deploy tokens, and database users,
- secrets from approved secret stores, never source-controlled plaintext,
- short-lived or rotated credentials where the repo/platform supports them,
- branch, PR, tag, environment, and approval protections for release paths,
- dependency lockfiles, pinned actions/images, artifact integrity, and provenance expectations,
- container, server, storage, CDN, and database defaults hardened for the chosen platform,
- migration and deploy order that avoids data loss and partial-failure exposure,
- rollback or forward-fix path with security impact understood,
- logging, alerting, audit evidence, and incident triage for security-relevant events,
- safe defaults for CORS, security headers, TLS, cookies, caching, and debug features where applicable.

## Verification

Use existing repo tools before suggesting new ones:

- CI status, lint, typecheck, test, build,
- dependency audit or vulnerability scan if already configured,
- secret scan if already configured,
- IaC/container/static analysis if already configured,
- manual deploy checklist for platform-specific settings that tools cannot see.

## Output

```markdown
Secure deploy checks:
<deployment/runtime areas touched>

Controls:
- <secrets/IAM/artifacts/rollback/logging/etc.>

Verification:
- <commands, checks, or manual review>

Release risk:
<none | risk and mitigation>
```
