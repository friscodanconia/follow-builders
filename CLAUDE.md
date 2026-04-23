# follow-builders — agent orientation

Read this before making changes. The project structure has a few surprises that cost real time if you miss them.

## What this repo does

Generates a daily AI Builders Digest newsletter (aiupdates.soumyosinha.com). A GitHub Action runs every day at 6 AM IST:

1. **Mirrors** feed snapshots (`feed-x.json`, `feed-podcasts.json`, `feed-blogs.json`) from upstream `zarazhangrui/follow-builders` via `curl`. This repo does **not** call the X/Twitter API itself — there is no `X_BEARER_TOKEN` secret. Adding accounts to `config/default-sources.json` has no effect on what tweets you see; that config is only read by `scripts/generate-feed.js` which is never invoked in CI.
2. **Fetches** additional sources (`scripts/fetch-external-sources.js`) from `config/sources-official.json`, `sources-editorial.json`, `sources-china.json` into `feed-external.json`. This is the one you control — add RSS / HTML-index / JSON-feed sources here.
3. **Builds** a structured dataset (`scripts/build-structured-history.js` → `scripts/lib/content-pipeline.js`) that applies topic tagging, freshness filter (>7d stale items dropped), substance filter (<50 char items dropped), and selects 5 items for the day.
4. **Generates** digest markdown via Claude API (`scripts/generate-digest.js`) using prompts in `prompts/`.
5. **Publishes** to Buttondown newsletter.

## Where to make what change

| Want to… | Edit |
|---|---|
| Add a blog/newsletter/HTML source | `config/sources-{official,editorial,china}.json` |
| Add X builder handles | Upstream `zarazhangrui/follow-builders` (open a PR there). This repo can't fetch X directly. |
| Change how items are selected / scored | `scripts/lib/content-pipeline.js` |
| Change writing style | `prompts/digest-intro.md` |
| Change topic keywords / region tagging | `config/topics.json` |
| Change what the digest leads with | The selector (content-pipeline.js), not the prompt |

## Feed artifacts in git

`feed-*.json`, `history/items/*.json`, `site/data/items/*.json`, `site/data/digests/*.md` are all **CI-generated artifacts**, committed on every run. Two consequences:

- **Don't commit local dry-run output.** `git checkout` these files before committing, or they'll balloon your diff.
- **Merge attribute**: `.gitattributes` marks these files with `merge=ours`. This means when your PR is merged into main on GitHub, main's newer (CI-generated) version wins — no 20-way conflicts. Side effect: if you locally run `git merge origin/main` on a feature branch, `ours` resolves to the feature branch's stale version. Override with `git checkout origin/main -- feed-external.json` (and similar) if you need main's latest.
- **Pushes are slow.** The repo has ~3000 objects from months of daily snapshots. First push after `git gc` enumerates them all. Subsequent pushes are fast.

## Known macOS push issue

If `git push` hangs at "Writing objects: 100%" with low KB/s, it's GitHub's HTTP/2 throttling macOS connections. Set once globally:

```
git config --global http.version HTTP/1.1
git config --global http.postBuffer 524288000
```

## Dry-run the pipeline locally

```bash
cd scripts && node fetch-external-sources.js        # refreshes feed-external.json
# then to simulate full digest build:
node --input-type=module -e "
import { buildStructuredDataset } from './lib/content-pipeline.js';
import { readFile } from 'fs/promises';
const [feedX, feedPodcasts, feedBlogs, externalFeed] = await Promise.all([
  readFile('../feed-x.json','utf-8').then(JSON.parse),
  readFile('../feed-podcasts.json','utf-8').then(JSON.parse),
  readFile('../feed-blogs.json','utf-8').then(JSON.parse),
  readFile('../feed-external.json','utf-8').then(JSON.parse),
]);
const today = new Date().toISOString().split('T')[0];
const ds = await buildStructuredDataset({ digestDate: today, feedX, feedPodcasts, feedBlogs, externalFeed });
console.log('stats:', ds.stats);
ds.selectedItems.forEach((i,n)=>console.log(\`\${n+1}. [\${i.section}] \${i.sourceName} | \${i.title?.slice(0,70)}\`));
"
```

Don't commit the resulting `feed-external.json` — it's a dev artifact.

## History

- 2026-04-23: Added ChinAI Weekly + ChinaTalk editorial sources (Qwen/DeepSeek/MiniMax blogs had gone quiet). Fixed RSS parser to read `<content:encoded>` — every Substack source was being silently dropped by the thin-content filter.
