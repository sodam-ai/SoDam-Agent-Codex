import {applicable,improvementMinimum,matchesRole,contextTags} from './engine.mjs';
import {commonEnabled} from './common-registry.mjs';
// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Event-driven lifecycle; the host model extracts bounded procedures from work.
// No scheduler, model API, shell commands or permission expansion.
export function adaptFromWork(controller, scope) {
  const policy = controller.policy();
  if (!scope.gap) return { status: 'no-capability-gap' };
  const state = controller.state();
  const active = state.agents.find(a => matchesRole(a,scope.kind,scope.gap) && ['pilot', 'confirmed'].includes(a.status) && applicable(a.spec,scope.contextTags));
  const valid = e => {
    if (!e.evidence?.length) return false;
    try { return e.evidence.every(p => controller.fingerprint([p.path])[0].sha256 === p.sha256); }
    catch { return false; }
  };
  if (active) {
    controller.verifyAgent(active);
    const runs = state.experiences.filter(e => e.agent === active.name);
    // Environmental/permission failures cannot condemn a professional method.
    if (runs.some(e => e.outcome === 'failed' && ['quality', 'missing-role'].includes(e.cause))) {
      return { status: 'rolled-back', ...controller.rollback({ agent: active.name }) };
    }
    if (active.status === 'confirmed') {
      if (active.common === true) {
        const evaluation=controller.evaluationPairs(active);
        if (evaluation.failures.some(e=>['quality','missing-role'].includes(e.cause))) return {status:'rolled-back',...controller.rollback({agent:active.name})};
        if (evaluation.failures.length) return {status:'confirmed-environment-unresolved',agent:active.name};
        if (evaluation.coverage.skipped || evaluation.coverage.truncated) return {status:'confirmed-review-incomplete',agent:active.name,evaluationCoverage:evaluation.coverage};
      }
      return improveFromWork(controller,state,scope,active,policy) ?? { status: 'retained', agent: active.name };
    }
    if (runs.some(e => e.outcome === 'failed')) return { status: 'pilot-environment-unresolved', agent:active.name };
    const evaluation=controller.evaluationPairs(active), pairs=evaluation.pairs;
    if(evaluation.failures.some(e=>['quality','missing-role'].includes(e.cause)))return {status:'rolled-back',...controller.rollback({agent:active.name})};
    if(evaluation.failures.length)return {status:'pilot-environment-unresolved',agent:active.name};
    const validPair=({run,baseline,source})=>{try{return [run,baseline].every(e=>e.evidence?.length && e.evidence.every(p=>source.fingerprint([p.path])[0].sha256===p.sha256));}catch{return false;}};
    if (evaluation.incomplete || evaluation.coverage.skipped || evaluation.coverage.truncated || evaluation.coverage.pairedTasks < 2 || !pairs.every(validPair)) return { status: 'pilot-awaiting-comparison', agent: active.name, evaluationCoverage:evaluation.coverage };
    if (pairs.every(({run, baseline}) => run.seconds <= baseline.seconds && run.corrections <= baseline.corrections) &&
        !pairs.some(({run, baseline}) => run.seconds < baseline.seconds || run.corrections < baseline.corrections)) return { status: 'pilot-no-measured-improvement', agent: active.name };
    if(active.confirmationPolicy==='procedure-quality-v1' && !pairs.every(p=>p.source.procedureEvidence(active,p.run))) return {status:'pilot-awaiting-procedure-evidence',agent:active.name};
    // assess retains its stricter paired checks; failures are visible, never fabricated.
    const assessment = controller.assess({ agent: active.name });
    return { ...assessment, roleStatus:assessment.status ?? 'disabled', status: 'assessed' };
  }
  // Keep an existing context-bound role intact; do not assess or replace it from another context.
  if (state.agents.some(a => matchesRole(a,scope.kind,scope.gap) && ['pilot', 'confirmed'].includes(a.status))) return {status:'role-context-unmatched'};
  const improvement=improveFromWork(controller,state,scope,null,policy);
  if(improvement)return improvement;
  const revising = state.agents.some(a => a.kind === scope.kind && a.gap === scope.gap && a.status === 'disabled');
  const failures = state.experiences.filter(e => e.kind === scope.kind && e.gap === scope.gap && e.outcome === 'failed' && (e.cause === 'missing-role' || (revising && e.cause === 'quality')) && e.reflection && valid(e));
  if (new Set(failures.map(e => e.taskId)).size < 2) return { status: 'awaiting-distinct-capability-evidence' };
  if (!policy.autoPilot) return { status: 'pilot-not-authorized' };
  const pending = state.candidates.find(c => c.kind === scope.kind && c.gap === scope.gap && c.status === 'candidate');
  if (!pending && state.agents.length + state.candidates.filter(c => c.status === 'candidate').length >= policy.maxAgents) return { status: 'agent-limit' };
  // A disabled method needs new independent failures; do not regenerate from old ones.
  const usedTasks = new Set(state.agents.filter(a => a.kind === scope.kind && a.gap === scope.gap).flatMap(a => a.basisTasks));
  const fresh = failures.filter(e => !usedTasks.has(e.taskId));
  if (new Set(fresh.map(e => e.taskId)).size < 2) return { status: 'awaiting-new-capability-evidence' };
  const spec = fresh.at(-1).reflection;
  if (commonEnabled() && fresh.some(e => e.reflection?.portable !== true)) return {status:'common-procedure-review-required'};
  const created = controller.cycle({ kind: scope.kind, gap: scope.gap, spec });
  return { ...created, roleStatus:created.status, status: 'pilot-created' };
}

