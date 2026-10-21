"""Independent correctness for the knowledge experiment, run outside the eval sandbox."""

import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PYTHON = HERE / ".cache/venv/bin/python"


def verify(case, workspace):
    if case != "fix-default-map":
        return None
    with tempfile.TemporaryDirectory() as scratch:
        copy = Path(scratch) / "ws"
        shutil.copytree(workspace, copy, ignore=shutil.ignore_patterns(".git", ".kx", "__pycache__"))
        shutil.copy(HERE / "fixtures/overlay/checks/check_default_map.py", copy / "checks/check_default_map.py")
        check = subprocess.run([str(PYTHON), "checks/check_default_map.py"], cwd=copy, capture_output=True)
        tests = subprocess.run([str(PYTHON), "-m", "pytest", "-q", "-p", "no:cacheprovider", "tests/test_defaults.py", "tests/test_options.py"],
                               cwd=copy, capture_output=True, env={"PYTHONPATH": str(copy / "src"), "PATH": "/usr/bin:/bin"})
        return check.returncode == 0 and tests.returncode == 0
