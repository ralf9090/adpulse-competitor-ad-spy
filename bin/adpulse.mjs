#!/usr/bin/env node

import readline from 'node:readline';
import { parseArgs } from 'node:util';

const API_BASE = process.env.ADPULSE_API_URL || 'https://adpulsespy.com';
const API_KEY = process.env.ADPULSE_API_KEY || '';

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'adpulse-cli-mcp/1.1.0 (+https://adpulsespy.com)',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
    headers['x-license-key'] = API_KEY;
  }
  return headers;
}

async function scanGoogleCompetitor({ query, region = 'US', maxAds = 25, adFormat = 'ALL' }) {
  const res = await fetch(`${API_BASE}/api/scan/google`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ query, region, maxAds, adFormat }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `AdPulse API returned HTTP ${res.status}. Unlock unlimited API access at https://adpulsespy.com/#pricing`,
    );
  }
  return data;
}

async function scanTikTokWinners({ country = 'US', period = '30', sortBy = 'ctr', maxAds = 12 }) {
  const res = await fetch(`${API_BASE}/api/scan/tiktok`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ country, period, sortBy, maxAds }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `TikTok Creative Radar returned HTTP ${res.status}. Upgrade at ${API_BASE}/#pricing`,
    );
  }
  return data;
}

function startMcpServer() {
  const rl = readline.createInterface({ input: process.stdin, terminal: false });

  function reply(id, result) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
  }

  function replyError(id, code, message) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
  }

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return;
    }

    const { id, method, params } = msg;

    if (method === 'initialize') {
      return reply(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'adpulse-competitor-ad-spy', version: '1.1.0' },
      });
    }

    if (method === 'notifications/initialized') {
      return;
    }

    if (method === 'ping') {
      return reply(id, {});
    }

    if (method === 'tools/list') {
      return reply(id, {
        tools: [
          {
            name: 'spy_google_competitor_ads',
            description:
              'Scan any competitor domain or brand on Google Ads Transparency + YouTube to uncover evergreen 30d+ winning ads, unlisted YouTube video URLs, tracking pixels, and landing page conversion funnel readiness.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Competitor domain (e.g. "klaviyo.com", "shopify.com") or advertiser name.',
                },
                region: {
                  type: 'string',
                  description: '2-letter ISO country code (US, GB, DE, CA, AU, FR, etc.). Default: US',
                },
                maxAds: {
                  type: 'number',
                  description: 'Max creatives to inspect (10-120). Default: 25',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'spy_tiktok_top_ads',
            description:
              'Fetch top-converting TikTok Creative Center video ads ranked by CTR or engagement, including landing page URLs and pixel/stack teardown (includes 3 free daily preview scans; full vault unlocked with ADPULSE_API_KEY).',
            inputSchema: {
              type: 'object',
              properties: {
                country: { type: 'string', description: 'ISO country code (US, GB, DE, CA, AU). Default: US' },
                period: { type: 'string', description: 'Lookback window in days: "7", "30", or "180". Default: "30"' },
                sortBy: { type: 'string', description: '"ctr" or "like". Default: "ctr"' },
                maxAds: { type: 'number', description: 'Max creatives to fetch (6-40). Default: 12' },
              },
            },
          },
        ],
      });
    }

    if (method === 'tools/call') {
      try {
        const toolName = params?.name;
        const args = params?.arguments || {};
        if (toolName === 'spy_google_competitor_ads') {
          const out = await scanGoogleCompetitor(args);
          const resolvedSlug =
            out?.result?.resolvedDomain ||
            encodeURIComponent(
              String(args.query || '')
                .trim()
                .replace(/^https?:\/\//, '')
                .split('/')[0],
            );
          return reply(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    shareableReportUrl: `https://adpulsespy.com/spy/${resolvedSlug}`,
                    ...out,
                  },
                  null,
                  2,
                ),
              },
            ],
          });
        }
        if (toolName === 'spy_tiktok_top_ads') {
          const out = await scanTikTokWinners(args);
          return reply(id, {
            content: [{ type: 'text', text: JSON.stringify(out, null, 2) }],
          });
        }
        return replyError(id, -32601, `Unknown tool: ${toolName}`);
      } catch (err) {
        return reply(id, {
          isError: true,
          content: [{ type: 'text', text: String(err?.message || err) }],
        });
      }
    }

    if (id !== undefined) {
      replyError(id, -32601, `Method not found: ${method}`);
    }
  });
}

