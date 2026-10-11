// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Explicit user-area grants. Procedure sharing is separately opt-in; no renewal.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const key = value => process.platform === 'win32' ? value.toLowerCase() : value;
const inside = (root, value) => key(root) === key(value) || key(value).startsWith(key(root + path.sep));
const registryDirectory = () => path.join(os.homedir(), '.sodam-agent-areas');
const registryFile = () => path.join(registryDirectory(), 'registry.json');
const sharingFile = () => path.join(registryDirectory(), 'procedure-sharing.json');
const blocked = new Set(['.git', '.codex', '.codex_runtime', '.agents', 'node_modules', '.sandbox-secrets']);
const identity = root => {const stat=fs.statSync(root,{bigint:true});return hash(`${stat.dev}:${stat.ino}`);};
const object = (value, fields) => {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value));
  assert.ok(Object.keys(value).every(field => fields.includes(field)), 'unsupported area field');
};
const integer = (value, min, max) => { assert.ok(Number.isInteger(value) && value >= min && value <= max); return value; };
function checked(value, directory = true) {
  assert.ok(typeof value === 'string' && value.length <= 1000 && path.isAbsolute(value));
  const resolved = path.resolve(value);
  let current = path.parse(resolved).root;
  for (const part of resolved.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    assert.ok(!stat.isSymbolicLink(), 'linked path rejected');
  }
  const stat = fs.statSync(resolved);
  assert.ok(directory ? stat.isDirectory() : stat.isFile() && stat.nlink === 1);
  return fs.realpathSync(resolved);
}
function read(file) {
  checked(file, false); assert.ok(fs.statSync(file).size <= 4_000_000);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function write(file, value, exclusive = false) {
  checked(path.dirname(file));
  if (fs.existsSync(file)) checked(file, false);
  const encoded = JSON.stringify(value, null, 2) + '\n';
  assert.ok(Buffer.byteLength(encoded) <= 4_000_000);
  if (exclusive) { fs.writeFileSync(file, encoded, {flag:'wx'}); return; }
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  try { fs.writeFileSync(temporary, encoded, {flag:'wx'}); fs.renameSync(temporary, file); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
function validate(registry) {
  object(registry, ['schema', 'areas']); assert.equal(registry.schema, 1);
  assert.ok(Array.isArray(registry.areas) && registry.areas.length <= 64);
  const ids = new Set();
  for (const area of registry.areas) {
    object(area, ['id','root','rootIdentity','expiresAt','revoked','exclusions','maxProjects','maxMutations','mutations','maxAgents','maxExperiences','maxRetries','autoPilot','projects','shareProcedures']);
    // Read intermediate-version fields without treating them as separate sharing consent.
    assert.ok(area.shareProcedures === undefined || typeof area.shareProcedures === 'boolean');
    assert.match(area.id, /^[a-f0-9]{32}$/); assert.ok(!ids.has(area.id)); ids.add(area.id);
    assert.ok(typeof area.root === 'string' && path.isAbsolute(area.root));
    assert.match(area.rootIdentity,/^[a-f0-9]{64}$/);
    assert.ok(Number.isFinite(Date.parse(area.expiresAt)) && typeof area.revoked === 'boolean');
    assert.ok(Array.isArray(area.exclusions) && area.exclusions.length <= 100);
    for (const exclusion of area.exclusions) assert.ok(typeof exclusion === 'string' && path.isAbsolute(exclusion) && inside(area.root, exclusion));
    integer(area.maxProjects,1,100); integer(area.maxMutations,1,100000); integer(area.mutations,0,100000);
    integer(area.maxAgents,1,20); integer(area.maxExperiences,1,1000); integer(area.maxRetries,0,2);
    assert.equal(typeof area.autoPilot,'boolean'); assert.ok(Array.isArray(area.projects) && area.projects.length <= area.maxProjects);
    const roots = new Set();
    for (const project of area.projects) {
      object(project,['id','root','rootIdentity','status']); assert.match(project.id,/^[a-f0-9]{32}$/);assert.match(project.rootIdentity,/^[a-f0-9]{64}$/);
      assert.ok(typeof project.root === 'string' && inside(area.root,project.root) && !roots.has(key(project.root))); roots.add(key(project.root));
      assert.ok(['pending','connected'].includes(project.status));
    }
  }
  return registry;
}
function registry() {
  try { return validate(read(registryFile())); }
  catch (error) { if (error.code === 'ENOENT') return {schema:1,areas:[]}; throw error; }
}
// Keep sharing consent out of the legacy registry: old processes reject new fields.
function sharing() {
  let data;
  try { data = read(sharingFile()); }
  catch (error) { if (error.code === 'ENOENT') return {schema:1, areas:[]}; throw error; }
  object(data, ['schema', 'areas']); assert.equal(data.schema, 1);
  assert.ok(Array.isArray(data.areas) && data.areas.length <= 64);
  const ids = new Set();
  for (const item of data.areas) {
    object(item, ['areaId', 'rootIdentity', 'enabled']);
    assert.match(item.areaId, /^[a-f0-9]{32}$/); assert.ok(!ids.has(item.areaId)); ids.add(item.areaId);
    assert.match(item.rootIdentity, /^[a-f0-9]{64}$/); assert.equal(typeof item.enabled, 'boolean');
  }
  return data;
}
const sharingEnabled = (area, consent) => consent.areas.some(item =>
  item.areaId === area.id && item.rootIdentity === area.rootIdentity && item.enabled);

function locked(action) {
  checked(os.homedir());
  fs.mkdirSync(registryDirectory(),{recursive:true}); checked(registryDirectory());
  const lock = path.join(registryDirectory(),'lock'); const fd = fs.openSync(lock,'wx');
  try { return action(registry()); }
  finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
function eligible(area, workspace) {
  assert.ok(!area.revoked && Date.parse(area.expiresAt)>Date.now(),'area revoked or expired');
  assert.equal(key(checked(area.root)),key(area.root),'area moved');
  assert.equal(identity(area.root),area.rootIdentity,'area replaced');
  assert.ok(inside(area.root,workspace),'outside area');
  assert.ok(!area.exclusions.some(exclusion=>inside(exclusion,workspace)),'excluded workspace');
  const relative = path.relative(area.root,workspace);
  assert.ok(!workspace.split(path.sep).some(part=>blocked.has(part.toLowerCase())),'protected workspace');
  assert.ok(!relative.split(path.sep).some(part=>blocked.has(part.toLowerCase())),'protected workspace');
}
function projectRoot(workspace, area, hostWorkspace = false) {
  let current=workspace; let candidate; let stored;
  while (inside(area.root,current)) {
    eligible(area,current);
    const policy=path.join(current,'.sodam-agent','policy.json');
    if (fs.existsSync(policy)) { checked(policy,false); stored ??= current; }
    const git=path.join(current,'.git');
    if (fs.existsSync(git)) { assert.ok(!fs.lstatSync(git).isSymbolicLink()); return current; }
    if (!candidate && (key(current)!==key(area.root) || key(workspace)===key(area.root)) && ['AGENTS.md','package.json'].some(name=>{
      const file=path.join(current,name); if(!fs.existsSync(file))return false; checked(file,false); return true;
    })) candidate=current;
    if(key(current)===key(area.root))break;
    current=path.dirname(current);
  }
  candidate ??= stored;
  if(!candidate && hostWorkspace)return workspace;
  assert.ok(candidate,'project root marker required'); return candidate;
}
export function authorizeArea(root,input) {
  object(input,['authorize','days','exclusions','maxProjects','maxMutations','maxAgents','maxExperiences','maxRetries','autoPilot']);
  assert.equal(input.authorize,true,'explicit area approval required'); root=checked(root);
  assert.ok(key(root)!==key(path.parse(root).root) && !inside(root,os.homedir()),'overbroad area rejected');
  assert.ok(!inside(root,registryDirectory()) && !inside(registryDirectory(),root));
  assert.ok(!root.split(path.sep).some(part=>blocked.has(part.toLowerCase())),'protected area');
  const exclusions=(input.exclusions??[]).map(value=>{const result=checked(value);assert.ok(inside(root,result));return result;});
  assert.ok(exclusions.length<=100);
  const area={id:crypto.randomBytes(16).toString('hex'),root,rootIdentity:identity(root),expiresAt:new Date(Date.now()+integer(input.days,1,30)*86400000).toISOString(),revoked:false,exclusions,
    maxProjects:integer(input.maxProjects,1,100),maxMutations:integer(input.maxMutations,1,100000),mutations:0,
    maxAgents:integer(input.maxAgents,1,20),maxExperiences:integer(input.maxExperiences,1,1000),maxRetries:integer(input.maxRetries,0,2),autoPilot:input.autoPilot,projects:[]};
  assert.equal(typeof area.autoPilot,'boolean');
  return locked(data=>{
    assert.ok(data.areas.length<64);
    assert.ok(!data.areas.some(prior=>!prior.revoked && (inside(prior.root,root)||inside(root,prior.root))),'overlapping area rejected');
    data.areas.push(area); validate(data); write(registryFile(),data);
    return {authorized:true,areaId:area.id,root,expiresAt:area.expiresAt,automaticRenewal:false};
  });
}
export function revokeArea(root,input) {
  object(input,['authorize','areaId']); assert.equal(input.authorize,true); root=checked(root);
  return locked(data=>{
    const area=data.areas.find(area=>area.id===input.areaId && key(area.root)===key(root)); assert.ok(area);
    area.revoked=true; write(registryFile(),data); return {revoked:true,areaId:area.id,recordsPreserved:true};
  });
}
export function resolveWorkspace(value, hostWorkspace = false) {
  assert.equal(typeof hostWorkspace,'boolean');
  const workspace=checked(value);
  // A direct legacy grant remains independent; never rewrite or widen it.
  const direct=path.join(workspace,'.sodam-agent','policy.json');
  if(fs.existsSync(direct)) {checked(direct,false); return {root:workspace,mode:'project'};}
  const matches=registry().areas.filter(area=>inside(area.root,workspace));
  const active=matches.filter(area=>!area.revoked);
  if(!active.length) return {root:workspace,mode:matches.length?'area-inactive':'missing'};
  assert.equal(active.length,1,'ambiguous area'); const area=active[0]; eligible(area,workspace);
  return {root:projectRoot(workspace,area,hostWorkspace),mode:'area',areaId:area.id};
}
function binding(root,data,override) {
  const policy=override??read(path.join(root,'.sodam-agent','policy.json'));
  if(!policy.areaBinding)return null;
  data ??= registry();
  object(policy.areaBinding,['areaId','projectId']);
  const area=data.areas.find(area=>area.id===policy.areaBinding.areaId); assert.ok(area,'area missing'); eligible(area,root);
  const project=area.projects.find(project=>project.id===policy.areaBinding.projectId && key(project.root)===key(root));
  assert.ok(project?.status==='connected','connection incomplete');
  assert.equal(identity(root),project.rootIdentity,'project replaced');
  assert.equal(key(policy.workspace),key(root));
  assert.ok(Date.parse(policy.expiresAt)<=Date.parse(area.expiresAt));
  for(const field of ['maxAgents','maxExperiences','maxRetries'])assert.ok(policy[field]<=area[field]);
  assert.ok(!policy.autoPilot || area.autoPilot); return area;
}
export function validateAreaBinding(root) { return binding(root); }
export function validateAreaPolicy(root,policy) { return binding(root,undefined,policy); }
export function readAreaRequest(root,relative) {
  root=checked(root);
  assert.ok(typeof relative==='string' && relative.length<=1000 && !path.isAbsolute(relative));
  assert.ok(!relative.includes('\\') && !relative.includes(':') && relative.split('/').every(part=>part && part!=='.' && part!=='..'));
  return read(path.join(root,...relative.split('/')));
}
export function withAreaMutation(root,action) {
  const policy=path.join(root,'.sodam-agent','policy.json');
  if(!fs.existsSync(policy) || !read(policy).areaBinding)return action();
  return locked(data=>{
    const area=binding(root,data); assert.ok(area.mutations<area.maxMutations,'area mutation budget reached');
    area.mutations++; write(registryFile(),data);
    // Reserve before mutation; failures also consume a slot. Never refund/retry automatically.
    return action();
  });
}
export function connectWorkspace(value, hostWorkspace = false) {
  const resolved=resolveWorkspace(value,hostWorkspace);
  if(resolved.mode!=='area')return resolved;
  return locked(data=>{
    const area=data.areas.find(area=>area.id===resolved.areaId); eligible(area,resolved.root);
    const directory=path.join(resolved.root,'.sodam-agent'),policyFile=path.join(directory,'policy.json');
    if(fs.existsSync(policyFile)) { binding(resolved.root,data); return {...resolved,connected:true}; }
    assert.ok(!fs.existsSync(directory),'existing incomplete store requires explicit recovery');
    assert.ok(!area.projects.some(project=>key(project.root)===key(resolved.root)),'pending connection requires explicit recovery');
    assert.ok(area.projects.length<area.maxProjects && area.mutations<area.maxMutations,'area budget reached');
    const project={id:hash(key(resolved.root)).slice(0,32),root:resolved.root,rootIdentity:identity(resolved.root),status:'pending'};
    area.projects.push(project); area.mutations++; write(registryFile(),data);
    fs.mkdirSync(directory); checked(directory);
    const policy={schema:1,workspace:resolved.root,expiresAt:area.expiresAt,maxAgents:area.maxAgents,maxExperiences:area.maxExperiences,maxRetries:area.maxRetries,autoPilot:area.autoPilot,areaBinding:{areaId:area.id,projectId:project.id}};
    write(path.join(directory,'state.json'),{schema:1,experiences:[],candidates:[],agents:[]},true);
    write(policyFile,policy,true); project.status='connected'; write(registryFile(),data);
    return {...resolved,connected:true};
  });
}
export function inspectArea(value) {
  const workspace=checked(value);
  const direct=path.join(workspace,'.sodam-agent','policy.json');
  if(fs.existsSync(direct) && !read(direct).areaBinding) return {root:workspace,mode:'project',readOnly:true};
  const exact=registry().areas.find(area=>key(area.root)===key(workspace));
  if(exact && !fs.existsSync(path.join(workspace,'.sodam-agent','policy.json'))) {
    return {root:workspace,mode:'area-root',readOnly:true,areaId:exact.id,revoked:exact.revoked,expired:Date.parse(exact.expiresAt)<=Date.now(),expiresAt:exact.expiresAt,remainingProjects:exact.maxProjects-exact.projects.length,remainingMutations:exact.maxMutations-exact.mutations,connectionRequired:false,projectRootUnresolved:true};
  }
  const resolved=resolveWorkspace(value),policyFile=path.join(resolved.root,'.sodam-agent','policy.json');
  const area=fs.existsSync(policyFile)?binding(resolved.root):registry().areas.find(area=>area.id===resolved.areaId);
  return {...resolved,readOnly:true,...(area?{areaId:area.id,expiresAt:area.expiresAt,remainingProjects:area.maxProjects-area.projects.length,remainingMutations:area.maxMutations-area.mutations,connectionRequired:!fs.existsSync(policyFile)}:{})};
}

// Management operation only. Hooks and workflow calls never grant sharing.
export function setProcedureSharing(value, input) {
  const root = checked(value);
  object(input, ['authorize', 'areaId', 'enabled']);
  assert.equal(input.authorize, true, 'explicit sharing decision required');
  assert.match(input.areaId, /^[a-f0-9]{32}$/);
  assert.equal(typeof input.enabled, 'boolean');
  return locked(data => {
    const area = data.areas.find(a => a.id === input.areaId && key(a.root) === key(root));
    assert.ok(area, 'area not found');
    // Disabling remains possible after expiry/revocation; enabling does not renew.
    if (input.enabled) eligible(area, root);
    const consent = sharing();
    let item = consent.areas.find(item => item.areaId === area.id);
    if (item) assert.equal(item.rootIdentity, area.rootIdentity, 'sharing identity mismatch');
    else { assert.ok(consent.areas.length < 64, 'sharing capacity reached');
      item = {areaId:area.id, rootIdentity:area.rootIdentity, enabled:false}; consent.areas.push(item); }
    item.enabled = input.enabled;
    write(sharingFile(), consent);
    return {updated:true, enabled:input.enabled, permissionScopeUnchanged:true, legacyRegistryUnchanged:true};
  });
}

// Read-only discovery; connected projects in BOTH opt-in areas only.
export function procedurePeers(value) {
  const root = checked(value);
  const data = registry();
  const current = binding(root, data);
  const consent = sharing();
  if (!current || !sharingEnabled(current, consent)) return {status:'not-authorized', roots:[]};
  const roots = [];
  let skipped = 0;
  let truncated = false;
  for (const area of data.areas) {
    if (!sharingEnabled(area, consent) || area.revoked || Date.parse(area.expiresAt) <= Date.now()) continue;
    for (const project of area.projects) {
      if (project.status !== 'connected' || key(project.root) === key(root)) continue;
      try {
        eligible(area, project.root);
        assert.equal(identity(checked(project.root)), project.rootIdentity);
        const bound = binding(project.root, data);
        assert.ok(bound && bound.id === area.id);
        if (roots.length === 16) {truncated = true; continue;}
        roots.push(project.root);
      } catch {skipped++;}
    }
  }
  return {status:'enabled', roots, skipped, truncated};
}
