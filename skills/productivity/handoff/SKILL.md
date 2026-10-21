---
name: handoff
description: Preserve compact continuation state or create a user-selected fresh implementation task without replaying the conversation. Use for pauses, long context, or substantial approved work.
disable-model-invocation: true
metadata:
  featurekit-version: "0.14.0"
---

# Handoff

Apply the workflow invariants in `using-featurekit`. Build from the approved artifact and durable evidence, never a transcript summary. The plan file's slice `Status`, `Evidence` and `Notes` are the durable state; update them first, and put in the handoff only what they cannot hold.

## Capture

Record once:

- objective, approved artifact and authority;
- completed work, ordered next action, scope and exclusions;
- changed paths/relevant symbols and repository snapshot;
- governing decisions, ADRs, security constraints, risks and gotchas;
- actual verification/runtime/platform evidence and gaps;
- relevant worker routes/results, failed attempts with their failure packet, pending ownership;
- available repo tools and the exact next FeatureKit skill.

Use stable paths and hashes instead of copied source, diffs, logs, repeated checks, or worker prose. Stop or coordinate active writers before transferring ownership. Write a note at the `Handoffs` location in `docs/agents/workflow-locations.md` (default `docs/handoff/<slug>.md`) only when a durable note is useful or the destination cannot receive the complete prompt directly.

## Fresh Implementation Task

Use only after final approval of substantial implementation and explicit user selection of the fresh-task option. Focused work continues in the current task.

1. Pass the approved artifact once, objective, boundaries, decisions, ADR/security constraints, repository state, relevant paths, verification commands, gaps, and tools.
2. Name `/implement` for one plan/slice or `/execute-slices` for an explicitly approved batch. Do not restart the interview.
3. Create the task in the same saved project, checkout, and active branch. Do not create a worktree, branch, clone, or isolated checkout.
4. If the task tool cannot preserve that environment or is disabled, give the exact enabling action and pause. If unavailable, provide one self-contained copy/paste prompt for the same checkout.

Report the handoff path or created task identifier. Queued dispatch is not completed implementation.
