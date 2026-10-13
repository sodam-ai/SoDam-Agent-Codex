// Copyright 2026 SoDam AI Studio. Apache-2.0. Isolated technical fixtures only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(process.argv[2]!=='isolated') {
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-retention-'));
  try{const home=path.join(base,'home');fs.mkdirSync(home);
    const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'isolated',base],{encoding:'utf8',timeout:30000,env:{...process.env,HOME:home,USERPROFILE:home}});
    process.stdout.write(result.stdout);process.stderr.write(result.stderr);assert.equal(result.status,0);
  }finally{fs.rmSync(base,{recursive:true,force:true});}
}else{
  const {Controller}=await import('../plugins/autonomy-team/runtime/engine.mjs');
  const {configureAutomatic,connectAutomatic}=await import('../plugins/autonomy-team/runtime/automatic.mjs');
  const {retainAutomatic,archivedTurn}=await import('../plugins/autonomy-team/runtime/retention.mjs');
  const {Bridge}=await import('../plugins/autonomy-team/runtime/bridge.mjs');
  const base=process.argv[3],root=path.join(base,'project');fs.mkdirSync(root);
  configureAutomatic({authorize:true,enabled:true,maxExperiences:6});
  const c=new Controller(root);connectAutomatic(c);
  const experiences=Array.from({length:6},(_,i)=>({id:'synthetic-'+i,kind:'docs',taskId:'fixture-'+i,outcome:'verified'}));
  const turns=Array.from({length:6},(_,i)=>({key:String(i).padStart(32,'0'),status:'closed',tools:[]}));
  c.save({schema:1,experiences,candidates:[],agents:[]});c.write('.sodam-agent/hooks.json',{schema:1,turns});
  const result=retainAutomatic(c);assert.equal(result.status,'archived');assert.equal(result.recordsPreserved,true);
  assert.equal(c.state().experiences.length,3);assert.equal(c.read('.sodam-agent/hooks.json').turns.length,0);
  assert.equal(archivedTurn(c,turns[0].key),true);
  const archive=c.read('.sodam-agent-history/batch-1.json');assert.equal(JSON.parse(archive.changes[0].before).experiences.length,6);
  // A crash between file replacements is recoverable without another archive.
  const ledger=c.read('.sodam-agent/retention.json');
  fs.writeFileSync(c.safe('.sodam-agent/state.json'),archive.changes[0].before);
  c.write('.sodam-agent/retention.json',{...ledger,status:'prepared'});
  assert.equal(retainAutomatic(c).status,'not-needed');assert.equal(c.state().experiences.length,3);
  // A linked archive or modified archive must not replace active records.
  const archivePath=c.safe('.sodam-agent-history/batch-1.json'),archiveBytes=fs.readFileSync(archivePath);
  const stateBytes=fs.readFileSync(c.safe('.sodam-agent/state.json'));
  c.write('.sodam-agent/retention.json',{...ledger,status:'prepared'});
  const linked=path.join(root,'linked-fixture.json');fs.linkSync(archivePath,linked);
  assert.throws(()=>retainAutomatic(c),/unsafe history file/);
  assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),stateBytes);fs.unlinkSync(linked);
  fs.writeFileSync(archivePath,'{}');assert.throws(()=>retainAutomatic(c));
  assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),stateBytes);
  fs.writeFileSync(archivePath,archiveBytes);assert.equal(retainAutomatic(c).status,'not-needed');
  const failure={id:'fixture-failed',kind:'docs',taskId:'retry-task',outcome:'failed'};
  c.save({schema:1,experiences:[failure,...experiences],candidates:[{basis:['synthetic-0']}],agents:[]});
  retainAutomatic(c);assert.ok(c.state().experiences.some(item=>item.id===failure.id));assert.ok(c.state().experiences.some(item=>item.id==='synthetic-0'));
  const before=fs.readFileSync(c.safe('.sodam-agent/state.json'));
  c.write('.sodam-agent/hooks.json',{schema:1,turns:[{key:'a'.repeat(32),status:'open'}]});
  assert.equal(retainAutomatic(c).reason,'unfinished-work');assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),before);
  configureAutomatic({authorize:true,enabled:false});assert.throws(()=>retainAutomatic(c));
  assert.throws(()=>new Bridge(root).event({hook_event_name:'SessionStart'},''));
  assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),before);
  console.log('PASS: bounded terminal archival, retained procedures/failures/role basis, partial-write recovery, replay index, unfinished-work and disabled guards; synthetic only');
}
