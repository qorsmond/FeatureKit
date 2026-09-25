---
name: grilling
description: Reusable design-tree interview for turning a fuzzy idea, plan, or design into clear decisions. Use when the model needs dependency-aware questions before planning, PRD creation, or implementation.
metadata:
  featurekit-version: "0.10.0"
---

# Grilling

Interview until the selected planning depth has no material decision left open.

## Choose The Depth

Choose the interview depth from the intended next artifact and the risk:

- Use product depth when the next artifact is a PRD that will settle implementation details later.
- Use implementation-ready depth when a small plan may go directly to implementation.
- Expand either depth when architecture, security, migration, rollout, or irreversible choices require it.

State the chosen depth in plain language. Let the user correct it.

## Gate The Question Tool

Apply this gate immediately after choosing the provisional depth and before repo inspection, fact searches, subagents, or task-specific secondary skills:

1. Discover whether the harness has a native question tool and whether the current mode, configuration, or permissions allow it.
2. Build a provisional initial ledger from the user's request and context already present. It may be refined after fact discovery.
3. Show that ledger before the first question round or any tool-availability pause.
4. If a native question tool exists but is unavailable, explain the exact user action that enables it and pause. Do not perform repo discovery first.
5. Continue with numbered plain text only after the user explicitly opts in. If the harness has no native question tool, use numbered plain text with at most three questions per round.

Only after this gate clears should repo discovery refine the design tree. This gate takes precedence over the fact-discovery guidance below.

## Build The Design Tree

Map each user decision as a node. Record which other decisions must be settled before it can be asked. Track nodes as:

- settled,
- ready,
- blocked, with the unsettled prerequisite or fact search named,
- removed because an earlier answer made them irrelevant.

The frontier is every ready decision whose prerequisites are settled.

Within the selected depth, include every material decision that can change product behavior, domain rules, user experience, security, architecture, migration, rollout, or verification. Do not ask the user to choose low-risk implementation details already settled by repo conventions.

## Discover Facts And Audit Coverage

- After the question-tool gate clears, use `orchestrate-work` to choose direct discovery or bounded fact/audit workers. Read-only discovery does not require implementation approval; production edits do. Do not reload stable findings or let workers re-interview the user.
- Find facts from the repo, tools, and available context. Never ask the user for a fact the agent can discover.
- When useful and available, send independent fact searches to subagents. A running search blocks only the decisions that need its result; ask unrelated frontier questions now. If every remaining decision needs the result, wait for it instead of asking the user for the fact.
- The primary agent owns the tree and asks every user question. Subagents report facts or possible missing branches; they do not make user decisions.
- Audit the tree after initial construction, after answers that materially reshape it, and before declaring it complete. Give an audit subagent the selected depth and current ledger. Use a subagent when available and useful; otherwise perform the audit directly.

## Ask In Rounds

1. Recompute the frontier after each answer round.
2. Ask only as many frontier questions as the active question tool supports. Leave the rest ready for a later round.
3. Prioritize decisions that unlock the most branches, then security, irreversible choices, and high-impact product behavior.
4. Number each question. Ask one decision per question.
5. Make every question self-contained inside the question UI or numbered prompt. Include one or two short context sentences that explain the current situation and why the answer matters, then ask one direct question.
6. Use the user's words and concrete outcomes in headers, questions, and option labels. Do not expose repository identifiers, architecture labels, or technical terms unless the user needs them to decide; define an unavoidable term once in plain language.
7. Put the recommended answer first and give a short, practical reason. Each option description must say what the user or system will experience and name its meaningful tradeoff.
8. For choices that materially change scope, security or privacy, migration effort, cost, reversibility, or rollout risk, state that consequence before the user chooses. Keep routine context short.
9. Avoid compound questions, double negatives, unexplained abbreviations, and choices distinguished only by implementation detail. Offer only meaningful choices and allow a custom answer.
10. Wait for the user's answers before recomputing the tree.

Required context belongs with the question, not only in earlier commentary or the decision ledger. A user should be able to answer the question without rereading the conversation.

Treat `not sure`, `I don't understand`, a question in place of an answer, or any equivalent uncertainty as unresolved. Do not infer or recommend the decision into a settled state. Explain the missing idea in plain language, give one concrete example when useful, and re-ask only that decision in the next round. Preserve unrelated answers from the same round.

If an ancestor answer changes, remove descendants that no longer apply, add any descendants the new answer creates, and reopen every affected descendant that still applies as ready or blocked. Do this even if it had an earlier answer; never restore or silently reuse that answer.

Prefer the harness's structured question tool, such as Codex `request_user_input`, Claude Code `AskUserQuestion`, or OpenCode `question`. Respect its current schema instead of assuming a fixed brand limit. The earlier Question Tool Gate owns discovery, unavailable-tool pauses, and plain-text fallback authorization.

After each round, restate a short ledger using the four tree states: settled, ready, blocked, and removed. Name what blocks each blocked decision. Repeat the chosen depth and say the user can correct it. Keep the ledger understandable without rereading earlier rounds so compaction and handoff preserve the interview state. After compaction or handoff, rebuild and audit the tree from the ledger. Preserve settled answers unless newer user input conflicts; when it does, reopen affected descendants.

## Complete And Continue

Before completion, audit the tree again. When no material decision remains open within the selected depth:

1. Show the complete clarified plan in simple language.
2. Ask one final approval question through the native question tool when available.
3. Offer three clear choices: approve the plan, ask more questions, or change the plan.

Only final approval approves the clarified plan. Accepting a recommendation or answering an earlier question does not.

Keep plan approval separate from the choice of where work continues. After approval, return control to the active FeatureKit workflow:

- If the approved artifact is implementation-ready and implementation was requested, continue focused work in the current task without asking where to run it. For substantial work only, ask a separate structured destination question with three choices: create a fresh implementation task on the current checkout and branch (recommended), continue in the current task, or stop after planning. Apply the substantial-work criteria from `using-featurekit`.
- If product-depth decisions, a PRD, or slices are still required, route to that planning artifact instead. Do not offer implementation yet.
- Create a fresh task only after the user selects it. Use the `handoff` contract to keep it on the current checkout and branch and pass the approved artifact and implementation context without a transcript or a restarted interview.
- If a task tool exists but the current mode or permissions disable it, explain the exact user action that enables it and pause without reopening settled decisions. If no task tool exists, provide one exact self-contained prompt for a new session.

A later PRD or slice is a richer staged artifact and still needs its own approval. Do not implement production code from this interview discipline.

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
