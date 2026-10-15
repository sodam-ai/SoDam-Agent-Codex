// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Shared role data only. Project evidence and learning records never enter this file.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {withStoreLock,storeLockStatus} from './store-lock.mjs';
import {automaticPolicy} from './automatic.mjs';

const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const encode = value => JSON.stringify(value, null, 2) + '\n';
const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const virtual = /^\.sodam-agent\/common-roles\/([a-z0-9]+(?:-[a-z0-9]+)*)\/SKILL\.md$/;
export const commonEnabled = () => automaticPolicy()?.enabled === true && automaticPolicy()?.commonAgents === true;
const directory = () => path.join(os.homedir(), '.sodam-agent-automatic', 'agents');
export const COMMON_REGISTRY_MAX_BYTES = 4_000_000;

// Read-only capacity metadata; never exposes private registry content or paths.
export function commonStorageUsage() {
  if (!commonEnabled()) return null;
  const file = checked(path.join(directory(), 'registry.json'));
  if (!fs.existsSync(file)) return {id:'common-registry-bytes',used:0,limit:COMMON_REGISTRY_MAX_BYTES};
  const stat = fs.statSync(file);
  assert.ok(stat.isFile() && stat.size <= COMMON_REGISTRY_MAX_BYTES);
  return {id:'common-registry-bytes',used:stat.size,limit:COMMON_REGISTRY_MAX_BYTES};
}

