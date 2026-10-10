// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Fixed parser only: source snapshots go to stdin, never evaluated or imported.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { Controller } from './engine.mjs';
const MAX = 262144;
export function checkNodeSyntax(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input));
  assert.deepEqual(Object.keys(input).sort(), ['evidence', 'workspace']);
  assert.ok(typeof input.workspace === 'string' && input.workspace.length <= 1000);
  const controller = new Controller(input.workspace); controller.policy();
  assert.ok(Array.isArray(input.evidence) && input.evidence.length >= 1 && input.evidence.length <= 4);
  assert.equal(new Set(input.evidence.map(p => typeof p === 'string' ? p.toLowerCase() : p)).size, input.evidence.length);
  // Validate all files before any child is launched; return no source or parser output.
  const snapshots = input.evidence.map(relative => {
    assert.ok(typeof relative === 'string' && relative.length <= 200 && /^[a-zA-Z0-9_./ -]+$/.test(relative));
    assert.ok(relative.split('/').every(part => !part.startsWith('.') && !/(?:auth|credential|secret|password|token)/i.test(part)));
    const extension = path.extname(relative).toLowerCase();
    assert.ok(['.mjs', '.cjs'].includes(extension));
    const file = controller.safe(relative, true), before = fs.lstatSync(file);
    const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
    try {
      const stat = fs.fstatSync(fd);
      assert.ok(stat.isFile() && stat.nlink === 1 && stat.size > 0 && stat.size <= MAX);
      assert.ok(stat.dev === before.dev && stat.ino === before.ino);
      const buffer = Buffer.alloc(MAX + 1); let bytes = 0;
      while (bytes < buffer.length) { const size = fs.readSync(fd, buffer, bytes, buffer.length - bytes, null); if (!size) break; bytes += size; }
      assert.ok(bytes > 0 && bytes <= MAX);
      const data = buffer.subarray(0, bytes);
      const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
      assert.ok(text.trim() && !text.includes('\0'));
      return { path: relative, bytes, sha256: crypto.createHash('sha256').update(data).digest('hex'), data, type: extension === '.mjs' ? 'module' : 'commonjs' };
    } finally { fs.closeSync(fd); }
  });
  const artifacts = snapshots.map(({ data, type, ...artifact }) => {
    controller.policy();
    const env = {};
    for (const key of ['SystemRoot', 'TEMP', 'TMP']) if (process.env[key]) env[key] = process.env[key];
    const child = spawnSync(process.execPath, ['--check', '--input-type=' + type], {
      input: data, cwd: controller.root, env, shell: false, timeout: 5000,
      windowsHide: true, stdio: ['pipe', 'ignore', 'ignore'],
    });
    const timedOut = child.error?.code === 'ETIMEDOUT';
    const exit_code = Number.isInteger(child.status) ? child.status : null;
    const status = !child.error && child.signal === null && exit_code === 0 ? 'passed' : 'failed';
    return { ...artifact, exit_code, timedOut, status,
      diagnostic: timedOut ? 'parser-timeout' : child.error || child.signal ? 'parser-unavailable' : status === 'passed' ? 'none' : 'syntax-rejected' };
  });
  return { exit_code: artifacts.every(a => a.status === 'passed') ? 0 : 1, readOnly: true, artifacts,
    checks: ['authorized-project', 'bounded-regular-utf8-snapshots', 'fixed-node-parser', 'no-source-evaluation', 'no-parser-output-returned'],
    quality: 'Syntax only. Does not verify imports, unit tests, build, behavior or learning effects.' };
}
