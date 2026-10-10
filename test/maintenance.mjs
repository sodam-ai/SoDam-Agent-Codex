// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Controller } from '../plugins/autonomy-team/runtime/engine.mjs';
import { authorizeMaintenance, recoverMaintenance, runMaintenance } from '../plugins/autonomy-team/runtime/maintenance.mjs';
const deadlineBase = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-deadline-'));
const deadline = new Controller(deadlineBase); deadline.initialize({ authorize: true });
authorizeMaintenance(deadlineBase, { authorize: true, maxRunsPerDay: 2, timeoutMs: 100 });
fs.writeFileSync(path.join(deadlineBase, 'large-proof.txt'), Buffer.alloc(10_000_000, 65));
const initial = deadline.state();
// Changed evidence forces all 200 old proofs to be rehashed. A deadline must
// terminate this workload rather than certify incomplete recall as success.
initial.experiences = Array.from({ length: 200 }, (_, i) => ({ id: `run-${i}`, taskId: `task-${i}`,
  kind: 'docs', outcome: 'verified', cause: 'none', seconds: 1, corrections: 0,
  evidence: [{ path: 'large-proof.txt', sha256: '0'.repeat(64) }],
  lesson: { objective: 'Check document', procedure: [{ action: 'inspect-requirements', detail: 'Read fields' },
    { action: 'verify-output', detail: 'Check fields' }], checks: ['Fields present'] } }));
deadline.save(initial);
assert.throws(() => runMaintenance(deadlineBase));
assert.equal(deadline.read('.sodam-agent/maintenance-ledger.json').runs[0].status, 'timed-out');
assert.equal(deadline.state().experiences.length, 200);
// A worker failure consumes a reservation and never records a successful job.
initial.experiences = [{ outcome: 'verified', lesson: {}, evidence: [] }]; deadline.save(initial);
const mp = deadline.read('.sodam-agent/maintenance-policy.json'); mp.timeoutMs = 30_000;
deadline.write('.sodam-agent/maintenance-policy.json', mp);
initial.agents = [{ status: 'pilot', relativePath: 'missing-role.md' }]; deadline.save(initial);
assert.throws(() => runMaintenance(deadlineBase));
assert.equal(deadline.read('.sodam-agent/maintenance-ledger.json').runs[1].status, 'failed');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-maintenance-'));
const c = new Controller(base); c.initialize({ authorize: true });
assert.throws(() => runMaintenance(base));
assert.throws(() => authorizeMaintenance(base, { authorize: false }));
assert.throws(() => authorizeMaintenance(base, { authorize: true, timeoutMs: 60_001 }));
assert.throws(() => authorizeMaintenance(base, { authorize: true, command: 'untrusted' }));
authorizeMaintenance(base, { authorize: true, maxRunsPerDay: 2, timeoutMs: 30_000 });
assert.throws(() => authorizeMaintenance(base, { authorize: true }));
const result = runMaintenance(base); assert.equal(result.validLessons, 0); assert.deepEqual(result.specializationNeeded, []);
assert.equal(c.read('.sodam-agent/maintenance-ledger.json').runs[0].status, 'passed');
runMaintenance(base);
assert.throws(() => runMaintenance(base));
assert.equal(c.read('.sodam-agent/maintenance-ledger.json').runs.length, 2);
const value = c.read('.sodam-agent/maintenance-ledger.json');
value.runs[0].status = 'running'; c.write('.sodam-agent/maintenance-ledger.json', value);
assert.throws(() => runMaintenance(base));
assert.throws(() => recoverMaintenance(base, { acknowledgeStopped: false, runId: value.runs[0].id }));
recoverMaintenance(base, { acknowledgeStopped: true, runId: value.runs[0].id });
assert.equal(c.read('.sodam-agent/maintenance-ledger.json').runs[0].status, 'recovered');
assert.throws(() => runMaintenance(base)); // Recovery never refunds a daily reservation.
value.runs[1].status = 'fake-success'; c.write('.sodam-agent/maintenance-ledger.json', value);
assert.throws(() => runMaintenance(base));
const policy = c.read('.sodam-agent/policy.json'); policy.expiresAt = '2000-01-01T00:00:00Z'; c.write('.sodam-agent/policy.json', policy);
assert.throws(() => runMaintenance(base));
console.log('PASS: real bounded maintenance worker; explicit approval, daily budget, preservation, recovery, malformed ledger and expiry');
// Test fixtures are retained outside the personal project and memory database.
