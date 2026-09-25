"""Deterministic FeatureKit context-size budgets. Run with Python 3."""

import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "tests/context-budget.json"


def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    return text.split("---", 2)[1] if text.startswith("---\n") else ""


def surface_text(spec):
    kind = spec["kind"]
    if kind == "paths":
        return "".join((ROOT / path).read_text(encoding="utf-8") for path in spec["paths"])
    if kind == "glob":
        return "".join(path.read_text(encoding="utf-8") for path in sorted(ROOT.glob(spec["pattern"])))
    if kind == "descriptions":
        descriptions = []
        for path in sorted((ROOT / "skills").glob("**/SKILL.md")):
            meta = frontmatter(path)
            if spec.get("model_invocable") and "disable-model-invocation: true" in meta:
                continue
            match = re.search(r"^description: (.+)$", meta, re.MULTILINE)
            if match:
                descriptions.append(match.group(1))
        return "".join(descriptions)
    if kind == "between":
        text = (ROOT / spec["path"]).read_text(encoding="utf-8")
        start = text.index(spec["start"]) + len(spec["start"])
        end = text.index(spec["end"], start)
        return text[start:end]
    raise ValueError(f"unknown surface kind: {kind}")


def check():
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    assert config["schema"] == 1, "unsupported context budget schema"
    failures = []
    print("surface\tbytes\tchars\twords\tmax_chars")
    for spec in config["surfaces"]:
        text = surface_text(spec)
        size = len(text)
        maximum = spec["max_chars"]
        print(f'{spec["name"]}\t{len(text.encode("utf-8"))}\t{size}\t{len(text.split())}\t{maximum}')
        if size > maximum:
            failures.append(f'{spec["name"]}: {size} > {maximum}')
    assert not failures, "context budget exceeded: " + "; ".join(failures)


if __name__ == "__main__":
    check()
