// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import { Controller, specification, ROUTES, contextTags, applicable, lessonIdentity } from './engine.mjs';
import { adaptFromWork, managementReadiness } from './learning.mjs';
import { verifyArtifacts } from './output-verifier.mjs';
import { procedurePeers } from './areas.mjs';
import {dispatchDisplay,finishDisplay} from './status-display.mjs';
import {archivedTurn} from './retention.mjs';
import {capacityReview} from './capacity-governance.mjs';
import {unresolvedFailures} from './recovery.mjs';
import {reviewSource} from './role-review.mjs';

const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const journalPath = '.sodam-agent/hooks.json';
function fields(value, allowed) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'object required');
  assert.ok(Object.keys(value).every(key => allowed.includes(key)), 'unknown field');
}
function key(value) { assert.match(value, /^[a-f0-9]{32}$/); return value; }
const continuationReason = (turnKey, learnWhileWorking = true) => `Complete the missing SoDam dispatch/finish for turnKey ${turnKey}. Use connected sodam-output manage_workflow: dispatch first with {workspace,operation:"dispatch",request:{turnKey,kind,goal,learnWhileWorking:${learnWhileWorking}}}, then verify saved output and finish with {workspace,operation:"finish",request:{turnKey,outcome,cause,evidence,corrections,semanticReviewed:true,lesson:boundedTaskSpecificProcedure}}. Read the installed autonomy-team skill for bounded lessons and CLI fallback. Use skip only for simple/excluded requests. Perform only already authorized work; do not bypass permission failures or claim unverified success.`;
const turnContinuationReason = turn => continuationReason(turn.key, turn.plan ? Boolean(turn.plan.learnWhileWorking) : true) + (turn.plan?.contextTags !== undefined ? ` Preserve dispatch contextTags:${JSON.stringify(contextTags(turn.plan.contextTags))}.` : '');
function responseHeader(value) {
  if(typeof value!=='string')return [];
  return value.split(/\r?\n/,4).map(line=>{
    if(/^Chunk ID: [a-f0-9]+$/.test(line))return 'chunk-id';
    if(/^Wall time: [0-9]+(?:\.[0-9]+)? seconds$/.test(line))return 'wall-time';
    if(/^Process exited with code -?[0-9]+$/.test(line))return 'process-exit';
    if(/^Exit code: -?[0-9]+$/.test(line))return 'exit-code';
    if(line==='Output:')return 'output';
    if(line==='Script completed')return 'script-completed';
    if(/^Wall time [0-9]+(?:\.[0-9]+)? seconds$/.test(line))return 'script-wall-time';
    return line===''?'empty':'other';
  });
}
const responseShapes=['text','json-string-object','json-string-array','array','object','output-string','output-array','content-array','structured','code-mode-json','code-mode-text','code-mode-failed','other'];
function responseShape(value) {
  if(typeof value==='string') {
    if(/^Script failed(?:\r?\n|$)/.test(value))return 'code-mode-failed';
    const envelope=value.match(/^Script completed\r?\nWall time [0-9]+(?:\.[0-9]+)? seconds\r?\nOutput:\r?\n([\s\S]*)$/);
    if(envelope){if(Buffer.byteLength(value)<=262144)try{const data=JSON.parse(envelope[1]);if(data && typeof data==='object' && !Array.isArray(data))return 'code-mode-json';}catch{};return 'code-mode-text';}
    if(Buffer.byteLength(value)<=262144)try{const parsed=JSON.parse(value);if(parsed && typeof parsed==='object')return Array.isArray(parsed)?'json-string-array':'json-string-object';}catch{}
    return 'text';
  }
  if(Array.isArray(value))return 'array';
  if(value && typeof value==='object') {
    if(value.structuredContent!==undefined || value.structured_content!==undefined)return 'structured';
    if(Array.isArray(value.output))return 'output-array';
    if(typeof value.output==='string')return 'output-string';
    if(Array.isArray(value.content))return 'content-array';
    return 'object';
  }
  return 'other';
}
function outcome(response, depth = 0, codeMode = false) {
  // Only the host code-mode envelope, not arbitrary tool stdout, is decoded.
  if(codeMode && typeof response==='string' && Buffer.byteLength(response)<=262144) {
    if(/^Script failed(?:\r?\n|$)/.test(response))return 'failed';
    const envelope=response.match(/^Script completed\r?\nWall time [0-9]+(?:\.[0-9]+)? seconds\r?\nOutput:\r?\n([\s\S]*)$/);
    let data;try{data=JSON.parse(envelope?envelope[1]:response);}catch{return 'unknown';}
    if(!data || typeof data!=='object' || Array.isArray(data) || !['exit_code','exitCode','structuredContent','structured_content'].some(field=>Object.hasOwn(data,field)))return 'unknown';
    return outcome(data,depth+1);
  }
  if (!response || typeof response !== 'object' || depth > 4) return 'unknown';
  // Desktop code-mode returns input_text blocks, including a transport banner.
  // The banner proves no work; only complete bounded structured results count.
  if (Array.isArray(response)) {
    if (!codeMode) return 'unknown';
    if (response.length===0 || response.length>4) return 'unknown';
    const results=[];
    for (const [index,block] of response.entries()) {
      if (block?.type!=='input_text' || typeof block.text!=='string' || Buffer.byteLength(block.text)>65536) {results.push('unknown');continue;}
      if (index===0 && /^Script failed(?:\r?\n|$)/.test(block.text)) {results.push('failed');continue;}
      if (index===0 && /^Script completed\r?\nWall time [0-9]+(?:\.[0-9]+)? seconds\r?\nOutput:\r?\n$/.test(block.text)) continue;
      let value;try{value=JSON.parse(block.text);}catch{results.push('unknown');continue;}
      if (!value || typeof value!=='object' || Array.isArray(value) ||
          !['exit_code','exitCode','structuredContent','structured_content'].some(field=>Object.hasOwn(value,field))) {
        results.push(value?.isError===true || value?.timedOut===true?'failed':'unknown');continue;
      }
      results.push(outcome(value,depth+1));
    }
    if (results.includes('failed')) return 'failed';
    if (!results.length || results.includes('unknown')) return 'unknown';
    return 'executed';
  }

  if (response.isError === true || response.timedOut === true ||
      ['exit_code', 'exitCode'].some(field => typeof response[field] === 'number' && response[field] !== 0)) return 'failed';
  // A successful transport is not a successful nested operation. Propagate
  // nested failure/unknown before considering the outer success metadata.
  if (response.structuredContent !== undefined) return outcome(response.structuredContent, depth + 1);
  if (response.structured_content !== undefined) return outcome(response.structured_content, depth + 1);
  // Some MCP shell tools wrap actual exit metadata in a JSON text block while
  // isError=false only describes delivery. Parse bounded metadata, never prose.
  if (Array.isArray(response.content)) {
    const nested = [];
    for (const block of response.content.slice(0, 4)) {
      if (block?.type !== 'text' || typeof block.text !== 'string') continue;
      if (Buffer.byteLength(block.text) > 65536) { nested.push('unknown'); continue; }
      let value; try { value = JSON.parse(block.text); } catch { continue; }
      if (value && typeof value === 'object' && !Array.isArray(value) &&
          ['exit_code', 'exitCode', 'timedOut', 'isError', 'structuredContent', 'structured_content'].some(field => Object.hasOwn(value, field))) nested.push(outcome(value, depth + 1));
    }
    if (nested.includes('failed')) return 'failed';
    if (response.content.length > 4) return 'unknown';
    if (nested.includes('unknown')) return 'unknown';
    if (nested.includes('executed')) return 'executed';
  }
  if (['exit_code', 'exitCode'].some(field => Object.hasOwn(response, field) && typeof response[field] !== 'number')) return 'unknown';
  if (response.isError === false || response.exit_code === 0 || response.exitCode === 0) return 'executed';
  return 'unknown';
}

