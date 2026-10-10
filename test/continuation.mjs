// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {Controller} from '../plugins/autonomy-team/runtime/engine.mjs';
import {continueLearning} from '../plugins/autonomy-team/runtime/continuation.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-continuation-'));
try {
 const c=new Controller(root);c.initialize({authorize:true,maxExperiences:1});
 fs.writeFileSync(c.safe('proof.md'),'Reviewed fixture');
 c.record({id:'first',taskId:'first',kind:'docs',outcome:'verified',cause:'none',evidence:['proof.md'],seconds:1,corrections:0});
 const state=fs.readFileSync(c.safe('.sodam-agent/state.json'));const old=c.policy();
 const digest=()=>crypto.createHash('sha256').update(fs.readFileSync(c.safe('.sodam-agent/policy.json'))).digest('hex');
 const input={authorize:true,expectedPolicySha256:digest(),archive:'snapshot.json',maxExperiences:2};
 for(const change of [{authorize:false},{expectedPolicySha256:'0'.repeat(64)},{maxExperiences:1},{maxExperiences:1001},{maxAgents:21},{expiresAt:'2099-01-01'}])assert.throws(()=>continueLearning(root,{...input,...change}));
 assert.equal(fs.existsSync(c.safe('snapshot.json')),false);
 const originalPolicy=Controller.prototype.policy;
 Controller.prototype.policy=function(){const value=originalPolicy.call(this);return {...value,maxAgents:value.maxAgents-1};};
 try{assert.throws(()=>continueLearning(root,input));}finally{Controller.prototype.policy=originalPolicy;}
 assert.equal(fs.existsSync(c.safe('snapshot.json')),false);
 assert.equal(continueLearning(root,input).continued,true);assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),state);assert.equal(c.policy().expiresAt,old.expiresAt);
 assert.throws(()=>continueLearning(root,input));
 c.record({id:'second',taskId:'second',kind:'docs',outcome:'verified',cause:'none',evidence:['proof.md'],seconds:1,corrections:0});assert.equal(c.state().experiences.length,2);
 assert.throws(()=>c.record({id:'third',taskId:'third',kind:'docs',outcome:'verified',cause:'none',evidence:['proof.md'],seconds:1,corrections:0}));
 const savedPolicy=fs.readFileSync(c.safe('.sodam-agent/policy.json'));
 const originalRename=fs.renameSync;
 fs.renameSync=(from,to)=>{if(to===c.safe('.sodam-agent/policy.json'))throw Object.assign(new Error('injected failure'),{code:'ENOSPC'});return originalRename(from,to);};
 try {assert.throws(()=>continueLearning(root,{...input,expectedPolicySha256:digest(),archive:'failed-update.json',maxExperiences:3}),{code:'ENOSPC'});}finally{fs.renameSync=originalRename;}
 assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/policy.json')),savedPolicy);assert.ok(fs.existsSync(c.safe('failed-update.json')));assert.equal(fs.existsSync(c.safe('.sodam-agent/lock')),false);
 const p=c.policy();p.expiresAt='2000-01-01T00:00:00Z';c.write('.sodam-agent/policy.json',p);
 assert.throws(()=>continueLearning(root,{...input,expectedPolicySha256:digest(),archive:'expired.json',maxExperiences:3}));
 console.log('PASS continuation: preserved history, unchanged expiry, explicit budget, stale policy, bounds, write failure recovery and expired authorization');
}finally{fs.rmSync(root,{recursive:true,force:true});}
