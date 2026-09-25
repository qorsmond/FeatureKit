#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { appendFile, chmod, mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";


const SCHEMA = 1;
export const FEATUREKIT_VERSION = "0.10.0";
const POLICY_VERSION = 7;
const QUESTIONS_VERSION = 4;
const API_URL = new URL("https://api.typesafe.ai/v1/systemone");
const JEV_MODEL = "jev-latest";
const MAX_ROUTE_BYTES = 4096;
const MAX_CAPSULE_BYTES = 32768;
const RECEIPT_VERSION = 1;
const RECEIPT_TOOLS = ["repowise", "serena", "source", "review"];
const CATALOGUE_MAX_AGE_MS = 24 * 3600 * 1000;
const CONFIDENCE_MIN = 0.55;
const MARGIN_MIN = 0.15;
const NOUL_DISTANCE_MIN = 0.2;

const CAPABILITIES = ["routine", "standard", "deep"];
const EFFORTS = ["minimal", "low", "medium", "high", "extra-high"];
const HARD_RISKS = new Set(["security", "authz", "privacy", "destructive", "irreversible"]);
const RISK_FLAGS = new Set([...HARD_RISKS, "migration", "ambiguous", "prior-failure", "missing-evidence", "user-decision-pending"]);
const ROUTING_MODES = ["off", "shadow", "enforce"];
const REQUIRED_FACTS = ["files_estimate", "cross_boundary", "unknown_root_cause", "current_failure", "attempts"];
// Optional facts are sent only when verified from the approved plan or repository; absence is never favorable.
const OPTIONAL_BOOLEAN_FACTS = ["existing_check", "spec_exact", "follows_existing_pattern", "new_dependencies"];
// Both hosts expose low as their lowest runnable effort, so enforcement never asks JEV about minimal.
const ENFORCED_EFFORT_FLOOR = "low";
const ROUTE_CLASS = new RegExp(`^(${CAPABILITIES.join("|")})-(${EFFORTS.join("|")})$`);
const CONTEXT_KINDS = new Set(["authority", "requirement", "constraint", "failure", "evidence", "ownership", "source", "retrieved-doc", "diagnostic", "progress", "decision", "tool-action", "tool-result"]);
const RECOVERABLE_KINDS = new Set(["source", "retrieved-doc"]);
const FORBIDDEN_CAPSULE_KEYS = new Set(["source", "source_code", "diff", "transcript", "raw_output", "api_key", "access_key", "secret", "credential", "password", "private_key", "authorization", "token"]);

const choice = (instructions, criteria) => ({ type: "choice", instructions, criteria });
const noul = (instructions, criteria) => criteria ? ({ type: "noul", instructions, criteria }) : ({ type: "noul", instructions });

export const QUESTIONS = {
  task_family: choice("Which task family best describes the bounded work?", {
    lookup: "Exact retrieval or deterministic inspection",
    "mechanical-edit": "Narrow edit with explicit acceptance",
    "scoped-implementation": "Bounded implementation requiring coding judgment",
    debugging: "Diagnose or fix a failure",
    architecture: "System design or cross-boundary judgment",
    review: "Independent assessment of a stable change",
    unclear: "The metadata is insufficient or contradictory",
  }),
  required_capability: choice("What minimum model capability does this work require?", {
    routine: "Exact, mechanical, or tightly constrained work",
    standard: "Normal implementation, integration, debugging, or review",
    deep: "Architecture, ambiguity, high consequence, or unresolved conflicting evidence",
    unclear: "Cannot determine safely",
  }),
  required_effort: choice("What reasoning effort does this bounded work require?", {
    minimal: "Deterministic or nearly mechanical",
    low: "Straightforward bounded reasoning",
    medium: "Several interacting considerations",
    high: "Substantial diagnosis or judgment",
    "extra-high": "Hardest ambiguous or high-consequence reasoning",
    unclear: "Cannot determine safely",
  }),
  execution_shape: choice("What execution shape best fits the bounded work?", {
    "direct-deterministic": "A tool or exact command can complete it",
    "current-primary": "The current primary should retain the work",
    "isolated-worker": "A bounded fresh worker is useful",
    specialist: "A specialist discipline or tool is required",
    unclear: "Cannot determine safely",
  }),
  context_breadth: choice("How much repository context is required initially?", {
    pointers: "Artifact and path references only",
    targeted: "Focused files or symbols",
    broad: "Cross-module discovery",
    unclear: "Cannot determine safely",
  }),
  high_consequence_if_wrong: noul("Would an incorrect route or implementation have high security, privacy, destructive, irreversible, or architectural consequence?", {
    true: "A wrong result can cross a security/privacy boundary, destroy data, be hard to reverse, or set a durable architecture.",
    false: "The bounded change is ordinary and recoverable with focused verification.",
  }),
  need_worker_reference: noul("Is the optional worker-packet reference needed for this phase?"),
  need_review_reference: noul("Is the optional review reference needed for this phase?"),
  need_host_reference: noul("Is a host-specific execution reference needed for this phase?"),
  need_compaction_reference: noul("Is compaction guidance needed for this phase?"),
  provisional_review_tier: choice("What provisional review floor fits the bounded change?", {
    deterministic: "Checks and scope inspection are sufficient",
    "jev-review": "Ordinary source-aware JEV review may replace general review",
    general: "Fresh general-model review is warranted",
    "deep-security": "Deep or security review is mandatory",
    unclear: "Cannot determine safely",
  }),
};


const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function exactKeys(value, allowed, name) {
  if (!isObject(value)) throw new Error(`${name} must be an object`);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`unknown field: ${key}`);
  }
  for (const key of allowed) {
    if (!(key in value)) throw new Error(`missing field: ${name}.${key}`);
  }
}

function boundedString(value, name, max, allowEmpty = false) {
  if (typeof value !== "string" || (!allowEmpty && !value.trim()) || value.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) {
    throw new Error(`${name} must be a ${allowEmpty ? "bounded" : "non-empty bounded"} string (max ${max})`);
  }
}

function stringArray(value, name, { maxItems = 64, maxLength = 512 } = {}) {
  if (!Array.isArray(value) || value.length > maxItems) throw new Error(`${name} must be a bounded array`);
  value.forEach((item, index) => boundedString(item, `${name}[${index}]`, maxLength));
}

function enumValue(value, values, name) {
  if (!values.includes(value)) throw new Error(`${name} must be one of: ${values.join(", ")}`);
}

