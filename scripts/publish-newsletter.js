#!/usr/bin/env node

// ============================================================================
// Follow Builders — Publish to Buttondown Newsletter
// ============================================================================
// Sends the digest to all Buttondown subscribers.
//
// Usage:
//   echo "digest text" | node publish-newsletter.js
//   node publish-newsletter.js --file /path/to/digest.md
//
// Env vars: BUTTONDOWN_API_KEY
// ============================================================================

import { readFile } from 'fs/promises';

// -- Read input --------------------------------------------------------------

async function getDigestText() {
  const args = process.argv.slice(2);

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    return await readFile(args[fileIdx + 1], 'utf-8');
  }

  const msgIdx = args.indexOf('--message');
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    return args[msgIdx + 1];
  }

  // Read from stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// -- Extract subject line ----------------------------------------------------

function extractSubject(text) {
  const match = text.match(/^#?\s*AI Builders Digest\s*[—–-]\s*(.+)$/m);
  if (match) return `AI Builders Digest — ${match[1].trim()}`;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  return `AI Builders Digest — ${today}`;
}

// -- Main --------------------------------------------------------------------

async function main() {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    console.error('BUTTONDOWN_API_KEY not set — skipping newsletter');
    console.log(JSON.stringify({ status: 'skipped', reason: 'No API key' }));
    return;
  }

  const digestText = await getDigestText();
  if (!digestText || digestText.trim().length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'Empty digest' }));
    return;
  }

  const subject = extractSubject(digestText);
  const today = new Date().toISOString().split('T')[0];

  // Buttondown accepts markdown natively
  const res = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${apiKey}`
    },
    body: JSON.stringify({
      subject,
      body: digestText,
      status: 'about_to_send',
      metadata: {
        date: today,
        source: 'follow-builders'
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Buttondown API error (HTTP ${res.status}): ${err}`);
  }

  const data = await res.json();
  console.log(JSON.stringify({
    status: 'ok',
    method: 'buttondown',
    emailId: data.id,
    subject,
    message: 'Digest sent to all subscribers'
  }));
}

main().catch(err => {
  console.error('Newsletter publish failed:', err.message);
  process.exit(1);
});
