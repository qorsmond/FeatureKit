"""Compare FeatureKit with a bare agent on the cases in evals/.

Usage: python3 evals/run.py [--arms bare,featurekit] [--case GLOB] [--runs N] [--model sonnet] [--jobs 3] [--label NAME] [--reuse] [--keep]

Both arms run `claude plugin eval` with the same cases, model and tools. The bare arm loads an
empty plugin; the featurekit arm loads this plugin plus the block setup-featurekit writes into a
product repo's agent instructions (eval runs do not load a workspace CLAUDE.md, so the block is
appended to the system prompt). After the runs, the fixture acceptance checks are re-run on a copy
of each kept workspace, and cost, turns, tokens and tool calls are read from the traces.
"""

import argparse
import json
import re
from pathlib import Path
import shutil
import statistics
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
EVALS = ROOT / "evals"
SUITE = EVALS  # --suite selects another case directory, such as an experiment
RUNS = EVALS / "runs"
FIXTURES = EVALS / "fixtures"
# Independent acceptance per case: fixture checks copied over the workspace's own before running.
VERIFY = {
    "implement-delete": ["items/checks/check_items.py", "acceptance/check_delete.py"],
    "stale-verification": ["items/checks/check_items.py", "acceptance/check_delete.py"],
    "resume-slice-2": ["items/checks/check_items.py", "acceptance/check_delete.py", "acceptance/check_patch.py"],
}


def setup_block():
    text = (ROOT / "skills/engineering/setup-featurekit/SKILL.md").read_text()
    return text.split("Use this block:\n\n```markdown\n", 1)[1].split("\n```\n", 1)[0]


def generate(arm):
    """Copy every case into the arm's eval dir; return (plugin target, eval dir).

    Arms: bare (empty plugin), featurekit (plugin + setup block), or NAME (featurekit plus the
    suite's arm-NAME.md appended to the instructions; the scaffold receives NAME as $2)."""
    if arm == "bare":
        target = RUNS / "bare"
        (target / ".claude-plugin").mkdir(parents=True, exist_ok=True)
        (target / ".claude-plugin/plugin.json").write_text('{"name": "bare-agent", "version": "0.0.0"}\n')
        cases = target / "evals"
    elif arm.endswith("nohooks"):  # this plugin with its hooks removed, for measuring what the hooks add
        target = RUNS / f"{arm}-plugin"
        shutil.rmtree(target, ignore_errors=True)
        shutil.copytree(ROOT / ".claude-plugin", target / ".claude-plugin")
        shutil.copytree(ROOT / "skills", target / "skills")
        cases = target / "evals"
    else:
        target, cases = ROOT, RUNS / arm
    shutil.rmtree(cases, ignore_errors=True)
    for case in sorted(path.parent for path in SUITE.glob("*/case.yaml")):
        copy = cases / case.name
        shutil.copytree(case, copy)
        name = (case / "scaffold.sh").read_text().split()[-1]
        (copy / "scaffold.sh").write_text(f'#!/usr/bin/env bash\nexec bash "{SUITE}/scaffold.sh" {name} {arm}\n')
        if arm != "bare":
            prompt = (copy / "prompt.md").read_text()
            block = "The repository's agent instructions (AGENTS.md) contain:\n\n" + setup_block()
            if (SUITE / f"arm-{arm}.md").exists():
                block += "\n\n" + (SUITE / f"arm-{arm}.md").read_text().strip()
            if (SUITE / f"arm-{arm}.py").exists():  # optional per-request context, such as an index brief
                namespace = {"__file__": str(SUITE / f"arm-{arm}.py")}
                exec((SUITE / f"arm-{arm}.py").read_text(), namespace)
                extra = namespace["extra"](name, prompt.split("---\n", 2)[-1].strip())
                block += "\n\n" + re.sub(r"-{3,}", "--", extra)  # a run of dashes would end the frontmatter early
            indented = "".join(f"  {line}\n" if line else "\n" for line in block.splitlines())
            (copy / "prompt.md").write_text(prompt.replace("---\n", "---\nappend_system_prompt: |\n" + indented, 1))
    return target, cases


def verify(case, workspace):
    if (SUITE / "verify.py").exists():
        namespace = {"__file__": str(SUITE / "verify.py")}
        exec((SUITE / "verify.py").read_text(), namespace)
        return namespace["verify"](case, workspace)
    if case == "gate-no-plan":
        return "DELETE" not in (workspace / "app/api.py").read_text()
    if case not in VERIFY:
        return None
    with tempfile.TemporaryDirectory() as scratch:
        copy = Path(scratch) / "ws"
        shutil.copytree(workspace, copy, ignore=shutil.ignore_patterns(".git", "__pycache__"))
        for check in VERIFY[case]:
            shutil.copy(FIXTURES / check, copy / "checks" / Path(check).name)
            if subprocess.run(["python3", f"checks/{Path(check).name}"], cwd=copy, capture_output=True).returncode:
                return False
    return True


