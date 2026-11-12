# AdPulse — Competitor Google, YouTube & TikTok Ad Spy (CLI + MCP Server)

[![Live Web App](https://img.shields.io/badge/Live_SaaS-adpulsespy.com-10b981?style=for-the-badge)](https://adpulsespy.com)
[![Brand Directory](https://img.shields.io/badge/50+_Live_Audits-adpulsespy.com%2Fdirectory-0ea5e9?style=for-the-badge)](https://adpulsespy.com/directory)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](./LICENSE)

**AdPulse** uncovers any competitor's **evergreen 30+ day Google Search & Display ads**, **unlisted paid YouTube video URLs**, **TikTok Creative Center top-CTR video creatives**, and **landing page conversion funnel architecture** (tracking pixels, H1 hooks, CTA buttons, pricing offers, and frontend stack) in seconds.

- **Interactive Web Workspace & Instant Audit Links:** [https://adpulsespy.com](https://adpulsespy.com)
- **Instant Shareable Domain Teardowns:** `https://adpulsespy.com/spy/<domain>`
  - Live examples: [shopify.com](https://adpulsespy.com/spy/shopify.com) · [klaviyo.com](https://adpulsespy.com/spy/klaviyo.com) · [hubspot.com](https://adpulsespy.com/spy/hubspot.com) · [monday.com](https://adpulsespy.com/spy/monday.com) · [semrush.com](https://adpulsespy.com/spy/semrush.com)

---

## Why Performance Marketers & AI Agents Use AdPulse

1. **Ad Longevity = Profit Proof:** Most ads get killed in 7 days. AdPulse ranks creatives by `daysRunning` and flags **30d+ Evergreen Winners** where competitors are scaling real budget.
2. **Unlisted YouTube Ad Extraction:** Decodes Google's rendered preview payloads to surface direct `youtube.com/watch?v=...` URLs hidden from public YouTube channels.
3. **TikTok Creative Radar Winners:** Pulls high-CTR commercial videos (`7d / 30d / 180d`) with direct MP4 streams and destination URLs.
4. **Landing Page Conversion & Pixel Teardown:** Automatically inspects the advertiser's destination URL for **Meta Pixel, Google Ads gtag, GTM, TikTok Pixel, LinkedIn Insight, Clarity, Hotjar, Reddit Pixel**, H1 hooks, and Funnel Readiness Score (`0–100`).

---

## Quick Start (Zero Dependencies, Node.js 18+)

Clone and run directly against any competitor domain (includes free daily preview scans out of the box):

```bash
git clone https://github.com/ralf9090/adpulse-competitor-ad-spy.git
cd adpulse-competitor-ad-spy

# Scan any competitor's US Google & YouTube Ads + Landing Page Funnel
node ./bin/adpulse.mjs klaviyo.com

# Scan UK market and output structured JSON
node ./bin/adpulse.mjs gymshark.com --region GB --json
```

Unlock unlimited scans, all 200+ creatives per run, and TikTok Creative Radar with an `adp_live_...` license key from **[adpulsespy.com/#pricing](https://adpulsespy.com/#pricing)**:

```bash
export ADPULSE_API_KEY="adp_live_your_key_here"
node ./bin/adpulse.mjs shopify.com --json
```

---

## Use as an MCP Server (Claude Desktop, Cursor, Windsurf, Cline)

Give your AI coding or growth agent live competitor ad & funnel intelligence via the Model Context Protocol (`stdio`):

```json
{
  "mcpServers": {
    "adpulse": {
      "command": "node",
      "args": ["/absolute/path/to/adpulse-competitor-ad-spy/bin/adpulse.mjs", "--mcp"],
      "env": {
        "ADPULSE_API_KEY": "adp_live_optional_pro_or_agency_key"
      }
    }
  }
}
```

### Exposed MCP Tools
- `spy_google_competitor_ads` — Scan any domain or brand across 34 countries (`US`, `GB`, `DE`, `FR`, `CA`, `AU`, etc.) for active Google/YouTube creatives and landing page pixel/funnel intelligence.
- `spy_tiktok_top_ads` — Fetch top-performing TikTok Creative Center video ads sorted by CTR or likes with landing page teardowns.

---

## Cloud Data Pipelines on Apify Store

Need bulk scheduled dataset runs, webhooks, or direct Apify SDK integration? Use our official pay-per-event Apify Actors:

- [**Google Ads Transparency & Landing Page Funnel Scraper**](https://apify.com/devoted_helix/google-ads-transparency-scraper) (`devoted_helix/google-ads-transparency-scraper`)
- [**TikTok Creative Center Top Ads & Funnel Scraper**](https://apify.com/devoted_helix/tiktok-creative-center-scraper) (`devoted_helix/tiktok-creative-center-scraper`)

---

## License

MIT © [AdPulse Intelligence](https://adpulsespy.com)
