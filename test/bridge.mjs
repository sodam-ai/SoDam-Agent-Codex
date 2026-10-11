// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Controller, specification } from '../plugins/autonomy-team/runtime/engine.mjs';
import { Bridge } from '../plugins/autonomy-team/runtime/bridge.mjs';
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-bridge-'));
const runtime = fileURLToPath(new URL('../plugins/autonomy-team/runtime/cli.mjs', import.meta.url));
const entry = fileURLToPath(new URL('../plugins/autonomy-team/hooks/entry.mjs', import.meta.url));
let count = 0;
function test(label, fn) { fn(); count++; console.log(`PASS: ${label}`); }
function fixture(name) {
  const dir = path.join(base, name); fs.mkdirSync(dir);
  new Controller(dir).initialize({ authorize: true, autoPilot: true });
  fs.writeFileSync(path.join(dir, 'proof.txt'), 'verified fixture');
  return new Bridge(dir);
}
function event(b, name, turn = 'first', extra = {}) { return b.event({ hook_event_name: name, session_id: 'session', turn_id: turn, ...extra }, runtime); }
function start(b, turn = 'first') { return event(b, 'UserPromptSubmit', turn).hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1]; }
const lesson = { objective: 'Verify saved documents', procedure: [{ action: 'inspect-requirements', detail: 'Read required fields' }, { action: 'verify-output', detail: 'Reopen the saved document' }], checks: ['Required fields exist'] };
try {

  test('learning manager distinguishes unscoped learning from role lifecycle and contextual sharing', () => {
    const x = fixture('manager-readiness');
    const context = event(x, 'UserPromptSubmit', 'manager').hookSpecificOutput.additionalContext;
    assert.ok(context.includes('reference/learning-management.md'));
    const turnKey = context.match(/turnKey=([a-f0-9]{32})/)[1];
    const result = x.dispatch({turnKey, kind:'docs', goal:'Review the current document', learnWhileWorking:true});
    assert.equal(result.management.learningRequested, true);
    assert.equal(result.management.capabilityScoped, false);
    assert.equal(result.management.capabilityReviewRequired, true);
    assert.equal(result.management.contextProvided, false);
    assert.equal(result.management.lifecycleStatus, 'no-capability-gap');
    assert.equal(result.management.procedureExecutionVerified, false);
    assert.equal(x.c.state().agents.length, 0);
    const next = start(x, 'scoped-manager');
    const scoped = x.dispatch({turnKey:next, kind:'docs', goal:'Review the units', gap:'unit-check', contextTags:['unit-table'], learnWhileWorking:true});
    assert.equal(scoped.management.capabilityScoped, true);
    assert.equal(scoped.management.capabilityReviewRequired, false);
    assert.equal(scoped.management.contextProvided, true);
    assert.equal(scoped.management.generatedRoleSelected, false);
    const before = fs.readFileSync(x.c.safe('.sodam-agent/hooks.json'));
    assert.throws(() => x.dispatch({turnKey:next, kind:'docs', goal:'Review the units', gap:'other', contextTags:['unit-table'], learnWhileWorking:true}));
    assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/hooks.json')), before);
    assert.equal(x.c.state().agents.length, 0);
  });
  test('standalone delivery metadata and tool output cannot create a started workflow',()=>{
    const x=fixture('delivery-boundary');const prior=x.c.state();
    for(const name of ['PostToolUse','Stop','Interrupt','functionCallOutput']){
      assert.throws(()=>event(x,name,'delivered',{tool_use_id:'transport',tool_name:'send_message_to_thread',tool_response:{exit_code:0},prompt:'delivered task'}));
      assert.equal(x.journal().turns.length,0);assert.deepEqual(x.c.state(),prior);
    }
    const key=start(x,'direct');const before=fs.readFileSync(x.c.safe('.sodam-agent/hooks.json'));
    assert.throws(()=>event(x,'PostToolUse','delivered',{tool_use_id:'transport',tool_response:{exit_code:0}}));
    assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/hooks.json')),before);
    assert.equal(start(x,'direct'),key);assert.equal(x.journal().turns.length,1);
    assert.throws(()=>x.dispatch({turnKey:'0'.repeat(32),kind:'devops',goal:'Unregistered delivery'}));
    assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/hooks.json')),before);
  });
  test('paired evaluation tasks preserve live turn identity and scope', () => {
    const x = fixture('paired-evaluation');
    for (const turn of ['baseline', 'pilot']) {
      const turnKey = start(x, turn);
      const request = {turnKey, kind:'docs', gap:'saved-fields', goal:'Review identical evaluation requirements', evaluationTaskId:'held-one'};
      assert.equal(x.dispatch(request).taskId, 'eval-held-one');
      const before = fs.readFileSync(x.c.safe('.sodam-agent/hooks.json'));
      for (const bad of ['', null, false, 0, '../escape', 'x'.repeat(41)]) assert.throws(() => x.dispatch({...request, evaluationTaskId:bad}));
      for (const change of [{evaluationTaskId:'other'}, {kind:'research'}, {gap:'other-gap'}, {goal:'Different evaluation'}]) assert.throws(() => x.dispatch({...request,...change}));
      assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/hooks.json')), before);
      event(x, 'PostToolUse', turn, {tool_use_id:'checked',tool_response:{exit_code:0}});
      assert.equal(x.finish({turnKey,outcome:'verified',cause:'none',evidence:['proof.txt']}).recorded,true);
    }
    const records = x.c.state().experiences;
    assert.equal(records.length,2); assert.notEqual(records[0].id,records[1].id);
    assert.equal(records[0].taskId,records[1].taskId);
    const turnKey = start(x, 'changed-scope');
    const before = fs.readFileSync(x.c.safe('.sodam-agent/hooks.json'));
    assert.throws(()=>x.dispatch({turnKey,kind:'docs',gap:'saved-fields',goal:'Different evaluation',evaluationTaskId:'held-one'}));
    assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/hooks.json')),before);
    // Existing journals without new fields retain their original turn task ID.
    const legacyKey = start(x, 'legacy');
    x.dispatch({turnKey:legacyKey,kind:'docs',goal:'Legacy task'});
    x.mutate(j=>{const t=j.turns.find(t=>t.key===legacyKey);delete t.plan.taskId;delete t.plan.goalHash;});
    event(x,'PostToolUse','legacy',{tool_use_id:'checked',tool_response:{exit_code:0}});
    x.finish({turnKey:legacyKey,outcome:'verified',cause:'none',evidence:['proof.txt']});
    assert.equal(x.c.state().experiences.at(-1).taskId,`turn-${legacyKey}`);
  });
  test('separate hook turns feed paired role assessment without caller task IDs at finish', () => {
    const x=fixture('paired-role-assessment');
    const realNow=Date.now; let clock=realNow(); Date.now=()=>clock;
    const run=(turn,id,corrections)=>{
      const turnKey=start(x,turn);
      const plan=x.dispatch({turnKey,kind:'docs',gap:'saved-fields',goal:'Review the same saved fields',evaluationTaskId:id});
      if(plan.generatedAgent){
        x.readRole({turnKey});
        for(let i=0;i<lesson.procedure.length;i++){
          x.roleStep({turnKey,phase:'begin',stepIndex:i});
          event(x,'PostToolUse',turn,{tool_use_id:'step-'+i,tool_name:'exec_command',tool_response:{exit_code:0}});
          const toolKeys=x.roleStep({turnKey,phase:'begin',stepIndex:i}).eligibleToolKeys;
          x.roleStep({turnKey,phase:'complete',stepIndex:i,toolKeys,evidence:['proof.txt'],semanticReviewed:true});
        }
      }
      clock+=1000;
      event(x,'PostToolUse',turn,{tool_use_id:'checked',tool_response:{exit_code:0}});
      x.finish({turnKey,outcome:'verified',cause:'none',evidence:['proof.txt'],corrections,quality:{criteriaId:'saved-fields',criteria:1,passed:1,errors:0,definition:['Required saved fields exist']}});
      return plan;
    };
    try {
      for(const id of ['held-one','held-two']) assert.equal(run('base-'+id,id,2).generatedAgent,null);
      for(let i=0;i<2;i++) x.c.record({id:'failure-'+i,taskId:'origin-'+i,kind:'docs',gap:'saved-fields',outcome:'failed',cause:'missing-role',seconds:1,corrections:1});
      const activated=x.c.cycle({kind:'docs',gap:'saved-fields',spec:lesson});
      assert.throws(()=>x.c.assess({agent:activated.activated}));
      for(const id of ['held-one','held-two']) assert.equal(run('pilot-'+id,id,1).generatedAgent.name,activated.activated);
      assert.equal(x.c.assess({agent:activated.activated}).status,'confirmed');
      const records=x.c.state().experiences.filter(e=>e.outcome==='verified');
      assert.equal(new Set(records.map(e=>e.id)).size,4);
      assert.equal(new Set(records.map(e=>e.taskId)).size,2);
      assert.ok(records.every(e=>e.seconds===1));
      // Synthetic clock/corrections test the contract, not real role effectiveness.
    } finally { Date.now=realNow; }
  });
  test('MCP delivery success cannot mask nested command failure or timeout', () => {
    const cases = [
      [{exitCode: 1, stdout: '', stderr: 'fixture failure', timedOut: false}, 'failed'],
      [{exitCode: 0, timedOut: true}, 'failed'],
      [{exitCode: 0, timedOut: false}, 'executed'],
      [{exitCode: '0'}, 'unknown'],
      [{exitCode: 7, stderr: 'x'.repeat(65536)}, 'unknown'],
    ];
    for (const [index, [metadata, expected]] of cases.entries()) {
      const x = fixture(`nested-${expected}-${index}`);
      const key = start(x); x.dispatch({turnKey: key, kind: 'docs', goal: 'Check actual command status'});
      event(x, 'PostToolUse', 'first', {tool_use_id: 'command', tool_response: {isError: false, content: [{type: 'text', text: JSON.stringify(metadata)}]}});
      assert.equal(x.journal().turns[0].tools[0].outcome, expected);
      if (expected !== 'executed') assert.throws(() => x.finish({turnKey: key, outcome: 'verified', cause: 'none', evidence: ['proof.txt']}));
      else assert.equal(x.finish({turnKey: key, outcome: 'verified', cause: 'none', evidence: ['proof.txt']}).recorded, true);
      assert.ok(!fs.readFileSync(x.c.safe('.sodam-agent/hooks.json'), 'utf8').includes('fixture failure'));
    }
    const x = fixture('nested-over-budget'); const key = start(x);
    x.dispatch({turnKey: key, kind: 'docs', goal: 'Check bounded metadata'});
    event(x, 'PostToolUse', 'first', {tool_use_id: 'oversize', tool_response: {isError: false, content: Array.from({length:5},()=>({type:'text',text:'{"exitCode":0}'}))}});
    assert.equal(x.journal().turns[0].tools[0].outcome, 'unknown');
    assert.throws(()=>x.finish({turnKey:key,outcome:'verified',cause:'none',evidence:['proof.txt']}));
  });
  const b = fixture('normal'); const turnKey = start(b);
  test('absolute installed skill path and no raw prompt persistence', () => {
    const result = event(b, 'UserPromptSubmit', 'first', { prompt: 'private fixture text' });
    assert.ok(result.hookSpecificOutput.additionalContext.includes(path.resolve(path.dirname(runtime), '../skills/autonomy-team/SKILL.md')));
    assert.equal(b.journal().turns.length, 1);
    assert.ok(!fs.readFileSync(b.c.safe('.sodam-agent/hooks.json'), 'utf8').includes('private fixture text'));
  });
  b.dispatch({ turnKey, kind: 'docs', goal: 'Check document' });
  test('verified finish rejects no tool and unknown response', () => {
    event(b, 'PostToolUse', 'first', { tool_use_id: 'unknown', tool_response: { output: 'success' } });
    assert.throws(() => b.finish({ turnKey, outcome: 'verified', cause: 'none', evidence: ['proof.txt'] }));
  });
  event(b, 'PostToolUse', 'first', { tool_use_id: 'known', tool_response: { structuredContent: { exit_code: 0 } } });
  const finish = { turnKey, outcome: 'verified', cause: 'none', evidence: ['proof.txt'], lesson };
  test('verified finish measured once; duplicate events and finish are idempotent', () => {
    event(b, 'PostToolUse', 'first', { tool_use_id: 'known', tool_response: { exit_code: 1 } });
    assert.equal(b.journal().turns[0].tools.length, 2);
    assert.equal(b.finish(finish).recorded, true);
    assert.equal(b.finish(finish).duplicate, true);
    assert.equal(b.c.state().experiences.length, 1);
    assert.deepEqual(event(b, 'Stop'), {});
    assert.throws(() => b.finish({ ...finish, corrections: 2 }));
  });
  test('fresh session recalls verified lesson; changed artifact invalidates recall', () => {
    assert.equal(new Bridge(b.c.root).recall().lessons.length, 1);
    fs.writeFileSync(b.c.safe('proof.txt'), 'changed');
    assert.equal(b.recall().lessons.length, 0);
  });
  test('recall bounds artifact reads once three recent valid lessons are found', () => {
    const x = fixture('recall-cost');
    for (let index = 0; index < 10; index++) {
      fs.writeFileSync(x.c.safe(`proof-${index}.txt`), `output ${index}`);
      x.c.record({ id: `lesson-${index}`, taskId: `task-${index}`, kind: 'docs', outcome: 'verified', cause: 'none', seconds: 1, corrections: 0, evidence: [`proof-${index}.txt`], lesson: { ...lesson, objective: `Case ${index}` } });
    }
    const original = x.c.fingerprint.bind(x.c); let reads = 0;
    x.c.fingerprint = evidence => { reads += evidence.length; return original(evidence); };
    assert.deepEqual(x.recall().lessons.map(item => item.lesson.objective), ['Case 7', 'Case 8', 'Case 9']);
    assert.equal(reads, 3);
    reads = 0; fs.writeFileSync(x.c.safe('proof-9.txt'), 'changed');
    assert.deepEqual(x.recall().lessons.map(item => item.lesson.objective), ['Case 6', 'Case 7', 'Case 8']);
    assert.equal(reads, 4);
  });
  test('dispatch recalls relevant experience before applying the three-lesson limit', () => {
    const x = fixture('relevant-recall');
    x.c.record({ id: 'docs-lesson', taskId: 'docs-task', kind: 'docs', outcome: 'verified', cause: 'none', seconds: 1, corrections: 0, evidence: ['proof.txt'], lesson });
    for (let index = 0; index < 3; index++) x.c.record({ id: `other-${index}`, taskId: `other-task-${index}`, kind: 'research', outcome: 'verified', cause: 'none', seconds: 1, corrections: 0, evidence: ['proof.txt'], lesson });
    const k = start(x);
    assert.equal(x.dispatch({ turnKey: k, kind: 'docs', goal: 'Check document' }).reusable.length, 1);
    assert.equal(x.dispatch({ turnKey: k, kind: 'docs', gap: undefined, goal: 'Check document' }).reusable[0].kind, 'docs');
  });
  test('kind-only recall defaults gap without accepting invalid values or other kinds', () => {
    const x = fixture('optional-recall');
    x.c.record({ id: 'docs-only', taskId: 'docs-only', kind: 'docs', outcome: 'verified', cause: 'none', seconds: 1, corrections: 0, evidence: ['proof.txt'], lesson });
    x.c.record({ id: 'research-only', taskId: 'research-only', kind: 'research', outcome: 'verified', cause: 'none', seconds: 1, corrections: 0, evidence: ['proof.txt'], lesson });
    assert.deepEqual(x.recall({ kind: 'docs' }), x.recall({ kind: 'docs', gap: null }));
    assert.deepEqual(x.recall({ kind: 'docs' }).lessons.map(item => item.kind), ['docs']);
    for (const gap of ['', false, 0, [], {}]) assert.throws(() => x.recall({ kind: 'docs', gap }));
    assert.throws(() => x.recall({ kind: 'docs', privateField: 'not-for-output' }));
  });
  test('recall rejects a tampered active role before publishing its availability', () => {
    const x = fixture('active-role-recall');
    for (let index = 0; index < 2; index++) x.c.record({ id: `failure-${index}`, taskId: `failed-task-${index}`, kind: 'docs', gap: 'saved-fields', outcome: 'failed', cause: 'missing-role', seconds: 1, corrections: 0 });
    const activated = x.c.cycle({ kind: 'docs', gap: 'saved-fields', spec: lesson });
    assert.equal(x.recall().activeRoles.length, 1);
    fs.appendFileSync(x.c.safe(activated.relativePath), '\nChanged role content\n');
    assert.throws(() => x.recall());
    assert.throws(() => event(x, 'SessionStart'));
    assert.equal(x.c.state().agents[0].status, 'pilot');
  });
  test('invalid optional values reject before changing dispatch journal or state', () => {
    for (const [index, [field, value]] of [...['', 0, false, null].map(value => ['gap', value]), ...['', 0, false, null].map(value => ['excludedKinds', value])].entries()) {
      const x = fixture(`invalid-option-${index}`); const k = start(x);
      const before = fs.readFileSync(x.c.safe('.sodam-agent/hooks.json'));
      const stateBefore = fs.readFileSync(x.c.safe('.sodam-agent/state.json'));
      assert.throws(() => x.dispatch({ turnKey: k, kind: 'docs', goal: 'Check fields', [field]: value }));
      assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/hooks.json')), before);
      assert.deepEqual(fs.readFileSync(x.c.safe('.sodam-agent/state.json')), stateBefore);
      assert.throws(() => x.c.plan({ taskId: 'check-options', kind: 'docs', goal: 'Check fields', [field]: value }));
      assert.equal(x.dispatch({ turnKey: k, kind: 'docs', goal: 'Check fields', excludedKinds: [] }).kind, 'docs');
    }
  });
  test('new Codex continuation turn aliases original; second stop cannot block again', () => {
    const x = fixture('continuation'); const k = start(x);
    const stop = event(x, 'Stop'); assert.equal(stop.decision, 'block');
    assert.equal(start(x, 'second'), x.journal().turns[1].key);
    // A normal user request remains distinct. Only the exact owned prompt aliases.
    const continuation = event(x, 'UserPromptSubmit', 'third', { prompt: stop.reason });
    assert.ok(continuation.hookSpecificOutput.additionalContext.includes(k));
    assert.equal(x.journal().turns.length, 2);
    event(x, 'PostToolUse', 'third', { tool_use_id: 'continued', tool_response: { exit_code: 0 } });
    assert.equal(x.journal().turns[0].tools.length, 1);
    assert.equal(event(x, 'Stop', 'third').decision, undefined);
    assert.equal(x.journal().turns[0].status, 'incomplete');
  });
  test('interrupt stops continuation; unresolved failure cannot become successful', () => {
    const x = fixture('interrupted'); const k = start(x);
    x.dispatch({ turnKey: k, kind: 'docs', goal: 'Check' });
    event(x, 'PostToolUse', 'first', { tool_use_id: 'failed', tool_response: { exit_code: 1 } });
    assert.throws(() => x.finish({ turnKey: k, outcome: 'verified', cause: 'none', evidence: ['proof.txt'] }));
    assert.equal(event(x, 'Stop').decision, undefined);
    const y = fixture('cancel'); start(y); event(y, 'Interrupt');
    assert.deepEqual(event(y, 'Stop'), {});
  });
  test('Desktop input_text arrays require complete bounded execution metadata', () => {
    const banner={type:'input_text',text:'Script completed\nWall time 1.2 seconds\nOutput:\n'};
    const block=value=>({type:'input_text',text:JSON.stringify(value)});
    const cases=[
      [[banner,block({exit_code:0})],'executed'],
      [[banner,block({exit_code:0}),block({exit_code:2})],'failed'],
      [[banner,block({exit_code:0,structuredContent:{exit_code:1}})],'failed'],
      [[banner],'unknown'],
      [[banner,block({session_id:1})],'unknown'],
      [[banner,block({exit_code:'0'})],'unknown'],
      [[banner,block({exit_code:0}),{type:'input_text',text:'success'}],'unknown'],
      [[banner,block({isError:false})],'unknown'],
      [[{type:'input_text',text:'Script failed\nScript error: unavailable'}],'failed'],
      [[banner,block({exit_code:0}),block({exit_code:0}),block({exit_code:0}),block({exit_code:0})],'unknown'],
      [[banner,{type:'input_text',text:' '.repeat(65537)}],'unknown'],
    ];
    for(const [index,[response,expected]] of cases.entries()) {
      const x=fixture('desktop-array-'+index),k=start(x);
      x.dispatch({turnKey:k,kind:'docs',goal:'Interpret bounded host metadata'});
      event(x,'PostToolUse','first',{tool_use_id:'array-event',tool_name:'functions.exec',tool_response:response});
      assert.equal(x.journal().turns[0].tools[0].outcome,expected);
      assert.equal(x.journal().turns[0].tools[0].workTool,false);
      if(expected!=='executed')assert.throws(()=>x.finish({turnKey:k,outcome:'verified',cause:'none',evidence:['proof.txt']}));
      else assert.equal(x.finish({turnKey:k,outcome:'verified',cause:'none',evidence:['proof.txt']}).recorded,true);
    }
  });
  test('observed Bash text remains unknown; typed shell result is attributable',()=>{
    for(const [label,response,expected] of [['text','success','unknown'],['stdout-json','{"exit_code":0}','unknown'],['typed',{exit_code:0},'executed'],['failed',{exit_code:1},'failed']]) {
      const x=fixture('bash-'+label),k=start(x);
      event(x,'PostToolUse','first',{tool_use_id:'bash-event',tool_name:'Bash',tool_response:response});
      const receipt=x.journal().turns[0].tools[0];
      assert.equal(receipt.outcome,expected);assert.equal(receipt.workTool,true);assert.equal(receipt.toolName,'Bash');
      assert.equal(receipt.unknownReason,expected==='unknown'?'execution-metadata-missing':undefined);
      assert.ok((receipt.responseHeader??[]).every(part=>part!=='success'));
    }
    const x=fixture('private-name');start(x);
    event(x,'PostToolUse','first',{tool_use_id:'private-name',tool_name:'secret=fixture-private',tool_response:'fixture-private-response'});
    const stored=JSON.stringify(x.journal());assert.ok(!stored.includes('fixture-private'));
  });
  test('file content arrays cannot become execution proof',()=>{
    for(const name of ['read_file','write_file','exec_command']) {
      const x=fixture('non-code-array-'+name),k=start(x);
      x.dispatch({turnKey:k,kind:'docs',goal:'Reject content as execution evidence'});
      event(x,'PostToolUse','first',{tool_use_id:'content-array',tool_name:name,tool_response:[{type:'input_text',text:'{"exit_code":0}'}]});
      assert.equal(x.journal().turns[0].tools[0].outcome,'unknown');
      assert.throws(()=>x.finish({turnKey:k,outcome:'verified',cause:'none',evidence:['proof.txt']}));
    }
  });
  test('host code-mode text requires one complete structured result and preserves errors',()=>{
    const wrap=data=>'Script completed\nWall time 1.2 seconds\nOutput:\n'+data;
    const cases=[
      [wrap(JSON.stringify({exit_code:0})),'functions.exec','executed'],
      [JSON.stringify({exit_code:0}),'functions.exec','executed'],
      [JSON.stringify({exit_code:1}),'functions.exec','failed'],
      [JSON.stringify({exit_code:0}),'read_file','unknown'],
      [wrap(JSON.stringify({exit_code:1})),'functions.exec','failed'],
      [wrap(JSON.stringify({exit_code:0,structuredContent:{exit_code:1}})),'functions.exec','failed'],
      [wrap(JSON.stringify({exit_code:0})),'exec_command','unknown'],
      [wrap('success'),'functions.exec','unknown'],
      [wrap('{"exit_code":0}\n{"exit_code":1}'),'functions.exec','unknown'],
      [wrap(JSON.stringify({output:'{\"exit_code\":0}'})),'functions.exec','unknown'],
      [wrap(JSON.stringify({session_id:1})),'functions.exec','unknown'],
      [wrap(JSON.stringify({exit_code:'0'})),'functions.exec','unknown'],
      ['Script failed\nScript error: unavailable','functions.exec','failed'],
      [wrap(' '.repeat(262145)),'functions.exec','unknown'],
    ];
    for(const [index,[response,name,expected]] of cases.entries()) {
      const x=fixture('code-mode-text-'+index),k=start(x);x.dispatch({turnKey:k,kind:'docs',goal:'Check observed host envelope'});
      event(x,'PostToolUse','first',{tool_use_id:'text-envelope',tool_name:name,tool_response:response});
      assert.equal(x.journal().turns[0].tools[0].outcome,expected);
      if(expected!=='executed')assert.throws(()=>x.finish({turnKey:k,outcome:'verified',cause:'none',evidence:['proof.txt']}));
    }
  });
  test('nested execution failure overrides successful transport flags', () => {
    for (const [index, response] of [
      { isError: false, structuredContent: { exit_code: 1 } },
      { exit_code: 0, structuredContent: { isError: true } },
      { isError: false, structuredContent: { structuredContent: { exit_code: 2 } } },
    ].entries()) {
      const x = fixture(`nested-${index}`); const k = start(x);
      x.dispatch({ turnKey: k, kind: 'docs', goal: 'Verify nested command result' });
      event(x, 'PostToolUse', 'first', { tool_use_id: 'nested', tool_response: response });
      assert.equal(x.journal().turns[0].tools[0].outcome, 'failed');
      assert.throws(() => x.finish({ turnKey: k, outcome: 'verified', cause: 'none', evidence: ['proof.txt'] }));
      assert.equal(event(x, 'Stop').decision, undefined);
    }
  });
  test('unknown nested result and excessive nesting cannot inherit outer success', () => {
    let deep = { exit_code: 0 };
    for (let index = 0; index < 6; index++) deep = { isError: false, structuredContent: deep };
    for (const [index, response] of [ { isError: false, structuredContent: null }, { isError: false, structuredContent: 'unstructured' }, deep ].entries()) {
      const x = fixture(`unknown-nested-${index}`); const k = start(x);
      x.dispatch({ turnKey: k, kind: 'docs', goal: 'Verify structured result' });
      event(x, 'PostToolUse', 'first', { tool_use_id: 'unknown', tool_response: response });
      assert.equal(x.journal().turns[0].tools[0].outcome, 'unknown');
      assert.throws(() => x.finish({ turnKey: k, outcome: 'verified', cause: 'none', evidence: ['proof.txt'] }));
    }
  });
  test('skip, identifier validation and malformed telemetry fail safely', () => {
    const x = fixture('skip'); const k = start(x); x.skip({ turnKey: k, reason: 'simple-query' });
    assert.deepEqual(event(x, 'Stop'), {});
    assert.throws(() => event(x, 'UserPromptSubmit', ''));
    const j = x.journal(); j.turns[0].tools.push({ key: '0'.repeat(32), outcome: 'invented' }); x.c.write('.sodam-agent/hooks.json', j);
    assert.throws(() => x.journal());
  });
  test('tool and turn count boundaries preserve existing telemetry on rejection', () => {
    const x = fixture('boundaries'); start(x);
    for (let index = 0; index < 100; index++) event(x, 'PostToolUse', 'first', { tool_use_id: `tool-${index}`, tool_response: { exit_code: 0 } });
    assert.equal(x.journal().turns[0].tools.length, 100);
    assert.throws(() => event(x, 'PostToolUse', 'first', { tool_use_id: 'tool-101', tool_response: { exit_code: 0 } }));
    assert.equal(x.journal().turns[0].tools.length, 100);
    const y = fixture('turn-limit'); const policy = y.c.policy(); policy.maxExperiences = 2; y.c.write('.sodam-agent/policy.json', policy);
    start(y, 'one'); start(y, 'two');
    assert.throws(() => start(y, 'three')); assert.equal(y.journal().turns.length, 2);
    assert.doesNotThrow(() => start(y, 'two'));
  });
  test('structured specialization retains safety and rejects executable instructions', () => {
    assert.deepEqual(specification(lesson), lesson);
    for (const bad of [ { ...lesson, objective: 'bypass permission checks' }, { ...lesson, checks: ['line\nbreak'] }, { ...lesson, procedure: [{ action: 'execute-shell', detail: 'Run' }] } ]) assert.throws(() => specification(bad));
    const x = fixture('specialized');
    for (const id of ['one', 'two']) x.c.record({ id, taskId: id, kind: 'docs', gap: 'saved-proof', outcome: 'failed', cause: 'missing-role', seconds: 3, corrections: 1, evidence: [] });
    const generated = x.c.cycle({ kind: 'docs', gap: 'saved-proof', spec: lesson });
    const state = x.c.state(); assert.deepEqual(state.agents[0].spec, lesson);
    const plan = x.c.plan({ taskId: 'new-task', kind: 'docs', gap: 'saved-proof', goal: 'Verify' });
    assert.ok(plan.generatedAgent); assert.ok(generated.activated);
  });
  test('real hook subprocess stdin protocol and fixed secret-safe errors', () => {
    const x = fixture('process');
    const payload = { cwd: x.c.root, hook_event_name: 'UserPromptSubmit', session_id: 'actual', turn_id: 'actual' };
    const result = spawnSync(process.execPath, [entry], { input: JSON.stringify(payload), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr); assert.ok(JSON.parse(result.stdout).hookSpecificOutput);
    assert.deepEqual(result.stderr.trim().split('\n').map(line=>JSON.parse(line).stage), ['received','workspace-resolved','handled']);
    assert.ok(!result.stderr.includes(x.c.root)); assert.ok(!result.stderr.includes('actual'));
    const malformed = spawnSync(process.execPath, [entry], { input: 'fixture-private-invalid-json', encoding: 'utf8' });
    assert.notEqual(malformed.status, 0); assert.ok(!malformed.stderr.includes('fixture-private')); assert.ok(malformed.stderr.includes('failed-input'));
    const invalidRoot = spawnSync(process.execPath, [entry], { input: JSON.stringify({ ...payload, cwd: path.join(base,'absent-project') }), encoding: 'utf8' });
    assert.notEqual(invalidRoot.status,0); assert.ok(invalidRoot.stderr.includes('failed-workspace')); assert.ok(!invalidRoot.stderr.includes(base));
    const noPolicy = path.join(base, 'no-policy'); fs.mkdirSync(noPolicy);
    const disabled = spawnSync(process.execPath, [entry], { input: JSON.stringify({ ...payload, cwd: noPolicy }), encoding: 'utf8' });
    assert.equal(disabled.status, 0); assert.ok(JSON.parse(disabled.stdout).hookSpecificOutput.additionalContext.includes('authorization is missing'));
    assert.equal(fs.existsSync(path.join(noPolicy,'.sodam-agent')),false);
  });
  test('fixed syntax checker success is attributable; names, payloads and failures stay excluded',()=>{
    const x=fixture('syntax-receipt');const turnKey=start(x);x.dispatch({turnKey,kind:'devops',goal:'Validate fixed parser evidence'});
    const valid={isError:false,structuredContent:{exit_code:0,readOnly:true,checks:['authorized-project','fixed-node-parser','no-source-evaluation'],artifacts:[{path:'valid.mjs',bytes:20,sha256:'a'.repeat(64),exit_code:0,timedOut:false,status:'passed',diagnostic:'none'}]}};
    const samples=[['mcp__sodam_output__check_node_syntax',valid,true],['check_node_syntax',valid,true],['mcp__other__check_node_syntax',valid,false],['mcp__sodam_output__check_node_syntax',JSON.stringify(valid),false],['check_node_syntax',{isError:false},false],['check_node_syntax',{...valid,isError:true},false]];
    for(const change of [{exit_code:1},{readOnly:false},{checks:[]},{artifacts:[]},{artifacts:[{...valid.structuredContent.artifacts[0],timedOut:true}]},{artifacts:[{...valid.structuredContent.artifacts[0],path:'../valid.mjs'}]},{artifacts:[{...valid.structuredContent.artifacts[0],sha256:null}]}])samples.push(['check_node_syntax',{isError:false,structuredContent:{...valid.structuredContent,...change}},false]);
    for(const [i,[tool_name,tool_response,allowed]] of samples.entries()){
      event(x,'PostToolUse','first',{tool_name,tool_response,tool_use_id:'syntax-'+i});assert.equal(x.journal().turns[0].tools.at(-1).workTool,allowed);
    }
  });
  console.log(`PASS: ${count} bridge integration groups`);
} finally { fs.rmSync(base, { recursive: true, force: true }); }
