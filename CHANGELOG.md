# Changelog

## 0.1.0 - 2026-06-30

Initial tracked FeatureKit release.

- Added `VERSION` and `CHANGELOG.md` so FeatureKit has a human-readable release marker.
- Added `featurekit-version` metadata to every skill so installed skill copies expose the release.
- Added the `record-adr` user-invoked skill for per-decision ADRs.
- Added the `adr-guidance` model-invoked skill for following accepted ADRs.
- Updated planning, implementation, review, handoff, docs, and local-LLM guidance to treat accepted ADRs as governing context.
