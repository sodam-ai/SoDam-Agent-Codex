import {applicable,improvementMinimum} from './engine.mjs';
// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Event-driven lifecycle; the host model extracts bounded procedures from work.
// No scheduler, model API, shell commands or permission expansion.
export function adaptFromWork(controller, scope) {
  const policy = controller.policy();
  if (!scope.gap) return { status: 'no-capability-gap' };
  const state = controller.state();
  const active = state.agents.find(a => a.kind === scope.kind && a.gap === scope.gap && ['pilot', 'confirmed'].includes(a.status) && applicable(a.spec,scope.contextTags));
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
    if (active.status === 'confirmed') return improveFromWork(controller,state,scope,active,policy) ?? { status: 'retained', agent: active.name };
    if (runs.some(e => e.outcome === 'failed')) return { status: 'pilot-environment-unresolved', agent:active.name };
    const heldOut = runs.filter(e => e.outcome === 'verified' && !active.basisTasks.includes(e.taskId));
    if (new Set(heldOut.map(e => e.taskId)).size < 2 || !heldOut.every(valid)) return { status: 'pilot-awaiting-comparison', agent: active.name };
    const pairs = heldOut.map(run => ({ run, baseline: state.experiences.find(e => (e.agent??null)===(active.previous??null) && e.taskId === run.taskId && e.kind === active.kind && e.gap === active.gap && e.outcome === 'verified') }));
    if (!pairs.every(p => p.baseline && valid(p.baseline))) return { status: 'pilot-awaiting-comparison', agent: active.name };
    if (pairs.every(({run, baseline}) => run.seconds <= baseline.seconds && run.corrections <= baseline.corrections) &&
        !pairs.some(({run, baseline}) => run.seconds < baseline.seconds || run.corrections < baseline.corrections)) return { status: 'pilot-no-measured-improvement', agent: active.name };
    if(active.confirmationPolicy==='procedure-quality-v1' && !heldOut.every(e=>controller.procedureEvidence(active,e))) return {status:'pilot-awaiting-procedure-evidence',agent:active.name};
    // assess retains its stricter paired checks; failures are visible, never fabricated.
    const assessment = controller.assess({ agent: active.name });
    return { ...assessment, roleStatus:assessment.status ?? 'disabled', status: 'assessed' };
  }
  // Keep an existing context-bound role intact; do not assess or replace it from another context.
  if (state.agents.some(a => a.kind === scope.kind && a.gap === scope.gap && ['pilot', 'confirmed'].includes(a.status))) return {status:'role-context-unmatched'};
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
export function managementReadiness(scope, selected) {
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
    guidance: 'For learning work, inspect current requirements and registered role files before work. After verification record a bounded lesson and agentReview decision with reason and actually reviewed roles. If evidence is insufficient, report review-incomplete rather than no role needed. Missing capability scope does not disable lesson storage. Never invent gaps, tags, evidence or authorization.'
  };
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
  if (missing.length) return {status:'review-incomplete',missing,lessonPresent:Boolean(request.lesson),lifecycleStatus:adaptation.status,reviewEvidenceVerified:Boolean(reviewEvidenceVerified),semanticReviewVerified:false};
  const review=request.lesson.agentReview;
  return {status:'review-recorded',decision:review.action,reason:review.reason,
    lifecycleStatus:adaptation.status,reviewEvidenceVerified:true,semanticReviewVerified:false,
    assurance:'Role file reads and current hashes verified. Applicability is caller assessed; creation, execution and improvement require separate evidence.'};
}
