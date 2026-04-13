# SEO Changes Log

This document tracks all SEO improvements made to the AI Builders Digest site.

## Date: 2026-04-13

### Changes Overview

Five SEO improvements were implemented to increase AI search visibility, improve search engine indexing, and ensure AI crawlers can properly access and cite the site's content.

---

### 1. WebSite + Organization JSON-LD Schema

**File:** `site/app/layout.js`

Added a `WebSite` + `Organization` JSON-LD schema block to every page via the root layout. This helps AI systems understand the site as a published entity with a defined publisher.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI Builders Digest",
  "url": "https://aiupdates.soumyosinha.com",
  "description": "A daily summary of what top AI builders are shipping...",
  "publisher": {
    "@type": "Organization",
    "name": "AI Builders Digest",
    "url": "https://aiupdates.soumyosinha.com"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://aiupdates.soumyosinha.com/archive?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

**Why it matters:** The `SearchAction` enables site search to appear directly in Google results. The `Organization` publisher block establishes E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals.

---

### 2. Article JSON-LD on Digest Pages

**File:** `site/app/digest/[date]/page.js`

Each digest page now emits an `Article` schema per story, including the story headline, description (from "Why it matters" or body text), URL, publication date, and publisher.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Box CEO Aaron Levie: 'No API, no future' for enterprise software",
  "description": "Your company's procurement team is about to start asking every software vendor...",
  "url": "https://x.com/levie/status/2042759653281456218",
  "datePublished": "2026-04-12",
  "publisher": {
    "@type": "Organization",
    "name": "AI Builders Digest",
    "url": "https://aiupdates.soumyosinha.com"
  }
}
```

**Why it matters:** AI systems like Perplexity and Google AI Overviews can cite individual digest stories as authoritative sources, not just the digest as a whole.

---

### 3. Person JSON-LD on Builder Profile Pages

**File:** `site/app/builder/[handle]/page.js`

Each builder's profile page now emits a `Person` schema with their name, X/Twitter handle, expertise topics (derived from their tracked items), and cross-links to their social profile and archive page.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Andrej Karpathy",
  "alternateName": "@karpathy",
  "url": "https://x.com/karpathy",
  "knowsAbout": ["AI Assistants", "Research", "Reasoning", "Open Source"],
  "sameAs": [
    "https://x.com/karpathy",
    "https://aiupdates.soumyosinha.com/builder/karpathy"
  ]
}
```

**Why it matters:** Builder profiles become citable as named entities with demonstrated expertise areas, building E-E-A-T authority for the people featured in the digest.

---

### 4. robots.txt — AI Crawler Access

**File:** `site/app/robots.txt/route.js` (new file)

Created a dynamic robots.txt that explicitly allows all major AI search bots while opting out of training-only crawlers.

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Disallow: /

Sitemap: https://aiupdates.soumyosinha.com/sitemap.xml
```

**Why it matters:**
- Allows ChatGPT, Perplexity, Claude, and Gemini to crawl the site
- Blocks CCBot (Common Crawl) from using content for AI model training
- Includes a sitemap reference so search engines discover all pages faster

---

### 5. Sitemap XML

**File:** `site/app/sitemap.xml/route.js` (new file)

Created a dynamic sitemap that covers all site pages with appropriate priority and change frequency signals:

- **Static pages** (homepage, archive, builders, about, subscribe) — highest priority
- **Digest pages** — 0.9 priority, monthly changefreq
- **Builder pages** — 0.7 priority, weekly changefreq
- **Topic pages** — 0.6 priority, weekly changefreq

**Why it matters:** Ensures all pages are discoverable by search engines and AI systems. Previously only the RSS feed existed as a discovery mechanism.

---

### 6. Canonical URLs

**Files:** `site/app/layout.js`, `site/app/digest/[date]/page.js`, `site/app/topic/[slug]/page.js`

Added `<link rel="canonical">` tags to prevent duplicate content issues and consolidate link equity:

- Homepage: `https://aiupdates.soumyosinha.com`
- Digest pages: `https://aiupdates.soumyosinha.com/digest/[date]`
- Topic pages: `https://aiupdates.soumyosinha.com/topic/[slug]`

**Why it matters:** Canonical URLs tell search engines which version of a page is the "master" copy, preventing dilution of ranking signals across multiple URL variants.

---

### Git Commits

| Commit | Description |
|--------|-------------|
| `30dc00b` | feat: add SEO structured data, robots.txt, and canonical URLs |
| `a078a53` | fix: correct import path in robots.txt route |
| `0a124ac` | feat: add sitemap.xml and fix robots.txt sitemap URL |

---

### What Was Not Done (Future Improvements)

These items were identified but not implemented in this session:

1. **OG images for homepage and builder pages** — digest pages already have `opengraph-image.js`; homepage and builders pages need the same treatment
2. **"Why this matters" as standalone extractable content blocks** — currently part of the Article schema description, could be surfaced as its own `Claim` or `Summary` schema for stronger AI citation
3. **Topic page intro paragraphs** — adding descriptive text to topic landing pages would improve keyword relevance signals

---

### Verification

After the Vercel deployment completes, verify each change at:

| Check | URL |
|-------|-----|
| robots.txt | `aiupdates.soumyosinha.com/robots.txt` |
| Sitemap | `aiupdates.soumyosinha.com/sitemap.xml` |
| Digest JSON-LD | View source of any digest page, search for `application/ld+json` |
| Builder JSON-LD | View source of any builder page, search for `application/ld+json` |
| Canonical URL | View source of any page, search for `rel="canonical"` |
