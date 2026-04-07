#!/usr/bin/env node

// ============================================================================
// Follow Builders — Auto-Generate Digest
// ============================================================================
// Calls the Claude API to generate a digest from the prepared feed data.
// This enables fully automated daily digest generation in GitHub Actions.
//
// Usage: node generate-digest.js
// Env vars: ANTHROPIC_API_KEY
// Output: digest markdown to stdout
// ============================================================================

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { runtimeConfig } from '../config/runtime-config.js';
import { assertValidFeed } from './lib/feed-validation.js';
import { readJson } from './lib/fs-utils.js';
import { buildStructuredDataset } from './lib/content-pipeline.js';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);

// -- Load feed data and prompts locally (no network needed) ------------------

async function loadLocalJSON(filename) {
  const path = join(SCRIPT_DIR, '..', filename);
  if (!existsSync(path)) return null;
  return JSON.parse(await readFile(path, 'utf-8'));
}

async function loadPrompt(filename) {
  const path = join(SCRIPT_DIR, '..', 'prompts', filename);
  if (!existsSync(path)) return '';
  return await readFile(path, 'utf-8');
}

// -- Build the LLM prompt ----------------------------------------------------

function buildPrompt(dataset, prompts, yesterdayDigest) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const sections = [];
  const selectedItems = dataset.selectedItems || [];

  sections.push(`Today is ${today}. Generate the AI Builders Digest for today.`);
  sections.push('');

  // Add formatting instructions
  sections.push('=== DIGEST FORMAT INSTRUCTIONS ===');
  sections.push(prompts.digestIntro.replaceAll('{{FOLLOW_BUILDERS_REPO_URL}}', runtimeConfig.repoUrl));
  sections.push('');

  if (prompts.digestExample) {
    sections.push('=== EXAMPLE DIGEST (for style reference — do NOT copy this content) ===');
    sections.push(prompts.digestExample);
    sections.push('');
  }

  sections.push('=== SOURCE-SPECIFIC STYLE HINTS ===');
  sections.push(prompts.summarizeTweets);
  sections.push('');
  sections.push(prompts.summarizeBlogs);
  sections.push('');
  sections.push(prompts.summarizePodcast);
  sections.push('');

  if (yesterdayDigest) {
    sections.push('=== YESTERDAY\'S DIGEST (for continuity — reference only if there\'s a genuine connection) ===');
    sections.push(yesterdayDigest);
    sections.push('');
  }

  sections.push('=== SELECTED ITEMS (JSON) ===');
  sections.push(JSON.stringify(selectedItems, null, 2));
  sections.push('');

  const hasContent = selectedItems.length > 0;

  if (!hasContent) {
    return null;
  }

  sections.push('IMPORTANT: You MUST write about ALL selected items. Every single item in the JSON above must appear in the digest with its own headline, summary, "Why it matters" line, and source URL. Do not skip any items. You may vary the length per item (big stories get more space, minor ones get less), but every item must be covered.');
  sections.push('');
  sections.push('Generate the complete digest now. Output ONLY the digest markdown, nothing else.');

  return sections.join('\n');
}

// -- Call Claude API ---------------------------------------------------------

async function callClaude(prompt, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error (HTTP ${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// -- Main --------------------------------------------------------------------

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  console.error('Loading feeds and prompts...');

  // Load everything locally (feeds are already committed to the repo)
  const [feedX, feedPodcasts, feedBlogs] = await Promise.all([
    loadLocalJSON('feed-x.json'),
    loadLocalJSON('feed-podcasts.json'),
    loadLocalJSON('feed-blogs.json')
  ]);
  const externalFeed = await readJson(join(SCRIPT_DIR, '..', 'feed-external.json'), { articles: [] });

  if (feedX) assertValidFeed('x', feedX);
  if (feedPodcasts) assertValidFeed('podcasts', feedPodcasts);
  if (feedBlogs) assertValidFeed('blogs', feedBlogs);
  if (externalFeed) assertValidFeed('external', externalFeed);

  const [digestIntro, digestExample, summarizeTweets, summarizePodcast, summarizeBlogs] = await Promise.all([
    loadPrompt('digest-intro.md'),
    loadPrompt('digest-example.md'),
    loadPrompt('summarize-tweets.md'),
    loadPrompt('summarize-podcast.md'),
    loadPrompt('summarize-blogs.md')
  ]);

  const prompts = { digestIntro, digestExample, summarizeTweets, summarizePodcast, summarizeBlogs };

  const dateArg = process.argv.find((arg) => arg.startsWith('--date='));
  const digestDate = dateArg ? dateArg.split('=')[1] : new Date().toISOString().split('T')[0];
  const structuredPath = join(SCRIPT_DIR, '..', 'history', 'items', `${digestDate}.json`);
  const dataset = await readJson(structuredPath, null) || await buildStructuredDataset({
    digestDate,
    feedX,
    feedPodcasts,
    feedBlogs,
    externalFeed,
  });

  console.error(`Feeds: ${feedX?.x?.length || 0} builders, ${feedPodcasts?.podcasts?.length || 0} podcasts, ${feedBlogs?.blogs?.length || 0} blogs, ${externalFeed?.articles?.length || 0} external items`);
  console.error(`Structured items: ${dataset.stats.totalItems} total, ${dataset.stats.selectedItems} selected, ${dataset.stats.chinaItems} china-tagged`);

  // Load yesterday's digest for continuity
  const yesterday = new Date(digestDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];
  const yesterdayPath = join(SCRIPT_DIR, '..', 'history', `${yesterdayDate}.md`);
  let yesterdayDigest = null;
  if (existsSync(yesterdayPath)) {
    yesterdayDigest = await readFile(yesterdayPath, 'utf-8');
    console.error(`Loaded yesterday's digest (${yesterdayDate}) for continuity`);
  }

  const prompt = buildPrompt(dataset, prompts, yesterdayDigest);

  if (!prompt) {
    console.error('No content in any feed — skipping digest generation');
    process.exit(0);
  }

  console.error('Calling Claude API to generate digest...');
  const digest = await callClaude(prompt, apiKey);

  console.error(`Digest generated (${digest.length} chars)`);

  // Output digest to stdout
  console.log(digest);
}

main().catch(err => {
  console.error('Digest generation failed:', err.message);
  process.exit(1);
});
