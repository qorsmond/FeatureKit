# Worked Example

A realistic run through the whole workflow on a story we actually shipped. Copy this pattern.

We'll use **NBUI-556 — Add filter on Status on the Transactions page**. It's a real one, now deployed. The facade didn't exist when it first shipped, so this is **built the way we would today** — a good way to see the flow on familiar work.

---

## The story (as it arrived)

> **NBUI-556 — Add filter on Status on the Transactions page**
> Users want to narrow a long transactions list down to the statuses they care about.

Clear enough on the face of it, but with the usual decisions still to nail down.

---

## Step 2 — Planning interview (`plan-story`)

The agent asks one question at a time, each with a recommendation. Abbreviated:

> **Q:** Which statuses should be filterable? *Recommendation: reuse the status values we already show on the Transactions page rather than inventing a new list.*
> **A:** Yes, reuse them.

> **Q:** Filter client-side on the loaded list, or pass a status param to the endpoint? *Recommendation: server-side via a `status` param — lists are long and date filtering already works this way.*
> **A:** Server-side, agreed.

> **Q:** Single status or multiple at once? *Recommendation: multiple — the CUI `multiselect-chips` control fits.*
> **A:** Multiple.

> **Q:** What shows when a filter returns nothing? *Recommendation: the existing empty-state with a clear-filters action.*
> **A:** Yes.

> **Q:** Persist the active filter across navigation? *Recommendation: out of scope — raise a follow-up.*
> **A:** Out of scope, good.

---

## Step 3 — The written plan

> **Goal:** Let users filter the Transactions page by one or more statuses.
>
> **Scope:** Multi-select status filter; server-side filtering via a `status` param; empty state when no results; clear-filters action.
>
> **Out of scope:** Persisting filters across navigation (follow-up).
>
> **Approach:** A CUI `multiselect-chips` control above the list. Built the way we would today: the facade exposes a method that calls the transactions repository with a `status` param and updates the state slice, exposed as a Signal. Reuse the existing status values.
>
> **Affected areas:** transactions list component, transactions facade, transactions repository call/types, state slice, empty-state usage.
>
> **Test plan:** The facade method and its repository call build the correct request for one and multiple statuses; the component renders results and the empty state; clear-filters resets. Behavior tested through public interfaces.
>
> **Open questions:** none.

A normal story, so the plan rides along with the PR for review.

---

## Step 5 — Slices (`split-story`)

Small enough to be near one slice, but split for clean reviews:

- **Slice 1 — Filter by a single status.** Control, facade method, repository `status` param, state slice, types, tests. Shippable.
- **Slice 2 — Multiple statuses + empty state.** Upgrade the control to multi-select; handle the no-results empty state and clear-filters.

---

## Step 6 — Implementation checklist (per slice, `implement-slice`)

- [ ] Failing test first for the facade method and its repository call.
- [ ] Minimum code to pass; refactor green.
- [ ] CUI `multiselect-chips` (from `@nightsbridge/common-ui/multiselect-chips`) — not a custom control.
- [ ] The component goes through the **facade**, never straight to the repository or HTTP.
- [ ] State held in the slice and exposed as a **Signal**.
- [ ] `status` properly typed; no `any` on the response.
- [ ] Endpoint base path has no trailing slash.
- [ ] BTLB tokens for styling; no Bootstrap utilities.
- [ ] Read the full diff; every line explained.
- [ ] `yarn lint && yarn typecheck && yarn test && yarn build` green.
- [ ] Storybook updated; screenshots (mobile + desktop) on the PR.

---

## Step 8 — Review checklist (`frontend-review` + human)

- [ ] **Spec:** filters by status, multi-select, empty state, clear-filters — matches the plan; nothing extra crept in.
- [ ] **Standards:** the facade boundary is respected; state exposed as a Signal; CUI component reused; strict equality; no `console.log`.
- [ ] **Design system:** styling via BTLB semantic tokens, not hardcoded values or Bootstrap utilities; control layout uses a layout pattern; `data-state` for loading/empty state.
- [ ] **Types:** `status` typed; response fully typed; nullable fields handled.
- [ ] **Tests:** assert the facade method, repository call, and render behavior through public interfaces; would fail if filtering broke.
- [ ] **PR hygiene:** under 400 lines, single purpose, screenshots attached, Storybook updated.

Two small, clean PRs instead of one 600-line surprise — and a reviewer checking against an agreed plan, not guessing what was intended.
