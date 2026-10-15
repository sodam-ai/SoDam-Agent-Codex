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
  // This paragraph contains plain text only; synchronize visible text as well
  // as embedded Markdown so HTML readers receive the same lifecycle rules.
  const learningStart=suffix ? 'Reread real output' : '실제 결과 재읽기';
  const learningParagraph=markdown.toString('utf8').split(/\r?\n/).find(line=>line.startsWith(learningStart));
  assert.ok(learningParagraph && html.includes('<p>'+learningStart));
  const learningOffset=html.indexOf('<p>'+learningStart);
  const learningEnd=html.indexOf('</p>',learningOffset);
  assert.ok(learningEnd>learningOffset);
  html=html.slice(0,learningOffset)+'<p>'+escape(learningParagraph)+'</p>'+html.slice(learningEnd+4);
  const capacityStart=suffix ? 'Storage and agent counts' : '저장량과 에이전트 수';
  const capacityParagraph=markdown.toString('utf8').split(/\r?\n/).find(line=>line.startsWith(capacityStart));
  const capacityOffset=html.indexOf('<p>'+capacityStart);
  const capacityEnd=html.indexOf('</p>',capacityOffset);
  assert.ok(capacityParagraph && capacityOffset>=0 && capacityEnd>capacityOffset);
  const capacityHtml=escape(capacityParagraph).replace(/\[([^\]]+)\]\(docs\/CAPACITY_GOVERNANCE.md\)/g,'<a href="docs/CAPACITY_GOVERNANCE.md">$1</a>');
  html=html.slice(0,capacityOffset)+'<p>'+capacityHtml+'</p>'+html.slice(capacityEnd+4);
  html=html.replace(/(id="markdown-source-base64" hidden>)[^<]+/,'$1'+markdown.toString('base64'));
  html=html.replace(/(name="source-sha256" content=")[^"]+/,'$1'+crypto.createHash('sha256').update(markdown).digest('hex'));
  fs.writeFileSync(destination,html);
}
