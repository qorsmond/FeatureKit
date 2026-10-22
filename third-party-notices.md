# Third-Party Notices

FeatureKit is independently written, but it intentionally follows the broad shape of public Agent Skills workflows, especially the small composable skill style popularized by Matt Pocock's public skills repo.

This file records attribution and licensing notes in one place.

## Adapted Concepts

FeatureKit is inspired by these public ideas:

- small composable skills,
- a first-run setup skill,
- a router skill,
- interview-driven planning,
- PRD creation before implementation,
- vertical slice planning,
- TDD-oriented implementation,
- focused bug diagnosis,
- compact handoffs,
- context and domain documentation for agents.
- optional misc tooling patterns such as git guardrails, pre-commit setup, exercise scaffolding, and test-data helper migrations.

FeatureKit's wording, skill names, docs, and repo structure are written for this project and are not intended to redistribute another repo's files verbatim.

## License Notes

FeatureKit itself is released under the MIT License; see [LICENSE](./LICENSE).

If FeatureKit later includes a substantial adapted or copied portion of an MIT-licensed source, add the source copyright notice and license text here before shipping.

## Vendored Test Fixtures

- `experiments/knowledge-large/fixtures/overlay/checks/_vendor/typing_extensions.py`: typing_extensions 4.16.0, Python Software Foundation License 2.0 (PSF-2.0). Its license text is next to it in `LICENSE.typing_extensions`. It is copied into experiment workspaces so the pinned SQLAlchemy checkout can import without network access. FeatureKit's skills do not use it.
- `experiments/` and `evals/fetch.sh` download Click (BSD-3-Clause) and SQLAlchemy (MIT) at pinned commits into git-ignored `.cache/` folders. Neither is redistributed.
