// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Explicit, bounded snapshots. Restore is a non-active recovery copy, never renewal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Controller} from './engine.mjs';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const MAX_BYTES = 32_000_000;
const MAX_FILES = 500;
function request(input, fields) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input));
  assert.ok(Object.keys(input).every(k => fields.includes(k)));
  assert.equal(input.authorize, true);
}
function destination(c, relative) {
  const target = c.safe(relative);
  const normalize = p => process.platform === 'win32' ? p.toLowerCase() : p;
  const compared = normalize(target); const store = normalize(c.store);
  assert.ok(!compared.startsWith(store + path.sep) && compared !== store);
  assert.ok(!fs.existsSync(target), 'destination already exists');
  return target;
}
function snapshot(c) {
  const entries = []; let bytes = 0; let directories = 0;
  function walk(relative,depth=0) {
    assert.ok(depth <= 12 && ++directories <= MAX_FILES,'snapshot directory budget exceeded');
    for (const entry of fs.readdirSync(c.safe(relative), {withFileTypes:true})) {
      if (relative === '.sodam-agent' && entry.name === 'lock') continue;
      const file = relative + '/' + entry.name;
      const target = c.safe(file);
      if (entry.isDirectory()) { walk(file,depth+1); continue; }
      assert.ok(entry.isFile(), 'non-regular snapshot entry');
      const stat = fs.statSync(target); assert.equal(stat.nlink,1,'hardlinked snapshot entry');
      const size = stat.size;
      assert.ok(entries.length < MAX_FILES && bytes + size <= MAX_BYTES, 'snapshot budget exceeded');
      const data = fs.readFileSync(target); bytes += data.length;
      assert.ok(bytes <= MAX_BYTES);
      entries.push({path:file.slice('.sodam-agent/'.length),sha256:hash(data),data:data.toString('base64')});
    }
  }
  walk('.sodam-agent');
  return {schema:1,workspace:c.root,entries};
}
function decode(c, value) {
  assert.equal(value.schema,1); assert.equal(value.workspace,c.root);
  assert.ok(Array.isArray(value.entries) && value.entries.length <= MAX_FILES);
  const seen = new Set(); let total = 0;
  const decoded = value.entries.map(e => {
    assert.ok(e && Object.keys(e).every(k => ['path','sha256','data'].includes(k)));
    assert.ok(typeof e.path === 'string'); c.safe('.sodam-agent/' + e.path);
    const identity = process.platform === 'win32' ? e.path.toLowerCase() : e.path;
    assert.ok(identity !== 'lock' && !seen.has(identity)); seen.add(identity);
    assert.match(e.sha256,/^[a-f0-9]{64}$/);
    assert.ok(typeof e.data === 'string' && e.data.length <= Math.ceil(MAX_BYTES/3)*4);
    const data = Buffer.from(e.data,'base64');
    assert.equal(data.toString('base64'),e.data); assert.equal(hash(data),e.sha256);
    total += data.length; assert.ok(total <= MAX_BYTES);
    return {path:e.path,data};
  });
  for (const file of seen) {
    const parts = file.split('/');
    for(let n=1;n<parts.length;n++)assert.ok(!seen.has(parts.slice(0,n).join('/')),'file/directory collision');
  }
  assert.ok(seen.has('policy.json') && seen.has('state.json'));
  const policy = JSON.parse(decoded.find(e=>e.path==='policy.json').data.toString('utf8'));
  const state = JSON.parse(decoded.find(e=>e.path==='state.json').data.toString('utf8'));
  assert.equal(policy.schema,1); assert.equal(policy.workspace,c.root); assert.equal(state.schema,1);
  assert.ok(Array.isArray(state.experiences) && Array.isArray(state.agents) && Array.isArray(state.candidates));
  return decoded;
}
export function archive(workspace,input) {
  request(input,['authorize','destination']); const c = new Controller(workspace);
  destination(c,input.destination);
  return c.transaction(()=>{
    // An open task must finish/skip through the normal lifecycle before snapshotting.
    if (fs.existsSync(c.safe('.sodam-agent/hooks.json'))) {
      const journal = c.read('.sodam-agent/hooks.json');
      assert.ok(Array.isArray(journal.turns) && !journal.turns.some(t=>t.status==='open'),'open turn');
    }
    c.state(); const value = snapshot(c); decode(c,value);
    c.write(input.destination,value,true,48_000_000);
    decode(c,c.read(input.destination,48_000_000));
    return {archived:true,files:value.entries.length,sha256:hash(fs.readFileSync(c.safe(input.destination,true))),sourcePreserved:true,authorizationRenewed:false};
  });
}
export function restore(workspace,input) {
  request(input,['authorize','archive','destination']); const c = new Controller(workspace);
  const target = destination(c,input.destination);
  const files = decode(c,c.read(input.archive,48_000_000));
  // mkdir without recursive/existing fallback reserves this exact new destination.
  fs.mkdirSync(target);
  try {
    for (const file of files) {
      const relative = input.destination + '/' + file.path;
      const output = c.safe(relative);
      fs.mkdirSync(path.dirname(output),{recursive:true}); c.safe(relative);
      fs.writeFileSync(output,file.data,{flag:'wx'});
      assert.equal(hash(fs.readFileSync(c.safe(relative,true))),hash(file.data));
    }
  } catch (error) {
    // Retain partial recovery files for diagnosis; never erase them or report success.
    throw error;
  }
  return {restored:true,files:files.length,recoveryCopyOnly:true,activeStoreChanged:false,authorizationRenewed:false};
}
