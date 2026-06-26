# Quick Start — One-Page Checklist

Pin this. It's the whole workflow on one page. Detail lives in the other docs; this is what you actually do during a story.

> **The rule:** no code until there's a written, reviewed plan. Every change gets a plan — small ones just get a small plan.

*New here? The code-font names like `plan-story` and `split-story` are our skills. They ship via BridgeKit under `.agents/skills/`. See [`07-tool-setup.md`](./07-tool-setup.md) for how to run them in your tool.*

## The steps

1. **Understand the story.** Read it. Be clear on what it's asking for and what done looks like before you plan.

2. **Interrogate the plan.** Run `plan-story`. The agent asks you one question at a time, recommends an answer to each, and reads the codebase instead of asking things it can find itself. Answer honestly — this is where wrong assumptions die cheaply.

3. **Write the plan.** The output is a short written plan: goal, scope, what's out of scope, approach, and how it'll be tested. This is the spec everything gets checked against.

4. **Get more eyes where it helps.** Check [`02-work-types.md`](./02-work-types.md). Small bug? You can proceed. Large story or unclear risk? Someone with more experience in that area reviews the plan *before* any code.

5. **Slice the work.** Run `split-story`. Break it into vertical slices — each one independently understandable, reviewable, and testable. Skip this for small changes that are already one slice.

6. **Implement one slice at a time.** Run `implement-slice`. Use TDD for logic, transformations, services, and bug fixes. Keep each PR small (under 400 lines). **Read every diff. Understand every change. Never accept output blindly.**

7. **Verify mechanically.** `yarn lint && yarn typecheck && yarn test && yarn build`. All green before review. Pre-commit hooks enforce the basics; don't rely on them as your only check.

8. **Review.** Run `frontend-review`, then a human review. Check: meets the spec? follows our standards? typed correctly? CUI/BTLB-aligned? tests meaningful? PR small and clear? Screenshots attached for UI.

## If you get stuck or need to pause

- Can't answer a planning question without trying something? Build a throwaway prototype, then come back to the plan.
- Running out of context or handing off? Run `handoff-context` to write a short handoff note so the next session (or person) starts clean.
- Chasing a bug you can't reproduce? Run `diagnose-bug`.

## Skills cheat-sheet

| Step | Skill |
|---|---|
| Plan a story | `plan-story` |
| Split a large story | `split-story` |
| Build a slice (with TDD) | `implement-slice` |
| Review a diff | `frontend-review` |
| Hunt a hard bug | `diagnose-bug` |
| Pause / hand off | `handoff-context` |
