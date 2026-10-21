"""kx: a derived, local knowledge index for progressive retrieval. Python 3.9+, stdlib only.

  python3 kx.py build [ROOT]        index code, tests, docs, ADRs and lessons into ROOT/.kx/index.db
  python3 kx.py map                 ranked modules and project knowledge, with status
  python3 kx.py find TERMS... [--all]   ranked symbols and knowledge for the terms
  python3 kx.py node NAME           one symbol: location, callers, callees, tests, knowledge
  python3 kx.py brief "REQUEST"     first step for a task: ranked matches plus the graph around named symbols
  python3 kx.py refresh             rebuild when tracked files changed since the last build

The index is derived from the repository and never authoritative: every result names its
file and lines, results from files changed since the build are marked STALE, and deprecated or
superseded knowledge is hidden from search unless --all is given.
"""

import ast
import hashlib
import os
import re
import sqlite3
import subprocess
import sys
import time

DB = ".kx/index.db"
CODE_EDGES = ("calls", "imports", "inherits")


def tracked(root):
    try:
        out = subprocess.run(["git", "ls-files"], cwd=root, capture_output=True, text=True, check=True).stdout
        return [line for line in out.splitlines() if line]
    except Exception:
        return [os.path.relpath(os.path.join(d, f), root) for d, _, fs in os.walk(root) for f in fs if "/." not in d]


def digest(path):
    with open(path, "rb") as handle:
        return hashlib.sha1(handle.read()).hexdigest()


def first_line(text):
    # Skip reStructuredText heading underlines and other punctuation-only lines.
    lines = [line for line in (text or "").strip().split("\n") if line.strip() and not re.fullmatch(r"\s*[=\-~^*#`]{3,}\s*", line)]
    return " ".join(lines[0].split())[:160] if lines else ""


def module_name(path):
    parts = path[:-3].split("/")
    if parts[0] in ("src", "lib"):
        parts = parts[1:]
    return ".".join(p for p in parts if p != "__init__") or parts[-1]


