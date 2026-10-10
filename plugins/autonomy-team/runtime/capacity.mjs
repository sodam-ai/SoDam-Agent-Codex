// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Read-only capacity and archive plan; never renew, prune or unlock automatically.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Controller} from './engine.mjs';
export function capacity(workspace) {
  const c=new Controller(workspace); const p=c.read('.sodam-agent/policy.json'); const state=c.state();
  assert.equal(p.schema,1); assert.equal(p.workspace,c.root);
  assert.ok(Number.isInteger(p.maxExperiences) && p.maxExperiences>=1 && p.maxExperiences<=1000);
  assert.ok(Number.isInteger(p.maxAgents) && p.maxAgents>=1 && p.maxAgents<=20);
  assert.ok(Number.isFinite(Date.parse(p.expiresAt)));
  const journal=fs.existsSync(c.safe('.sodam-agent/hooks.json'))?c.read('.sodam-agent/hooks.json'):null;
  if(journal)assert.ok(Array.isArray(journal.turns));
  const remaining={experiences:Math.max(0,p.maxExperiences-state.experiences.length),roles:Math.max(0,p.maxAgents-state.agents.length-state.candidates.filter(x=>x.status==='candidate').length),turns:Math.max(0,p.maxExperiences-(journal?.turns.length ?? 0))};
  const storageFiles=['policy.json','state.json',...(journal?['hooks.json']:[])].map(f=>({relativePath:'.sodam-agent/'+f,bytes:fs.statSync(c.safe('.sodam-agent/'+f,true)).size,maxBytes:4_000_000}));
  const storage={files:storageFiles,totalBytes:storageFiles.reduce((sum,f)=>sum+f.bytes,0),nearLimit:storageFiles.some(f=>f.bytes>=f.maxBytes*0.8),automaticPruning:false};
  return {storage,readOnly:true,expired:Date.parse(p.expiresAt)<=Date.now(),remaining,limitReached:Object.values(remaining).some(x=>x===0),locked:fs.existsSync(c.safe('.sodam-agent/lock')),openTurns:journal?.turns.filter(t=>t.status==='open').length ?? 0,
    archivePlan:{files:['policy.json','state.json',...(journal?['hooks.json']:[])].map(f=>({relativePath:'.sodam-agent/'+f,sha256:crypto.createHash('sha256').update(fs.readFileSync(c.safe('.sodam-agent/'+f,true))).digest('hex')})),
      includeAllRoleAndRecoveryFiles:true,verifyArchiveBeforeContinuation:true,requiresExplicitAuthorization:true,automaticDeletion:false,automaticRenewal:false},
    assurance:'Read-only bounded metadata. This is not an archive, a consistent snapshot during concurrent writes, or permission to migrate history.'};
}
