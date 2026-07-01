# Changelog

## 0.4.1 - 2026-07-01

- Tightened the planning gate so implementation requires an approved written plan, PRD, or slice.
- Updated `using-featurekit`, `grill-with-docs`, `grilling`, `to-prd`, `to-slices`, `implement`, `execute-slices`, and `setup-featurekit` so accepting an interview recommendation cannot trigger coding.
- Updated docs, local-LLM guidance, setup output, and install examples to show the expected flow: clarify, write the plan, review and approve it, then implement or hand off.

## 0.4.0 - 2026-07-01

- Added the default security suite: `secure-design`, `secure-code`, `secure-api`, `secure-deploy`, and `security-review`.
- Added `docs/agents/security.md` to setup so product repos can record auth, authorization, sensitive data, API, secrets, dependency, deployment, logging, and incident-response context.
- Integrated security guidance into planning, PRDs, slices, implementation, execution, bug diagnosis, reviews, handoffs, docs, local-LLM guidance, and a dedicated security workflow guide.
- Kept the suite stack-neutral and scanner-neutral; product repos choose their own tools and durable security decisions through setup docs and ADRs.

## 0.3.0 - 2026-06-30

- Added `using-featurekit` as a lightweight session bootstrap and router.
- Added `/execute-slices` for autonomous sequential execution of approved implementation slices.
- Updated setup, routing, docs, local-LLM guidance, and install verification for the new workflows.

## 0.2.0 - 2026-06-30

- Renamed the workflow work item from issues to slices.
- Renamed the PRD splitting skill to `/to-slices`.
- Renamed setup guidance to work tracker and switched new setup docs to `docs/agents/work-tracker.md`.

## 0.1.2 - 2026-06-30

- Added the `verify-tests` skill for checking whether generated or changed tests protect the intended behavior.
- Integrated `verify-tests` with TDD, implementation, bug diagnosis, review, router, docs, and local-LLM guidance.
- Kept mutation testing gated so Stryker or equivalent tools run only when requested or justified by concrete risk.

## 0.1.1 - 2026-06-30

- Added canonical Agent Operating Principles for thinking before coding, simplicity first, and surgical changes.
- Updated setup to copy those principles into target repo agent instructions.
- Updated implementation, diagnosis, TDD, review, design, prototype, pre-commit, docs, and local-LLM guidance to apply the principles before coding, refactoring, or verification work.

## 0.1.0 - 2026-06-30

Initial tracked FeatureKit release.

- Added `VERSION` and `CHANGELOG.md` so FeatureKit has a human-readable release marker.
- Added `featurekit-version` metadata to every skill so installed skill copies expose the release.
- Added the `record-adr` user-invoked skill for per-decision ADRs.
- Added the `adr-guidance` model-invoked skill for following accepted ADRs.
- Updated planning, implementation, review, handoff, docs, and local-LLM guidance to treat accepted ADRs as governing context.
