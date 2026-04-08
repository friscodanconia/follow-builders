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
import { runtimeConfig } from '../config/runtime-config.js';

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

// -- Convert digest to branded HTML email ------------------------------------

function digestToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const parts = [];
  let storyNum = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Title line: **AI Builders Digest — Date**
    if (trimmed.startsWith('**AI Builders Digest')) {
      continue; // Skip — we have the subject line for this
    }

    // Story headline: **Title**
    const headlineMatch = trimmed.match(/^\*\*(.+)\*\*$/);
    if (headlineMatch) {
      storyNum++;
      parts.push(`<tr><td style="padding: 28px 0 0 0;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #c45d2c; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; line-height: 28px;">${String(storyNum).padStart(2, '0')}</div>
          </td>
          <td style="padding-left: 12px;">
            <p style="margin: 0; font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1a1a; line-height: 1.3;">${headlineMatch[1]}</p>
          </td>
        </tr></table>
      </td></tr>`);
      continue;
    }

    // Why it matters
    const whyMatch = trimmed.match(/^>?\s*\**Why it matters:?\**:?\s*(.+)/i);
    if (whyMatch) {
      parts.push(`<tr><td style="padding: 12px 0 0 40px;">
        <div style="border-left: 2px solid #c45d2c; padding-left: 14px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4a4540;"><strong style="color: #1a1a1a;">Why it matters:</strong> ${whyMatch[1]}</p>
        </div>
      </td></tr>`);
      continue;
    }

    // URL line
    const urlMatch = trimmed.match(/^(https?:\/\/[^\s]+)$/);
    if (urlMatch) {
      parts.push(`<tr><td style="padding: 8px 0 0 40px;">
        <a href="${urlMatch[1]}" style="font-size: 12px; color: #8a8279; text-decoration: none;">Source &rarr;</a>
      </td></tr>`);
      continue;
    }

    // Regular paragraph (editorial intro or story body)
    if (storyNum === 0) {
      // Editorial intro
      parts.push(`<tr><td style="padding: 16px 0 0 0;">
        <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #4a4540;">${trimmed}</p>
      </td></tr>`);
    } else {
      // Story body
      parts.push(`<tr><td style="padding: 10px 0 0 40px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #4a4540;">${trimmed}</p>
      </td></tr>`);
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #faf8f5;">
<tr><td align="center" style="padding: 32px 16px;">
<table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px;">

  <!-- Header -->
  <tr><td style="padding-bottom: 24px; border-bottom: 2px solid #c45d2c;">
    <p style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.02em;">AI Builders Digest</p>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #c45d2c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">${today}</p>
  </td></tr>

  <!-- Content -->
  ${parts.join('\n')}

  <!-- Footer -->
  <tr><td style="padding: 32px 0 0 0; border-top: 1px solid #e8e0d4; margin-top: 24px;">
    <p style="margin: 0; font-size: 13px; color: #8a8279; line-height: 1.6;">Follow builders, not influencers. A daily digest of what matters in AI.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #8a8279;">
      <a href="https://aiupdates.soumyosinha.com" style="color: #c45d2c; text-decoration: none;">Read online</a> &middot;
      <a href="https://aiupdates.soumyosinha.com/archive" style="color: #c45d2c; text-decoration: none;">Archive</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
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

  if (!runtimeConfig.subscribeUrl || runtimeConfig.newsletterProvider.toLowerCase() !== 'buttondown') {
    console.error('Buttondown publish disabled for this fork configuration');
    console.log(JSON.stringify({ status: 'skipped', reason: 'Buttondown not configured for this fork' }));
    return;
  }

  const digestText = await getDigestText();
  if (!digestText || digestText.trim().length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'Empty digest' }));
    return;
  }

  const subject = extractSubject(digestText);
  const today = new Date().toISOString().split('T')[0];

  // Check if we already sent a digest today
  try {
    const checkRes = await fetch('https://api.buttondown.com/v1/emails?page_size=5', {
      headers: { 'Authorization': `Token ${apiKey}` },
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      const results = existing.results || existing;
      const alreadySent = Array.isArray(results) && results.some((email) =>
        email.metadata?.date === today || email.subject?.includes(today)
      );
      if (alreadySent) {
        console.log(JSON.stringify({ status: 'skipped', reason: `Already sent digest for ${today}` }));
        return;
      }
    }
  } catch {
    // If check fails, proceed with sending
  }

  const htmlBody = digestToHtml(digestText);

  const res = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${apiKey}`,
      'X-Buttondown-Live-Dangerously': 'true'
    },
    body: JSON.stringify({
      subject,
      body: htmlBody,
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
