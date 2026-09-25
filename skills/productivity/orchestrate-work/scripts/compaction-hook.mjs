import path from "node:path";
import { fileURLToPath } from "node:url";

import { findSingleCapsule } from "./optimizer.mjs";


export async function runCompactionHook(event, options = {}) {
  if (event?.hook_event_name !== "SessionStart" || event.source !== "compact") return null;
  const root = path.resolve(options.scratchRoot || process.env.FEATUREKIT_SCRATCH_ROOT || path.join(event.cwd || process.cwd(), ".scratch", "featurekit"));
  const stored = await findSingleCapsule(root, ({ capsule }) => capsule.work.status !== "complete");
  if (!stored) return null;
  const capsulePath = path.join(root, "tasks", stored.task_id, "capsule.json");
  return {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: `FeatureKit resumed after native compaction. Run using-featurekit, then read ${capsulePath} (task ${stored.task_id}, revision ${stored.revision}); revalidate its repository snapshot before reusing evidence. Do not replay the transcript.`,
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
    const output = await runCompactionHook(await readInput());
    if (output) process.stdout.write(`${JSON.stringify(output)}\n`);
  } catch {
    // Native compaction must continue on every FeatureKit hook failure.
  }
}


if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