function checked(target, required = false) {
  let current = path.parse(target).root;
  for (const part of target.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try { const stat = fs.lstatSync(current); assert.ok(!stat.isSymbolicLink(), 'linked common registry path');
      if (stat.isFile()) assert.equal(stat.nlink, 1, 'linked common registry file'); }
    catch (error) { if (error.code !== 'ENOENT' || required) throw error; }
  }
  return target;
}
export function commonRolePath(relative, required = false) {
  const match = virtual.exec(relative); assert.ok(match && match[1].length <= 50, 'invalid common role path');
  assert.ok(commonEnabled(), 'common agents disabled');
  const target = checked(path.join(directory(), 'roles', match[1], 'SKILL.md'), required);
  if (required) assert.ok(fs.statSync(target).isFile() && fs.statSync(target).size <= 262144);
  return target;
}
export function commonSnapshot() {
  if (!commonEnabled()) return {schema:1, revision:0, agents:[], reservations:[], claims:[], history:[]};
  const file = checked(path.join(directory(), 'registry.json'));
  if (!fs.existsSync(file)) return {schema:1, revision:0, agents:[], reservations:[], claims:[], history:[]};
  assert.ok(fs.statSync(file).isFile() && fs.statSync(file).size <= COMMON_REGISTRY_MAX_BYTES);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual(Object.keys(value).sort(), ['agents','claims','history','reservations','revision','schema']);
  assert.equal(value.schema, 1); assert.ok(Number.isSafeInteger(value.revision) && value.revision >= 0);
  for (const key of ['agents','reservations','claims','history']) assert.ok(Array.isArray(value[key]));
  const seen = new Set();
  for (const agent of value.agents) {
    assert.ok(Object.keys(agent).every(key=>['name','kind','gap','relativePath','sha256','spec','confirmationPolicy','status','previous','previousStatus','basisTasks','common','protected','manualHold','recordedUses','lastRecordedUse','managedPreviousStatus','managedArchiveStatus'].includes(key)),'unexpected common role field');
    assert.ok(identifier.test(agent.name) && agent.name.length <= 50 && !seen.has(agent.name)); seen.add(agent.name);
    assert.equal(agent.common, true); assert.equal(agent.spec?.portable, true);
    assert.ok(Array.isArray(agent.basisTasks) && agent.basisTasks.length===0,'private basis must remain in project');
    for(const key of ['protected','manualHold'])assert.equal(typeof agent[key],'boolean');
    assert.ok(identifier.test(agent.gap) && agent.gap.length<=50);
    assert.match(agent.sha256,/^[a-f0-9]{64}$/);
    assert.equal(agent.relativePath, `.sodam-agent/common-roles/${agent.name}/SKILL.md`);
    assert.ok(['pilot','confirmed','disabled','superseded','archived'].includes(agent.status));
    assert.equal(digest(fs.readFileSync(commonRolePath(agent.relativePath, true))), agent.sha256, 'common role modified');
  }
  for(const reservation of value.reservations) {
    assert.deepEqual(Object.keys(reservation).sort(),['gap','name','owner','sha256']);
    assert.ok(identifier.test(reservation.name) && reservation.name.length<=50 && identifier.test(reservation.gap));
    assert.match(reservation.owner,/^[a-f0-9]{64}$/);assert.match(reservation.sha256,/^[a-f0-9]{64}$/);
  }
  for(const claim of value.claims) {
    assert.deepEqual(Object.keys(claim).sort(),['id','name']);assert.match(claim.id,/^[a-f0-9]{64}$/);
    assert.ok(value.agents.some(a=>a.name===claim.name),'unknown common use claim');
  }
  return value;
}
let owned = false;
// An unlabelled legacy lock is never assumed stale. Inspection does not unlock.
export function commonLockStatus() {
  if (!commonEnabled()) return {locked:false,owner:'none'};
  return storeLockStatus(checked(path.join(directory(), 'lock')));
}
export function withCommonMutation(action) {
  if (!commonEnabled()) return action();
  assert.equal(owned, false, 'nested common registry mutation');
  checked(directory()); fs.mkdirSync(directory(), {recursive:true}); checked(directory(), true);
  return withStoreLock(path.join(directory(), 'lock'), () => {
    owned = true;
    try { return action(); } finally { owned = false; }
  }, 'SODAM_COMMON_LOCKED');
}
export function saveCommon(value, expectedRevision) {
  assert.equal(owned, true, 'common registry transaction required');
  assert.equal(commonSnapshot().revision, expectedRevision, 'stale common registry');
  const next = {...value, revision:expectedRevision + 1}, content = encode(next);
  assert.ok(Buffer.byteLength(content) <= COMMON_REGISTRY_MAX_BYTES, 'common registry capacity reached');
  const file = checked(path.join(directory(), 'registry.json')), temporary = file + '.' + crypto.randomUUID() + '.tmp';
  try { fs.writeFileSync(temporary, content, {flag:'wx'}); fs.renameSync(temporary, file); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  return next;
}
export const commonOwner = root => digest(process.platform === 'win32' ? root.toLowerCase() : root);
export function commonId(gap, revision) {
  assert.ok(identifier.test(gap) && gap.length <= 50 && Number.isSafeInteger(revision) && revision > 0);
  return `common-${digest(gap).slice(0,20)}-v${revision}`;
}
export function reserveCommon(candidate, owner) {
  assert.equal(owned, true); const state = commonSnapshot();
  assert.ok(!state.reservations.some(r => r.gap === candidate.gap), 'common capability already reserved');
  assert.ok(!state.agents.some(a => a.name === candidate.id), 'common revision exists');
  state.reservations.push({name:candidate.id, gap:candidate.gap, owner, sha256:candidate.sha256});
  saveCommon(state, state.revision);
}
export function commonClaim(root, turnKey, agentName, release = false) {
  if (!commonEnabled()) return;
  const update = () => {
    const state = commonSnapshot(), id = digest(commonOwner(root) + ':' + turnKey);
    if (release) { if (!state.claims.some(c => c.id === id)) return; state.claims = state.claims.filter(c => c.id !== id); }
    else {
      assert.ok(state.agents.some(a => a.name === agentName && ['pilot','confirmed'].includes(a.status)), 'common role not active');
      const existing = state.claims.find(c => c.id === id);
      if (existing) { assert.equal(existing.name, agentName); return; }
      state.claims.push({id, name:agentName});
    }
    saveCommon(state, state.revision);
  };
  return owned ? update() : withCommonMutation(update);
}
