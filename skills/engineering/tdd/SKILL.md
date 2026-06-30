---
name: tdd
description: Use a red-green-refactor loop for business logic, data transformations, services, API behavior, bug fixes, and other testable product behavior. Use during implementation whenever meaningful behavior can be specified with tests.
metadata:
  featurekit-version: "0.1.2"
---

# TDD

Use tests as the implementation feedback loop.

Apply the target repo's `Agent Operating Principles` before coding, refactoring, or verification work.

## Process

1. Identify the public behavior to protect.
2. Write a failing test first.
3. Run the focused test and confirm it fails for the expected reason.
4. Implement the smallest change to pass.
5. Run the focused test and confirm it passes.
6. Use `verify-tests` when generated or changed tests are high-risk, suspicious, assertion-light, or explicitly requested for deeper verification.
7. Refactor only with tests green.
8. Run the broader verification command required by the repo.

## Test Quality

Good tests:

- assert behavior through public interfaces,
- fail for the bug or missing behavior,
- avoid brittle implementation details,
- cover important edge cases,
- are readable enough to explain the product rule.

Avoid tests that only assert mocks were called unless that is the actual contract.

## Output

Report:

- failing test added,
- implementation change,
- test verification run or skipped,
- verification run,
- remaining test gaps.
