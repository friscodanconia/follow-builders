#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const ROOT_DIR = join(SCRIPT_DIR, '..');
const HISTORY_DIR = join(ROOT_DIR, 'history');
const SITE_DATA_DIGESTS_DIR = join(ROOT_DIR, 'site', 'data', 'digests');

async function main() {
  await mkdir(SITE_DATA_DIGESTS_DIR, { recursive: true });

  const indexPath = join(HISTORY_DIR, 'index.json');
  if (existsSync(indexPath)) {
    const index = await readFile(indexPath, 'utf-8');
    await writeFile(join(SITE_DATA_DIGESTS_DIR, 'index.json'), index);
  }

  const files = (await readdir(HISTORY_DIR)).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const content = await readFile(join(HISTORY_DIR, file), 'utf-8');
    await writeFile(join(SITE_DATA_DIGESTS_DIR, file), content);
  }

  console.log(JSON.stringify({
    status: 'ok',
    digests: files.length,
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({
    status: 'error',
    message: error.message,
  }));
  process.exit(1);
});
