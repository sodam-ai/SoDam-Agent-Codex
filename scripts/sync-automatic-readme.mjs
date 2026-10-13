// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Refresh the existing HTML's embedded source and the visible feature notice.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const suffix of ['', '.en']) {
  const markdown=fs.readFileSync(new URL(`README${suffix}.md`,root));
  const notice=markdown.toString('utf8').match(/<!-- automatic-operation-start -->\s*([\s\S]*?)\s*<!-- automatic-operation-end -->/)?.[1];
  assert.ok(notice);
  const destination=new URL(`README${suffix}.html`,root);
  let html=fs.readFileSync(destination,'utf8');
  assert.ok(html.includes('id="markdown-source-base64" hidden>') && html.includes('<main>'));
  html=html.replace(/<section id="automatic-operation">[\s\S]*?<\/section>/,'');
  html=html.replace('<main>',`<main><section id="automatic-operation"><p>${escape(notice).replace(/\[([^\]]+)\]\(docs\/AUTOMATIC_OPERATION.md\)/g,'<a href="docs/AUTOMATIC_OPERATION.md">$1</a>')}</p></section>`);
  html=html.replace(/(id="markdown-source-base64" hidden>)[^<]+/,'$1'+markdown.toString('base64'));
  html=html.replace(/(name="source-sha256" content=")[^"]+/,'$1'+crypto.createHash('sha256').update(markdown).digest('hex'));
  fs.writeFileSync(destination,html);
}
