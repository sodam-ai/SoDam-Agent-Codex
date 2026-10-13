// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Bridge} from '../plugins/autonomy-team/runtime/bridge.mjs';
import {manageWorkflow} from '../plugins/autonomy-team/runtime/workflow.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-recovery-'));
let checks=0;
const test=(label,fn)=>{fn();checks++;console.log('PASS: '+label);};
try {
  const b=new Bridge(root);b.c.initialize({authorize:true});
  fs.writeFileSync(path.join(root,'proof.md'),'Verified corrected output.');
  const event=(turn,id,response)=>b.event({hook_event_name:'PostToolUse',session_id:'recovery-test',turn_id:turn,tool_use_id:id,tool_name:'exec_command',tool_response:response},'runtime/cli.mjs');
  const start=turn=>{
    const context=b.event({hook_event_name:'UserPromptSubmit',session_id:'recovery-test',turn_id:turn},'runtime/cli.mjs');
    const turnKey=context.hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
    manageWorkflow({workspace:root,operation:'dispatch',request:{turnKey,kind:'docs',goal:'Check corrected output'}});
    return turnKey;
  };
  const key=start('repaired');
  event('repaired','earlier',{exit_code:0});event('repaired','failed',{exit_code:1});event('repaired','later',{exit_code:0});
  const tools=b.turn(b.journal(),key).tools;
  const input={workspace:root,operation:'resolve-failure',request:{turnKey:key,failedToolKey:tools[1].key,successfulToolKey:tools[2].key,reason:'corrected-input',evidence:['proof.md'],semanticReviewed:true}};
  const finish={workspace:root,operation:'finish',request:{turnKey:key,outcome:'verified',cause:'none',evidence:['proof.md'],semanticReviewed:true}};
  test('unresolved failure cannot be finished as success',()=>assert.throws(()=>manageWorkflow(finish)));
  test('reject earlier success, wrong keys, unknown reason, missing review and escaping evidence',()=>{
    for(const patch of [{successfulToolKey:tools[0].key},{failedToolKey:'0'.repeat(32)},{reason:'permission-bypass'},{semanticReviewed:false},{evidence:['../outside.md']}])assert.throws(()=>manageWorkflow({...input,request:{...input.request,...patch}}));
    assert.equal(b.turn(b.journal(),key).recoveries,undefined);
  });
  test('recovery preserves failure and records only bounded linkage',()=>{
    assert.equal(manageWorkflow(input).result.recorded,true);
    assert.equal(manageWorkflow(input).result.duplicate,true);
    assert.equal(b.turn(b.journal(),key).tools[1].outcome,'failed');
    assert.equal(manageWorkflow(input).result.semanticRecoveryVerified,false);
  });
  test('changed artifact invalidates recovery without removing history',()=>{
    fs.writeFileSync(path.join(root,'proof.md'),'Changed output.');assert.throws(()=>manageWorkflow(finish));
    assert.equal(b.turn(b.journal(),key).recoveries.length,1);
    fs.writeFileSync(path.join(root,'proof.md'),'Verified corrected output.');
  });
  test('another turn cannot supply a successful event',()=>{
    const other=start('other');event('other','success',{exit_code:0});
    const success=b.turn(b.journal(),other).tools[0].key;
    assert.throws(()=>manageWorkflow({...input,request:{...input.request,successfulToolKey:success}}));
  });
  test('checked repair permits finish without semantic certification',()=>{
    const result=manageWorkflow(finish);assert.equal(result.result.recorded,true);
    assert.equal(result.result.recovery.resolvedEvents,1);
    assert.equal(result.result.recovery.semanticRecoveryVerified,false);
    assert.equal(b.turn(b.journal(),key).tools[1].outcome,'failed');
    assert.throws(()=>manageWorkflow(input));
  });
  console.log(JSON.stringify({recoveryGroups:checks,realModelExecution:false}));
}finally{assert.ok(root.startsWith(os.tmpdir()+path.sep));fs.rmSync(root,{recursive:true,force:true});}
