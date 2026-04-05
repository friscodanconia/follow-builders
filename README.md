**English** | [中文](README.zh-CN.md)

# Follow Builders, Not Influencers

An AI-powered digest that tracks the top builders in AI — researchers, founders, PMs,
and engineers who are actually building things — and delivers curated summaries of
what they're saying.

**Philosophy:** Follow people who build products and have original opinions, not
influencers who regurgitate information.

## Fork Model

This fork is intentionally set up as an upstream mirror:

- It mirrors feed snapshots from [zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders)
- It publishes its own digest history, structured topic archives, site, and optional newsletter flow
- It keeps fork-specific branding and URLs in `config/runtime-config.js`

That avoids paying for direct X API access while keeping this fork operationally honest.

## What You Get

A daily or weekly digest delivered to your preferred messaging app (Telegram, Discord,
WhatsApp, etc.) with:

- Summaries of new podcast episodes from top AI podcasts
- Key posts and insights from 25 curated AI builders on X/Twitter
- Full articles from official AI company blogs (Anthropic Engineering, Claude Blog)
- Links to all original content
- Available in English, Chinese, or bilingual

The product pipeline now also supports:

- topic tagging across normalized content items
- concise `Why this matters` framing on selected items
- a dedicated `Chinese Models` section when those sources have meaningful updates
- structured topic archives in addition to the markdown digest archive

## Quick Start

1. Install the skill in your agent (OpenClaw or Claude Code)
2. Say "set up follow builders" or invoke `/follow-builders`
3. The agent walks you through setup conversationally — no config files to edit

The agent will ask you:
- How often you want your digest (daily or weekly) and what time
- What language you prefer
- How you want it delivered (Telegram, email, or in-chat)

No API keys needed — all content is fetched centrally.
Your first digest arrives immediately after setup.

## Changing Settings

Your delivery preferences are configurable through conversation. Just tell your agent:

- "Switch to weekly digests on Monday mornings"
- "Change language to Chinese"
- "Make the summaries shorter"
- "Show me my current settings"

The source list (builders and podcasts) is curated centrally and updates
automatically — you always get the latest sources without doing anything.

## Customizing the Summaries

The skill uses plain-English prompt files to control how content is summarized.
You can customize them two ways:

**Through conversation (recommended):**
Tell your agent what you want — "Make summaries more concise," "Focus on actionable
insights," "Use a more casual tone." The agent updates the prompts for you.

**Direct editing (power users):**
Edit the files in the `prompts/` folder:
- `summarize-podcast.md` — how podcast episodes are summarized
- `summarize-tweets.md` — how X/Twitter posts are summarized
- `summarize-blogs.md` — how blog posts are summarized
- `digest-intro.md` — the overall digest format and tone
- `translate.md` — how English content is translated to Chinese

These are plain English instructions, not code. Changes take effect on the next digest.

## Default Sources

### Podcasts (6)
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### AI Builders on X (25)
[Andrej Karpathy](https://x.com/karpathy), [Swyx](https://x.com/swyx), [Josh Woodward](https://x.com/joshwoodward), [Kevin Weil](https://x.com/kevinweil), [Peter Yang](https://x.com/petergyang), [Nan Yu](https://x.com/thenanyu), [Madhu Guru](https://x.com/realmadhuguru), [Amanda Askell](https://x.com/AmandaAskell), [Cat Wu](https://x.com/_catwu), [Thariq](https://x.com/trq212), [Google Labs](https://x.com/GoogleLabs), [Amjad Masad](https://x.com/amasad), [Guillermo Rauch](https://x.com/rauchg), [Alex Albert](https://x.com/alexalbert__), [Aaron Levie](https://x.com/levie), [Ryo Lu](https://x.com/ryolu_), [Garry Tan](https://x.com/garrytan), [Matt Turck](https://x.com/mattturck), [Zara Zhang](https://x.com/zarazhangrui), [Nikunj Kothari](https://x.com/nikunj), [Peter Steinberger](https://x.com/steipete), [Dan Shipper](https://x.com/danshipper), [Aditya Agarwal](https://x.com/adityaag), [Sam Altman](https://x.com/sama), [Claude](https://x.com/claudeai)

### Official Blogs (2)
- [Anthropic Engineering](https://www.anthropic.com/engineering) — technical deep-dives from the Anthropic team
- [Claude Blog](https://claude.com/blog) — product announcements and updates from Claude

## Installation

### OpenClaw
```bash
# From ClawhHub (coming soon)
clawhub install follow-builders

# Or manually
git clone https://github.com/friscodanconia/follow-builders.git ~/skills/follow-builders
cd ~/skills/follow-builders && npm run setup
```

### Claude Code
```bash
git clone https://github.com/friscodanconia/follow-builders.git ~/.claude/skills/follow-builders
cd ~/.claude/skills/follow-builders && npm run setup
```

## Requirements

- An AI agent (OpenClaw, Claude Code, or similar)
- Internet connection (to fetch the central feed)

That's it. No API keys needed. All content (blog articles + YouTube transcripts + X/Twitter posts)
is fetched centrally and updated daily.

## How It Works

1. The upstream project updates the central feed snapshots
2. This fork mirrors those feed JSON files and validates them before publishing
3. Your agent or GitHub Action remixes the mirrored content into a digest using your preferences
4. The digest is archived in this repo and can also be delivered to your messaging app or newsletter

See [examples/sample-digest.md](examples/sample-digest.md) for what the output looks like.

## Runtime Configuration

Fork-specific settings live in `config/runtime-config.js`.

- `FOLLOW_BUILDERS_REPO_URL`: public URL for this fork
- `FOLLOW_BUILDERS_REPO_RAW_BASE_URL`: raw GitHub base for fork-owned prompts and structured artifacts
- `FOLLOW_BUILDERS_UPSTREAM_REPO_URL`: upstream project URL
- `FOLLOW_BUILDERS_UPSTREAM_RAW_BASE_URL`: raw GitHub base used for mirrored upstream feed files
- `FOLLOW_BUILDERS_SITE_URL`: canonical deployed site URL
- `FOLLOW_BUILDERS_SUBSCRIBE_URL`: optional subscribe form endpoint
- `FOLLOW_BUILDERS_NEWSLETTER_PROVIDER`: label shown on the subscribe page
- `FOLLOW_BUILDERS_SUBSCRIBE_CTA_LABEL`: CTA text used on the site
- `FOLLOW_BUILDERS_EMAIL_FROM`: sender used by Resend delivery

If `FOLLOW_BUILDERS_SUBSCRIBE_URL` is not set, the site will not post email addresses anywhere.

## Local Development

```bash
npm run setup
npm run build:structured
npm run verify
```

That installs both subprojects, builds structured item history, validates feeds, runs tests, and builds the site.

## Source Expansion

The repo now includes manifests for three non-X source groups:

- `config/sources-official.json`
- `config/sources-editorial.json`
- `config/sources-china.json`

Use `node scripts/fetch-external-sources.js` to populate `feed-external.json` from those sources.

See [docs/build-spec.md](docs/build-spec.md) for the concrete v2 pipeline spec.

## Privacy

- No API keys are sent anywhere — all content is fetched centrally
- If you use Telegram/email delivery, those keys are stored locally in `~/.follow-builders/.env`
- The skill only reads public content (public blog posts, public YouTube videos, public X posts)
- Your configuration, preferences, and reading history stay on your machine

## License

MIT
