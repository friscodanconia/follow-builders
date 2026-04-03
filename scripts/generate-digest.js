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

function buildPrompt(feedX, feedPodcasts, feedBlogs, prompts) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const sections = [];

  sections.push(`Today is ${today}. Generate the AI Builders Digest for today.`);
  sections.push('');

  // Add formatting instructions
  sections.push('=== DIGEST FORMAT INSTRUCTIONS ===');
  sections.push(prompts.digestIntro);
  sections.push('');

  // Add tweet summarization instructions + data
  if (feedX?.x?.length > 0) {
    sections.push('=== TWEET SUMMARIZATION INSTRUCTIONS ===');
    sections.push(prompts.summarizeTweets);
    sections.push('');
    sections.push('=== TWEET DATA (JSON) ===');
    sections.push(JSON.stringify(feedX.x, null, 2));
    sections.push('');
  }

  // Add blog summarization instructions + data
  if (feedBlogs?.blogs?.length > 0) {
    sections.push('=== BLOG SUMMARIZATION INSTRUCTIONS ===');
    sections.push(prompts.summarizeBlogs);
    sections.push('');
    sections.push('=== BLOG DATA (JSON) ===');
    sections.push(JSON.stringify(feedBlogs.blogs, null, 2));
    sections.push('');
  }

  // Add podcast summarization instructions + data
  if (feedPodcasts?.podcasts?.length > 0) {
    sections.push('=== PODCAST SUMMARIZATION INSTRUCTIONS ===');
    sections.push(prompts.summarizePodcast);
    sections.push('');
    sections.push('=== PODCAST DATA (JSON) ===');
    // Truncate transcripts to avoid exceeding context limits
    const truncatedPodcasts = feedPodcasts.podcasts.map(p => ({
      ...p,
      transcript: p.transcript ? p.transcript.slice(0, 15000) : ''
    }));
    sections.push(JSON.stringify(truncatedPodcasts, null, 2));
    sections.push('');
  }

  const hasContent = (feedX?.x?.length > 0) ||
    (feedBlogs?.blogs?.length > 0) ||
    (feedPodcasts?.podcasts?.length > 0);

  if (!hasContent) {
    return null;
  }

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

  const [digestIntro, summarizeTweets, summarizePodcast, summarizeBlogs] = await Promise.all([
    loadPrompt('digest-intro.md'),
    loadPrompt('summarize-tweets.md'),
    loadPrompt('summarize-podcast.md'),
    loadPrompt('summarize-blogs.md')
  ]);

  const prompts = { digestIntro, summarizeTweets, summarizePodcast, summarizeBlogs };

  console.error(`Feeds: ${feedX?.x?.length || 0} builders, ${feedPodcasts?.podcasts?.length || 0} podcasts, ${feedBlogs?.blogs?.length || 0} blogs`);

  const prompt = buildPrompt(feedX, feedPodcasts, feedBlogs, prompts);

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
