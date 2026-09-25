import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  optimizeRoute,
  projectCapsule,
  pruneContext,
  readReceipt,
  selectReviewTier,
  validateRouteRequest,
  writeCapsule,
  writeReceipt,
} from "../skills/productivity/orchestrate-work/scripts/optimizer.mjs";
import { handleMcpRequest, ROUTE_TOOL } from "../skills/productivity/orchestrate-work/scripts/mcp-server.mjs";
import { runRouteHook } from "../skills/productivity/orchestrate-work/scripts/route-hook.mjs";
import { runCompactionHook } from "../skills/productivity/orchestrate-work/scripts/compaction-hook.mjs";
import { evaluateCalibration } from "./run_jev_shadow.mjs";


const routeRequest = (overrides = {}) => ({
  schema: 1,
  mode: "route",
  task: {
    id: "T1",
    operation: "implement",
    objective: "Add the approved bounded behavior",
    approval: "approved-write",
    scope: ["src/session", "tests/session"],
    acceptance: ["Focused behavior passes"],
  },
  facts: {
    files_estimate: 4,
    cross_boundary: false,
    unknown_root_cause: false,
    current_failure: false,
    attempts: 0,
  },
  policy: {
    capability_floor: "routine",
    effort_floor: "minimal",
    risk_flags: [],
    available_capabilities: ["routine", "standard", "deep"],
  },
  ...overrides,
});


const choice = (selected, options) => {
  const rest = options.length > 1 ? 0.1 / (options.length - 1) : 0;
  return {
    type: "choice",
    choice: selected,
    confidence: 0.8,
    probabilities: Object.fromEntries(options.map((option) => [option, option === selected ? 0.9 : rest])),
  };
};


const jevResponse = {
  model: "jev-test",
  answers: {
    task_family: choice("scoped-implementation", ["lookup", "mechanical-edit", "scoped-implementation", "debugging", "architecture", "review", "unclear"]),
    required_capability: choice("standard", ["routine", "standard", "deep", "unclear"]),
    required_effort: choice("low", ["minimal", "low", "medium", "high", "extra-high", "unclear"]),
    execution_shape: choice("isolated-worker", ["direct-deterministic", "current-primary", "isolated-worker", "specialist", "unclear"]),
    context_breadth: choice("targeted", ["pointers", "targeted", "broad", "unclear"]),
    high_consequence_if_wrong: { type: "noul", noul: 0.1 },
    need_worker_reference: { type: "noul", noul: 0.9 },
    need_review_reference: { type: "noul", noul: 0.1 },
    need_host_reference: { type: "noul", noul: 0.1 },
    need_compaction_reference: { type: "noul", noul: 0.1 },
    provisional_review_tier: choice("jev-review", ["deterministic", "jev-review", "general", "deep-security", "unclear"]),
  },
  usage: { input_tokens: 320, output_tokens: 96 },
};


test("route input rejects source-like and unknown fields", () => {
  assert.throws(() => validateRouteRequest({ ...routeRequest(), diff: "secret patch" }), /unknown field: diff/);
  assert.throws(() => validateRouteRequest(routeRequest({ task: { ...routeRequest().task, objective: "x".repeat(1025) } })), /objective/);
});


test("deterministic lookup skips Jev", async () => {
  let calls = 0;
  const result = await optimizeRoute(routeRequest({
    task: { ...routeRequest().task, operation: "lookup", approval: "read-only" },
  }), {
    routingMode: "shadow",
    apiKey: "unused",
    callJev: async () => { calls += 1; throw new Error("must not run"); },
  });
  assert.equal(result.status, "skipped");
  assert.equal(calls, 0);
});


