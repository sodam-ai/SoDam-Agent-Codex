// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Read-only capacity and archive plan; never renew, prune or unlock automatically.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Controller} from './engine.mjs';
import {persistentAreaPolicy} from './areas.mjs';
import {storageInventory} from './storage-inventory.mjs';
import {commonLockStatus} from './common-registry.mjs';
import {storeLockStatus} from './store-lock.mjs';
export function capacity(workspace) {
  const c=new Controller(workspace); const p=c.read('.sodam-agent/policy.json'); const state=c.state();
  assert.equal(p.schema,1); assert.equal(p.workspace,c.root);
  assert.ok(Number.isInteger(p.maxExperiences) && p.maxExperiences>=1 && p.maxExperiences<=1000);
  assert.ok(Number.isInteger(p.maxAgents) && p.maxAgents>=1 && p.maxAgents<=20);
  const persistent=Boolean(p.automaticBinding || persistentAreaPolicy(c.root,p));
  if(persistent)c.policy();
  else assert.ok(Number.isFinite(Date.parse(p.expiresAt)));
  const journal=fs.existsSync(c.safe('.sodam-agent/hooks.json'))?c.read('.sodam-agent/hooks.json'):null;
  if(journal)assert.ok(Array.isArray(journal.turns));
  const remaining={experiences:Math.max(0,p.maxExperiences-state.experiences.length),roles:Math.max(0,p.maxAgents-state.agents.length-state.candidates.filter(x=>x.status==='candidate').length),turns:Math.max(0,p.maxExperiences-(journal?.turns.length ?? 0))};
  const storageFiles=['policy.json','state.json',...(journal?['hooks.json']:[])].map(f=>({relativePath:'.sodam-agent/'+f,bytes:fs.statSync(c.safe('.sodam-agent/'+f,true)).size,maxBytes:4_000_000}));
  let inventory;
  try {inventory=storageInventory(c);} catch {inventory={readOnly:true,complete:false,totalBytes:null,reason:'Storage scan safety or budget precondition not satisfied'};}
  const storage={files:storageFiles,totalBytes:storageFiles.reduce((sum,f)=>sum+f.bytes,0),nearLimit:storageFiles.some(f=>f.bytes>=f.maxBytes*0.8),automaticPruning:false,
    inventory,
    options:[{action:'agent-archive',spaceFreedBytes:0,quotaRaised:false},
      {action:'archive',sourcePreserved:true,spaceFreedBytes:0,requiresExplicitAuthorization:true},
      {action:'continue',recordsPreserved:true,maximumExperiences:1000,maximumAgents:20,requiresExplicitAuthorization:true}],
    automaticCleanup:false};
  const commonLock=commonLockStatus();
  return {storage,readOnly:true,expired:persistent?false:Date.parse(p.expiresAt)<=Date.now(),remaining,limitReached:Object.values(remaining).some(x=>x===0),commonLock,locked:commonLock.locked || storeLockStatus(c.safe('.sodam-agent/lock')).locked,openTurns:journal?.turns.filter(t=>t.status==='open').length ?? 0,
    archivePlan:{files:['policy.json','state.json',...(journal?['hooks.json']:[])].map(f=>({relativePath:'.sodam-agent/'+f,sha256:crypto.createHash('sha256').update(fs.readFileSync(c.safe('.sodam-agent/'+f,true))).digest('hex')})),
      includeAllRoleAndRecoveryFiles:true,verifyArchiveBeforeContinuation:true,requiresExplicitAuthorization:true,automaticDeletion:false,automaticRenewal:false},
    assurance:'Read-only bounded metadata. This is not an archive, a consistent snapshot during concurrent writes, or permission to migrate history.'};
}
