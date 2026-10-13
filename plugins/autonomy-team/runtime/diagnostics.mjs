// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Read-only metadata. Never initialize, repair, unlock or renew authorization.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Controller} from './engine.mjs';
import {Bridge} from './bridge.mjs';
import {capacity} from './capacity.mjs';
import {inspectArea} from './areas.mjs';
import {statusDisplay,unknownDisplay} from './status-display.mjs';

const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function fingerprint() {
  const dir=new URL('./',import.meta.url);
  const files=fs.readdirSync(dir).filter(f=>/^[a-z-]+\.mjs$/.test(f)).sort();
  assert.ok(files.length>=1 && files.length<=40);
  return hash(JSON.stringify(files.map(name=>{
    const file=new URL(name,dir);const s=fs.lstatSync(file);
    assert.ok(s.isFile() && !s.isSymbolicLink() && s.size<=4_000_000);
    return [name,hash(fs.readFileSync(file))];
  })));
}
const startedAt=new Date().toISOString();
const startupSourceFingerprint=fingerprint();
function inspectRuntimeDetails(input) {
  assert.ok(input && !Array.isArray(input) && typeof input==='object');
  assert.ok(Object.keys(input).every(k=>k==='workspace'));
  assert.ok(input.workspace===undefined || (typeof input.workspace==='string' && input.workspace.length>=1 && input.workspace.length<=1000));
  let currentSourceMatchesStartup=false, sourceReadable=true;
  try {currentSourceMatchesStartup=fingerprint()===startupSourceFingerprint;} catch {sourceReadable=false;}
  const result={exit_code:0,readOnly:true,runtime:{version:'0.3.9',startedAt,startupSourceFingerprint,currentSourceMatchesStartup,
    sourceStatus:!sourceReadable?'unverified':currentSourceMatchesStartup?'current':'changed',
    nextAction:!sourceReadable?'review-runtime-files':currentSourceMatchesStartup?'none':'reconnect-runtime',
    supportedOperations:['dispatch','finish','read-role','role-step','skip','resolve-failure','review-role','inspect_runtime','check_node_syntax'],
    assurance:'Fingerprint of source files observed at process startup, not a bytecode attestation. A disk update does not reload this process. No environment, commands or artifact text returned.'}};
  if(input.workspace===undefined)return result;
  if(!currentSourceMatchesStartup){
    result.workspace={authorization:'unverified',learningActive:false,workEligible:false,
      diagnostic:sourceReadable?'runtime-source-changed':'runtime-source-unreadable',
      nextAction:result.runtime.nextAction};
    return result;
  }
  try {
    result.connection=inspectArea(input.workspace);
    const c=new Controller(input.workspace);
    try {fs.statSync(c.safe('.sodam-agent/policy.json'));}
    catch(error){if(error.code!=='ENOENT')throw error;result.workspace={authorization:'missing',learningActive:false,nextAction:'explicit-workspace-authorization-required'};return result;}
    const policy=c.read('.sodam-agent/policy.json');
    assert.ok(Object.keys(policy).every(k=>['schema','workspace','expiresAt','maxAgents','maxExperiences','maxRetries','autoPilot','areaBinding','automaticBinding'].includes(k)));
    assert.ok(Number.isInteger(policy.maxRetries) && policy.maxRetries>=0 && policy.maxRetries<=2 && typeof policy.autoPilot==='boolean');
    const report=capacity(c.root), j=new Bridge(c.root).journal();
    if(!report.expired)c.policy();
    const state=c.state(), counts={dispatchMissing:0,roleReadMissing:0,roleStepsMissing:0,finishMissing:0,failedEvents:0,unknownEvents:0};
    for(const t of j.turns){
      if(!['open','incomplete'].includes(t.status))continue;
      if(!t.plan)counts.dispatchMissing++;
      else {
        counts.finishMissing++;
        if(t.plan.agent){
          if(!t.roleRead)counts.roleReadMissing++;
          const a=state.agents.find(a=>a.name===t.plan.agent);
          if(a?.spec && (t.roleSteps?.filter(s=>s.completed).length ?? 0)!==a.spec.procedure.length)counts.roleStepsMissing++;
        }
      }
      counts.failedEvents+=t.tools.filter(x=>x.outcome==='failed').length;
      counts.unknownEvents+=t.tools.filter(x=>x.outcome==='unknown').length;
    }
    const workLimitReached=report.remaining.experiences===0 || report.remaining.turns===0;
    const areaLimitReached=result.connection.remainingMutations===0;
    result.workspace={authorization:report.expired?'expired':'valid',workEligible:!report.expired && !report.locked && !workLimitReached && !areaLimitReached,
      newRoleCapacityAvailable:report.remaining.roles>0,
      remaining:report.remaining,locked:report.locked,storageNearLimit:report.storage.nearLimit,hookJournalPresent:fs.existsSync(c.safe('.sodam-agent/hooks.json')),
      openTurns:report.openTurns,stageCounts:counts,
      workflowEvidence:{registeredTurns:j.turns.length,dispatchedTurns:j.turns.filter(t=>Boolean(t.plan)).length,
        closedTurns:j.turns.filter(t=>t.status==='closed').length,
        verifiedHookExperiences:j.turns.filter(t=>t.status==='closed' && state.experiences.some(e=>e.id==='event-'+t.key && e.outcome==='verified')).length,
        recordedExperiences:state.experiences.length,
        hostInvocationVerified:false,improvementEffectVerified:false,
        assurance:'Stored workflow metadata only. CLI records do not establish automatic host hook invocation or improvement effects.'},
      legacyActiveRoles:state.agents.filter(a=>['pilot','confirmed'].includes(a.status) && !a.confirmationPolicy).length,
      nextAction:areaLimitReached?'explicit-area-budget-review-required':report.expired?'explicit-renewal-required':report.locked?'wait-for-current-owner':workLimitReached || report.storage.nearLimit?'verified-archive-and-explicit-continuation':report.remaining.roles===0?'reuse-existing-role-without-new-generation':!j.turns.length?'observe-next-actual-work':'inspect-missing-work-stages',
      assurance:'Bounded metadata, not a consistent snapshot during concurrent writes or proof of host hook execution, actual work or improvement.'};
  } catch(error) {
    result.workspace={authorization:'unverified',learningActive:false,diagnostic:['EACCES','EPERM'].includes(error.code)?'permission-denied':error.code==='ENOENT'?'required-file-missing':'invalid-workspace-or-state',nextAction:'review-without-automatic-repair'};
  }
  return result;
}
export function inspectRuntime(input) {
  const result=inspectRuntimeDetails(input);
  result.display=unknownDisplay();
  if(input.workspace!==undefined && result.runtime.sourceStatus==='current') {
    try {result.display=statusDisplay(new Controller(input.workspace));} catch { /* Keep fixed unverified label. */ }
  }
  return result;
}
