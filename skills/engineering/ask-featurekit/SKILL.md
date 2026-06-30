---
name: ask-featurekit
description: Route a product or engineering request to the right FeatureKit skill or flow. Use explicitly when the user is unsure what to run, asks how to proceed, has a new idea, bug, PRD, issue, ADR, implementation task, test verification, mutation testing, review, prototype, or handoff need. User-invoked router; do not implement code from this skill.
disable-model-invocation: true
metadata:
  featurekit-version: "0.1.2"
---

# Ask FeatureKit

Route the user to the right FeatureKit flow.

## Process

1. Read the user's request and any available repo context.
2. If the repo has not been configured, recommend `/setup-featurekit` first.
3. Identify the situation:
   - raw product idea,
   - unclear plan,
   - PRD creation,
   - issue slicing,
   - implementation,
   - bug diagnosis,
   - review,
   - test verification or mutation testing,
   - architecture improvement,
   - ADR recording or conflict,
   - prototype,
   - handoff.
4. Recommend the next skill and explain why in one or two sentences.
5. Tell the user whether to continue in the same session or start a fresh one.

## Routes

- New product idea with a codebase: `/grill-with-docs`.
- New product idea without a codebase: use `grilling` manually and keep it stateless.
- Durable spec needed: `/to-prd`.
- Durable architectural decision to capture or update: `/record-adr`.
- Multi-step implementation: `/to-issues`.
- One approved issue ready to build: `/implement`.
- Hard bug or unclear cause: `diagnosing-bugs`.
- Need proof that generated or changed tests protect the right behavior: `verify-tests`.
- Mutation testing or Stryker request: `verify-tests`.
- Need runnable evidence before deciding: `/prototype`.
- Need review before PR: `review-change`.
- Session is long or work is pausing: `/handoff`.

## Output

Use this format:

```markdown
Recommended skill: `<skill-name>`

Why: <short reason>

Session guidance: <same session | fresh session | handoff first>

Next prompt:
<exact prompt the user can paste>
```
