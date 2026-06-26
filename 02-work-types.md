# Work Types — Right-Sizing the Process

Not every change needs the full flow. A one-line bug fix shouldn't cost an hour of ceremony. But **every change still gets a written plan** — for small work the plan is just a few lines in the PR description or ticket.

Use this table to decide how much planning and review a piece of work needs.

| Work type | Planning | Slicing | TDD | Review |
|---|---|---|---|---|
| **Small bug** (clear cause, localized) | Short written note: cause + fix + how you'll verify | Not needed | Regression test for the fix | Standard PR review + `frontend-review` |
| **Normal story** (well understood) | `plan-story` → written plan | Usually one slice; split if it grows | For logic/services/transforms | `frontend-review` + human review |
| **Large story** (multiple areas/sessions) | `plan-story` → plan, **second set of eyes on the plan before code** | `split-story` → vertical slices, one PR each | Per slice, for logic | Per-slice `frontend-review` + human review |
| **Unclear technical risk** (new pattern, perf, integration unknowns) | `plan-story` + a throwaway prototype to answer the open question, **then** finalize plan; **extra eyes on the plan** | After the risk is resolved | Yes, around the risky part | More-experienced dev in early |
| **UI / design-system work** | `plan-story`, with the BTLB decisions and which CUI components (e.g. `form-field`, `multiselect-chips`, `card`) in the plan | By component or screen | Light — test behavior/logic, not pixels | `frontend-review` with design-system check; screenshots required (mobile + desktop) |
| **Hard-to-reproduce bug** | `diagnose-bug` (reproduce → minimize → fix) | Not needed | Regression test that locks in the reproduction | Standard PR review + `frontend-review` |

## How to read it

- **Planning column** is never empty. The lightest version is a few written lines; the heaviest is a reviewed plan plus a prototype.
- We all own quality like a senior would. For large stories and anything with unclear technical risk, **we get a second set of eyes on the plan before code**, ideally from someone with more experience in that area. For everything else, the plan can be reviewed alongside the PR.
- **When in doubt, size up.** If a "small bug" turns out to touch three services, stop and treat it as a normal or large story — re-plan before continuing.

## What this prevents

- A 5-line fix quietly turning into a 600-line refactor because the agent "improved" things along the way.
- Reviewers getting surprised at review time by an approach they'd have steered away from at planning time.
- Wasted prototyping ceremony on changes that were obvious from the start.
