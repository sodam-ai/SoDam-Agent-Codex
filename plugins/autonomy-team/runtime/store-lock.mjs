// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Event-driven recovery of labelled, dead owners only. Never infer expiry.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

function checked(file) {
  assert.ok(path.isAbsolute(file));
  let cursor = path.parse(file).root;
  for (const part of file.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    try {
      const stat = fs.lstatSync(cursor);
      assert.ok(!stat.isSymbolicLink(), 'linked lock path');
      if (stat.isFile()) assert.equal(stat.nlink, 1, 'linked lock file');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return file;
}
function snapshot(file) {
  checked(file);
  try {
    const stat = fs.lstatSync(file);
    assert.ok(stat.isFile() && stat.size <= 1024, 'invalid lock file');
    return fs.readFileSync(file);
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function metadata(bytes) {
  try {
    const value = JSON.parse(bytes);
    assert.deepEqual(Object.keys(value).sort(), ['createdAt','nonce','pid','schema']);
    assert.equal(value.schema, 2);
    assert.ok(Number.isSafeInteger(value.pid) && value.pid > 0);
    assert.match(value.nonce, /^[a-f0-9]{32}$/);
    assert.ok(typeof value.createdAt === 'string' && Number.isFinite(Date.parse(value.createdAt)));
    return value;
  } catch { return null; }
}
function owner(value) {
  if (!value) return 'unknown';
  try { process.kill(value.pid, 0); return 'running'; }
  catch (error) { return error.code === 'ESRCH' ? 'not-running' : 'unknown'; }
}
export function storeLockStatus(file) {
  const guard = snapshot(file + '.recovery-lock');
  if (guard !== null) return {locked:true,owner:owner(metadata(guard))};
  const bytes = snapshot(file);
  if (bytes === null) return {locked:false,owner:'none'};
  let value = metadata(bytes);
  // Legacy metadata is diagnostic-only; it is never automatically recovered.
  if (!value) {
    try {
      const old = JSON.parse(bytes);
      if (old.schema === 1 && Object.keys(old).length === 2 && Number.isSafeInteger(old.pid) && old.pid > 0) value = old;
    } catch { /* Preserve unknown bytes. */ }
  }
  return {locked:true,owner:owner(value)};
}
const busy = code => Object.assign(new Error('busy: store locked; preserve unknown or running owners'), {code});
function newOwner() {
  return Buffer.from(JSON.stringify({schema:2,pid:process.pid,nonce:crypto.randomBytes(16).toString('hex'),createdAt:new Date().toISOString()}));
}
function release(file, fd, bytes) {
  fs.closeSync(fd);
  const current = snapshot(file);
  assert.ok(current?.equals(bytes), 'lock ownership changed; preserve current lock');
  fs.unlinkSync(file);
}
function recover(file, code) {
  const before = snapshot(file);
  if (!before || owner(metadata(before)) !== 'not-running') throw busy(code);
  // All new writers observe this exclusive guard before AND after acquisition.
  // A crashed/unknown recovery guard requires review; never recursively unlock it.
  const guard = checked(file + '.recovery-lock');
  let fd;
  try { fd = fs.openSync(guard, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw busy(code); throw error; }
  const bytes = newOwner();
  try {
    fs.writeFileSync(fd, bytes); fs.fsyncSync(fd);
    assert.ok(snapshot(file)?.equals(before), 'lock changed during recovery');
    if (owner(metadata(before)) !== 'not-running') throw busy(code);
    const prefix = path.basename(file) + '.recovered-';
    assert.ok(fs.readdirSync(path.dirname(file)).filter(name => name.startsWith(prefix)).length < 32, 'lock recovery backup budget reached; preserve records');
    const backup = checked(file + '.recovered-' + crypto.randomUUID() + '.json');
    const backupFd = fs.openSync(backup, 'wx');
    try { fs.writeFileSync(backupFd, before); fs.fsyncSync(backupFd); }
    finally { fs.closeSync(backupFd); }
    assert.ok(snapshot(backup)?.equals(before), 'lock backup verification failed');
    assert.ok(snapshot(file)?.equals(before), 'lock changed after backup');
    fs.unlinkSync(file);
  } finally { release(guard, fd, bytes); }
}
export function withStoreLock(file, action, code = 'SODAM_STORE_LOCKED') {
  checked(file);
  const guard = file + '.recovery-lock';
  if (fs.existsSync(checked(guard))) throw busy(code);
  let fd;
  try { fd = fs.openSync(file, 'wx'); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    recover(file, code);
    // A changed owner is a new contention, not a reason to retry in a loop.
    try { fd = fs.openSync(file, 'wx'); }
    catch (next) { if (next.code === 'EEXIST') throw busy(code); throw next; }
  }
  const bytes = newOwner();
  try {
    fs.writeFileSync(fd, bytes); fs.fsyncSync(fd);
    if (fs.existsSync(checked(guard))) throw busy(code);
    return action();
  } finally { release(file, fd, bytes); }
}
