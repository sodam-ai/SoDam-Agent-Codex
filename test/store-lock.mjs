// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Synthetic isolated process crashes; never touch a user's lock or policy.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {withStoreLock,storeLockStatus} from '../plugins/autonomy-team/runtime/store-lock.mjs';
const self = fileURLToPath(import.meta.url);
if (process.argv[2] === 'hold') {
  withStoreLock(process.argv[3], () => {
    process.stdout.write('ready\n');
    // Keep the synchronous critical section open until the parent kills it.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000);
  });
} else {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'sodam-lock-fixture-'));
  const lock = path.join(root,'lock');
  let checks = 0;
  const test = (name, fn) => {fn(); checks++; console.log('PASS: ' + name);};
  let child;
  try {
    test('live owner blocks reentry and exception releases its own lock', () => {
      assert.throws(() => withStoreLock(lock, () => {
        assert.equal(storeLockStatus(lock).owner,'running');
        assert.throws(() => withStoreLock(lock, () => assert.fail('overlap')), error => error.code === 'SODAM_STORE_LOCKED');
        throw new Error('fixture work error');
      }), /fixture work error/);
      assert.equal(storeLockStatus(lock).locked,false);
    });
    test('empty malformed and legacy locks are preserved', () => {
      for (const bytes of ['', '{', JSON.stringify({schema:1,pid:process.pid})]) {
        fs.writeFileSync(lock,bytes);
        assert.throws(() => withStoreLock(lock, () => assert.fail('legacy recovery')));
        assert.equal(fs.readFileSync(lock,'utf8'),bytes); fs.unlinkSync(lock);
      }
    });
    child = spawn(process.execPath,[self,'hold',lock],{stdio:['ignore','pipe','pipe']});
    await once(child.stdout,'data');
    const original = fs.readFileSync(lock);
    test('actual live child remains protected and inspection writes nothing', () => {
      assert.equal(storeLockStatus(lock).owner,'running');
      assert.throws(() => withStoreLock(lock, () => assert.fail('live child')));
      assert.deepEqual(fs.readFileSync(lock),original);
    });
    const exited = once(child,'exit'); child.kill(); await exited; child = null;
    test('dead owner is visible but read-only inspection never recovers', () => {
      assert.equal(storeLockStatus(lock).owner,'not-running'); assert.deepEqual(fs.readFileSync(lock),original);
    });
    test('backup failure leaves old lock unchanged and does not run work', () => {
      const write = fs.writeFileSync;
      fs.writeFileSync = function(file,...args) {
        if(typeof file === 'number' && fs.readdirSync(root).some(name=>name.startsWith('lock.recovered-'))) {
          const error = new Error('fixture disk failure'); error.code='ENOSPC'; throw error;
        }
        return write.call(this,file,...args);
      };
      try { assert.throws(() => withStoreLock(lock, () => assert.fail('unbacked recovery'))); }
      finally { fs.writeFileSync = write; }
      assert.deepEqual(fs.readFileSync(lock),original);
      assert.equal(fs.existsSync(lock + '.recovery-lock'),false);
    });
    test('dead owner is backed up byte-for-byte before one successful action', () => {
      let ran=0; withStoreLock(lock,()=>{ran++;assert.equal(storeLockStatus(lock).owner,'running');});
      assert.equal(ran,1); assert.equal(fs.existsSync(lock),false);
      assert.ok(fs.readdirSync(root).filter(name=>name.startsWith('lock.recovered-')).some(name=>fs.readFileSync(path.join(root,name)).equals(original)));
    });
    test('unknown recovery guard blocks new writes without being removed', () => {
      fs.writeFileSync(lock + '.recovery-lock','');
      assert.equal(storeLockStatus(lock).locked,true);
      assert.throws(()=>withStoreLock(lock,()=>assert.fail('guard ignored')));
      assert.equal(fs.existsSync(lock),false); assert.equal(fs.readFileSync(lock + '.recovery-lock','utf8'),'');
      fs.unlinkSync(lock + '.recovery-lock');
    });
    test('hard-linked lock and oversize metadata are rejected without writes', () => {
      const target=path.join(root,'source'); fs.writeFileSync(target,'preserved'); fs.linkSync(target,lock);
      assert.throws(()=>withStoreLock(lock,()=>assert.fail('linked lock'))); assert.equal(fs.readFileSync(target,'utf8'),'preserved'); fs.unlinkSync(lock);
      fs.writeFileSync(lock,'x'.repeat(1025)); assert.throws(()=>withStoreLock(lock,()=>assert.fail('oversize lock'))); assert.equal(fs.statSync(lock).size,1025); fs.unlinkSync(lock);
    });
    console.log(JSON.stringify({lockGroups:checks,realChildCrash:true,personalDataTouched:false}));
  } finally {
    if(child) {const exited=once(child,'exit');child.kill();await exited;}
    assert.ok(root.startsWith(os.tmpdir()+path.sep));fs.rmSync(root,{recursive:true,force:true});
  }
}