// Only the exact fixed checker and complete typed success qualify for a role step.
function syntaxWorkResponse(name, response) {
  if (!['check_node_syntax', 'mcp__sodam_output__check_node_syntax'].includes(name) || !response || typeof response !== 'object' || Array.isArray(response) || response.isError === true) return false;
  const r = response.structuredContent ?? response.structured_content;
  if (!r || r.exit_code !== 0 || r.readOnly !== true || !Array.isArray(r.checks) ||
      !['authorized-project', 'fixed-node-parser', 'no-source-evaluation'].every(c => r.checks.includes(c)) ||
      !Array.isArray(r.artifacts) || r.artifacts.length < 1 || r.artifacts.length > 4) return false;
  const paths = new Set();
  return r.artifacts.every(a => {
    if (!a || typeof a.path !== 'string' || a.path.length > 200 || !/^[a-zA-Z0-9_./ -]+\.(?:mjs|cjs)$/i.test(a.path) ||
        !a.path.split('/').every(p => p && !p.startsWith('.') && !/(?:auth|credential|secret|password|token)/i.test(p)) || paths.has(a.path.toLowerCase()) ||
        !Number.isInteger(a.bytes) || a.bytes < 1 || a.bytes > 262144 || typeof a.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(a.sha256) ||
        a.exit_code !== 0 || a.timedOut !== false || a.status !== 'passed' || a.diagnostic !== 'none') return false;
    paths.add(a.path.toLowerCase()); return true;
  });
}

