// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Move only to existing, unlinked directories; no permissions or files are changed.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const identity = value => process.platform==='win32' ? value.toLowerCase() : value;
const inside = (target, parent) => identity(target)===identity(parent) || identity(target).startsWith(identity(parent)+path.sep);
export function relocateMcpDirectory(candidates=[path.dirname(process.execPath),os.tmpdir()]) {
  const pluginRoot=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
  const initial=process.cwd();
  const seen=new Set();
  if(!Array.isArray(candidates) || candidates.length>2)return false;
  for(const candidate of candidates) {
    try {
      if(typeof candidate!=='string' || !path.isAbsolute(candidate))continue;
      const target=path.resolve(candidate);const key=identity(target);
      if(seen.has(key))continue;seen.add(key);
      // Also reject another plugin cache and the initial host directory subtree.
      if(inside(target,pluginRoot) || (initial!==path.parse(initial).root && inside(target,initial)) || /(?:^|[\\/])plugins[\\/]cache(?:[\\/]|$)/i.test(target))continue;
      let current=path.parse(target).root;
      if(fs.lstatSync(current).isSymbolicLink())continue;
      let linked=false;
      for(const part of target.slice(current.length).split(path.sep).filter(Boolean)) {
        current=path.join(current,part);
        if(fs.lstatSync(current).isSymbolicLink()){linked=true;break;}
      }
      if(linked || !fs.statSync(target).isDirectory())continue;
      const resolved=fs.realpathSync(target);
      if(identity(resolved)!==key)continue;
      process.chdir(target);
      if(identity(fs.realpathSync(process.cwd()))===key)return true;
    } catch { /* A failed candidate never grants permission or starts the server. */ }
  }
  return false;
}
