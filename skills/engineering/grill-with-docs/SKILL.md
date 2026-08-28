---
name: grill-with-docs
description: Interview the user about a product or engineering idea while reading and updating repo context such as AGENTS.md, docs/agents, CONTEXT.md, and ADRs. Use explicitly before PRDs or implementation when scope, domain language, risks, or success criteria need clarification. User-invoked planning skill; do not write production code.
disable-model-invocation: true
metadata:
  featurekit-version: "0.5.0"
---

# Grill With Docs

Clarify an idea with a dependency-aware design tree until it is ready for a reviewable written plan or PRD.

## Process

1. Read `AGENTS.md`, `docs/agents/`, `CONTEXT.md`, relevant ADRs, and relevant code.
2. Choose product depth for a later PRD or implementation-ready depth for a small direct plan. Expand the depth for architecture, security, migration, rollout, or irreversible choices. State the choice so the user can correct it.
3. Build a design tree. Each decision records its prerequisites and is settled, ready, blocked, or removed by an earlier answer. Name the unsettled prerequisite or fact search for every blocked decision. The frontier is every ready decision whose prerequisites are settled.
4. Include every material decision within the selected depth that can change behavior, domain rules, user experience, security, architecture, migration, rollout, or verification.
5. Find repo and system facts yourself. When useful and available, send independent searches to subagents. Do not delay unrelated frontier questions while a search runs. If every remaining decision needs the result, wait instead of asking the user for the fact.
6. Keep all user decisions and questions with the primary agent. Use subagents only for facts and missing-branch audits.
7. Audit the tree after initial construction, after materially reshaping answers, and before completion. Give an audit subagent the selected depth and current ledger. Audit directly when subagents are unavailable.
8. Treat accepted ADRs as constraints and call out any conflict. Use `secure-design` when the idea touches auth, authorization, sensitive data, APIs, deployment, integrations, generated code, or untrusted input.
9. Recompute the frontier after each answer round. Ask up to the active question tool's current limit and leave other ready decisions for later.
10. Prioritize questions that unlock more branches, followed by security, irreversible choices, and high-impact product behavior.
11. Number every question, ask one decision per question, and put the recommended answer first with a short reason grounded in repo context.
12. Use simple words and short sentences. Explain necessary technical terms once. Give concrete consequences. Avoid compound questions, double negatives, and unexplained abbreviations.
13. Offer only meaningful choices and allow a custom answer. Wait for all answers in the round before recomputing the tree.
   If an ancestor answer changes, remove descendants that no longer apply, add any descendants the new answer creates, and reopen every affected descendant that still applies as ready or blocked. Do this even if it had an earlier answer; never restore or silently reuse that answer.
14. Prefer the harness's structured question tool. Discover the available tool and respect its schema. Show the initial ledger before the first round or any tool-availability pause. If the tool exists but is unavailable, explain how to enable it and pause; use plain text only after explicit user consent. If no tool exists, use numbered plain text. Plain-text rounds contain at most three questions.
15. After each round, show a concise ledger using the four tree states: settled, ready, blocked, and removed. Name what blocks each blocked decision. Repeat the selected depth and say the user can correct it. Keep the ledger understandable without rereading earlier rounds so the interview survives compaction or handoff. After compaction or handoff, rebuild and audit the tree from the ledger. Preserve settled answers unless newer user input conflicts; when it does, reopen affected descendants.
16. When useful, propose updates to `CONTEXT.md` or recommend `/record-adr`, but do not write durable docs before final approval.

## Completion And Approval

When the final audit finds no material decision open within the selected depth:

1. Show the complete clarified plan in simple language.
2. Ask one final approval question through the native question tool when available.
3. Offer three choices: approve the plan, ask more questions, or change the plan.

Only final approval approves the clarified plan. Earlier answers and accepted recommendations do not.

After approval, choose the next workflow from the plan and the original request. Continue automatically when the harness permits. If an explicit-only skill cannot be chained, give one exact invocation without asking the user to repeat context. A generated PRD or slice remains a staged artifact that needs its own approval. Implementation may begin without another plan approval only when the original request already asked to make the change and the confirmed plan is implementation-ready. If intent or authority is unclear, stop and ask. Do not write production code inside this skill.

## Output

When the idea is clear, output a reviewable plan:

```markdown
## Clarified Feature: <name>

Goal:
<short statement>

Interview depth:
<product | implementation-ready, with reason>

Users:
<who this affects>

Scope:
<included work>

Out of scope:
<excluded work>

Decisions:
<important decisions and reasons>

Domain terms:
<terms to add or update>

Risks:
<risks and unknowns>

Security:
<security requirements, abuse cases, or none>

Acceptance criteria:
<observable outcomes>

Verification:
<tests, checks, and manual proof>

ADR updates:
<none | decisions to record with /record-adr>

Next options:
<automatic next workflow | exact explicit invocation when chaining is unavailable>
```