// Proposals are explicit bounded lesson data, not inferred from every successful task.
function improveFromWork(controller,state,scope,active,policy) {
  const eligible=state.experiences.filter(e=>e.kind===scope.kind && e.gap===scope.gap &&
    (e.agent??null)===(active?.name??null) && e.outcome==='verified' && (e.lesson?.improvement===true || e.lesson?.agentReview?.action==='lesson-only') && applicable(e.lesson,scope.contextTags) && JSON.stringify(e.contextTags??null)===JSON.stringify(scope.contextTags??null));
  for(const run of eligible.slice(-24).reverse()) {
    const examples=controller.improvementExamples(state,{kind:scope.kind,gap:scope.gap,spec:run.lesson},active);
    if(run.lesson.agentReview?.action==='lesson-only')return {status:'lesson-retained',reason:run.lesson.agentReview.reason};
    if(new Set(examples.map(e=>e.taskId)).size<improvementMinimum(run.lesson)){
      if(run.lesson.agentReview)return {status:'role-review-evidence-required',decision:run.lesson.agentReview.action,reason:run.lesson.agentReview.reason,semanticReviewVerified:false};
      continue;
    }
    if(!policy.autoPilot)return {status:'pilot-not-authorized'};
    if(commonEnabled() && (run.lesson.portable!==true || examples.some(e=>e.lesson?.portable!==true)))return {status:'common-procedure-review-required'};
    const pending=state.candidates.find(c=>c.kind===scope.kind && c.gap===scope.gap && c.status==='candidate');
    if(!pending && state.agents.length+state.candidates.filter(c=>c.status==='candidate').length>=policy.maxAgents)return {status:'agent-limit'};
    const candidate=pending??{id:controller.propose({kind:scope.kind,gap:scope.gap,spec:run.lesson}).candidate};
    controller.evaluate({candidate:candidate.id});
    const result=controller.promote({candidate:candidate.id});
    return {...result,roleStatus:result.status,status:'improvement-pilot-created',...(run.lesson.agentReview?{decision:run.lesson.agentReview.action,reason:run.lesson.agentReview.reason}:{})};
  }
  return null;
}

