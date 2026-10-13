// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {capacityRules} from './capacity-governance.mjs';
import {ROUTES} from './engine.mjs';
const metaFile='.sodam-agent/agent-management.json';
const pendingFile='.sodam-agent/agent-management-pending.json';
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const names=['protect','unprotect','disable','enable','archive','restore'];
function metadata(c){
  const m=fs.existsSync(c.safe(metaFile))?c.read(metaFile):{schema:1,items:{}};
  assert.deepEqual(Object.keys(m).sort(),['items','schema']);assert.equal(m.schema,1);
  assert.ok(m.items && typeof m.items==='object' && !Array.isArray(m.items));
  for(const [id,x] of Object.entries(m.items)){
    assert.match(id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.deepEqual(Object.keys(x).sort(),['archiveStatus','backup','previousStatus','protected']);
    assert.equal(typeof x.protected,'boolean');
    assert.ok(x.previousStatus===null || ['pilot','confirmed','disabled','superseded'].includes(x.previousStatus));
    assert.ok(x.archiveStatus===null || ['disabled','superseded'].includes(x.archiveStatus));
    assert.ok(x.backup===null || /^\.sodam-agent\/management-backups\/[a-f0-9-]+\.json$/.test(x.backup));
  }
  return m;
}
function snapshot(c){
  assert.equal(fs.existsSync(c.safe(pendingFile)),false,'interrupted management requires recovery');
  c.policy();const state=c.state(),meta=metadata(c),rules=capacityRules(c);
  const journal=fs.existsSync(c.safe('.sodam-agent/hooks.json'))?c.read('.sodam-agent/hooks.json'):{turns:[]};
  const files=state.agents.map(a=>{c.verifyAgent(a);assert.equal(fs.statSync(c.safe(a.relativePath,true)).nlink,1);return {name:a.name,sha256:a.sha256};});
  return {state,meta,rules,journal,token:hash({state,meta,rules,journal,files})};
}
function reasons(s,a){return [
  ...(s.meta.items[a.name]?.protected || s.rules.protectedAgents.includes(a.name)?['user-protected']:[]),
  ...(s.journal.turns.some(t=>['open','incomplete'].includes(t.status) && [t.plan?.agent,t.plan?.generatedAgent?.name].includes(a.name))?['in-use']:[]),
  ...(['security','support'].includes(a.kind)?['safety-or-recovery-role']:[]),
  ...(s.state.agents.some(x=>x.previous===a.name && ['pilot','confirmed'].includes(x.status))?['active-dependent-version']:[])
];}
function assessment(s,a,uses) {
  const blockers=reasons(s,a);
  const replacement=s.state.agents.find(x=>x.previous===a.name && x.status==='confirmed');
  const verified=uses.filter(x=>x.outcome==='verified');
  return {decision:blockers.length?'preserve':replacement?'review-only':'insufficient-evidence',
    reasons:[...blockers,...(replacement?['confirmed-successor-exists']:[]),
      ...(uses.length===0?['no-recorded-use-is-not-proof-of-no-value']:[]),
      'external-dependencies-and-unique-value-require-owner-review'],
    verifiedUses:verified.length,failedUses:uses.filter(x=>x.outcome==='failed').length,
    replacement:replacement?.name??null,uniqueCapability:'unknown',externalDependencies:'unknown',
    suggestedAction:replacement && blockers.length===0 && a.status==='superseded'?'review-archive':null,
    automaticChange:false,expectedSpaceFreedBytes:0};
}
export function listAgents(c,input={}){
  assert.ok(Object.keys(input).every(k=>['query','name'].includes(k)));
  for(const v of Object.values(input))assert.ok(typeof v==='string' && v.length<=100);
  const s=snapshot(c);
  const items=s.state.agents.map(a=>{
    const uses=s.state.experiences.filter(e=>e.agent===a.name);
    return {name:a.name,type:'project-generated',kind:a.kind,status:a.status,
      relativePath:a.relativePath,bytes:fs.statSync(c.safe(a.relativePath,true)).size,
      protected:reasons(s,a),recordedUses:uses.length,lastRecordedUse:uses.at(-1)?.recordedAt??null,
      usageScope:'Active registry only; historical archive use is not aggregated',
      previous:a.previous??null,linkedExperienceIds:uses.map(e=>e.id),
      assessment:assessment(s,a,uses),
      dependencyScope:'local registry checked; external dependencies unknown',
      recommendation:a.status==='superseded' && reasons(s,a).length===0?'Review retained previous version; external impact still requires review':null};
  });
  items.push(...s.state.candidates.filter(x=>x.status==='candidate').map(x=>({name:x.id,type:'candidate',kind:x.kind,status:x.status,management:'evaluation workflow; not an activated agent'})));
  items.push(...Object.entries(ROUTES).map(([kind,route])=>({name:`builtin-${kind}`,type:'provided-workflow',kind,route,status:'defined-route',installation:'not inspected by this list',management:'read-only; host installation is outside this project registry'})));
  return {readOnly:true,snapshot:s.token,items:items.filter(x=>(!input.name || x.name===input.name) && (!input.query || JSON.stringify(x).toLowerCase().includes(input.query.toLowerCase()))),
    scope:'Project registry plus defined built-in routes. Installed host agents are not owned by this controller.',
    cleanupAutomatic:false};
}
export function previewAgent(c,input){
  assert.deepEqual(Object.keys(input).sort(),['action','name']);assert.ok(names.includes(input.action));
  const s=snapshot(c),a=s.state.agents.find(x=>x.name===input.name);assert.ok(a,'agent not found');
  const m=s.meta.items[a.name],blocked=[];
  if(['disable','archive'].includes(input.action))blocked.push(...reasons(s,a));
  if(input.action==='disable' && !['pilot','confirmed'].includes(a.status))blocked.push('not-active');
  if(input.action==='enable' && !(a.status==='disabled' && ['pilot','confirmed'].includes(m?.previousStatus)))blocked.push('not-manually-disabled');
  if(input.action==='enable' && s.state.agents.some(x=>x.name!==a.name && x.kind===a.kind && x.gap===a.gap && ['pilot','confirmed'].includes(x.status)))blocked.push('another-version-active');
  if(input.action==='archive' && !['disabled','superseded'].includes(a.status))blocked.push('disable-before-archive');
  if(input.action==='restore' && !(a.status==='archived' && m?.archiveStatus))blocked.push('not-archived');
  if(input.action==='unprotect' && s.rules.protectedAgents.includes(a.name))blocked.push('protected-by-capacity-rules');
  return {name:a.name,action:input.action,snapshot:s.token,allowed:blocked.length===0,blocked,
    impact:{currentStatus:a.status,externalDependencies:'unknown',spaceFreedBytes:0,
      storage:'Archive preserves the original file and history; it does not free storage or raise quotas.',
      consent:'Explicit target/action/snapshot consent required. Disable/archive also require external-impact acknowledgement.'}};
}
export function manageAgent(c,input){
  assert.ok(Object.keys(input).every(k=>['name','action','snapshot','authorize','externalImpactAcknowledged'].includes(k)));
  assert.equal(input.authorize,true);assert.match(input.snapshot,/^[a-f0-9]{64}$/);
  return c.transaction(()=>{
    const p=previewAgent(c,{name:input.name,action:input.action});assert.equal(p.snapshot,input.snapshot,'stale preview');assert.equal(p.allowed,true,'protected or invalid transition');
    if(['disable','archive'].includes(input.action))assert.equal(input.externalImpactAcknowledged,true);
    const s=snapshot(c),a=s.state.agents.find(x=>x.name===input.name);
    const backup=`.sodam-agent/management-backups/${crypto.randomUUID()}.json`;
    const record={schema:1,name:a.name,action:input.action,state:structuredClone(s.state),metadata:structuredClone(s.meta),
      roleContent:fs.readFileSync(c.safe(a.relativePath,true),'utf8')};
    c.write(backup,record,true);assert.equal(hash(c.read(backup)),hash(record),'backup verification failed');
    c.write(pendingFile,{schema:1,backup,sha256:hash(record)},true);
    const m=s.meta.items[a.name]??{protected:false,previousStatus:null,archiveStatus:null,backup:null};
    if(input.action==='protect')m.protected=true;
    if(input.action==='unprotect')m.protected=false;
    if(input.action==='disable'){m.previousStatus=a.status;a.status='disabled';}
    if(input.action==='archive'){m.archiveStatus=a.status;a.status='archived';}
    if(input.action==='enable'){a.status=m.previousStatus;m.previousStatus=null;}
    if(input.action==='restore'){a.status=m.archiveStatus;m.archiveStatus=null;}
    m.backup=backup;s.meta.items[a.name]=m;
    try {c.save(s.state);c.write(metaFile,s.meta);assert.equal(hash(c.state()),hash(s.state));assert.equal(hash(metadata(c)),hash(s.meta));fs.unlinkSync(c.safe(pendingFile,true));}
    catch(error){c.save(record.state);c.write(metaFile,record.metadata);assert.equal(hash(c.state()),hash(record.state));assert.equal(hash(metadata(c)),hash(record.metadata));fs.unlinkSync(c.safe(pendingFile,true));throw error;}
    return {changed:true,name:a.name,status:a.status,protected:m.protected,backup,verified:true,spaceFreedBytes:0,learningHistoryPreserved:true};
  });
}
export function recoverAgentManagement(c,input){
  assert.deepEqual(Object.keys(input).sort(),['authorize','backupSha256']);assert.equal(input.authorize,true);assert.match(input.backupSha256,/^[a-f0-9]{64}$/);
  return c.transaction(()=>{
    c.policy();const pending=c.read(pendingFile);assert.deepEqual(Object.keys(pending).sort(),['backup','schema','sha256']);assert.equal(pending.schema,1);
    assert.match(pending.backup,/^\.sodam-agent\/management-backups\/[a-f0-9-]+\.json$/);assert.equal(input.backupSha256,pending.sha256);
    const record=c.read(pending.backup);assert.equal(hash(record),pending.sha256);
    for(const a of record.state.agents)c.verifyAgent(a);
    c.save(record.state);c.write(metaFile,record.metadata);assert.equal(hash(c.state()),hash(record.state));assert.equal(hash(metadata(c)),hash(record.metadata));
    fs.unlinkSync(c.safe(pendingFile,true));return {recovered:true,backup:pending.backup,learningHistoryPreserved:true};
  },true);
}
