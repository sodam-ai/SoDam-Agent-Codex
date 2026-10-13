// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import assert from 'node:assert/strict';
// Metadata only. No content export, cleanup, quota changes or link traversal.
export function storageInventory(c) {
  const groups={records:0,roles:0,backups:0,other:0,history:0};
  let files=0,directories=0;
  function walk(relative,depth=0) {
    assert.ok(depth<=12 && ++directories<=500,'storage scan budget exceeded');
    for(const entry of fs.readdirSync(c.safe(relative),{withFileTypes:true})) {
      if(relative==='.sodam-agent' && entry.name==='lock')continue;
      const name=relative+'/'+entry.name,target=c.safe(name);
      if(entry.isDirectory()){walk(name,depth+1);continue;}
      assert.ok(entry.isFile(),'non-regular storage entry');
      const stat=fs.statSync(c.safe(name,true));assert.equal(stat.nlink,1);
      assert.ok(++files<=750,'storage scan budget exceeded');
      const group=name.startsWith('.sodam-agent-history/')?'history':name.startsWith('.sodam-agent/management-backups/')?'backups':
        name.startsWith('.sodam-agent/roles/')?'roles':
        /\/(policy|state|hooks)\.json$/.test(name)?'records':'other';
      groups[group]+=stat.size;
    }
  }
  walk('.sodam-agent');
  const managedFiles=files,managedBytes=Object.values(groups).reduce((a,b)=>a+b,0);
  if(fs.existsSync(c.safe('.sodam-agent-history')))walk('.sodam-agent-history');
  return {readOnly:true,files,groups,totalBytes:Object.values(groups).reduce((a,b)=>a+b,0),
    managedFiles,managedBytes,complete:true,scope:'Managed store and managed history only; external archives and filesystem free space not measured',
    backupRetentionAutomatic:false,spaceFreedBytes:0};
}
