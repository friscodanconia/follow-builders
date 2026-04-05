import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStructuredDataset } from '../lib/content-pipeline.js';

test('buildStructuredDataset tags Chinese model items and selects them into sections', async () => {
  const dataset = await buildStructuredDataset({
    digestDate: '2026-04-05',
    feedX: { x: [] },
    feedPodcasts: { podcasts: [] },
    feedBlogs: { blogs: [] },
    externalFeed: {
      articles: [
        {
          id: 'deepseek-1',
          name: 'DeepSeek News',
          sourceGroup: 'china',
          sourceType: 'blog',
          builderOrOrg: 'DeepSeek',
          regionTags: ['china-models'],
          title: 'DeepSeek ships a stronger coding and agent model',
          url: 'https://example.com/deepseek',
          summary: 'DeepSeek improved agent workflows and coding performance.',
          content: 'DeepSeek improved agent workflows and coding performance.',
          publishedAt: '2026-04-05T01:00:00.000Z'
        }
      ]
    }
  });

  assert.equal(dataset.items[0].section, 'Chinese Models');
  assert.ok(dataset.items[0].topics.some((topic) => topic.slug === 'china-models'));
  assert.ok(dataset.selectedItems.some((item) => item.id === 'deepseek-1'));
});
