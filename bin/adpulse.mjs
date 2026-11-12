#!/usr/bin/env node

import readline from 'node:readline';

const API_BASE = process.env.ADPULSE_API_URL || 'https://adpulsespy.com';
const API_KEY = process.env.ADPULSE_API_KEY || '';

async function scanGoogleCompetitor({ query, region = 'US', maxAds = 25, adFormat = 'ALL' }) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'adpulse-cli-mcp/1.0.0 (+https://adpulsespy.com)',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const res = await fetch(`${API_BASE}/api/scan/google`, {
    method: 'POST',
    headers,
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
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'adpulse-cli-mcp/1.0.0 (+https://adpulsespy.com)',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const res = await fetch(`${API_BASE}/api/scan/tiktok`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ country, period, sortBy, maxAds }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `TikTok Creative Radar requires an AdPulse Growth Pro or Agency Scale key (${API_BASE}/#pricing).`,
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
        serverInfo: { name: 'adpulse-competitor-ad-spy', version: '1.0.0' },
      });
    }

    if (method === 'notifications/initialized') {
      return;
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
                  description: 'Max creatives to inspect (10-100). Default: 25',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'spy_tiktok_top_ads',
            description:
              'Fetch top-converting TikTok Creative Center video ads ranked by CTR or engagement, including landing page URLs and pixel/stack teardown (requires ADPULSE_API_KEY).',
            inputSchema: {
              type: 'object',
              properties: {
                country: { type: 'string', description: 'ISO country code (US, GB, DE, CA, AU). Default: US' },
                period: { type: 'string', description: 'Lookback window in days: "7", "30", or "180". Default: "30"' },
                sortBy: { type: 'string', description: '"ctr" or "like". Default: "ctr"' },
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
          const cleanSlug = String(args.query || '').replace(/^https?:\/\//, '').split('/')[0];
          return reply(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    shareableReportUrl: `https://adpulsespy.com/spy/${cleanSlug}`,
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

async function runCli(argv) {
  if (argv.includes('--mcp')) {
    return startMcpServer();
  }

  const args = argv.filter((a) => !a.startsWith('-'));
  const flagRegionIdx = argv.indexOf('--region');
  const region = flagRegionIdx !== -1 && argv[flagRegionIdx + 1] ? argv[flagRegionIdx + 1] : 'US';
  const asJson = argv.includes('--json');

  if (args.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    console.log(`
AdPulse Competitor Ad & Funnel Spy CLI + MCP Server
Web Dashboard & API Keys: https://adpulsespy.com

Usage:
  npx adpulse-competitor-ad-spy <domain-or-brand> [--region US] [--json]
  npx adpulse-competitor-ad-spy --mcp

Examples:
  npx adpulse-competitor-ad-spy klaviyo.com
  npx adpulse-competitor-ad-spy shopify.com --region GB
  ADPULSE_API_KEY=adp_live_xxx npx adpulse-competitor-ad-spy hubspot.com --json
`);
    process.exit(0);
  }

  const query = args[0];
  console.error(`Scanning Google & YouTube Ads + Funnel Architecture for "${query}" (${region})...`);
  try {
    const payload = await scanGoogleCompetitor({ query, region, maxAds: 25 });
    const r = payload.data || payload;

    if (asJson) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    const domainSlug = r.resolvedDomain || query;
    console.log(`\n=============================================================`);
    console.log(` AdPulse Audit: ${r.resolvedAdvertiserName || domainSlug} (${region})`);
    console.log(` Live Web Report: https://adpulsespy.com/spy/${domainSlug}`);
    console.log(`=============================================================`);
    console.log(`• Sampled Active Creatives : ${r.totalExtracted} (Plan: ${payload.plan || 'free_preview'})`);
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

    if (payload.lockedCount > 0) {
      console.log(
        `\n🔒 +${payload.lockedCount} additional creatives locked in free preview. Unlock full exports & API at https://adpulsespy.com/#pricing\n`,
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
