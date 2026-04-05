import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDigestMarkdown } from './digests.js';

test('parseDigestMarkdown keeps unsafe HTML as text', () => {
  const blocks = parseDigestMarkdown('Hello <script>alert(1)</script>');

  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[0].lines[0][0].type, 'text');
  assert.equal(blocks[0].lines[0][0].value, 'Hello <script>alert(1)</script>');
});

test('parseDigestMarkdown strips javascript links from markdown links', () => {
  const blocks = parseDigestMarkdown('[bad](javascript:alert(1))');

  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[0].lines[0][0].type, 'text');
  assert.equal(blocks[0].lines[0][0].value, '[bad](javascript:alert(1))');
});

test('parseDigestMarkdown parses links and lists', () => {
  const blocks = parseDigestMarkdown('## Updates\n\n- [safe](https://example.com)');

  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'list');
  assert.equal(blocks[1].items[0][0].type, 'link');
  assert.equal(blocks[1].items[0][0].url, 'https://example.com/');
});
