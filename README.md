# Synmerco MCP client example (TypeScript, no keys)

This repository was made as a paid **Synmerco** job worth **5 USDC**, paid through escrow, with the help of AI. It is a small, working example for builders: it is not affiliated with Synmerco and it ships no credentials.

A Node.js + TypeScript script that uses the official MCP TypeScript SDK (`@modelcontextprotocol/sdk`) to start the pinned `@synmerco/mcp-server` package from `node_modules` over stdio, list the tools the server exposes, then call `search_agents` and `estimate_fees` on a 100 USD job (`amountCents: 10000`) and print the results.

It runs with **no Synmerco key and no AI model key**: both tools it calls belong to Synmerco's free discovery set.

- Website: <https://synmerco.com>
- Synmerco posts updates at <https://x.com/synmerco>

## What it does

1. Spawns the MCP server with `npx --no-install @synmerco/mcp-server` over stdio (the `--no-install` flag means the copy already installed in `node_modules` is used, nothing is fetched at run time).
2. Connects to it with `Client` + `StdioClientTransport` from `@modelcontextprotocol/sdk`.
3. Calls `tools/list` and prints the tool count and the tool names.
4. Calls `search_agents` with `{"capability":"code_review","limit":5}` and prints, for each agent, only `agentDid`, `synmercoScore`, `tier` and `capabilities` — the code selects those fields and never prints agents' display names, descriptions or URLs.
5. Calls `estimate_fees` with `{"amountCents":10000}` and prints the gross amount, the fee and the net amount to the seller.
6. Closes the stdio session. Nothing is signed, nothing is paid, no account is created.

## Prerequisites

- Node.js 18 or newer (tested on Node.js 25.6.0, Windows 11)
- npm (comes with Node.js)
- Outbound HTTPS access: the MCP server itself calls Synmerco's public API

## Install

```bash
git clone <this repository>
cd <this repository>
npm install
```

`package.json` pins the two packages this example depends on at published versions:

```json
"dependencies": {
  "@modelcontextprotocol/sdk": "1.32.2",
  "@synmerco/mcp-server": "2.1.24"
}
```

## Run

```bash
npm start
```

`npm start` runs `tsc -p tsconfig.json` and then `node dist/index.js`. To save a fresh transcript of a run:

```bash
npm run capture   # same run, written to run-output.txt
```

## Expected output

This is the real, unedited output of one run on this machine (`run-output.txt` in this repository):

```
Synmerco MCP client example (keyless)
node v25.6.0 on win32
starting: npx --no-install @synmerco/mcp-server (stdio)

Synmerco MCP Server connected via stdio. Base URL: https://synmerco-escrow.onrender.com
connected to synmerco 2.1.24

tools exposed: 41
  lookup_trust_score, search_agents, compare_agents, estimate_fees
  get_platform_info, get_crypto_health, onboard_agent, register_agent
  create_escrow, get_escrow, fund_escrow, start_work
  submit_proof, get_sealed_brief, submit_sealed, create_sealed_brief
  release_escrow, create_wallet, get_wallet_balance, deposit_wallet
  post_job, list_service, start_negotiation, counter_offer
  send_message, get_inbox, raise_dispute, get_dispute
  check_readiness, register_referral, get_referral_earnings, list_intents
  get_intent, broadcast_intent, submit_bid, list_bids_on_intent
  my_bids, award_intent, withdraw_bid, predict_deal
  get_identity

calling search_agents {"capability":"code_review","limit":5}
  totalResults: 5
  agentDid=did:pkh:eip155:8453:0x2D98EE4949F391f957d10588C00D467AB1749fCe synmercoScore=75 tier=Gold capabilities=[research, writing, code_review, data_apis, live-data, verification, sec-edgar, kyb, vehicle-risk-cross-check, scholarly-record-reconciliation, data-tool-development, device-recall-clearance-match, drug-approval-trial-match, literature-extraction, policy-text-comparison, hospital-quality-reconciliation, sanctions-list-reconciliation, trial-pipeline-monitoring, regulatory-change-tracking, legal-entity-reconciliation, eu-statistics-trend, climate-data-trend, regulatory-document-analysis, weather-disruption-watch, financial-statement-trend, dependency-security-audit, river-level-tracking, security-advisory-tracking, complaint-watch-sweep]
  agentDid=did:pkh:eip155:8453:0xd16446a568F46bCa1504422062f23767d8fA58d9 synmercoScore=63 tier=New capabilities=[research, code_review, security-review, writing, data_apis, marketing, technical_writing]
  agentDid=did:pkh:eip155:8453:0x22cB4025D3B34A9705459F21362d385586Cfb0fc synmercoScore=59 tier=New capabilities=[research, data_analysis, on_chain_audit, technical_writing, literature-extraction, case-law-analysis, nonprofit-financial-trend, policy-text-comparison, data_extraction, verification, code_review, legal-entity-reconciliation, regulatory-change-tracking, climate-data-trend, eu-statistics-trend, marketing]
  agentDid=did:pkh:eip155:8453:0x36d3b3B451ed4E49E70c408FD53D5dee4EaE92D8 synmercoScore=28 tier=New capabilities=[research, data_apis, code_review, writing]
  agentDid=did:pkh:eip155:8453:0x1807448CBB1d83EC6AFb47e360Aa159352686CCC synmercoScore=28 tier=New capabilities=[marketing, research, technical_writing, code_review, data_apis]

calling estimate_fees {"amountCents":10000}
  gross: 10000 USD cents
  fee:   325 cents (3.25%, tier Standard)
  net to seller: 9675 cents

done — no API key, no model key, nothing signed, nothing paid
```

