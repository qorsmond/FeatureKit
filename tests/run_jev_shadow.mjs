#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { optimizeRoute } from "../skills/productivity/orchestrate-work/scripts/optimizer.mjs";


const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(HERE, "fixtures", "jev");
const CAPABILITIES = ["routine", "standard", "deep"];
const EFFORTS = ["minimal", "low", "medium", "high", "extra-high"];

const load = async (name) => JSON.parse(await readFile(path.join(FIXTURES, name), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

function atLeast(actual, minimum, order) {
  return order.indexOf(actual) >= order.indexOf(minimum);
}

export function evaluateCalibration(testCase, result) {
  const violations = [];
  if (result.status === "enforced") {
    if (testCase.skip_reason) violations.push("UNSAFE_ENFORCEMENT");
    if (testCase.request.policy.risk_flags.length && result.route?.up_only !== true) violations.push("FLAGGED_NOT_UP_ONLY");
  } else if (result.baseline_preserved !== true) violations.push("BASELINE_NOT_PRESERVED");
  if (testCase.skip_reason) {
    if (result.status !== "skipped" || !result.reason_codes?.includes(testCase.skip_reason)) violations.push("DETERMINISTIC_GATE_MISSED");
    return violations;
  }
  if (!result.advisory) return violations;
  const { advisory } = result;
  if (!atLeast(advisory.capability, testCase.minimum.capability, CAPABILITIES)) violations.push("CAPABILITY_DOWNGRADE");
  if (!atLeast(advisory.effort, testCase.minimum.effort, EFFORTS)) violations.push("EFFORT_DOWNGRADE");
  for (const [field, allowed] of Object.entries(testCase.allowed || {})) {
    if (advisory[field] !== null && !allowed.includes(advisory[field])) violations.push(`${field.toUpperCase()}_DOWNGRADE`);
  }
  return violations;
}

export async function calibrationCases() {
  const normal = await load("route-request.json");
  const mechanical = await load("mechanical-edit.json");
  const unknownDebugging = await load("unknown-debugging.json");
  const architecture = await load("architecture.json");
  const make = (family, base, changes, expectation) => {
    const request = clone(base);
    Object.assign(request.task, changes.task || {});
    Object.assign(request.facts, changes.facts || {});
    Object.assign(request.policy, changes.policy || {});
    return { family, request, ...expectation };
  };
  const normalRoute = {
    minimum: { capability: "standard", effort: "low" },
    allowed: {
      execution: ["current-primary", "isolated-worker", "specialist"],
      context: ["targeted", "broad"],
      review_floor: ["jev-review", "general", "deep-security"],
    },
  };
  const deepRoute = {
    minimum: { capability: "deep", effort: "high" },
    allowed: {
      execution: ["current-primary", "isolated-worker", "specialist"],
      context: ["broad"],
      review_floor: ["general", "deep-security"],
    },
  };
  return [
    make("deterministic-simple", normal, {
      task: { id: "cal-deterministic", operation: "lookup", approval: "read-only", objective: "Read one exact version value", scope: ["VERSION"], acceptance: ["Report the exact value"] },
      facts: { files_estimate: 1 },
    }, { skip_reason: "DETERMINISTIC_LOOKUP" }),
    make("routine-edit", mechanical, { task: { id: "cal-routine-edit" } }, {
      minimum: { capability: "routine", effort: "minimal" },
      allowed: { execution: ["direct-deterministic", "current-primary", "isolated-worker"], context: ["pointers", "targeted", "broad"], review_floor: ["deterministic", "jev-review", "general", "deep-security"] },
    }),
    make("routine-implementation", normal, {
      task: { id: "cal-routine-implementation", objective: "Implement one approved bounded response change with an existing focused check", scope: ["server.py"], acceptance: ["The existing focused check passes"] },
      facts: { files_estimate: 1, existing_check: true, spec_exact: true, follows_existing_pattern: true, new_dependencies: false, lines_estimate: 10 },
    }, {
      minimum: { capability: "routine", effort: "low" },
      allowed: { execution: ["direct-deterministic", "current-primary", "isolated-worker"], context: ["pointers", "targeted", "broad"], review_floor: ["deterministic", "jev-review", "general", "deep-security"] },
    }),
    make("normal-implementation", normal, { task: { id: "cal-normal" }, policy: { capability_floor: "standard", effort_floor: "low" } }, normalRoute),
    make("cross-module", normal, {
      task: { id: "cal-cross-module", objective: "Add one approved behavior across the API and persistence boundary", scope: ["src/api", "src/storage", "tests/integration"] },
      facts: { files_estimate: 8, cross_boundary: true },
      policy: { capability_floor: "standard", effort_floor: "medium" },
    }, { ...normalRoute, minimum: { capability: "standard", effort: "medium" }, allowed: { ...normalRoute.allowed, context: ["broad"], review_floor: ["general", "deep-security"] } }),
    make("architecture", architecture, { task: { id: "cal-architecture" } }, deepRoute),
    // Optimistic facts on consequential work must not pull the route below its floors.
    make("architecture-optimistic-facts", architecture, {
      task: { id: "cal-architecture-optimistic" },
      facts: { existing_check: true, spec_exact: true, follows_existing_pattern: true, new_dependencies: false, lines_estimate: 40 },
    }, deepRoute),
    make("known-root-debugging", normal, {
      task: { id: "cal-known-debug", operation: "debug", objective: "Fix the evidenced off-by-one expiry defect", scope: ["src/session", "tests/session"] },
      facts: { files_estimate: 3, current_failure: true },
      policy: { capability_floor: "standard", effort_floor: "medium" },
    }, { ...normalRoute, minimum: { capability: "standard", effort: "medium" } }),
    make("unknown-root-debugging", unknownDebugging, { task: { id: "cal-unknown-debug" }, policy: { capability_floor: "deep" } }, deepRoute),
    make("prior-failed-attempt", unknownDebugging, { task: { id: "cal-prior-failure" }, policy: { capability_floor: "deep" } }, deepRoute),
    make("incomplete-brief", normal, {
      task: { id: "cal-incomplete", objective: "Implement the feature after the user chooses the unresolved persistence behavior", acceptance: ["A material product decision is still required"] },
      policy: { capability_floor: "standard", effort_floor: "medium", risk_flags: ["ambiguous", "user-decision-pending"] },
    }, { skip_reason: "USER_DECISION_PENDING" }),
    make("long-context-tool-heavy", normal, {
      task: { id: "cal-long-context", objective: "Implement a bounded behavior after targeted retrieval across several tool-backed modules", scope: ["src/api", "src/domain", "src/storage", "tests/integration"] },
      facts: { files_estimate: 16, cross_boundary: true },
      policy: { capability_floor: "standard", effort_floor: "medium" },
    }, { ...normalRoute, minimum: { capability: "standard", effort: "medium" }, allowed: { ...normalRoute.allowed, context: ["broad"] } }),
    make("large-repository-discovery", normal, {
      task: { id: "cal-large-discovery", operation: "other", approval: "read-only", objective: "Trace an unfamiliar cross-module behavior before planning", scope: ["repository"] },
      facts: { files_estimate: 1000, cross_boundary: true },
      policy: { capability_floor: "standard", effort_floor: "medium" },
    }, { ...normalRoute, minimum: { capability: "standard", effort: "medium" }, allowed: { ...normalRoute.allowed, context: ["broad"] } }),
    make("security-destructive", normal, {
      task: { id: "cal-security", objective: "Change tenant authorization and delete migrated credentials", scope: ["src/authz", "src/storage"] },
      policy: { capability_floor: "deep", effort_floor: "high", risk_flags: ["security", "destructive"] },
    }, { skip_reason: "HARD_RISK_FLOOR" }),
    make("misleading-completion", normal, {
      task: { id: "cal-missing-evidence", operation: "review", approval: "read-only", objective: "Assess a completion claim whose required runtime evidence is missing", scope: ["changed paths"] },
      facts: { current_failure: true },
      policy: { capability_floor: "deep", effort_floor: "high", risk_flags: ["missing-evidence", "ambiguous"] },
    }, deepRoute),
    make("large-review-handoff", normal, {
      task: { id: "cal-large-review", operation: "review", approval: "read-only", objective: "Review a large cross-module handoff against pinned constraints and evidence", scope: ["src/api", "src/domain", "src/storage", "tests"] },
      facts: { files_estimate: 40, cross_boundary: true },
      policy: { capability_floor: "standard", effort_floor: "medium" },
    }, { ...normalRoute, minimum: { capability: "standard", effort: "medium" }, allowed: { ...normalRoute.allowed, context: ["broad"], review_floor: ["general", "deep-security"] } }),
  ];
}

async function main() {
  const rows = [];
  const routingMode = process.argv.includes("--enforce") ? "enforce" : "shadow";
  for (const testCase of await calibrationCases()) {
    const result = await optimizeRoute(testCase.request, { routingMode });
    const violations = evaluateCalibration(testCase, result);
    rows.push({
      family: testCase.family,
      status: result.status,
      cache: result.cache,
      model: result.model || null,
      usage: result.usage,
      reason_codes: result.reason_codes,
      signals: result.signals || null,
      violations,
      route_class: result.route?.class || null,
      paired_trial_candidate: result.status === "shadow" && violations.length === 0,
    });
  }
  const providerRows = rows.filter((row) => row.cache === "miss");
  const totals = providerRows.reduce((sum, row) => ({
    input_tokens: sum.input_tokens + (row.usage?.input_tokens || 0),
    output_tokens: sum.output_tokens + (row.usage?.output_tokens || 0),
  }), { input_tokens: 0, output_tokens: 0 });
  const report = {
    schema: 1,
    mode: `jev-${routingMode}-calibration`,
    cases: rows.length,
    unsafe: rows.filter((row) => row.violations.length).length,
    inconclusive: rows.filter((row) => ["hold", "unavailable", "off"].includes(row.status)).length,
    provider_calls: providerRows.length,
    provider_usage: totals,
    rows,
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.unsafe) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
