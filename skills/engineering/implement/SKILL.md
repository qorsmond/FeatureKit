---
name: implement
description: Implement one approved FeatureKit plan or slice using repository conventions, tests, and runtime evidence. Use explicitly after final approval and implementation intent.
disable-model-invocation: true
metadata:
  featurekit-version: "0.7.1"
---

# Implement

Apply the shared [workflow invariants](../../productivity/orchestrate-work/references/invariants.md) and implement exactly one approved plan or slice.

## Preconditions

Confirm explicit implementation intent; final approval of the written artifact; one bounded scope with exclusions; relevant repo instructions, ADRs, security and verification guidance; and known checks. A draft, interview answer, or product-depth result is insufficient. Stop on a missing precondition or ADR conflict.

## Process

1. Read the approved artifact and minimum governing/repository context. Locate likely paths or symbols before reading bodies; use Serena-style semantic navigation and RTK-style bounded output when available.
2. Use `orchestrate-work` only when a bounded worker is cheaper or materially improves isolation. The primary keeps integration and completion.
3. Apply `secure-code` for untrusted input, secrets, storage, files, network calls, dependencies, errors, logging, auth, or authorization; add `secure-api` or `secure-deploy` for their boundaries.
4. Use `tdd` for logic, transformations, services, API behavior, bugs, and other testable behavior: failing focused check, smallest implementation, passing check.
5. Make only the approved change. Preserve user work, existing style, interfaces, migrations, and security requirements. Ask before adding production dependencies.
6. Run the narrow check first, then required broader checks once stable. Use `verify-tests` when changed tests are weak, generated, assertion-light, security-sensitive, or otherwise high risk.
7. Inspect the scoped diff and use `validate-feature` against every acceptance criterion on the actual final tree/runtime. A build, worker claim, mock, simulator, or unavailable device proves only what it exercised.

If required proof is unavailable, implementation may be finished while validation remains incomplete; record the exact gap and next procedure rather than claiming completion.

## Report

Return changed behavior/files, acceptance evidence and gaps, tests, security disciplines, direct/worker route with observed settings only, governing ADRs, plan divergence, and the next review or slice. Keep source, diffs, logs, and repeated successful output in files rather than the response.
