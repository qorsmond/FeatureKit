# Recovery and independent review

Load this after a worker or direct attempt fails, is uncertain, or needs independent judgment.

- Concrete mistake or missing fact: provide the evidence and allow one focused retry when likely to succeed.
- Insufficient reasoning or conflicting evidence: raise effort/capability or let the primary take over, carrying the bounded failure evidence instead of restarting discovery.
- Missing environment, permission, authentication, quota, runtime, or device: use another authorized adequate route or report the prerequisite. Stronger reasoning cannot create access.
- Ambiguous scope or ADR conflict: the primary returns to the governing workflow or user; no worker guesses.

Stop the previous writer before reassignment. Never repeat an unchanged failed attempt or cycle between backends.

For escalation, generate the capsule's `escalation` projection and prune packet entries by metadata before copying context. Keep authority, requirements, constraints, the unresolved failure/question, current evidence, changed paths, and requested stronger route. Carry source and full logs by stable reference.

Use fresh-context `review-change` or `security-review` for high-risk, surprising, hard-to-reverse changes or conflicting evidence. Supply requirements, constraints, stable diff, and current checks without the implementer's rationale. The reviewer reports findings; the primary owns disposition.
