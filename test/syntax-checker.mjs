// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Controller } from '../plugins/autonomy-team/runtime/engine.mjs';
import { checkNodeSyntax } from '../plugins/autonomy-team/runtime/syntax-checker.mjs';
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-syntax-'));
const c = new Controller(base); c.initialize({authorize:true});
const input = {workspace:base,evidence:['valid.mjs']};
const write = (name,value) => fs.writeFileSync(path.join(base,name),value);
let count=0;
const test=(name,fn)=>{fn();count++;console.log('PASS: '+name);};
try {
 write('valid.mjs','export const value = 1;'); write('valid.cjs','module.exports = 1;');
 const state=fs.readFileSync(c.safe('.sodam-agent/state.json'));
 test('both module types return hashes without changing state',()=>{
   const r=checkNodeSyntax({...input,evidence:['valid.mjs','valid.cjs']});assert.equal(r.exit_code,0);
   for(const a of r.artifacts){assert.equal(a.exit_code,0);assert.equal(a.status,'passed');assert.match(a.sha256,/^[a-f0-9]{64}$/);}
   assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),state);
 });
 test('syntax failure hides source and parser output',()=>{
   write('invalid.mjs','export const = "private-diagnostic-marker";');
   const r=checkNodeSyntax({...input,evidence:['invalid.mjs']});assert.equal(r.exit_code,1);assert.equal(r.artifacts[0].exit_code,1);
   assert.equal(r.artifacts[0].diagnostic,'syntax-rejected');assert.ok(!JSON.stringify(r).includes('private-diagnostic-marker'));
 });
 test('no source evaluation or inherited preload options',()=>{
   write('side-effect.mjs','import fs from "node:fs"; fs.writeFileSync("should-not-exist.txt", "executed");');
   const old=process.env.NODE_OPTIONS;process.env.NODE_OPTIONS='--require=missing-preload-file';
   try{assert.equal(checkNodeSyntax({...input,evidence:['side-effect.mjs']}).exit_code,0);}finally{if(old===undefined)delete process.env.NODE_OPTIONS;else process.env.NODE_OPTIONS=old;}
   assert.equal(fs.existsSync(path.join(base,'should-not-exist.txt')),false);
 });
 test('fixed schema and path guards',()=>{
   for(const bad of [null,[],{...input,command:'arbitrary'},{...input,evidence:[]},{...input,evidence:Array(5).fill('valid.mjs')},{...input,evidence:['valid.mjs','VALID.mjs']}, {...input,evidence:['valid.js']},{...input,evidence:['../valid.mjs']},{...input,evidence:['.sodam-agent/state.json']},{...input,evidence:['secret.mjs']},{...input,evidence:['valid.mjs;command']}])assert.throws(()=>checkNodeSyntax(bad));
 });
 test('byte boundaries, empty, nul and invalid utf8',()=>{
   for(const value of ['', ' '.repeat(262145),Buffer.from([255]),'const x=1;'+String.fromCharCode(0)]){write('bounded.mjs',value);assert.throws(()=>checkNodeSyntax({...input,evidence:['bounded.mjs']}));}
   write('bounded.mjs','//'+ 'a'.repeat(262142));assert.equal(checkNodeSyntax({...input,evidence:['bounded.mjs']}).exit_code,0);
 });
 test('hard links and linked directories',()=>{
   fs.linkSync(path.join(base,'valid.mjs'),path.join(base,'hard.mjs'));assert.throws(()=>checkNodeSyntax({...input,evidence:['hard.mjs']}));fs.unlinkSync(path.join(base,'hard.mjs'));
   fs.symlinkSync(base,path.join(base,'alias'),process.platform==='win32'?'junction':'dir');assert.throws(()=>checkNodeSyntax({...input,evidence:['alias/valid.mjs']}));fs.unlinkSync(path.join(base,'alias'));
 });
 test('authorization absence and expiry',()=>{
   const empty=path.join(base,'empty');fs.mkdirSync(empty);assert.throws(()=>checkNodeSyntax({...input,workspace:empty}));
   const p=c.policy();c.write('.sodam-agent/policy.json',{...p,expiresAt:new Date(0).toISOString()});assert.throws(()=>checkNodeSyntax(input));c.write('.sodam-agent/policy.json',p);
 });
 test('CLI success, failed parser and rejected arbitrary options',()=>{
   const cli=fileURLToPath(new URL('../plugins/autonomy-team/runtime/cli.mjs',import.meta.url));
   const run=request=>{c.write('request.json',request);return spawnSync(process.execPath,[cli,'syntax-check',base,'request.json'],{encoding:'utf8',timeout:10000});};
   const pass=run({evidence:['valid.mjs']});assert.equal(pass.status,0);assert.equal(JSON.parse(pass.stdout).result.exit_code,0);
   const fail=run({evidence:['invalid.mjs']});assert.equal(fail.status,1);assert.equal(JSON.parse(fail.stdout).result.exit_code,1);
   const rejected=run({evidence:['valid.mjs'],command:'private-command-marker'});assert.equal(rejected.status,1);assert.ok(!rejected.stderr.includes('private-command-marker'));
 });
 test('four maximum snapshots remain bounded and read only',()=>{
   const names=['batch-a.mjs','batch-b.mjs','batch-c.cjs','batch-d.cjs'];for(const name of names)write(name,'//'+ 'a'.repeat(262142));
   const started=Date.now(),r=checkNodeSyntax({...input,evidence:names});assert.equal(r.exit_code,0);assert.equal(r.artifacts.length,4);assert.ok(r.artifacts.every(a=>a.bytes===262144));assert.deepEqual(fs.readFileSync(c.safe('.sodam-agent/state.json')),state);console.log('MEASURE: four maximum files '+(Date.now()-started)+' ms; local sample only');
 });
 test('real controlled child timeout and injected launch denial or signal fail closed',()=>{
   const original=childProcess.spawnSync;
   const replace=fn=>{childProcess.spawnSync=fn;syncBuiltinESMExports();};
   try {
     replace((exe,args,options)=>original(exe,['-e','setTimeout(()=>{},10000)'],options));
     const r=checkNodeSyntax(input);assert.equal(r.exit_code,1);assert.equal(r.artifacts[0].timedOut,true);assert.equal(r.artifacts[0].diagnostic,'parser-timeout');
     for(const result of [{status:null,signal:null,error:{code:'EACCES',message:'private-error-marker'}},{status:null,signal:'SIGTERM'}]) {
       replace(()=>result);const failed=checkNodeSyntax(input);assert.equal(failed.exit_code,1);assert.equal(failed.artifacts[0].status,'failed');assert.equal(failed.artifacts[0].diagnostic,'parser-unavailable');assert.ok(!JSON.stringify(failed).includes('private-error-marker'));
     }
   } finally {replace(original);}
 });
 console.log('PASS: '+count+' fixed syntax checker groups');
} finally {
 assert.equal(path.dirname(base),os.tmpdir());assert.ok(path.basename(base).startsWith('sodam-syntax-'));fs.rmSync(base,{recursive:true,force:true});
}
