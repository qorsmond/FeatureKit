"""Run with python3 tests/check_kx.py; needs git, no Python packages. Checks how the knowledge index finds ADRs and reads their status."""

import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile

KX = Path(__file__).resolve().parents[1] / "skills/productivity/using-featurekit/scripts/kx.py"
TERM = "Every decision here mentions the ledger.\n"
FILES = {
    "docs/agents/workflow-locations.md": "# Workflow locations\n\nADR directory: `docs/decisions/`\n",
    "docs/decisions/README.md": "# Decisions\n\n| ADR | Status |\n",
    "docs/decisions/0000-template.md": "# ADR NNNN: Title\n\nStatus: Proposed | Accepted | Superseded\n",
    "docs/decisions/0001-accepted.md": "# ADR 0001\n\nStatus: Accepted\nSuperseded by: none\n\n" + TERM,
    "docs/decisions/0002-proposed.md": "# ADR 0002\n\nStatus: Proposed (asked for by the user)\n\n" + TERM,
    "docs/decisions/0003-replaced.md": "# ADR 0003\n\nStatus: Superseded\nSuperseded by: [ADR 0004](0004-partly.md)\n\n" + TERM,
    "docs/decisions/0004-partly.md": "# ADR 0004\n\nStatus: Accepted (chosen by the user)\n"
                                     "Superseded by: [ADR 0005](0005-governs.md), decision 3 only (the\nreason)\n\n" + TERM,
    "docs/decisions/0005-governs.md": "---\nsources:\n  - resource: app/store.py\n---\n# ADR 0005\n\nStatus: Accepted\n\n" + TERM,
    "docs/adr/2026-01-01-fallback.md": "# ADR: Fallback\n\nStatus: Accepted\n",
    "docs/notes/typed.md": "---\ntype: adr\nstatus: stable\n---\n# Typed\n",
    "docs/guide.md": "# Guide\n",
    "app/store.py": "def save():\n    pass\n",
}


def run(repo, *args, stdin=None):
    result = subprocess.run([sys.executable, str(KX), *args], cwd=repo, input=stdin, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    return result.stdout


def commit(repo):
    subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
    subprocess.run(["git", "-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-qm", "state"], cwd=repo, check=True)


def documents(repo):
    run(repo, "build")
    db = sqlite3.connect(repo / ".kx/index.db")
    rows = db.execute("select path, kind, status from nodes where kind in ('adr', 'doc') and qual not like '%#%'").fetchall()
    db.close()
    return {path: (kind, status) for path, kind, status in rows}


def check():
    with tempfile.TemporaryDirectory() as scratch:
        repo = Path(scratch)
        for path, text in FILES.items():
            (repo / path).parent.mkdir(parents=True, exist_ok=True)
            (repo / path).write_text(text)
        (repo / ".gitignore").write_text(".kx/\n")
        subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
        commit(repo)

        found = documents(repo)
        expected = {
            "docs/decisions/README.md": ("doc", "stable"),
            "docs/decisions/0000-template.md": ("doc", "stable"),
            "docs/decisions/0001-accepted.md": ("adr", "stable"),
            "docs/decisions/0002-proposed.md": ("adr", "proposed"),
            "docs/decisions/0003-replaced.md": ("adr", "superseded by ADR 0004"),
            "docs/decisions/0004-partly.md": ("adr", "accepted; superseded in part by ADR 0005, decision 3 only"),
            "docs/decisions/0005-governs.md": ("adr", "stable"),
            "docs/adr/2026-01-01-fallback.md": ("adr", "stable"),
            "docs/notes/typed.md": ("adr", "stable"),
            "docs/guide.md": ("doc", "stable"),
        }
        for path, want in expected.items():
            assert found.get(path) == want, f"{path}: {found.get(path)} != {want}"

        # Only knowledge that is no longer current is hidden; a proposed or partly replaced decision stays visible.
        shown = run(repo, "find", "ledger")
        assert "0002-proposed.md" in shown and "[PROPOSED]" in shown and "0004-partly.md" in shown, shown
        assert "0003-replaced.md" not in shown and "results hidden" in shown, shown
        assert "0003-replaced.md" in run(repo, "find", "ledger", "--all")

        event = {"cwd": str(repo), "session_id": "s", "tool_name": "Read", "tool_input": {"file_path": str(repo / "app/store.py")}}
        pointer = run(repo, "hook", "tool", stdin=json.dumps(event))
        assert "decisions governing app/store.py: docs/decisions/0005-governs.md (current)" in pointer, pointer

        # A repo that records no ADR directory keeps the defaults: an adr/ folder or `type: adr` frontmatter.
        (repo / "docs/agents/workflow-locations.md").write_text("# Workflow locations\n\nPRDs: `docs/prd/<slug>.md`\n")
        commit(repo)
        found = documents(repo)
        assert found["docs/decisions/0001-accepted.md"] == ("doc", "stable"), found
        assert found["docs/adr/2026-01-01-fallback.md"] == ("adr", "stable"), found
        assert found["docs/notes/typed.md"] == ("adr", "stable"), found
    print("PASS: ADRs from the recorded directory and the defaults, statuses, hiding, and the governing-decision pointer")


if __name__ == "__main__":
    check()
