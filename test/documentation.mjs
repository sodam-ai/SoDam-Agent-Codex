// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = new URL('../', import.meta.url);
for (const suffix of ['', '.en']) {
  const markdown = fs.readFileSync(new URL(`README${suffix}.md`, root));
  const html = fs.readFileSync(new URL(`README${suffix}.html`, root), 'utf8');
  const embedded = html.match(/id="markdown-source-base64" hidden>([^<]+)</)?.[1];
  assert.ok(embedded); assert.deepEqual(Buffer.from(embedded, 'base64'), markdown);
  assert.equal(html.match(/name="source-sha256" content="([^"]+)"/)?.[1], crypto.createHash('sha256').update(markdown).digest('hex'));
  assert.ok(html.includes('autonomy-030'));
  assert.ok(html.includes('id="automatic-operation"'), 'persistent operation notice must be visible');
  const visibleMain = html.match(/<main>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(visibleMain?.includes('id="autonomy-039"'), 'Windows MCP release must be visible in both languages');
  assert.ok(visibleMain?.includes('id="autonomy-033"'), 'latest release must be visible, not only embedded');
  assert.ok(visibleMain.includes('id="autonomy-035"'), 'artifact verifier release must be visible');
  assert.ok(visibleMain.includes('id="autonomy-034"'), 'input validation release must be visible');
  assert.ok(visibleMain.includes('id="autonomy-032"'), 'maintenance release must be visible');
  assert.ok(visibleMain.includes('4,000,000'), 'common registry capacity must be visible, not only embedded');
}
assert.deepEqual(fs.readFileSync(new URL('docs/AUTONOMY.md', root)), fs.readFileSync(new URL('plugins/autonomy-team/reference/operating.md', root)));
assert.ok(fs.readFileSync(new URL('.gitignore', root), 'utf8').includes('.sodam-agent/'));
console.log('PASS: Korean/English embedded Markdown, source hashes, autonomy docs and private-state exclusion');
