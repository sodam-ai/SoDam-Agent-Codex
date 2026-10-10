// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Synthetic events, isolated roots. Never a real Desktop invocation receipt.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Controller} from '../plugins/autonomy-team/runtime/engine.mjs';
import {Bridge} from '../plugins/autonomy-team/runtime/bridge.mjs';
import {manageWorkflow} from '../plugins/autonomy-team/runtime/workflow.mjs';
import {bindWorkspace,boundWorkspace} from '../plugins/autonomy-team/runtime/workspace-binding.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-binding-'));
try {
  const source=path.join(root,'host'),target=path.join(root,'work'),missing=path.join(root,'missing');
  for(const directory of [source,target,missing])fs.mkdirSync(directory);
  const c=new Controller(target);c.initialize({authorize:true});
  const request={authorize:true,sessionId:'owned-session',target};
  const event={cwd:source,session_id:request.sessionId};
  assert.equal(boundWorkspace(event),undefined);
  assert.throws(()=>bindWorkspace(source,{...request,authorize:false}));
  assert.throws(()=>bindWorkspace(source,{...request,target:missing}));
  assert.throws(()=>bindWorkspace(source,{...request,extra:true}));
  assert.equal(fs.existsSync(path.join(source,'.sodam-agent')),false);
  assert.equal(bindWorkspace(source,request).created,true);
  assert.equal(bindWorkspace(source,request).created,false);
  assert.throws(()=>bindWorkspace(source,{...request,sessionId:'other'}));
  assert.equal(boundWorkspace({...event,session_id:'other'}),undefined);
  assert.equal(boundWorkspace(event).root,target);
  const entry=fileURLToPath(new URL('../plugins/autonomy-team/hooks/entry.mjs',import.meta.url));
  const call=(name,turn,extra={})=>{
    const result=spawnSync(process.execPath,[entry],{encoding:'utf8',input:JSON.stringify({...event,hook_event_name:name,turn_id:turn,...extra}),timeout:10000});
    assert.equal(result.status,0);return JSON.parse(result.stdout);
  };
  const prompt=call('UserPromptSubmit','first');
  const turnKey=prompt.hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
  const b=new Bridge(target);assert.equal(b.journal().turns.length,1);
  manageWorkflow({workspace:target,operation:'dispatch',request:{turnKey,kind:'docs',goal:'Review saved technical output',learnWhileWorking:true}});
  fs.writeFileSync(path.join(target,'proof.md'),'Bounded reviewed technical output.');
  call('PostToolUse','first',{tool_name:'exec_command',tool_use_id:'work-proof',tool_response:{exit_code:0}});
  const lesson={objective:'Reopen saved technical output',procedure:[{action:'inspect-requirements',detail:'Identify current acceptance checks.'},{action:'verify-output',detail:'Compare the saved output to the current acceptance checks.'}],checks:['Saved output matches the reviewed requirements.']};
  manageWorkflow({workspace:target,operation:'finish',request:{turnKey,outcome:'verified',cause:'none',evidence:['proof.md'],corrections:0,semanticReviewed:true,lesson}});
  assert.deepEqual(call('Stop','first'),{});
  const next=call('UserPromptSubmit','second').hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
  const reuse=manageWorkflow({workspace:target,operation:'dispatch',request:{turnKey:next,kind:'docs',goal:'Review follow-up output',learnWhileWorking:true}});
  assert.equal(reuse.result.reusable.length,1);
  call('Interrupt','second');
  assert.equal(fs.existsSync(path.join(source,'.sodam-agent')),false);
  fs.writeFileSync(path.join(target,'proof.md'),'Changed evidence');assert.equal(b.recall({kind:'docs'}).lessons.length,0);
  const policy=c.read('.sodam-agent/policy.json');c.write('.sodam-agent/policy.json',{...policy,maxRetries:policy.maxRetries===0?1:0});
  assert.throws(()=>boundWorkspace(event));c.write('.sodam-agent/policy.json',policy);
  const bindingPath=path.join(source,'.sodam-workspace-binding.json'),saved=fs.readFileSync(bindingPath,'utf8');
  const data=JSON.parse(saved);
  fs.writeFileSync(bindingPath,JSON.stringify({...data,expiresAt:'2000-01-01T00:00:00Z'}));assert.throws(()=>boundWorkspace(event));
  fs.writeFileSync(bindingPath,JSON.stringify({...data,targetIdentity:'0'.repeat(64)}));assert.throws(()=>boundWorkspace(event));
  fs.writeFileSync(bindingPath,saved);fs.renameSync(source,path.join(root,'original-host'));fs.mkdirSync(source);fs.writeFileSync(bindingPath,saved);assert.throws(()=>boundWorkspace(event));
  console.log('PASS session binding: explicit approval, no source initialization, isolated sessions, exact policy and directory identity, expiry, hook process routing, bounded save and revalidated reuse');
  console.log(JSON.stringify({syntheticEvents:true,actualDesktopInvocationVerified:false}));
} finally {assert.ok(root.startsWith(os.tmpdir()+path.sep));fs.rmSync(root,{recursive:true,force:true});}
