# Rollout Plan

How we introduce this without disrupting delivery, and how we'll know it's working.

## Stages

**Stage 0 — Set up (in progress).**
Stand up **BridgeKit** to ship the `.agents/` skills and have each pilot project depend on it. Add the thin `AGENTS.md` and `CLAUDE.md`. Set up the pre-commit hooks and branch protection we don't have yet. Make sure `lint`, `test`, and `build` run, and add a `typecheck` script.

**Stage 1 — Pilot, first week of the sprint.**
We all start using the flow on real work and fix whatever's clunky as we go. Everyone's in from the start, no one's gated. The goal that first week is to find friction: where does a plan come out thin? where does a skill need sharper wording?

**Stage 2 — Improve through retros (ongoing).**
The workflow and skills are team-owned. Each retro: what slowed us down? what did review keep catching? Fold recurring fixes into `AGENTS.md` or a skill via a normal PR to BridgeKit. The process should get sharper over time, not calcify.

## What we measure

We're looking for trend lines, not vanity numbers. Compare a few sprints before and after:

- **Smaller PRs** — median PR size down; fewer PRs over 400 lines.
- **Fewer review reworks** — fewer review cycles per PR; fewer "this isn't what the story asked for" comments.
- **Fewer wrong technical approaches** — fewer PRs scrapped or heavily reworked after review because the approach was wrong (caught at plan stage instead).
- **Better test coverage on logic** — meaningful tests around services, transforms, and bug fixes (not raw coverage %).
- **Fewer bugs bouncing back from testing** — fewer tickets reopened or returned by QA.

## Watch for these failure modes

- **Skipping the plan** ("I'll just ask it to build the thing"). This is the most common way the workflow quietly dies. Treat a missing plan as a process miss, not a style preference.
- **Blind acceptance.** Approving your own agent's diff without understanding it. The "read every diff" rule is the safeguard — reinforce it in review.
- **Plan/code drift.** Implementation wanders from the plan and nobody updates the plan. Update the plan when reality changes.
- **Rule bloat.** `AGENTS.md` slowly growing into a procedures manual. Keep procedures in docs/skills; keep `AGENTS.md` to stable facts and rules.