// Management readiness is metadata, not proof that the model executed the procedure.
export function managementReadiness(scope, selected, pendingReviews=[]) {
  return {
    learningRequested: Boolean(scope.learnWhileWorking),
    roleReviewRequired: Boolean(scope.learnWhileWorking),
    reviewDecisions: ['lesson-only','refine-existing','create-role'],
    capabilityScoped: Boolean(scope.gap),
    capabilityReviewRequired: Boolean(scope.learnWhileWorking && !scope.gap),
    contextProvided: Boolean(scope.contextTags?.length),
    sharedSelectionStatus: selected.sharedSelection?.status ?? 'unavailable',
    returnedLessons: selected.reusable?.length ?? 0,
    generatedRoleSelected: Boolean(selected.generatedAgent),
    lifecycleStatus: selected.adaptation?.status ?? 'not-evaluated',
    procedureExecutionVerified: false,
    pendingReviews,
    nextActions: scope.learnWhileWorking ? [
      ...(!scope.contextTags?.length?['review-applicable-context']:[]),
      ...(!scope.gap?['review-capability-scope']:[]),
      'read-and-review-existing-roles','verify-work-output','record-bounded-lesson-and-role-decision'
    ] : [],
    guidance: 'For learning work, inspect current requirements and registered role files before work. After verification record a bounded lesson and agentReview decision with reason and actually reviewed roles. If evidence is insufficient, report review-incomplete rather than no role needed. Missing capability scope does not disable lesson storage. Never invent gaps, tags, evidence or authorization.'
  };
}

// Read-only reminders from prior learning turns. Never reopen or edit history,
// copy lesson text, broaden context, or claim that a reminder was executed.
export function pendingLearningReviews(controller, journal, scope, reviewEvidence) {
  if (!scope.learnWhileWorking) return {items:[],inspected:0,truncated:false};
  const matching=journal.turns.filter(t=>t.plan?.learnWhileWorking && t.status==='closed' &&
    t.plan.kind===scope.kind && (t.plan.gap??null)===(scope.gap??null) &&
    JSON.stringify(t.plan.contextTags===undefined?null:contextTags(t.plan.contextTags))===JSON.stringify(scope.contextTags===undefined?null:contextTags(scope.contextTags)));
  const state=controller.state(), items=[];
  for (const turn of matching.slice(-24)) {
    const experience=state.experiences.find(e=>e.id===`event-${turn.key}`);
    if (!experience || experience.outcome!=='verified') continue;
    const result=learningReview(turn.plan,{outcome:experience.outcome,lesson:experience.lesson},{recorded:true},{status:'not-reassessed'},Boolean(reviewEvidence(controller,experience)));
    if (result.status==='review-incomplete') items.push({sourceExperienceId:experience.id,missing:result.missing,nextActions:result.nextActions});
  }
  return {items,inspected:Math.min(matching.length,24),truncated:matching.length>24,readOnly:true,historyRewritten:false,executionVerified:false};
}

// Report missing review separately from a reviewed decision not to create a role.
// Never infer semantic review, fabricate a gap or modify historical records.
export function learningReview(scope, request, result, adaptation, reviewEvidenceVerified=false) {
  const missing=[];
  if (!scope.learnWhileWorking) return {status:'not-requested',semanticReviewVerified:false};
  if (result.recorded===false) return {status:'not-stored',reason:result.reason??'learning-not-stored',semanticReviewVerified:false};
  if (request.outcome!=='verified') return {status:'work-unverified',workOutcome:request.outcome,semanticReviewVerified:false};
  if (!request.lesson) missing.push('task-specific-lesson');
  if (!scope.gap && request.lesson?.agentReview?.action!=='lesson-only') missing.push('capability-scope');
  if (!request.lesson?.agentReview) missing.push('role-review');
  else if (!reviewEvidenceVerified) missing.push('role-read-evidence');
  if (missing.length) return {status:'review-incomplete',missing, nextActions:missing.map(item=>({
    'task-specific-lesson':'extract-verified-bounded-procedure',
    'capability-scope':'review-capability-scope',
    'role-review':'record-role-decision-and-reason',
    'role-read-evidence':'read-and-review-existing-roles'
  }[item])),lessonPresent:Boolean(request.lesson),lifecycleStatus:adaptation.status,reviewEvidenceVerified:Boolean(reviewEvidenceVerified),semanticReviewVerified:false};
  const review=request.lesson.agentReview;
  return {status:'review-recorded',decision:review.action,reason:review.reason,
    lifecycleStatus:adaptation.status,reviewEvidenceVerified:true,semanticReviewVerified:false,
    assurance:'Role file reads and current hashes verified. Applicability is caller assessed; creation, execution and improvement require separate evidence.'};
}
