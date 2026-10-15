// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Advisory policy. No deletion, role mutation, renewal or automatic limit increase.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {capacity} from './capacity.mjs';
import {commonStorageUsage} from './common-registry.mjs';
const file='.sodam-agent/capacity-rules.json';
const ledger='.sodam-agent/capacity-notices.json';
export const DEFAULT_RULES=Object.freeze({schema:1,warningPercent:80,criticalPercent:95,protectedAgents:[]});
function validate(value) {
  assert.deepEqual(Object.keys(value).sort(),['criticalPercent','protectedAgents','schema','warningPercent']);
  assert.equal(value.schema,1);
  assert.ok(Number.isInteger(value.warningPercent) && value.warningPercent>=1 && value.warningPercent<100);
  assert.ok(Number.isInteger(value.criticalPercent) && value.criticalPercent>value.warningPercent && value.criticalPercent<100);
  assert.ok(Array.isArray(value.protectedAgents) && value.protectedAgents.length<=100);
  assert.equal(new Set(value.protectedAgents).size,value.protectedAgents.length);
  for(const name of value.protectedAgents){assert.ok(typeof name==='string' && name.length<=50);assert.match(name,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);}
  return value;
}
export function capacityRules(c) {return validate(fs.existsSync(c.safe(file))?c.read(file):{...DEFAULT_RULES,protectedAgents:[]});}
// Explicit per-project configuration only; an absent consent cannot mutate rules.
export function configureCapacity(c,input) {
  assert.deepEqual(Object.keys(input).sort(),['authorize','rules']);assert.equal(input.authorize,true);
  const rules=validate(input.rules);
  return c.transaction(()=>{c.policy();c.write(file,rules);return {configured:true,rules};});
}
export function capacityReview(c) {
  const report=capacity(c.root),rules=capacityRules(c),policy=c.policy(),state=c.state();
  const journal=fs.existsSync(c.safe('.sodam-agent/hooks.json'))?c.read('.sodam-agent/hooks.json'):{turns:[]};
  const commonStorage=commonStorageUsage();
  const dimensions=[{id:'experiences',used:state.experiences.length,limit:policy.maxExperiences},
    {id:'roles',used:state.agents.length+state.candidates.filter(x=>x.status==='candidate').length,limit:policy.maxAgents},
    {id:'turns',used:journal.turns.length,limit:policy.maxExperiences},
    ...(commonStorage?[commonStorage]:[]),
    ...report.storage.files.map(f=>({id:f.relativePath.split('/').at(-1),used:f.bytes,limit:f.maxBytes})),
    ...(report.storage.inventory.complete?[{id:'archive-files',used:report.storage.inventory.managedFiles,limit:500},
      {id:'archive-bytes',used:report.storage.inventory.managedBytes,limit:32_000_000}]:[])];
  for(const d of dimensions){d.remaining=Math.max(0,d.limit-d.used);d.percent=Math.ceil(d.used/d.limit*100);
    d.stage=d.used>=d.limit?'reached':d.used/d.limit*100>=rules.criticalPercent?'critical':d.used/d.limit*100>=rules.warningPercent?'warning':'normal';}
  // Missing semantic importance/dependency information is never interpreted as expendability.
  const protections=state.agents.map(agent=>({name:agent.name,reasons:[
    ...(rules.protectedAgents.includes(agent.name)?['user-protected']:[]),
    ...(journal.turns.some(t=>['open','incomplete'].includes(t.status) && t.plan?.agent===agent.name)?['in-use']:[]),
    ...(['security','support'].includes(agent.kind)?['safety-or-recovery-review']:[]),
    'importance-and-cross-project-dependencies-not-certified'
  ],eligibleForCleanup:false}));
  const snapshotSha256=crypto.createHash('sha256').update(JSON.stringify({rules,state,journal})).digest('hex');
  return {readOnly:true,dimensions,storageInventory:report.storage.inventory,
    archiveBudget:'archive-files/archive-bytes warn about the existing snapshot export budget, not a new deletion threshold',
    protections,cleanupCandidates:[],snapshotSha256,
    cleanup:{requiresExplicitApproval:true,requiresFreshSnapshot:true,requiresVerifiedBackup:true,automaticDeletion:false,automaticDisable:false},
    concurrency:{managedByWorkspaceLock:true,executionSchedulerProvided:false},
    existingWorkAllowed:true,newRoleCreationAllowed:report.remaining.roles>0,newExperienceStorageAllowed:report.remaining.experiences>0,
    assurance:'No semantic importance or dependency oracle exists. Preserve unknown roles; this snapshot grants no cleanup permission.'};
}
export function capacityNotices(c) {
  return c.transaction(()=>{
    const review=capacityReview(c);
    const old=fs.existsSync(c.safe(ledger))?c.read(ledger):{schema:1,levels:{}};
    assert.deepEqual(Object.keys(old).sort(),['levels','schema']);assert.equal(old.schema,1);
    assert.ok(old.levels && typeof old.levels==='object' && !Array.isArray(old.levels));
    const ids=new Set(review.dimensions.map(d=>d.id));
    for(const [id,entry] of Object.entries(old.levels)){
      assert.ok(ids.has(id) || ['archive-files','archive-bytes','common-registry-bytes'].includes(id));assert.deepEqual(Object.keys(entry).sort(),['limit','stage']);
      assert.ok(Number.isInteger(entry.limit) && entry.limit>0);assert.ok(['normal','warning','critical','reached'].includes(entry.stage));
    }
    const rank={normal:0,warning:1,critical:2,reached:3};
    const notices=review.dimensions.filter(d=>d.stage!=='normal' && (old.levels[d.id]?.limit!==d.limit || rank[d.stage]>rank[old.levels[d.id]?.stage??'normal']));
    const levels=Object.fromEntries(review.dimensions.map(d=>[d.id,{limit:d.limit,stage:d.stage==='normal'?'normal':old.levels[d.id]?.limit===d.limit && rank[old.levels[d.id]?.stage??'normal']>rank[d.stage]?old.levels[d.id].stage:d.stage}]));
    if(JSON.stringify(levels)!==JSON.stringify(old.levels))c.write(ledger,{schema:1,levels});
    return {...review,notices:notices.map(d=>({...d,message:`[소담 한도 알림: ${d.id} ${d.used}/${d.limit} · ${d.stage} · 기존 항목 보존 · 정리 전 승인 필요]`}))};
  });
}
