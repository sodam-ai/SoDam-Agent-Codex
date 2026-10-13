// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-layout-'));
try {
  const runtime=path.join(root,'autonomy-team','0.3.9','runtime');
  fs.mkdirSync(runtime,{recursive:true});
  fs.copyFileSync(new URL('../plugins/autonomy-team/runtime/role-review.mjs',import.meta.url),path.join(runtime,'role-review.mjs'));
  const {reviewSource}=await import(pathToFileURL(path.join(runtime,'role-review.mjs')).href);
  const skill=path.join(root,'docs-team','0.1.1','skills','docs-team','SKILL.md');
  fs.mkdirSync(path.dirname(skill),{recursive:true});
  fs.writeFileSync(skill,'fixture role');
  const controller={state:()=>({agents:[]})};
  assert.equal(reviewSource(controller,'docs-team',{docs:'docs-team'}).content,'fixture role');
  const duplicate=path.join(root,'docs-team','0.1.2','skills','docs-team','SKILL.md');
  fs.mkdirSync(path.dirname(duplicate),{recursive:true});
  fs.writeFileSync(duplicate,'different fixture');
  assert.throws(()=>reviewSource(controller,'docs-team',{docs:'docs-team'}),/unambiguous/);
  console.log('PASS: versioned installed role resolves and ambiguous versions fail closed');
} finally {fs.rmSync(root,{recursive:true,force:true});}
