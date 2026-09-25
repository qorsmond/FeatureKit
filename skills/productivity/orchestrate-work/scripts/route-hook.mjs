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


export async function runRouteHook(event, options = {}) {
  if (event?.hook_event_name !== "UserPromptSubmit") return null;
  const root = path.resolve(options.scratchRoot || process.env.FEATUREKIT_SCRATCH_ROOT || path.join(event.cwd || process.cwd(), ".scratch", "featurekit"));
  const request = await approvedRequest(root);
  if (!request) return null;
  const result = await (options.optimize || ((value) => optimizeRoute(value, { scratchRoot: root })))(request);
  if (!["shadow", "hold"].includes(result.status)) return null;
  const compact = {
    status: result.status,
    baseline_preserved: result.baseline_preserved,
    advisory: result.advisory,
    approved_dimensions: result.approved_dimensions || [],
    gates: result.gates,
    cache: result.cache,
    reason_codes: result.reason_codes || [],
  };
  return {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `FeatureKit JEV preflight is advisory only; the approved plan, policy floors, and baseline route remain authoritative. ${JSON.stringify(compact)}`,
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
