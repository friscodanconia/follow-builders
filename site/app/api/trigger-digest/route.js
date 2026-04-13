// Vercel Cron endpoint that triggers the GitHub Actions digest workflow.
// Vercel's cron scheduler is far more reliable than GitHub's, so this acts
// as the authoritative daily trigger. The GitHub cron schedules remain as
// secondary redundancy.

export const dynamic = 'force-dynamic';

const GITHUB_OWNER = 'friscodanconia';
const GITHUB_REPO = 'follow-builders';
const WORKFLOW_FILE = 'generate-feed.yml';

export async function GET(request) {
  // Vercel cron sends a Bearer token that matches the CRON_SECRET env var.
  // This prevents anyone else from hitting the endpoint and triggering runs.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const githubToken = process.env.GH_WORKFLOW_TOKEN;
  if (!githubToken) {
    return Response.json({ error: 'GH_WORKFLOW_TOKEN not configured' }, { status: 500 });
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

  if (!res.ok) {
    const body = await res.text();
    return Response.json({
      error: `GitHub API error (HTTP ${res.status})`,
      body,
    }, { status: 500 });
  }

  return Response.json({
    status: 'ok',
    triggered: WORKFLOW_FILE,
    at: new Date().toISOString(),
  });
}
