// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Public CLI integration: fresh processes, persisted state and failure preservation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Controller } from '../plugins/autonomy-team/runtime/engine.mjs';
const cli = fileURLToPath(new URL('../plugins/autonomy-team/runtime/cli.mjs', import.meta.url));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-release-cli-'));
let calls = 0;
function run(command, input, success = true, request = 'request.json') {
  if (input !== undefined) fs.writeFileSync(path.join(dir, request), JSON.stringify(input));
  const result = spawnSync(process.execPath, [cli, command, dir, request], { encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, success ? 0 : 1, 'CLI exit status'); assert.equal(result.signal, null);
  const output = JSON.parse(success ? result.stdout : result.stderr); assert.equal(output.ok, success);
  assert.equal(success ? result.stderr : result.stdout, ''); calls++; return output.result;
}
const base = { kind: 'docs', gap: 'artifact-proof', seconds: 10, corrections: 2, evidence: [] };
try {
  run('status', undefined, false); run('initialize', { authorize: false }, false);
  run('initialize', { authorize: true, autoPilot: true, maxRetries: 2 });
  assert.equal(run('status').state.experiences.length, 0);
  assert.equal(run('plan', { taskId: 'new-task', kind: 'docs', goal: 'fixture', gap: base.gap }).generatedAgent, null);
  for (let i = 0; i < 2; i++) run('record', { ...base, id: `failure-${i}`, taskId: `origin-${i}`, outcome: 'failed', cause: 'missing-role' });
  const candidate = run('propose', { kind: base.kind, gap: base.gap }).candidate;
  run('promote', { candidate }, false); run('evaluate', { candidate }); run('promote', { candidate });
  assert.equal(run('plan', { taskId: 'pilot-task', kind: 'docs', goal: 'fixture', gap: base.gap }).generatedAgent.status, 'pilot');
  fs.writeFileSync(path.join(dir, 'proof.txt'), 'fixture artifact');
  for (let i = 0; i < 2; i++) {
    const taskId = `held-${i}`;
    run('record', { ...base, id: `baseline-${i}`, taskId, outcome: 'verified', cause: 'none', evidence: ['proof.txt'] });
    run('record', { ...base, id: `pilot-${i}`, taskId, outcome: 'verified', cause: 'none', evidence: ['proof.txt'], seconds: 8, corrections: 1, agent: candidate });
  }
  assert.equal(run('assess', { agent: candidate }).status, 'confirmed');
  assert.equal(run('cycle', { kind: base.kind, gap: base.gap }).unchanged, true);
  assert.equal(run('rollback', { agent: candidate }).disabled, candidate);
  assert.equal(run('plan', { taskId: 'fallback', kind: 'docs', goal: 'fixture', gap: base.gap }).generatedAgent, null);
  assert.ok(fs.existsSync(path.join(dir, `.sodam-agent/roles/${candidate}/SKILL.md`)));
  const stateFile = path.join(dir, '.sodam-agent/state.json'); const before = fs.readFileSync(stateFile);
  run('record', { ...base, id: 'failure-0', taskId: 'duplicate', outcome: 'failed', cause: 'quality' }, false);
  run('record', { ...base, id: 'traverse', taskId: 'traverse', outcome: 'verified', cause: 'none', evidence: ['../outside'] }, false);
  run('unknown', {}, false); run('plan', undefined, false, 'absent.json');
  const missing = spawnSync(process.execPath, [cli, 'dispatch', dir, 'absent.json'], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.equal(JSON.parse(missing.stderr).diagnostic, 'request-or-state-file-missing');
  assert.ok(!missing.stderr.includes(dir));
  const privateMarker = 'private-example-do-not-reflect';
  fs.writeFileSync(path.join(dir, 'bad.json'), JSON.stringify({ privateMarker }));
  const invalid = spawnSync(process.execPath, [cli, 'dispatch', dir, 'bad.json'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.equal(JSON.parse(invalid.stderr).diagnostic, 'unsupported-input-field');
  assert.ok(!invalid.stderr.includes(privateMarker));
  assert.deepEqual(fs.readFileSync(stateFile), before);
  const c = new Controller(dir); const save = c.save.bind(c);
  c.save = () => { const error = new Error('injected permission failure'); error.code = 'EACCES'; throw error; };
  assert.throws(() => c.record({ ...base, id: 'permission', taskId: 'permission', outcome: 'failed', cause: 'permission' }), { code: 'EACCES' });
  c.save = save; assert.deepEqual(fs.readFileSync(stateFile), before); assert.ok(!fs.existsSync(path.join(dir, '.sodam-agent/lock')));
  const lock = path.join(dir, '.sodam-agent/lock'); fs.writeFileSync(lock, 'another process');
  run('record', { ...base, id: 'locked', taskId: 'locked', outcome: 'failed', cause: 'quality' }, false);
  assert.deepEqual(fs.readFileSync(stateFile), before); fs.unlinkSync(lock);
  fs.writeFileSync(stateFile, '{'); run('status', undefined, false); assert.equal(fs.readFileSync(stateFile, 'utf8'), '{'); fs.writeFileSync(stateFile, before);
  const p = c.policy(); p.expiresAt = '2000-01-01T00:00:00Z'; c.write('.sodam-agent/policy.json', p);
  run('plan', { taskId: 'expired', kind: 'docs', goal: 'fixture' }, false);
  console.log(JSON.stringify({ publicCliCalls: calls, lifecycle: 'initialize-plan-record-propose-evaluate-promote-assess-cycle-rollback-status', persistenceAndFailurePreservation: true, permissionFailure: 'fault injection; not OS ACL test', modelOrMcpExecution: false }));
} finally { assert.ok(dir.startsWith(os.tmpdir() + path.sep)); fs.rmSync(dir, { recursive: true, force: true }); }
