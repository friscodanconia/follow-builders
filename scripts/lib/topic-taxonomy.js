import { readFile } from 'fs/promises';
import { join } from 'path';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const TOPICS_PATH = join(SCRIPT_DIR, '..', '..', 'config', 'topics.json');

let cachedTopics = null;

export async function loadTopicTaxonomy() {
  if (cachedTopics) return cachedTopics;
  const data = JSON.parse(await readFile(TOPICS_PATH, 'utf-8'));
  cachedTopics = data.topics || [];
  return cachedTopics;
}

export async function tagContent({ title = '', content = '', builderOrOrg = '', regionTags = [] }) {
  const topics = await loadTopicTaxonomy();
  const haystack = `${title}\n${content}\n${builderOrOrg}`.toLowerCase();
  const assigned = [];

  for (const topic of topics) {
    let score = 0;
    const matched = [];

    for (const keyword of topic.keywords || []) {
      if (haystack.includes(keyword.toLowerCase())) {
        score += 1;
        matched.push(keyword);
      }
    }

    for (const regionTag of topic.regionTags || []) {
      if (regionTags.includes(regionTag)) {
        score += 2;
        matched.push(regionTag);
      }
    }

    if (score > 0) {
      assigned.push({
        slug: topic.slug,
        label: topic.label,
        confidence: Math.min(0.95, 0.45 + score * 0.12),
        rationale: matched.slice(0, 3),
        score,
      });
    }
  }

  assigned.sort((a, b) => b.score - a.score || b.confidence - a.confidence);
  return assigned.slice(0, 3);
}

export function topicLabels(topics) {
  return topics.map((topic) => topic.label);
}
