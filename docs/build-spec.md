# Follow Builders v2 Build Spec

## Goal

Upgrade the product from a single markdown digest generator into a structured content pipeline with:

- normalized content items
- dynamic topic tagging
- a dedicated `china-models` topic and digest section
- short, ranked daily digests with strict item budgets
- support for non-X sources such as official blogs, newsletters, and selected feeds
- `why this matters` framing for each selected item

## Product Constraints

- Keep the existing upstream-mirror model for X content
- Do not require paid X API expansion
- Keep the daily digest concise even as the source universe expands
- Prefer primary sources and high-signal editorial sources
- Avoid adding a database in v1

## Data Model

Each normalized item should contain:

- `id`
- `date`
- `sourceType`
- `sourceGroup`
- `sourceName`
- `builderOrOrg`
- `title`
- `url`
- `publishedAt`
- `content`
- `summary`
- `whyThisMatters`
- `topics`
- `regionTags`
- `importanceScore`
- `noveltyScore`
- `digestScore`
- `section`

## Topic Taxonomy

Initial topics:

- `agents`
- `evals`
- `coding`
- `inference`
- `enterprise`
- `open-source`
- `research`
- `reasoning`
- `voice`
- `multimodal`
- `tool-use`
- `computer-use`
- `fine-tuning`
- `benchmarks`
- `safety`
- `china-models`

`china-models` is both:

- a regular topic tag
- a section trigger in the daily digest

## Source Groups

### Mirrored

- X builders from the upstream project
- podcasts from the upstream project
- official blogs already mirrored by the upstream project

### Additional Official Sources

- OpenAI news / releases
- Cursor blog
- Anthropic newsroom
- Google DeepMind blog

### Additional Editorial Sources

- Import AI
- Latent Space newsletter

### China-Focused Sources

- Qwen blog
- DeepSeek news
- MiniMax news

## Pipeline

1. Load mirrored feed snapshots
2. Load optional additional-source snapshot
3. Normalize all content into a single item list
4. Tag items using taxonomy rules
5. Compute `why this matters`
6. Score items for novelty and importance
7. Select digest candidates with strict section budgets
8. Save structured history JSON
9. Generate markdown digest from the selected items

## Digest Budgets

Daily digest target:

- 8 to 10 items total
- 3 top items
- 4 to 6 secondary items
- optional `Chinese Models` section when there is real signal
- optional `Watchlist` only for overflow, not full summaries

Rules:

- max 1 item per source by default
- max 2 items per topic unless the day is dominated by that topic
- do not include every item in the daily digest
- archive everything structured; only rank the best items into the digest

## Storage

No database in v1.

Persist to files:

- `feed-external.json`
- `history/items/<date>.json`
- `history/item-index.json`
- `history/topics/index.json`
- `history/topics/<topic>.json`

## Site Changes

- expose topic pages at `/topic/[slug]`
- show latest topics on the homepage
- keep archive pages for markdown digests
- use structured history for topic archives

## Implementation Scope For This Iteration

This iteration should ship:

- taxonomy config
- source manifests
- external-source fetcher
- item normalization
- rule-based topic tagging
- heuristic `why this matters`
- digest scoring and section selection
- structured history output
- topic archive pages
- workflow integration

This iteration does not need:

- user accounts
- per-user personalization
- database-backed search
- arbitrary user-added X accounts