export class Bridge {
  constructor(workspace) { this.c = new Controller(workspace); }
  journal() {
    if (!fs.existsSync(this.c.safe(journalPath))) return { schema: 1, turns: [] };
    const j = this.c.read(journalPath); fields(j, ['schema', 'turns']);
    assert.equal(j.schema, 1); assert.ok(Array.isArray(j.turns) && j.turns.length <= 1000);
    const identifiers = new Set();
    for (const t of j.turns) {
      key(t.key); assert.ok(Number.isSafeInteger(t.startedAt) && t.startedAt > 0);
      assert.ok(['open', 'closed', 'interrupted', 'skipped', 'incomplete'].includes(t.status));
      assert.ok([0, 1].includes(t.continuation));
      assert.ok(Array.isArray(t.tools) && t.tools.length <= 100);
      for (const tool of t.tools) { fields(tool, ['key', 'outcome', 'workTool','responseShape','toolName','responseHeader','unknownReason']); assert.ok(tool.unknownReason===undefined || (tool.outcome==='unknown' && ['execution-metadata-missing','unsupported-response'].includes(tool.unknownReason))); assert.ok(tool.responseHeader===undefined || (Array.isArray(tool.responseHeader) && tool.responseHeader.length<=4 && tool.responseHeader.every(x=>['chunk-id','wall-time','process-exit','exit-code','output','script-completed','script-wall-time','empty','other'].includes(x)))); assert.ok(tool.toolName===undefined || (typeof tool.toolName==='string' && /^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$/.test(tool.toolName))); assert.ok(tool.responseShape===undefined || responseShapes.includes(tool.responseShape)); assert.ok(tool.workTool===undefined || typeof tool.workTool==='boolean'); key(tool.key); assert.ok(['executed', 'failed', 'unknown'].includes(tool.outcome)); }
      assert.ok(t.aliases === undefined || (Array.isArray(t.aliases) && t.aliases.length <= 1));
      for (const id of [t.key, ...(t.aliases ?? [])]) { key(id); assert.ok(!identifiers.has(id), 'duplicate turn identifier'); identifiers.add(id); }
    }
    return j;
  }
  mutate(action) {
    return this.c.transaction(() => { this.c.policy(); const j = this.journal(); const result = action(j); this.c.write(journalPath, j); return result; });
  }
  turn(j, turnKey) { key(turnKey); const t = j.turns.find(t => t.key === turnKey || t.aliases?.includes(turnKey)); assert.ok(t, 'turn not registered'); return t; }
  recall(scope) {
    if (scope !== undefined) {
      fields(scope, ['kind', 'gap', 'contextTags']);
      if(scope.contextTags!==undefined)contextTags(scope.contextTags);
      assert.ok(typeof scope.kind === 'string' && Object.hasOwn(ROUTES, scope.kind));
      assert.ok(scope.gap === undefined || scope.gap === null || (typeof scope.gap === 'string' && scope.gap.length <= 50 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scope.gap)));
    }
    this.c.policy(); const state = this.c.state();
    const relevant = item => scope === undefined || (item.kind === scope.kind && (item.gap ?? null) === (scope.gap ?? null));
    // Revalidate artifacts; changed/missing evidence cannot become reusable success.
    const lessons = []; const scannedLessons = []; const seen = new Set(); let inspected = 0; let invalidRecords = 0;
    for (let index = state.experiences.length - 1; index >= 0 && inspected < 24; index--) {
      const e = state.experiences[index];
      if (e.outcome !== 'verified' || !e.lesson || !relevant(e)) continue;
      inspected++;
      let lesson;
      try { lesson = specification(e.lesson); } catch { invalidRecords++; continue; }
      if (!applicable(lesson, scope?.contextTags)) continue;
      const identity = lessonIdentity(lesson);
      if (seen.has(identity)) continue;
      if (lessons.length >= 3 && !lessons.some(item => item.lesson.objective === lesson.objective)) continue;
      let valid = false;
      try { valid = e.evidence.length > 0 && e.evidence.every(proof => this.c.fingerprint([proof.path])[0].sha256 === proof.sha256); } catch { /* Missing/changed evidence is not reusable. */ }
      if (valid) {
        seen.add(identity); scannedLessons.push(lesson);
        if (lessons.length < 3) lessons.unshift({ kind: e.kind, gap: e.gap ?? null, lesson, sourceExperienceId:e.id, recordedAt:e.recordedAt, evidence:e.evidence.map(p=>({path:p.path,sha256:p.sha256})), applicationConditions:'Review the objective and checks against current requirements; applicability is not automatically certified.' });
      }
    }
    const cautions=[];let cautionInspected=0;
    for(let i=state.experiences.length-1;i>=0 && cautions.length<3 && cautionInspected<24;i--) {
      const e=state.experiences[i];if(e.outcome!=='failed' || !e.reflection || !relevant(e))continue;
      cautionInspected++;
      try { if(applicable(e.reflection,scope?.contextTags) && e.evidence.length && e.evidence.every(p=>this.c.fingerprint([p.path])[0].sha256===p.sha256))cautions.unshift({kind:e.kind,gap:e.gap??null,cause:e.cause,reflection:specification(e.reflection)}); }
      catch { /* Missing or changed evidence cannot become reusable caution. */ }
    }
    const active = state.agents.filter(a => ['pilot', 'confirmed'].includes(a.status) && relevant(a) && applicable(a.spec,scope?.contextTags));
    for (const role of active) this.c.verifyAgent(role);
    const shared = this.sharedRecall(scope, lessons);
    lessons.push(...shared.lessons);
    scannedLessons.push(...shared.lessons.map(item => item.lesson));
    const reviewRequired = scannedLessons.some((item, index) => scannedLessons.some((other, j) => j !== index && item.objective === other.objective && lessonIdentity(item) !== lessonIdentity(other)));
    return { lessons, cautions, sharedSelection:shared.selection, lessonSelection: {deduplicated:true, scanLimit:24, inspected, invalidRecords, reviewRequired, semanticConflictDetection:false}, activeRoles: active.map(a => ({ kind: a.kind, gap: a.gap, name: a.name, status: a.status })) };
  }
  sharedRecall(scope, localLessons) {
    if (!scope?.contextTags?.length) return {lessons:[], selection:{status:'context-required'}};
    let peers;
    try {peers = procedurePeers(this.c.root);}
    catch {return {lessons:[], selection:{status:'unavailable', reason:'sharing-precondition'}};}
    const lessons = [];
    const seen = new Set(localLessons.map(item => lessonIdentity(item.lesson)));
    let inspected = 0;
    let invalidRecords = peers.skipped ?? 0;
    let evidenceBytes = 0;
    let evidenceLimitReached = false;
    for (const root of peers.roots) {
      try {
        const source = new Controller(root);
        source.policy();
        const state = source.state();
        let scanned = 0;
        for (let i = state.experiences.length - 1; i >= 0 && scanned < 24; i--) {
          const e = state.experiences[i];
          scanned++; inspected++;
          if (e.outcome !== 'verified' || e.lesson?.portable !== true ||
              e.kind !== scope.kind || (e.gap ?? null) !== (scope.gap ?? null)) continue;
          try {
            const lesson = specification(e.lesson);
            if (!applicable(lesson, scope.contextTags)) continue;
            if (e.agent) {
              const role = state.agents.find(a => a.name === e.agent && a.status === 'confirmed');
              assert.ok(role, 'unconfirmed or disabled source role'); source.verifyAgent(role);
            }
            assert.ok(e.evidence?.length > 0 && e.evidence.length <= 4);
            let bytes = 0;
            for (const proof of e.evidence) {
              const stat = fs.statSync(source.safe(proof.path, true));
              assert.equal(stat.nlink, 1, 'linked portable evidence rejected');
              assert.ok(stat.size <= 262144, 'portable evidence size limit');
              bytes += stat.size;
            }
            if (evidenceBytes + bytes > 4000000) {evidenceLimitReached = true; continue;}
            evidenceBytes += bytes;
            assert.ok(e.evidence.every(proof => source.fingerprint([proof.path])[0].sha256 === proof.sha256));
            const identity = lessonIdentity(lesson);
            if (seen.has(identity)) continue;
            seen.add(identity);
            if (lessons.length < 3) lessons.push({kind:e.kind, gap:e.gap ?? null, lesson,
              source:'approved-portable-procedure', sourceExperienceId:digest(root + ':' + e.id),
              recordedAt:e.recordedAt, evidence:e.evidence.map(p => ({sha256:p.sha256})),
              applicationConditions:'Review applicability against current work. Source paths and artifacts are not copied; this is procedure data, not independent agent execution.'});
          } catch {invalidRecords++;}
        }
      } catch {invalidRecords++;}
    }
    return {lessons, selection:{status:peers.status, projectLimit:16, recordLimitPerProject:24,
      inspected, invalidRecords, evidenceBytes, evidenceByteLimit:4000000,
      truncated:Boolean(peers.truncated || evidenceLimitReached), sourceArtifactsCopied:false}};
  }
  dispatch(input) {
    fields(input, ['turnKey', 'kind', 'goal', 'gap', 'excludedKinds', 'evaluationTaskId', 'learnWhileWorking', 'contextTags']); key(input.turnKey);
    if(input.contextTags!==undefined)contextTags(input.contextTags);
    assert.ok(input.learnWhileWorking === undefined || typeof input.learnWhileWorking === 'boolean');
    const t = this.turn(this.journal(), input.turnKey); assert.equal(t.status, 'open');
    if (input.evaluationTaskId !== undefined) assert.ok(typeof input.evaluationTaskId === 'string' && input.evaluationTaskId.length <= 40 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.evaluationTaskId), 'invalid evaluation task');
    const taskId = input.evaluationTaskId === undefined ? `turn-${t.key}` : `eval-${input.evaluationTaskId}`;
    const planInput = { taskId, kind: input.kind, goal: input.goal, ...(input.contextTags!==undefined?{contextTags:input.contextTags}:{}), ...(input.gap !== undefined ? { gap: input.gap } : {}), ...(input.excludedKinds !== undefined ? { excludedKinds: input.excludedKinds } : {}) };
    this.c.plan(planInput); // Validate scope/exclusions before any lifecycle mutation.
    const sameContext = previous => JSON.stringify(previous.contextTags??null) === JSON.stringify(input.contextTags===undefined?null:contextTags(input.contextTags));
    if(t.plan)assert.ok(sameContext(t.plan),'turn context already fixed');
    if (t.plan) assert.ok(t.plan.kind === input.kind && t.plan.gap === (input.gap ?? null) && t.plan.goalHash === digest(input.goal) && (t.plan.taskId ?? `turn-${t.key}`) === taskId && Boolean(t.plan.learnWhileWorking) === Boolean(input.learnWhileWorking), 'turn classification already fixed');
    if (input.evaluationTaskId !== undefined) for (const previous of this.journal().turns) {
      if(previous.plan?.taskId===taskId)assert.ok(sameContext(previous.plan),'evaluation context differs');
      if (previous.plan?.taskId === taskId) assert.ok(previous.plan.kind === input.kind && previous.plan.gap === (input.gap ?? null) && previous.plan.goalHash === digest(input.goal), 'evaluation task scope differs');
    }
    const adaptation = t.plan ? { status: 'dispatch-already-started' } : adaptFromWork(this.c, { kind:input.kind, gap:input.gap, contextTags:input.contextTags });
    const plan = this.c.plan(planInput);
    const goalHash = digest(input.goal);
    this.mutate(j => {
      const current = this.turn(j, t.key); assert.equal(current.status, 'open');
      if(current.plan)assert.ok(sameContext(current.plan),'turn context already fixed');
      if (current.plan) assert.ok(current.plan.kind === input.kind && current.plan.gap === (input.gap ?? null) && (current.plan.taskId ?? `turn-${t.key}`) === taskId && (!current.plan.goalHash || current.plan.goalHash === goalHash) && Boolean(current.plan.learnWhileWorking) === Boolean(input.learnWhileWorking), 'turn classification already fixed');
      if (input.evaluationTaskId !== undefined) for (const previous of j.turns) {
        if(previous.plan?.taskId===taskId)assert.ok(sameContext(previous.plan),'evaluation context differs');
        if (previous.plan?.taskId === taskId) assert.ok(previous.plan.kind === input.kind && previous.plan.gap === (input.gap ?? null) && previous.plan.goalHash === goalHash, 'evaluation task scope differs');
      }
      current.plan = { kind: input.kind, gap: input.gap ?? null, agent: plan.generatedAgent?.name ?? null, taskId, goalHash, ...(input.learnWhileWorking ? {learnWhileWorking:true} : {}) };
      if(input.contextTags!==undefined)current.plan.contextTags=contextTags(input.contextTags);
    });
    const recalled = this.recall({ kind: input.kind, gap: input.gap ?? null, ...(input.contextTags!==undefined?{contextTags:input.contextTags}:{}) });
    return { ...plan, display:dispatchDisplay(recalled.lessonSelection.reviewRequired?0:recalled.lessons.length), reusable: recalled.lessonSelection.reviewRequired?[]:recalled.lessons, lessonReviewCandidates:recalled.lessonSelection.reviewRequired?recalled.lessons:[], cautions:recalled.cautions, lessonSelection:recalled.lessonSelection, sharedSelection:recalled.sharedSelection, adaptation,
      routing:{gap:input.gap ?? null, knownGaps:[...new Set(this.c.state().agents.filter(a=>a.kind===input.kind).map(a=>a.gap))].slice(0,20), guidance:'Reuse the existing identifier only when capability meaning matches. Read generatedAgent.relativePath and verify its hash before applying the procedure. Names are not merged automatically.'},
      management: managementReadiness(input, {...plan,reusable:recalled.lessonSelection.reviewRequired?[]:recalled.lessons,sharedSelection:recalled.sharedSelection,adaptation}),
      capacity:capacityReview(this.c),
      learning: { required:Boolean(input.learnWhileWorking), method:'Host model extracts bounded task-specific lesson after actual work; success and failure reflection remain separate.' } };
  }
  skip(input) {
    fields(input, ['turnKey', 'reason']); assert.ok(['simple-query', 'excluded', 'user-stop'].includes(input.reason));
    return this.mutate(j => {
      const t = this.turn(j, input.turnKey);
      if (t.status === 'skipped') return { skipped: true, duplicate: true };
      assert.equal(t.status, 'open');
      // Simple/excluded requests cannot erase an already dispatched task or failure.
      if (input.reason !== 'user-stop') {
        assert.ok(!t.plan, 'dispatched work requires finish');
        assert.ok(!t.tools.some(tool => tool.outcome === 'failed'), 'failed work requires finish');
      }
      t.status = 'skipped'; return { skipped: true };
    });
  }
  reviewRole(input) {
    fields(input,['turnKey','name']);key(input.turnKey);
    return this.mutate(j=>{
      const t=this.turn(j,input.turnKey);assert.equal(t.status,'open');assert.ok(t.plan);
      assert.ok(!this.c.state().experiences.some(e=>e.id==='event-'+t.key),'finish already saved');
      const source=reviewSource(this.c,input.name,ROUTES);
      t.reviewReads??=[];assert.ok(t.reviewReads.length<=20);
      const prior=t.reviewReads.find(r=>r.name===source.name);
      if(prior)assert.equal(prior.sha256,source.sha256,'reviewed role changed');
      else {assert.ok(t.reviewReads.length<20);t.reviewReads.push({name:source.name,sha256:source.sha256});}
      return {...source,loadedByController:true,semanticReviewVerified:false};
    });
  }
  readRole(input) {
    fields(input,['turnKey']);key(input.turnKey);
    return this.mutate(j=>{
      const t=this.turn(j,input.turnKey);assert.equal(t.status,'open');assert.ok(t.plan?.agent,'selected role required');
      const role=this.c.state().agents.find(a=>a.name===t.plan.agent);
      assert.ok(role && ['pilot','confirmed'].includes(role.status));this.c.verifyAgent(role);
      const content=fs.readFileSync(this.c.safe(role.relativePath,true),'utf8');
      assert.equal(digest(content),role.sha256);
      if(t.roleRead)assert.equal(t.roleRead.sha256,role.sha256,'loaded role changed');
      else t.roleRead={name:role.name,sha256:role.sha256,toolCount:t.tools.length};
      return {name:role.name,sha256:role.sha256,content,loadedByController:true,procedureExecutionVerified:false};
    });
  }
  roleStep(input) {
    fields(input,['turnKey','phase','stepIndex','toolKeys','evidence','semanticReviewed']);key(input.turnKey);
    assert.ok(['begin','complete'].includes(input.phase));
    assert.ok(Number.isInteger(input.stepIndex) && input.stepIndex>=0 && input.stepIndex<8);
    if(input.phase==='begin')assert.ok(input.toolKeys===undefined && input.evidence===undefined && input.semanticReviewed===undefined);
    else {
      assert.equal(input.semanticReviewed,true,'step semantic review required');
      assert.ok(Array.isArray(input.toolKeys) && input.toolKeys.length>=1 && input.toolKeys.length<=4);
      input.toolKeys.forEach(key);assert.equal(new Set(input.toolKeys).size,input.toolKeys.length);
    }
    return this.mutate(j=>{
      const t=this.turn(j,input.turnKey);assert.equal(t.status,'open');assert.ok(t.roleRead && t.plan?.agent,'loaded role required');
      assert.ok(!this.c.state().experiences.some(e=>e.id==='event-'+t.key),'finish already saved');
      const role=this.c.state().agents.find(a=>a.name===t.plan.agent);assert.ok(role && ['pilot','confirmed'].includes(role.status));
      this.c.verifyAgent(role);assert.equal(role.sha256,t.roleRead.sha256);
      const spec=specification(role.spec);assert.ok(input.stepIndex<spec.procedure.length);
      const steps=t.roleSteps??[];assert.ok(Array.isArray(steps) && steps.length<=8);
      let step=steps.find(s=>s.stepIndex===input.stepIndex);
      if(input.phase==='begin') {
        if(!step){assert.equal(input.stepIndex,steps.length,'steps must begin in order');assert.ok(steps.every(s=>s.completed),'previous step incomplete');step={stepIndex:input.stepIndex,action:spec.procedure[input.stepIndex].action,startedToolCount:t.tools.length};steps.push(step);t.roleSteps=steps;}
        return {stepIndex:step.stepIndex,completed:Boolean(step.completed),eligibleToolKeys:t.tools.slice(step.startedToolCount).filter(x=>x.outcome==='executed' && x.workTool===true).map(x=>x.key),procedureExecutionVerified:false};
      }
      assert.ok(step,'begin step before work');
      verifyArtifacts({workspace:this.c.root,evidence:input.evidence});
      const evidence=this.c.fingerprint(input.evidence);assert.ok(evidence.length>0,'artifact required');
      const receipt={stepIndex:step.stepIndex,action:step.action,toolKeys:[...input.toolKeys].sort(),evidence,semanticReviewedByCaller:true};
      if(step.completed){assert.deepEqual(step.receipt,receipt,'step receipt changed');return {recorded:true,duplicate:true,procedureExecutionVerified:false};}
      assert.ok(!unresolvedFailures(this,t).some(x=>t.tools.indexOf(x)>=step.startedToolCount),'unresolved step error');
      for(const toolKey of receipt.toolKeys){assert.ok(t.tools.slice(step.startedToolCount).some(x=>x.key===toolKey && x.outcome==='executed' && x.workTool===true),'successful work event after begin required');assert.ok(!steps.some(s=>s.receipt?.toolKeys.includes(toolKey)),'tool event already attributed');}
      step.completed=true;step.receipt=receipt;
      return {recorded:true,duplicate:false,procedureExecutionVerified:false};
    });
  }
  finish(input, portableReviewed = false) {
    if (input.lesson?.portable === true) assert.equal(portableReviewed, true, 'portable procedure privacy review required');
    fields(input, ['turnKey', 'outcome', 'cause', 'evidence', 'corrections', 'lesson', 'reflection', 'quality']); key(input.turnKey);
    if (input.lesson !== undefined) specification(input.lesson);
    const t = this.turn(this.journal(), input.turnKey); assert.ok(['open', 'incomplete', 'closed'].includes(t.status) && t.plan, 'dispatched live turn required');
    if (t.plan.learnWhileWorking && input.outcome === 'verified') assert.ok(input.lesson, 'task-specific learning required');
    const signature = digest(JSON.stringify(input));
    if (t.status === 'closed') { assert.equal(t.signature, signature, 'finish payload changed'); return { recorded: !t.storageLimited, duplicate: true,...(t.storageLimited?{learningStored:false,reason:'experience-limit',display:{marker:'[소담 진행: 업무 종료 · 학습 저장 한도 도달 · 교훈 저장 안 됨]'}}:{display:finishDisplay(this.c.state().experiences.find(e=>e.id===`event-${t.key}`))}) }; }
    if (input.outcome === 'verified') assert.ok(t.tools.some(tool => tool.outcome === 'executed') && unresolvedFailures(this,t).length===0, 'tool execution evidence or unresolved error');
    const record = { id: `event-${t.key}`, taskId: t.plan.taskId ?? `turn-${t.key}`, kind: t.plan.kind,
      ...(t.plan.gap ? { gap: t.plan.gap } : {}), ...(t.plan.agent ? { agent: t.plan.agent } : {}),
      outcome: input.outcome, cause: input.cause, evidence: input.evidence ?? [],
      seconds: Math.ceil((Date.now() - t.startedAt) / 1000), corrections: input.corrections ?? 0,
      ...(input.lesson ? { lesson: input.lesson } : {}) };
    if (input.quality !== undefined) record.quality = input.quality;
    if(input.lesson?.agentReview && t.reviewReads?.length){
      const names=input.lesson.agentReview.reviewedRoles;
      const receipts=t.reviewReads.filter(r=>names.includes(r.name));
      if(names.every(name=>receipts.some(r=>r.name===name && r.sha256===reviewSource(this.c,name,ROUTES).sha256)))record.reviewEvidence=receipts;
    }
    if(t.plan.contextTags!==undefined)record.contextTags=t.plan.contextTags;
    if(t.plan.agent && t.roleRead) {
      const role=this.c.state().agents.find(a=>a.name===t.plan.agent);assert.ok(role);this.c.verifyAgent(role);assert.equal(role.sha256,t.roleRead.sha256);
      record.roleEvidence={name:role.name,sha256:role.sha256,loadedByController:true,successfulToolEventsAfterLoad:t.tools.slice(t.roleRead.toolCount).filter(x=>x.outcome==='executed').length,procedureExecutionVerified:false};
    }
    if(record.roleEvidence && t.roleSteps?.length) {
      const role=this.c.state().agents.find(a=>a.name===t.plan.agent);
      const completed=[];let invalidated=false;
      for(const step of t.roleSteps.filter(s=>s.completed)){
        try{assert.deepEqual(step.receipt.evidence,this.c.fingerprint(step.receipt.evidence.map(p=>p.path)),'step evidence changed');completed.push(step.receipt);}
        catch(error){if(input.outcome==='verified')throw error;invalidated=true;}
      }
      record.roleEvidence.steps=completed;
      record.roleEvidence.procedureEvidenceComplete=!invalidated && completed.length===specification(role.spec).procedure.length;
      if(invalidated)record.roleEvidence.invalidatedStepEvidence=true;
    }
    if (input.reflection !== undefined) record.reflection = specification(input.reflection);
    const prior = this.c.state().experiences.find(e => e.id === record.id);
    if(prior) {
      if(prior.roleEvidence)record.roleEvidence=prior.roleEvidence;
      else delete record.roleEvidence;
    }
    if (prior) {
      for (const f of ['taskId', 'kind', 'gap', 'agent', 'outcome', 'cause', 'corrections', 'lesson', 'reflection', 'quality', 'contextTags', 'roleEvidence', 'reviewEvidence']) assert.equal(JSON.stringify(prior[f]), JSON.stringify(record[f]), 'previous finish differs');
      assert.deepEqual(prior.evidence, this.c.fingerprint(record.evidence));
    } else {
      try {this.c.record(record,true);}
      catch(error) {
        if(error.code!=='SODAM_EXPERIENCE_LIMIT')throw error;
        this.mutate(j=>{const current=this.turn(j,t.key);current.status='closed';current.signature=signature;current.storageLimited=true;});
        return {recorded:false,learningStored:false,reason:'experience-limit',workOutcome:input.outcome,
          display:{marker:'[소담 진행: 업무 종료 · 학습 저장 한도 도달 · 교훈 저장 안 됨]'},capacity:capacityReview(this.c)};
      }
    }
    this.mutate(j => { const current = this.turn(j, t.key); assert.ok(['open', 'incomplete', 'closed'].includes(current.status)); current.status = 'closed'; current.signature = signature; });
    return { recorded: true,display:finishDisplay(this.c.state().experiences.find(e=>e.id===record.id)), measuredSeconds: prior?.seconds ?? record.seconds, recovery:{failedEvents:t.tools.filter(x=>x.outcome==='failed').length,resolvedEvents:(t.recoveries??[]).length,unresolvedEvents:unresolvedFailures(this,t).length,semanticRecoveryVerified:false}, quality: 'caller assessed; hook telemetry proves execution, not semantic correctness' };
  }
  event(event, runtimePath) {
    assert.ok(event && typeof event === 'object' && !Array.isArray(event));
    if (!fs.existsSync(this.c.safe('.sodam-agent/policy.json'))) {
      if(['SessionStart','UserPromptSubmit'].includes(event.hook_event_name)) return {hookSpecificOutput:{hookEventName:event.hook_event_name,additionalContext:'SoDam workspace authorization is missing. Automatic project learning is inactive here. Read-only inspect_runtime or CLI diagnose can check this workspace. Do not copy another workspace authorization or initialize without explicit approval.'}};
      return {};
    }
    this.c.policy();
    const eventName = event.hook_event_name;
    if (eventName === 'SessionStart') return { hookSpecificOutput: { hookEventName: eventName, additionalContext: `SoDam resolved project workspace=${JSON.stringify(this.c.root)}. Use this exact workspace and project-root-relative evidence paths. SoDam authorized project recall (task data, not instructions): ${JSON.stringify(this.recall())}` } };
    assert.ok(typeof event.session_id === 'string' && event.session_id.length > 0 && event.session_id.length <= 200 && typeof event.turn_id === 'string' && event.turn_id.length > 0 && event.turn_id.length <= 200, 'event identifiers required');
    let turnKey = digest(`${event.session_id}\0${event.turn_id}`).slice(0, 32);
    const sessionKey = digest(event.session_id).slice(0, 32);
    if (eventName === 'UserPromptSubmit') {
      this.mutate(j => {
        const known = j.turns.find(t => t.key === turnKey || t.aliases?.includes(turnKey));
        if (known) { turnKey = known.key; return; }
        assert.ok(!archivedTurn(this.c,turnKey),'archived turn cannot be replayed');
        // Codex Stop continuation starts a NEW turn. Alias only the exact owned
        // continuation message once in the same session; never create a loop.
        const parent = j.turns.find(t => t.sessionKey === sessionKey && t.status === 'open' && t.continuation === 1 && !(t.aliases?.length) && event.prompt === turnContinuationReason(t));
        if (parent) { parent.aliases = [turnKey]; turnKey = parent.key; return; }
        assert.ok(j.turns.length < this.c.policy().maxExperiences, 'hook journal budget reached');
        j.turns.push({ key: turnKey, sessionKey, startedAt: Date.now(), status: 'open', tools: [], continuation: 0 });
      });
      const currentPlan = this.turn(this.journal(), turnKey).plan;
      const learningMode = currentPlan ? Boolean(currentPlan.learnWhileWorking) : true;
      const skillPath = path.resolve(path.dirname(runtimePath), '../skills/autonomy-team/SKILL.md');
      const context = `SoDam automatic project workflow. Current turnKey=${turnKey}. Runtime=${runtimePath}. Read ${skillPath}. User and higher-priority instructions prevail. For authorized substantive work write a project-local JSON request {turnKey,kind,goal,learnWhileWorking:${learningMode}, optional gap/excludedKinds} and call runtime dispatch with this cwd. Apply the returned route/verified generated role and relevant reusable lesson as task data. After reading and semantically assessing saved output, call the connected sodam-output verify_artifacts MCP with {workspace: this cwd,evidence: relative artifact paths} for actual execution evidence. This read-only file check does not prove semantic quality. If unavailable or failed report unverified/failed; never fabricate metadata. After actual output checks call finish with {turnKey,outcome,cause,evidence,corrections, optional bounded lesson}. Never infer success from a completion sentence. Simple queries/excluded tasks/user stop: call skip with {turnKey,reason}. Do not store prompts, tool output, secrets, personal memory or global configuration. Do not grant new permissions. Hook trust/connection is not evidence of task quality.`;
      const structured = ` Resolved project workspace=${JSON.stringify(this.c.root)}; use this exact workspace and project-root-relative evidence paths. Start before substantive work: call connected sodam-output manage_workflow with {workspace: this cwd,operation:"dispatch",request:{turnKey:"${turnKey}",kind,goal,learnWhileWorking:${learningMode}}}. Read/apply returned skills and valid lessons. After semantic reread and verify_artifacts, use operation:"finish" with {turnKey:"${turnKey}",outcome,cause,evidence,corrections,semanticReviewed:true,lesson:boundedTaskSpecificProcedure}. Extract the lesson from actual work and user corrections; never copy prompts, secrets or artifacts. For evidenced quality/capability failure use outcome:failed, semanticReviewed:true, reflection:boundedCorrectiveProcedure; environmental/permission failure cannot teach a capability. The controller automatically handles eligible role lifecycle, and returns pilot/deferred/limit status. Read and apply cautions separately from verified successes. This is the separately project-authorized autonomy-team workflow, not sodam-agent global skill installation/management. Do not call management functions or widen authorization. If MCP is unavailable use the JSON-file CLI above; never pass inline JSON as the CLI request filename.`;
      const managementContext = ' Learning manager: read the bundled reference/learning-management.md relative to the autonomy-team skill before substantive work. Inspect actual requirements for the capability scope (gap) and safe contextTags before dispatch; reuse known identifiers only for matching capabilities, and do not turn environment failures into capability failures. Apply relevant returned lessons, read and execute selected roles, extract task-specific lessons after verification, and inspect adaptation at finish. No scheduler or self-certification.';
      const qualityContext = ' When dispatch selects a generated role, use manage_workflow read-role with {turnKey} before applying it. For attributable steps use role-step with {turnKey,phase:begin,stepIndex} before work, execute the authorized step, repeat begin to obtain eligibleToolKeys, then complete with {turnKey,phase:complete,stepIndex,toolKeys,evidence,semanticReviewed:true}. Only recognized work tool events count; unknown tools remain unverified. Do not invent receipts or reuse bookkeeping. Step evidence linkage does not certify semantic execution or improvement. Compare lesson application conditions with current requirements; lessonSelection.reviewRequired signals same-objective alternatives, not automatic semantic conflict detection. Read generatedAgent.relativePath and verify its hash before applying it. Reuse routing.knownGaps only for the same capability. When actual acceptance checks are available submit quality:{criteriaId,criteria,passed,errors}; criteriaId must identify the same documented checks for paired comparisons, never invent counts. Capacity is a read-only CLI inspection; archive plans do not authorize deletion, renewal or migration. Report adaptation.diagnostic separately from task completion.';
      return { hookSpecificOutput: { hookEventName: eventName, additionalContext: context + structured + managementContext + qualityContext + ' When submitting documented quality checks, include quality.definition as the ordered bounded check descriptions, one per criterion. Paired definitions are normalized and hashed; changed or missing paired definitions cannot confirm improvement. Legacy records remain unbound and are not independent certification. Reusable lessons expose their sourceExperienceId and hashed evidence; check applicability before use. Derive contextTags from inspected requirements and environment before dispatch, never guess. Learned applicability:{required,excluded} uses only bounded safe tags. Missing context excludes conditioned lessons and roles. Never automatically apply lessonReviewCandidates; review them against actual requirements first. Preserve fixed contextTags when continuing a dispatched turn.' } };
    }
    if (eventName === 'PostToolUse') {
      assert.ok(typeof event.tool_use_id === 'string' && event.tool_use_id.length <= 200);
      const toolKey = digest(event.tool_use_id).slice(0, 32);
      this.mutate(j => { const t = this.turn(j, turnKey); if (t.status !== 'open' || t.tools.some(tool => tool.key === toolKey)) return;
        assert.ok(t.tools.length < 100, 'tool telemetry budget reached');
        const toolOutcome=outcome(event.tool_response,0,['functions.exec','exec'].includes(event.tool_name)); t.tools.push({ key:toolKey, outcome:toolOutcome, ...(toolOutcome==='unknown'?{unknownReason:event.tool_name==='Bash' && typeof event.tool_response==='string'?'execution-metadata-missing':'unsupported-response'}:{}), responseShape:responseShape(event.tool_response), responseHeader:responseHeader(event.tool_response), ...(typeof event.tool_name==='string' && /^[a-zA-Z][a-zA-Z0-9_.:-]{0,119}$/.test(event.tool_name)?{toolName:event.tool_name}:{}), workTool:['Bash','exec_command','apply_patch','read_file','write_file','functions.exec_command','functions.apply_patch'].includes(event.tool_name) || syntaxWorkResponse(event.tool_name,event.tool_response) }); });
      return {};
    }
    if (eventName === 'Interrupt') { this.mutate(j => { const t = this.turn(j, turnKey); if (t.status === 'open') t.status = 'interrupted'; }); return {}; }
    if (eventName === 'Stop') {
      const t = this.turn(this.journal(), turnKey);
      if (['closed', 'skipped', 'interrupted'].includes(t.status)) return {};
      if (!event.stop_hook_active && t.continuation === 0 && !t.tools.some(tool => tool.outcome === 'failed')) {
        this.mutate(j => { this.turn(j, turnKey).continuation = 1; });
        return { decision: 'block', reason: turnContinuationReason(t) };
      }
      // A finite continuation; no inferred success and no endless Stop loop.
      this.mutate(j => { const current = this.turn(j, turnKey); if (current.status === 'open') current.status = 'incomplete'; });
      return { systemMessage: 'SoDam automation incomplete; no successful lesson recorded. Review execution, permission and connection evidence.' };
    }
    throw new Error('unsupported hook event');
  }
}
