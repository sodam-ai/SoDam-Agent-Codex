// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Event-driven archival of terminal history. No scheduler, model or data deletion.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {persistentAreaPolicy} from './areas.mjs';
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const encoded=value=>JSON.stringify(value,null,2)+'\n';
const ledgerPath='.sodam-agent/retention.json';
const indexPath='.sodam-agent/history-index.json';
function checkedFile(c,relative) {
  const target=c.safe(relative,true),stat=fs.statSync(target);
  assert.ok(stat.isFile() && stat.nlink===1 && stat.size<=4_000_000,'unsafe history file');
  return target;
}
function readIndex(c) {
  if(fs.existsSync(c.safe(indexPath)))checkedFile(c,indexPath);
  const index=fs.existsSync(c.safe(indexPath))?c.read(indexPath):{schema:1,batches:0,keys:[]};
  assert.deepEqual(Object.keys(index).sort(),['batches','keys','schema']);assert.equal(index.schema,1);
  assert.ok(Number.isInteger(index.batches) && index.batches>=0 && index.batches<=128);
  assert.ok(Array.isArray(index.keys) && index.keys.length<=32768 && new Set(index.keys).size===index.keys.length);
  for(const key of index.keys)assert.match(key,/^[a-f0-9]{32}$/);
  return index;
}
export function archivedTurn(c,key) {return readIndex(c).keys.includes(key);}
function recover(c) {
  if(!fs.existsSync(c.safe(ledgerPath)))return;
  checkedFile(c,ledgerPath);
  const job=c.read(ledgerPath);if(job.status==='complete')return;
  assert.equal(job.status,'prepared');assert.equal(job.schema,1);
  assert.ok(/^\.sodam-agent-history\/batch-[0-9]+\.json$/.test(job.archive));
  const source=fs.readFileSync(checkedFile(c,job.archive));assert.equal(digest(source),job.sha256);
  const copy=JSON.parse(source.toString('utf8'));assert.equal(copy.workspace,c.root);
  assert.ok(Array.isArray(copy.changes) && copy.changes.length===3);
  assert.equal(new Set(copy.changes.map(change=>change.path)).size,3,'duplicate recovery path');
  for(const change of copy.changes){
    assert.ok(['.sodam-agent/state.json','.sodam-agent/hooks.json',indexPath].includes(change.path));
    if(fs.existsSync(c.safe(change.path)))checkedFile(c,change.path);
    const present=fs.existsSync(c.safe(change.path))?fs.readFileSync(c.safe(change.path,true),'utf8'):null;
    assert.ok(present===change.before || present===encoded(change.after),'history changed during recovery');
  }
  for(const change of copy.changes)c.write(change.path,change.after);
  c.write(ledgerPath,{...job,status:'complete'});
}
export function retainAutomatic(c) {
  const policy=c.policy();
  if(!policy.automaticBinding && !persistentAreaPolicy(c.root,policy))return {status:'not-persistent'};
  return c.transaction(()=>{
    recover(c);
    checkedFile(c,'.sodam-agent/state.json');
    if(fs.existsSync(c.safe('.sodam-agent/hooks.json')))checkedFile(c,'.sodam-agent/hooks.json');
    const state=c.state();
    const journal=fs.existsSync(c.safe('.sodam-agent/hooks.json'))?c.read('.sodam-agent/hooks.json'):{schema:1,turns:[]};
    assert.ok(Array.isArray(journal.turns));
    for(const turn of journal.turns){
      assert.match(turn.key,/^[a-f0-9]{32}$/);
      assert.ok(turn.aliases===undefined || Array.isArray(turn.aliases));
      for(const alias of turn.aliases??[])assert.match(alias,/^[a-f0-9]{32}$/);
    }
    if(journal.turns.some(turn=>['open','incomplete'].includes(turn.status)))return {status:'deferred',reason:'unfinished-work'};
    if(state.experiences.length<policy.maxExperiences && journal.turns.length<policy.maxExperiences)return {status:'not-needed'};
    const protectedIds=new Set(state.candidates.flatMap(candidate=>candidate.basis??[]));
    const protectedTasks=new Set(state.agents.flatMap(agent=>agent.basisTasks??[]));
    // Preserve failures/retries, all role trials/baselines and recent procedure choices.
    const roleScopes=new Set(state.agents.map(agent=>JSON.stringify([agent.kind,agent.gap??null])));
    const recent=new Set(state.experiences.slice(-Math.min(24,Math.max(1,Math.floor(policy.maxExperiences/2)))).map(item=>item.id));
    const scopes=new Map();
    for(const item of [...state.experiences].reverse()){
      const scope=JSON.stringify([item.kind,item.gap??null,item.contextTags??null]);
      const count=scopes.get(scope)??0;if(count<3)recent.add(item.id);scopes.set(scope,count+1);
    }
    const keep=state.experiences.filter(item=>item.outcome!=='verified' || item.agent || protectedIds.has(item.id) || protectedTasks.has(item.taskId) || recent.has(item.id) || roleScopes.has(JSON.stringify([item.kind,item.gap??null])));
    const index=readIndex(c);
    const terminal=journal.turns.filter(turn=>['closed','skipped','interrupted'].includes(turn.status));
    const keys=[...new Set([...index.keys,...terminal.flatMap(turn=>[turn.key,...(turn.aliases??[])])])];
    if(index.batches>=128 || keys.length>32768)return {status:'blocked',reason:'archive-budget'};
    if(keep.length===state.experiences.length && !terminal.length)return {status:'blocked',reason:'protected-history'};
    const changes=[{path:'.sodam-agent/state.json',after:{...state,experiences:keep}},
      {path:'.sodam-agent/hooks.json',after:{...journal,turns:journal.turns.filter(turn=>!terminal.includes(turn))}},
      {path:indexPath,after:{schema:1,batches:index.batches+1,keys}}].map(change=>({...change,before:fs.existsSync(c.safe(change.path))?fs.readFileSync(c.safe(change.path,true),'utf8'):null}));
    const archive=`.sodam-agent-history/batch-${index.batches+1}.json`;
    const payload={schema:1,workspace:c.root,changes};
    assert.ok(Buffer.byteLength(encoded(payload))<=4_000_000,'history archive budget');
    const data=encoded(payload),hash=digest(data);
    if(fs.existsSync(c.safe(archive)))assert.equal(digest(fs.readFileSync(checkedFile(c,archive))),hash,'archive differs');
    else c.write(archive,payload,true);
    assert.equal(digest(fs.readFileSync(c.safe(archive,true))),hash);
    c.write(ledgerPath,{schema:1,status:'prepared',archive,sha256:hash});recover(c);
    return {status:'archived',experiencesArchived:state.experiences.length-keep.length,turnsArchived:terminal.length,archiveSha256:hash,recordsPreserved:true};
  });
}
