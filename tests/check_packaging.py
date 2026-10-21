"""Run with python3 tests/check_packaging.py; needs git and npx for the skills-CLI install, no Python packages."""

import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit


def check_links(paths):
    for path in paths:
        for target in re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", path.read_text()):
            link = urlsplit(target.strip("<>"))
            if link.scheme or not link.path:
                continue
            assert (path.parent / unquote(link.path)).exists(), f"broken link: {path}: {target}"


def check_install(root, names):
    # The skills CLI copies each skill flat into .agents/skills/<name>/ and links .claude/skills/<name> to it,
    # so a link that only resolves in the categorized source tree breaks for installed users.
    assert shutil.which("npx"), "npx is required for the skills-CLI install check"
    with tempfile.TemporaryDirectory() as scratch:
        repo = Path(scratch)
        subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
        command = ["npx", "-y", "skills@latest", "add", str(root), "-a", "codex", "-a", "claude-code", "-a", "opencode", "--skill", "*", "-y"]
        result = subprocess.run(command, cwd=repo, capture_output=True, text=True)
        assert result.returncode == 0, f"skills CLI install failed: {result.stderr[-500:]}"
        for directory in (".agents/skills", ".claude/skills"):
            installed = sorted(path.name for path in (repo / directory).iterdir())
            assert installed == names, f"skills CLI install inventory differs in {directory}"
        check_links(sorted((repo / ".agents/skills").glob("**/*.md")))


def check(root):
    version = (root / "VERSION").read_text().strip()
    manifest = json.loads((root / ".claude-plugin/plugin.json").read_text())
    assert manifest["version"] == version, "plugin version differs from VERSION"
    paths = [root / path / "SKILL.md" for path in manifest["skills"]]
    assert len(paths) == len(set(paths)), "duplicate plugin skill"
    skills = set((root / "skills").glob("**/SKILL.md"))
    assert set(paths) == skills, "plugin inventory differs from skill files"
    assert not (root / ".mcp.json").exists(), "FeatureKit ships no MCP servers"
    # The only hooks are the opt-in knowledge-index hooks, inert unless the repo has .kx/index.db.
    for entries in json.loads((root / "hooks/hooks.json").read_text())["hooks"].values():
        for hook in (h for entry in entries for h in entry["hooks"]):
            assert hook["command"].startswith("[ -f .kx/index.db ] || exit 0;") and "kx.py" in hook["command"], "unexpected hook"
    # Skills that must fire are named in the always-on block setup writes (skills only named elsewhere are rarely opened).
    block = (root / "skills/engineering/setup-featurekit/SKILL.md").read_text().split("Use this block:", 1)[1].split("## Agent Operating Principles", 1)[0]
    for name in ("using-featurekit", "orchestrate-work", "validate-feature"):
        assert f"`{name}`" in block, f"always-on block does not name {name}"
    implicit = {
        "tdd", "secure-design", "secure-code", "secure-api", "secure-deploy",
        "orchestrate-work", "validate-feature", "implement", "execute-slices", "setup-featurekit",
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
    check_links(docs)
    check_install(root, sorted(path.parent.name for path in skills))
    print(f"PASS: {len(skills)} skills, release {version}, plugin inventory, local links and skills-CLI install links")


if __name__ == "__main__":
    check(Path(__file__).resolve().parents[1])
