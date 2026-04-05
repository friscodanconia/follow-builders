import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFeed } from '../lib/feed-validation.js';

test('validateFeed accepts a minimal X feed', () => {
  const errors = validateFeed('x', {
    x: [
      {
        name: 'Example Builder',
        handle: 'example',
        tweets: [
          {
            id: '1',
            text: 'Hello world',
            url: 'https://x.com/example/status/1',
          },
        ],
      },
    ],
  });

  assert.deepEqual(errors, []);
});

test('validateFeed rejects javascript URLs in digest feeds', () => {
  const errors = validateFeed('blogs', {
    blogs: [
      {
        name: 'Unsafe Blog',
        title: 'Bad Link',
        url: 'javascript:alert(1)',
      },
    ],
  });

  assert.ok(errors.some((error) => error.includes('valid http(s) URL')));
});

test('validateFeed accepts null optional fields in external feeds', () => {
  const errors = validateFeed('external', {
    articles: [
      {
        name: 'Example Source',
        title: 'Example Entry',
        url: 'https://example.com/post',
        summary: null,
        content: null,
        publishedAt: null,
      },
    ],
  });

  assert.deepEqual(errors, []);
});