class Builder:
    def __init__(self, root):
        self.root, self.nodes, self.raw = root, [], []

    def add(self, kind, name, qual, path, start=0, end=0, summary="", status="stable", text=""):
        self.nodes.append([kind, name, qual, path, start, end, summary, status, text])
        return len(self.nodes)  # 1-based ids match sqlite rowids

    def python(self, path):
        try:
            source = open(os.path.join(self.root, path), encoding="utf-8").read()
            tree = ast.parse(source)
            lines = source.splitlines()
        except (SyntaxError, UnicodeDecodeError):
            return
        is_test = path.startswith("tests/") or "/tests/" in path
        mod = module_name(path)
        mid = self.add("module", mod, mod, path, 1, len(getattr(tree, "body", [])) and tree.body[-1].end_lineno, first_line(ast.get_docstring(tree)))
        for item in ast.walk(tree):
            if isinstance(item, (ast.Import, ast.ImportFrom)):
                base = getattr(item, "module", None) or ""
                if isinstance(item, ast.ImportFrom) and item.level:
                    base = ".".join(mod.split(".")[: -item.level] + ([base] if base else []))
                for alias in item.names:
                    self.raw.append((mid, "imports", base if isinstance(item, ast.ImportFrom) else alias.name, None))
        for top in tree.body:
            if isinstance(top, ast.ClassDef):
                cid = self.add("class", top.name, f"{mod}.{top.name}", path, top.lineno, top.end_lineno, first_line(ast.get_docstring(top)))
                for base in top.bases:
                    name = base.attr if isinstance(base, ast.Attribute) else getattr(base, "id", None)
                    if name:
                        self.raw.append((cid, "inherits", name, None))
                for member in top.body:
                    targets = member.targets if isinstance(member, ast.Assign) else [member.target] if isinstance(member, ast.AnnAssign) else []
                    for target in [x for x in targets if isinstance(x, ast.Name)]:
                        self.add("attribute", target.id, f"{mod}.{top.name}.{target.id}", path, member.lineno, member.end_lineno,
                                 " ".join(" ".join(lines[member.lineno - 1:member.end_lineno]).split())[:140])
                    if isinstance(member, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        kind = "test" if is_test and member.name.startswith("test") else "function"
                        self.function(member, f"{top.name}.{member.name}", mod, path, top.name, kind)
            elif isinstance(top, (ast.FunctionDef, ast.AsyncFunctionDef)):
                kind = "test" if is_test and top.name.startswith("test") else "function"
                self.function(top, top.name, mod, path, None, kind)

    def function(self, fn, name, mod, path, owner, kind):
        args = [a.arg for a in fn.args.args]
        fid = self.add(kind, fn.name, f"{mod}.{name}", path, fn.lineno, fn.end_lineno,
                       f"{name}({', '.join(args)}) {first_line(ast.get_docstring(fn))}".strip())
        for item in ast.walk(fn):
            if isinstance(item, ast.Call):
                f = item.func
                if isinstance(f, ast.Attribute):
                    own = owner if isinstance(f.value, ast.Name) and f.value.id in ("self", "cls") else None
                    self.raw.append((fid, "tests" if kind == "test" else "calls", f.attr, own))
                elif isinstance(f, ast.Name):
                    self.raw.append((fid, "tests" if kind == "test" else "calls", f.id, None))

    def document(self, path):
        text = open(os.path.join(self.root, path), encoding="utf-8", errors="replace").read()
        meta = {}
        if text.startswith("---\n") and "\n---" in text[4:]:
            head, text = text[4:].split("\n---", 1)
            meta = dict(re.findall(r"^([a-z_]+):\s*(.*)$", head, re.M))
        kind = {"adr": "adr", "lessons": "lesson"}.get(meta.get("type", "").strip(), "adr" if "/adr/" in path else "doc")
        status = meta.get("status", "stable").strip()
        stale_after = meta.get("stale_after", "").strip().strip('"')
        if stale_after and stale_after < time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()):
            status = "stale"
        if meta.get("superseded_by"):
            status = f"superseded by {meta['superseded_by'].strip()}"
        title = meta.get("title", "").strip() or path
        did = self.add(kind, title, path, path, 1, text.count("\n") + 1, meta.get("description", "").strip(), status, text[:4000])
        if meta.get("supersedes"):
            self.raw.append((did, "supersedes", meta["supersedes"].strip(), "path"))
        lines = text.split("\n")
        heads = [i for i, line in enumerate(lines) if re.match(r"#{1,4} ", line)] or [0]
        for n, start in enumerate(heads):
            end = heads[n + 1] if n + 1 < len(heads) else len(lines)
            body = "\n".join(lines[start:end])
            items = re.findall(r"^- (.+)$", body, re.M) if kind == "lesson" else [body]
            for chunk in items:
                sid = self.add("lesson" if kind == "lesson" else "section", lines[start].lstrip("# ")[:80] or title,
                               f"{path}#{lines[start].lstrip('# ')[:60]}", path, start + 2, end + 1,
                               first_line(chunk if kind == "lesson" else "\n".join(lines[start + 1:end])), status, chunk[:4000])
                self.raw.append((sid, "part_of", path, "path"))
                for ref in set(re.findall(r"`([A-Za-z_][\w./]*)(?:\(\))?`|\{py:\w+\}`~?([\w.]+)`", chunk)):
                    self.raw.append((sid, "mentions", ref[0] or ref[1], "ref"))

    def build(self):
        files = tracked(self.root)
        for path in files:
            if path.endswith(".py"):
                self.python(path)
            elif path.endswith((".md", ".rst")) and not path.startswith(".kx"):
                self.document(path)
        by_name, by_qual, by_path = {}, {}, {}
        for i, (kind, name, qual, path, *_rest) in enumerate(self.nodes, 1):
            if kind in ("class", "function", "module", "attribute"):
                by_name.setdefault(name, []).append(i)
                by_qual[qual] = i
            if kind in ("module", "adr", "doc", "lesson"):
                by_path.setdefault(path, i)
        edges = set()
        for src, kind, target, hint in self.raw:
            if hint == "path":
                dst = [by_path[target]] if target in by_path else []
            elif hint == "ref":
                last = target.replace("/", ".").split(".")
                dst = [by_qual[target]] if target in by_qual else [by_path[target]] if target in by_path else by_name.get(last[-1], [])
                if len(dst) > 3 and len(last) > 1:  # Class.method: keep candidates owned by the named class
                    dst = [d for d in dst if self.nodes[d - 1][2].endswith(f"{last[-2]}.{last[-1]}")]
            elif kind == "imports":
                dst = [by_qual[target]] if target in by_qual else []
            else:
                dst = by_name.get(target, [])
                if hint:  # self.method(): prefer the enclosing class's own method
                    own = [d for d in dst if self.nodes[d - 1][2].endswith(f"{hint}.{target}")]
                    dst = own or dst
            if 0 < len(dst) <= 3:
                edges.update((src, d, kind) for d in dst if d != src)
        return files, edges


