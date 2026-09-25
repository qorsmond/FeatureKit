---
name: ask-featurekit
description: Start clarification for a raw feature or route another product or engineering request to the right FeatureKit flow. Use explicitly when the user is unsure what to run or has a new idea, bug, PRD, slice, implementation, review, prototype, or handoff need. User-invoked router; do not write production code inside this skill.
disable-model-invocation: true
metadata:
  featurekit-version: "0.7.0"
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
   - slice planning,
   - approved multi-slice execution,
   - implementation,
   - bug diagnosis,
   - review,
   - security review or hardening,
   - test verification or mutation testing,
   - architecture improvement,
   - ADR recording or conflict,
   - prototype,
   - handoff.
4. For a raw product idea or unclear feature scope, begin the `grilling` design-tree interview now. Do not output only a recommendation or ask the user to paste the idea again.
5. If the user asks for production code without a written plan, PRD, or slice approved through its final approval question, begin planning first.
6. Only the interview's final approval question approves its clarified plan. Earlier answers and accepted recommendations do not.
7. After final approval, choose the next planning workflow from the plan and original request. Continue automatically through required PRDs, ADRs, prototypes, or slices when the harness permits. If an explicit-only skill cannot be chained, give one exact invocation without asking the user to repeat context.
8. Generated PRDs and slices are staged artifacts and require their own final approval. When the approved artifact is implementation-ready, apply the destination rules from `using-featurekit`: continue focused work in the current task without asking, and ask about a fresh task on the current checkout and branch only for substantial work. Do not offer implementation from product-depth work. Stop and ask if intent or authority is unclear.
9. For requests other than raw features, recommend the next skill in one or two sentences and say whether to stay in the same session.

## Routes

- New product idea with a codebase: begin `grilling` now using repo context.
- New product idea without a codebase: begin `grilling` now and keep it stateless.
- Durable spec needed: `/to-prd`.
- Durable architectural decision to capture or update: `/record-adr`.
- Security requirements, threat modeling, or hardening needed: `secure-design`.
- Multi-step implementation planning: `/to-slices`.
- Approved ordered slices ready for autonomous execution and explicitly requested now: `/execute-slices`.
- One approved slice ready to build and explicitly requested now: `/implement`.
- Hard bug or unclear cause: `diagnosing-bugs`.
- Need proof that generated or changed tests protect the right behavior: `verify-tests`.
- Need feature/runtime evidence or an assessment of validation gaps: `validate-feature`.
- Need capability-based work distribution: `orchestrate-work` within the active workflow, after any interview gate; this router does not dispatch workers.
- Mutation testing or Stryker request: `verify-tests`.
- Need runnable evidence before deciding: `/prototype`.
- Need review before PR: `review-change`.
- Need focused security review, OWASP review, API security review, or deployment security review: `security-review`.
- API security concerns inside planning or implementation: use `secure-api` with the selected workflow.
- Deployment, CI/CD, secrets, or runtime hardening concerns: use `secure-deploy` with the selected workflow.
- Session is long or work is pausing: `/handoff`.

## Output

Use this format only when routing instead of starting a raw-feature interview:

```markdown
Recommended skill: `<skill-name>`

Why: <short reason>

Session guidance: <same session | fresh session | handoff first>

Next prompt:
<exact prompt the user can paste>
```
