#!/usr/bin/env node

import { createInterface } from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FEATUREKIT_VERSION, optimizeRoute } from "./optimizer.mjs";


const MAX_MESSAGE_BYTES = 65536;
const STRING_ARRAY = (maxItems, maxLength) => ({
  type: "array",
  maxItems,
  items: { type: "string", minLength: 1, maxLength },
});

export const ROUTE_TOOL = {
  name: "route",
  description: "Advise on a FeatureKit route from bounded metadata only. Never send source, diffs, transcripts, logs, raw output, credentials, or secrets. FEATUREKIT_JEV_ROUTING=off makes no provider call; shadow returns advisory data while preserving the baseline route.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["schema", "mode", "task", "facts", "policy"],
    properties: {
      schema: { const: 1 },
      mode: { const: "route" },
      task: {
        type: "object",
        additionalProperties: false,
        required: ["id", "operation", "objective", "approval", "scope", "acceptance"],
        properties: {
          id: { type: "string", minLength: 1, maxLength: 64 },
          operation: { enum: ["lookup", "edit", "implement", "debug", "architecture", "review", "handoff", "other"] },
          objective: { type: "string", minLength: 1, maxLength: 1024 },
          approval: { enum: ["read-only", "approved-write", "not-approved"] },
          scope: STRING_ARRAY(64, 160),
          acceptance: STRING_ARRAY(64, 512),
        },
      },
      facts: {
        type: "object",
        additionalProperties: false,
        required: ["files_estimate", "cross_boundary", "unknown_root_cause", "current_failure", "attempts"],
        properties: {
          files_estimate: { type: "integer", minimum: 0, maximum: 100000 },
          cross_boundary: { type: "boolean" },
          unknown_root_cause: { type: "boolean" },
          current_failure: { type: "boolean" },
          attempts: { type: "integer", minimum: 0, maximum: 10 },
        },
      },
      policy: {
        type: "object",
        additionalProperties: false,
        required: ["capability_floor", "effort_floor", "risk_flags", "available_capabilities"],
        properties: {
          capability_floor: { enum: ["routine", "standard", "deep"] },
          effort_floor: { enum: ["minimal", "low", "medium", "high", "extra-high"] },
          risk_flags: { type: "array", uniqueItems: true, maxItems: 10, items: { enum: ["security", "authz", "privacy", "destructive", "irreversible", "migration", "ambiguous", "prior-failure", "missing-evidence", "user-decision-pending"] } },
          available_capabilities: { type: "array", uniqueItems: true, maxItems: 3, items: { enum: ["routine", "standard", "deep"] } },
        },
      },
    },
  },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
};

const toolResult = (result) => ({
  content: [{ type: "text", text: JSON.stringify(result) }],
  structuredContent: result,
});

export async function handleMcpRequest(request, options = {}) {
  if (!request || request.jsonrpc !== "2.0" || typeof request.method !== "string") throw Object.assign(new Error("invalid JSON-RPC request"), { rpcCode: -32600 });
  if (request.method === "notifications/initialized") return null;
  if (request.method === "initialize") {
    return {
      protocolVersion: typeof request.params?.protocolVersion === "string" ? request.params.protocolVersion : "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "featurekit-jev", version: FEATUREKIT_VERSION },
      instructions: "Call route only with bounded FeatureKit metadata. Its result is advisory and never overrides approval, risk, or verification gates.",
    };
  }
  if (request.method === "ping") return {};
  if (request.method === "tools/list") return { tools: [ROUTE_TOOL] };
  if (request.method !== "tools/call") throw Object.assign(new Error("method not found"), { rpcCode: -32601 });
  if (request.params?.name !== ROUTE_TOOL.name || !request.params.arguments || typeof request.params.arguments !== "object" || Array.isArray(request.params.arguments)) {
    throw Object.assign(new Error("invalid route tool call"), { rpcCode: -32602 });
  }
  try {
    return toolResult(await optimizeRoute(request.params.arguments, options));
  } catch {
    return { content: [{ type: "text", text: JSON.stringify({ schema: 1, status: "invalid", error_code: "INVALID_INPUT" }) }], isError: true };
  }
}

const write = (message) => process.stdout.write(`${JSON.stringify(message)}\n`);

async function main() {
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of lines) {
    let request;
    try {
      if (!line.trim() || Buffer.byteLength(line) > MAX_MESSAGE_BYTES) throw Object.assign(new Error("parse error"), { rpcCode: -32700 });
      request = JSON.parse(line);
      const result = await handleMcpRequest(request);
      if (result !== null && request.id !== undefined) write({ jsonrpc: "2.0", id: request.id, result });
    } catch (error) {
      if (request && request.id === undefined) continue;
      write({ jsonrpc: "2.0", id: request?.id ?? null, error: { code: error?.rpcCode || -32603, message: error?.rpcCode ? error.message : "internal error" } });
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
