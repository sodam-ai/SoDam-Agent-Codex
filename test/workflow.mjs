// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Bridge} from '../plugins/autonomy-team/runtime/bridge.mjs';
import {manageWorkflow} from '../plugins/autonomy-team/runtime/workflow.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-workflow-'));
let checks=0;
const check=(label,action)=>{action();checks++;console.log(`PASS: ${label}`);};
try {
 const workspace=path.join(root,'project');fs.mkdirSync(workspace);const b=new Bridge(workspace);
 check('no implicit project authorization or arbitrary operations',()=>{
  assert.throws(()=>manageWorkflow({workspace,operation:'dispatch',request:{}}));
  assert.equal(fs.existsSync(path.join(workspace,'.sodam-agent')),false);
 });
 b.c.initialize({authorize:true,autoPilot:true});fs.writeFileSync(path.join(workspace,'proof.md'),'Saved reviewed artifact');
 const event=(name,turn,extra={})=>b.event({hook_event_name:name,session_id:'workflow-test',turn_id:turn,...extra},'installed/runtime/cli.mjs');
 const start=turn=>event('UserPromptSubmit',turn).hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
 const key=start('success');const input={workspace,operation:'dispatch',request:{turnKey:key,kind:'docs',goal:'Review output'}};
 check('invalid schema, excluded kind, arbitrary operation and missing turn preserve state',()=>{
  const state=fs.readFileSync(b.c.safe('.sodam-agent/state.json'));const journal=fs.readFileSync(b.c.safe('.sodam-agent/hooks.json'));
  for(const bad of [null,{}, {...input,extra:'private-test'}, {...input,operation:'initialize'}, {...input,request:{...input.request,excludedKinds:['docs']}}, {...input,request:{...input.request,turnKey:'0'.repeat(32)}}])assert.throws(()=>manageWorkflow(bad));
  assert.deepEqual(fs.readFileSync(b.c.safe('.sodam-agent/state.json')),state);assert.deepEqual(fs.readFileSync(b.c.safe('.sodam-agent/hooks.json')),journal);
 });
 const dispatched=manageWorkflow(input);
 event('PostToolUse','success',{tool_use_id:'dispatch',tool_response:{isError:false,structuredContent:dispatched}});
 const finish={workspace,operation:'finish',request:{turnKey:key,outcome:'verified',cause:'none',evidence:['proof.md'],corrections:0,semanticReviewed:true}};
 check('verified finish requires caller review and actual safe nonempty artifact',()=>{
  assert.throws(()=>manageWorkflow({...finish,request:{...finish.request,semanticReviewed:false}}));
  assert.throws(()=>manageWorkflow({...finish,request:{...finish.request,evidence:['../outside.md']}}));
  fs.writeFileSync(path.join(workspace,'empty.md'),'');assert.throws(()=>manageWorkflow({...finish,request:{...finish.request,evidence:['empty.md']}}));
  assert.equal(b.c.state().experiences.length,0);
 });
 check('dispatch finish persists once, returns real artifact hash and preserves source',()=>{
  const saved=manageWorkflow(finish);assert.equal(saved.exit_code,0);assert.equal(saved.artifacts[0].sha256.length,64);
  assert.equal(manageWorkflow(finish).result.duplicate,true);assert.equal(b.c.state().experiences.length,1);
  assert.equal(fs.readFileSync(path.join(workspace,'proof.md'),'utf8'),'Saved reviewed artifact');
 });
 check('verified MCP finish automatically saves bounded Korean procedure without copying task text',()=>{
  const experience=b.c.state().experiences[0];
  assert.ok(experience.lesson.objective.includes('검증 절차'));
  assert.ok(experience.lesson.procedure.some(step=>step.action==='verify-output'));
  assert.ok(!JSON.stringify(experience.lesson).includes('Saved reviewed artifact'));
  assert.equal(b.recall({kind:'docs'}).lessons.length,1);
  assert.equal(b.recall({kind:'research'}).lessons.length,0);
  fs.writeFileSync(path.join(workspace,'proof.md'),'Changed artifact');
  assert.equal(b.recall({kind:'docs'}).lessons.length,0);
  fs.writeFileSync(path.join(workspace,'proof.md'),'Saved reviewed artifact');
 });
 check('failed and unverified work teaches nothing; explicit lessons and legacy closed records stay unchanged',()=>{
  for(const outcome of ['failed','unverified']) {
   const turnKey=start(outcome+'-record');
   manageWorkflow({...input,request:{...input.request,turnKey}});
   manageWorkflow({...finish,request:{turnKey,outcome,cause:'environment',evidence:[]}});
   assert.equal(b.c.state().experiences.find(e=>e.id===`event-${turnKey}`).lesson,undefined);
  }
  const custom={objective:'검증된 문서의 항목 수를 확인한다.',procedure:[{action:'inspect-requirements',detail:'요청 항목을 확인한다.'},{action:'verify-output',detail:'저장된 항목 수를 대조한다.'}],checks:['항목이 누락되지 않는다.']};
  for(const legacy of [false,true]) {
   const turn=legacy?'legacy':'custom',turnKey=start(turn);
   manageWorkflow({...input,request:{...input.request,turnKey}});
   event('PostToolUse',turn,{tool_use_id:'check',tool_response:{exit_code:0}});
   const request={...finish.request,turnKey,...(!legacy?{lesson:custom}:{})};
   if(legacy) {const direct={...request};delete direct.semanticReviewed;b.finish(direct);}
   else manageWorkflow({...finish,request});
   assert.equal(manageWorkflow({...finish,request}).result.duplicate,true);
   assert.deepEqual(b.c.state().experiences.find(e=>e.id===`event-${turnKey}`).lesson,legacy?undefined:custom);
  }
 });
 check('legacy partial finish recovers without replacing saved experience or adding lesson',()=>{
  const turn='partial-legacy',turnKey=start(turn);
  manageWorkflow({...input,request:{...input.request,turnKey}});
  event('PostToolUse',turn,{tool_use_id:'check',tool_response:{exit_code:0}});
  const request={...finish.request,turnKey},direct={...request};delete direct.semanticReviewed;
  const write=b.c.write.bind(b.c);
  b.c.write=(relative,...args)=>{if(relative==='.sodam-agent/hooks.json')throw new Error('injected journal failure');return write(relative,...args);};
  try {assert.throws(()=>b.finish(direct),/injected journal failure/);} finally {b.c.write=write;}
  const before=b.c.state().experiences.find(e=>e.id===`event-${turnKey}`);
  assert.equal(b.turn(b.journal(),turnKey).status,'open');
  assert.equal(before.lesson,undefined);
  assert.equal(manageWorkflow({...finish,request}).result.recorded,true);
  assert.deepEqual(b.c.state().experiences.find(e=>e.id===`event-${turnKey}`),before);
  assert.equal(b.turn(b.journal(),turnKey).status,'closed');
 });
 check('unresolved failure, absent dispatch, interrupt and expired authorization cannot pass',()=>{
  for(const [turn,mode] of [['failed','failure'],['absent','no-plan'],['interrupted','interrupt']]){
   const turnKey=start(turn);
   if(mode!=='no-plan')manageWorkflow({...input,request:{...input.request,turnKey}});
   event('PostToolUse',turn,{tool_use_id:'success',tool_response:{exit_code:0}});
   if(mode==='failure')event('PostToolUse',turn,{tool_use_id:'failure',tool_response:{exit_code:1}});
   if(mode==='interrupt')event('Interrupt',turn);
   assert.throws(()=>manageWorkflow({...finish,request:{...finish.request,turnKey}}));
  }
  const p=b.c.policy();b.c.write('.sodam-agent/policy.json',{...p,expiresAt:new Date(0).toISOString()});assert.throws(()=>manageWorkflow(input));
 });
 console.log(JSON.stringify({workflowGroups:checks,realModelExecution:false,globalConfigurationChanged:false}));
} finally {assert.ok(root.startsWith(os.tmpdir()+path.sep));fs.rmSync(root,{recursive:true,force:true});}