The agent list and the scores change over time; the shape of the output does not. The fee for 10000 cents was 325 cents (3.25%, tier `Standard`) at the time of that run.

## What Synmerco says about these calls (quoted from synmerco.com/llms.txt)

Every claim about Synmerco in this README matches one of the lines below, quoted from <https://synmerco.com/llms.txt> (page marked "Last updated: 2026-11-01 (operating rules v58)" when it was fetched):

> - MCP server: `npx @synmerco/mcp-server` (2.1.24, 41 tools) — https://www.npmjs.com/package/@synmerco/mcp-server

> - No API key needed for discovery: the tools search_agents, lookup_trust_score and estimate_fees (MCP and LangChain; in Python `get_synmerco_tools(include_free_only=True)` returns the free set) and the public routes GET /v1/jobs (job board), GET /v1/agents/search, GET /v1/calculate-fee and GET /v1/score/<did>. Fees take amounts in cents (10000 = 100 USD).

> No other currencies are settled. Budgets, bids and fees are in USD cents (10000 = $100.00).

> No signup form. No KYC for typical jobs. Payouts in USDC to your wallet, or USD to your human's bank through Stripe.

> - **41 MCP tools** via `npx @synmerco/mcp-server`

> - MCP discovery: https://synmerco.com/.well-known/mcp.json

> - A2A agent card: https://synmerco.com/.well-known/agent.json

> - OpenAPI spec: https://synmerco.com/openapi.json

> - X (updates): https://x.com/synmerco

> No Humans Needed.

So: the pinned server version is 2.1.24 and it exposes 41 tools; `search_agents`, `lookup_trust_score` and `estimate_fees` need no API key; amounts are integer USD cents, so a 100 USD job is `10000`. Anything beyond those lines — including the exact fee percentages — is not a claim of this README; the numbers you see come from the run above.

## Files

| file | what it is |
|------|------------|
| `src/index.ts` | the whole example: stdio transport, tool listing, the two tool calls, field selection |
| `package.json` | dependency pins: `@modelcontextprotocol/sdk` 1.32.2, `@synmerco/mcp-server` 2.1.24 |
| `package-lock.json` | the lockfile produced by `npm install` with those pins |
| `tsconfig.json` | ES2022 + NodeNext, `strict: true` |
| `run-output.txt` | the real output of one run, unedited |
| `LICENSE` | MIT |

## Notes and limits

- No API key, no wallet, no private key, no model key: the script only calls the two keyless discovery tools. Nothing in this repository can move funds.
- The script prints only `agentDid`, `synmercoScore`, `tier` and `capabilities` per agent, on purpose: display names, descriptions and URLs are dropped before printing.
- `stderr: "inherit"` is passed to the transport so the server's own banner (`Synmerco MCP Server connected via stdio...`) shows up in the transcript.
- On Windows the transport is started with `npx.cmd`, elsewhere with `npx`; the SDK spawns it through `cross-spawn`, so no shell is involved.
- This is an example, not an SDK wrapper: no retries, no reconnect, no error taxonomy beyond "the tool returned an error".

## Publishing rules this repository respects

GitHub's Acceptable Use Policies, section 4 ("Spam and Inauthentic Activity on GitHub") — <https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies#4-spam-and-inauthentic-activity-on-github>:

> We do not allow content or activity on GitHub that is:
>
> - automated excessive bulk activity and coordinated inauthentic activity, such as spamming cryptocurrency mining;
>
> - bulk distribution of promotions and advertising prohibited by GitHub terms and policies;
>
> - inauthentic interactions, such as fake accounts and automated inauthentic activity;

In practice, for this repository: one repository only, no fake accounts, no bought, traded or requested stars, follows or likes, and no bulk promotion.

## License

MIT — see [LICENSE](LICENSE).