function integer(value, name, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be an integer from ${min} to ${max}`);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

const digest = (value) => createHash("sha256").update(typeof value === "string" ? value : stableStringify(value)).digest("hex");

export function validateRouteRequest(request) {
  exactKeys(request, ["schema", "mode", "task", "facts", "policy"], "request");
  if (request.schema !== SCHEMA || request.mode !== "route") throw new Error("unsupported route schema or mode");

  exactKeys(request.task, ["id", "operation", "objective", "approval", "scope", "acceptance"], "task");
  boundedString(request.task.id, "task.id", 64);
  enumValue(request.task.operation, ["lookup", "edit", "implement", "debug", "architecture", "review", "handoff", "other"], "task.operation");
  boundedString(request.task.objective, "task.objective", 1024);
  enumValue(request.task.approval, ["read-only", "approved-write", "not-approved"], "task.approval");
  stringArray(request.task.scope, "task.scope", { maxItems: 64, maxLength: 160 });
  stringArray(request.task.acceptance, "task.acceptance", { maxItems: 64, maxLength: 512 });

  if (!isObject(request.facts)) throw new Error("facts must be an object");
  for (const key of Object.keys(request.facts)) {
    if (![...REQUIRED_FACTS, ...OPTIONAL_BOOLEAN_FACTS, "lines_estimate"].includes(key)) throw new Error(`unknown field: ${key}`);
  }
  for (const key of REQUIRED_FACTS) {
    if (!(key in request.facts)) throw new Error(`missing field: facts.${key}`);
  }
  for (const key of OPTIONAL_BOOLEAN_FACTS) {
    if (key in request.facts && typeof request.facts[key] !== "boolean") throw new Error(`facts.${key} must be boolean`);
  }
  if ("lines_estimate" in request.facts) integer(request.facts.lines_estimate, "facts.lines_estimate", 0, 1000000);
  integer(request.facts.files_estimate, "facts.files_estimate", 0, 100000);
  for (const key of ["cross_boundary", "unknown_root_cause", "current_failure"]) {
    if (typeof request.facts[key] !== "boolean") throw new Error(`facts.${key} must be boolean`);
  }
  integer(request.facts.attempts, "facts.attempts", 0, 10);

  exactKeys(request.policy, ["capability_floor", "effort_floor", "risk_flags", "available_capabilities"], "policy");
  enumValue(request.policy.capability_floor, CAPABILITIES, "policy.capability_floor");
  enumValue(request.policy.effort_floor, EFFORTS, "policy.effort_floor");
  stringArray(request.policy.risk_flags, "policy.risk_flags", { maxItems: RISK_FLAGS.size, maxLength: 32 });
  if (new Set(request.policy.risk_flags).size !== request.policy.risk_flags.length || request.policy.risk_flags.some((flag) => !RISK_FLAGS.has(flag))) {
    throw new Error("policy.risk_flags contains an unknown or duplicate flag");
  }
  stringArray(request.policy.available_capabilities, "policy.available_capabilities", { maxItems: CAPABILITIES.length, maxLength: 16 });
  if (new Set(request.policy.available_capabilities).size !== request.policy.available_capabilities.length || request.policy.available_capabilities.some((item) => !CAPABILITIES.includes(item))) {
    throw new Error("policy.available_capabilities contains an unknown or duplicate capability");
  }
  if (!request.policy.available_capabilities.includes(request.policy.capability_floor)) throw new Error("capability floor is unavailable");
  if (Buffer.byteLength(JSON.stringify(request)) > MAX_ROUTE_BYTES) throw new Error(`route request exceeds ${MAX_ROUTE_BYTES} bytes`);
  return request;
}

function deterministicReason(request) {
  if (request.task.approval === "not-approved" || (request.task.approval === "read-only" && ["edit", "implement"].includes(request.task.operation))) return "APPROVAL_GATE";
  if (request.policy.risk_flags.includes("user-decision-pending")) return "USER_DECISION_PENDING";
  if (request.policy.risk_flags.some((flag) => HARD_RISKS.has(flag))) return "HARD_RISK_FLOOR";
  if (request.task.operation === "lookup" && request.task.approval === "read-only" && !request.facts.unknown_root_cause && !request.facts.current_failure) return "DETERMINISTIC_LOOKUP";
  return null;
}

function withEnforcedFloor(request) {
  return { ...request, policy: { ...request.policy, effort_floor: higherOf(request.policy.effort_floor, ENFORCED_EFFORT_FLOOR, EFFORTS) } };
}

// Deterministic gates already skipped JEV; a shadow result is the only one whose capability and effort both passed.
function enforce(request, result) {
  if (result.status !== "shadow") return result;
  const { capability, effort } = result.advisory;
  return {
    ...result,
    status: "enforced",
    baseline_preserved: false,
    // Caution-flagged work may run stronger than the baseline, never cheaper; the harness compares against its baseline.
    route: { class: `${capability}-${effort}`, capability, effort, up_only: request.policy.risk_flags.length > 0, escalation: "baseline-once" },
    reason_codes: ["ENFORCED", ...result.reason_codes.filter((code) => code !== "SHADOW_ONLY")],
  };
}

function cacheKey(request) {
  return digest({ featurekit: FEATUREKIT_VERSION, policy: POLICY_VERSION, questions: QUESTIONS_VERSION, model: JEV_MODEL, request });
}

function scratchRoot(options) {
  return path.resolve(options.scratchRoot || process.env.FEATUREKIT_SCRATCH_ROOT || path.join(process.cwd(), ".scratch", "featurekit"));
}

async function privateDirectory(directory) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700).catch(() => {});
}

async function atomicWrite(file, value) {
  await privateDirectory(path.dirname(file));
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, value, { encoding: "utf8", mode: 0o600, flag: "wx" });
    await rename(temporary, file);
    await chmod(file, 0o600).catch(() => {});
  } finally {
    await unlink(temporary).catch(() => {});
  }
}

async function appendTrace(root, trace) {
  try {
    const directory = path.join(root, "traces");
    await privateDirectory(directory);
    const file = path.join(directory, "jev.jsonl");
    await appendFile(file, `${JSON.stringify(trace)}\n`, { encoding: "utf8", mode: 0o600 });
    await chmod(file, 0o600).catch(() => {});
  } catch {
    // Telemetry must never change routing behavior.
  }
}

// Content-free cache telemetry: status and tool only, never queries or fact values.
async function appendCacheTrace(root, entry) {
  try {
    const directory = path.join(root, "traces");
    await privateDirectory(directory);
    const file = path.join(directory, "cache.jsonl");
    await appendFile(file, `${JSON.stringify({ schema: 1, featurekit_version: FEATUREKIT_VERSION, ...entry })}\n`, { encoding: "utf8", mode: 0o600 });
    await chmod(file, 0o600).catch(() => {});
  } catch {
    // Telemetry must never change cache behavior.
  }
}

function routeTrace(request, result, latencyMs) {
  return {
    schema: 1,
    kind: "jev-route",
    featurekit_version: FEATUREKIT_VERSION,
    policy_version: POLICY_VERSION,
    questions_version: QUESTIONS_VERSION,
    task_id: request.task.id,
    operation: request.task.operation,
    status: result.status,
    cache: result.cache,
    request_bytes: Buffer.byteLength(JSON.stringify(request)),
    question_count: Object.keys(QUESTIONS).length,
    model: result.model || null,
    usage: result.usage || { input_tokens: null, output_tokens: null },
    latency_ms: latencyMs,
    route_class: result.route?.class || null,
    reason_codes: result.reason_codes,
  };
}

function unavailable(reason, cache = "miss") {
  return {
    schema: 1,
    status: "unavailable",
    baseline_preserved: true,
    advisory: null,
    gates: { confidence_pass: false, margin_pass: false, risk_floor_applied: false },
    cache,
    usage: { input_tokens: null, output_tokens: null },
    reason_codes: [reason],
  };
}

function validateUsage(usage) {
  if (!isObject(usage)) return { input_tokens: null, output_tokens: null };
  const result = {};
  for (const key of ["input_tokens", "output_tokens"]) {
    const value = usage[key];
    result[key] = Number.isInteger(value) && value >= 0 ? value : null;
  }
  return result;
}

function validateChoiceAnswer(answer, questionId) {
  if (!isObject(answer) || answer.type !== "choice") throw new Error(`invalid answer: ${questionId}`);
  exactKeys(answer, ["type", "choice", "confidence", "probabilities"], `answer.${questionId}`);
  const options = Object.keys(QUESTIONS[questionId].criteria);
  if (!options.includes(answer.choice) || !isObject(answer.probabilities)) throw new Error(`invalid choice: ${questionId}`);
  if (Object.keys(answer.probabilities).length !== options.length || options.some((option) => !(option in answer.probabilities))) throw new Error(`invalid probabilities: ${questionId}`);
  const probabilities = options.map((option) => answer.probabilities[option]);
  if (probabilities.some((value) => typeof value !== "number" || value < 0 || value > 1)) throw new Error(`out-of-range probability: ${questionId}`);
  if (Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) > 0.02) throw new Error(`probabilities do not sum to one: ${questionId}`);
  if (typeof answer.confidence !== "number" || answer.confidence < 0 || answer.confidence > 1) throw new Error(`invalid confidence: ${questionId}`);
  const ranked = [...probabilities].sort((a, b) => b - a);
  return { choice: answer.choice, confidence: answer.confidence, margin: ranked[0] - (ranked[1] || 0) };
}

function validateNoulAnswer(answer, questionId) {
  if (!isObject(answer) || answer.type !== "noul" || typeof answer.noul !== "number" || answer.noul < 0 || answer.noul > 1) {
    throw new Error(`invalid answer: ${questionId}`);
  }
  exactKeys(answer, ["type", "noul"], `answer.${questionId}`);
  return { value: answer.noul, distance: Math.abs(answer.noul - 0.5) };
}

function validateJevResponse(response) {
  if (!isObject(response) || !isObject(response.answers)) throw new Error("invalid Jev response");
  exactKeys(response, ["model", "answers", "usage"], "response");
  if (Object.keys(response.answers).length !== Object.keys(QUESTIONS).length || Object.keys(response.answers).some((id) => !(id in QUESTIONS))) {
    throw new Error("invalid Jev answer set");
  }
  const answers = {};
  for (const [id, question] of Object.entries(QUESTIONS)) {
    answers[id] = question.type === "choice" ? validateChoiceAnswer(response.answers[id], id) : validateNoulAnswer(response.answers[id], id);
  }
  return {
    model: typeof response.model === "string" ? response.model : null,
    answers,
    usage: validateUsage(response.usage),
  };
}

function higherOf(value, floor, order) {
  return order[Math.max(order.indexOf(value), order.indexOf(floor))];
}

function choicePass(answer) {
  return answer.choice !== "unclear" && answer.confidence >= CONFIDENCE_MIN && answer.margin >= MARGIN_MIN;
}

function reconcile(request, response) {
  const answers = response.answers;
  const signals = Object.fromEntries(Object.entries(answers).map(([id, answer]) => [
    id,
    "choice" in answer
      ? { value: answer.choice, confidence: answer.confidence, margin: answer.margin }
      : { value: answer.value, distance: answer.distance },
  ]));
  const requiredIds = ["required_capability", "required_effort"];
  const confidencePass = requiredIds.every((id) => answers[id].confidence >= CONFIDENCE_MIN);
  const marginPass = requiredIds.every((id) => answers[id].margin >= MARGIN_MIN);
  const floorProtectsConsequence = request.policy.capability_floor === "deep" && EFFORTS.indexOf(request.policy.effort_floor) >= EFFORTS.indexOf("high");
  const noulPass = answers.high_consequence_if_wrong.distance >= NOUL_DISTANCE_MIN || floorProtectsConsequence;
  const unclear = requiredIds.some((id) => answers[id].choice === "unclear");
  const available = request.policy.available_capabilities.includes(answers.required_capability.choice);
  const highConsequence = answers.high_consequence_if_wrong.value >= 0.5;

  if (!confidencePass || !marginPass || !noulPass || unclear || !available) {
    return {
      schema: 1,
      status: "hold",
      baseline_preserved: true,
      advisory: null,
      gates: { confidence_pass: confidencePass && noulPass, margin_pass: marginPass, risk_floor_applied: highConsequence },
      cache: "miss",
      model: response.model,
      usage: response.usage,
      signals,
      reason_codes: [!available ? "ROUTE_UNAVAILABLE" : unclear ? "UNCLEAR" : "WEAK_SIGNAL"],
    };
  }

  let capability = higherOf(answers.required_capability.choice, request.policy.capability_floor, CAPABILITIES);
  let effort = higherOf(answers.required_effort.choice, request.policy.effort_floor, EFFORTS);
  let reviewFloor = answers.provisional_review_tier.choice;
  if (highConsequence) {
    capability = "deep";
    effort = higherOf(effort, "high", EFFORTS);
    reviewFloor = "deep-security";
  }
  const referenceMap = {
    need_worker_reference: "worker",
    need_review_reference: "review",
    need_host_reference: "host",
    need_compaction_reference: "compaction",
  };
  const references = Object.entries(referenceMap)
    .filter(([id]) => answers[id].value >= 0.7 || answers[id].distance < NOUL_DISTANCE_MIN)
    .map(([, name]) => name);
  const optionalRoutingAllowed = request.policy.risk_flags.length === 0;
  const taskFamilyPass = choicePass(answers.task_family);
  const executionPass = optionalRoutingAllowed && choicePass(answers.execution_shape);
  const contextPass = optionalRoutingAllowed && choicePass(answers.context_breadth);
  const reviewPass = choicePass(answers.provisional_review_tier) || highConsequence;
  const approvedDimensions = ["capability", "effort"];
  if (taskFamilyPass) approvedDimensions.unshift("task_family");
  if (executionPass) approvedDimensions.push("execution");
  if (contextPass) approvedDimensions.push("context");
  if (reviewPass) approvedDimensions.push("review_floor");

  return {
    schema: 1,
    status: "shadow",
    baseline_preserved: true,
    advisory: {
      task_family: taskFamilyPass ? answers.task_family.choice : null,
      capability,
      effort,
      execution: executionPass ? answers.execution_shape.choice : null,
      context: contextPass ? answers.context_breadth.choice : null,
      review_floor: reviewPass ? reviewFloor : null,
      references,
    },
    approved_dimensions: approvedDimensions,
    gates: { confidence_pass: true, margin_pass: true, risk_floor_applied: highConsequence },
    cache: "miss",
    model: response.model,
    usage: response.usage,
    signals,
    reason_codes: ["SHADOW_ONLY", approvedDimensions.length < 6 ? "PARTIAL_ADVISORY" : "FULL_ADVISORY"],
  };
}

async function callTypeSafe(payload, { apiKey, timeoutMs = 4000 }) {
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const request = https.request(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: timeoutMs,
    }, (response) => {
      const chunks = [];
      let size = 0;
      response.on("data", (chunk) => {
        size += chunk.length;
        if (size > 65536) request.destroy(Object.assign(new Error("response too large"), { code: "RESPONSE_TOO_LARGE" }));
        else chunks.push(chunk);
      });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(Object.assign(new Error("TypeSafe request failed"), { code: `HTTP_${response.statusCode || "UNKNOWN"}` }));
          return;
        }
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch {
          reject(Object.assign(new Error("invalid JSON response"), { code: "MALFORMED_RESPONSE" }));
        }
      });
    });
    request.on("timeout", () => request.destroy(Object.assign(new Error("request timed out"), { code: "TIMEOUT" })));
    request.on("error", reject);
    request.end(body);
  });
}

function errorCode(error) {
  if (typeof error?.code === "string" && /^[A-Z0-9_]+$/.test(error.code)) return error.code;
  if (/invalid|probabilit|confidence|answer|response/i.test(String(error?.message))) return "MALFORMED_RESPONSE";
  return "NETWORK_OR_PROVIDER_ERROR";
}

export async function optimizeRoute(input, options = {}) {
  validateRouteRequest(input);
  const root = scratchRoot(options);
  const routingMode = options.routingMode || process.env.FEATUREKIT_JEV_ROUTING || "off";
  if (!ROUTING_MODES.includes(routingMode)) throw new Error("FEATUREKIT_JEV_ROUTING must be off, shadow, or enforce");
  if (routingMode === "off") return { ...unavailable("ROUTING_OFF", "none"), status: "off" };
  const enforcing = routingMode === "enforce";
  const request = enforcing ? withEnforcedFloor(input) : input;
  const finish = (result) => enforcing ? enforce(request, result) : result;

  const deterministic = deterministicReason(request);
  if (deterministic) {
    const result = { ...unavailable(deterministic, "none"), status: "skipped" };
    if (deterministic === "HARD_RISK_FLOOR") result.gates.risk_floor_applied = true;
    await appendTrace(root, routeTrace(request, result, 0));
    return result;
  }

  const apiKey = options.apiKey !== undefined ? options.apiKey : (process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY || "");
  if (!apiKey.trim()) {
    const result = unavailable("MISSING_API_KEY", "none");
    await appendTrace(root, routeTrace(request, result, 0));
    return result;
  }

  const key = cacheKey(request);
  const cacheFile = path.join(root, "cache", "routes", `${key}.json`);
  try {
    const stored = JSON.parse(await readFile(cacheFile, "utf8"));
    if (stored.schema !== SCHEMA || stored.cache_key !== key || !isObject(stored.result) || stored.result.schema !== SCHEMA || !["shadow", "hold"].includes(stored.result.status) || stored.result.baseline_preserved !== true) {
      throw new SyntaxError("invalid cache entry");
    }
    const cached = stored.result;
    const result = finish({ ...cached, cache: "hit", reason_codes: [...new Set([...(cached.reason_codes || []), "EXACT_CACHE_HIT"])] });
    await appendTrace(root, routeTrace(request, result, 0));
    return result;
  } catch (error) {
    if (error?.code !== "ENOENT" && !(error instanceof SyntaxError)) {
      // A cache permission/read failure is a miss; routing must remain available.
    }
  }

  const started = Date.now();
  try {
    const callJev = options.callJev || callTypeSafe;
    const raw = await callJev({ model: JEV_MODEL, state: { task: request.task, facts: request.facts, policy: request.policy }, questions: QUESTIONS }, {
      apiKey,
      timeoutMs: options.timeoutMs || 4000,
    });
    const advice = reconcile(request, validateJevResponse(raw));
    await atomicWrite(cacheFile, `${JSON.stringify({ schema: SCHEMA, cache_key: key, result: advice })}\n`);
    const result = finish(advice);
    await appendTrace(root, routeTrace(request, result, Date.now() - started));
    return result;
  } catch (error) {
    const result = unavailable(errorCode(error));
    await appendTrace(root, routeTrace(request, result, Date.now() - started));
    return result;
  }
}

// Small-diff rules are measured from the diff; a caller's own "trivial" label is not trusted.
// Only small docs-only changes skip model review; a small code change still gets the cheapest review,
// because a passing check says nothing about new untested behavior (seeded-defect benchmark, 2026-09-25).
const TRIVIAL_MAX_LINES = 20;
const TRIVIAL_MAX_FILES = 2;
const DOC_EXTENSIONS = new Set([".md", ".mdx", ".markdown", ".txt", ".rst", ".adoc"]);

function scratchExclude(top, root) {
  // Compare real paths: git reports resolved paths while temp or home paths may be symlinks.
  let existing = root;
  const missing = [];
  while (existing !== path.dirname(existing)) {
    try { existing = realpathSync(existing); break; } catch { missing.unshift(path.basename(existing)); existing = path.dirname(existing); }
  }
  const scratch = path.relative(top, path.join(existing, ...missing));
  return scratch && !scratch.startsWith("..") && !path.isAbsolute(scratch) ? [`:(exclude)${scratch}`] : [];
}

// Counts changed files, lines, non-docs files, and new/deleted files locally; no content leaves the machine.
function measureDiff(repo, base, root) {
  if (!/^[A-Za-z0-9._\/@{}~^][A-Za-z0-9._\/@{}~^-]*$/.test(base)) throw new Error("change.base must be a plain git revision");
  const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 256 << 20, stdio: ["ignore", "pipe", "ignore"] });
  const top = git("rev-parse", "--show-toplevel").trim();
  const commit = git("rev-parse", "--verify", "--end-of-options", `${base}^{commit}`).trim();
  const exclude = scratchExclude(top, root);
  const stats = { files: 0, lines: 0, code_files: 0, new_or_deleted: 0 };
  const count = (file) => {
    stats.files += 1;
    if (!DOC_EXTENSIONS.has(path.extname(file).toLowerCase())) stats.code_files += 1;
  };
  for (const line of git("diff", "--numstat", commit, "--", ".", ...exclude).split("\n").filter(Boolean)) {
    const [added, deleted, file] = line.split("\t");
    count(file);
    if (added !== "-" && deleted !== "-") stats.lines += Number(added) + Number(deleted);
  }
  for (const line of git("diff", "--name-status", "--no-renames", commit, "--", ".", ...exclude).split("\n").filter(Boolean)) {
    if (/^[AD]/.test(line)) stats.new_or_deleted += 1;
  }
  for (const file of git("ls-files", "-o", "--exclude-standard", "-z", "--", ".", ...exclude).split("\0").filter(Boolean)) {
    count(file);
    stats.new_or_deleted += 1;
  }
  return stats;
}

export function selectReviewTier(request, options = {}) {
  exactKeys(request, ["schema", "mode", "action", "change", "route"], "request");
  if (request.schema !== SCHEMA || request.mode !== "review" || request.action !== "select") throw new Error("unsupported review request");
  exactKeys(request.change, ["repo", "base", "stable_diff", "verification", "risk_flags"], "change");
  boundedString(request.change.repo, "change.repo", 1024);
  boundedString(request.change.base, "change.base", 128);
  if (typeof request.change.stable_diff !== "boolean") throw new Error("change.stable_diff must be boolean");
  enumValue(request.change.verification, ["passed", "missing", "failed"], "change.verification");
  stringArray(request.change.risk_flags, "change.risk_flags", { maxItems: RISK_FLAGS.size, maxLength: 32 });
  if (new Set(request.change.risk_flags).size !== request.change.risk_flags.length || request.change.risk_flags.some((flag) => !RISK_FLAGS.has(flag))) throw new Error("change.risk_flags contains an unknown or duplicate flag");
  exactKeys(request.route, ["status", "capability", "effort"], "route");
  enumValue(request.route.status, ["enforced", "shadow", "hold", "unavailable", "off", "skipped"], "route.status");
  if (request.route.capability !== null) enumValue(request.route.capability, CAPABILITIES, "route.capability");
  if (request.route.effort !== null) enumValue(request.route.effort, EFFORTS, "route.effort");

  const routingMode = options.routingMode || process.env.FEATUREKIT_JEV_ROUTING || "off";
  if (!ROUTING_MODES.includes(routingMode)) throw new Error("FEATUREKIT_JEV_ROUTING must be off, shadow, or enforce");
  if (routingMode === "off") return { schema: SCHEMA, status: "off", baseline_preserved: true, tier: null, reviewer: null, diff: null, reason_codes: ["ROUTING_OFF"] };

  const { change, route } = request;
  const diff = measureDiff(change.repo, change.base, scratchRoot(options));
  const status = routingMode === "enforce" ? "enforced" : "shadow";
  const baseline = { source: "baseline", capability: null, effort: null };
  const result = (tier, reviewer, reason) => ({ schema: SCHEMA, status, baseline_preserved: status !== "enforced", tier, reviewer, diff, reason_codes: [reason] });
  if (change.risk_flags.some((flag) => HARD_RISKS.has(flag))) return result("deep-security", null, "HARD_RISK_FLOOR");
  if (!change.stable_diff) return result("general", baseline, "UNSTABLE_DIFF");
  if (change.verification !== "passed") return result("general", baseline, "VERIFICATION_REQUIRED");
  if (change.risk_flags.length) return result("general", baseline, "RISK_FLAG_FLOOR");
  const small = diff.lines <= TRIVIAL_MAX_LINES && diff.files <= TRIVIAL_MAX_FILES && diff.new_or_deleted === 0;
  if (small && diff.code_files === 0) return result("deterministic", null, "SMALL_DOCS_RULE");
  if (small) return result("general", { source: "small-diff", capability: "routine", effort: "low" }, "SMALL_CODE_CHEAPEST_REVIEW");
  // Metadata-only JEV never clears a nontrivial diff; a confident route only sets the reviewer's level.
  if (["enforced", "shadow"].includes(route.status) && route.capability && route.effort) {
    return result("general", { source: "routed", capability: route.capability, effort: route.effort }, "ROUTED_REVIEWER");
  }
  return result("general", baseline, "WEAK_OR_UNAVAILABLE_SIGNAL");
}

// A pruned packet must save enough to be worth a narrower view; otherwise the caller sends the unpruned packet.
const PRUNE_MIN_RATIO = 0.2;
const PRUNE_MIN_CHARS = 200;

export function pruneContext(request) {
  exactKeys(request, ["schema", "mode", "action", "entries"], "request");
  if (request.schema !== SCHEMA || request.mode !== "prune" || request.action !== "deterministic") throw new Error("unsupported prune request");
  if (!Array.isArray(request.entries) || request.entries.length > 256) throw new Error("entries must be a bounded array");
  const pairs = new Map();
  for (const [index, entry] of request.entries.entries()) {
    exactKeys(entry, "chars" in entry ? ["id", "kind", "state", "pinned", "content_hash", "ref", "pair_id", "chars"] : ["id", "kind", "state", "pinned", "content_hash", "ref", "pair_id"], `entries[${index}]`);
    if ("chars" in entry) integer(entry.chars, `entries[${index}].chars`, 0, 10000000);
    validateTaskId(entry.id);
    if (!CONTEXT_KINDS.has(entry.kind)) throw new Error(`invalid context kind: ${entry.kind}`);
    enumValue(entry.state, ["current", "resolved", "superseded"], `entries[${index}].state`);
    if (typeof entry.pinned !== "boolean") throw new Error(`entries[${index}].pinned must be boolean`);
    if (typeof entry.content_hash !== "string" || !/^[a-f0-9]{64}$/.test(entry.content_hash)) throw new Error(`entries[${index}].content_hash must be a sha256 digest`);
    if (entry.ref !== null) boundedString(entry.ref, `entries[${index}].ref`, 512);
    if (entry.pair_id !== null) validateTaskId(entry.pair_id);
    const pairedKind = entry.kind === "tool-action" || entry.kind === "tool-result";
    if (pairedKind !== (entry.pair_id !== null)) throw new Error("tool action/result entries require pair_id, and other entries forbid it");
    if (entry.pair_id !== null) pairs.set(entry.pair_id, [...(pairs.get(entry.pair_id) || []), entry]);
  }
  if (new Set(request.entries.map((entry) => entry.id)).size !== request.entries.length) throw new Error("entry ids must be unique");
  for (const [pairId, pair] of pairs) {
    if (pair.length !== 2 || new Set(pair.map((entry) => entry.kind)).size !== 2) throw new Error(`pair ${pairId} must contain one tool-action and one tool-result`);
  }

  const pairReasons = new Map([...pairs].map(([pairId, pair]) => [
    pairId,
    pair.every((entry) => !entry.pinned && entry.state !== "current" && entry.ref !== null) ? "RECOVERABLE_PAIR" : null,
  ]));
  const seenHashes = new Set();
  const keepIds = [];
  const dropped = [];
  for (const entry of request.entries) {
    let reason = entry.pair_id === null ? null : pairReasons.get(entry.pair_id);
    if (entry.pair_id === null && !entry.pinned) {
      if (entry.state === "superseded") reason = "SUPERSEDED";
      else if (entry.kind === "progress" && entry.state === "resolved") reason = "RESOLVED_PROGRESS";
      else if (entry.kind === "diagnostic" && entry.state === "resolved" && entry.ref !== null) reason = "RESOLVED_DIAGNOSTIC";
      else if (RECOVERABLE_KINDS.has(entry.kind) && entry.ref !== null) reason = "RECOVERABLE_REFERENCE";
      else if (seenHashes.has(entry.content_hash)) reason = "DUPLICATE";
    }
    if (reason) dropped.push({ id: entry.id, reason, ...(entry.ref === null ? {} : { ref: entry.ref }) });
    else {
      keepIds.push(entry.id);
      seenHashes.add(entry.content_hash);
    }
  }
  // Sizes are optional local counts; a partly measured packet falls back to entry counts.
  const measured = request.entries.length > 0 && request.entries.every((entry) => "chars" in entry);
  const kept = new Set(keepIds);
  const inputChars = measured ? request.entries.reduce((sum, entry) => sum + entry.chars, 0) : null;
  const keptChars = measured ? request.entries.filter((entry) => kept.has(entry.id)).reduce((sum, entry) => sum + entry.chars, 0) : null;
  const usePruned = measured
    ? inputChars - keptChars >= Math.max(PRUNE_MIN_CHARS, PRUNE_MIN_RATIO * inputChars)
    : request.entries.length - keepIds.length >= Math.max(1, PRUNE_MIN_RATIO * request.entries.length);
  return { schema: SCHEMA, status: "pruned", keep_ids: keepIds, dropped, input_count: request.entries.length, kept_count: keepIds.length, input_chars: inputChars, kept_chars: keptChars, use_pruned: usePruned };
}

function validateTaskId(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value)) throw new Error("invalid task_id");
}

function boundedJson(value, name = "capsule", depth = 0) {
  if (depth > 8) throw new Error(`${name} is nested too deeply`);
  if (typeof value === "string") return boundedString(value, name, 2048, true);
  if (value === null || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return;
  if (Array.isArray(value)) {
    if (value.length > 128) throw new Error(`${name} has too many entries`);
    value.forEach((item, index) => boundedJson(item, `${name}[${index}]`, depth + 1));
    return;
  }
  if (!isObject(value) || Object.keys(value).length > 64) throw new Error(`${name} must be bounded JSON`);
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_CAPSULE_KEYS.has(key.toLowerCase())) throw new Error(`forbidden capsule field: ${key}`);
    boundedString(key, `${name} key`, 64);
    boundedJson(item, `${name}.${key}`, depth + 1);
  }
}

function validateSnapshot(snapshot) {
  exactKeys(snapshot, ["repo", "head", "dirty_digest", "artifact_hashes"], "snapshot");
  boundedString(snapshot.repo, "snapshot.repo", 512);
  boundedString(snapshot.head, "snapshot.head", 128);
  boundedString(snapshot.dirty_digest, "snapshot.dirty_digest", 128);
  if (!isObject(snapshot.artifact_hashes)) throw new Error("snapshot.artifact_hashes must be an object");
  boundedJson(snapshot.artifact_hashes, "snapshot.artifact_hashes");
}

function validateReceiptIdentity(identity) {
  exactKeys(identity, ["snapshot", "query_hash", "tool", "contract_version", "index_head", "relevant_hashes"], "identity");
  validateSnapshot(identity.snapshot);
  if (typeof identity.query_hash !== "string" || !/^[a-f0-9]{64}$/.test(identity.query_hash)) throw new Error("identity.query_hash must be a sha256 digest");
  enumValue(identity.tool, RECEIPT_TOOLS, "identity.tool");
  integer(identity.contract_version, "identity.contract_version", 1, 1000000);
  if (identity.index_head !== null) boundedString(identity.index_head, "identity.index_head", 128);
  if (identity.tool === "repowise" ? identity.index_head === null : identity.index_head !== null) throw new Error("identity.index_head must be set only for repowise");
  if (!isObject(identity.relevant_hashes) || Object.keys(identity.relevant_hashes).length < 1 || Object.keys(identity.relevant_hashes).length > 128) throw new Error("identity.relevant_hashes must be a non-empty bounded object");
  for (const [sourcePath, hash] of Object.entries(identity.relevant_hashes)) {
    boundedString(sourcePath, "identity.relevant_hashes path", 512);
    if (typeof hash !== "string" || !/^[a-f0-9]{64}$/.test(hash)) throw new Error("identity.relevant_hashes values must be sha256 digests");
  }
}

function relativeRepoPath(value, name) {
  boundedString(value, name, 512);
  const normalized = path.normalize(value);
  if (path.isAbsolute(normalized) || normalized === ".." || normalized.startsWith(`..${path.sep}`)) throw new Error(`${name} must be a path inside the repository`);
  return normalized;
}

// Derives the exact receipt identity locally from git state and file hashes; nothing leaves the machine.
function identityFromKey(key, root) {
  exactKeys(key, ["repo", "query", "tool", "contract_version", "index_head", "paths"], "key");
  boundedString(key.repo, "key.repo", 1024);
  boundedString(key.query, "key.query", 1024);
  if (!Array.isArray(key.paths) || key.paths.length < 1 || key.paths.length > 128) throw new Error("key.paths must be a non-empty bounded array");
  const paths = key.paths.map((item, index) => relativeRepoPath(item, `key.paths[${index}]`));
  const git = (...args) => execFileSync("git", ["-C", key.repo, ...args], { encoding: "buffer", maxBuffer: 256 << 20, stdio: ["ignore", "pipe", "ignore"] });
  const top = git("rev-parse", "--show-toplevel").toString().trim();
  let head = "unborn";
  try { head = git("rev-parse", "HEAD").toString().trim(); } catch { /* repository without commits */ }
  const exclude = scratchExclude(top, root);
  const dirty = createHash("sha256");
  if (head !== "unborn") dirty.update(git("diff", "HEAD", "--binary", "--", ".", ...exclude));
  for (const file of git("ls-files", "-o", "--exclude-standard", "-z", "--", ".", ...exclude).toString().split("\0").filter(Boolean).sort()) {
    dirty.update(file);
    try { dirty.update(readFileSync(path.join(top, file))); } catch { dirty.update("unreadable"); }
  }
  const relevant = {};
  for (const item of paths) {
    try { relevant[item] = createHash("sha256").update(readFileSync(path.join(top, item))).digest("hex"); } catch { relevant[item] = digest(`missing:${item}`); }
  }
  const identity = {
    snapshot: { repo: top, head, dirty_digest: dirty.digest("hex"), artifact_hashes: {} },
    query_hash: digest(key.query),
    tool: key.tool,
    contract_version: key.contract_version,
    index_head: key.index_head,
    relevant_hashes: relevant,
  };
  validateReceiptIdentity(identity);
  return identity;
}

function receiptIdentity(request, fields, root) {
  if ("identity" in request && "key" in request) throw new Error("receipt request needs exactly one of identity or key");
  exactKeys(request, "key" in request ? [...fields, "key"] : [...fields, "identity"], "request");
  if ("key" in request) return identityFromKey(request.key, root);
  validateReceiptIdentity(request.identity);
  return request.identity;
}

function validateReceiptFact(fact) {
  exactKeys(fact, ["id", "value", "ref"], "fact");
  validateTaskId(fact.id);
  boundedString(fact.value, "fact.value", 1024);
  boundedString(fact.ref, "fact.ref", 512);
}

function receiptKey(identity) {
  return digest({ featurekit: FEATUREKIT_VERSION, policy: POLICY_VERSION, receipt: RECEIPT_VERSION, identity });
}

function staleReceiptReason(identity) {
  return identity.tool === "repowise" && identity.index_head !== identity.snapshot.head ? "INDEX_BEHIND" : null;
}

function receiptFile(root, taskId, key) {
  return path.join(root, "tasks", taskId, "receipts", `${key}.json`);
}

export async function writeReceipt(request, options = {}) {
  const root = scratchRoot(options);
  const identity = receiptIdentity(request, ["schema", "mode", "action", "task_id", "fact"], root);
  if (request.schema !== SCHEMA || request.mode !== "receipt" || request.action !== "write") throw new Error("unsupported receipt write request");
  validateTaskId(request.task_id);
  validateReceiptFact(request.fact);
  const stale = staleReceiptReason(identity);
  if (stale) {
    await appendCacheTrace(root, { kind: "receipt", task_id: request.task_id, tool: identity.tool, status: "stale", reason_codes: [stale] });
    return { schema: SCHEMA, status: "stale", cache: "none", task_id: request.task_id, reason_codes: [stale] };
  }
  const key = receiptKey(identity);
  const payload = { schema: SCHEMA, receipt_version: RECEIPT_VERSION, task_id: request.task_id, cache_key: key, identity, fact: request.fact, created_at: new Date().toISOString() };
  const stored = { ...payload, hash: digest(payload) };
  const file = receiptFile(root, request.task_id, key);
  await atomicWrite(file, `${JSON.stringify(stored, null, 2)}\n`);
  await appendCacheTrace(root, { kind: "receipt", task_id: request.task_id, tool: identity.tool, status: "written", reason_codes: [] });
  return { schema: SCHEMA, status: "written", cache: "miss", task_id: request.task_id, path: file, hash: stored.hash };
}

export async function readReceipt(request, options = {}) {
  const root = scratchRoot(options);
  const identity = receiptIdentity(request, ["schema", "mode", "action", "task_id"], root);
  if (request.schema !== SCHEMA || request.mode !== "receipt" || request.action !== "read") throw new Error("unsupported receipt read request");
  validateTaskId(request.task_id);
  const trace = (status, reasonCodes = []) => appendCacheTrace(root, { kind: "receipt", task_id: request.task_id, tool: identity.tool, status, reason_codes: reasonCodes });
  const stale = staleReceiptReason(identity);
  if (stale) {
    await trace("stale", [stale]);
    return { schema: SCHEMA, status: "stale", cache: "none", task_id: request.task_id, reason_codes: [stale] };
  }
  const key = receiptKey(identity);
  const file = receiptFile(root, request.task_id, key);
  try {
    const stored = JSON.parse(await readFile(file, "utf8"));
    const payload = { schema: stored.schema, receipt_version: stored.receipt_version, task_id: stored.task_id, cache_key: stored.cache_key, identity: stored.identity, fact: stored.fact, created_at: stored.created_at };
    if (stored.schema !== SCHEMA || stored.receipt_version !== RECEIPT_VERSION || stored.task_id !== request.task_id || stored.cache_key !== key || stableStringify(stored.identity) !== stableStringify(identity) || stored.hash !== digest(payload)) throw new Error("corrupt receipt");
    validateReceiptFact(stored.fact);
    await trace("hit");
    return { schema: SCHEMA, status: "hit", cache: "hit", task_id: request.task_id, fact: stored.fact, created_at: stored.created_at, path: file };
  } catch (error) {
    const reason = error?.code === "ENOENT" ? "RECEIPT_MISSING" : "RECEIPT_CORRUPT";
    await trace("miss", [reason]);
    return { schema: SCHEMA, status: "miss", cache: "miss", task_id: request.task_id, reason_codes: [reason] };
  }
}

function validateHost(host) {
  exactKeys(host, ["name", "version"], "host");
  boundedString(host.name, "host.name", 64);
  boundedString(host.version, "host.version", 64);
}

function catalogueFile(root, host) {
  return path.join(root, "cache", "catalogue", `${digest({ featurekit: FEATUREKIT_VERSION, host })}.json`);
}

// Caches the host's runtime model list so the harness need not rediscover it every session; model ids are not secrets.
export async function writeCatalogue(request, options = {}) {
  exactKeys(request, ["schema", "mode", "action", "host", "models"], "request");
  if (request.schema !== SCHEMA || request.mode !== "catalogue" || request.action !== "write") throw new Error("unsupported catalogue write request");
  validateHost(request.host);
  if (!Array.isArray(request.models) || request.models.length < 1 || request.models.length > 64) throw new Error("models must be a non-empty bounded array");
  request.models.forEach((model, index) => {
    exactKeys(model, ["id", "efforts"], `models[${index}]`);
    boundedString(model.id, `models[${index}].id`, 128);
    stringArray(model.efforts, `models[${index}].efforts`, { maxItems: 8, maxLength: 32 });
  });
  const root = scratchRoot(options);
  const file = catalogueFile(root, request.host);
  await atomicWrite(file, `${JSON.stringify({ schema: SCHEMA, host: request.host, models: request.models, written_ms: options.now ?? Date.now() })}\n`);
  await appendCacheTrace(root, { kind: "catalogue", tool: "catalogue", status: "written", reason_codes: [] });
  return { schema: SCHEMA, status: "written", host: request.host, path: file };
}

export async function readCatalogue(request, options = {}) {
  exactKeys(request, ["schema", "mode", "action", "host"], "request");
  if (request.schema !== SCHEMA || request.mode !== "catalogue" || request.action !== "read") throw new Error("unsupported catalogue read request");
  validateHost(request.host);
  const root = scratchRoot(options);
  const trace = (status, reasonCodes = []) => appendCacheTrace(root, { kind: "catalogue", tool: "catalogue", status, reason_codes: reasonCodes });
  let stored;
  try {
    stored = JSON.parse(await readFile(catalogueFile(root, request.host), "utf8"));
    if (stored.schema !== SCHEMA || stableStringify(stored.host) !== stableStringify(request.host) || !Array.isArray(stored.models) || !Number.isFinite(stored.written_ms)) throw new Error("corrupt catalogue");
  } catch (error) {
    const reason = error?.code === "ENOENT" ? "CATALOGUE_MISSING" : "CATALOGUE_CORRUPT";
    await trace("miss", [reason]);
    return { schema: SCHEMA, status: "miss", host: request.host, reason_codes: [reason] };
  }
  const age = (options.now ?? Date.now()) - stored.written_ms;
  if (age < 0 || age > CATALOGUE_MAX_AGE_MS) {
    await trace("stale", ["CATALOGUE_EXPIRED"]);
    return { schema: SCHEMA, status: "stale", host: request.host, reason_codes: ["CATALOGUE_EXPIRED"] };
  }
  await trace("hit");
  return { schema: SCHEMA, status: "hit", host: request.host, models: stored.models, age_s: Math.round(age / 1000) };
}

export async function cacheStats(request, options = {}) {
  exactKeys(request, ["schema", "mode", "action"], "request");
  if (request.schema !== SCHEMA || request.mode !== "cache" || request.action !== "stats") throw new Error("unsupported cache stats request");
  const root = scratchRoot(options);
  const lines = async (name) => (await readFile(path.join(root, "traces", name), "utf8").catch(() => "")).split("\n").filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
  const blank = () => ({ hit: 0, miss: 0, stale: 0, written: 0 });
  const stats = { schema: SCHEMA, receipt: blank(), catalogue: blank(), route: { hit: 0, miss: 0 }, eliminated_calls: {} };
  const eliminate = (name) => { stats.eliminated_calls[name] = (stats.eliminated_calls[name] || 0) + 1; };
  for (const entry of await lines("cache.jsonl")) {
    if (!(entry.kind in stats) || !(entry.status in stats[entry.kind])) continue;
    stats[entry.kind][entry.status] += 1;
    if (entry.status === "hit") eliminate(entry.tool);
  }
  for (const entry of await lines("jev.jsonl")) {
    if (entry.cache === "hit") { stats.route.hit += 1; eliminate("jev"); }
    else if (entry.cache === "miss") stats.route.miss += 1;
  }
  return stats;
}

function validateCapsule(capsule) {
  exactKeys(capsule, ["featurekit_version", "policy_version", "snapshot", "authority", "requirements", "risk", "route", "work", "failures", "evidence", "review", "decisions"], "capsule");
  boundedString(capsule.featurekit_version, "capsule.featurekit_version", 32);
  integer(capsule.policy_version, "capsule.policy_version", 1, 100000);
  validateSnapshot(capsule.snapshot);
  for (const key of ["authority", "requirements", "risk", "route", "work", "review"]) {
    if (!isObject(capsule[key])) throw new Error(`capsule.${key} must be an object`);
  }
  for (const key of ["failures", "evidence", "decisions"]) {
    if (!Array.isArray(capsule[key])) throw new Error(`capsule.${key} must be an array`);
  }
  boundedJson(capsule);
  if (Buffer.byteLength(JSON.stringify(capsule)) > MAX_CAPSULE_BYTES) throw new Error(`capsule exceeds ${MAX_CAPSULE_BYTES} bytes`);
}

function capsuleFile(root, taskId) {
  return path.join(root, "tasks", taskId, "capsule.json");
}

export async function readCapsule(root, taskId) {
  const stored = JSON.parse(await readFile(capsuleFile(root, taskId), "utf8"));
  if (stored.schema !== SCHEMA || stored.task_id !== taskId || !Number.isInteger(stored.revision) || stored.hash !== digest({ schema: stored.schema, task_id: stored.task_id, revision: stored.revision, capsule: stored.capsule })) {
    throw new Error("corrupt capsule");
  }
  validateCapsule(stored.capsule);
  return stored;
}

export async function findSingleCapsule(root, predicate = () => true) {
  const entries = await readdir(path.join(root, "tasks"), { withFileTypes: true }).catch(() => []);
  const matches = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    try {
      const stored = await readCapsule(root, entry.name);
      if (predicate(stored)) matches.push(stored);
    } catch {
      // Ignore stale, corrupt, and unrelated task directories.
    }
  }
  return matches.length === 1 ? matches[0] : null;
}

export async function writeCapsule(request, options = {}) {
  exactKeys(request, ["schema", "mode", "action", "task_id", "expected_revision", "capsule"], "request");
  if (request.schema !== SCHEMA || request.mode !== "capsule" || request.action !== "write") throw new Error("unsupported capsule write request");
  validateTaskId(request.task_id);
  integer(request.expected_revision, "expected_revision", 0, 1000000);
  validateCapsule(request.capsule);
  const root = scratchRoot(options);
  let currentRevision = 0;
  try {
    currentRevision = (await readCapsule(root, request.task_id)).revision;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  if (request.expected_revision !== currentRevision) throw new Error(`revision conflict: expected ${request.expected_revision}, current ${currentRevision}`);
  const payload = { schema: SCHEMA, task_id: request.task_id, revision: currentRevision + 1, capsule: request.capsule };
  const stored = { ...payload, hash: digest(payload) };
  const file = capsuleFile(root, request.task_id);
  await atomicWrite(file, `${JSON.stringify(stored, null, 2)}\n`);
  return { schema: SCHEMA, status: "written", task_id: request.task_id, revision: stored.revision, path: file, hash: stored.hash };
}

function projectionState(capsule, consumer, jobId) {
  if (consumer === "primary") {
    return { authority: capsule.authority, requirements: capsule.requirements, risk: capsule.risk, route: capsule.route, work: capsule.work, failures: capsule.failures, evidence: capsule.evidence, review: capsule.review };
  }
  if (consumer === "worker") {
    const jobs = Array.isArray(capsule.work.jobs) && jobId ? capsule.work.jobs.filter((job) => isObject(job) && job.id === jobId) : capsule.work.jobs;
    return { authority: capsule.authority, requirements: capsule.requirements, risk: capsule.risk, route: capsule.route, work: { ...capsule.work, jobs }, failures: capsule.failures };
  }
  if (consumer === "reviewer") {
    return { snapshot: capsule.snapshot, requirements: capsule.requirements, risk: capsule.risk, evidence: capsule.evidence, review: capsule.review, changed_paths: capsule.work.changed_paths || [] };
  }
  if (consumer === "escalation") {
    return { snapshot: capsule.snapshot, authority: capsule.authority, requirements: capsule.requirements, risk: capsule.risk, route: capsule.route, changed_paths: capsule.work.changed_paths || [], failures: capsule.failures, evidence: capsule.evidence };
  }
  return { snapshot: capsule.snapshot, authority: capsule.authority, requirements: capsule.requirements, risk: capsule.risk, work: capsule.work, failures: capsule.failures, evidence: capsule.evidence, review: capsule.review, decisions: capsule.decisions };
}

export async function projectCapsule(request, options = {}) {
  const allowed = ["schema", "mode", "action", "task_id", "consumer", "expected_snapshot"];
  if ("job_id" in request) allowed.push("job_id");
  exactKeys(request, allowed, "request");
  if (request.schema !== SCHEMA || request.mode !== "capsule" || request.action !== "project") throw new Error("unsupported capsule projection request");
  validateTaskId(request.task_id);
  enumValue(request.consumer, ["primary", "worker", "reviewer", "escalation", "handoff"], "consumer");
  validateSnapshot(request.expected_snapshot);
  if (request.consumer === "worker" && request.job_id === undefined) throw new Error("worker projection requires job_id");
  if (request.job_id !== undefined) validateTaskId(request.job_id);
  const root = scratchRoot(options);
  let stored;
  try {
    stored = await readCapsule(root, request.task_id);
  } catch (error) {
    return { schema: SCHEMA, status: "unavailable", task_id: request.task_id, reason_codes: [error?.code === "ENOENT" ? "CAPSULE_MISSING" : "CAPSULE_CORRUPT"] };
  }
  if (stableStringify(request.expected_snapshot) !== stableStringify(stored.capsule.snapshot)) {
    return { schema: SCHEMA, status: "stale", task_id: request.task_id, revision: stored.revision, reason_codes: ["SNAPSHOT_MISMATCH"] };
  }
  const projection = {
    schema: SCHEMA,
    task_id: request.task_id,
    revision: stored.revision,
    consumer: request.consumer,
    snapshot: stored.capsule.snapshot,
    state: projectionState(stored.capsule, request.consumer, request.job_id),
  };
  const suffix = request.job_id ? `-${request.job_id}` : "";
  const file = path.join(root, "tasks", request.task_id, "projections", `${request.consumer}${suffix}.json`);
  await atomicWrite(file, `${JSON.stringify(projection, null, 2)}\n`);
  return { schema: SCHEMA, status: "projected", task_id: request.task_id, revision: stored.revision, consumer: request.consumer, path: file, hash: digest(projection) };
}

function validateSetting(value, name) {
  exactKeys(value, ["model", "effort"], name);
  if (value.model !== null) boundedString(value.model, `${name}.model`, 128);
  if (value.effort !== null) boundedString(value.effort, `${name}.effort`, 32);
}

// Adds a failure to an existing capsule so escalation projections carry it; a missing or unreadable capsule is skipped.
async function appendCapsuleFailure(root, taskId, failure) {
  let stored;
  try {
    stored = await readCapsule(root, taskId);
  } catch {
    return null;
  }
  const written = await writeCapsule({
    schema: SCHEMA, mode: "capsule", action: "write", task_id: taskId, expected_revision: stored.revision,
    capsule: { ...stored.capsule, failures: [...stored.capsule.failures, failure] },
  }, { scratchRoot: root });
  return written.revision;
}

export async function recordAttempt(request, options = {}) {
  exactKeys(request, ["schema", "mode", "action", "task_id", "attempt"], "request");
  if (request.schema !== SCHEMA || request.mode !== "attempt" || request.action !== "record") throw new Error("unsupported attempt request");
  validateTaskId(request.task_id);
  const { attempt } = request;
  exactKeys(attempt, ["route", "route_class", "requested", "runtime", "outcome", "evidence_ref", "failure"], "attempt");
  enumValue(attempt.route, ["routed", "baseline"], "attempt.route");
  if (attempt.route === "routed" ? !ROUTE_CLASS.test(attempt.route_class || "") : attempt.route_class !== null) throw new Error("attempt.route_class must name the enforced route only for a routed attempt");
  validateSetting(attempt.requested, "attempt.requested");
  validateSetting(attempt.runtime, "attempt.runtime");
  enumValue(attempt.outcome, ["passed", "failed"], "attempt.outcome");
  boundedString(attempt.evidence_ref, "attempt.evidence_ref", 512);
  // A failure packet lets the next attempt fix the failure instead of repeating discovery; it holds a summary and paths, never source or diffs.
  if (attempt.outcome === "passed") {
    if (attempt.failure !== null) throw new Error("attempt.failure must be null for a passed attempt");
  } else {
    if (!isObject(attempt.failure)) throw new Error("attempt.failure is required for a failed attempt");
    exactKeys(attempt.failure, ["summary", "changed_paths"], "attempt.failure");
    boundedString(attempt.failure.summary, "attempt.failure.summary", 512);
    if (!Array.isArray(attempt.failure.changed_paths) || attempt.failure.changed_paths.length > 64) throw new Error("attempt.failure.changed_paths must be a bounded array");
    attempt.failure.changed_paths.forEach((item, index) => relativeRepoPath(item, `attempt.failure.changed_paths[${index}]`));
  }

  const file = path.join(scratchRoot(options), "tasks", request.task_id, "attempts.json");
  let ledger = { schema: SCHEMA, task_id: request.task_id, attempts: [], escalations: {} };
  try {
    ledger = JSON.parse(await readFile(file, "utf8"));
    if (ledger.schema !== SCHEMA || ledger.task_id !== request.task_id || !Array.isArray(ledger.attempts) || !isObject(ledger.escalations)) throw new Error("corrupt attempt ledger");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  // A routed attempt may only open the task; its failure escalates once to baseline and is counted against the routed class.
  if (attempt.route === "routed" && ledger.attempts.length) throw new Error("a routed attempt must be the first attempt; escalate to baseline instead");
  const previous = ledger.attempts.at(-1);
  if (previous?.route === "routed" && previous.outcome === "failed") {
    ledger.escalations[previous.route_class] = (ledger.escalations[previous.route_class] || 0) + 1;
  }
  ledger.attempts.push({ ...attempt, recorded_at: new Date().toISOString() });
  await atomicWrite(file, `${JSON.stringify(ledger, null, 2)}\n`);
  const next = attempt.outcome === "passed" ? "validate" : attempt.route === "routed" ? "escalate-baseline" : "baseline-recovery";
  const capsuleRevision = attempt.failure ? await appendCapsuleFailure(scratchRoot(options), request.task_id, {
    kind: "attempt-failure", attempt: ledger.attempts.length, route: attempt.route, route_class: attempt.route_class,
    summary: attempt.failure.summary, evidence_ref: attempt.evidence_ref, changed_paths: attempt.failure.changed_paths,
  }) : null;
  const escalation = next === "escalate-baseline"
    ? { route_class: attempt.route_class, requested: attempt.requested, failure: attempt.failure, evidence_ref: attempt.evidence_ref, continue_from: "failed-attempt-tree" }
    : null;
  return { schema: SCHEMA, status: "recorded", task_id: request.task_id, attempts: ledger.attempts.length, escalations: ledger.escalations, next, escalation, capsule_revision: capsuleRevision, path: file };
}

async function readStdin() {
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 65536) throw new Error("input exceeds 65536 bytes");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  if (process.argv.includes("--help")) {
    process.stdout.write("Read one schema-1 route, review, prune, capsule, receipt, catalogue, cache-stats, or attempt request from stdin; write one JSON result to stdout.\n");
    return;
  }
  try {
    const request = JSON.parse(await readStdin());
    let result;
    if (request?.mode === "route") result = await optimizeRoute(request);
    else if (request?.mode === "capsule" && request?.action === "write") result = await writeCapsule(request);
    else if (request?.mode === "capsule" && request?.action === "project") result = await projectCapsule(request);
    else if (request?.mode === "review" && request?.action === "select") result = selectReviewTier(request);
    else if (request?.mode === "prune" && request?.action === "deterministic") result = pruneContext(request);
    else if (request?.mode === "receipt" && request?.action === "write") result = await writeReceipt(request);
    else if (request?.mode === "receipt" && request?.action === "read") result = await readReceipt(request);
    else if (request?.mode === "attempt" && request?.action === "record") result = await recordAttempt(request);
    else if (request?.mode === "catalogue" && request?.action === "write") result = await writeCatalogue(request);
    else if (request?.mode === "catalogue" && request?.action === "read") result = await readCatalogue(request);
    else if (request?.mode === "cache" && request?.action === "stats") result = await cacheStats(request);
    else throw new Error("unsupported request mode/action");
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.exitCode = 2;
    process.stdout.write(`${JSON.stringify({ schema: SCHEMA, status: "invalid", error_code: "INVALID_INPUT", message: String(error?.message || "invalid input") })}\n`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
