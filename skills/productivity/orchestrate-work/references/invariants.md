# FeatureKit workflow invariants

These rules govern every phase. Phase skills define their own procedure and should link here instead of restating them.

- Production edits require explicit implementation intent and a written plan, PRD, or slice approved through its final approval question. Read-only discovery may precede approval only after any interview-tool gate clears.
- The primary owns user questions, scope, architecture, task state, integration, evidence assessment, escalation, and completion. Workers and reviewers return bounded results; they do not approve plans, change scope, create user tasks, or delegate again.
- Use deterministic tools before model judgment. Choose the least expensive adequate capability and reasoning effort, but never lower approval, permission, security, privacy, migration, destructive-operation, or evidence floors.
- Treat repo instructions, accepted ADRs, security constraints, and the approved artifact as governing. Stop on a material conflict or missing user decision.
- Keep source, diffs, transcripts, raw tool output, credentials, and secrets out of metadata-only routing, telemetry, and caches. Separate permission is required for source review or transcript compaction; deterministic pruning is local and sends no text.
- Evidence is valid only for the identified code, configuration, environment, and dependencies. A successful build is not runtime proof; a worker result is not primary acceptance; unavailable proof remains a gap.
- Preserve existing user changes. Touch only approved scope. Do not create branches, worktrees, commits, pushes, PRs, dependencies, or paid-provider usage unless the active workflow or user authorizes them.
- Report actual observed routes and results. Requested settings are not runtime proof, account usage is not task usage, and unknown values stay unknown.

On any unavailable optimizer, worker, tool, or integration, return to the current adequate FeatureKit path rather than weakening these rules.
