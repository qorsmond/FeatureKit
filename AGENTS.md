# AGENTS.md

Canonical project context for AI agents and humans. Keep this lean: **stable facts and rules only.** Step-by-step procedures live in `docs/ai-workflow/` and the skills in `.agents/skills/`. If you're tempted to add a process here, it belongs in a workflow doc instead.

## Project

Angular + TypeScript frontend. Internal component library: **CUI**. Design-system direction: **BTLB** (Baseline, Tokens, Layouts, Behaviors).

## Architecture

Component → **Facade** (`*.facade.service.ts`) → **State** slice → **Repository** (interface + `InjectionToken` + impl + mock). Components talk to the facade only; the facade is the one boundary that translates domain terms into UI terms. New state lives in slices and is exposed as **Signals**.

## Commands

- Install: `yarn install`
- Dev server: `yarn start`
- Lint: `yarn lint`
- Typecheck: `yarn typecheck` (target addition, not present yet)
- Test: `yarn test` (moving to Vitest with the Angular upgrade)
- Build: `yarn build`
- Storybook: `yarn storybook`

(Adjust to match this repo's actual scripts before committing.)

## TypeScript rules

- **No `any`.** No `Record<string, any>` for backend response types. Type nullable fields, enums, and optionals correctly.
- `type` by default for data shapes; `interface` only when the shape is intentionally extended (prop hierarchies, class contracts).
- Strict equality only (`===`, `!==`).
- Explicit parameter passing: `map(data => this.transform(data))`, not `map(this.transform)`.

## Angular conventions

- Components talk to the **facade** only; never reach past it to a repository or HTTP directly.
- New state lives in a **state slice**, exposed as **Signals**. Reach for Signals over RxJS for new work; keep RxJS shallow.
- Subscription cleanup for any remaining observables: `takeUntilDestroyed()` (no args) inside Angular-managed contexts; inject and pass `DestroyRef` outside them. Do **not** introduce new `destroy$` Subjects.
- Use **CUI** components where they exist — don't rebuild what the library provides.
- `OnPush` change detection and `trackBy` on lists where they still apply.

## Styling / design system

- We're moving off Bootstrap. New work is **CUI + BTLB**, never Bootstrap utilities.
- Follow the styling hierarchy: CUI components/utilities first, then BTLB tokens, layouts, and behaviors; custom CSS is a last resort.
- Use semantic tokens, not hardcoded colors/spacing/radii/shadows. Don't reference primitive tokens from components.
- Express state with `data-state` + ARIA attributes, not state class names.
- No inline styles. If `::ng-deep` is unavoidable, scope it with `:host`.
- See the BTLB design-system docs for tokens, layout patterns (`stack`, `cluster`, `grid`, `sidebar`, `center`), and behavior contracts.

## Backend integration

- Endpoint base paths: no trailing slash (`/my-folder`, not `/my-folder/`).
- Response types explicitly defined.
- Frontend must degrade gracefully if an endpoint isn't available at deploy time.

## PR expectations

- Under 400 lines; split if larger. Single purpose per PR.
- Screenshots for UI changes (mobile + desktop).
- No commented-out code, no `console.log`.
- Only commit `yarn.lock` when `package.json` changed.
- Storybook updated for new/modified components.

## Testing expectations

- Tests run with `yarn test`; we're moving to **Vitest** with the Angular upgrade.
- Test behavior through public interfaces, not implementation details.
- Meaningful tests for business logic, data transformations, services, and bug fixes (a bug fix lands with a regression test).

## Where things live

- Workflow docs: `docs/ai-workflow/`
- Agent skills and prompts: shipped by **BridgeKit** under `.agents/skills/` and `.agents/prompts/`. CUI stays the component library; BridgeKit is the home for agent tooling.

## Core working rule

**No code starts until there is a written, reviewed plan.** See `docs/ai-workflow/`.
