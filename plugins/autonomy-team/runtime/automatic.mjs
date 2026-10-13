// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Persistent opt-in for host-provided workspaces. No expiry renewal or policy copying.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {resolveWorkspace} from './areas.mjs';
const directory = () => path.join(os.homedir(), '.sodam-agent-automatic');
const file = () => path.join(directory(), 'policy.json');
const blocked = /^(?:\.git|\.codex|\.codex_runtime|\.agents|node_modules|windows|program files(?: \(x86\))?)$/i;
const same = value => process.platform === 'win32' ? value.toLowerCase() : value;
function checked(value, isFile = false) {
  assert.ok(typeof value === 'string' && path.isAbsolute(value));
  const root = path.resolve(value); let cursor = path.parse(root).root;
  for (const part of root.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part); assert.ok(!fs.lstatSync(cursor).isSymbolicLink(), 'linked automatic policy path');
  }
  const stat = fs.statSync(root);
  assert.ok(isFile ? stat.isFile() && stat.nlink === 1 && stat.size <= 8192 : stat.isDirectory());
  return fs.realpathSync(root);
}
function validate(value) {
  assert.deepEqual(Object.keys(value).sort(), ['autoPilot','enabled','id','maxAgents','maxExperiences','maxRetries','schema'].sort());
  assert.equal(value.schema, 1); assert.match(value.id, /^[a-f0-9]{32}$/);
  for (const key of ['enabled','autoPilot']) assert.equal(typeof value[key], 'boolean');
  for (const [key,min,max] of [['maxAgents',1,20],['maxExperiences',1,1000],['maxRetries',0,2]])
    assert.ok(Number.isInteger(value[key]) && value[key] >= min && value[key] <= max);
  return value;
}
export function automaticPolicy() {
  try { return validate(JSON.parse(fs.readFileSync(checked(file(), true), 'utf8'))); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
export function assertAutomaticRunning() {
  const policy=automaticPolicy();
  assert.ok(!policy || policy.enabled, 'automatic operation disabled');
}
export function configureAutomatic(input) {
  assert.ok(input && !Array.isArray(input) && typeof input === 'object');
  assert.ok(Object.keys(input).every(key => ['authorize','enabled','autoPilot','maxAgents','maxExperiences','maxRetries'].includes(key)));
  assert.equal(input.authorize, true, 'explicit persistent automatic operation consent required');
  assert.equal(typeof input.enabled, 'boolean');
  checked(os.homedir()); fs.mkdirSync(directory(), {recursive:true}); checked(directory());
  const lock = path.join(directory(), 'lock'); const fd = fs.openSync(lock, 'wx');
  try {
    const previous = automaticPolicy();
    const policy = validate({schema:1,id:previous?.id ?? crypto.randomBytes(16).toString('hex'),enabled:input.enabled,
      autoPilot:input.autoPilot ?? previous?.autoPilot ?? true,maxAgents:input.maxAgents ?? previous?.maxAgents ?? 8,
      maxExperiences:input.maxExperiences ?? previous?.maxExperiences ?? 200,maxRetries:input.maxRetries ?? previous?.maxRetries ?? 1});
    if (fs.existsSync(file())) checked(file(), true);
    const temporary = file() + '.' + crypto.randomUUID() + '.tmp';
    try { fs.writeFileSync(temporary, JSON.stringify(policy,null,2)+'\n', {flag:'wx'}); fs.renameSync(temporary,file()); }
    finally { if(fs.existsSync(temporary))fs.unlinkSync(temporary); }
    return {configured:true,enabled:policy.enabled,expiresAt:null,autoPilot:policy.autoPilot,
      scope:'new host workspaces; existing project and area policies take precedence',sharingEnabled:false};
  } finally {fs.closeSync(fd);fs.unlinkSync(lock);}
}
export function validateAutomaticBinding(root, policy) {
  assert.equal(policy.expiresAt,null); assert.ok(!policy.areaBinding, 'mixed authorization');
  assert.deepEqual(Object.keys(policy.automaticBinding).sort(),['id','rootIdentity']);
  const current = automaticPolicy(); assert.ok(current?.enabled, 'automatic operation disabled');
  assert.equal(policy.automaticBinding.id,current.id, 'automatic policy replaced');
  const stat = fs.statSync(checked(root),{bigint:true});
  assert.equal(policy.automaticBinding.rootIdentity,crypto.createHash('sha256').update(`${stat.dev}:${stat.ino}`).digest('hex'),'workspace replaced');
  for(const key of ['maxAgents','maxExperiences','maxRetries'])assert.ok(policy[key]<=current[key]);
  assert.ok(!policy.autoPilot || current.autoPilot);
}
export function connectAutomatic(controller) {
  const current = automaticPolicy();
  if(!current?.enabled || fs.existsSync(controller.safe('.sodam-agent/policy.json')))return {connected:false};
  if(resolveWorkspace(controller.root).mode!=='missing')return {connected:false};
  const root=checked(controller.root);
  assert.ok(root!==path.parse(root).root && same(root)!==same(os.homedir()), 'system or home root rejected');
  assert.ok(!root.split(path.sep).some(part=>blocked.test(part)), 'excluded system directory');
  // Do not interpret an interrupted/unknown store as permission to overwrite it.
  if(fs.existsSync(controller.store))throw new Error('existing store requires review');
  return controller.transaction(()=>{
    assert.ok(!fs.existsSync(controller.safe('.sodam-agent/policy.json')));
    const stat=fs.statSync(root,{bigint:true});
    const policy={schema:1,workspace:root,expiresAt:null,maxAgents:current.maxAgents,maxExperiences:current.maxExperiences,
      maxRetries:current.maxRetries,autoPilot:current.autoPilot,automaticBinding:{id:current.id,
        rootIdentity:crypto.createHash('sha256').update(`${stat.dev}:${stat.ino}`).digest('hex')}};
    validateAutomaticBinding(root,policy);
    controller.write('.sodam-agent/state.json',{schema:1,experiences:[],candidates:[],agents:[]},true);
    controller.write('.sodam-agent/policy.json',policy,true);
    return {connected:true,expiresAt:null};
  });
}

// Explicit migration preserves all learning records and keeps a recoverable policy.
export function adoptAutomatic(controller, input) {
  assert.deepEqual(input, {authorize:true});
  const current = automaticPolicy();
  assert.ok(current?.enabled, 'automatic operation disabled');
  return controller.localTransaction(() => {
    const previous = controller.read('.sodam-agent/policy.json',8192);
    if(previous.automaticBinding) {
      validateAutomaticBinding(controller.root,previous);
      assert.ok(fs.existsSync(controller.safe('.sodam-agent/previous-period-policy.json')));
      return {adopted:true,duplicate:true,expiresAt:null,recordsPreserved:true};
    }
    assert.ok(!previous.areaBinding && !previous.automaticBinding, 'independent project policy required');
    assert.equal(previous.workspace,controller.root);
    assert.equal(previous.schema,1);
    assert.ok(Number.isFinite(Date.parse(previous.expiresAt)));
    assert.deepEqual(Object.keys(previous).sort(), ['schema','workspace','expiresAt','maxAgents','maxExperiences','maxRetries','autoPilot'].sort());
    for(const key of ['maxAgents','maxExperiences','maxRetries'])
      assert.ok(Number.isInteger(previous[key]) && previous[key]>= (key==='maxRetries'?0:1) && previous[key]<=current[key]);
    assert.equal(typeof previous.autoPilot,'boolean');
    const stat=fs.statSync(checked(controller.root),{bigint:true});
    const policy={...previous,expiresAt:null,autoPilot:previous.autoPilot && current.autoPilot,
      automaticBinding:{id:current.id,rootIdentity:crypto.createHash('sha256').update(`${stat.dev}:${stat.ino}`).digest('hex')}};
    validateAutomaticBinding(controller.root,policy);
    const backup='.sodam-agent/previous-period-policy.json';
    if(fs.existsSync(controller.safe(backup)))assert.deepEqual(controller.read(backup,8192),previous,'backup differs');
    else controller.write(backup,previous,true);
    controller.write('.sodam-agent/policy.json',policy);
    return {adopted:true,expiresAt:null,autoPilot:policy.autoPilot,recordsPreserved:true};
  });
}
export function restoreAutomatic(controller,input) {
  assert.deepEqual(input,{authorize:true});
  return controller.localTransaction(()=>{
    const previous=controller.read('.sodam-agent/previous-period-policy.json',8192);
    const present=controller.read('.sodam-agent/policy.json',8192);
    assert.deepEqual(Object.keys(previous).sort(),['autoPilot','expiresAt','maxAgents','maxExperiences','maxRetries','schema','workspace']);
    assert.equal(previous.schema,1);assert.equal(typeof previous.autoPilot,'boolean');
    for(const [key,min,max] of [['maxAgents',1,20],['maxExperiences',1,1000],['maxRetries',0,2]])
      assert.ok(Number.isInteger(previous[key]) && previous[key]>=min && previous[key]<=max);
    for(const relative of ['.sodam-agent/previous-period-policy.json','.sodam-agent/policy.json'])
      assert.equal(fs.statSync(controller.safe(relative,true)).nlink,1,'linked policy file');
    assert.equal(previous.workspace,controller.root);assert.ok(!previous.areaBinding && !previous.automaticBinding);
    assert.ok(Number.isFinite(Date.parse(previous.expiresAt)));
    if(!present.automaticBinding){assert.deepEqual(present,previous);return {restored:true,duplicate:true,recordsPreserved:true};}
    assert.deepEqual({...present,expiresAt:previous.expiresAt,autoPilot:previous.autoPilot,automaticBinding:undefined}, {...previous,automaticBinding:undefined});
    controller.write('.sodam-agent/policy.json',previous);
    return {restored:true,expiresAt:previous.expiresAt,recordsPreserved:true,authorizationRenewed:false};
  });
}
