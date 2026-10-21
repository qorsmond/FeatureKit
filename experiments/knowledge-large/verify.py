"""Independent correctness for the large-repo experiment, run outside the eval sandbox."""

import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PYTHON = HERE / ".cache/venv/bin/python"


def verify(case, workspace):
    if case != "fix-commit-flush":
        return None
    with tempfile.TemporaryDirectory() as scratch:
        copy = Path(scratch) / "ws"
        shutil.copytree(workspace, copy, ignore=shutil.ignore_patterns(".git", ".kx", "__pycache__", "test", "doc"))
        shutil.copy(HERE / "fixtures/overlay/checks/check_commit_flush.py", copy / "checks/check_commit_flush.py")
        shutil.copy(HERE / "fixtures/hidden/check_commit_hidden.py", copy / "check_commit_hidden.py")
        runs = [subprocess.run([str(PYTHON), script], cwd=copy, capture_output=True) for script in ("checks/check_commit_flush.py", "check_commit_hidden.py")]
        return all(run.returncode == 0 for run in runs)