test("approval and hard-risk floors skip Jev", async () => {
  let calls = 0;
  const callJev = async () => { calls += 1; return jevResponse; };
  const unapproved = await optimizeRoute(routeRequest({
    task: { ...routeRequest().task, approval: "read-only" },
  }), { routingMode: "shadow", apiKey: "unused", callJev });
  const risky = await optimizeRoute(routeRequest({
    policy: { ...routeRequest().policy, risk_flags: ["security"], capability_floor: "deep" },
  }), { routingMode: "shadow", apiKey: "unused", callJev });
  const pending = await optimizeRoute(routeRequest({
    policy: { ...routeRequest().policy, risk_flags: ["user-decision-pending"] },
  }), { routingMode: "shadow", apiKey: "unused", callJev });
  assert.deepEqual(unapproved.reason_codes, ["APPROVAL_GATE"]);
  assert.equal(risky.gates.risk_floor_applied, true);
  assert.deepEqual(pending.reason_codes, ["USER_DECISION_PENDING"]);
  assert.equal(calls, 0);
});


test("missing key preserves the baseline", async () => {
  const result = await optimizeRoute(routeRequest(), { routingMode: "shadow", apiKey: "" });
  assert.equal(result.status, "unavailable");
  assert.equal(result.baseline_preserved, true);
});


test("MCP exposes one bounded read-only route tool and honors off mode", async () => {
  const listed = await handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  assert.deepEqual(listed.tools.map(({ name }) => name), ["route"]);
  assert.equal(ROUTE_TOOL.annotations.readOnlyHint, true);
  assert.equal(ROUTE_TOOL.inputSchema.additionalProperties, false);

  const called = await handleMcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "route", arguments: routeRequest() },
  }, { routingMode: "off" });
  assert.equal(called.structuredContent.status, "off");
  assert.equal(called.structuredContent.baseline_preserved, true);
});


