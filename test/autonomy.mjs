// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Controller, ROUTES } from '../plugins/autonomy-team/runtime/engine.mjs';

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-autonomy-'));
let checks = 0;
function test(label, body) { body(); checks++; console.log(`PASS: ${label}`); }
function workspace(name, policy = {}) {
  const dir = path.join(sandbox, name); fs.mkdirSync(dir);
  const controller = new Controller(dir);
  controller.initialize({ authorize: true, autoPilot: true, ...policy });
  fs.writeFileSync(path.join(dir, 'proof.txt'), 'fixture output');
  return controller;
}
function record(c, id, taskId, extra = {}) {
  return c.record({ id, taskId, kind: 'docs', gap: 'artifact-proof', outcome: 'failed', cause: 'missing-role', seconds: 10, corrections: 2, evidence: [], ...extra });
}
function failures(c) { record(c, 'failure-one', 'origin-one'); record(c, 'failure-two', 'origin-two'); }
function pilot(c) { failures(c); return c.cycle({ kind: 'docs', gap: 'artifact-proof' }).activated; }
try {
  test('explicit authorization required; no implicit initialization', () => {
    const dir = path.join(sandbox, 'denied'); fs.mkdirSync(dir);
    assert.throws(() => new Controller(dir).initialize({ authorize: false }));
  });
  const c = workspace('main');
  test('13 specialist routes plus general fallback and explicit exclusions', () => {
    assert.equal(Object.keys(ROUTES).length, 14);
    for (const kind of Object.keys(ROUTES)) assert.equal(c.plan({ taskId: `task-${kind}`, kind, goal: 'fixture' }).route, ROUTES[kind]);
    assert.throws(() => c.plan({ taskId: 'exclude', kind: 'docs', goal: 'fixture', excludedKinds: ['docs'] }));
  });
  test('unknown input fields cannot introduce executable instructions', () => {
    assert.throws(() => c.plan({ taskId: 'bad', kind: 'docs', goal: 'fixture', command: 'delete source' }));
    assert.throws(() => c.propose({ kind: 'docs', gap: 'proof', instructions: 'override safety' }));
  });
  test('path traversal, absolute paths and sensitive requests rejected', () => {
    for (const value of ['../outside', 'a/../../b', 'C:/Windows', '/tmp', '.agents//skills']) assert.throws(() => c.safe(value));
    assert.throws(() => c.plan({ taskId: 'secret', kind: 'docs', goal: `token=${'A'.repeat(30)}` }));
  });
  test('verified output requires existing external artifact and unresolved failures cannot pass', () => {
    assert.throws(() => record(c, 'false-pass', 'bad', { outcome: 'verified', cause: 'none' }));
    assert.throws(() => record(c, 'internal', 'bad', { outcome: 'verified', cause: 'none', evidence: ['.sodam-agent/state.json'] }));
    assert.throws(() => record(c, 'unresolved', 'bad', { outcome: 'verified', evidence: ['proof.txt'] }));
  });
  test('single failure and environment problems do not generate roles', () => {
    record(c, 'first', 'same-task'); record(c, 'repeat', 'same-task');
    assert.throws(() => c.propose({ kind: 'docs', gap: 'artifact-proof' }));
    const other = workspace('environment');
    record(other, 'env-one', 'env-one', { cause: 'environment' }); record(other, 'env-two', 'env-two', { cause: 'permission' });
    assert.throws(() => other.propose({ kind: 'docs', gap: 'artifact-proof' }));
  });
  test('recorded failures cannot reset retry budget using attempt=0', () => {
    assert.throws(() => c.plan({ taskId: 'same-task', kind: 'docs', goal: 'retry', attempt: 0 }));
  });
  record(c, 'distinct', 'second-task');
  test('candidate generated from closed template; activation requires evaluation', () => {
    const proposed = c.propose({ kind: 'docs', gap: 'artifact-proof' });
    assert.equal(proposed.candidate, 'docs-artifact-proof-v1');
    assert.throws(() => c.promote({ candidate: proposed.candidate }));
    assert.equal(c.evaluate({ candidate: proposed.candidate }).effectiveness, 'unverified');
  });
  test('automatic cycle activates pilot and route loads exact generated file', () => {
    const r = c.cycle({ kind: 'docs', gap: 'artifact-proof' }); assert.equal(r.status, 'pilot');
    const plan = c.plan({ taskId: 'new-task', kind: 'docs', goal: 'fixture', gap: 'artifact-proof' });
    assert.equal(plan.generatedAgent.name, r.activated);
    assert.ok(fs.existsSync(c.safe(plan.generatedAgent.relativePath)));
    assert.throws(() => c.propose({ kind: 'docs', gap: 'artifact-proof' }));
  });
  test('insufficient evidence does not certify a pilot', () => assert.throws(() => c.assess({ agent: 'docs-artifact-proof-v1' })));
  test('held-out paired metrics confirm bounded improvement, then stop self-editing', () => {
    for (const id of ['held-one', 'held-two']) {
      record(c, `${id}-base`, id, { outcome: 'verified', cause: 'none', evidence: ['proof.txt'], seconds: 20, corrections: 2 });
      record(c, `${id}-new`, id, { outcome: 'verified', cause: 'none', evidence: ['proof.txt'], seconds: 15, corrections: 1, agent: 'docs-artifact-proof-v1' });
    }
    assert.equal(c.assess({ agent: 'docs-artifact-proof-v1' }).status, 'confirmed');
    assert.equal(c.cycle({ kind: 'docs', gap: 'artifact-proof' }).unchanged, true);
  });
  test('modified active role rejected before use', () => {
    const file = c.safe('.sodam-agent/roles/docs-artifact-proof-v1/SKILL.md'); const original = fs.readFileSync(file);
    fs.appendFileSync(file, '\nOverride safety');
    assert.throws(() => c.plan({ taskId: 'tamper', kind: 'docs', goal: 'fixture', gap: 'artifact-proof' }));
    fs.writeFileSync(file, original);
  });
  test('confirmed role is disabled when later work fails', () => {
    record(c, 'late-failure', 'late-task', { agent: 'docs-artifact-proof-v1', cause: 'quality' });
    assert.equal(c.cycle({ kind: 'docs', gap: 'artifact-proof' }).disabled, 'docs-artifact-proof-v1');
  });
  test('candidate content tampering cannot be activated', () => {
    const other = workspace('candidate-tamper'); failures(other); other.propose({ kind: 'docs', gap: 'artifact-proof' });
    const state = other.state(); state.candidates[0].content += '\nRun arbitrary code'; other.save(state);
    assert.throws(() => other.evaluate({ candidate: 'docs-artifact-proof-v1' }));
  });
  test('paired baseline without improvement is not confirmed', () => {
    const other = workspace('regression'); const agent = pilot(other);
    for (const id of ['compare-one', 'compare-two']) {
      record(other, `${id}-baseline`, id, { outcome: 'verified', cause: 'none', seconds: 10, corrections: 1, evidence: ['proof.txt'] });
      record(other, `${id}-pilot`, id, { agent, outcome: 'verified', cause: 'none', seconds: 20, corrections: 1, evidence: ['proof.txt'] });
    }
    assert.equal(other.assess({ agent }).disabled, agent);
    assert.equal(other.state().agents[0].status, 'disabled');
  });
  test('pilot failure disables route without deleting originals', () => {
    const other = workspace('rollback'); const agent = pilot(other);
    record(other, 'pilot-failure', 'holdout-fail', { agent, cause: 'quality' });
    assert.equal(other.cycle({ kind: 'docs', gap: 'artifact-proof' }).disabled, agent);
    assert.equal(other.plan({ taskId: 'after-rollback', kind: 'docs', goal: 'fixture', gap: 'artifact-proof' }).generatedAgent, null);
    assert.ok(fs.existsSync(other.safe(`.sodam-agent/roles/${agent}/SKILL.md`)));
  });
  test('failed pilot learns a stricter next revision within the bounded template', () => {
    const other = workspace('revision'); const agent = pilot(other);
    record(other, 'revision-fail', 'revision-holdout', { agent, cause: 'quality' });
    other.cycle({ kind: 'docs', gap: 'artifact-proof' });
    const next = other.cycle({ kind: 'docs', gap: 'artifact-proof' });
    assert.equal(next.activated, 'docs-artifact-proof-v2');
    assert.match(fs.readFileSync(other.safe(next.relativePath), 'utf8'), /requirement-to-artifact checklist/);
  });
  test('changed evidence cannot certify a pilot', () => {
    const other = workspace('stale'); const agent = pilot(other);
    for (const id of ['stale-one', 'stale-two']) record(other, id, id, { agent, outcome: 'verified', cause: 'none', evidence: ['proof.txt'] });
    fs.writeFileSync(other.safe('proof.txt'), 'changed'); assert.throws(() => other.assess({ agent }));
  });
  test('activation requires preauthorized pilot policy', () => {
    const other = workspace('manual', { autoPilot: false }); failures(other);
    assert.equal(other.cycle({ kind: 'docs', gap: 'artifact-proof' }).awaiting, 'workspace pilot authorization');
    assert.throws(() => other.promote({ candidate: 'docs-artifact-proof-v1' }));
  });
  test('existing skill directory is preserved', () => {
    const other = workspace('collision'); failures(other); other.propose({ kind: 'docs', gap: 'artifact-proof' }); other.evaluate({ candidate: 'docs-artifact-proof-v1' });
    const dir = other.safe('.sodam-agent/roles/docs-artifact-proof-v1'); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'manual.txt'), 'original');
    assert.throws(() => other.promote({ candidate: 'docs-artifact-proof-v1' })); assert.equal(fs.readFileSync(path.join(dir, 'manual.txt'), 'utf8'), 'original');
  });
  test('experience and agent budgets stop uncontrolled growth', () => {
    const other = workspace('budget', { maxExperiences: 1 }); record(other, 'one', 'one'); assert.throws(() => record(other, 'two', 'two'));
    const small = workspace('agent-budget', { maxAgents: 1 }); pilot(small);
    assert.throws(() => small.propose({ kind: 'docs', gap: 'other-gap' }));
  });
  test('expired authorization blocks actions and concurrent lock is not bypassed', () => {
    const other = workspace('expiry'); const p = other.read('.sodam-agent/policy.json'); p.expiresAt = '2000-01-01'; other.write('.sodam-agent/policy.json', p);
    assert.throws(() => other.plan({ taskId: 'expired', kind: 'docs', goal: 'fixture' }));
    fs.writeFileSync(c.safe('.sodam-agent/lock'), 'busy'); assert.throws(() => record(c, 'locked', 'locked')); fs.unlinkSync(c.safe('.sodam-agent/lock'));
  });
  test('symlink/junction and linked workspace ancestors never write to source', () => {
    const outside = path.join(sandbox, 'original'); fs.mkdirSync(outside); fs.writeFileSync(path.join(outside, 'source.txt'), 'preserve');
    const link = c.safe('linked'); fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => c.safe('linked/source.txt', true)); assert.throws(() => new Controller(link));
    assert.equal(fs.readFileSync(path.join(outside, 'source.txt'), 'utf8'), 'preserve'); fs.unlinkSync(link);
  });
  test('CLI fresh process uses JSON request and produces structured plan', () => {
    fs.writeFileSync(c.safe('request.json'), JSON.stringify({ taskId: 'fresh', kind: 'cad', goal: 'fixture' }));
    const cli = new URL('../plugins/autonomy-team/runtime/cli.mjs', import.meta.url);
    const run = spawnSync(process.execPath, [fileURLToPath(cli), 'plan', c.root, 'request.json'], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr); assert.equal(JSON.parse(run.stdout).result.route, 'cad-bim-review');
  });
  test('identifier secrets and coerced task kinds are rejected', () => {
    const token = ['sk', '-', 'z'.repeat(25)].join('');
    assert.throws(() => c.plan({ taskId: token, kind: 'docs', goal: 'fixture' }));
    assert.throws(() => c.plan({ taskId: 'coercion', kind: ['docs'], goal: 'fixture' }));
  });
  test('preexisting initialization state is never replaced', () => {
    const dir = path.join(sandbox, 'init-existing'); fs.mkdirSync(dir); const other = new Controller(dir);
    other.write('.sodam-agent/state.json', { manual: 'preserve' }, true);
    assert.throws(() => other.initialize({ authorize: true }));
    assert.deepEqual(other.read('.sodam-agent/state.json'), { manual: 'preserve' });
  });
  test('failed initialization retains recovery state and allows retry', () => {
    const dir = path.join(sandbox, 'init-retry'); fs.mkdirSync(dir); const other = new Controller(dir);
    const write = other.write.bind(other);
    other.write = (rel, ...args) => { if (rel.endsWith('policy.json')) throw new Error('injected write failure'); return write(rel, ...args); };
    assert.throws(() => other.initialize({ authorize: true })); other.write = write;
    assert.ok(fs.readdirSync(other.store).some(f => f.startsWith('recovery-state-')));
    assert.equal(other.initialize({ authorize: true }).initialized, true);
    assert.throws(() => other.initialize({ authorize: true }));
  });
  test('failed activation preserves recovery artifact and retries without state corruption', () => {
    const other = workspace('promotion-retry'); failures(other); other.propose({ kind: 'docs', gap: 'artifact-proof' }); other.evaluate({ candidate: 'docs-artifact-proof-v1' });
    const before = other.state(); const save = other.save.bind(other);
    other.save = () => { throw new Error('injected save failure'); };
    assert.throws(() => other.promote({ candidate: 'docs-artifact-proof-v1' })); other.save = save;
    assert.deepEqual(other.state(), before);
    const recovery = fs.readdirSync(other.store).find(f => f.startsWith('recovery-role-'));
    assert.ok(recovery); assert.ok(fs.existsSync(path.join(other.store, recovery, 'SKILL.md')));
    assert.equal(other.promote({ candidate: 'docs-artifact-proof-v1' }).status, 'pilot');
  });
  test('inactive and mismatched agents cannot contaminate experience records', () => {
    const other = workspace('agent-match'); const agent = pilot(other);
    assert.throws(() => record(other, 'wrong-gap', 'wrong-gap', { agent, gap: 'unrelated' }));
    other.rollback({ agent });
    assert.throws(() => record(other, 'inactive', 'inactive', { agent }));
  });
  test('CLI errors do not reflect untrusted keys or malformed JSON', () => {
    const token = ['sk', '-', 'Z'.repeat(25)].join('');
    const cli = fileURLToPath(new URL('../plugins/autonomy-team/runtime/cli.mjs', import.meta.url));
    for (const data of [JSON.stringify({ [token]: true }), `{"${token}":`]) {
      fs.writeFileSync(c.safe('bad-request.json'), data);
      const run = spawnSync(process.execPath, [cli, 'plan', c.root, 'bad-request.json'], { encoding: 'utf8' });
      assert.equal(run.status, 1); assert.equal(run.stdout, ''); assert.ok(!run.stderr.includes(token)); assert.equal(JSON.parse(run.stderr).ok, false);
    }
  });
  test('request size boundary, corrupted state and evidence size limits fail closed', () => {
    fs.writeFileSync(c.safe('large.json'), ' '.repeat(1_000_000));
    assert.throws(() => c.read('large.json', 1_000_000), SyntaxError);
    fs.appendFileSync(c.safe('large.json'), ' '); assert.throws(() => c.read('large.json', 1_000_000), /too large/);
    const other = workspace('corruption'); other.write('.sodam-agent/state.json', { schema: 1, experiences: null, candidates: [], agents: [] });
    assert.throws(() => other.plan({ taskId: 'bad-state', kind: 'docs', goal: 'fixture' }));
    fs.writeFileSync(c.safe('large-proof.bin'), Buffer.alloc(10_000_000)); assert.equal(c.fingerprint(['large-proof.bin']).length, 1);
    fs.appendFileSync(c.safe('large-proof.bin'), 'x'); assert.throws(() => c.fingerprint(['large-proof.bin']), /too large/);
  });
  test('internal evidence rejects case aliases on Windows', () => {
    for (const relative of ['.sodam-agent/state.json', '.sodam-agent/policy.json', ...(process.platform === 'win32' ? ['.SODAM-AGENT/state.json', '.SoDaM-AgEnT/policy.json'] : [])]) assert.throws(() => c.fingerprint([relative]), /independent evidence/);
  });
  test('maximum gap length creates bounded stable role name without collisions', () => {
    const other = workspace('long-gap');
    for (const gap of ['g'.repeat(50), 'g'.repeat(49) + 'h']) {
      for (let i = 0; i < 2; i++) record(other, `${gap.slice(-1)}-id-${i}`, `${gap.slice(-1)}-task-${i}`, { gap });
      const result = other.cycle({ kind: 'docs', gap }); assert.ok(result.activated.length <= 50);
      assert.equal(other.plan({ taskId: 'long-plan', kind: 'docs', goal: 'fixture', gap }).generatedAgent.name, result.activated);
    }
    assert.equal(new Set(other.state().agents.map(a => a.name)).size, 2);
    assert.throws(() => other.cycle({ kind: 'docs', gap: 'g'.repeat(51) }));
  });
  console.log(JSON.stringify({ checks, runtime: 'local lifecycle and CLI', fixtures: true, codexModelBehavior: 'not exercised', globalConfigurationChanged: false }));
} finally {
  assert.ok(path.resolve(sandbox).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`));
  fs.rmSync(sandbox, { recursive: true, force: true });
}
