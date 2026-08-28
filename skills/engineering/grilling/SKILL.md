---
name: grilling
description: Reusable design-tree interview for turning a fuzzy idea, plan, or design into clear decisions. Use when the model needs dependency-aware questions before planning, PRD creation, or implementation.
metadata:
  featurekit-version: "0.5.0"
---

# Grilling

Interview until the selected planning depth has no material decision left open.

## Choose The Depth

Choose the interview depth from the intended next artifact and the risk:

- Use product depth when the next artifact is a PRD that will settle implementation details later.
- Use implementation-ready depth when a small plan may go directly to implementation.
- Expand either depth when architecture, security, migration, rollout, or irreversible choices require it.

State the chosen depth in plain language. Let the user correct it.

## Build The Design Tree

Map each user decision as a node. Record which other decisions must be settled before it can be asked. Track nodes as:

- settled,
- ready,
- blocked, with the unsettled prerequisite or fact search named,
- removed because an earlier answer made them irrelevant.

The frontier is every ready decision whose prerequisites are settled.

Within the selected depth, include every material decision that can change product behavior, domain rules, user experience, security, architecture, migration, rollout, or verification. Do not ask the user to choose low-risk implementation details already settled by repo conventions.

## Discover Facts And Audit Coverage

- Find facts from the repo, tools, and available context. Never ask the user for a fact the agent can discover.
- When useful and available, send independent fact searches to subagents. A running search blocks only the decisions that need its result; ask unrelated frontier questions now. If every remaining decision needs the result, wait for it instead of asking the user for the fact.
- The primary agent owns the tree and asks every user question. Subagents report facts or possible missing branches; they do not make user decisions.
- Audit the tree after initial construction, after answers that materially reshape it, and before declaring it complete. Give an audit subagent the selected depth and current ledger. Use a subagent when available and useful; otherwise perform the audit directly.

## Ask In Rounds

1. Recompute the frontier after each answer round.
2. Ask only as many frontier questions as the active question tool supports. Leave the rest ready for a later round.
3. Prioritize decisions that unlock the most branches, then security, irreversible choices, and high-impact product behavior.
4. Number each question. Ask one decision per question.
5. Put the recommended answer first and give a short, practical reason.
6. Use simple words, short sentences, and concrete consequences. Explain a necessary technical term once. Avoid compound questions, double negatives, and unexplained abbreviations.
7. Offer only meaningful choices and allow a custom answer.
8. Wait for the user's answers before recomputing the tree.

If an ancestor answer changes, remove descendants that no longer apply, add any descendants the new answer creates, and reopen every affected descendant that still applies as ready or blocked. Do this even if it had an earlier answer; never restore or silently reuse that answer.

Prefer the harness's structured question tool, such as Codex `request_user_input`, Claude Code `AskUserQuestion`, or OpenCode `question`. Discover the active tool and respect its current schema instead of assuming a fixed brand limit.

Before the first round or any tool-availability pause, show the initial ledger. If a native question tool exists but is unavailable because of mode, configuration, or permissions, explain how to enable it and pause. Continue with numbered plain text only if the user explicitly opts in. If the harness has no native question tool, use numbered plain text. Plain-text rounds contain at most three questions.

After each round, restate a short ledger using the four tree states: settled, ready, blocked, and removed. Name what blocks each blocked decision. Repeat the chosen depth and say the user can correct it. Keep the ledger understandable without rereading earlier rounds so compaction and handoff preserve the interview state. After compaction or handoff, rebuild and audit the tree from the ledger. Preserve settled answers unless newer user input conflicts; when it does, reopen affected descendants.

## Complete And Continue

Before completion, audit the tree again. When no material decision remains open within the selected depth:

1. Show the complete clarified plan in simple language.
2. Ask one final approval question through the native question tool when available.
3. Offer three clear choices: approve the plan, ask more questions, or change the plan.

Only final approval approves the clarified plan. Accepting a recommendation or answering an earlier question does not.

Return control to the active FeatureKit workflow after approval. It should choose the next workflow from the approved plan and original request, continue automatically when the harness permits, and stop when intent or authority is unclear. A later PRD or slice is a richer staged artifact and still needs its own approval. Do not implement production code from this interview discipline.

## Output

Summarize:

- clarified goal,
- selected interview depth,
- decisions,
- ADR follow-ups,
- out of scope,
- open risks,
- acceptance criteria and verification,
- next recommended skill or action, such as producing a PRD, slicing an approved plan, asking the user to approve a small plan for implementation, prototyping, or handing off.
