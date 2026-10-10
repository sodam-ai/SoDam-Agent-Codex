// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {inspectRuntime} from '../plugins/autonomy-team/runtime/diagnostics.mjs';
import {Bridge} from '../plugins/autonomy-team/runtime/bridge.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-diagnostics-'));
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS: '+name);};
try {
 test('startup metadata is bounded and contains no source contents or environment',()=>{
  const r=inspectRuntime({});assert.equal(r.exit_code,0);assert.equal(r.readOnly,true);assert.match(r.runtime.startupSourceFingerprint,/^[a-f0-9]{64}$/);assert.equal(r.runtime.currentSourceMatchesStartup,true);
  assert.ok(!JSON.stringify(r).includes(process.execPath));assert.equal(r.workspace,undefined);
  for(const bad of [null,[],{extra:true},{workspace:null},{workspace:''},{workspace:'x'.repeat(1001)}])assert.throws(()=>inspectRuntime(bad));
 });
 test('missing authorization is visible without creating state',()=>{
  const r=inspectRuntime({workspace:root});assert.equal(r.workspace.authorization,'missing');assert.equal(r.workspace.learningActive,false);assert.deepEqual(fs.readdirSync(root),[]);
  const b=new Bridge(root);assert.ok(b.event({hook_event_name:'UserPromptSubmit'},'runtime/cli.mjs').hookSpecificOutput.additionalContext.includes('inactive'));
  assert.deepEqual(fs.readdirSync(root),[]);
 });
 test('changed or unreadable runtime is not misreported as a workspace approval error',()=>{
  const copy=path.join(root,'runtime-copy');
  fs.cpSync(fileURLToPath(new URL('../plugins/autonomy-team/runtime/',import.meta.url)),copy,{recursive:true});
  const target=path.join(copy,'diagnostics.mjs'),workspace=path.join(root,'untouched-workspace');fs.mkdirSync(workspace);
  const script=`import fs from 'node:fs';import {inspectRuntime} from ${JSON.stringify(pathToFileURL(target).href)};
    const initial=inspectRuntime({});
    fs.appendFileSync(${JSON.stringify(target)},'\\n// isolated source-change fixture\\n');
    const changed=inspectRuntime({workspace:${JSON.stringify(workspace)}});
    fs.renameSync(${JSON.stringify(target)},${JSON.stringify(target+'.saved')});fs.mkdirSync(${JSON.stringify(target)});
    const unreadable=inspectRuntime({workspace:${JSON.stringify(workspace)}});
    console.log(JSON.stringify({initial,changed,unreadable,files:fs.readdirSync(${JSON.stringify(workspace)})}));`;
  const child=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',timeout:5000});assert.equal(child.status,0,child.stderr);
  const r=JSON.parse(child.stdout);assert.equal(r.initial.runtime.sourceStatus,'current');
  assert.equal(r.changed.runtime.sourceStatus,'changed');assert.equal(r.changed.workspace.diagnostic,'runtime-source-changed');assert.equal(r.changed.workspace.nextAction,'reconnect-runtime');
  assert.equal(r.unreadable.runtime.sourceStatus,'unverified');assert.equal(r.unreadable.workspace.diagnostic,'runtime-source-unreadable');assert.equal(r.unreadable.workspace.nextAction,'review-runtime-files');
  for(const x of [r.changed,r.unreadable]){assert.equal(x.workspace.authorization,'unverified');assert.equal(x.workspace.workEligible,false);assert.equal(x.connection,undefined);}
  assert.deepEqual(r.files,[]);
 });
 const b=new Bridge(root);b.c.initialize({authorize:true,autoPilot:true});
 const snapshot=()=>['policy.json','state.json',...(fs.existsSync(b.c.safe('.sodam-agent/hooks.json'))?['hooks.json']:[])].map(f=>fs.readFileSync(b.c.safe('.sodam-agent/'+f)).toString('base64'));
 test('valid scope and absent journal are distinguished from actual hook execution',()=>{
  const before=snapshot(),r=inspectRuntime({workspace:root});assert.equal(r.workspace.authorization,'valid');assert.equal(r.workspace.hookJournalPresent,false);assert.equal(r.workspace.nextAction,'observe-next-actual-work');assert.deepEqual(snapshot(),before);
 });
 test('missing stages and unknown/failed events are counted without raw data',()=>{
  const e=(type,id,extra={})=>b.event({hook_event_name:type,session_id:'technical-fixture',turn_id:id,...extra},'runtime/cli.mjs');
  const context=e('UserPromptSubmit','one').hookSpecificOutput.additionalContext;const turnKey=context.match(/turnKey=([a-f0-9]{32})/)[1];
  assert.equal(inspectRuntime({workspace:root}).workspace.stageCounts.dispatchMissing,1);
  b.dispatch({turnKey,kind:'docs',goal:'Technical stage inspection'});
  e('PostToolUse','one',{tool_use_id:'unknown',tool_response:{content:'Private fixture text'}});
  e('PostToolUse','one',{tool_use_id:'failed',tool_response:{exit_code:1}});
  const before=snapshot(),r=inspectRuntime({workspace:root});assert.equal(r.workspace.stageCounts.dispatchMissing,0);assert.equal(r.workspace.stageCounts.finishMissing,1);assert.equal(r.workspace.stageCounts.unknownEvents,1);assert.equal(r.workspace.stageCounts.failedEvents,1);assert.ok(!JSON.stringify(r).includes('Private fixture text'));assert.deepEqual(snapshot(),before);
 });
 test('manual verified records cannot establish hook invocation or improvement',()=>{
  const workspace=path.join(root,'manual-only');fs.mkdirSync(workspace);const x=new Bridge(workspace);
  x.c.initialize({authorize:true,autoPilot:true});fs.writeFileSync(path.join(workspace,'proof.md'),'Technical fixture report.');
  x.c.record({id:'manual',taskId:'manual',kind:'docs',outcome:'verified',cause:'none',evidence:['proof.md'],seconds:1,corrections:0});
  const before=fs.readFileSync(x.c.safe('.sodam-agent/state.json'));
  const r=inspectRuntime({workspace}).workspace.workflowEvidence;
  assert.equal(r.recordedExperiences,1);assert.equal(r.registeredTurns,0);assert.equal(r.closedTurns,0);assert.equal(r.verifiedHookExperiences,0);
  assert.equal(r.hostInvocationVerified,false);assert.equal(r.improvementEffectVerified,false);
  assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/state.json')),before);
  const context=x.event({hook_event_name:'UserPromptSubmit',session_id:'fixture',turn_id:'one'},'runtime/cli.mjs').hookSpecificOutput.additionalContext;
  const turnKey=context.match(/turnKey=([a-f0-9]{32})/)[1];x.dispatch({turnKey,kind:'docs',goal:'Technical fixture report'});
  x.event({hook_event_name:'Interrupt',session_id:'fixture',turn_id:'one'},'runtime/cli.mjs');
  const after=inspectRuntime({workspace}).workspace.workflowEvidence;
  assert.equal(after.registeredTurns,1);assert.equal(after.dispatchedTurns,1);assert.equal(after.closedTurns,0);assert.equal(after.verifiedHookExperiences,0);
  assert.equal(after.hostInvocationVerified,false);
 });
 test('expiry, locks and malformed state never auto repair or renew',()=>{
  const p=b.c.policy();b.c.write('.sodam-agent/policy.json',{...p,expiresAt:'2000-01-01T00:00:00Z'});const before=snapshot();assert.equal(inspectRuntime({workspace:root}).workspace.authorization,'expired');assert.deepEqual(snapshot(),before);b.c.write('.sodam-agent/policy.json',p);
  const lock=b.c.safe('.sodam-agent/lock');fs.writeFileSync(lock,'');assert.equal(inspectRuntime({workspace:root}).workspace.locked,true);assert.equal(fs.existsSync(lock),true);fs.unlinkSync(lock);
  const state=b.c.safe('.sodam-agent/state.json'),saved=fs.readFileSync(state);fs.writeFileSync(state,'{');assert.equal(inspectRuntime({workspace:root}).workspace.authorization,'unverified');assert.equal(fs.readFileSync(state,'utf8'),'{');fs.writeFileSync(state,saved);
 });
 test('CLI diagnose does not require a request file or change state',()=>{
  const before=snapshot();const cli=fileURLToPath(new URL('../plugins/autonomy-team/runtime/cli.mjs',import.meta.url));const r=spawnSync(process.execPath,[cli,'diagnose',root],{encoding:'utf8',timeout:5000});assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).result.readOnly,true);assert.deepEqual(snapshot(),before);
 });
 test('new-role cap does not incorrectly block work using an existing role',()=>{
  const workspace=path.join(root,'role-cap');fs.mkdirSync(workspace);const x=new Bridge(workspace);x.c.initialize({authorize:true,autoPilot:true,maxAgents:1});
  for(const id of ['one','two'])x.c.record({id,taskId:id,kind:'docs',gap:'unit-check',outcome:'failed',cause:'missing-role',seconds:1,corrections:1});
  const role=x.c.cycle({kind:'docs',gap:'unit-check'});const r=inspectRuntime({workspace});assert.equal(r.workspace.remaining.roles,0);assert.equal(r.workspace.workEligible,true);assert.equal(r.workspace.newRoleCapacityAvailable,false);assert.equal(r.workspace.nextAction,'reuse-existing-role-without-new-generation');
  fs.writeFileSync(path.join(workspace,'proof.md'),'Technical fixture: unit 5 mm.');x.c.record({id:'applied',taskId:'applied',kind:'docs',gap:'unit-check',agent:role.activated,outcome:'verified',cause:'none',evidence:['proof.md'],seconds:1,corrections:0});assert.equal(x.c.state().experiences.at(-1).outcome,'verified');
 });
 console.log(JSON.stringify({diagnosticGroups:count,actualWorkEffectVerified:false}));
} finally {assert.ok(root.startsWith(os.tmpdir()+path.sep));fs.rmSync(root,{recursive:true,force:true});}
