// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Controller} from '../plugins/autonomy-team/runtime/engine.mjs';
import {archive,restore} from '../plugins/autonomy-team/runtime/archive.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-archive-'));
try {
  const c=new Controller(root); c.initialize({authorize:true});
  c.write('.sodam-agent/roles/sample.json',{fixture:true});
  const before=fs.readFileSync(c.safe('.sodam-agent/state.json'));
  const input={authorize:true,destination:'snapshot.json'};
  assert.throws(()=>archive(root,{...input,authorize:false}));
  assert.throws(()=>archive(root,{...input,destination:'.sodam-agent/new.json'}));
  if(process.platform==='win32') {
    assert.throws(()=>archive(root,{...input,destination:'.SODAM-AGENT/new.json'}));
  }
  assert.throws(()=>archive(root,{...input,destination:'../outside.json'}));
  c.write('.sodam-agent/hooks.json',{schema:1,turns:[{status:'open'}]});
  assert.throws(()=>archive(root,input));assert.equal(fs.existsSync(c.safe('snapshot.json')),false);
  c.write('.sodam-agent/hooks.json',{schema:1,turns:[]});
  fs.writeFileSync(c.safe('.sodam-agent/lock'),'');
  assert.throws(()=>archive(root,input));fs.unlinkSync(c.safe('.sodam-agent/lock'));
  const result=archive(root,input);assert.equal(result.files,4);
  assert.equal(result.sourcePreserved,true);assert.throws(()=>archive(root,input));
  const recovery={authorize:true,archive:'snapshot.json',destination:'recovered'};
  if(process.platform==='win32')assert.throws(()=>restore(root,{...recovery,destination:'.SODAM-AGENT/recovery'}));
  assert.equal(restore(root,recovery).recoveryCopyOnly,true);
  assert.deepEqual(fs.readFileSync(c.safe('recovered/state.json')),before);
  assert.deepEqual(fs.readFileSync(c.safe('recovered/roles/sample.json')),fs.readFileSync(c.safe('.sodam-agent/roles/sample.json')));
  assert.throws(()=>restore(root,recovery));assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),before);
  const corrupt=c.read('snapshot.json');corrupt.entries[0].data=Buffer.from('corrupt').toString('base64');c.write('corrupt.json',corrupt);
  assert.throws(()=>restore(root,{...recovery,archive:'corrupt.json',destination:'bad'}));assert.equal(fs.existsSync(c.safe('bad')),false);
  const escaped=c.read('snapshot.json');escaped.entries[0].path='../escape';c.write('escaped.json',escaped);
  assert.throws(()=>restore(root,{...recovery,archive:'escaped.json',destination:'escape-recovery'}));
  const duplicate=c.read('snapshot.json');duplicate.entries.push(duplicate.entries[0]);c.write('duplicate.json',duplicate);
  assert.throws(()=>restore(root,{...recovery,archive:'duplicate.json',destination:'duplicate-recovery'}));
  const originalWrite=fs.writeFileSync;
  fs.writeFileSync=(target,...args)=>{
    if(String(target).includes(path.sep+'storage-failure'+path.sep))throw Object.assign(new Error('simulated disk failure'),{code:'ENOSPC'});
    return originalWrite(target,...args);
  };
  try {assert.throws(()=>restore(root,{...recovery,destination:'storage-failure'}),{code:'ENOSPC'});}
  finally {fs.writeFileSync=originalWrite;}
  assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),before);
  assert.ok(fs.existsSync(c.safe('storage-failure')));
  assert.throws(()=>restore(root,{...recovery,destination:'storage-failure'}));
  fs.writeFileSync(c.safe('.sodam-agent/recovery-large.txt'),Buffer.alloc(3_100_000,65));
  assert.equal(archive(root,{authorize:true,destination:'large-snapshot.json'}).archived,true);
  assert.ok(fs.statSync(c.safe('large-snapshot.json')).size>4_000_000);
  assert.equal(restore(root,{authorize:true,archive:'large-snapshot.json',destination:'large-recovery'}).restored,true);
  assert.deepEqual(fs.readFileSync(c.safe('large-recovery/recovery-large.txt')),fs.readFileSync(c.safe('.sodam-agent/recovery-large.txt')));
  assert.throws(()=>c.write('.sodam-agent/state.json',{padding:'A'.repeat(4_000_000)},false,48_000_000));
  assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),before);
  const policy=c.read('.sodam-agent/policy.json');policy.expiresAt='2000-01-01T00:00:00Z';c.write('.sodam-agent/policy.json',policy);
  archive(root,{...input,destination:'expired.json'});restore(root,{...recovery,archive:'expired.json',destination:'expired-recovery'});
  assert.equal(c.read('expired-recovery/policy.json').expiresAt,policy.expiresAt);assert.throws(()=>c.policy());
  assert.equal(fs.existsSync(c.safe('.sodam-agent/lock')),false);
  console.log('PASS archive/restore: preservation, hashes, nesting, authorization, expiry, open turns, locks, corruption, traversal, duplicate paths, overwrite rejection');
} finally { fs.rmSync(root,{recursive:true,force:true}); }
