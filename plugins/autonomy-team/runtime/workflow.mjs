// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Fixed operations on an already authorized project; no shell or permission changes.
import assert from 'node:assert/strict';
import {Bridge} from './bridge.mjs';
import {verifyArtifacts} from './output-verifier.mjs';
import {specification} from './engine.mjs';
import {adaptFromWork} from './learning.mjs';
import {connectWorkspace} from './areas.mjs';
// Fixed technical procedure only: no prompt/artifact text is copied into memory.
const defaultLesson = () => ({
  objective:'같은 분야에서 저장 산출물의 검증 절차를 재사용한다. 전문 품질의 개선 증거는 별도다.',
  procedure:[
    {action:'inspect-requirements',detail:'현재 요구사항과 보존 범위에 맞는 검수 항목을 정한다.'},
    {action:'verify-output',detail:'저장 산출물을 다시 읽어 의미를 검수하고 승인된 파일 검사로 실제 증거를 확인한다.'},
    {action:'report-limits',detail:'실행 결과와 미검증 범위를 구분하고 실패를 성공 경험으로 저장하지 않는다.'}
  ],
  checks:['현재 산출물 검사와 실행 증거가 유효해야 한다.','의미 검수는 작업자가 별도로 수행해야 한다.']
});
export function manageWorkflow(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input));
  assert.deepEqual(Object.keys(input).sort(), ['operation', 'request', 'workspace']);
  assert.ok(typeof input.workspace === 'string' && input.workspace.length > 0 && input.workspace.length <= 1000);
  assert.ok(['dispatch', 'finish', 'read-role', 'role-step', 'skip'].includes(input.operation));
  assert.ok(input.request && typeof input.request === 'object' && !Array.isArray(input.request));
  const workspace=connectWorkspace(input.workspace).root;
  const bridge=new Bridge(workspace); bridge.c.policy();
  if(input.operation==='skip')return {exit_code:0,result:bridge.skip(input.request)};
  if(input.operation==='dispatch')return {exit_code:0,result:bridge.dispatch(input.request)};
  if(input.operation==='read-role')return {exit_code:0,result:bridge.readRole(input.request)};
  if(input.operation==='role-step')return {exit_code:0,result:bridge.roleStep(input.request)};
  const request={...input.request};
  assert.ok(Object.keys(request).every(key=>['turnKey','outcome','cause','evidence','corrections','lesson','reflection','semanticReviewed','portableReviewed','quality'].includes(key)));
  if (request.portableReviewed !== undefined) {
    assert.equal(request.portableReviewed, true);
    assert.equal(request.outcome, 'verified');
    assert.equal(request.semanticReviewed, true);
    assert.equal(request.lesson?.portable, true);
  }
  if (request.lesson?.portable === true) assert.equal(request.portableReviewed, true, 'portable procedure privacy review required');
  const turn=bridge.turn(bridge.journal(),request.turnKey);
  let verified;
  if(request.reflection !== undefined) {
    assert.equal(request.semanticReviewed,true,'reviewed failure evidence required');
    assert.equal(request.outcome,'failed');
    assert.ok(['quality','missing-role'].includes(request.cause));
    assert.ok(request.reflection.improvement===undefined, "failure reflection cannot carry improvement marker");
    specification(request.reflection);
    verified=verifyArtifacts({workspace,evidence:request.evidence});
  }
  if(request.outcome==='verified') {
    assert.equal(request.semanticReviewed,true,'semantic review acknowledgement required');
    verified=verifyArtifacts({workspace,evidence:request.evidence});
    if(turn.plan?.learnWhileWorking) assert.ok(request.lesson,'task-specific learning required');
    if(request.lesson===undefined) {
      const automatic=defaultLesson();
      // Preserve legacy closed payloads and custom lessons; never rewrite history.
      const prior=bridge.c.state().experiences.find(e=>e.id===`event-${turn.key}`);
      if(!prior || JSON.stringify(prior.lesson)===JSON.stringify(automatic)) request.lesson=automatic;
    }
  } else assert.ok(request.semanticReviewed===undefined || typeof request.semanticReviewed==='boolean');
  const portableReviewed = request.portableReviewed === true;
  delete request.semanticReviewed;
  delete request.portableReviewed;
  const result=bridge.finish(request, portableReviewed);
  if(result.recorded===false)return {exit_code:0,result,adaptation:{status:'deferred',reason:'learning-not-stored'},...(verified?{artifacts:verified.artifacts}:{})};
  let adaptation;
  try { adaptation=adaptFromWork(bridge.c, {kind:turn.plan.kind, gap:turn.plan.gap, contextTags:turn.plan.contextTags}); }
  catch(error) {
    const diagnostics={ENOENT:'evidence-or-state-missing',EACCES:'permission-denied',EPERM:'permission-denied',ENOSPC:'storage-full'};
    adaptation={status:'deferred',reason:'lifecycle-operation-failed',diagnostic:diagnostics[error.code] ?? (error.code==='ERR_ASSERTION'?'lifecycle-precondition':'lifecycle-unavailable'),recordPreserved:true};
  }
  return {exit_code:0,result,adaptation,...(verified?{artifacts:verified.artifacts}:{}),quality:'Task-specific learning is host-model assessed; file checks and execution are separately verified. Pilot creation does not prove improvement.'};
}
