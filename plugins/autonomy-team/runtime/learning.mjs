// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Event-driven lifecycle; the host model extracts bounded procedures from work.
// No scheduler, model API, shell commands or permission expansion.
export function adaptFromWork(controller, scope) {
  const policy = controller.policy();
  if (!scope.gap) return { status: 'no-capability-gap' };
  const state = controller.state();
  const active = state.agents.find(a => a.kind === scope.kind && a.gap === scope.gap && ['pilot', 'confirmed'].includes(a.status));
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
    if (active.status === 'confirmed') return { status: 'retained', agent: active.name };
    if (runs.some(e => e.outcome === 'failed')) return { status: 'pilot-environment-unresolved', agent:active.name };
    const heldOut = runs.filter(e => e.outcome === 'verified' && !active.basisTasks.includes(e.taskId));
    if (new Set(heldOut.map(e => e.taskId)).size < 2 || !heldOut.every(valid)) return { status: 'pilot-awaiting-comparison', agent: active.name };
    const pairs = heldOut.map(run => ({ run, baseline: state.experiences.find(e => !e.agent && e.taskId === run.taskId && e.kind === active.kind && e.gap === active.gap && e.outcome === 'verified') }));
    if (!pairs.every(p => p.baseline && valid(p.baseline))) return { status: 'pilot-awaiting-comparison', agent: active.name };
    if (pairs.every(({run, baseline}) => run.seconds <= baseline.seconds && run.corrections <= baseline.corrections) &&
        !pairs.some(({run, baseline}) => run.seconds < baseline.seconds || run.corrections < baseline.corrections)) return { status: 'pilot-no-measured-improvement', agent: active.name };
    if(active.confirmationPolicy==='procedure-quality-v1' && !heldOut.every(e=>controller.procedureEvidence(active,e))) return {status:'pilot-awaiting-procedure-evidence',agent:active.name};
    // assess retains its stricter paired checks; failures are visible, never fabricated.
    const assessment = controller.assess({ agent: active.name });
    return { ...assessment, roleStatus:assessment.status ?? 'disabled', status: 'assessed' };
  }
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
