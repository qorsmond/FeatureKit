"""Run with python3 tests/check_packaging.py; no third-party dependencies."""

import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


def check(root):
    version = (root / "VERSION").read_text().strip()
    manifest = json.loads((root / ".claude-plugin/plugin.json").read_text())
    assert manifest["version"] == version, "plugin version differs from VERSION"
    paths = [root / path / "SKILL.md" for path in manifest["skills"]]
    assert len(paths) == len(set(paths)), "duplicate plugin skill"
    skills = set((root / "skills").glob("**/SKILL.md"))
    assert set(paths) == skills, "plugin inventory differs from skill files"
    implicit = {
        "tdd", "secure-design", "secure-code", "secure-api", "secure-deploy",
        "orchestrate-work", "validate-feature",
    }
    for path in sorted(skills):
        text = path.read_text()
        assert text.startswith("---\n"), f"missing frontmatter: {path}"
        front = text.split("---", 2)[1]
        name = re.search(r"^name: ([a-z0-9-]+)$", front, re.M)
        assert name and name[1] == path.parent.name, f"invalid name: {path}"
        assert re.search(r"^description: .+", front, re.M), f"missing description: {path}"
        assert re.search(rf'^  featurekit-version: "{re.escape(version)}"$', front, re.M), path
        if name[1] in implicit:
            assert "disable-model-invocation: true" not in front, f"must be implicit: {path}"

    docs = [root / "README.md", root / "AGENTS.md"]
    for directory in ("skills", "docs", "prompts"):
        docs.extend((root / directory).glob("**/*.md"))
    for path in docs:
        for target in re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", path.read_text()):
            link = urlsplit(target.strip("<>"))
            if link.scheme or not link.path:
                continue
            assert (path.parent / unquote(link.path)).exists(), f"broken link: {path}: {target}"
    print(f"PASS: {len(skills)} skills, release {version}, plugin inventory and local links")


if __name__ == "__main__":
    check(Path(__file__).resolve().parents[1])
