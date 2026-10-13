// Copyright 2026 SoDam AI Studio. Apache-2.0. Isolated synthetic fixtures only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Controller} from '../plugins/autonomy-team/runtime/engine.mjs';
import {Bridge} from '../plugins/autonomy-team/runtime/bridge.mjs';
import {capacityReview,capacityNotices,configureCapacity} from '../plugins/autonomy-team/runtime/capacity-governance.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-capacity-'));
const c=new Controller(root);c.initialize({authorize:true,maxExperiences:20,maxAgents:2});
const setCount=n=>{const s=c.state();s.experiences=Array.from({length:n},(_,i)=>({id:'synthetic-'+i,taskId:'fixture-'+i,kind:'docs',outcome:'unverified',evidence:[]}));c.save(s);};
setCount(15);assert.equal(capacityNotices(c).notices.length,0);
setCount(16);assert.equal(capacityNotices(c).notices.find(n=>n.id==='experiences').stage,'warning');
assert.equal(capacityNotices(c).notices.length,0);
setCount(19);assert.equal(capacityNotices(c).notices.find(n=>n.id==='experiences').stage,'critical');
setCount(18);assert.equal(capacityNotices(c).notices.length,0);
setCount(19);assert.equal(capacityNotices(c).notices.length,0);
setCount(20);assert.equal(capacityNotices(c).notices.find(n=>n.id==='experiences').stage,'reached');
assert.equal(capacityReview(c).existingWorkAllowed,true);
const before=fs.readFileSync(c.safe('.sodam-agent/state.json'));
assert.throws(()=>configureCapacity(c,{authorize:false,rules:{schema:1,warningPercent:80,criticalPercent:95,protectedAgents:[]}}));
assert.throws(()=>configureCapacity(c,{authorize:true,rules:{schema:1,warningPercent:95,criticalPercent:80,protectedAgents:[]}}));
assert.throws(()=>configureCapacity(c,{authorize:true,rules:{schema:1,warningPercent:80,criticalPercent:95,protectedAgents:['../unsafe']}}));
assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),before);
configureCapacity(c,{authorize:true,rules:{schema:1,warningPercent:75,criticalPercent:90,protectedAgents:['core-role']}});
const s=c.state();s.agents=[{name:'core-role',kind:'security',status:'confirmed'},{name:'rare-role',kind:'docs',status:'disabled'}];c.save(s);
const review=capacityReview(c);assert.equal(review.newRoleCreationAllowed,false);
assert.ok(review.protections[0].reasons.includes('user-protected'));
assert.ok(review.protections[0].reasons.includes('safety-or-recovery-review'));
assert.ok(review.protections.every(p=>!p.eligibleForCleanup));assert.deepEqual(review.cleanupCandidates,[]);
fs.writeFileSync(c.safe('.sodam-agent/lock'),'fixture lock');assert.throws(()=>capacityNotices(c));fs.unlinkSync(c.safe('.sodam-agent/lock'));
// Storage limit closes only this workflow; no false lesson or endless Stop retry.
s.agents=[];c.save(s);const b=new Bridge(root);
const ctx=b.event({hook_event_name:'UserPromptSubmit',session_id:'fixture',turn_id:'capacity',prompt:'fixture'},'runtime/cli.mjs');
const key=ctx.hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
b.dispatch({turnKey:key,kind:'docs',goal:'Capacity fixture'});
const result=b.finish({turnKey:key,outcome:'unverified',cause:'none',evidence:[]});
assert.equal(result.recorded,false);assert.equal(result.learningStored,false);
assert.equal(b.journal().turns[0].status,'closed');assert.equal(c.state().experiences.length,20);
assert.equal(b.finish({turnKey:key,outcome:'unverified',cause:'none',evidence:[]}).recorded,false);
// Valid successful work at capacity must still report that learning was not stored.
fs.writeFileSync(c.safe('proof.md'),'Synthetic capacity acceptance artifact.');
const ctx2=b.event({hook_event_name:'UserPromptSubmit',session_id:'fixture',turn_id:'verified-capacity',prompt:'fixture'},'runtime/cli.mjs');
const key2=ctx2.hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
b.dispatch({turnKey:key2,kind:'docs',goal:'Verified capacity fixture',learnWhileWorking:true});
b.event({hook_event_name:'PostToolUse',session_id:'fixture',turn_id:'verified-capacity',tool_use_id:'proof',tool_response:{exit_code:0}},'runtime/cli.mjs');
const {manageWorkflow}=await import('../plugins/autonomy-team/runtime/workflow.mjs');
const finished=manageWorkflow({workspace:root,operation:'finish',request:{turnKey:key2,outcome:'verified',cause:'none',evidence:['proof.md'],semanticReviewed:true,
  lesson:{objective:'Inspect capacity fixture',procedure:[{action:'inspect-requirements',detail:'Check fixed fields'},{action:'verify-output',detail:'Inspect saved artifact'}],checks:['Fields checked']}}});
assert.equal(finished.result.learningStored,false);assert.equal(finished.result.workOutcome,'verified');
assert.equal(finished.adaptation.reason,'learning-not-stored');assert.equal(c.state().experiences.length,20);
// Injection: notice write failure preserves all existing records and roles.
setCount(0);capacityNotices(c);setCount(20);
const preserved=fs.readFileSync(c.safe('.sodam-agent/state.json')),write=c.write.bind(c);
c.write=(relative,...args)=>{if(relative.endsWith('capacity-notices.json'))throw Object.assign(new Error('fixture'),{code:'ENOSPC'});return write(relative,...args);};
assert.throws(()=>capacityNotices(c),{code:'ENOSPC'});assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),preserved);
assert.equal(fs.existsSync(c.safe('.sodam-agent/lock')),false);
console.log('PASS capacity: threshold boundaries, deduplication, preservation, unknown importance, explicit rules, lock, full storage termination, replay and disk failure; synthetic only');
// Preserve D validation fixture for inspection; normal temporary fixtures are disposable.
if(!process.env.SODAM_KEEP_CAPACITY_FIXTURE)fs.rmSync(root,{recursive:true,force:true});
