// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Fixed read-only verification; never execute caller-supplied commands or return file content.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { Controller } from './engine.mjs';

const MAX = 262144;
const sensitive = /(?:(?<![a-zA-Z0-9_])(?:sk-[a-zA-Z0-9_-]{16,}|github_pat_[a-zA-Z0-9_]+|gh[pousr]_[a-zA-Z0-9]{16,}|AKIA[0-9A-Z]{16}|xox[baprs]-[a-zA-Z0-9-]+)|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|["']?(?:api[_-]?key|password|access[_-]?token|secret)["']?\s*[:=]\s*["']?\S+)/i;
export function verifyArtifacts(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input));
  assert.deepEqual(Object.keys(input).sort(), ['evidence', 'workspace']);
  assert.ok(typeof input.workspace === 'string' && input.workspace.length <= 1000);
  const controller = new Controller(input.workspace); controller.policy();
  assert.ok(Array.isArray(input.evidence) && input.evidence.length >= 1 && input.evidence.length <= 4);
  assert.equal(new Set(input.evidence.map(p => typeof p === 'string' ? p.toLowerCase() : p)).size, input.evidence.length);
  const artifacts = input.evidence.map(relative => {
    assert.ok(typeof relative === 'string' && relative.length <= 200 && /^[a-zA-Z0-9_./ -]+$/.test(relative));
    assert.ok(relative.split('/').every(part => !part.startsWith('.') && !/(?:auth|credential|secret|password|token)/i.test(part)));
    assert.ok(['.md', '.txt', '.json', '.csv', '.html', '.svg'].includes(path.extname(relative).toLowerCase()));
    const file = controller.safe(relative, true);
    const before = fs.lstatSync(file);
    const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
    try {
      const stat = fs.fstatSync(fd); assert.ok(stat.isFile() && stat.nlink === 1 && stat.size > 0 && stat.size <= MAX);
      assert.ok(stat.dev === before.dev && stat.ino === before.ino, 'file changed during opening');
      const buffer = Buffer.alloc(MAX + 1); let bytes = 0;
      while (bytes < buffer.length) { const size = fs.readSync(fd, buffer, bytes, buffer.length - bytes, null); if (!size) break; bytes += size; }
      assert.ok(bytes > 0 && bytes <= MAX);
      const data = buffer.subarray(0, bytes);
      const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
      assert.ok(text.trim() && !text.includes('\0') && !sensitive.test(text));
      return { path: relative, bytes, sha256: crypto.createHash('sha256').update(data).digest('hex') };
    } finally { fs.closeSync(fd); }
  });
  return { exit_code: 0, artifacts, checks: ['authorized-project', 'bounded-regular-text-files', 'nonempty-utf8', 'no-known-secret-patterns'], quality: 'File checks executed; semantic quality remains caller assessed.' };
}
