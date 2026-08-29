---
name: codebase-design
description: Improve or evaluate codebase architecture with a focus on clear boundaries, deep modules, stable interfaces, and maintainable full-stack product design. Use when planning architecture, reviewing a design, or cleaning up codebase complexity.
metadata:
  featurekit-version: "0.5.3"
---

# Codebase Design

Use design judgment to keep the product easy to change.

Apply the target repo's `Agent Operating Principles` before recommending refactors or implementation changes.

## Principles

- Treat accepted ADRs as governing design constraints.
- Prefer deep modules: simple public interface, meaningful behavior inside.
- Keep domain rules close to the domain model.
- Keep infrastructure details behind boundaries.
- Prefer explicit data flow over hidden coupling.
- Make behavior testable through public interfaces.
- Avoid abstractions that only rename existing code.
- Improve the design in the slice that needs it.

## Process

1. Identify the behavior or boundary under pressure.
2. Read relevant ADRs, `docs/agents/security.md` if present, the current implementation, and tests.
3. Name the design problem in plain language.
4. Propose the smallest design improvement that helps this change.
5. Separate required changes from optional cleanup.
6. Use `secure-design` when the boundary touches auth, authorization, sensitive data, APIs, deployment, integrations, or untrusted input.
7. Recommend `/record-adr` when the design creates or changes a durable architectural decision.
8. Preserve public behavior unless the PRD says otherwise.

## Output

```markdown
Design pressure:
<what is hard to change>

Recommended boundary:
<where behavior should live>

Required change:
<minimum design change>

Optional follow-up:
<separate cleanup, if any>

ADR impact:
<none | governing ADRs or decision to record>

Security impact:
<none | trust boundary, sensitive data, or security posture impact>
```
