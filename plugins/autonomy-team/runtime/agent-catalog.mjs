// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Controller} from './engine.mjs';
import {listAgents} from './agent-management.mjs';
// Explicit caller-selected projects only. No disk crawling or registry writes.
export function agentCatalog(input) {
  assert.deepEqual(Object.keys(input).sort(),['projects']);
  assert.ok(Array.isArray(input.projects) && input.projects.length>=1 && input.projects.length<=20);
  const seen=new Set(),projects=[];
  for(const selected of input.projects) {
    assert.ok(typeof selected==='string' && path.isAbsolute(selected));
    let actual;
    try {actual=fs.realpathSync(selected);} catch {actual=path.resolve(selected);}
    const identity=process.platform==='win32'?actual.toLowerCase():actual;
    assert.ok(!seen.has(identity),'duplicate project');seen.add(identity);
    const projectId=crypto.createHash('sha256').update(identity).digest('hex');
    try {
      const listing=listAgents(new Controller(actual));
      projects.push({projectId,workspace:actual,status:'checked',snapshot:listing.snapshot,
        items:listing.items.map(item=>({id:projectId+':'+item.name,name:item.name,type:item.type,
          kind:item.kind,status:item.status,bytes:item.bytes??null,protected:item.protected??[],
          recordedUses:item.recordedUses??null,lastRecordedUse:item.lastRecordedUse??null,
          usageScope:item.usageScope??null,
          assessment:item.assessment??null}))});
    } catch {projects.push({projectId,workspace:actual,status:'unverified',items:[],
      reason:'Authorization, integrity or recovery precondition not satisfied'});}
  }
  return {readOnly:true,projects,complete:projects.every(p=>p.status==='checked'),
    scope:'Only explicitly selected projects; no lesson bodies or backup contents returned',
    mutationsSupported:false};
}
