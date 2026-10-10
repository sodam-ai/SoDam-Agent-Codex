// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Isolated home and synthetic workspaces; never authorize the real user's folders.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if(process.argv[2]!=='isolated') {
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-areas-'));
  try {
    const home=path.join(base,'home');fs.mkdirSync(home);
    const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'isolated',base],{encoding:'utf8',timeout:30000,env:{...process.env,USERPROFILE:home,HOME:home}});
    process.stdout.write(result.stdout);process.stderr.write(result.stderr);assert.equal(result.status,0);
  } finally {assert.ok(base.startsWith(os.tmpdir()+path.sep));fs.rmSync(base,{recursive:true,force:true});}
} else {
  const base=process.argv[3];assert.equal(os.homedir(),path.join(base,'home'));
  const {authorizeArea,revokeArea,connectWorkspace,resolveWorkspace,inspectArea}=await import('../plugins/autonomy-team/runtime/areas.mjs');
  const {Controller}=await import('../plugins/autonomy-team/runtime/engine.mjs');
  const {Bridge}=await import('../plugins/autonomy-team/runtime/bridge.mjs');
  const {inspectRuntime}=await import('../plugins/autonomy-team/runtime/diagnostics.mjs');
  const {continueLearning}=await import('../plugins/autonomy-team/runtime/continuation.mjs');
  const {createHash}=await import('node:crypto');
  let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS: '+name);};
  const make=(name,marker=true)=>{const root=path.join(base,name);fs.mkdirSync(root,{recursive:true});if(marker)fs.writeFileSync(path.join(root,'AGENTS.md'),'Technical fixture.');return root;};
  const root=make('work',false),project=make('work/first'),nested=make('work/first/sub',false),excluded=make('work/excluded');
  const grant={authorize:true,days:7,exclusions:[excluded],maxProjects:4,maxMutations:50,maxAgents:8,maxExperiences:200,maxRetries:1,autoPilot:true};
  let area;
  const registry=path.join(os.homedir(),'.sodam-agent-areas','registry.json');
  const read=()=>JSON.parse(fs.readFileSync(registry,'utf8'));
  const rawWrite=value=>fs.writeFileSync(registry,JSON.stringify(value));
  const mcp=(name,args)=>{
    const server=fileURLToPath(new URL('../plugins/autonomy-team/runtime/mcp.mjs',import.meta.url));
    const messages=[{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18'}},{jsonrpc:'2.0',id:2,method:'tools/call',params:{name,arguments:args}}];
    const result=spawnSync(process.execPath,[server],{encoding:'utf8',timeout:5000,input:messages.map(message=>JSON.stringify(message)).join('\n')+'\n'});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stderr,'');const reply=JSON.parse(result.stdout.trim().split('\n').at(-1));assert.equal(reply.result.isError,false);return reply.result.structuredContent;
  };
  test('missing area diagnosis is read-only',()=>{assert.equal(inspectArea(nested).mode,'missing');assert.ok(!fs.existsSync(registry));assert.ok(!fs.existsSync(path.join(project,'.sodam-agent')));});
  test('explicit bounded grant required; drive and home grants rejected',()=>{
    assert.throws(()=>authorizeArea(root,{...grant,authorize:false}));assert.throws(()=>authorizeArea(root,{...grant,days:0}));assert.throws(()=>authorizeArea(os.homedir(),grant));assert.throws(()=>authorizeArea(path.parse(root).root,grant));assert.ok(!fs.existsSync(registry));area=authorizeArea(root,grant);assert.equal(area.authorized,true);
  });
  test('overlap, unknown fields and malformed inputs rejected',()=>{
    assert.throws(()=>authorizeArea(project,grant));assert.throws(()=>authorizeArea(root,{...grant,extra:true}));assert.throws(()=>authorizeArea(root,{...grant,maxProjects:101}));
  });
  test('subfolder resolves to project; diagnosis never creates it',()=>{
    const before=fs.readFileSync(registry);const result=inspectRuntime({workspace:nested});assert.equal(result.connection.root,project);assert.equal(result.connection.connectionRequired,true);assert.equal(result.workspace.authorization,'missing');assert.deepEqual(fs.readFileSync(registry),before);assert.ok(!fs.existsSync(path.join(project,'.sodam-agent')));
  });
  test('first connection creates only a separate bounded project store',()=>{
    assert.equal(connectWorkspace(nested).root,project);const c=new Controller(nested);assert.equal(c.root,project);const p=c.policy();assert.equal(p.areaBinding.areaId,area.areaId);assert.deepEqual(c.state(),{schema:1,experiences:[],candidates:[],agents:[]});assert.equal(read().areas[0].projects.length,1);
  });
  test('repeated connection is idempotent and preserves records',()=>{
    const before=fs.readFileSync(registry),c=new Controller(project),state=fs.readFileSync(c.safe('.sodam-agent/state.json'));connectWorkspace(project);connectWorkspace(nested);assert.deepEqual(fs.readFileSync(registry),before);assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),state);
  });
  test('exclusions, prefix siblings and missing markers cannot auto connect',()=>{
    assert.throws(()=>connectWorkspace(excluded));const sibling=make('work-other');assert.equal(connectWorkspace(sibling).mode,'missing');assert.ok(!fs.existsSync(path.join(sibling,'.sodam-agent')));const unmarked=make('work/unmarked',false);assert.throws(()=>connectWorkspace(unmarked));assert.ok(!fs.existsSync(path.join(unmarked,'.sodam-agent')));
  });
  test('nested repositories have separate identity',()=>{
    const repo=make('work/first/second',false);fs.mkdirSync(path.join(repo,'.git'));connectWorkspace(repo);assert.equal(new Controller(repo).root,repo);assert.notEqual(new Controller(repo).policy().areaBinding.projectId,new Controller(project).policy().areaBinding.projectId);
  });
  test('nested marker roots are stable before and after parent connection',()=>{
    const parent=make('work/marker-parent'),child=make('work/marker-parent/child');
    assert.equal(resolveWorkspace(child).root,child);connectWorkspace(parent);assert.equal(resolveWorkspace(child).root,child);
  });
  test('copied binding, broadened caps and linked paths are rejected',()=>{
    const copy=make('work/copied');fs.cpSync(path.join(project,'.sodam-agent'),path.join(copy,'.sodam-agent'),{recursive:true});assert.throws(()=>new Controller(copy).policy());
    const c=new Controller(project),file=c.safe('.sodam-agent/policy.json'),before=fs.readFileSync(file);const p=JSON.parse(before);fs.writeFileSync(file,JSON.stringify({...p,maxAgents:20}));assert.throws(()=>c.policy());fs.writeFileSync(file,before);
    const link=path.join(root,'linked');fs.symlinkSync(project,link,process.platform==='win32'?'junction':'dir');assert.throws(()=>resolveWorkspace(link));fs.unlinkSync(link);
  });
  test('live hook routing, dispatch, verified artifacts and finish share root',()=>{
    const b=new Bridge(nested),event={session_id:'technical-area-fixture',turn_id:'one',hook_event_name:'UserPromptSubmit'};
    const context=b.event(event,'runtime/cli.mjs').hookSpecificOutput.additionalContext,turnKey=context.match(/turnKey=([a-f0-9]{32})/)[1];
    assert.equal(mcp('manage_workflow',{workspace:nested,operation:'dispatch',request:{turnKey,kind:'docs',goal:'Technical fixture only',learnWhileWorking:false}}).exit_code,0);
    fs.writeFileSync(path.join(project,'proof.md'),'Technical fixture output.');
    b.event({...event,hook_event_name:'PostToolUse',tool_name:'exec_command',tool_use_id:'unit-tool',tool_response:{exit_code:0}},'runtime/cli.mjs');
    assert.equal(mcp('verify_artifacts',{workspace:nested,evidence:['proof.md']}).exit_code,0);
    assert.equal(mcp('manage_workflow',{workspace:nested,operation:'finish',request:{turnKey,outcome:'verified',cause:'none',evidence:['proof.md'],corrections:0,semanticReviewed:true}}).exit_code,0);
    assert.equal(new Controller(project).state().experiences.length,1);assert.ok(!fs.existsSync(path.join(nested,'.sodam-agent')));
  });
  test('aggregate mutation cap blocks writes, not read-only metadata',()=>{
    const data=read(),before=data.areas[0].mutations;data.areas[0].mutations=data.areas[0].maxMutations;rawWrite(data);const c=new Controller(project),state=fs.readFileSync(c.safe('.sodam-agent/state.json'));
    assert.throws(()=>c.transaction(()=>c.write('.sodam-agent/state.json',c.state())));assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),state);assert.equal(inspectArea(project).remainingMutations,0);assert.equal(inspectRuntime({workspace:project}).workspace.workEligible,false);const next=read();next.areas[0].mutations=before;rawWrite(next);
  });
  test('continuation beyond area caps rejects before policy or archive changes',()=>{
    const c=new Controller(project),before=fs.readFileSync(c.safe('.sodam-agent/policy.json'));
    assert.throws(()=>continueLearning(project,{authorize:true,expectedPolicySha256:createHash('sha256').update(before).digest('hex'),archive:'invalid-extension.json',maxExperiences:201}));
    assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/policy.json')),before);assert.ok(!fs.existsSync(path.join(project,'invalid-extension.json')));assert.equal(c.policy().maxExperiences,200);
  });
  test('replaced directory identity is rejected without auto migration',()=>{
    const before=fs.readFileSync(registry),data=read();data.areas[0].projects[0].rootIdentity='0'.repeat(64);rawWrite(data);assert.throws(()=>new Controller(project).policy());fs.writeFileSync(registry,before);
  });
  test('registry lock preserves writes and is never force-unlocked',()=>{
    const lock=path.join(path.dirname(registry),'lock');fs.writeFileSync(lock,'');const before=fs.readFileSync(registry);assert.throws(()=>new Controller(project).transaction(()=>{}));assert.ok(fs.existsSync(lock));assert.deepEqual(fs.readFileSync(registry),before);fs.unlinkSync(lock);
  });
  test('two actual hook processes cannot duplicate a project connection',()=>{
    const separate=make('concurrent',false),target=make('concurrent/project');authorizeArea(separate,{...grant,exclusions:[]});
    const entry=fileURLToPath(new URL('../plugins/autonomy-team/hooks/entry.mjs',import.meta.url));
    const runner=`import {spawn} from 'node:child_process'; const results=await Promise.all([1,2].map(()=>new Promise(resolve=>{const child=spawn(process.execPath,[process.argv[1]],{stdio:['pipe','pipe','pipe']});let out='',err='';child.stdout.on('data',chunk=>out+=chunk);child.stderr.on('data',chunk=>err+=chunk);child.on('exit',code=>resolve({code,out,err}));child.stdin.end(JSON.stringify({hook_event_name:'SessionStart',cwd:process.argv[2]}));})));process.stdout.write(JSON.stringify(results));`;
    const result=spawnSync(process.execPath,['--input-type=module','-e',runner,entry,target],{encoding:'utf8',timeout:10000});assert.equal(result.status,0,result.stderr);
    const attempts=JSON.parse(result.stdout);assert.ok(attempts.some(attempt=>attempt.code===0));for(const attempt of attempts)if(attempt.code!==0)assert.equal(attempt.err,'SoDam hook failed; automatic workflow is unverified.\n');
    assert.equal(read().areas.find(item=>item.root===separate).projects.length,1);assert.equal(new Controller(target).state().experiences.length,0);
  });
  test('existing individual grants remain unchanged and independent',()=>{
    const standalone=make('work/legacy'),c=new Controller(standalone);c.initialize({authorize:true});const policy=fs.readFileSync(c.safe('.sodam-agent/policy.json'));connectWorkspace(standalone);assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/policy.json')),policy);assert.equal(c.policy().areaBinding,undefined);
  });
  test('project count cap blocks new connections without deleting old data',()=>{
    const data=read();data.areas[0].maxProjects=data.areas[0].projects.length;rawWrite(data);const extra=make('work/extra');assert.throws(()=>connectWorkspace(extra));assert.ok(!fs.existsSync(path.join(extra,'.sodam-agent')));const next=read();next.areas[0].maxProjects=4;rawWrite(next);
  });
  test('partial stores are reported, never overwritten or silently repaired',()=>{
    const partial=make('work/partial');fs.mkdirSync(path.join(partial,'.sodam-agent'));fs.writeFileSync(path.join(partial,'.sodam-agent','state.json'),'{}');assert.throws(()=>connectWorkspace(partial));assert.equal(fs.readFileSync(path.join(partial,'.sodam-agent','state.json'),'utf8'),'{}');
  });
  test('trusted host connects unmarked workspace; CLI and MCP cannot guess it',()=>{
    const unmarked=make('work/host-project',false);assert.throws(()=>connectWorkspace(unmarked));
    const entry=fileURLToPath(new URL('../plugins/autonomy-team/hooks/entry.mjs',import.meta.url));
    const result=spawnSync(process.execPath,[entry],{encoding:'utf8',timeout:5000,input:JSON.stringify({hook_event_name:'SessionStart',cwd:unmarked})});
    assert.equal(result.status,0,result.stderr);assert.equal(new Controller(unmarked).policy().areaBinding.areaId,area.areaId);
    assert.equal(read().areas[0].projects.length,4);
  });
  test('area inspection and revocation CLI work on unmarked area root',()=>{
    const cli=fileURLToPath(new URL('../plugins/autonomy-team/runtime/cli.mjs',import.meta.url));
    const inspection=spawnSync(process.execPath,[cli,'area-inspect',root],{encoding:'utf8',timeout:5000});assert.equal(inspection.status,0,inspection.stderr);assert.equal(JSON.parse(inspection.stdout).result.projectRootUnresolved,true);
    fs.writeFileSync(path.join(root,'revoke-request.json'),JSON.stringify({authorize:true,areaId:area.areaId}));
    const result=spawnSync(process.execPath,[cli,'area-revoke',root,'revoke-request.json'],{encoding:'utf8',timeout:5000});assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).result.revoked,true);
    const data=read();data.areas[0].revoked=false;rawWrite(data);
  });
  test('expiry and invalid registry never enable or renew learning',()=>{
    const before=fs.readFileSync(registry),data=read();data.areas[0].expiresAt='2000-01-01T00:00:00Z';rawWrite(data);assert.throws(()=>new Controller(project).policy());assert.throws(()=>connectWorkspace(nested));fs.writeFileSync(registry,'{');assert.equal(inspectRuntime({workspace:nested}).workspace.authorization,'unverified');assert.equal(fs.readFileSync(registry,'utf8'),'{');fs.writeFileSync(registry,before);
  });
  test('revocation immediately blocks derived work and preserves independent grants',()=>{
    const c=new Controller(project),before=fs.readFileSync(c.safe('.sodam-agent/state.json'));revokeArea(root,{authorize:true,areaId:area.areaId});assert.throws(()=>c.policy());assert.throws(()=>c.transaction(()=>{}));assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),before);assert.equal(new Controller(path.join(root,'legacy')).policy().schema,1);
  });
  console.log(JSON.stringify({areaGroups:count,actualWorkEffectVerified:false,realUserAreaAuthorized:false}));
}
