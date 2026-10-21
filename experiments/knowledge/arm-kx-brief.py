"""Per-request index brief for the kx-brief arm: what a prompt hook or a first `kx brief` call would add."""

import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


def extra(case, request):
    with tempfile.TemporaryDirectory() as scratch:
        subprocess.run(["bash", str(HERE / "scaffold.sh"), case, "kx"], cwd=scratch, check=True, capture_output=True)
        out = subprocess.run(["python3", ".kx/kx.py", "brief", request], cwd=scratch, check=True, capture_output=True, text=True).stdout
    return "```text\n" + out.strip() + "\n```"