def trace_metrics(path):
    tools, skills, errors, usage, output, commands = {}, [], 0, {}, 0, {}
    for line in path.read_text().splitlines():
        event = json.loads(line)
        message = event.get("message")
        content = message.get("content", []) if isinstance(message, dict) else []
        if event.get("type") == "assistant":
            for item in content:
                if item.get("type") == "tool_use":
                    tools[item["name"]] = tools.get(item["name"], 0) + 1
                    if item["name"] == "Skill":
                        skills.append(item["input"].get("skill", "?"))
                    if item["name"] == "Bash":
                        word = item["input"].get("command", "").split()[:2]
                        kind = "kx" if "kx.py" in " ".join(word) else (word[0].split("/")[-1] if word else "?")
                        commands[kind] = commands.get(kind, 0) + 1
        elif event.get("type") == "user" and isinstance(content, list):
            for item in content:
                if item.get("type") == "tool_result":
                    errors += bool(item.get("is_error"))
                    body = item.get("content")
                    output += len(body) if isinstance(body, str) else sum(len(part.get("text", "")) for part in body or [] if isinstance(part, dict))
        elif event.get("type") == "result":
            usage = event.get("usage", {})
    tokens = sum(usage.get(key, 0) for key in ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
    return {"tools": sum(tools.values()), "tool_errors": errors, "input_tokens": tokens, "tool_output_chars": output, "commands": commands,
            "uncached_tokens": usage.get("input_tokens", 0) + usage.get("cache_creation_input_tokens", 0),
            "output_tokens": usage.get("output_tokens", 0), "skills": skills, "by_tool": tools}


def run_arm(arm, args, kept_dirs):
    out = RUNS / f"{arm}.json"
    if not args.reuse:
        run_eval(arm, args, out)
    rows = []
    for case in json.loads(out.read_text())["cases"]:
        for run in case["arms"]["with"]:
            kept = Path(run["tracePath"]).parents[1] if run.get("tracePath") else None
            row = {"arm": arm, "case": case["name"], "score": run.get("score"), "cost": run.get("costUsd") or 0,
                   "turns": run.get("turns") or 0, "seconds": run.get("durationSeconds") or 0, "error": run.get("error"),
                   "graders": {g["name"]: g["passed"] for g in run.get("graders", [])}}
            if kept and kept.exists():
                for path in (kept, kept / "sealed"):
                    path.chmod(0o700)
                row.update(trace_metrics(kept / "out/trace.jsonl"))
                row["verified"] = verify(case["name"], kept / "sealed/home/cwd")
                log = kept / "sealed/home/cwd/.kx/hook.log"
                if log.exists():
                    events = [json.loads(line) for line in log.read_text().splitlines() if line.strip()]
                    row["hooks"] = {"events": len(events), "injected": sum(1 for e in events if e.get("chars")),
                                    "chars": sum(e.get("chars", 0) for e in events), "errors": sum(1 for e in events if "error" in e),
                                    "ms_mean": round(statistics.mean(e.get("ms", 0) for e in events), 1) if events else 0}
                kept_dirs.append(kept)
            rows.append(row)
    return rows


def run_eval(arm, args, out):
    target, cases = generate(arm)
    command = ["claude", "plugin", "eval", str(target), "--eval-dir", str(cases.relative_to(target)),
               "--ablation", "none", "--scaffold", "--trust-plugin", "--no-publish", "--keep-temp",
               "--allow-tools", "Write", "Edit", "Bash", "--model", args.model,
               "--max-cost-usd", str(args.max_cost), "--concurrency", str(args.jobs), "--json", str(out)]
    command += ["--case", args.case] if args.case else []
    command += ["--runs", str(args.runs)] if args.runs else []
    result = subprocess.run(command, cwd=target, capture_output=True, text=True)
    if not out.exists():
        raise SystemExit(f"{arm}: claude plugin eval wrote no results\n{(result.stderr or result.stdout)[-1500:]}")


def summarize(rows):
    print("| arm | case | runs | graders | verified | cost $ | turns | tools | tool errors | input tok | tool output KB | seconds | skills |")
    print("|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    groups = {}
    for row in rows:
        groups.setdefault((row["case"], row["arm"]), []).append(row)
    mean = lambda values: statistics.mean(values) if values else 0
    have = lambda group, key: [row[key] for row in group if key in row]
    for (case, arm), group in sorted(groups.items()):
        verified = [row["verified"] for row in group if row.get("verified") is not None]
        skills = sorted({skill for row in group for skill in row.get("skills", [])})
        print(f"| {arm} | {case} | {len(group)} | {mean([row['score'] or 0 for row in group]):.2f} | "
              f"{f'{sum(verified)}/{len(verified)}' if verified else '-'} | {mean([row['cost'] for row in group]):.3f} | "
              f"{mean([row['turns'] for row in group]):.1f} | {mean(have(group, 'tools')):.1f} | "
              f"{mean(have(group, 'tool_errors')):.1f} | {mean(have(group, 'input_tokens')):,.0f} | "
              f"{mean(have(group, 'tool_output_chars')) / 1000:.1f} | "
              f"{mean([row['seconds'] for row in group]):.0f} | {', '.join(skills) or '-'} |")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--arms", default="bare,featurekit")
    parser.add_argument("--suite", default="evals", help="case directory relative to the repo root")
    parser.add_argument("--case")
    parser.add_argument("--runs", type=int)
    parser.add_argument("--model", default="sonnet")
    parser.add_argument("--max-cost", type=float, default=10)
    parser.add_argument("--jobs", type=int, default=3)
    parser.add_argument("--label", default="latest")
    parser.add_argument("--reuse", action="store_true", help="re-read the last runs/<arm>.json instead of running")
    parser.add_argument("--keep", action="store_true", help="keep run workspaces and traces for inspection")
    args = parser.parse_args()
    global SUITE
    SUITE = ROOT / args.suite
    kept_dirs = []
    rows = [row for arm in args.arms.split(",") for row in run_arm(arm, args, kept_dirs)]
    (EVALS / "results").mkdir(exist_ok=True)
    (EVALS / "results" / f"{args.label}.json").write_text(json.dumps(rows, indent=1) + "\n")
    summarize(rows)
    for kept in kept_dirs:
        if args.keep:
            print(f"kept: {kept}/out/trace.jsonl and {kept}/sealed/home/cwd")
        else:
            shutil.rmtree(kept, ignore_errors=True)


if __name__ == "__main__":
    main()
