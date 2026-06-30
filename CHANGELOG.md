# Changelog

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
