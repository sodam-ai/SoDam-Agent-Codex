// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Explicit session routing only. No source authorization, copied policy or renewal.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Controller} from './engine.mjs';
const file = '.sodam-workspace-binding.json';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const identity = root => {const s=fs.statSync(root,{bigint:true});return hash(`${s.dev}:${s.ino}`);};
const sessionHash = value => {assert.ok(typeof value==='string' && value.length>0 && value.length<=200);return hash(value);};
const policyHash = controller => hash(fs.readFileSync(controller.safe('.sodam-agent/policy.json',true)));
function read(source) {
  const target=source.safe(file,true),s=fs.lstatSync(target);
  assert.ok(s.isFile() && !s.isSymbolicLink() && s.nlink===1 && s.size<=8192);
  const value=source.read(file,8192);
  assert.deepEqual(Object.keys(value).sort(),['expiresAt','schema','sessionHash','source','sourceIdentity','target','targetIdentity','targetPolicyHash']);
  assert.equal(value.schema,1);
  for(const field of ['sessionHash','sourceIdentity','targetIdentity','targetPolicyHash'])assert.match(value[field],/^[a-f0-9]{64}$/);
  assert.ok(typeof value.target==='string' && value.target.length<=1000);
  assert.ok(typeof value.source==='string' && value.source.length<=1000);
  assert.ok(value.expiresAt===null || typeof value.expiresAt==='string' && Number.isFinite(Date.parse(value.expiresAt)));
  return value;
}
function validate(source,value) {
  assert.equal(source.root,value.source,'source root changed');
  assert.equal(identity(source.root),value.sourceIdentity,'source directory changed');
  if(value.expiresAt!==null)assert.ok(Date.parse(value.expiresAt)>Date.now(),'binding expired');
  const target=new Controller(value.target),policy=target.policy();
  assert.equal(target.root,value.target,'target root changed');
  assert.notEqual(target.root,source.root,'distinct target required');
  assert.equal(identity(target.root),value.targetIdentity,'target directory changed');
  assert.equal(policyHash(target),value.targetPolicyHash,'target authorization changed');
  assert.equal(policy.expiresAt,value.expiresAt,'binding lifetime differs');
  return target;
}
export function bindWorkspace(sourceWorkspace,input) {
  assert.ok(input && typeof input==='object' && !Array.isArray(input));
  assert.deepEqual(Object.keys(input).sort(),['authorize','sessionId','target']);
  assert.equal(input.authorize,true,'explicit session binding approval required');
  const source=new Controller(sourceWorkspace),target=new Controller(input.target),policy=target.policy();
  assert.notEqual(source.root,target.root);
  const value={schema:1,source:source.root,sessionHash:sessionHash(input.sessionId),sourceIdentity:identity(source.root),target:target.root,targetIdentity:identity(target.root),targetPolicyHash:policyHash(target),expiresAt:policy.expiresAt};
  validate(source,value);
  const bindingFile=source.safe(file);
  if(fs.existsSync(bindingFile)) {
    const prior=read(source);assert.deepEqual(prior,value,'existing binding must not be replaced');validate(source,prior);
    return {bound:true,created:false,target:target.root,expiresAt:policy.expiresAt};
  }
  fs.writeFileSync(bindingFile,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  return {bound:true,created:true,target:target.root,expiresAt:policy.expiresAt};
}
export function boundWorkspace(event) {
  assert.ok(event && typeof event==='object' && !Array.isArray(event));
  assert.ok(typeof event.cwd==='string' && path.isAbsolute(event.cwd));
  // Let the existing host-area connector resolve unmarked roots when no binding exists.
  if(!fs.existsSync(path.join(event.cwd,file)))return undefined;
  const source=new Controller(event.cwd);
  const value=read(source);
  if(value.sessionHash!==sessionHash(event.session_id))return undefined;
  return {root:validate(source,value).root,mode:'session-binding'};
}
