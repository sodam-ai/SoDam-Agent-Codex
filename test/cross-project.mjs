// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Synthetic regression checks, isolated HOME. Not real model-learning evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if (process.argv[2] !== 'isolated') {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-cross-project-'));
  try {
    const home = path.join(base, 'home'); fs.mkdirSync(home);
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), 'isolated', base], {
      encoding:'utf8', timeout:30000, env:{...process.env, USERPROFILE:home, HOME:home}
    });
    process.stdout.write(result.stdout); process.stderr.write(result.stderr);
    assert.equal(result.status, 0);
  } finally {
    assert.ok(base.startsWith(os.tmpdir() + path.sep)); fs.rmSync(base, {recursive:true, force:true});
  }
} else {
  const base = process.argv[3]; assert.equal(os.homedir(), path.join(base, 'home'));
  const {authorizeArea, connectWorkspace, setProcedureSharing, revokeArea, procedurePeers} = await import('../plugins/autonomy-team/runtime/areas.mjs');
  const {Bridge} = await import('../plugins/autonomy-team/runtime/bridge.mjs');
  const {specification} = await import('../plugins/autonomy-team/runtime/engine.mjs');
  const {manageWorkflow} = await import('../plugins/autonomy-team/runtime/workflow.mjs');
  const registry = path.join(os.homedir(), '.sodam-agent-areas', 'registry.json');
  const sharingFile = path.join(os.homedir(), '.sodam-agent-areas', 'procedure-sharing.json');
  const make = name => {const root = path.join(base, name); fs.mkdirSync(root, {recursive:true}); return root;};
  const areaA = make('area-a'), areaB = make('area-b');
  const grant = {authorize:true, days:7, maxProjects:30, maxMutations:1000, maxAgents:8, maxExperiences:200, maxRetries:1, autoPilot:false};
  const a = authorizeArea(areaA, grant), b = authorizeArea(areaB, grant);
  const source = make('area-a/source'), target = make('area-b/target');
  connectWorkspace(source, true); connectWorkspace(target, true);
  const sourceBridge = new Bridge(source), targetBridge = new Bridge(target);
  const scope = {kind:'docs', contextTags:['document-review']};
  const lesson = {portable:true, objective:'Preserve source values during document review.',
    procedure:[{action:'read-reference', detail:'Compare requested fields with the source.'}, {action:'verify-output', detail:'Read the saved document and compare all requested fields.'}],
    checks:['All requested fields must match verified source values.'], applicability:{required:['document-review'], excluded:['unreviewed-input']}};
  const start = (bridge, id, kind = 'docs') => {
    const context = bridge.event({hook_event_name:'UserPromptSubmit',session_id:'synthetic',turn_id:id}, 'runtime/cli.mjs').hookSpecificOutput.additionalContext;
    const turnKey = context.match(/turnKey=([a-f0-9]{32})/)[1];
    manageWorkflow({workspace:bridge.c.root, operation:'dispatch', request:{turnKey,kind,goal:'Review synthetic document',contextTags:scope.contextTags,learnWhileWorking:true}});
    bridge.event({hook_event_name:'PostToolUse',session_id:'synthetic',turn_id:id,tool_use_id:'work-'+id,tool_name:'exec_command',tool_response:{exit_code:0}}, 'runtime/cli.mjs');
    return turnKey;
  };
  fs.writeFileSync(path.join(source, 'result.md'), 'Synthetic reviewed document; value 5 mm.');
  const turnKey = start(sourceBridge, 'first');
  const finish = {turnKey, outcome:'verified', cause:'none', evidence:['result.md'], corrections:0, semanticReviewed:true, lesson};
  let count = 0;
  const test = (name, run) => {run(); count++; console.log('PASS: ' + name);};
  test('portable lesson needs explicit privacy review; failed attempt stores nothing', () => {
    assert.throws(() => manageWorkflow({workspace:source, operation:'finish', request:finish}), /privacy review/);
    assert.equal(sourceBridge.c.state().experiences.length, 0);
    manageWorkflow({workspace:source, operation:'finish', request:{...finish, portableReviewed:true}});
  });
  test('both areas must opt in; enabling neither grants new workspace permission', () => {
    assert.equal(targetBridge.recall(scope).sharedSelection.status, 'not-authorized');
    assert.throws(() => setProcedureSharing(areaA, {authorize:false, areaId:a.areaId, enabled:true}));
    setProcedureSharing(areaA, {authorize:true, areaId:a.areaId, enabled:true});
    assert.equal(targetBridge.recall(scope).lessons.length, 0);
    assert.equal(setProcedureSharing(areaB, {authorize:true, areaId:b.areaId, enabled:true}).permissionScopeUnchanged, true);
    const result = targetBridge.recall(scope); assert.equal(result.lessons.length, 1);
    const encoded = JSON.stringify(result.lessons);
    assert.ok(!encoded.includes(source) && !encoded.includes('result.md'));
    assert.equal(result.sharedSelection.sourceArtifactsCopied, false);
    assert.equal(targetBridge.c.state().experiences.length, 0);
  });
  test('sharing leaves legacy approval bytes unchanged and fails closed on malformed consent', () => {
    const registryBefore = fs.readFileSync(registry,'utf8');
    const consentBefore = fs.readFileSync(sharingFile,'utf8');
    setProcedureSharing(areaA, {authorize:true, areaId:a.areaId, enabled:true});
    assert.equal(fs.readFileSync(registry,'utf8'),registryBefore);
    const allowed = ['id','root','rootIdentity','expiresAt','revoked','exclusions','maxProjects','maxMutations','mutations','maxAgents','maxExperiences','maxRetries','autoPilot','projects'];
    for (const area of JSON.parse(registryBefore).areas) assert.ok(Object.keys(area).every(key => allowed.includes(key)));
    try {
      fs.writeFileSync(sharingFile, '{broken');
      assert.throws(() => procedurePeers(target));
      assert.equal(targetBridge.recall(scope).lessons.length,0);
      assert.equal(targetBridge.c.policy().autoPilot,false);
      assert.throws(() => setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:true}));
      assert.equal(fs.readFileSync(registry,'utf8'),registryBefore);
    } finally { fs.writeFileSync(sharingFile,consentBefore); }
    const consent=JSON.parse(consentBefore);consent.areas[0].rootIdentity='0'.repeat(64);
    try {
      fs.writeFileSync(sharingFile,JSON.stringify(consent));
      assert.equal(targetBridge.recall(scope).lessons.length,0);
      assert.throws(() => setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:true}));
    } finally {fs.writeFileSync(sharingFile,consentBefore);}
  });
  test('intermediate registry fields remain readable but do not silently authorize sharing', () => {
    const registryBefore=fs.readFileSync(registry,'utf8');
    const consentBefore=fs.readFileSync(sharingFile,'utf8');
    const legacy=JSON.parse(registryBefore);legacy.areas.forEach(area=>area.shareProcedures=true);
    try {
      fs.writeFileSync(registry,JSON.stringify(legacy));
      fs.writeFileSync(sharingFile,JSON.stringify({schema:1,areas:[]}));
      assert.equal(targetBridge.c.policy().autoPilot,false);
      assert.equal(procedurePeers(target).status,'not-authorized');
      setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:true});
      assert.deepEqual(JSON.parse(fs.readFileSync(registry,'utf8')),legacy);
    } finally {fs.writeFileSync(registry,registryBefore);fs.writeFileSync(sharingFile,consentBefore);}
  });
  test('new request dispatch automatically returns the applicable portable procedure', () => {
    const key = start(targetBridge, 'second');
    const result = targetBridge.dispatch({turnKey:key, kind:'docs', goal:'Review synthetic document', contextTags:scope.contextTags,learnWhileWorking:true});
    assert.equal(result.reusable.length, 1);
    assert.equal(result.reusable[0].source, 'approved-portable-procedure');
  });
  test('different work and missing or excluded context cannot reuse the lesson', () => {
    for (const request of [{kind:'research', contextTags:scope.contextTags}, {kind:'docs'}, {...scope, contextTags:['other']}, {...scope, contextTags:['document-review','unreviewed-input']}]) {
      assert.equal(targetBridge.recall(request).lessons.length, 0);
    }
  });
  test('general fallback works without dropping specialist routes or exclusions', () => {
    const plan = targetBridge.c.plan({taskId:'generic', kind:'general', goal:'Inspect authorized work'});
    assert.equal(plan.route, 'autonomy-team');
    assert.throws(() => targetBridge.c.plan({taskId:'excluded', kind:'general', goal:'Inspect work', excludedKinds:['general']}));
  });
  test('portable data rejects identifiers, unbounded scope and executable instructions', () => {
    for (const value of ['D:\\private\\source', '/home/private', 'person@example.com', '010-1234-5678', 'powershell -Command anything']) {
      assert.throws(() => specification({...lesson, objective:value}));
    }
    assert.throws(() => specification({...lesson, applicability:undefined}));
    assert.throws(() => sourceBridge.finish(finish));
    assert.throws(() => sourceBridge.c.record({lesson}));
  });
  test('changed evidence invalidates cross-project reuse, restoration is detected', () => {
    fs.writeFileSync(path.join(source,'result.md'), 'Changed content');
    assert.equal(targetBridge.recall(scope).lessons.length, 0);
    fs.writeFileSync(path.join(source,'result.md'), 'Synthetic reviewed document; value 5 mm.');
    assert.equal(targetBridge.recall(scope).lessons.length, 1);
  });
  test('disabled source roles and hardlinked evidence are not shared', () => {
    const state = sourceBridge.c.state();
    const modified = structuredClone(state); modified.experiences[0].agent = 'disabled-method';
    sourceBridge.c.save(modified);
    assert.equal(targetBridge.recall(scope).lessons.length, 0);
    sourceBridge.c.save(state);
    const alias = path.join(source, 'alias.md'); fs.linkSync(path.join(source,'result.md'), alias);
    try {assert.equal(targetBridge.recall(scope).lessons.length, 0);}
    finally {fs.unlinkSync(alias);}
    assert.equal(targetBridge.recall(scope).lessons.length, 1);
  });
  test('conflicting portable methods require review and cannot be applied automatically', () => {
    const next = start(sourceBridge, 'conflict');
    manageWorkflow({workspace:source, operation:'finish', request:{...finish, turnKey:next, portableReviewed:true,
      lesson:{...lesson, checks:['Review the alternative method against current requirements.']}}});
    const recalled = targetBridge.recall(scope);
    assert.equal(recalled.lessonSelection.reviewRequired,true);
    const context = targetBridge.event({hook_event_name:'UserPromptSubmit',session_id:'synthetic',turn_id:'conflict-target'}, 'runtime/cli.mjs').hookSpecificOutput.additionalContext;
    const request = {turnKey:context.match(/turnKey=([a-f0-9]{32})/)[1],kind:'docs',goal:'Review synthetic document',contextTags:scope.contextTags};
    const dispatched = targetBridge.dispatch(request);
    assert.equal(dispatched.reusable.length,0);
    assert.equal(dispatched.lessonReviewCandidates.length,2);
  });
  test('disable is immediate and idempotent; lock conflict preserves registry', () => {
    setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:false});
    assert.equal(targetBridge.recall(scope).lessons.length, 0);
    setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:false});
    const before = fs.readFileSync(registry,'utf8');
    const lock = path.join(os.homedir(), '.sodam-agent-areas','lock'); fs.writeFileSync(lock,'');
    try {assert.throws(() => setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:true}));}
    finally {fs.unlinkSync(lock);}
    assert.equal(fs.readFileSync(registry,'utf8'), before);
    setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:true});
  });
  test('bounded peer scan reports truncation rather than unlimited reading', () => {
    for (let i=0;i<16;i++) connectWorkspace(make('area-a/extra-'+i), true);
    const peers = procedurePeers(target); assert.equal(peers.roots.length,16); assert.equal(peers.truncated,true);
  });
  test('revoked source area stops sharing; expired grants cannot be renewed by enable', () => {
    revokeArea(areaA,{authorize:true,areaId:a.areaId});
    assert.equal(targetBridge.recall(scope).lessons.length,0);
    assert.throws(() => setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:true}));
    setProcedureSharing(areaA,{authorize:true,areaId:a.areaId,enabled:false});
    const data = JSON.parse(fs.readFileSync(registry,'utf8'));
    data.areas.find(area => area.id===b.areaId).expiresAt = new Date(0).toISOString(); fs.writeFileSync(registry,JSON.stringify(data));
    assert.throws(() => setProcedureSharing(areaB,{authorize:true,areaId:b.areaId,enabled:true}));
    setProcedureSharing(areaB,{authorize:true,areaId:b.areaId,enabled:false});
  });
  console.log(`Cross-project technical groups: ${count}; realModelExecution: false`);
}
