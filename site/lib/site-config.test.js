import test from 'node:test';
import assert from 'node:assert/strict';
import { withSitePrefix, siteConfig } from './site-config.js';

test('site config defaults to the aiupdates subdomain', () => {
  assert.equal(siteConfig.siteUrl, 'https://aiupdates.soumyosinha.com');
});

test('withSitePrefix leaves internal links rooted at the current app host', () => {
  assert.equal(withSitePrefix('/archive'), '/archive');
  assert.equal(withSitePrefix('/topic/agents'), '/topic/agents');
});
