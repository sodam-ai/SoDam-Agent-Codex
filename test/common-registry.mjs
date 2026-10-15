// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Disposable technical fixtures, not evidence of real Desktop model behavior.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if(!process.env.SODAM_COMMON_FIXTURE) {
  const home=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-common-home-'));
  try {
    const child=spawnSync(process.execPath,[fileURLToPath(import.meta.url)],{encoding:'utf8',timeout:120000,
      env:{...process.env,HOME:home,USERPROFILE:home,SODAM_COMMON_FIXTURE:'1'}});
    process.stdout.write(child.stdout??'');process.stderr.write(child.stderr??'');
    assert.equal(child.status,0);assert.equal(child.error,undefined);
  } finally {fs.rmSync(home,{recursive:true,force:true});}
} else {
  const {Controller}=await import('../plugins/autonomy-team/runtime/engine.mjs');
  const {configureAutomatic}=await import('../plugins/autonomy-team/runtime/automatic.mjs');
  const {commonSnapshot,commonClaim,withCommonMutation,saveCommon}=await import('../plugins/autonomy-team/runtime/common-registry.mjs');
  const {listAgents,previewAgent,manageAgent}=await import('../plugins/autonomy-team/runtime/agent-management.mjs');
  const {Bridge}=await import('../plugins/autonomy-team/runtime/bridge.mjs');
  const {manageWorkflow}=await import('../plugins/autonomy-team/runtime/workflow.mjs');
  const {agentCatalog}=await import('../plugins/autonomy-team/runtime/agent-catalog.mjs');
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-common-projects-'));
  try {
    configureAutomatic({authorize:true,enabled:true,commonAgents:true});
    const roots=['a','b','c'].map(n=>{const root=path.join(base,n);fs.mkdirSync(root);return root;});
    const controllers=roots.map(root=>{const c=new Controller(root);c.initialize({authorize:true,autoPilot:true});return c;});
    const [a,b,c]=controllers;
    const spec={objective:'Check requirement coverage before reporting completion.',portable:true,
      applicability:{required:['coverage-check'],excluded:[]},
      procedure:[{action:'inspect-requirements',detail:'Compare acceptance items with available output.'},
        {action:'verify-output',detail:'Read the result and verify each acceptance item.'}],
      checks:['Unverified output must remain unverified.']};
    for(const id of ['first','second']) {
      fs.writeFileSync(path.join(a.root,id+'.md'),'Fixture acceptance gap.\n');
      // Reviewed bridge receipt is explicitly fixture-only; never stored in a user's home.
      a.record({id,taskId:id,kind:'docs',gap:'coverage-check',outcome:'failed',cause:'missing-role',
        seconds:1,corrections:0,evidence:[id+'.md'],reflection:spec,contextTags:['coverage-check']},true);
    }
    const candidate=a.propose({kind:'docs',gap:'coverage-check',spec}).candidate;
    assert.equal(commonSnapshot().reservations.length,1);
    assert.throws(()=>b.propose({kind:'research',gap:'coverage-check',spec}));
    a.evaluate({candidate});
    const originalWrite=fs.writeFileSync;
    fs.writeFileSync=function(file,...args){if(String(file).startsWith(a.safe('.sodam-agent/state.json')+'.')){const error=new Error('fixture disk full');error.code='ENOSPC';throw error;}return originalWrite.call(this,file,...args);};
    try {assert.throws(()=>a.promote({candidate}),/fixture disk full/);}finally{fs.writeFileSync=originalWrite;}
    const role=a.promote({candidate}).activated;
    assert.equal(commonSnapshot().agents.length,1);assert.equal(commonSnapshot().reservations.length,0);
    const plan=controller=>controller.plan({taskId:'new-work',kind:'research',gap:'coverage-check',goal:'Check coverage',contextTags:['coverage-check']});
    assert.equal(plan(b).generatedAgent.name,role);assert.equal(plan(c).generatedAgent.name,role);
    assert.equal(b.state().experiences.length,0);assert.equal(commonSnapshot().agents[0].basisTasks.length,0);
    assert.equal(b.plan({taskId:'other-context',kind:'research',gap:'coverage-check',goal:'Check',contextTags:['other']}).generatedAgent,null);
    assert.throws(()=>b.fingerprint([plan(b).generatedAgent.relativePath]));
    assert.equal(listAgents(b,{name:role}).items[0].type,'common-generated');
    const catalog=agentCatalog({projects:roots});
    assert.equal(catalog.commonAgents.length,1);
    assert.ok(catalog.projects.every(p=>!p.items.some(item=>item.name===role)));
    const act=action=>{const preview=previewAgent(b,{name:role,action});return manageAgent(b,{name:role,action,snapshot:preview.snapshot,authorize:true,externalImpactAcknowledged:true});};
    const stale=previewAgent(a,{name:role,action:'disable'});act('protect');
    assert.equal(previewAgent(c,{name:role,action:'disable'}).allowed,false);
    assert.throws(()=>manageAgent(a,{name:role,action:'disable',snapshot:stale.snapshot,authorize:true,externalImpactAcknowledged:true}));
    act('unprotect');commonClaim(a.root,'a'.repeat(32),role);
    assert.ok(previewAgent(b,{name:role,action:'disable'}).blocked.includes('in-use-in-another-or-current-project'));
    commonClaim(a.root,'a'.repeat(32),null,true);
    act('disable');assert.equal(plan(a).generatedAgent,null);assert.equal(plan(c).generatedAgent,null);
    assert.throws(()=>a.propose({kind:'docs',gap:'coverage-check',spec}));
    act('archive');act('restore');act('enable');assert.equal(plan(c).generatedAgent.name,role);
    assert.deepEqual(commonSnapshot().history.map(h=>h.action),['protect','unprotect','disable','archive','restore','enable']);
    const bridge=new Bridge(b.root),session='fixture-new-session';
    const event=(type,id,extra={})=>bridge.event({hook_event_name:type,session_id:session,turn_id:id,...extra},'runtime/cli.mjs');
    const turnKey=event('UserPromptSubmit','one',{prompt:'Fixture request'}).hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
    const dispatch=manageWorkflow({workspace:b.root,operation:'dispatch',request:{turnKey,kind:'research',gap:'coverage-check',goal:'Check coverage',contextTags:['coverage-check'],learnWhileWorking:true}});
    assert.equal(dispatch.result.generatedAgent.name,role);assert.equal(commonSnapshot().claims.length,1);
    const read=manageWorkflow({workspace:b.root,operation:'read-role',request:{turnKey}});
    assert.equal(read.result.sha256,plan(a).generatedAgent.sha256);
    fs.writeFileSync(path.join(b.root,'result.md'),'Fixture result reviewed.\n');
    event('PostToolUse','one',{tool_use_id:'work',tool_name:'exec_command',tool_response:{exit_code:0}});
    const finished=manageWorkflow({workspace:b.root,operation:'finish',request:{turnKey,outcome:'verified',cause:'none',
      evidence:['result.md'],corrections:0,semanticReviewed:true,portableReviewed:true,lesson:spec}});
    assert.equal(finished.result.recorded,true);assert.equal(commonSnapshot().claims.length,0);
    assert.equal(commonSnapshot().agents[0].recordedUses,1);assert.equal(b.state().experiences.length,1);
    // Compare two separate held-out tasks, using local baseline/artifact evidence.
    const quality={criteriaId:'coverage-v1',criteria:1,passed:1,errors:0,definition:['Requirement coverage must be complete.']};
    const runner=new Bridge(c.root);
    const run=(id,lesson=spec,corrections=0)=>{
      const event=(type,extra={})=>runner.event({hook_event_name:type,session_id:'fixture-comparison',turn_id:id,...extra},'runtime/cli.mjs');
      const key=event('UserPromptSubmit').hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
      const dispatch=manageWorkflow({workspace:c.root,operation:'dispatch',request:{turnKey:key,kind:'research',gap:'coverage-check',goal:'Check coverage',
        contextTags:['coverage-check'],learnWhileWorking:true,...(id.startsWith('pair-')?{evaluationTaskId:id}:{})}});
      fs.writeFileSync(path.join(c.root,id+'.md'),'Fixture reviewed complete coverage.\n');
      runner.readRole({turnKey:key});
      const selected=c.state().agents.find(a=>a.name===dispatch.result.generatedAgent.name);
      for(let i=0;i<selected.spec.procedure.length;i++) {
        runner.roleStep({turnKey:key,phase:'begin',stepIndex:i});
        event('PostToolUse',{tool_use_id:id+'-step-'+i,tool_name:'exec_command',tool_response:{exit_code:0}});
        const toolKeys=runner.roleStep({turnKey:key,phase:'begin',stepIndex:i}).eligibleToolKeys;
        runner.roleStep({turnKey:key,phase:'complete',stepIndex:i,toolKeys,evidence:[id+'.md'],semanticReviewed:true});
      }
      for(const name of lesson.agentReview?.reviewedRoles??[])runner.reviewRole({turnKey:key,name});
      return manageWorkflow({workspace:c.root,operation:'finish',request:{turnKey:key,outcome:'verified',cause:'none',evidence:[id+'.md'],
        corrections,semanticReviewed:true,portableReviewed:true,lesson,quality}});
    };
    for(const id of ['pair-one','pair-two']) {
      fs.writeFileSync(path.join(c.root,id+'-baseline.md'),'Fixture complete baseline.\n');
      c.record({id:'baseline-'+id,taskId:'eval-'+id,kind:'research',gap:'coverage-check',outcome:'verified',cause:'none',evidence:[id+'-baseline.md'],
        seconds:30,corrections:3,contextTags:['coverage-check'],quality});
      const result=run(id);assert.equal(result.result.recorded,true);
      if(id==='pair-two')assert.equal(result.adaptation.status,'assessed',JSON.stringify(result.adaptation));
    }
    assert.equal(commonSnapshot().agents.find(a=>a.name===role).status,'confirmed');
    const improved={...spec,improvement:true,procedure:[...spec.procedure,{action:'report-limits',detail:'List any unverified requirement separately.'}],
      agentReview:{action:'refine-existing',reason:'Add explicit unresolved coverage reporting to the shared procedure.',reviewedRoles:['research-team',role]}};
    const refinement=run('corrected-work',improved,1);
    assert.equal(refinement.adaptation.status,'improvement-pilot-created');
    const newer=refinement.adaptation.activated;
    assert.equal(plan(a).generatedAgent.name,newer);assert.equal(plan(b).generatedAgent.name,newer);
    assert.equal(commonSnapshot().agents.find(a=>a.name===role).status,'superseded');
    c.rollback({agent:newer});
    assert.equal(plan(a).generatedAgent.name,role);assert.equal(plan(b).generatedAgent.name,role);
    assert.equal(commonSnapshot().agents.find(a=>a.name===role).status,'confirmed');
    assert.equal(commonSnapshot().agents.find(a=>a.name===newer).status,'disabled');
    const current=commonSnapshot();
    commonClaim(b.root,'b'.repeat(32),role);
    assert.throws(()=>c.rollback({agent:role}),/still in use/);
    commonClaim(b.root,'b'.repeat(32),null,true);
    const stopKey=event('UserPromptSubmit','stopped').hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
    manageWorkflow({workspace:b.root,operation:'dispatch',request:{turnKey:stopKey,kind:'research',gap:'coverage-check',goal:'Check coverage',contextTags:['coverage-check']}});
    assert.equal(commonSnapshot().claims.length,1);
    const alias='c'.repeat(32);
    bridge.mutate(j=>{bridge.turn(j,stopKey).aliases=[alias];});
    bridge.skip({turnKey:alias,reason:'user-stop'});
    assert.equal(commonSnapshot().claims.length,0);
    bridge.skip({turnKey:stopKey,reason:'user-stop'});
    assert.equal(commonSnapshot().claims.length,0);
    withCommonMutation(()=>assert.throws(()=>saveCommon(current,current.revision-1)));
    const lock=path.join(os.homedir(),'.sodam-agent-automatic','agents','lock');
    const {commonLockStatus}=await import('../plugins/autonomy-team/runtime/common-registry.mjs');
    const {capacity}=await import('../plugins/autonomy-team/runtime/capacity.mjs');
    const {inspectRuntime}=await import('../plugins/autonomy-team/runtime/diagnostics.mjs');
    const {statusDisplay,failureDisplay}=await import('../plugins/autonomy-team/runtime/status-display.mjs');
    fs.writeFileSync(lock,'fixture');
    assert.deepEqual(commonLockStatus(),{locked:true,owner:'unknown'});
    assert.throws(()=>c.transaction(()=>{}),error=>error.code==='SODAM_COMMON_LOCKED');
    assert.equal(capacity(c.root).locked,true);
    assert.equal(inspectRuntime({workspace:c.root}).workspace.workEligible,false);
    assert.equal(inspectRuntime({workspace:c.root}).workspace.nextAction,'review-common-lock-owner-before-recovery');
    assert.equal(statusDisplay(c).marker,failureDisplay('common-registry-locked').marker);
    assert.equal(fs.readFileSync(lock,'utf8'),'fixture');
    fs.unlinkSync(lock);
    assert.throws(()=>withCommonMutation(()=>{
      assert.deepEqual(commonLockStatus(),{locked:true,owner:'running'});
      throw new Error('fixture action failure');
    }),/fixture action failure/);
    assert.equal(fs.existsSync(lock),false);
    withCommonMutation(()=>assert.deepEqual(commonLockStatus(),{locked:true,owner:'running'}));
    assert.deepEqual(commonLockStatus(),{locked:false,owner:'none'});
    const serialized=fs.readFileSync(path.join(os.homedir(),'.sodam-agent-automatic','agents','registry.json'),'utf8');
    assert.ok(!serialized.includes(a.root) && !serialized.includes('first.md') && !serialized.includes('second.md'));
    // Capacity notices cover the shared registry and never change its contents.
    const {capacityReview,capacityNotices}=await import('../plugins/autonomy-team/runtime/capacity-governance.mjs');
    const {commonStorageUsage,COMMON_REGISTRY_MAX_BYTES}=await import('../plugins/autonomy-team/runtime/common-registry.mjs');
    const registryFile=path.join(os.homedir(),'.sodam-agent-automatic','agents','registry.json');
    const atSize=bytes=>fs.writeFileSync(registryFile,serialized+' '.repeat(bytes-Buffer.byteLength(serialized)));
    assert.equal(capacityReview(a).dimensions.find(d=>d.id==='common-registry-bytes').limit,COMMON_REGISTRY_MAX_BYTES);
    for(const [bytes,stage] of [[3_199_999,'normal'],[3_200_000,'warning'],[3_800_000,'critical'],[4_000_000,'reached']]) {
      atSize(bytes);
      assert.equal(commonStorageUsage().used,bytes);
      assert.equal(capacityReview(a).dimensions.find(d=>d.id==='common-registry-bytes').stage,stage);
      const notices=capacityNotices(a).notices.filter(d=>d.id==='common-registry-bytes');
      assert.equal(notices.length,stage==='normal'?0:1);
      assert.equal(capacityNotices(a).notices.filter(d=>d.id==='common-registry-bytes').length,0);
      assert.equal(fs.statSync(registryFile).size,bytes);
    }
    assert.equal(capacityReview(b).dimensions.find(d=>d.id==='common-registry-bytes').stage,'reached');
    assert.equal(capacityReview(a).existingWorkAllowed,true);
    fs.writeFileSync(registryFile,serialized);
    assert.equal(capacityNotices(a).notices.filter(d=>d.id==='common-registry-bytes').length,0);
    atSize(3_200_000);
    assert.equal(capacityNotices(a).notices.filter(d=>d.id==='common-registry-bytes').length,1);
    fs.writeFileSync(registryFile,serialized);
    console.log('PASS common registry: shared identity across task kinds/projects, reservations, privacy separation, immutable role, global management/protection, claims, stale revision and lock refusal; synthetic fixtures only');
  } finally {fs.rmSync(base,{recursive:true,force:true});}
}
