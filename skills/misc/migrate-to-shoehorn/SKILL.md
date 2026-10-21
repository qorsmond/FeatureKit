---
name: migrate-to-shoehorn
description: Migrate TypeScript test fixtures from unsafe `as` assertions to @total-typescript/shoehorn helpers. Use when tests need partial typed data, intentionally invalid typed input, or a cleanup of `as unknown as` in test files.
metadata:
  featurekit-version: "0.14.0"
---

# Migrate To Shoehorn

Use `@total-typescript/shoehorn` to make TypeScript test fixtures safer and easier to read.

This skill is TypeScript-test-specific. Do not use Shoehorn in production code.

## Process

1. Confirm the repo uses TypeScript tests.
2. Ask before adding `@total-typescript/shoehorn`.
3. Find relevant test files and unsafe assertions.
4. Replace only test fixture assertions, not production code.
5. Add imports from `@total-typescript/shoehorn`.
6. Run typecheck and affected tests.

## Patterns

Partial valid object:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

handler(fromPartial({
  body: { id: "123" },
}));
```

Intentionally invalid object:

```ts
import { fromAny } from "@total-typescript/shoehorn";

handler(fromAny({
  body: { id: 123 },
}));
```

Full exact object:

```ts
import { fromExact } from "@total-typescript/shoehorn";

handler(fromExact({
  body: { id: "123" },
  headers: {},
}));
```

## Replacement Guide

- `value as SomeType` in tests -> usually `fromPartial(value)`.
- `value as unknown as SomeType` in tests -> usually `fromAny(value)`.
- Full fixtures that should satisfy the entire type -> `fromExact(value)`.

## Do Not

- Do not migrate production code.
- Do not hide real type errors in behavior under test.
- Do not install the dependency without confirmation.
- Do not mass-rewrite every assertion blindly; inspect intent first.

## Output

Report:

- dependency change, if any,
- files migrated,
- assertion patterns changed,
- typecheck/test result,
- any assertions intentionally left alone.
