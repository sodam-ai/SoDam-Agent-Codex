// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Isolated synthetic checks, not actual host invocation or long-term learning proof.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(process.argv[2]!=='isolated') {
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-automatic-'));
  try {
    const home=path.join(base,'home');fs.mkdirSync(home);
    const child=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'isolated',base],{encoding:'utf8',timeout:30000,
      env:{...process.env,USERPROFILE:home,HOME:home}});
    process.stdout.write(child.stdout);process.stderr.write(child.stderr);assert.equal(child.status,0);
  } finally {assert.ok(base.startsWith(os.tmpdir()+path.sep));fs.rmSync(base,{recursive:true,force:true});}
} else {
  const base=process.argv[3];assert.equal(os.homedir(),path.join(base,'home'));
  const {configureAutomatic,automaticPolicy,connectAutomatic,adoptAutomatic,restoreAutomatic}=await import('../plugins/autonomy-team/runtime/automatic.mjs');
  const {Controller}=await import('../plugins/autonomy-team/runtime/engine.mjs');
  const {inspectRuntime}=await import('../plugins/autonomy-team/runtime/diagnostics.mjs');
  const {authorizeArea,revokeArea,setPersistentArea,connectWorkspace}=await import('../plugins/autonomy-team/runtime/areas.mjs');
  const {bindWorkspace,boundWorkspace}=await import('../plugins/autonomy-team/runtime/workspace-binding.mjs');
  const make=name=>{const root=path.join(base,name);fs.mkdirSync(root,{recursive:true});return root;};
  const root=make('project-a'),other=make('project-b');
  assert.equal(automaticPolicy(),null);assert.equal(connectAutomatic(new Controller(root)).connected,false);
  assert.deepEqual(fs.readdirSync(root),[]);
  for(const invalid of [{enabled:true},{authorize:true,enabled:true,days:7},{authorize:true,enabled:true,maxAgents:21}])
    assert.throws(()=>configureAutomatic(invalid));
  configureAutomatic({authorize:true,enabled:true});
  assert.equal(automaticPolicy().autoPilot,true);
  const hook=event=>spawnSync(process.execPath,[fileURLToPath(new URL('../plugins/autonomy-team/hooks/entry.mjs',import.meta.url))],
    {input:JSON.stringify(event),encoding:'utf8',timeout:5000});
  const start=hook({hook_event_name:'SessionStart',cwd:root,session_id:'synthetic-a'});assert.equal(start.status,0,start.stderr);
  const c=new Controller(root);assert.equal(c.policy().expiresAt,null);assert.equal(c.policy().autoPilot,true);
  const initial=fs.readFileSync(c.safe('.sodam-agent/state.json'));
  for(const session of ['synthetic-a','synthetic-b']){
    const r=hook({hook_event_name:'UserPromptSubmit',cwd:root,session_id:session,turn_id:session,prompt:'Create a bounded document.'});
    assert.equal(r.status,0,r.stderr);assert.ok(JSON.parse(r.stdout).hookSpecificOutput.additionalContext.includes('turnKey'));
  }
  assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),initial);
  const second=hook({hook_event_name:'SessionStart',cwd:other});assert.equal(second.status,0,second.stderr);
  assert.equal(new Controller(other).policy().expiresAt,null);assert.equal(inspectRuntime({workspace:other}).workspace.authorization,'valid');
  const source=make('binding-source');
  bindWorkspace(source,{authorize:true,sessionId:'synthetic-bound',target:other});
  assert.equal(boundWorkspace({cwd:source,session_id:'synthetic-bound'}).root,other);
  const toolOnly=make('tool-only');hook({hook_event_name:'PreToolUse',cwd:toolOnly,tool_name:'Read'});
  assert.equal(fs.existsSync(path.join(toolOnly,'.sodam-agent')),false);
  const readOnly=make('read-only');inspectRuntime({workspace:readOnly});
  assert.equal(fs.existsSync(path.join(readOnly,'.sodam-agent')),false);
  const legacy=make('legacy');const lc=new Controller(legacy);lc.initialize({authorize:true,days:1,autoPilot:false});
  const before=fs.readFileSync(lc.safe('.sodam-agent/policy.json'));connectAutomatic(lc);
  assert.deepEqual(fs.readFileSync(lc.safe('.sodam-agent/policy.json')),before);
  const unbound=JSON.parse(before);unbound.expiresAt=null;
  fs.writeFileSync(lc.safe('.sodam-agent/policy.json'),JSON.stringify(unbound));assert.throws(()=>lc.policy());
  fs.writeFileSync(lc.safe('.sodam-agent/policy.json'),before);
  const legacyState=fs.readFileSync(lc.safe('.sodam-agent/state.json'));
  assert.throws(()=>adoptAutomatic(lc,{}));
  assert.equal(adoptAutomatic(lc,{authorize:true}).expiresAt,null);
  assert.equal(lc.policy().autoPilot,false);
  assert.deepEqual(fs.readFileSync(lc.safe('.sodam-agent/state.json')),legacyState);
  assert.deepEqual(JSON.parse(fs.readFileSync(lc.safe('.sodam-agent/previous-period-policy.json'))),JSON.parse(before));
  assert.equal(adoptAutomatic(lc,{authorize:true}).duplicate,true);
  assert.equal(restoreAutomatic(lc,{authorize:true}).restored,true);
  assert.deepEqual(fs.readFileSync(lc.safe('.sodam-agent/policy.json')),before);
  assert.equal(restoreAutomatic(lc,{authorize:true}).duplicate,true);
  const persistentRoot=make('persistent-area'),persistentProject=make('persistent-area/project');
  const persistentGrant=authorizeArea(persistentRoot,{authorize:true,days:1,maxProjects:5,maxMutations:30,maxAgents:8,maxExperiences:200,maxRetries:1,autoPilot:true});
  const registryFile=path.join(os.homedir(),'.sodam-agent-areas','registry.json');
  const originalRegistry=fs.readFileSync(registryFile);
  assert.equal(setPersistentArea(persistentRoot,{authorize:true,areaId:persistentGrant.areaId,enabled:true}).expiresAt,null);
  assert.deepEqual(fs.readFileSync(registryFile),originalRegistry);
  connectWorkspace(persistentProject,true);
  const pc=new Controller(persistentProject);assert.equal(pc.policy().expiresAt,null);
  configureAutomatic({authorize:true,enabled:false});assert.throws(()=>lc.policy());assert.throws(()=>pc.policy());
  configureAutomatic({authorize:true,enabled:true});assert.equal(pc.policy().expiresAt,null);
  setPersistentArea(persistentRoot,{authorize:true,areaId:persistentGrant.areaId,enabled:false});assert.throws(()=>pc.policy());
  setPersistentArea(persistentRoot,{authorize:true,areaId:persistentGrant.areaId,enabled:true});assert.equal(pc.policy().expiresAt,null);
  const area=make('revoked-area'),excluded=make('revoked-area/project');
  const grant=authorizeArea(area,{authorize:true,days:7,maxProjects:5,maxMutations:30,maxAgents:8,maxExperiences:200,maxRetries:1,autoPilot:false});
  revokeArea(area,{authorize:true,areaId:grant.areaId});
  const revoked=hook({hook_event_name:'SessionStart',cwd:excluded});assert.equal(revoked.status,0,revoked.stderr);
  assert.equal(fs.existsSync(path.join(excluded,'.sodam-agent')),false);
  assert.equal(connectAutomatic(new Controller(excluded)).connected,false);
  configureAutomatic({authorize:true,enabled:false});assert.throws(()=>c.policy());
  const {statusDisplay}=await import('../plugins/autonomy-team/runtime/status-display.mjs');
  assert.ok(statusDisplay(c).marker.includes('공통 설정 꺼짐'));
  assert.throws(()=>boundWorkspace({cwd:source,session_id:'synthetic-bound'}));
  const fresh=make('disabled-project');assert.equal(connectAutomatic(new Controller(fresh)).connected,false);
  assert.deepEqual(fs.readdirSync(fresh),[]);
  configureAutomatic({authorize:true,enabled:true});assert.equal(c.policy().expiresAt,null);
  assert.throws(()=>connectAutomatic(new Controller(os.homedir())));
  const interrupted=make('interrupted');fs.mkdirSync(path.join(interrupted,'.sodam-agent'));
  assert.throws(()=>connectAutomatic(new Controller(interrupted)));
  fs.writeFileSync(path.join(os.homedir(),'.sodam-agent-automatic','policy.json'),'{}');
  assert.throws(()=>automaticPolicy());assert.throws(()=>c.policy());
  console.log('PASS: persistent automatic policy, two workspaces/new sessions, no implicit consent, legacy/revocation precedence, off/on, corruption and interrupted store');
}
