// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Every suite receives a fresh user home so installed personal policy cannot
// change fixture behavior or be modified by a regression test.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const suites=['e2e','adversarial','runtime','ci','autonomy','bridge','documentation','release','maintenance','mcp','syntax-checker','workflow','work-learning','archive','continuation','diagnostics','areas','workspace-binding','cross-project','automatic','status-display','retention','capacity-governance','agent-management','agent-catalog','recovery'];
const base=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-test-suite-'));
let passed=0;
try {
  for(const name of suites){
    const home=path.join(base,name);fs.mkdirSync(home);
    const result=spawnSync(process.execPath,[path.join(root,'test',name+'.mjs')],{
      cwd:root,encoding:'utf8',timeout:120000,maxBuffer:4_000_000,
      env:{...process.env,HOME:home,USERPROFILE:home}
    });
    process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');
    if(result.error || result.status!==0){console.error('FAIL suite: '+name);process.exitCode=1;break;}
    passed++;
  }
  console.log(JSON.stringify({suitesPassed:passed,suitesTotal:suites.length,isolatedHomes:true}));
}finally{
  assert.ok(path.resolve(base).startsWith(path.resolve(os.tmpdir())+path.sep));
  fs.rmSync(base,{recursive:true,force:true});
}
