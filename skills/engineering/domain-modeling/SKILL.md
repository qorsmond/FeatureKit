---
name: domain-modeling
description: Maintain and sharpen product domain language for a repo. Use when work introduces new business terms, ambiguous concepts, product rules, or architecture decisions that should be captured in CONTEXT.md or ADRs.
metadata:
  featurekit-version: "0.8.0"
---

# Domain Modeling

Keep the product language stable and useful for agents and humans.

## Process

1. Read the repo's domain docs from `docs/agents/domain.md`.
2. Identify new or ambiguous terms.
3. Prefer the product's existing vocabulary over inventing new words.
4. Challenge unclear terms with edge cases.
5. Propose updates to `CONTEXT.md` for domain language.
6. Recommend `/record-adr` for durable architecture decisions.
7. Ask before writing durable docs.

## Term Quality

A good domain term:

- names a real business concept,
- has clear boundaries,
- reduces explanation in future sessions,
- maps to code or product behavior,
- survives beyond one ticket.

## Output

```markdown
Terms:
<new or changed terms>

Rules:
<business rules discovered>

Doc updates:
<proposed or written updates>

ADR updates:
<none | decisions to record with /record-adr>
```