def pagerank(n, edges, rounds=25):
    out = {}
    for s, d, k in edges:
        if k in CODE_EDGES or k == "tests":
            out.setdefault(s, []).append(d)
    rank = [1.0 / n] * (n + 1)
    for _ in range(rounds):
        new = [0.15 / n] * (n + 1)
        for s, targets in out.items():
            share = 0.85 * rank[s] / len(targets)
            for d in targets:
                new[d] += share
        rank = new
    return rank


def build(root):
    started = time.time()
    builder = Builder(root)
    files, edges = builder.build()
    os.makedirs(os.path.join(root, ".kx"), exist_ok=True)
    path = os.path.join(root, DB)
    if os.path.exists(path):
        os.remove(path)
    db = sqlite3.connect(path)
    db.executescript("""
        create table meta(key text primary key, value text);
        create table files(path text primary key, sha1 text);
        create table nodes(id integer primary key, kind, name, qual, path, start int, end int, summary, status, rank real);
        create table edges(src int, dst int, kind);
        create index edges_src on edges(src); create index edges_dst on edges(dst);
        create virtual table fts using fts5(name, qual, summary, body, tokenize='porter unicode61');
    """)
    rank = pagerank(len(builder.nodes), edges)
    for i, (kind, name, qual, p, start, end, summary, status, text) in enumerate(builder.nodes, 1):
        db.execute("insert into nodes values (?,?,?,?,?,?,?,?,?,?)", (i, kind, name, qual, p, start, end, summary, status, rank[i]))
        words = re.sub(r"([a-z])([A-Z])", r"\1 \2", name).replace("_", " ")
        db.execute("insert into fts(rowid, name, qual, summary, body) values (?,?,?,?,?)", (i, f"{name} {words}", qual.replace(".", " "), summary, text))
    db.executemany("insert into edges values (?,?,?)", sorted(edges))
    db.executemany("insert into files values (?,?)", [(f, digest(os.path.join(root, f))) for f in files if os.path.isfile(os.path.join(root, f))])
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True).stdout.strip()
    db.executemany("insert into meta values (?,?)", [("head", head), ("built", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))])
    db.commit()
    print(f"indexed {len(files)} files, {len(builder.nodes)} nodes, {len(edges)} edges in {time.time() - started:.1f}s; {os.path.getsize(path) // 1024} KiB")


def open_db(root):
    path = os.path.join(root, DB)
    if not os.path.exists(path):
        sys.exit("no index: run `python3 kx.py build`")
    return sqlite3.connect(path)


def stale(db, root, path, cache={}):
    if path not in cache:
        row = db.execute("select sha1 from files where path=?", (path,)).fetchone()
        full = os.path.join(root, path)
        cache[path] = bool(row) and (not os.path.exists(full) or digest(full) != row[0])
    return cache[path]


def line(db, root, row):
    kind, qual, path, start, end, summary, status = row
    flags = (" STALE(changed since index; re-read)" if stale(db, root, path) else "") + ("" if status == "stable" else f" [{status.upper()}]")
    where = f"{path}:{start}-{end}" if start else path
    return f"[{kind}] {qual}  {where}  {summary}{flags}"


COLS = "kind, qual, path, start, end, summary, status"


def show_map(db, root):
    print("Most central modules (PageRank over calls, imports, inheritance and tests):")
    rows = db.execute("""select m.qual, m.path, m.end, m.summary, sum(n.rank) as r from nodes m join nodes n on n.path = m.path
                         where m.kind='module' and m.path not like 'tests/%' group by m.id order by r desc limit 12""").fetchall()
    for qual, path, end, summary, _ in rows:
        top = [r[0] for r in db.execute("select name from nodes where path=? and kind='class' order by rank desc limit 4", (path,))]
        print(f"  {qual}  {path} ({end} lines)  {summary}" + (f"\n      classes: {', '.join(top)}" if top else ""))
    print("Project knowledge (authoritative files; status from their frontmatter):")
    for row in db.execute(f"select {COLS} from nodes where kind in ('adr','lesson') and qual not like '%#%' or (kind in ('adr','doc') and path like 'docs/agents/%' and qual not like '%#%') order by path"):
        print("  " + line(db, root, row))
    docs = db.execute("select count(*) from nodes where kind='doc'").fetchone()[0]
    tests = db.execute("select count(*) from nodes where kind='test'").fetchone()[0]
    print(f"Also indexed: {docs} documentation pages, {tests} tests. Next: `kx find TERMS` or `kx node NAME`.")


