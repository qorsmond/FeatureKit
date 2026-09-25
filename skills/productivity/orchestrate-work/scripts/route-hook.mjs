import path from "node:path";
import { fileURLToPath } from "node:url";

import { findSingleCapsule, optimizeRoute } from "./optimizer.mjs";


async function approvedRequest(root) {
  const stored = await findSingleCapsule(root, ({ capsule, task_id: taskId }) => {
    const request = capsule.route.request;
    return capsule.work.status === "ready" && request?.task?.id === taskId && request.task.approval === capsule.authority.level;
  });
  return stored?.capsule.route.request || null;
}


const OPTIMIZER = path.join(path.dirname(fileURLToPath(import.meta.url)), "optimizer.mjs");

function enforcedInstructions(route, taskId) {
  const ledger = JSON.stringify({ schema: 1, mode: "attempt", action: "record", task_id: taskId, attempt: { route: "routed", route_class: route.class, requested: { model: "<model you passed or null>", effort: "<effort you passed or null>" }, runtime: { model: null, effort: null }, outcome: "passed|failed", evidence_ref: "<check or path>" } });
  return [
    `FeatureKit JEV enforced route for this approved task: ${route.capability} capability at ${route.effort} effort.`,
    "Choose the model yourself from the models this host currently offers: routine = cheapest tier, standard = middle tier, deep = strongest tier; use the routed effort when the host can pass it. A user override in docs/agents/orchestration.md wins.",
    route.up_only ? "This task is caution-flagged: use the route only if it is at least as strong as your baseline model and effort; otherwise work on the baseline." : "",
    "If you already run on the chosen model, do the work yourself. Otherwise dispatch one worker immediately, passing the plan and scope paths instead of reading source yourself, then verify with the acceptance checks and diff. On failed verification escalate once to the baseline. A check blocked by the environment (sandbox, network, authentication) is not a routed failure: run it outside the restriction or report the gap, without escalating.",
    `Record each attempt once with: echo '${ledger}' | node "${OPTIMIZER}" (a baseline attempt uses route "baseline" and route_class null; any setting you could not pass or the host did not report is null).`,
    "Approval, policy floors, and verification remain authoritative.",
  ].filter(Boolean).join(" ");
}


export async function runRouteHook(event, options = {}) {
  if (event?.hook_event_name !== "UserPromptSubmit") return null;
  const root = path.resolve(options.scratchRoot || process.env.FEATUREKIT_SCRATCH_ROOT || path.join(event.cwd || process.cwd(), ".scratch", "featurekit"));
  const request = await approvedRequest(root);
  if (!request) return null;
  // An explicit host mode wins over one re-exported by interactive shell startup.
  const routingMode = process.env.FEATUREKIT_JEV_HOST_ROUTING || undefined;
  const result = await (options.optimize || ((value) => optimizeRoute(value, { scratchRoot: root, routingMode })))(request);
  if (!["shadow", "hold", "enforced"].includes(result.status)) return null;
  const compact = {
    status: result.status,
    baseline_preserved: result.baseline_preserved,
    ...(result.status === "enforced" ? { route: result.route } : {}),
    advisory: result.advisory,
    approved_dimensions: result.approved_dimensions || [],
    gates: result.gates,
    cache: result.cache,
    reason_codes: result.reason_codes || [],
  };
  return {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `${result.status === "enforced"
        ? enforcedInstructions(result.route, request.task.id)
        : "FeatureKit JEV preflight is advisory only; the approved plan, policy floors, and baseline route remain authoritative."} ${JSON.stringify(compact)}`,
    },
  };
}


async function readInput() {
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 65536) throw new Error("hook input too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}


async function main() {
  try {
    const output = await runRouteHook(await readInput());
    if (output) process.stdout.write(`${JSON.stringify(output)}\n`);
  } catch {
    // Hooks must preserve the normal FeatureKit route on every failure.
  }
}


if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
