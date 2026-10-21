---
name: grill-with-docs
description: Run the FeatureKit design-tree interview with repo facts and durable docs. Use explicitly before a PRD or implementation when scope or success criteria need clarification.
disable-model-invocation: true
metadata:
  featurekit-version: "0.14.1"
---

# Grill With Docs

Run the complete [`grilling`](../grilling/SKILL.md) interview contract with this repository overlay. Do not duplicate or weaken its question-tool gate, design-tree states, self-contained question rules, uncertainty handling, final audit, approval, or destination behavior.

## Repository Overlay

Only after the question-tool gate clears:

1. Read `AGENTS.md`, relevant `docs/agents/`, the `Glossary:` that `docs/agents/domain.md` names (default `CONTEXT.md`), accepted ADRs, and only source needed for open decisions.
2. Find discoverable facts instead of asking the user. Use `orchestrate-work` only for bounded fact or coverage-audit work; the primary keeps the tree and all user decisions.
3. Treat accepted ADRs as constraints. Use `secure-design` for auth, authorization, sensitive data, APIs, deployment, integrations, generated code, or untrusted input.
4. Propose glossary changes or `/record-adr` follow-ups when useful, but write no durable docs or production code before final approval.

## Result

When `grilling` reaches final approval, present a reviewable plan containing goal, depth, users, scope, exclusions, decisions, domain terms, risks, security, acceptance criteria, verification, ADR follow-ups, and the exact next workflow.

A product-depth result continues to its PRD or slices. An implementation-ready result follows `using-featurekit`: focused authorized work may continue here; substantial work receives the separate fresh/current/stop destination question. A later PRD or slice remains a staged artifact requiring its own final approval.
