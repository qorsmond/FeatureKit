---
name: using-featurekit
description: Lightweight FeatureKit bootstrap and router. Use at the start of FeatureKit sessions, after context compaction, or when a user asks for product or engineering work in a repo that may use FeatureKit, so the agent checks setup, chooses the right FeatureKit skill, and avoids coding before a written plan.
metadata:
  featurekit-version: "0.4.0"
---

# Using FeatureKit

Use this skill as a lightweight session bootstrap. It helps choose the right FeatureKit workflow before acting.

This is not a strict global gate. Hard-stop only when the user asks for production code without a written plan.

## Process

1. Check whether the repo appears configured for FeatureKit:
   - installed FeatureKit skills,
   - `docs/agents/`,
   - an `Agent skills` block in `AGENTS.md` or equivalent instructions.
2. If the repo is not configured, recommend `/setup-featurekit` before product work.
3. Read the user's request and route to the smallest matching skill.
4. If the request is implementation work, confirm there is a written plan, PRD, or slice before coding.
5. If multiple skills might apply, choose the process skill first, then security, implementation, review, or verification skills.
6. Keep the recommendation short. Do not implement code from this skill.

## Routes

- New repo setup: `/setup-featurekit`.
- Unsure what to do: `/ask-featurekit`.
- Raw product idea or unclear scope: `/grill-with-docs`.
- Durable spec needed: `/to-prd`.
- Durable architectural decision: `/record-adr`.
- Security requirements, threat modeling, or hardening: `secure-design`.
- Split approved PRD or plan: `/to-slices`.
- Execute multiple approved slices: `/execute-slices`.
- Implement one approved slice: `/implement`.
- Hard bug or unclear failure: `diagnosing-bugs`.
- Verify generated or risky tests: `verify-tests`.
- Review a diff or PR: `review-change`.
- Focused security review: `security-review`.
- API security work: `secure-api` inside planning, implementation, or review.
- Deployment hardening work: `secure-deploy` inside planning, implementation, or review.
- Architecture or boundary pressure: `codebase-design`.
- Disposable uncertainty check: `/prototype`.
- Pause or move context: `/handoff`.

## Hard Stop

If the user asks for production code and there is no written plan:

```markdown
FeatureKit needs a written plan before production code.

Recommended next skill: `/grill-with-docs`, `/to-prd`, or `/to-slices`

Why: <one-sentence reason>
```

For small work, the written plan can be a short explicit note. For larger work, use a PRD and slices.

## Output

When routing is useful, use:

```markdown
FeatureKit route:
<skill>

Why:
<short reason>

Next:
<exact prompt or action>
```