def find(db, root, terms, include_all=False, limit=12):
    words = [w for w in re.findall(r"[A-Za-z0-9_]+", " ".join(terms)) if len(w) > 1]
    if not words:
        return
    query = " OR ".join(f'"{w}"' for w in words)
    rows = db.execute(f"""select n.id, {', '.join('n.' + c.strip() for c in COLS.split(','))}, bm25(fts, 8.0, 4.0, 2.0, 1.0) as score, n.rank
                          from fts join nodes n on n.id = fts.rowid where fts match ? order by score limit 80""", (query,)).fetchall()
    best = sorted(rows, key=lambda r: r[8] - 40 * r[9])
    hidden = 0
    shown = 0
    for row in best:
        if row[7] != "stable" and not include_all:
            hidden += 1
            continue
        print(line(db, root, row[1:8]))
        shown += 1
        if shown == limit:
            break
    if hidden:
        print(f"({hidden} deprecated, superseded or stale results hidden; add --all to see them)")


def node(db, root, name):
    rows = db.execute(f"""select id, {COLS} from nodes where qual=? or name=? or qual like ?
                          order by qual=? desc, qual like ? desc, kind='test', rank desc""",
                      (name, name.split(".")[-1], f"%.{name}", name, f"%.{name}")).fetchall()
    if not rows:
        return find(db, root, [name])
    nid = rows[0][0]
    print(line(db, root, rows[0][1:]))
    if len(rows) > 1:
        print("  other matches: " + "; ".join(f"{r[2]} ({r[3]}:{r[4]})" for r in rows[1:6]))
    groups = [("inherits from", "select {c} from edges e join nodes n on n.id=e.dst where e.src=? and e.kind='inherits'"),
              ("subclasses", "select {c} from edges e join nodes n on n.id=e.src where e.dst=? and e.kind='inherits'"),
              ("called by", "select {c} from edges e join nodes n on n.id=e.src where e.dst=? and e.kind='calls' order by n.rank desc limit 12"),
              ("calls", "select {c} from edges e join nodes n on n.id=e.dst where e.src=? and e.kind='calls' order by n.rank desc limit 12"),
              ("tested by", "select {c} from edges e join nodes n on n.id=e.src where e.dst=? and e.kind='tests' limit 10"),
              ("knowledge", "select {c} from edges e join nodes n on n.id=e.src where e.dst=? and e.kind='mentions' order by n.kind in ('adr','lesson') desc limit 10")]
    for label, sql in groups:
        found = db.execute(sql.format(c=", ".join("n." + c.strip() for c in COLS.split(","))), (nid,)).fetchall()
        if found:
            print(f"  {label}:")
            for row in found:
                print("    " + line(db, root, row))


def brief(db, root, text):
    """One-call first step for a request: ranked matches, then the graph around named symbols."""
    named = list(dict.fromkeys(re.findall(r"`([A-Za-z_][\w.]*)(?:\(\))?`", text)))
    symbols = [n for n in named if db.execute("select 1 from nodes where kind in ('class','function','attribute') and (qual=? or name=? or qual like ?)",
                                               (n, n.split(".")[-1], f"%.{n}")).fetchone()]
    print("Index brief (derived; source files are authoritative):")
    find(db, root, re.findall(r"[A-Za-z_][A-Za-z0-9_]{3,}", text), limit=10)
    for name in symbols[:3]:
        print()
        node(db, root, name)


def main(argv):
    root = os.getcwd()
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
    elif argv[0] == "build":
        build(os.path.abspath(argv[1]) if len(argv) > 1 else root)
    elif argv[0] == "refresh":
        db = open_db(root)
        changed = [p for (p,) in db.execute("select path from files") if stale(db, root, p)]
        new = set(tracked(root)) - {p for (p,) in db.execute("select path from files")}
        db.close()
        if changed or new:
            print(f"{len(changed)} changed, {len(new)} new files; rebuilding")
            build(root)
        else:
            print("index current")
    else:
        db = open_db(root)
        args = [a for a in argv[1:] if a != "--all"]
        if argv[0] == "map":
            show_map(db, root)
        elif argv[0] == "find":
            find(db, root, args, "--all" in argv)
        elif argv[0] == "node" and args:
            node(db, root, args[0])
        elif argv[0] == "brief" and args:
            brief(db, root, " ".join(args))
        else:
            print(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
