// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Bounded local maintenance. No shell, model/API calls, prompt or raw output log.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Controller } from './engine.mjs';
import { Bridge } from './bridge.mjs';

const policyFile = '.sodam-agent/maintenance-policy.json';
const ledgerFile = '.sodam-agent/maintenance-ledger.json';
function keys(value, allowed) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value));
  assert.ok(Object.keys(value).every(key => allowed.includes(key)), 'unknown field');
}
function limit(value, minimum, maximum) {
  assert.ok(Number.isSafeInteger(value) && value >= minimum && value <= maximum, 'invalid limit');
  return value;
}
function policy(c) {
  c.policy();
  const p = c.read(policyFile);
  keys(p, ['schema', 'maxRunsPerDay', 'timeoutMs', 'externalCalls']);
  assert.equal(p.schema, 1); assert.equal(p.externalCalls, false);
  limit(p.maxRunsPerDay, 1, 24); limit(p.timeoutMs, 100, 60_000);
  return p;
}
function ledger(c) {
  if (!fs.existsSync(c.safe(ledgerFile))) return { schema: 1, runs: [] };
  const value = c.read(ledgerFile);
  keys(value, ['schema', 'runs']); assert.equal(value.schema, 1);
  assert.ok(Array.isArray(value.runs) && value.runs.length <= 1000);
  const ids = new Set();
  for (const run of value.runs) {
    keys(run, ['id', 'startedAt', 'status', 'elapsedMs']);
    assert.match(run.id, /^[a-f0-9-]{36}$/); assert.ok(!ids.has(run.id)); ids.add(run.id);
    assert.ok(Number.isSafeInteger(run.startedAt) && run.startedAt > 0 && run.startedAt <= Date.now());
    assert.ok(['running', 'passed', 'failed', 'timed-out', 'recovered'].includes(run.status));
    if (run.elapsedMs !== undefined) limit(run.elapsedMs, 0, 86_400_000);
  }
  return value;
}
export function authorizeMaintenance(workspace, input) {
  keys(input, ['authorize', 'maxRunsPerDay', 'timeoutMs']); assert.equal(input.authorize, true);
  const c = new Controller(workspace);
  const p = { schema: 1, maxRunsPerDay: limit(input.maxRunsPerDay ?? 2, 1, 24),
    timeoutMs: limit(input.timeoutMs ?? 30_000, 100, 60_000), externalCalls: false };
  return c.transaction(() => { c.policy(); c.write(policyFile, p, true); return p; });
}
export function recoverMaintenance(workspace, input) {
  keys(input, ['acknowledgeStopped', 'runId']); assert.equal(input.acknowledgeStopped, true);
  const c = new Controller(workspace);
  return c.transaction(() => {
    policy(c); const value = ledger(c);
    const run = value.runs.find(run => run.id === input.runId && run.status === 'running');
    assert.ok(run, 'running reservation not found');
    // Explicit confirmation is required; never infer that another process stopped.
    run.status = 'recovered'; c.write(ledgerFile, value); return { recovered: run.id };
  });
}
export function inspectMaintenance(workspace) {
  const c = new Controller(workspace); c.policy();
  const before = c.state(); const disabled = [];
  for (const role of before.agents.filter(role => ['pilot', 'confirmed'].includes(role.status))) {
    c.verifyAgent(role);
    if (before.experiences.some(run => run.agent === role.name && run.outcome === 'failed')) {
      disabled.push(c.rollback({ agent: role.name }).disabled);
    }
  }
  const recalled = new Bridge(workspace).recall();
  const state = c.state(); const gaps = new Map();
  for (const run of state.experiences) {
    if (run.outcome !== 'failed' || run.cause !== 'missing-role') continue;
    const id = `${run.kind}:${run.gap}`;
    if (!gaps.has(id)) gaps.set(id, { kind: run.kind, gap: run.gap, tasks: new Set() });
    gaps.get(id).tasks.add(run.taskId);
  }
  const needs = [...gaps.values()].filter(gap => gap.tasks.size >= 2 &&
    !state.agents.some(role => role.kind === gap.kind && role.gap === gap.gap && ['pilot', 'confirmed'].includes(role.status)))
    .map(({ kind, gap }) => ({ kind, gap }));
  return { validLessons: recalled.lessons.length, activeRoles: recalled.activeRoles.length,
    disabledRoles: disabled.length, specializationNeeded: needs,
    assurance: 'Local evidence maintenance only; no model training, independent quality certification or paid external calls.' };
}
export function runMaintenance(workspace) {
  const c = new Controller(workspace); const p = policy(c);
  const startedAt = Date.now(); const id = crypto.randomUUID();
  c.transaction(() => {
    policy(c); const value = ledger(c);
    assert.ok(!value.runs.some(run => run.status === 'running'), 'maintenance already running or requires explicit recovery');
    assert.ok(value.runs.length < 1000, 'ledger full; do not erase history');
    const day = new Date(startedAt).toISOString().slice(0, 10);
    assert.ok(value.runs.filter(run => new Date(run.startedAt).toISOString().slice(0, 10) === day).length < p.maxRunsPerDay,
      'daily maintenance budget exhausted');
    value.runs.push({ id, startedAt, status: 'running' }); c.write(ledgerFile, value);
  });
  const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--worker', c.root], {
    cwd: c.root, shell: false, encoding: 'utf8', timeout: p.timeoutMs, maxBuffer: 65_536,
    windowsHide: true, env: { ...process.env, NODE_OPTIONS: '', NODE_PATH: '' },
  });
  let result;
  let status = child.error?.code === 'ETIMEDOUT' ? 'timed-out' : 'failed';
  if (!child.error && child.status === 0) {
    try { result = JSON.parse(child.stdout); status = 'passed'; } catch { /* Malformed output remains a failure. */ }
  }
  c.transaction(() => {
    const value = ledger(c); const run = value.runs.find(run => run.id === id);
    assert.ok(run && run.status === 'running');
    run.status = status; run.elapsedMs = Math.min(Date.now() - startedAt, 86_400_000); c.write(ledgerFile, value);
  });
  if (status !== 'passed') throw new Error(`local maintenance ${status}`);
  return { runId: id, ...result, scope: 'fixed local worker only; host model time and billing are not controlled' };
}
if (process.argv[2] === '--worker') {
  try { process.stdout.write(JSON.stringify(inspectMaintenance(process.argv[3]))); }
  catch { process.stderr.write('Local maintenance failed; review policy, evidence and recovery state.\n'); process.exitCode = 1; }
}
