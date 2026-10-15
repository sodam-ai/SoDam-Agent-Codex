// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {commonSnapshot,commonRolePath,withCommonMutation,saveCommon} from './common-registry.mjs';
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const actions = ['protect','unprotect','disable','enable','archive','restore'];
function blockers(state,agent) {
  return [...(agent.protected?['user-protected']:[]),
    ...(state.claims.some(c=>c.name===agent.name)?['in-use-in-another-or-current-project']:[]),
    ...(['security','support'].includes(agent.kind)?['safety-or-recovery-role']:[]),
    ...(state.agents.some(a=>a.previous===agent.name && ['pilot','confirmed'].includes(a.status))?['active-dependent-version']:[])];
}
export function commonDetails(agent,state=commonSnapshot()) {
  const protectedReasons=blockers(state,agent);
  const replacement=state.agents.find(a=>a.previous===agent.name && a.status==='confirmed');
  return {name:agent.name,type:'common-generated',kind:agent.kind,gap:agent.gap,status:agent.status,
    relativePath:agent.relativePath,sha256:agent.sha256,bytes:fs.statSync(commonRolePath(agent.relativePath,true)).size,
    protected:protectedReasons,recordedUses:agent.recordedUses??0,lastRecordedUse:agent.lastRecordedUse??null,
    usageScope:'Recorded usage across connected projects; not a quality or application certification',
    previous:agent.previous??null,procedure:agent.spec,history:state.history.filter(h=>h.name===agent.name),
    assessment:{decision:protectedReasons.length?'preserve':replacement?'review-only':'insufficient-evidence',
      reasons:[...protectedReasons,...(replacement?['confirmed-successor-exists']:[]),'external-dependencies-and-unique-value-require-owner-review'],
      replacement:replacement?.name??null,externalDependencies:'unknown',automaticChange:false,expectedSpaceFreedBytes:0},
    linkedExperienceIds:[],dependencyScope:'Common registry checked; private project evidence stays in its original project'};
}
export function previewCommon(input) {
  assert.deepEqual(Object.keys(input).sort(),['action','name']);assert.ok(actions.includes(input.action));
  const state=commonSnapshot(),agent=state.agents.find(a=>a.name===input.name);assert.ok(agent,'common agent not found');
  const blocked=['disable','archive'].includes(input.action)?blockers(state,agent):[];
  if(input.action==='disable' && !['pilot','confirmed'].includes(agent.status))blocked.push('not-active');
  if(input.action==='enable' && (agent.status!=='disabled' || !['pilot','confirmed'].includes(agent.managedPreviousStatus)))blocked.push('not-manually-disabled');
  if(input.action==='archive' && !['disabled','superseded'].includes(agent.status))blocked.push('disable-first');
  if(input.action==='restore' && (agent.status!=='archived' || !['disabled','superseded'].includes(agent.managedArchiveStatus)))blocked.push('not-manually-archived');
  if(input.action==='enable' && state.agents.some(a=>a.name!==agent.name && a.gap===agent.gap && ['pilot','confirmed'].includes(a.status)))blocked.push('active-version-exists');
  return {name:agent.name,action:input.action,snapshot:hash(state),scope:'all connected projects',allowed:blocked.length===0,blocked,
    impact:'Common selection changes across projects. Role files and project learning histories remain retained.',
    spaceFreedBytes:0,backupRequired:true};
}
export function manageCommon(input) {
  assert.ok(Object.keys(input).every(k=>['name','action','snapshot','authorize','externalImpactAcknowledged'].includes(k)));
  assert.equal(input.authorize,true,'explicit common management consent required');
  return withCommonMutation(()=>{
    const preview=previewCommon({name:input.name,action:input.action});
    assert.equal(input.snapshot,preview.snapshot,'stale common preview');assert.equal(preview.allowed,true,'common role protected or transition invalid');
    if(['disable','archive'].includes(input.action))assert.equal(input.externalImpactAcknowledged,true);
    const state=commonSnapshot(),agent=state.agents.find(a=>a.name===input.name);
    const folder=path.dirname(path.dirname(path.dirname(commonRolePath(agent.relativePath,true))));
    const backupName=`backup-${crypto.randomUUID()}.json`,file=path.join(folder,backupName);
    const record={schema:1,state,roleContent:fs.readFileSync(commonRolePath(agent.relativePath,true),'utf8')};
    const content=JSON.stringify(record,null,2)+'\n';assert.ok(Buffer.byteLength(content)<=4_000_000);
    fs.writeFileSync(file,content,{flag:'wx'});
    assert.equal(hash(JSON.parse(fs.readFileSync(file,'utf8'))),hash(record),'common backup verification failed');
    if(input.action==='protect')agent.protected=true;
    if(input.action==='unprotect')agent.protected=false;
    if(input.action==='disable'){agent.managedPreviousStatus=agent.status;agent.status='disabled';agent.manualHold=true;}
    if(input.action==='enable'){agent.status=agent.managedPreviousStatus;delete agent.managedPreviousStatus;agent.manualHold=false;}
    if(input.action==='archive'){agent.managedArchiveStatus=agent.status;agent.status='archived';agent.manualHold=true;}
    if(input.action==='restore'){agent.status=agent.managedArchiveStatus;delete agent.managedArchiveStatus;}
    state.history.push({name:agent.name,action:input.action,recordedAt:new Date().toISOString(),backup:backupName,backupSha256:hash(record)});
    saveCommon(state,state.revision);
    const actual=commonSnapshot().agents.find(a=>a.name===agent.name);
    assert.deepEqual(actual,agent,'common management verification failed');
    return {changed:true,name:agent.name,status:agent.status,protected:agent.protected,backup:backupName,
      scope:'all connected projects',verified:true,spaceFreedBytes:0,learningHistoryPreserved:true};
  });
}
