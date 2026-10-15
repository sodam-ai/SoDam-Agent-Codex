// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Fixed read-only labels. No prompts, paths or exception text in markers.
import fs from 'node:fs';
import {capacity} from './capacity.mjs';
import {inspectArea} from './areas.mjs';
import {automaticPolicy} from './automatic.mjs';
export const unknownDisplay = () => ({state:'unverified',marker:'[소담 에이전트: 미확인 · 자동 학습 상태 확인 필요]',assurance:'Status is not proof of host delivery, work, lesson application or improvement.'});
// Only fixed messages are exposed. Never echo exception text or request data.
export function failureDisplay(diagnostic='workflow-unverified') {
  if(diagnostic==='store-locked')return {
    state:'blocked',marker:'[소담 에이전트: 기록·학습 저장 차단 · 작업 저장소 잠금 확인 필요]',
    summary:'소담 에이전트 기록·학습 기능이 저장소 잠금 때문에 이번 처리를 완료하지 못했습니다.',
    impact:'일반 업무의 결과와 기록 저장은 별개입니다. 이번 교훈 저장과 자동 복구는 확인되지 않았습니다.',
    nextAction:'사용 중이거나 소유자를 확인할 수 없는 잠금은 보존합니다. 새 형식의 종료된 소유자만 다음 쓰기에서 검증된 백업 후 복구합니다. 그 외에는 소유자·권한·미완료 상태를 먼저 확인하세요.',
    lessonApplicationVerified:false};
  if(diagnostic==='common-registry-locked')return {
    state:'blocked',marker:'[소담 에이전트: 기록·학습 저장 차단 · 공통 저장소 잠금 확인 필요]',
    summary:'소담 에이전트의 공통 저장소가 잠겨 이번 기록·학습 처리가 차단됐습니다.',
    impact:'기존 기록을 삭제하지 않았습니다. 이 실패만으로 다른 도구의 업무가 중단된 것은 아닙니다.',
    nextAction:'잠금을 사용 중인 프로그램과 종료 여부를 확인해야 합니다. 소유자를 확인하기 전 잠금을 삭제하거나 같은 저장 요청을 반복하지 마세요.',
    lessonApplicationVerified:false};
  const changed=diagnostic==='runtime-source-changed';
  const unreadable=diagnostic==='runtime-source-unreadable';
  return {
    state:'blocked',
    marker:changed
      ? '[소담 에이전트: 기록·학습 저장 중단 · 연결 재시작 필요]'
      : '[소담 에이전트: 기록·학습 저장 미확인 · 원인 확인 필요]',
    summary:changed
      ? '소담 에이전트의 실행 중 연결이 업데이트된 파일과 달라 이번 기록·학습 저장이 차단됐습니다.'
      : unreadable
        ? '소담 에이전트의 실행 파일을 확인할 수 없어 이번 기록·학습 저장이 차단됐습니다.'
        : '소담 에이전트의 이번 기록·학습 처리가 실패했습니다. 저장 완료 여부는 확인되지 않았습니다.',
    impact:'다른 도구가 정상이라면 일반 업무는 계속할 수 있습니다. 소담 에이전트 전체 고장이나 기존 기록 삭제를 뜻하지 않습니다.',
    nextAction:changed
      ? '작업 상태를 보존하고 Codex를 완전히 종료한 뒤 다시 실행하세요. 이후 최신 연결을 확인해야 합니다. 이번 기록이 자동 복구됐다고 판단하지 마세요.'
      : unreadable
        ? '설치 파일과 읽기 권한을 확인해야 합니다. 원인을 확인하기 전 같은 저장 요청을 반복하지 마세요.'
        : '시작 등록·권한·입력·실행 증거를 확인해야 합니다. 원인을 확인하기 전 재시작이나 같은 요청을 반복하지 마세요.',
    lessonApplicationVerified:false,
    assurance:'Failure guidance only. No rollback, record recovery or host rendering is certified.'
  };
}
export function inspectionFailureDisplay() {
  return {
    state:'unverified',
    marker:'[소담 에이전트: 검사 실패 · 기록·학습 상태 별도 확인]',
    summary:'소담 에이전트의 이번 확인 요청이 실패했습니다. 이 읽기 전용 검사는 기록·학습 저장을 시도하지 않았습니다.',
    impact:'검사 실패만으로 학습이 꺼졌거나 기록 저장이 실패했다고 판단할 수 없습니다.',
    nextAction:'검사 입력·대상 파일·읽기 권한을 확인하세요. 같은 실패 검사를 반복하지 말고, 학습 저장 결과는 별도 실행 증거로 확인해야 합니다.',
    lessonApplicationVerified:false
  };
}
export function statusDisplay(controller) {
  try {
    if(!fs.existsSync(controller.safe('.sodam-agent/policy.json')))return {state:'inactive',marker:'[소담 에이전트: 비활성 · 자동 학습 꺼짐 · 승인 없음]'};
    const stored=controller.read('.sodam-agent/policy.json');
    const profile=automaticPolicy();
    if((profile && !profile.enabled) || (stored.automaticBinding && !profile))return {state:'inactive',marker:'[소담 에이전트: 비활성 · 자동 학습 꺼짐 · 공통 설정 꺼짐]'};
    const report=capacity(controller.root);
    if(report.expired)return {state:'inactive',marker:'[소담 에이전트: 비활성 · 자동 학습 꺼짐 · 승인 만료]'};
    const policy=controller.policy();
    const area=inspectArea(controller.root);
    if(report.commonLock.locked)return failureDisplay('common-registry-locked');
    if(report.locked)return failureDisplay('store-locked');
    if(report.remaining.experiences===0 || report.remaining.turns===0 || area.remainingMutations===0)
      return {state:'blocked',marker:'[소담 에이전트: 제한 · 학습 저장 한도 도달]'};
    return {state:'active',marker:`[소담 에이전트: 활성 · 자동 학습 켜짐 · 에이전트 자동 시험 적용 ${policy.autoPilot?'켜짐':'꺼짐'}]`,
      assurance:'Authorization and capacity only. Pilot enablement does not mean an agent ran or improved.'};
  } catch {return unknownDisplay();}
}
export function displayInstruction(display,started=false) {
  return ` SoDam visible status: ${display.marker}. In ordinary natural-language replies, show this exact marker once near the top, after any higher-priority required persona line. User-specified JSON/code-only formats prevail. ${started?'This request start is registered; you may show [소담 진행: 요청 시작 등록 확인]. Registration is not completed work. ':''}Use only returned progress markers after successful operations. Lesson return is not lesson application; never claim automatic operation from a label alone. Explain that the top marker is the setting, not this task's storage result. If an operation fails, immediately show its returned display.marker, summary, impact and nextAction in plain Korean without waiting for a question. Name the component as 소담 에이전트 기록·학습 기능, not SoDam alone. Never call a partial failure a total agent failure or claim all existing data is safe without checking. ${display.summary?`Current failure: ${display.summary} Impact: ${display.impact} Action: ${display.nextAction}`:''}`;
}
export function dispatchDisplay(count) {
  return {marker:`[소담 진행: 업무 시작 확인 · 관련 교훈 반환 ${count}건 · 적용 미확인]`,lessonApplicationVerified:false};
}
export function finishDisplay(record) {
  return {marker:record?.outcome==='verified' && record.lesson
    ? '[소담 진행: 검증된 교훈 저장 확인 · 후속 재사용 미확인]'
    : '[소담 진행: 작업 기록 저장 확인 · 성공 학습 미확인]',lessonApplicationVerified:false};
}
