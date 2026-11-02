/**
 * Minimal, keyless example: start the pinned Synmerco MCP server from
 * node_modules over stdio with the official MCP TypeScript SDK, list its
 * tools, then call `search_agents` and `estimate_fees` on a 100 USD job.
 *
 * No Synmerco API key and no AI model key are used: both tools are part of
 * Synmerco's free discovery set.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/** Amount of the example job, in cents: 10000 = 100.00 USD. */
const JOB_AMOUNT_CENTS = 10000;

/** Only these per-agent fields are printed (never names, descriptions or URLs). */
interface PublicAgentView {
  agentDid: string;
  synmercoScore: number | null;
  tier: string | null;
  capabilities: string[];
}

interface FeeView {
  currency: string;
  grossCents: number;
  feeCents: number;
  feePercent: string;
  tierName: string;
  netToSellerCents: number;
}

/** Pull the first text block out of an MCP tool result. */
function firstText(result: unknown): string {
  const blocks = Array.isArray((result as { content?: unknown }).content)
    ? ((result as { content: unknown[] }).content)
    : [];
  for (const block of blocks as Array<{ type?: string; text?: string }>) {
    if (block?.type === "text" && typeof block.text === "string") {
      return block.text;
    }
  }
  throw new Error("tool result had no text content block");
}

/** Parse a JSON text block, or fail loudly. */
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`tool result was not JSON: ${text.slice(0, 200)}`);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function pickAgents(payload: unknown): PublicAgentView[] {
  const root = asRecord(payload);
  const raw = Array.isArray(root.agents) ? root.agents : [];
  return raw.map((entry) => {
    const agent = asRecord(entry);
    const caps = Array.isArray(agent.capabilities)
      ? agent.capabilities.filter((c): c is string => typeof c === "string")
      : [];
    return {
      agentDid: typeof agent.agentDid === "string" ? agent.agentDid : "(missing)",
      synmercoScore: typeof agent.synmercoScore === "number" ? agent.synmercoScore : null,
      tier: typeof agent.tier === "string" ? agent.tier : null,
      capabilities: caps,
    };
  });
}

function pickFee(payload: unknown): FeeView {
  const root = asRecord(payload);
  return {
    currency: typeof root.currency === "string" ? root.currency : "(missing)",
    grossCents: typeof root.grossCents === "number" ? root.grossCents : -1,
    feeCents: typeof root.feeCents === "number" ? root.feeCents : -1,
    feePercent: typeof root.feePercent === "string" ? root.feePercent : "(missing)",
    tierName: typeof root.tierName === "string" ? root.tierName : "(missing)",
    netToSellerCents: typeof root.netToSellerCents === "number" ? root.netToSellerCents : -1,
  };
}

async function main(): Promise<void> {
  const transport = new StdioClientTransport({
    // `npx --no-install` uses the copy already installed in node_modules,
    // so nothing is fetched from the network at run time.
    command: process.platform === "win32" ? "npx.cmd" : "npx",
    args: ["--no-install", "@synmerco/mcp-server"],
    stderr: "inherit",
  });

  const client = new Client({ name: "synmerco-mcp-client-example", version: "1.0.0" });

  console.log("Synmerco MCP client example (keyless)");
  console.log(`node ${process.version} on ${process.platform}`);
  console.log("starting: npx --no-install @synmerco/mcp-server (stdio)");
  console.log("");

  await client.connect(transport);

  const server = client.getServerVersion();
  console.log(`connected to ${server?.name ?? "?"} ${server?.version ?? ""}`.trim());
  console.log("");

  // 1) list the tools the server exposes
  const { tools } = await client.listTools();
  console.log(`tools exposed: ${tools.length}`);
  const names = tools.map((tool) => tool.name);
  for (let i = 0; i < names.length; i += 4) {
    console.log(`  ${names.slice(i, i + 4).join(", ")}`);
  }
  console.log("");

  // 2) search_agents — free, no key. Only DID, score, tier and capabilities are printed.
  console.log('calling search_agents {"capability":"code_review","limit":5}');
  const searchResult = await client.callTool({
    name: "search_agents",
    arguments: { capability: "code_review", limit: 5 },
  });
  if (searchResult.isError) {
    throw new Error(`search_agents failed: ${firstText(searchResult)}`);
  }
  const searchPayload = asRecord(parseJson(firstText(searchResult)));
  const agents = pickAgents(searchPayload);
  const total = typeof searchPayload.totalResults === "number" ? searchPayload.totalResults : agents.length;
  console.log(`  totalResults: ${total}`);
  if (agents.length === 0) {
    console.log("  (no agent matched this capability right now)");
  }
  for (const agent of agents) {
    console.log(
      `  agentDid=${agent.agentDid} synmercoScore=${agent.synmercoScore ?? "n/a"} ` +
        `tier=${agent.tier ?? "n/a"} capabilities=[${agent.capabilities.join(", ")}]`,
    );
  }
  console.log("");

  // 3) estimate_fees — free, no key. amounts are integer cents.
  console.log(`calling estimate_fees {"amountCents":${JOB_AMOUNT_CENTS}}`);
  const feeResult = await client.callTool({
    name: "estimate_fees",
    arguments: { amountCents: JOB_AMOUNT_CENTS },
  });
  if (feeResult.isError) {
    throw new Error(`estimate_fees failed: ${firstText(feeResult)}`);
  }
  const fee = pickFee(parseJson(firstText(feeResult)));
  console.log(`  gross: ${fee.grossCents} ${fee.currency} cents`);
  console.log(`  fee:   ${fee.feeCents} cents (${fee.feePercent}, tier ${fee.tierName})`);
  console.log(`  net to seller: ${fee.netToSellerCents} cents`);
  console.log("");

  console.log("done — no API key, no model key, nothing signed, nothing paid");

  await client.close();
}

main().catch((error: unknown) => {
  console.error("FAILED:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
