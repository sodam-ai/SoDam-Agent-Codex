// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { verifyArtifacts } from '../plugins/autonomy-team/runtime/output-verifier.mjs';
import { Controller } from '../plugins/autonomy-team/runtime/engine.mjs';
import { Bridge } from '../plugins/autonomy-team/runtime/bridge.mjs';
import { relocateMcpDirectory } from '../plugins/autonomy-team/runtime/startup.mjs';
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-mcp-'));
const workspace = path.join(base, '한국어'); fs.mkdirSync(workspace);
const c = new Controller(workspace); c.initialize({ authorize: true });
fs.writeFileSync(path.join(workspace, 'proof.md'), '산출물 확인\nask-in-an-ordinary-document');
const input = { workspace, evidence: ['proof.md'] };
const stateBefore = fs.readFileSync(c.safe('.sodam-agent/state.json'));
let count = 0;
function check(name, action) { action(); count++; console.log(`PASS: ${name}`); }
let child;
try {
  check('actual file hashes without returning text or changing state', () => {
    const result = verifyArtifacts(input);
    assert.equal(result.exit_code, 0); assert.equal(result.artifacts[0].sha256.length, 64);
    assert.ok(!JSON.stringify(result).includes('산출물 확인'));
    assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')), stateBefore);
  });
  check('invalid inputs and protected paths rejected', () => {
    for (const bad of [null, [], {}, { ...input, extra: 1 }, { ...input, evidence: [] }, { ...input, evidence: ['proof.md', 'PROOF.md'] }, { ...input, evidence: [1] }, { ...input, evidence: ['proof.md', 'a.md', 'b.md', 'c.md', 'd.md'] }]) assert.throws(() => verifyArtifacts(bad));
    for (const name of ['../proof.md', './proof.md', '/proof.md', 'C:/proof.md', '.sodam-agent/state.json', '.env', 'auth.json', 'credentials.md', 'nested/.private.md', 'proof.exe', 'missing.md', 'sub\\proof.md']) assert.throws(() => verifyArtifacts({ workspace, evidence: [name] }));
  });
  check('empty, binary, malformed UTF8 and oversize files rejected; exact limit accepted', () => {
    for (const value of ['', '   ', Buffer.from([0]), Buffer.from([0xff]), Buffer.alloc(262145, 97)]) {
      fs.writeFileSync(path.join(workspace, 'bad.txt'), value);
      assert.throws(() => verifyArtifacts({ workspace, evidence: ['bad.txt'] }));
    }
    fs.writeFileSync(path.join(workspace, 'limit.txt'), Buffer.alloc(262144, 97));
    assert.equal(verifyArtifacts({ workspace, evidence: ['limit.txt'] }).artifacts[0].bytes, 262144);
  });
  check('known secret shapes rejected without real credentials', () => {
    // Deliberately non-credential markers; never insert real secrets in fixtures.
    for (const value of ['api_key' + ': synthetic-example', JSON.stringify({ password: 'synthetic-example' }), '-----BEGIN ' + 'PRIVATE KEY-----', 'sk-' + 'NOT_A_REAL_CREDENTIAL_123']) {
      fs.writeFileSync(path.join(workspace, 'bad.txt'), value);
      assert.throws(() => verifyArtifacts({ workspace, evidence: ['bad.txt'] }));
    }
  });
  check('hardlinks and linked directories rejected', () => {
    fs.linkSync(path.join(workspace, 'proof.md'), path.join(workspace, 'linked.md'));
    assert.throws(() => verifyArtifacts({ workspace, evidence: ['linked.md'] }));
    fs.unlinkSync(path.join(workspace, 'linked.md'));
    fs.symlinkSync(workspace, path.join(base, 'alias'), process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => verifyArtifacts({ workspace: path.join(base, 'alias'), evidence: ['proof.md'] }));
  });
  check('authorization absence and expiration rejected', () => {
    const empty = path.join(base, 'empty'); fs.mkdirSync(empty);
    assert.throws(() => verifyArtifacts({ workspace: empty, evidence: ['proof.md'] }));
    const p = c.policy(); c.write('.sodam-agent/policy.json', { ...p, expiresAt: new Date(0).toISOString() });
    assert.throws(() => verifyArtifacts(input)); c.write('.sodam-agent/policy.json', p);
  });
  const root = fileURLToPath(new URL('../plugins/autonomy-team/', import.meta.url));
  check('startup candidate guards reject missing, relative, file, cache, initial subtree and linked paths', () => {
    const original=process.cwd();const target=path.join(base,'시작 폴더');fs.mkdirSync(target);
    try {
      assert.equal(relocateMcpDirectory([path.join(base,'missing'),target]),true);
      assert.equal(fs.realpathSync(process.cwd()),fs.realpathSync(target));
      process.chdir(original);
      for(const candidate of ['relative',path.join(workspace,'proof.md'),root,path.join(base,'alias')])assert.equal(relocateMcpDirectory([candidate]),false);
      const cache=path.join(base,'plugins','cache','fixture');fs.mkdirSync(cache,{recursive:true});
      assert.equal(relocateMcpDirectory([cache]),false);
      assert.equal(relocateMcpDirectory([original]),false);
      assert.equal(relocateMcpDirectory([target,target,target]),false);
      assert.equal(relocateMcpDirectory([target]),true);process.chdir(original);
      assert.deepEqual(fs.readdirSync(target),[]);
    } finally {process.chdir(original);}
  });
  if(process.platform==='win32') check('primary access failure uses existing temp; unsafe temp fails without protocol output',()=>{
    const preload=path.join(base,'primary-denied.mjs');
    fs.writeFileSync(preload,"import path from 'node:path';const chdir=process.chdir.bind(process);process.chdir=p=>{if(path.resolve(p).toLowerCase()===path.dirname(process.execPath).toLowerCase())throw Object.assign(new Error('private-startup-detail'),{code:'EPERM'});return chdir(p);};\n");
    const temp=path.join(base,'임시 시작 폴더');fs.mkdirSync(temp);
    const input=[{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18'}},{jsonrpc:'2.0',id:2,method:'tools/list'}].map(x=>JSON.stringify(x)).join('\n')+'\n';
    const run=tmp=>spawnSync(process.execPath,['--import',pathToFileURL(preload).href,'runtime/mcp.mjs'],{cwd:root,env:{...process.env,TEMP:tmp,TMP:tmp},input,encoding:'utf8',timeout:5000});
    const success=run(temp);assert.equal(success.status,0,success.stderr);assert.equal(success.stderr,'');
    assert.deepEqual(JSON.parse(success.stdout.trim().split('\n')[1]).result.tools.map(t=>t.name),['verify_artifacts','manage_workflow','inspect_runtime','check_node_syntax']);
    assert.deepEqual(fs.readdirSync(temp),[]);
    for(const denied of [root,path.join(base,'alias'),path.join(base,'missing')]){const failed=run(denied);assert.equal(failed.status,1);assert.equal(failed.stdout,'');assert.equal(failed.stderr,'MCP startup directory unavailable.\n');}
  });
  if (process.platform === 'win32') check('startup directory failure stops with fixed non-sensitive error', () => {
    const preload = path.join(base, 'startup-failure.mjs');
    fs.writeFileSync(preload, "process.chdir = () => { throw new Error('private-startup-detail'); };\n");
    const result = spawnSync(process.execPath, ['--import', pathToFileURL(preload).href, 'runtime/mcp.mjs'], { cwd: root, input: '', encoding: 'utf8', timeout: 5000 });
    assert.equal(result.status, 1); assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'MCP startup directory unavailable.\n');
    assert.ok(!result.stderr.includes('private-startup-detail'));
  });
  check('malformed and oversized protocol input fail with bounded fixed errors', () => {
    const malformed = spawnSync(process.execPath, ['runtime/mcp.mjs'], { cwd: root, input: '{private-submitted-value}\n', encoding: 'utf8', timeout: 5000 });
    assert.equal(malformed.status, 0); assert.equal(JSON.parse(malformed.stdout).error.code, -32700); assert.ok(!malformed.stdout.includes('private-submitted-value'));
    const oversized = spawnSync(process.execPath, ['runtime/mcp.mjs'], { cwd: root, input: 'x'.repeat(65537), encoding: 'utf8', timeout: 5000 });
    assert.equal(oversized.status, 1); assert.ok(oversized.stderr.includes('bounded input')); assert.equal(oversized.stdout, '');
    const unfinished = spawnSync(process.execPath, ['runtime/mcp.mjs'], { cwd: root, input: '{', encoding: 'utf8', timeout: 5000 });
    assert.equal(unfinished.status, 1); assert.equal(JSON.parse(unfinished.stdout).error.code, -32700);
  });
  // Keep the server alive while testing a disposable host directory rename.
  // The real installed plugin cache is never moved by this test.
  const hostDirectory = path.join(base, 'cache-host'); fs.mkdirSync(hostDirectory);
  const serverRoot=path.join(base,'technical-server');fs.mkdirSync(serverRoot);
  fs.cpSync(path.join(root,'runtime'),path.join(serverRoot,'runtime'),{recursive:true});
  child = spawn(process.execPath, [path.join(serverRoot, 'runtime/mcp.mjs')], { cwd: hostDirectory, stdio: ['pipe', 'pipe', 'pipe'] });
  let buffer = ''; const pending = new Map(); let next = 1; let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.stdout.on('data', chunk => {
    buffer += chunk; let end;
    while ((end = buffer.indexOf('\n')) >= 0) { const line = buffer.slice(0, end); buffer = buffer.slice(end + 1); const message = JSON.parse(line); const entry = pending.get(message.id); if (entry) { pending.delete(message.id); clearTimeout(entry.timer); entry.resolve(message); } }
  });
  function call(method, params, splitUnicode = false) {
    const id = next++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('MCP response timeout')); }, 5000);
      pending.set(id, { resolve, timer });
      const bytes = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
      if (splitUnicode) { const at = bytes.indexOf(Buffer.from('한')) + 1; assert.ok(at > 0); child.stdin.write(bytes.subarray(0, at)); setTimeout(() => child.stdin.write(bytes.subarray(at)), 20); }
      else child.stdin.write(bytes);
    });
  }
  assert.equal((await call('tools/list')).error.code, -32002);
  assert.equal((await call('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } })).result.serverInfo.version, '0.3.9');
  check('live MCP releases host directory for cache replacement', () => {
    const moved = path.join(base, 'cache-host-moved');
    assert.equal(path.dirname(hostDirectory), base); assert.equal(path.dirname(moved), base);
    fs.renameSync(hostDirectory, moved); fs.renameSync(moved, hostDirectory);
  });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  assert.deepEqual((await call('tools/list')).result.tools.map(t => t.name), ['verify_artifacts','manage_workflow','inspect_runtime','check_node_syntax']);
  const workflowSchema=(await call('tools/list')).result.tools.find(t=>t.name==='manage_workflow').inputSchema;
  assert.ok(workflowSchema.properties.operation.enum.includes('skip'));
  const bridge=new Bridge(workspace);
  const skipStarted=bridge.event({hook_event_name:'UserPromptSubmit',session_id:'mcp-skip-fixture',turn_id:'simple'},'installed/runtime/cli.mjs');
  const skipKey=skipStarted.hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
  const skipArgs={workspace,operation:'skip',request:{turnKey:skipKey,reason:'simple-query'}};
  const lessonsBefore=JSON.stringify(c.state().experiences);
  const skipped=(await call('tools/call',{name:'manage_workflow',arguments:skipArgs})).result;
  assert.equal(skipped.isError,false);assert.equal(skipped.structuredContent.result.skipped,true);
  const repeated=(await call('tools/call',{name:'manage_workflow',arguments:skipArgs})).result;
  assert.equal(repeated.isError,false);assert.equal(repeated.structuredContent.result.duplicate,true);
  assert.equal(JSON.stringify(c.state().experiences),lessonsBefore);
  assert.deepEqual(bridge.event({hook_event_name:'Stop',session_id:'mcp-skip-fixture',turn_id:'simple'},'installed/runtime/cli.mjs'),{});
  for(const bad of [{turnKey:skipKey,reason:'private-invalid-reason'},{turnKey:'invalid',reason:'excluded'},{turnKey:'0'.repeat(32),reason:'excluded'}]) {
    const rejected=(await call('tools/call',{name:'manage_workflow',arguments:{...skipArgs,request:bad}})).result;
    assert.equal(rejected.isError,true);assert.ok(!JSON.stringify(rejected).includes('private-invalid-reason'));
  }
  count++;console.log('PASS: live MCP bounded skip discovery, duplicate preservation and invalid input rejection');
  fs.writeFileSync(path.join(workspace,'parse.mjs'),'export const value = 1;');
  const syntax=(await call('tools/call',{name:'check_node_syntax',arguments:{workspace,evidence:['parse.mjs']}})).result;
  assert.equal(syntax.isError,false); assert.equal(syntax.structuredContent.artifacts[0].exit_code,0);
  fs.writeFileSync(path.join(workspace,'parse.mjs'),'export const = 1;');
  const syntaxFailure=(await call('tools/call',{name:'check_node_syntax',arguments:{workspace,evidence:['parse.mjs']}})).result;
  assert.equal(syntaxFailure.isError,true); assert.equal(syntaxFailure.structuredContent.exit_code,1);
  assert.ok(!JSON.stringify(syntaxFailure).includes('export const'));
  count++;console.log('PASS: live MCP fixed syntax parser exposes typed success and failure');
  const inspected=(await call('tools/call',{name:'inspect_runtime',arguments:{workspace}})).result;
  assert.equal(inspected.isError,false);assert.equal(inspected.structuredContent.workspace.authorization,'valid');assert.equal(inspected.structuredContent.runtime.currentSourceMatchesStartup,true);
  const copiedFile=path.join(serverRoot,'runtime','diagnostics.mjs'),savedSource=fs.readFileSync(copiedFile);
  fs.appendFileSync(copiedFile,'\n// Technical disk replacement fixture.\n');
  const drift=(await call('tools/call',{name:'inspect_runtime',arguments:{}})).result.structuredContent;
  assert.equal(drift.runtime.currentSourceMatchesStartup,false);assert.equal(drift.runtime.startupSourceFingerprint,inspected.structuredContent.runtime.startupSourceFingerprint);
  const snapshots=()=>['policy.json','state.json','hooks.json'].filter(f=>fs.existsSync(c.safe('.sodam-agent/'+f))).map(f=>fs.readFileSync(c.safe('.sodam-agent/'+f)).toString('base64'));
  const beforeBlocked=snapshots();
  const staleWrite=(await call('tools/call',{name:'manage_workflow',arguments:{workspace,operation:'dispatch',request:{turnKey:'a'.repeat(32),kind:'docs',goal:'Blocked stale call'}}})).result;
  assert.equal(staleWrite.isError,true);assert.equal(staleWrite.structuredContent.diagnostic,'runtime-source-changed');assert.deepEqual(snapshots(),beforeBlocked);
  fs.renameSync(copiedFile,copiedFile+'.saved');fs.mkdirSync(copiedFile);
  const unreadableWrite=(await call('tools/call',{name:'manage_workflow',arguments:{workspace,operation:'read-role',request:{turnKey:'a'.repeat(32)}}})).result;
  assert.equal(unreadableWrite.isError,true);assert.equal(unreadableWrite.structuredContent.diagnostic,'runtime-source-unreadable');assert.deepEqual(snapshots(),beforeBlocked);
  fs.rmdirSync(copiedFile);fs.renameSync(copiedFile+'.saved',copiedFile);
  count++;console.log('PASS: stale and unreadable loaded runtime cannot modify workflow state');
  fs.writeFileSync(copiedFile,savedSource);
  const invalidDiagnosis=(await call('tools/call',{name:'inspect_runtime',arguments:{extra:'private-fixture-value'}})).result;
  assert.equal(invalidDiagnosis.isError,true);assert.ok(!JSON.stringify(invalidDiagnosis).includes('private-fixture-value'));
  count++;console.log('PASS: read-only live diagnosis identifies disk drift without pretending to reload memory');
  const response = (await call('tools/call', { name: 'verify_artifacts', arguments: input }, true)).result;
  assert.equal(response.isError, false); assert.deepEqual(response.structuredContent, verifyArtifacts(input));
  count++; console.log('PASS: actual stdio discovery and tool execution including split Korean input');
  const relativeWorkspace = (await call('tools/call', { name: 'verify_artifacts', arguments: { ...input, workspace: '.' } })).result;
  assert.equal(relativeWorkspace.isError, true); assert.equal(relativeWorkspace.structuredContent.exit_code, 1);
  count++; console.log('PASS: relocated MCP still rejects relative workspace input');
  const rejected = (await call('tools/call', { name: 'verify_artifacts', arguments: { ...input, evidence: ['private-input-value.md'] } })).result;
  assert.equal(rejected.isError, true); assert.equal(rejected.structuredContent.exit_code, 1); assert.ok(!JSON.stringify(rejected).includes('private-input-value'));
  assert.equal((await call('unknown', {})).error.code, -32601);
  assert.equal((await call('initialize', { protocolVersion: '2025-06-18' })).error.code, -32602);
  count++; console.log('PASS: protocol errors and failed tool results never echo submitted values');
  check('real verifier response enables verified finish; unknown and explicit failure still block', () => {
    const b = new Bridge(workspace); const runtime = path.join(root, 'runtime/cli.mjs');
    const event = (name, turn, extra = {}) => b.event({ hook_event_name: name, session_id: 'mcp-test', turn_id: turn, ...extra }, runtime);
    const start = turn => event('UserPromptSubmit', turn).hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
    const turnKey = start('success'); b.dispatch({ turnKey, kind: 'docs', goal: 'Inspect saved text' });
    const finish = { turnKey, outcome: 'verified', cause: 'none', evidence: ['proof.md'] };
    event('PostToolUse', 'success', { tool_use_id: 'unknown', tool_response: 'exit code 0' });
    assert.throws(() => b.finish(finish));
    event('PostToolUse', 'success', { tool_use_id: 'verifier', tool_response: response });
    assert.equal(b.finish(finish).recorded, true);
    const failedKey = start('failure'); b.dispatch({ turnKey: failedKey, kind: 'docs', goal: 'Failure verification' });
    event('PostToolUse', 'failure', { tool_use_id: 'failed', tool_response: rejected });
    event('PostToolUse', 'failure', { tool_use_id: 'later-success', tool_response: response });
    assert.throws(() => b.finish({ ...finish, turnKey: failedKey }));
  });
  const wb=new Bridge(workspace);
  const started=wb.event({hook_event_name:'UserPromptSubmit',session_id:'workflow-protocol',turn_id:'new'},path.join(root,'runtime/cli.mjs'));
  const workflowKey=started.hookSpecificOutput.additionalContext.match(/turnKey=([a-f0-9]{32})/)[1];
  const dispatched=(await call('tools/call',{name:'manage_workflow',arguments:{workspace,operation:'dispatch',request:{turnKey:workflowKey,kind:'docs',goal:'Check actual protocol',evaluationTaskId:'protocol-pair'}}})).result;
  assert.equal(dispatched.isError,false);
  assert.equal(dispatched.structuredContent.result.taskId,'eval-protocol-pair');
  wb.event({hook_event_name:'PostToolUse',session_id:'workflow-protocol',turn_id:'new',tool_use_id:'dispatch',tool_response:dispatched},path.join(root,'runtime/cli.mjs'));
  const completed=(await call('tools/call',{name:'manage_workflow',arguments:{workspace,operation:'finish',request:{turnKey:workflowKey,outcome:'verified',cause:'none',evidence:['proof.md'],semanticReviewed:true}}})).result;
  assert.equal(completed.isError,false);assert.equal(completed.structuredContent.result.recorded,true);
  assert.equal(wb.c.state().experiences.at(-1).taskId,'eval-protocol-pair');
  const badWorkflow=(await call('tools/call',{name:'manage_workflow',arguments:{workspace,operation:'private-unknown-operation',request:{}}})).result;
  assert.equal(badWorkflow.isError,true);assert.ok(!JSON.stringify(badWorkflow).includes('private-unknown-operation'));
  count++;console.log('PASS: actual MCP workflow dispatch and finish preserve guards and hide invalid input');
  child.stdin.end(); const status = await new Promise(resolve => child.on('close', resolve)); assert.equal(status, 0); assert.equal(stderr, '');
  console.log(`PASS: ${count} artifact MCP groups`);
} finally {
  if (child && child.exitCode === null && child.signalCode === null) {
    const closed = new Promise(resolve => child.once('close', resolve));
    child.kill(); await closed;
  }
  assert.equal(path.dirname(base), os.tmpdir());
  assert.ok(path.basename(base).startsWith('sodam-mcp-'));
  fs.rmSync(base, { recursive: true, force: true });
}
