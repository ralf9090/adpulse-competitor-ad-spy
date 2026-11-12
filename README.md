# AdPulse — Competitor Google, YouTube & TikTok Ad Radar (CLI + MCP Server)

[![Live Web App](https://img.shields.io/badge/Live_SaaS-adpulsespy.com-10b981?style=for-the-badge)](https://adpulsespy.com)
[![Brand Directory](https://img.shields.io/badge/Curated_Audits-adpulsespy.com%2Fdirectory-0ea5e9?style=for-the-badge)](https://adpulsespy.com/directory)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](./LICENSE)

**AdPulse** surfaces any competitor's **30+ day long-running Google Search & Display ads**, **decoded YouTube ad video URLs**, **trending TikTok Creative Center video ads**, and **static HTML landing page signals** (HTML tag footprints, H1 hooks, CTA buttons, pricing offers, and storefront stack) across 33 markets.

- **Interactive Workspace, Weekly Change Alerts & White-Label Agency Briefs:** [https://adpulsespy.com](https://adpulsespy.com)
- **Curated Domain Snapshots:** `https://adpulsespy.com/spy/<domain>`
  - Live examples: [athleticgreens.com](https://adpulsespy.com/spy/athleticgreens.com) · [gymshark.com](https://adpulsespy.com/spy/gymshark.com) · [klaviyo.com](https://adpulsespy.com/spy/klaviyo.com) · [monday.com](https://adpulsespy.com/spy/monday.com)

---

## Core Capabilities

1. **Observed Ad Date Span (`30d+` Long-Running Creatives):** Orders sampled Google Ads Transparency creatives by active status and observed date span between first and latest impression.
2. **YouTube Ad Preview Decoder:** Extracts playable `youtube.com/watch?v=...` URLs and ad copy snippets from Google preview bundles.
3. **Static HTML Landing Page & Tag Inspection:** Inspects accessible landing pages for **Meta Pixel, Google Ads Conversion Tag, GTM, GA4, TikTok Pixel, LinkedIn Insight, Clarity, Hotjar, Reddit Pixel**, H1 hooks, and storefront stack (`Unmeasured` reported transparently on WAF-gated pages).
4. **TikTok Trending Creative Radar:** Pulls trending commercial videos (`7d / 30d / 180d`, up to 25 per call) across 33 markets.

---

## Quick Start (Zero Dependencies, Node.js 18+)

```bash
git clone https://github.com/ralf9090/adpulse-competitor-ad-spy.git
cd adpulse-competitor-ad-spy

# Free daily preview scan (3 sampled ads + landing signals)
node ./bin/adpulse.mjs athleticgreens.com

# Full 120-ad Agency API scan across 33 markets (requires Agency Scale key)
ADPULSE_API_KEY="adp_live_your_agency_key" node ./bin/adpulse.mjs gymshark.com --region GB --json
```

---

## Use as an MCP Server (Claude Desktop, Cursor, Windsurf, Cline)

```json
{
  "mcpServers": {
    "adpulse": {
      "command": "node",
      "args": ["/absolute/path/to/adpulse-competitor-ad-spy/bin/adpulse.mjs", "--mcp"],
      "env": {
        "ADPULSE_API_KEY": "adp_live_optional_agency_key"
      }
    }
  }
}
```

### Exposed MCP Tools
- `spy_google_competitor_ads` — Scan any domain or brand across 33 countries (`US`, `GB`, `DE`, `FR`, `CA`, `AU`, etc.) for active Google/YouTube creatives and landing page HTML tag signals (`maxAds` 10–120 with Agency API key).
- `spy_tiktok_top_ads` — Fetch trending TikTok Creative Center video ads (`maxAds` 6–25) sorted by CTR or hook retention.

---

## Cloud Data Pipelines on Apify Store

- [**Google Ads Transparency & Landing Page Funnel Scraper**](https://apify.com/devoted_helix/google-ads-transparency-scraper)
- [**TikTok Creative Center Top Ads & Funnel Scraper**](https://apify.com/devoted_helix/tiktok-creative-center-scraper)

---

## License

MIT © [AdPulse Intelligence](https://adpulsespy.com)