function printHelp() {
  console.log(`
AdPulse Competitor Ad & Funnel Spy CLI + MCP Server (v1.1.0)
Web Dashboard & API Keys: https://adpulsespy.com

Usage:
  node ./bin/adpulse.mjs <domain-or-brand> [--region US] [--max-ads 25] [--json]
  npx github:ralf9090/adpulse-competitor-ad-spy <domain-or-brand> [--region US]
  node ./bin/adpulse.mjs --mcp

Examples:
  node ./bin/adpulse.mjs klaviyo.com
  node ./bin/adpulse.mjs --region GB gymshark.com
  ADPULSE_API_KEY=adp_live_xxx node ./bin/adpulse.mjs hubspot.com --json
`);
}

async function runCli(argv) {
  const invokedBin = process.argv[1] || '';
  if (invokedBin.endsWith('adpulse-mcp') || argv.includes('--mcp')) {
    return startMcpServer();
  }

  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        region: { type: 'string', short: 'r', default: 'US' },
        'max-ads': { type: 'string', short: 'm', default: '25' },
        json: { type: 'boolean', short: 'j', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        mcp: { type: 'boolean', default: false },
      },
    });
  } catch (err) {
    console.error(`Argument error: ${err.message}`);
    printHelp();
    process.exit(1);
  }

  const { values, positionals } = parsed;
  if (values.help || positionals.length === 0) {
    printHelp();
    process.exit(0);
  }

  const query = positionals[0];
  const region = String(values.region || 'US').toUpperCase();
  const maxAds = Math.max(10, Math.min(120, Number(values['max-ads']) || 25));
  const asJson = Boolean(values.json);

  console.error(`Scanning Google & YouTube Ads + Funnel Architecture for "${query}" (${region})...`);
  try {
    const payload = await scanGoogleCompetitor({ query, region, maxAds });
    const r = payload.result || payload.data || payload;

    if (asJson) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    const domainSlug = r.resolvedDomain || query;
    const planName = payload.tier || payload.plan || 'free';
    const lockedCount = payload.lockedAdsCount ?? payload.lockedCount ?? 0;

    console.log(`\n=============================================================`);
    console.log(` AdPulse Audit: ${r.resolvedAdvertiserName || domainSlug} (${region})`);
    console.log(` Live Web Report: https://adpulsespy.com/spy/${domainSlug}`);
    console.log(`=============================================================`);
    console.log(`• Sampled Active Creatives : ${r.totalExtracted} (Plan: ${planName})`);
    console.log(`• Evergreen Winners (30d+) : ${r.evergreenWinnersCount} (Longest: ${r.longestRunningDays} days)`);
    console.log(`• Unlisted YouTube Videos  : ${r.youtubeVideosCount}`);

    if (r.landingPageIntel) {
      const lp = r.landingPageIntel;
      console.log(`• Funnel Readiness Score   : ${lp.funnelReadinessScore}/100 (${lp.analyzedUrl})`);
      console.log(`• Ad Pixels Detected       : ${lp.adPixelsDetected.join(', ') || 'None / Server-Side'}`);
      console.log(`• Tech Stack               : ${lp.techStackDetected.join(', ') || 'Custom'}`);
    }

    if (Array.isArray(r.ads) && r.ads.length > 0) {
      console.log(`\nTop Active Creatives:`);
      for (const ad of r.ads.slice(0, 6)) {
        const badge = ad.isEvergreenWinner ? '[WINNER]' : '        ';
        const media = ad.youtubeVideoUrl || ad.landingPageUrl || ad.transparencyUrl;
        console.log(`  ${badge} ${String(ad.daysRunning).padStart(3, ' ')}d | ${ad.format.padEnd(5, ' ')} | ${media}`);
      }
    }

    if (lockedCount > 0) {
      console.log(
        `\n🔒 +${lockedCount} additional creatives locked in free preview. Unlock full exports & API at https://adpulsespy.com/#pricing\n`,
      );
    } else {
      console.log('');
    }
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

runCli(process.argv.slice(2));
