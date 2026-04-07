# LLM Handoff: AI Updates / Follow Builders Work

## Purpose

This document is a full handoff for another model or engineer. It covers:

- which repos were involved
- where the local code lives
- the exact GitHub repos and commit hashes
- what was changed
- why each change was made
- which files hold the implementation
- the remaining caveats and current state

Date of handoff: `2026-04-06`

## Repos

### 1. Follow Builders app

- Local path: `/Users/Soumyo/Documents/follow-builders`
- GitHub repo: `https://github.com/friscodanconia/follow-builders`
- Branch used: `main`
- Current HEAD at handoff: `59315e6ce1164f6b6fde1256df38377bc00af72d`

Recent relevant commits:

- `59315e6` `fix: keep aiupdates navigation on the app host`
- `7c2d308` `feat: redesign mobile-first briefing experience`
- `442849b` `chore: mirror feeds and refresh digest`
- `d21b2a9` `fix: accept null optional fields in external feeds`
- `2f447eb` `fix: sync deployed site data generation`
- `d2ee3d3` `feat: add structured digest pipeline and topic archives`
- `45c3775` `fix: install root deps first so Vercel detects Next.js`

### 2. Outer personal website repo

- Local path: `/Users/Soumyo/Documents/soumyopersonalwebsite`
- GitHub repo: `https://github.com/friscodanconia/soumyopersonalwebsite`
- Branch used: `main`
- Current HEAD at handoff: `6dc2178b80307eb5286e4c6d269a8f7ee2deda46`

Recent relevant commit:

- `6dc2178` `fix: forward nested ai-updates routes`

## Product Context

The original request started as a review and improvement pass on the forked `follow-builders` project. The user had forked the repo but wanted to keep using the upstream mirrored X/feed structure because expanding X coverage directly would require paid API access.

The direction taken was:

- keep the upstream-mirror model for X content
- make the fork operationally self-consistent
- add a structured content layer on top
- add broader non-X coverage from high-signal sources
- add topic tagging and topic archives
- add a `Chinese Models` coverage lane
- keep the digest concise with ranking/budgeting
- improve the site UI with a mobile-first briefing experience

## What Was Changed In `follow-builders`

### A. Fork/config cleanup

Reason:

- The fork still contained upstream-owner assumptions and hard-coded URLs.
- The repo needed to clearly distinguish between what it owns and what it intentionally mirrors.

Main files:

- `/Users/Soumyo/Documents/follow-builders/config/runtime-config.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/prepare-digest.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/generate-digest.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/deliver.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/subscribe/page.js`
- `/Users/Soumyo/Documents/follow-builders/README.md`

### B. Safer digest rendering

Reason:

- The site previously converted markdown to HTML using ad hoc replacements and `dangerouslySetInnerHTML`.
- That was a security risk if upstream content or generated digest content included unsafe HTML or malicious links.

Main files:

- `/Users/Soumyo/Documents/follow-builders/site/lib/digests.js`
- `/Users/Soumyo/Documents/follow-builders/site/components/digest-content.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/digest/[date]/page.js`

Tests:

- `/Users/Soumyo/Documents/follow-builders/site/lib/digests.test.js`

### C. Structured content pipeline

Reason:

- The product needed to evolve from “single markdown digest blob” into a structured archive that can power topic pages, ranked selections, and future productization.

Main build spec:

- `/Users/Soumyo/Documents/follow-builders/docs/build-spec.md`

Core pipeline files:

- `/Users/Soumyo/Documents/follow-builders/scripts/lib/content-pipeline.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/lib/topic-taxonomy.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/build-structured-history.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/fetch-external-sources.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/sync-site-data.js`

Structured artifacts:

- `/Users/Soumyo/Documents/follow-builders/history/item-index.json`
- `/Users/Soumyo/Documents/follow-builders/history/items/2026-04-06.json`
- `/Users/Soumyo/Documents/follow-builders/history/topics/index.json`
- `/Users/Soumyo/Documents/follow-builders/site/data/item-index.json`
- `/Users/Soumyo/Documents/follow-builders/site/data/items/2026-04-06.json`
- `/Users/Soumyo/Documents/follow-builders/site/data/topics/index.json`

Important note:

- The repo currently has unstaged generated-data updates for `2026-04-06`.
- Those were intentionally not bundled into the later navigation-only fix commit.

### D. Dynamic topic tagging and taxonomy

Reason:

- The user asked specifically about topic following without requiring new X API expansion.
- The chosen approach was rule-based build-time topic tagging over the mirrored + added source universe.

Main files:

- `/Users/Soumyo/Documents/follow-builders/config/topics.json`
- `/Users/Soumyo/Documents/follow-builders/scripts/lib/topic-taxonomy.js`
- `/Users/Soumyo/Documents/follow-builders/history/topics/index.json`
- `/Users/Soumyo/Documents/follow-builders/site/data/topics/index.json`

Notable taxonomy choice:

- `china-models` was added as a first-class topic because the user wanted better coverage of Chinese model progress than western media usually provides.

### E. Additional source groups

Reason:

- The user explicitly wanted RSS/blogs/YouTube/newsletters added, but with digest length still kept short.
- The implementation focused on high-signal official and editorial sources, plus Chinese model primary sources.

Main config files:

- `/Users/Soumyo/Documents/follow-builders/config/sources-official.json`
- `/Users/Soumyo/Documents/follow-builders/config/sources-editorial.json`
- `/Users/Soumyo/Documents/follow-builders/config/sources-china.json`

Fetcher:

- `/Users/Soumyo/Documents/follow-builders/scripts/fetch-external-sources.js`

### F. `Why this matters`

Reason:

- The user explicitly liked the idea of adding editorial significance, not just descriptive summaries.

Main implementation:

- `/Users/Soumyo/Documents/follow-builders/scripts/lib/content-pipeline.js`

Where it surfaces:

- homepage structured picks
- topic pages
- digest pages

### G. Mobile-first UI/product pass

Reason:

- The structured layer existed, but the user said the website still looked too similar to before.
- A focused product/UI pass was then done with mobile-first layout principles rather than simply shrinking a desktop layout.

Main files:

- `/Users/Soumyo/Documents/follow-builders/site/app/layout.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/archive/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/digest/[date]/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/topic/[slug]/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/subscribe/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/globals.css`
- `/Users/Soumyo/Documents/follow-builders/site/components/app-link.js`
- `/Users/Soumyo/Documents/follow-builders/site/components/signal-card.js`
- `/Users/Soumyo/Documents/follow-builders/site/components/topic-badge.js`
- `/Users/Soumyo/Documents/follow-builders/site/lib/presentation.js`
- `/Users/Soumyo/Documents/follow-builders/site/lib/site-config.js`

Key visible UI sections introduced:

- `Operator Brief`
- `Signal board`
- `Topic radar`
- `Coverage map`

### H. Feed validation and workflow robustness

Reason:

- The live site lagged because the workflow was failing before digest generation.
- One concrete cause was optional external-feed fields like `publishedAt` coming through as `null`.
- Another cause was that the app reads `site/data`, so the deployment path needed to explicitly keep that updated.

Main files:

- `/Users/Soumyo/Documents/follow-builders/scripts/lib/feed-validation.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/tests/feed-validation.test.js`
- `/Users/Soumyo/Documents/follow-builders/.github/workflows/generate-feed.yml`
- `/Users/Soumyo/Documents/follow-builders/package.json`
- `/Users/Soumyo/Documents/follow-builders/scripts/sync-site-data.js`

## What Was Changed In `soumyopersonalwebsite`

Reason:

- The AI Updates app is deployed separately, but it is also linked from the main personal website under `/ai-updates`.
- The initial routing problem was not in `follow-builders` itself. The main site only redirected exact `/ai-updates`, not nested paths such as:
  - `/ai-updates/topic/agents`
  - `/ai-updates/archive`
  - `/ai-updates/digest/...`

Fix:

- Added a wildcard redirect so `/ai-updates/:path*` forwards to the AI Updates deployment subdomain.

File:

- `/Users/Soumyo/Documents/soumyopersonalwebsite/vercel.json`

Relevant commit:

- `6dc2178` `fix: forward nested ai-updates routes`

## Routing Bug Timeline

### Problem 1: nested routes under `www.soumyosinha.com/ai-updates/*` 404ed

Observed behavior:

- `https://www.soumyosinha.com/ai-updates` worked
- `https://www.soumyosinha.com/ai-updates/topic/agents` failed

Root cause:

- `soumyopersonalwebsite/vercel.json` only redirected exact `/ai-updates`
- nested routes were not forwarded

Fix:

- add `/ai-updates/:path*` redirect to `https://aiupdates.soumyosinha.com/:path*`

### Problem 2: topic page loaded, but Home/Archive links still 404ed

Observed behavior:

- after outer-site redirect fix, `https://www.soumyosinha.com/ai-updates/topic/agents` loaded
- but clicking `Home` or `Archive` from that page still produced 404s

Root cause:

- the outer site does a `307` redirect from `www.soumyosinha.com/ai-updates/topic/agents`
  to `https://aiupdates.soumyosinha.com/topic/agents`
- however, the app still server-rendered internal links as `/ai-updates` and `/ai-updates/archive`
- those paths are wrong once the browser is on the `aiupdates.soumyosinha.com` host

Fix:

- make the app treat itself as root-hosted on `aiupdates.soumyosinha.com`
- stop prepending `/ai-updates` to internal links

Files:

- `/Users/Soumyo/Documents/follow-builders/site/lib/site-config.js`
- `/Users/Soumyo/Documents/follow-builders/site/lib/site-config.test.js`

Relevant commit:

- `59315e6` `fix: keep aiupdates navigation on the app host`

## Current Known File References

If another model needs to inspect the implementation quickly, start here:

### Highest-signal files in `follow-builders`

- `/Users/Soumyo/Documents/follow-builders/docs/build-spec.md`
- `/Users/Soumyo/Documents/follow-builders/config/topics.json`
- `/Users/Soumyo/Documents/follow-builders/config/sources-official.json`
- `/Users/Soumyo/Documents/follow-builders/config/sources-editorial.json`
- `/Users/Soumyo/Documents/follow-builders/config/sources-china.json`
- `/Users/Soumyo/Documents/follow-builders/scripts/lib/content-pipeline.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/lib/topic-taxonomy.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/build-structured-history.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/fetch-external-sources.js`
- `/Users/Soumyo/Documents/follow-builders/scripts/sync-site-data.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/app/topic/[slug]/page.js`
- `/Users/Soumyo/Documents/follow-builders/site/lib/site-config.js`
- `/Users/Soumyo/Documents/follow-builders/site/lib/site-config.test.js`

### Highest-signal files in `soumyopersonalwebsite`

- `/Users/Soumyo/Documents/soumyopersonalwebsite/vercel.json`

## Current State At Handoff

### Live behavior

At the end of this work:

- `www.soumyosinha.com/ai-updates/*` redirects into the AI Updates app subdomain
- the AI Updates app’s internal `Home` and `Archive` links are rendered as root-hosted links
- topic pages load and navigate correctly after deployment

### Local repo status

`follow-builders` is not fully clean locally because generated daily history/site-data files for `2026-04-06` are modified but unstaged.

Those files include:

- `history/item-index.json`
- `history/items/2026-04-06.json`
- multiple files under `history/topics/`
- `site/data/item-index.json`
- `site/data/items/2026-04-06.json`
- multiple files under `site/data/topics/`

This is not a code regression by itself. It is generated data from the daily content build.

`soumyopersonalwebsite` was used only for the redirect fix and was pushed with the routing patch.

## What Was Intentionally Not Built

These ideas were discussed but not fully implemented:

- per-user personalization
- database-backed storage
- arbitrary new X-account expansion
- full search/accounts/analytics stack

The shipped work is best described as:

- structured digest pipeline
- topic taxonomy and tagging
- added source manifests and ingestion
- concise ranked digests with `why this matters`
- mobile-first UI refresh
- deployment/routing fixes across both repos

## Recommended Prompt For Another LLM

If handing off to another model, point it to this document first and then say:

`Read /Users/Soumyo/Documents/follow-builders/docs/llm-handoff-2026-04-06.md first. The main app repo is /Users/Soumyo/Documents/follow-builders and the outer site repo is /Users/Soumyo/Documents/soumyopersonalwebsite. Start by confirming current git status in both repos, then inspect the files listed under "Highest-signal files".`
