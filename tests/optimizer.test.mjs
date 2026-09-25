import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  optimizeRoute,
  projectCapsule,
  pruneContext,
  cacheStats,
  readCatalogue,
  readReceipt,
  recordAttempt,
  selectReviewTier,
  validateRouteRequest,
  writeCapsule,
  writeCatalogue,
  writeReceipt,
} from "../skills/productivity/orchestrate-work/scripts/optimizer.mjs";
import { handleMcpRequest, ROUTE_TOOL } from "../skills/productivity/orchestrate-work/scripts/mcp-server.mjs";
import { runRouteHook } from "../skills/productivity/orchestrate-work/scripts/route-hook.mjs";
import { runCompactionHook } from "../skills/productivity/orchestrate-work/scripts/compaction-hook.mjs";
import { calibrationCases, evaluateCalibration } from "./run_jev_shadow.mjs";


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


test("route input accepts only verified optional facts with strict types", async () => {
  const rich = { existing_check: true, spec_exact: true, follows_existing_pattern: false, new_dependencies: false, lines_estimate: 80 };
  const withFacts = (facts) => routeRequest({ facts: { ...routeRequest().facts, ...facts } });
  assert.doesNotThrow(() => validateRouteRequest(withFacts(rich)));
  assert.doesNotThrow(() => validateRouteRequest(withFacts({ spec_exact: true })));
  assert.throws(() => validateRouteRequest(withFacts({ existing_check: "yes" })), /existing_check must be boolean/);
  assert.throws(() => validateRouteRequest(withFacts({ lines_estimate: -1 })), /lines_estimate/);
  assert.throws(() => validateRouteRequest(withFacts({ lines_estimate: 1.5 })), /lines_estimate/);
  assert.throws(() => validateRouteRequest(withFacts({ easy: true })), /unknown field: easy/);
  const { files_estimate, ...missingRequired } = routeRequest().facts;
  assert.throws(() => validateRouteRequest(routeRequest({ facts: { ...missingRequired, ...rich } })), /missing field: facts.files_estimate/);

  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-facts-"));
  const sent = [];
  const options = { routingMode: "shadow", apiKey: "test-key", scratchRoot, callJev: async (payload) => { sent.push(payload); return jevResponse; } };
  try {
    await optimizeRoute(routeRequest(), options);
    await optimizeRoute(withFacts(rich), options);
    assert.equal(sent.length, 2, "optional facts change the exact cache key");
    assert.deepEqual(Object.keys(sent[0].state.facts).sort(), Object.keys(routeRequest().facts).sort());
    assert.deepEqual(sent[1].state.facts, withFacts(rich).facts);
    const trace = (await readFile(path.join(scratchRoot, "traces", "jev.jsonl"), "utf8")).trim().split("\n").map((line) => JSON.parse(line));
    assert.ok(trace.every((entry) => entry.policy_version === 7));
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }

  const factsSchema = ROUTE_TOOL.inputSchema.properties.facts;
  assert.deepEqual(factsSchema.required, ["files_estimate", "cross_boundary", "unknown_root_cause", "current_failure", "attempts"]);
  for (const key of Object.keys(rich)) assert.ok(key in factsSchema.properties, key);
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


const routineLowResponse = () => {
  const response = structuredClone(jevResponse);
  response.answers.required_capability = choice("routine", ["routine", "standard", "deep", "unclear"]);
  response.answers.required_effort = choice("low", ["minimal", "low", "medium", "high", "extra-high", "unclear"]);
  return response;
};


const enforceRoute = async (request, callJev = async () => routineLowResponse()) => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-enforce-"));
  try {
    return await optimizeRoute(request, { routingMode: "enforce", apiKey: "test-key", scratchRoot, callJev });
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
};


test("enforce mode obeys JEV at every approved level with a low effort floor", async () => {
  let sent;
  const routine = await enforceRoute(routeRequest(), async (payload) => { sent = payload; return routineLowResponse(); });
  assert.equal(sent.state.policy.effort_floor, "low");
  assert.equal(routine.status, "enforced");
  assert.equal(routine.baseline_preserved, false);
  assert.deepEqual(routine.route, { class: "routine-low", capability: "routine", effort: "low", up_only: false, escalation: "baseline-once" });
  assert.ok(routine.reason_codes.includes("ENFORCED"));
  assert.ok(!routine.reason_codes.includes("SHADOW_ONLY"));

  const standard = await enforceRoute(routeRequest(), async () => structuredClone(jevResponse));
  assert.equal(standard.route.class, "standard-low");
  const consequential = routineLowResponse();
  consequential.answers.high_consequence_if_wrong.noul = 0.9;
  const deep = await enforceRoute(routeRequest(), async () => consequential);
  assert.deepEqual([deep.status, deep.route.capability, deep.route.effort], ["enforced", "deep", "high"]);

  const withTask = (task) => routeRequest({ task: { ...routeRequest().task, ...task } });
  const withFacts = (facts) => routeRequest({ facts: { ...routeRequest().facts, ...facts } });
  for (const request of [withTask({ operation: "debug" }), withTask({ operation: "review", approval: "read-only" }), withFacts({ attempts: 1, cross_boundary: true })]) {
    assert.equal((await enforceRoute(request)).status, "enforced", request.task.operation);
  }
  const floored = await enforceRoute(routeRequest({ policy: { ...routeRequest().policy, capability_floor: "standard", effort_floor: "medium" } }));
  assert.deepEqual([floored.route.capability, floored.route.effort], ["standard", "medium"], "routes never go below the request floors");

  const shadowRoot = await mkdtemp(path.join(tmpdir(), "featurekit-shadow-"));
  const shadow = await optimizeRoute(routeRequest(), { routingMode: "shadow", apiKey: "test-key", scratchRoot: shadowRoot, callJev: async () => routineLowResponse() });
  await rm(shadowRoot, { recursive: true, force: true });
  assert.equal(shadow.status, "shadow");
  assert.equal(shadow.baseline_preserved, true);
  assert.equal(shadow.route, undefined);
});


test("enforce mode marks caution-flagged routes up-only and keeps the baseline for gates and weak signals", async () => {
  const withPolicy = (policy) => routeRequest({ policy: { ...routeRequest().policy, ...policy } });
  const withTask = (task) => routeRequest({ task: { ...routeRequest().task, ...task } });
  for (const flag of ["migration", "ambiguous", "prior-failure", "missing-evidence"]) {
    const result = await enforceRoute(withPolicy({ risk_flags: [flag] }));
    assert.equal(result.status, "enforced", flag);
    assert.equal(result.route.up_only, true, flag);
  }
  const weakEffort = routineLowResponse();
  weakEffort.answers.required_effort.confidence = 0.4;
  const unclearCapability = routineLowResponse();
  unclearCapability.answers.required_capability = choice("unclear", ["routine", "standard", "deep", "unclear"]);
  const baselineCases = [
    ["weak effort hold", routeRequest(), async () => weakEffort],
    ["unclear capability", routeRequest(), async () => unclearCapability],
    ["provider failure", routeRequest(), async () => { throw Object.assign(new Error("down"), { code: "TIMEOUT" }); }],
    ["malformed answer", routeRequest(), async () => ({ answers: {} })],
    ["hard risk", withPolicy({ risk_flags: ["security"], capability_floor: "deep" })],
    ["destructive", withPolicy({ risk_flags: ["destructive"] })],
    ["pending decision", withPolicy({ risk_flags: ["user-decision-pending"] })],
    ["unapproved", withTask({ approval: "not-approved" })],
    ["read-only write", withTask({ approval: "read-only" })],
    ["deterministic lookup", withTask({ operation: "lookup", approval: "read-only" })],
  ];
  for (const [name, request, callJev] of baselineCases) {
    const result = await enforceRoute(request, callJev);
    assert.notEqual(result.status, "enforced", name);
    assert.equal(result.baseline_preserved, true, name);
    assert.equal(result.route, undefined, name);
  }
});


test("enforce mode never routes the safety corpus below its minimums even with adversarial cheapest advice", async () => {
  // The adversary always claims the cheapest level; optional advice stays unclear so it cannot mask the gate under test.
  const adversary = routineLowResponse();
  adversary.answers.required_effort = choice("minimal", ["minimal", "low", "medium", "high", "extra-high", "unclear"]);
  adversary.answers.execution_shape = choice("unclear", ["direct-deterministic", "current-primary", "isolated-worker", "specialist", "unclear"]);
  adversary.answers.context_breadth = choice("unclear", ["pointers", "targeted", "broad", "unclear"]);
  adversary.answers.provisional_review_tier = choice("unclear", ["deterministic", "jev-review", "general", "deep-security", "unclear"]);
  let enforced = 0;
  for (const testCase of await calibrationCases()) {
    const result = await enforceRoute(testCase.request, async () => adversary);
    assert.deepEqual(evaluateCalibration(testCase, result), [], testCase.family);
    if (result.status === "enforced") enforced += 1;
  }
  assert.ok(enforced >= 10, "every non-skipped corpus family is enforced");
  const flagged = { request: routeRequest({ policy: { ...routeRequest().policy, risk_flags: ["ambiguous"] } }), minimum: { capability: "routine", effort: "low" } };
  assert.deepEqual(evaluateCalibration(flagged, { status: "enforced", baseline_preserved: false, advisory: { capability: "routine", effort: "low" }, route: { capability: "routine", effort: "low", up_only: false } }), ["FLAGGED_NOT_UP_ONLY"]);
  assert.deepEqual(evaluateCalibration({ skip_reason: "HARD_RISK_FLOOR", request: routeRequest() }, { status: "enforced", baseline_preserved: false, route: {} }), ["UNSAFE_ENFORCEMENT", "DETERMINISTIC_GATE_MISSED"]);
});


test("off, missing, or invalid routing modes restore the baseline without a provider call", async () => {
  const previous = process.env.FEATUREKIT_JEV_ROUTING;
  let calls = 0;
  const callJev = async () => { calls += 1; return routineLowResponse(); };
  try {
    delete process.env.FEATUREKIT_JEV_ROUTING;
    const missing = await optimizeRoute(routeRequest(), { apiKey: "test-key", callJev });
    const off = await optimizeRoute(routeRequest(), { routingMode: "off", apiKey: "test-key", callJev });
    for (const result of [missing, off]) {
      assert.equal(result.status, "off");
      assert.equal(result.baseline_preserved, true);
      assert.equal(result.route, undefined);
    }
    await assert.rejects(optimizeRoute(routeRequest(), { routingMode: "enforced", apiKey: "test-key", callJev }), /off, shadow, or enforce/);
    const noKey = await optimizeRoute(routeRequest(), { routingMode: "enforce", apiKey: "", callJev });
    assert.equal(noKey.status, "unavailable");
    assert.equal(noKey.baseline_preserved, true);
    assert.equal(calls, 0);
  } finally {
    if (previous === undefined) delete process.env.FEATUREKIT_JEV_ROUTING;
    else process.env.FEATUREKIT_JEV_ROUTING = previous;
  }
});


test("attempt ledger allows one escalation from the routed route to baseline and records unknown runtime settings", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-attempt-"));
  const attempt = (overrides) => ({
    schema: 1,
    mode: "attempt",
    action: "record",
    task_id: "T1",
    attempt: {
      route: "routed",
      route_class: "routine-low",
      requested: { model: "cheap-alias", effort: "low" },
      runtime: { model: null, effort: null },
      outcome: "failed",
      evidence_ref: "checks/health.txt",
      ...overrides,
    },
  });
  try {
    const failed = await recordAttempt(attempt(), { scratchRoot });
    assert.equal(failed.next, "escalate-baseline");
    await assert.rejects(recordAttempt(attempt({ outcome: "passed" }), { scratchRoot }), /routed attempt/);
    const baseline = await recordAttempt(attempt({ route: "baseline", route_class: null, requested: { model: null, effort: null }, outcome: "passed" }), { scratchRoot });
    assert.equal(baseline.next, "validate");
    assert.deepEqual(baseline.escalations, { "routine-low": 1 });
    const stored = JSON.parse(await readFile(baseline.path, "utf8"));
    assert.equal(stored.attempts.length, 2);
    assert.deepEqual(stored.attempts[0].runtime, { model: null, effort: null });
    assert.equal((await stat(baseline.path)).mode & 0o777, 0o600);
    await assert.rejects(recordAttempt({ ...attempt(), attempt: { ...attempt().attempt, transcript: "x" } }, { scratchRoot }), /unknown field: transcript/);
    await assert.rejects(recordAttempt(attempt({ route: "baseline", route_class: "routine-low" }), { scratchRoot }), /route_class/);
    await assert.rejects(recordAttempt({ ...attempt(), task_id: "T2", attempt: { ...attempt().attempt, route_class: "cheap-please" } }, { scratchRoot }), /route_class/);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});


test("prompt hook states an enforced route with its baseline escalation", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-hook-enforce-"));
  const request = routeRequest();
  const capsule = {
    featurekit_version: "0.7.1",
    policy_version: 6,
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
  const optimize = async () => ({ schema: 1, status: "enforced", baseline_preserved: false, advisory: { capability: "routine", effort: "low" }, route: { class: "routine-low", capability: "routine", effort: "low", up_only: false, escalation: "baseline-once" }, approved_dimensions: ["capability", "effort"], gates: {}, cache: "miss", reason_codes: ["ENFORCED"] });
  try {
    await writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T1", expected_revision: 0, capsule }, { scratchRoot });
    const output = await runRouteHook({ hook_event_name: "UserPromptSubmit", cwd: "/ignored" }, { scratchRoot, optimize });
    const text = output.hookSpecificOutput.additionalContext;
    assert.match(text, /enforced/i);
    assert.match(text, /\"class\":\"routine-low\"/);
    assert.match(text, /escalate once to the baseline/);
    assert.match(text, /models this host currently offers.*cheapest tier/);
    assert.match(text, /optimizer\.mjs/);
    assert.match(text, /environment.*is not a routed failure/);
    assert.doesNotMatch(text, /haiku|sonnet|opus|gpt-/i);
    assert.doesNotMatch(text, /advisory only/);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
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


test("Claude plugin prompt hook honors an explicit host off setting before shell startup", async () => {
  const home = await mkdtemp(path.join(tmpdir(), "featurekit-hook-shell-"));
  const marker = path.join(home, "zshrc-loaded");
  const root = path.resolve(import.meta.dirname, "..");
  const { hooks } = JSON.parse(await readFile(path.join(root, "hooks", "hooks.json"), "utf8"));
  const command = hooks.UserPromptSubmit[0].hooks[0].command;
  const run = (routing) => {
    const env = { PATH: process.env.PATH, HOME: home, ZDOTDIR: home, CLAUDE_PLUGIN_ROOT: root };
    if (routing) env.FEATUREKIT_JEV_ROUTING = routing;
    return spawnSync("/bin/sh", ["-c", command], { env, input: JSON.stringify({ hook_event_name: "UserPromptSubmit", cwd: home }), encoding: "utf8" });
  };
  try {
    await writeFile(path.join(home, ".zshrc"), `touch "${marker}"\nexport FEATUREKIT_JEV_ROUTING=shadow\n`);
    const off = run("off");
    assert.equal(off.status, 0);
    assert.equal(off.stdout, "");
    await assert.rejects(stat(marker));
    const inherited = run(null);
    assert.equal(inherited.status, 0);
    assert.equal(inherited.stdout, "");
    assert.ok((await stat(marker)).isFile());
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});


test("Claude plugin prompt hook keeps an explicit host routing mode over shell startup", async () => {
  const home = await mkdtemp(path.join(tmpdir(), "featurekit-hook-mode-"));
  const pluginRoot = path.join(home, "plugin");
  const scripts = path.join(pluginRoot, "skills", "productivity", "orchestrate-work", "scripts");
  const root = path.resolve(import.meta.dirname, "..");
  const { hooks } = JSON.parse(await readFile(path.join(root, "hooks", "hooks.json"), "utf8"));
  const command = hooks.UserPromptSubmit[0].hooks[0].command;
  const run = (routing) => {
    const env = { PATH: process.env.PATH, HOME: home, ZDOTDIR: home, CLAUDE_PLUGIN_ROOT: pluginRoot };
    if (routing) env.FEATUREKIT_JEV_ROUTING = routing;
    return spawnSync("/bin/sh", ["-c", command], { env, input: "{}", encoding: "utf8" }).stdout.trim();
  };
  try {
    await import("node:fs/promises").then(({ mkdir }) => mkdir(scripts, { recursive: true }));
    await writeFile(path.join(scripts, "route-hook.mjs"), "process.stdout.write(`${process.env.FEATUREKIT_JEV_HOST_ROUTING || \"-\"} ${process.env.FEATUREKIT_JEV_ROUTING}`);\n");
    await writeFile(path.join(home, ".zshrc"), "export FEATUREKIT_JEV_ROUTING=shadow\n");
    assert.equal(run("enforce"), "enforce shadow");
    assert.equal(run(null), "- shadow");
    assert.equal(run("off"), "");
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});


test("prompt hook routes with the preserved host mode", async () => {
  const saved = Object.fromEntries(["FEATUREKIT_JEV_HOST_ROUTING", "FEATUREKIT_JEV_ROUTING", "TYPESAFE_API_KEY", "JEV_API_KEY"].map((name) => [name, process.env[name]]));
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-hook-host-mode-"));
  const request = routeRequest();
  const capsule = {
    featurekit_version: "0.8.0",
    policy_version: 6,
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
  try {
    await writeCapsule({ schema: 1, mode: "capsule", action: "write", task_id: "T1", expected_revision: 0, capsule }, { scratchRoot });
    // No key reaches a regression: a missing key would still leave a trace, which the assertion rejects.
    delete process.env.TYPESAFE_API_KEY;
    delete process.env.JEV_API_KEY;
    process.env.FEATUREKIT_JEV_ROUTING = "shadow";
    process.env.FEATUREKIT_JEV_HOST_ROUTING = "off";
    const output = await runRouteHook({ hook_event_name: "UserPromptSubmit", cwd: "/ignored" }, { scratchRoot });
    assert.equal(output, null);
    assert.equal(await readdir(path.join(scratchRoot, "traces")).catch(() => null), null);
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
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


test("key-based receipts derive exact repository identity and miss on any relevant change", async () => {
  const repo = await mkdtemp(path.join(tmpdir(), "featurekit-receipt-repo-"));
  const scratchRoot = path.join(repo, ".scratch", "featurekit");
  const git = (...args) => spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  const key = (overrides = {}) => ({ repo, query: "Where is POST /items validated?", tool: "source", contract_version: 1, index_head: null, paths: ["app/server.py"], ...overrides });
  const read = (k = key()) => readReceipt({ schema: 1, mode: "receipt", action: "read", task_id: "T1", key: k }, { scratchRoot });
  const fact = { id: "items-validation", value: "Validation runs in app/validation.py validate_item", ref: "app/validation.py#validate_item" };
  try {
    await writeFile(path.join(repo, "server.txt"), "x");
    await import("node:fs/promises").then(({ mkdir }) => mkdir(path.join(repo, "app")));
    await writeFile(path.join(repo, "app", "server.py"), "print('a')\n");
    await writeFile(path.join(repo, ".gitignore"), ".scratch/\n");
    git("init", "-q"); git("add", "-A"); git("-c", "user.name=t", "-c", "user.email=t@example.invalid", "commit", "-qm", "init");

    const written = await writeReceipt({ schema: 1, mode: "receipt", action: "write", task_id: "T1", key: key(), fact }, { scratchRoot });
    assert.equal(written.status, "written");
    const hit = await read();
    assert.equal(hit.status, "hit");
    assert.equal(hit.fact.value, fact.value);
    assert.equal((await read(key({ contract_version: 2 }))).status, "miss", "contract change");
    assert.equal((await read(key({ query: "Where is GET handled?" }))).status, "miss", "different query");

    await writeFile(path.join(repo, "app", "server.py"), "print('b')\n");
    assert.equal((await read()).status, "miss", "relevant file change");
    await writeFile(path.join(repo, "app", "server.py"), "print('a')\n");
    assert.equal((await read()).status, "hit", "restored content hits again");
    await writeFile(path.join(repo, "notes.txt"), "untracked");
    assert.equal((await read()).status, "miss", "dirty-tree change");
    await rm(path.join(repo, "notes.txt"));

    const review = await writeReceipt({ schema: 1, mode: "receipt", action: "write", task_id: "T1", key: key({ tool: "review", query: "general review of the approved diff" }), fact: { id: "review-general", value: "general review: no blocking findings", ref: "review/notes.md" } }, { scratchRoot });
    assert.equal(review.status, "written");
    assert.equal((await read(key({ tool: "review", query: "general review of the approved diff" }))).status, "hit");
    const stale = await writeReceipt({ schema: 1, mode: "receipt", action: "write", task_id: "T1", key: key({ tool: "repowise", index_head: "older" }), fact }, { scratchRoot });
    assert.equal(stale.status, "stale");
    await assert.rejects(readReceipt({ schema: 1, mode: "receipt", action: "read", task_id: "T1", key: key({ paths: ["../outside.txt"] }) }, { scratchRoot }), /path/);
    await assert.rejects(readReceipt({ schema: 1, mode: "receipt", action: "read", task_id: "T1", key: key(), identity: {} }, { scratchRoot }), /unknown field|exactly one/);

    const stats = await cacheStats({ schema: 1, mode: "cache", action: "stats" }, { scratchRoot });
    assert.equal(stats.receipt.hit, 3);
    assert.equal(stats.receipt.miss, 4);
    assert.equal(stats.receipt.stale, 1);
    assert.deepEqual(stats.eliminated_calls, { source: 2, review: 1 });
    const trace = await readFile(path.join(scratchRoot, "traces", "cache.jsonl"), "utf8");
    assert.doesNotMatch(trace, /validate_item|no blocking findings|POST \/items/, "traces carry no fact values or queries");
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});


test("host model catalogue caches exact host versions for one day", async () => {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), "featurekit-catalogue-"));
  const host = { name: "codex", version: "0.150.1" };
  const models = [{ id: "model-a", efforts: ["low", "medium"] }, { id: "model-b", efforts: ["low"] }];
  const read = (h = host, now = 1_000_000) => readCatalogue({ schema: 1, mode: "catalogue", action: "read", host: h }, { scratchRoot, now });
  try {
    assert.equal((await read()).status, "miss");
    await writeCatalogue({ schema: 1, mode: "catalogue", action: "write", host, models }, { scratchRoot, now: 1_000_000 });
    const hit = await read(host, 1_000_000 + 3600_000);
    assert.equal(hit.status, "hit");
    assert.deepEqual(hit.models, models);
    assert.equal((await read({ ...host, version: "0.151.0" })).status, "miss", "host upgrade");
    assert.equal((await read(host, 1_000_000 + 25 * 3600_000)).status, "stale", "older than one day");
    await assert.rejects(writeCatalogue({ schema: 1, mode: "catalogue", action: "write", host, models: [{ id: "m", efforts: ["low"], api_key: "x" }] }, { scratchRoot }), /unknown field: api_key/);
    await assert.rejects(writeCatalogue({ schema: 1, mode: "catalogue", action: "write", host, models: Array.from({ length: 65 }, (_, i) => ({ id: `m${i}`, efforts: ["low"] })) }, { scratchRoot }), /models/);
    const stats = await cacheStats({ schema: 1, mode: "cache", action: "stats" }, { scratchRoot });
    assert.deepEqual(stats.catalogue, { hit: 1, miss: 2, stale: 1, written: 1 });
    assert.equal(stats.eliminated_calls.catalogue, 1);
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