test("one mocked Jev call is cached and remains shadow-only", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-route-"));
  let calls = 0;
  const options = {
    routingMode: "shadow",
    apiKey: "test-key",
    scratchRoot,
    callJev: async () => { calls += 1; return jevResponse; },
  };
  try {
    const first = await optimizeRoute(routeRequest(), options);
    const second = await optimizeRoute(routeRequest(), options);
    assert.equal(first.status, "shadow");
    assert.equal(first.cache, "miss");
    assert.equal(first.advisory.capability, "standard");
    assert.equal(first.advisory.effort, "low");
    assert.deepEqual(first.approved_dimensions, ["task_family", "capability", "effort", "execution", "context", "review_floor"]);
    assert.equal(first.baseline_preserved, true);
    assert.equal(second.cache, "hit");
    assert.equal(calls, 1);
    const [cacheName] = await readdir(path.join(scratchRoot, "cache", "routes"));
    assert.equal((await stat(path.join(scratchRoot, "cache", "routes", cacheName))).mode & 0o777, 0o600);
    assert.equal((await stat(path.join(scratchRoot, "traces", "jev.jsonl"))).mode & 0o777, 0o600);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("weak optional route dimensions do not block capability and effort advice", async () => {
  const response = structuredClone(jevResponse);
  response.answers.execution_shape.confidence = 0.4;
  response.answers.provisional_review_tier.confidence = 0.4;
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-partial-"));
  try {
    const result = await optimizeRoute(routeRequest(), {
      routingMode: "shadow",
      apiKey: "test-key",
      scratchRoot,
      callJev: async () => response,
    });
    assert.equal(result.status, "shadow");
    assert.equal(result.advisory.capability, "standard");
    assert.equal(result.advisory.effort, "low");
    assert.equal(result.advisory.execution, null);
    assert.equal(result.advisory.review_floor, null);
    assert.deepEqual(result.approved_dimensions, ["task_family", "capability", "effort", "context"]);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("weak task-family labeling does not block confident capability and effort advice", async () => {
  const response = structuredClone(jevResponse);
  response.answers.task_family = {
    type: "choice",
    choice: "mechanical-edit",
    confidence: 0.36,
    probabilities: {
      lookup: 0.01,
      "mechanical-edit": 0.36,
      "scoped-implementation": 0.32,
      debugging: 0.28,
      architecture: 0.01,
      review: 0.01,
      unclear: 0.01,
    },
  };
  response.answers.required_capability = {
    type: "choice",
    choice: "routine",
    confidence: 0.91,
    probabilities: { routine: 0.91, standard: 0.05, deep: 0.03, unclear: 0.01 },
  };
  response.answers.required_effort = {
    type: "choice",
    choice: "minimal",
    confidence: 0.57,
    probabilities: { minimal: 0.57, low: 0.27, medium: 0.08, high: 0.04, "extra-high": 0.02, unclear: 0.02 },
  };
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-partial-family-"));
  try {
    const result = await optimizeRoute(routeRequest(), {
      routingMode: "shadow",
      apiKey: "test-key",
      scratchRoot,
      callJev: async () => response,
    });
    assert.equal(result.status, "shadow");
    assert.equal(result.advisory.task_family, null);
    assert.equal(result.advisory.capability, "routine");
    assert.equal(result.advisory.effort, "minimal");
    assert.equal(result.approved_dimensions.includes("task_family"), false);
    assert.equal(result.approved_dimensions.includes("capability"), true);
    assert.equal(result.approved_dimensions.includes("effort"), true);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("weak effort advice still preserves the baseline", async () => {
  const response = structuredClone(jevResponse);
  response.answers.required_effort.confidence = 0.54;
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-weak-effort-"));
  try {
    const result = await optimizeRoute(routeRequest(), {
      routingMode: "shadow",
      apiKey: "test-key",
      scratchRoot,
      callJev: async () => response,
    });
    assert.equal(result.status, "hold");
    assert.equal(result.baseline_preserved, true);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("risk flags mask optional execution and context advice", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-risk-mask-"));
  try {
    const result = await optimizeRoute(routeRequest({
      policy: { ...routeRequest().policy, capability_floor: "standard", effort_floor: "high", risk_flags: ["missing-evidence"] },
    }), {
      routingMode: "shadow",
      apiKey: "test-key",
      scratchRoot,
      callJev: async () => jevResponse,
    });
    assert.equal(result.status, "shadow");
    assert.equal(result.advisory.execution, null);
    assert.equal(result.advisory.context, null);
    assert.equal(result.advisory.capability, "standard");
    assert.equal(result.advisory.effort, "high");
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("malformed Jev output fails open", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-invalid-"));
  try {
    const result = await optimizeRoute(routeRequest(), {
      routingMode: "shadow",
      apiKey: "test-key",
      scratchRoot,
      callJev: async () => ({ answers: {} }),
    });
    assert.equal(result.status, "unavailable");
    assert.equal(result.baseline_preserved, true);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("shadow calibration flags unsafe advisory dimensions", () => {
  const testCase = {
    minimum: { capability: "standard", effort: "medium" },
    allowed: { execution: ["isolated-worker"], context: ["broad"], review_floor: ["general", "deep-security"] },
  };
  const result = {
    status: "shadow",
    baseline_preserved: true,
    advisory: { capability: "routine", effort: "low", execution: "direct-deterministic", context: "targeted", review_floor: "deterministic" },
  };
  assert.deepEqual(evaluateCalibration(testCase, result), [
    "CAPABILITY_DOWNGRADE",
    "EFFORT_DOWNGRADE",
    "EXECUTION_DOWNGRADE",
    "CONTEXT_DOWNGRADE",
    "REVIEW_FLOOR_DOWNGRADE",
  ]);
});


test("capsule writes atomically and projections reject stale snapshots", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-capsule-"));
  const capsule = {
    featurekit_version: "0.7.0",
    policy_version: 1,
    snapshot: { repo: "fixture", head: "abc123", dirty_digest: "clean", artifact_hashes: {} },
    authority: { level: "approved-write", artifact: "docs/plan.md", scope: ["src/a"], exclusions: [] },
    requirements: { objective: "Implement A", acceptance: ["A1"], constraints: ["No dependencies"] },
    risk: { flags: [], capability_floor: "routine", review_floor: "deterministic" },
    route: {},
    work: { jobs: [], status: "ready", changed_paths: [] },
    failures: [{ id: "F1", status: "open", ref: "logs/failure.txt" }],
    evidence: [{ id: "E1", status: "failed", ref: "logs/failure.txt" }],
    review: {},
    decisions: [],
  };
  try {
    const written = await writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T1", expected_revision: 0, capsule }, { scratchRoot });
    assert.equal(written.revision, 1);
    assert.equal((await stat(written.path)).mode & 0o777, 0o600);
    const projected = await projectCapsule({ schema: 1, mode: "capsule", action: "project", task_id: "T1", consumer: "worker", job_id: "W1", expected_snapshot: capsule.snapshot }, { scratchRoot });
    assert.equal(projected.status, "projected");
    const projection = JSON.parse(await readFile(projected.path, "utf8"));
    assert.equal(projection.consumer, "worker");
    assert.equal(projection.state.requirements.objective, "Implement A");
    const escalated = await projectCapsule({ schema: 1, mode: "capsule", action: "project", task_id: "T1", consumer: "escalation", expected_snapshot: capsule.snapshot }, { scratchRoot });
    const escalation = JSON.parse(await readFile(escalated.path, "utf8"));
    assert.deepEqual(escalation.state.changed_paths, []);
    assert.equal(escalation.state.failures[0].id, "F1");
    assert.equal("decisions" in escalation.state, false);
    await assert.rejects(
      projectCapsule({ schema: 1, mode: "capsule", action: "project", task_id: "T1", consumer: "worker", job_id: "../escape", expected_snapshot: capsule.snapshot }, { scratchRoot }),
      /invalid task_id/,
    );
    await assert.rejects(
      writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T1", expected_revision: 0, capsule }, { scratchRoot }),
      /revision conflict/,
    );
    await assert.rejects(
      writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T2", expected_revision: 0, capsule: { ...capsule, review: { secret: "must-not-store" } } }, { scratchRoot }),
      /forbidden capsule field/,
    );
    const stale = await projectCapsule({ schema: 1, mode: "capsule", action: "project", task_id: "T1", consumer: "reviewer", expected_snapshot: { ...capsule.snapshot, head: "new" } }, { scratchRoot });
    assert.equal(stale.status, "stale");
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("prompt hook injects one approved capsule route and skips ambiguity", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-hook-"));
  const request = routeRequest();
  const capsule = {
    featurekit_version: "0.7.0",
    policy_version: 1,
    snapshot: { repo: "fixture", head: "abc123", dirty_digest: "clean", artifact_hashes: {} },
    authority: { level: "approved-write", artifact: "docs/plan.md", scope: ["src/a"], exclusions: [] },
    requirements: { objective: "Implement A", acceptance: ["A1"], constraints: [] },
    risk: { flags: [], capability_floor: "routine", review_floor: "deterministic" },
    route: { request },
    work: { jobs: [], status: "ready", changed_paths: [] },
    failures: [],
    evidence: [],
    review: {},
    decisions: [],
  };
  let calls = 0;
  const optimize = async (value) => {
    calls += 1;
    assert.deepEqual(value, request);
    return { schema: 1, status: "shadow", baseline_preserved: true, advisory: { capability: "routine", effort: "minimal" }, approved_dimensions: ["capability", "effort"], gates: {}, cache: "hit", reason_codes: ["SHADOW_ONLY"] };
  };
  try {
    await writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T1", expected_revision: 0, capsule }, { scratchRoot });
    const output = await runRouteHook({ hook_event_name: "UserPromptSubmit", cwd: "/ignored" }, { scratchRoot, optimize });
    assert.match(output.hookSpecificOutput.additionalContext, /advisory only.*\"capability\":\"routine\"/);
    await writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T2", expected_revision: 0, capsule: { ...capsule, route: { request: routeRequest({ task: { ...request.task, id: "T2" } }) } } }, { scratchRoot });
    assert.equal(await runRouteHook({ hook_event_name: "UserPromptSubmit", cwd: "/ignored" }, { scratchRoot, optimize }), null);
    assert.equal(calls, 1);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("Codex compaction hook restores one active capsule pointer without transcript content", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-compact-hook-"));
  const request = routeRequest();
  const capsule = {
    featurekit_version: "0.7.0",
    policy_version: 1,
    snapshot: { repo: "fixture", head: "abc123", dirty_digest: "clean", artifact_hashes: {} },
    authority: { level: "approved-write", artifact: "docs/plan.md", scope: ["src/a"], exclusions: [] },
    requirements: { objective: "Implement A", acceptance: ["A1"], constraints: [] },
    risk: { flags: [], capability_floor: "routine", review_floor: "deterministic" },
    route: { request },
    work: { jobs: [], status: "active", changed_paths: [] },
    failures: [],
    evidence: [],
    review: {},
    decisions: [],
  };
  try {
    await writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T1", expected_revision: 0, capsule }, { scratchRoot });
    const output = await runCompactionHook({ hook_event_name: "SessionStart", source: "compact", cwd: "/ignored", transcript_path: "/secret/transcript.jsonl" }, { scratchRoot });
    assert.match(output.hookSpecificOutput.additionalContext, /native compaction.*capsule\.json.*task T1, revision 1.*Do not replay the transcript/);
    assert.doesNotMatch(output.hookSpecificOutput.additionalContext, /secret\/transcript/);
    assert.equal(await runCompactionHook({ hook_event_name: "SessionStart", source: "startup" }, { scratchRoot }), null);
    await writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T2", expected_revision: 0, capsule: { ...capsule, route: { request: routeRequest({ task: { ...request.task, id: "T2" } }) } } }, { scratchRoot });
    assert.equal(await runCompactionHook({ hook_event_name: "SessionStart", source: "compact" }, { scratchRoot }), null);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("fact receipts reuse only exact fresh repository state", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-receipt-"));
  const identity = {
    snapshot: { repo: "fixture", head: "abc123", dirty_digest: "clean", artifact_hashes: {} },
    query_hash: "a".repeat(64),
    tool: "source",
    contract_version: 1,
    index_head: null,
    relevant_hashes: { "src/session.js": "b".repeat(64) },
  };
  const fact = { id: "session-owner", value: "Session ownership is checked in middleware", ref: "src/session.js#middleware" };
  try {
    const written = await writeReceipt({ schema: 1, mode: "receipt", action: "write", task_id: "T1", identity, fact }, { scratchRoot });
    assert.equal(written.status, "written");
    assert.equal((await readReceipt({ schema: 1, mode: "receipt", action: "read", task_id: "T1", identity }, { scratchRoot })).fact.value, fact.value);
    const changedSource = { ...identity, relevant_hashes: { "src/session.js": "c".repeat(64) } };
    assert.equal((await readReceipt({ schema: 1, mode: "receipt", action: "read", task_id: "T1", identity: changedSource }, { scratchRoot })).status, "miss");
    const changedTree = { ...identity, snapshot: { ...identity.snapshot, dirty_digest: "changed" } };
    assert.equal((await readReceipt({ schema: 1, mode: "receipt", action: "read", task_id: "T1", identity: changedTree }, { scratchRoot })).status, "miss");
    assert.equal((await readReceipt({ schema: 1, mode: "receipt", action: "read", task_id: "T1", identity: { ...identity, contract_version: 2 } }, { scratchRoot })).status, "miss");
    const staleIndex = { ...identity, tool: "repowise", index_head: "older-head" };
    const stale = await writeReceipt({ schema: 1, mode: "receipt", action: "write", task_id: "T1", identity: staleIndex, fact }, { scratchRoot });
    assert.deepEqual(stale.reason_codes, ["INDEX_BEHIND"]);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("review tiering preserves evidence, risk, and source-sharing floors", () => {
  const request = (change = {}, route = {}) => ({
    schema: 1,
    mode: "review",
    action: "select",
    change: { kind: "ordinary", stable_diff: true, verification: "passed", source_sharing: "off", risk_flags: [], ...change },
    route: { status: "shadow", review_floor: "jev-review", approved_dimensions: ["review_floor"], ...route },
  });
  assert.equal(selectReviewTier(request({ kind: "trivial" })).tier, "deterministic");
  assert.equal(selectReviewTier(request({ risk_flags: ["security"] })).tier, "deep-security");
  assert.equal(selectReviewTier(request({ verification: "missing" })).tier, "general");
  assert.equal(selectReviewTier(request({ risk_flags: ["prior-failure"] })).tier, "general");
  assert.equal(selectReviewTier(request({}, { status: "hold", review_floor: null, approved_dimensions: [] })).tier, "general");
  assert.equal(selectReviewTier(request()).tier, "general");
  assert.equal(selectReviewTier(request({ source_sharing: "allowed" })).tier, "jev-review");
  assert.equal(selectReviewTier(request({}, { review_floor: "deterministic" })).tier, "deterministic");
  assert.throws(() => selectReviewTier({ ...request(), source: "diff" }), /unknown field: source/);
});


test("deterministic pruning preserves pins and tool pairs while dropping recoverable metadata", () => {
  const entry = (id, kind, content, overrides = {}) => ({
    id,
    kind,
    state: "current",
    pinned: false,
    content_hash: content.repeat(64),
    ref: null,
    pair_id: null,
    ...overrides,
  });
  const result = pruneContext({
    schema: 1,
    mode: "prune",
    action: "deterministic",
    entries: [
      entry("scope", "requirement", "a", { pinned: true, ref: "plan.md#scope" }),
      entry("scope-copy", "diagnostic", "a"),
      entry("source", "source", "b", { ref: "src/session.js#owner" }),
      entry("progress", "progress", "c", { state: "resolved" }),
      entry("old-diagnostic", "diagnostic", "d", { state: "resolved", ref: "logs/attempt-1.txt" }),
      entry("tool-action", "tool-action", "e", { state: "resolved", ref: "logs/check.txt#command", pair_id: "P1" }),
      entry("tool-result", "tool-result", "f", { state: "resolved", ref: "logs/check.txt#result", pair_id: "P1" }),
      entry("active-action", "tool-action", "1", { ref: "logs/current.txt#command", pair_id: "P2" }),
      entry("active-result", "tool-result", "2", { state: "resolved", ref: "logs/current.txt#result", pair_id: "P2" }),
    ],
  });
  assert.deepEqual(result.keep_ids, ["scope", "active-action", "active-result"]);
  assert.deepEqual(result.dropped.map(({ id, reason }) => [id, reason]), [
    ["scope-copy", "DUPLICATE"],
    ["source", "RECOVERABLE_REFERENCE"],
    ["progress", "RESOLVED_PROGRESS"],
    ["old-diagnostic", "RESOLVED_DIAGNOSTIC"],
    ["tool-action", "RECOVERABLE_PAIR"],
    ["tool-result", "RECOVERABLE_PAIR"],
  ]);
  assert.throws(() => pruneContext({ schema: 1, mode: "prune", action: "deterministic", entries: [entry("orphan", "tool-result", "3", { pair_id: "P3" })] }), /pair P3/);
  assert.throws(() => pruneContext({ schema: 1, mode: "prune", action: "deterministic", entries: [{ ...entry("raw", "source", "4"), text: "source" }] }), /unknown field: text/);
});
