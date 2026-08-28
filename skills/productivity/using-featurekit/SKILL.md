---
name: using-featurekit
description: Lightweight FeatureKit bootstrap and router. Use at the start of FeatureKit sessions, after context compaction, or when a user asks for product or engineering work in a repo that may use FeatureKit, so the agent checks setup, chooses the right FeatureKit skill, and avoids coding before an approved written plan.
metadata:
  featurekit-version: "0.5.0"
---

# Using FeatureKit

Use this skill as a lightweight session bootstrap. It helps choose the right FeatureKit workflow before acting.

This is not a strict global gate. Hard-stop when the user asks for production code without a written plan, PRD, or slice approved through its final approval question. Accepting an interview recommendation is not final approval.

## Process

1. Check whether the repo appears configured for FeatureKit:
   - installed FeatureKit skills,
   - `docs/agents/`,
   - an `Agent skills` block in `AGENTS.md` or equivalent instructions.
2. If the repo is not configured, recommend `/setup-featurekit` before product work.
3. Read the user's request and route to the smallest matching skill.
4. If the request is a raw feature idea or unclear feature scope, begin the `grilling` design-tree interview now. Starting the interview includes obeying `grilling` when the native question tool is unavailable: show the initial ledger, explain how to enable the tool, and pause. Do not return only a route or ask the user to repeat the idea.
5. If the request is implementation work, confirm both:
   - explicit user intent to implement now,
   - a written plan, PRD, or slice approved through its final approval question.
6. If the user only answered an interview question or accepted a recommendation, continue the interview. Only its final approval question approves the clarified plan.
7. If multiple skills might apply, choose the process skill first, then security, implementation, review, or verification skills.
8. After final approval, choose the next workflow from the plan and original request:
   - create a PRD, ADR, prototype, or slices when the approved plan requires one,
   - begin implementation when the original request asked to make the change and the approved plan is implementation-ready,
   - stop and ask when intent, authority, or scope is unclear.
9. Continue automatically when the harness permits. If an explicit-only skill cannot be chained, give one exact invocation and preserve the current context so the user does not have to restate it.
10. Treat generated PRDs and slices as staged artifacts. Show each one and get final approval before implementation.
11. Keep non-interview routing short. Do not write production code from this bootstrap; hand control to the selected workflow.

## Routes

- New repo setup: `/setup-featurekit`.
- Unsure what to do: `/ask-featurekit`.
- Raw product idea or unclear scope: begin `grilling` now; use `/grill-with-docs` when the user invoked it explicitly.
- Durable spec needed: `/to-prd`.
- Durable architectural decision: `/record-adr`.
- Security requirements, threat modeling, or hardening: `secure-design`.
- Split approved PRD or plan: `/to-slices`.
- Execute multiple approved slices: `/execute-slices`.
- Implement one approved slice after explicit approval: `/implement`.
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

If the user asks for production code and there is no approved written plan:

```markdown
FeatureKit needs a written plan approved through its final approval question before production code.

Recommended next skill: `/grill-with-docs`, `/to-prd`, or `/to-slices`

Why: <one-sentence reason>
```

For small work, the written plan can be short, but the interview must end with the clear final approval question before coding. For larger work, use a PRD and slices and approve those staged artifacts too.

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
