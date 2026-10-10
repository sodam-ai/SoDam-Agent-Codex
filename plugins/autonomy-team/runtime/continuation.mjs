// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Explicit bounded capacity extension, never pruning or automatic renewal.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Controller} from './engine.mjs';
import {archive} from './archive.mjs';
import {validateAreaPolicy} from './areas.mjs';
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
export function continueLearning(workspace,input) {
  assert.ok(input && typeof input==='object' && !Array.isArray(input));
  assert.ok(Object.keys(input).every(k=>['authorize','expectedPolicySha256','archive','maxExperiences','maxAgents'].includes(k)));
  assert.equal(input.authorize,true);assert.match(input.expectedPolicySha256,/^[a-f0-9]{64}$/);
  const c=new Controller(workspace);
  const next=c.transaction(()=>{
    const bytes=fs.readFileSync(c.safe('.sodam-agent/policy.json',true));
    assert.equal(hash(bytes),input.expectedPolicySha256,'policy changed');
    const policy=c.policy();assert.deepEqual(policy,JSON.parse(bytes.toString('utf8')),'policy changed');
    const value={...policy,maxExperiences:input.maxExperiences??policy.maxExperiences,maxAgents:input.maxAgents??policy.maxAgents};
    assert.ok(Number.isInteger(value.maxExperiences) && value.maxExperiences>=policy.maxExperiences && value.maxExperiences<=1000);
    assert.ok(Number.isInteger(value.maxAgents) && value.maxAgents>=policy.maxAgents && value.maxAgents<=20);
    assert.ok(value.maxExperiences>policy.maxExperiences || value.maxAgents>policy.maxAgents,'no extension requested');
    validateAreaPolicy(c.root,value);
    return value;
  });
  const saved=archive(workspace,{authorize:true,destination:input.archive});
  return c.transaction(()=>{
    c.policy();
    const copy=c.read(input.archive,48_000_000);
    assert.equal(hash(fs.readFileSync(c.safe(input.archive,true))),saved.sha256,'archive changed');
    assert.equal(hash(fs.readFileSync(c.safe('.sodam-agent/policy.json',true))),input.expectedPolicySha256,'policy changed');
    for(const relative of ['policy.json','state.json','hooks.json']) {
      const entry=copy.entries.find(e=>e.path===relative);
      if(entry)assert.equal(hash(fs.readFileSync(c.safe('.sodam-agent/'+relative,true))),entry.sha256,'work changed after archive');
      else assert.equal(fs.existsSync(c.safe('.sodam-agent/'+relative)),false,'work changed after archive');
    }
    c.write('.sodam-agent/policy.json',next);
    assert.deepEqual(c.policy(),next);
    return {continued:true,archiveSha256:saved.sha256,recordsPreserved:true,expiresAt:next.expiresAt,maxExperiences:next.maxExperiences,maxAgents:next.maxAgents,automaticRenewal:false,historyReset:false};
  });
}
