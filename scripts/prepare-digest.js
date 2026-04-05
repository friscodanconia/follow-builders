#!/usr/bin/env node

// ============================================================================
// Follow Builders — Prepare Digest
// ============================================================================
// Gathers everything the LLM needs to produce a digest:
// - Fetches the central feeds (tweets + podcasts)
// - Fetches the latest prompts from GitHub
// - Reads the user's config (language, delivery method)
// - Outputs a single JSON blob to stdout
//
// The LLM's ONLY job is to read this JSON, remix the content, and output
// the digest text. Everything else is handled here deterministically.
//
// Usage: node prepare-digest.js
// Output: JSON to stdout
// ============================================================================

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { runtimeConfig, repoAssetUrl, upstreamAssetUrl } from '../config/runtime-config.js';
import { validateFeed } from './lib/feed-validation.js';

// -- Constants ---------------------------------------------------------------

const USER_DIR = join(homedir(), '.follow-builders');
const CONFIG_PATH = join(USER_DIR, 'config.json');

const PROMPT_FILES = [
  'summarize-podcast.md',
  'summarize-tweets.md',
  'summarize-blogs.md',
  'digest-intro.md',
  'translate.md'
];

// -- Fetch helpers -----------------------------------------------------------

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

// -- Main --------------------------------------------------------------------

async function main() {
  const errors = [];

  // 1. Read user config
  let config = {
    language: 'en',
    frequency: 'daily',
    delivery: { method: 'stdout' }
  };
  if (existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
    } catch (err) {
      errors.push(`Could not read config: ${err.message}`);
    }
  }

  // 2. Fetch all three feeds
  const [feedX, feedPodcasts, feedBlogs, feedExternal] = await Promise.all([
    fetchJSON(upstreamAssetUrl('feed-x.json')),
    fetchJSON(upstreamAssetUrl('feed-podcasts.json')),
    fetchJSON(upstreamAssetUrl('feed-blogs.json')),
    fetchJSON(repoAssetUrl('feed-external.json'))
  ]);

  if (!feedX) errors.push('Could not fetch tweet feed');
  if (!feedPodcasts) errors.push('Could not fetch podcast feed');
  if (!feedBlogs) errors.push('Could not fetch blog feed');
  if (!feedExternal) errors.push('Could not fetch external feed');

  const validatedFeeds = {
    x: feedX,
    podcasts: feedPodcasts,
    blogs: feedBlogs,
    external: feedExternal,
  };

  for (const [kind, feed] of Object.entries(validatedFeeds)) {
    if (!feed) continue;

    const validationErrors = validateFeed(kind, feed);
    if (validationErrors.length > 0) {
      errors.push(`${kind} feed validation failed: ${validationErrors.join(' ')}`);
      validatedFeeds[kind] = null;
    }
  }

  // 3. Load prompts with priority: user custom > remote (GitHub) > local default
  //
  // If the user has a custom prompt at ~/.follow-builders/prompts/<file>,
  // use that (they personalized it — don't overwrite with remote updates).
  // Otherwise, fetch the latest from GitHub so they get central improvements.
  // If GitHub is unreachable, fall back to the local copy shipped with the skill.
  const prompts = {};
  const scriptDir = decodeURIComponent(new URL('.', import.meta.url).pathname);
  const localPromptsDir = join(scriptDir, '..', 'prompts');
  const userPromptsDir = join(USER_DIR, 'prompts');

  for (const filename of PROMPT_FILES) {
    const key = filename.replace('.md', '').replace(/-/g, '_');
    const userPath = join(userPromptsDir, filename);
    const localPath = join(localPromptsDir, filename);

    // Priority 1: user's custom prompt (they personalized it)
    if (existsSync(userPath)) {
      prompts[key] = await readFile(userPath, 'utf-8');
      continue;
    }

    // Priority 2: latest from GitHub (central updates)
    const remote = await fetchText(repoAssetUrl(`prompts/${filename}`));
    if (remote) {
      prompts[key] = remote;
      continue;
    }

    // Priority 3: local copy shipped with the skill
    if (existsSync(localPath)) {
      prompts[key] = await readFile(localPath, 'utf-8');
    } else {
      errors.push(`Could not load prompt: ${filename}`);
    }
  }

  // 4. Build the output — everything the LLM needs in one blob
  const output = {
    status: 'ok',
    generatedAt: new Date().toISOString(),

    // User preferences
    config: {
      language: config.language || 'en',
      frequency: config.frequency || 'daily',
      delivery: config.delivery || { method: 'stdout' }
    },

    // Content to remix
    podcasts: validatedFeeds.podcasts?.podcasts || [],
    x: validatedFeeds.x?.x || [],
    blogs: validatedFeeds.blogs?.blogs || [],
    external: validatedFeeds.external?.articles || [],

    // Stats for the LLM to reference
    stats: {
      podcastEpisodes: validatedFeeds.podcasts?.podcasts?.length || 0,
      xBuilders: validatedFeeds.x?.x?.length || 0,
      totalTweets: (validatedFeeds.x?.x || []).reduce((sum, a) => sum + a.tweets.length, 0),
      blogPosts: validatedFeeds.blogs?.blogs?.length || 0,
      externalItems: validatedFeeds.external?.articles?.length || 0,
      feedGeneratedAt: validatedFeeds.x?.generatedAt || validatedFeeds.podcasts?.generatedAt || validatedFeeds.blogs?.generatedAt || validatedFeeds.external?.generatedAt || null
    },

    // Prompts — the LLM reads these and follows the instructions
    prompts,

    upstream: {
      repoUrl: runtimeConfig.upstreamRepoUrl,
      rawBaseUrl: runtimeConfig.upstreamRawBaseUrl,
    },
    fork: {
      repoUrl: runtimeConfig.repoUrl,
      rawBaseUrl: runtimeConfig.repoRawBaseUrl,
    },

    // Non-fatal errors
    errors: errors.length > 0 ? errors : undefined
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify({
    status: 'error',
    message: err.message
  }));
  process.exit(1);
});
