# Planning a Story

Before any code, you and the agent turn the story into a written plan. The tool for this is the `plan-story` skill. This page explains how to use it well.

## The idea

Our stories are usually quite well specified, but we don't always know what we don't know. Even a clear one like "Add a filter to the bookings list" hides a dozen small decisions: which fields filter? combinable? does it hit the backend or filter client-side? what's the empty state? does it persist across navigation?

Instead of guessing, the agent **interviews you** until those decisions are explicit, then writes them down.

## How the interview works

- **One question at a time.** The agent asks a single question and waits for your answer before moving on. No walls of ten questions. This keeps it readable and keeps you thinking clearly, and it's far kinder to our human brains.
- **It recommends an answer.** Every question comes with the agent's suggested answer and a short reason. If you don't know the answer, the recommendation teaches you what good thinking looks like — and you can just accept it or push back.
- **It reads the code instead of asking.** If a question can be answered by looking at the codebase ("what does `IRatePlanRepository` return?"), the agent looks it up rather than making you explain. You only get asked the things only you can answer.
- **It walks the decision tree.** Decisions that depend on earlier decisions come later, so the plan stays coherent.

## What you do

- Answer honestly. "I don't know, what do you recommend?" is a fine answer.
- Push back when a recommendation doesn't fit our codebase or product. The agent doesn't know our context better than you do.
- Call out anything explicitly **out of scope** so the plan records it.
- Keep going until there are no fuzzy areas left.

## The output: a written plan

The result is a short plan a human can review in a couple of minutes:

- **Goal** — one or two sentences.
- **Scope** — what's included.
- **Out of scope** — what we're deliberately not doing.
- **Approach** — the chosen design, in plain language. Decisions and their reasons.
- **Affected areas** — components/services/screens involved (named, not exhaustive file paths).
- **Test plan** — how we'll know it works.
- **Open questions** — anything still unresolved (ideally none by the end).

For larger work this plan is also what gets split into slices (see [`04-splitting-work.md`](./04-splitting-work.md)) and what review checks against (see [`06-review-and-verification.md`](./06-review-and-verification.md)).

## Getting it reviewed

Check [`02-work-types.md`](./02-work-types.md). For large stories or unclear technical risk, someone with more experience in that area reads the plan **before** implementation. This is the cheapest possible place to catch a wrong approach, far cheaper than at PR review.

## Tip

If a planning question can't be settled by discussion — e.g. "will this animation perform on the bookings grid?" — don't guess in the plan. Build a small throwaway prototype to get the answer, then finish the plan with what you learned.
