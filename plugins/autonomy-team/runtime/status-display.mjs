// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Fixed read-only labels. No prompts, paths or exception text in markers.
import fs from 'node:fs';
import {capacity} from './capacity.mjs';
import {inspectArea} from './areas.mjs';
import {automaticPolicy} from './automatic.mjs';
export const unknownDisplay = () => ({state:'unverified',marker:'[소담 에이전트: 미확인 · 자동 학습 상태 확인 필요]',assurance:'Status is not proof of host delivery, work, lesson application or improvement.'});
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
    if(report.locked)return {state:'blocked',marker:'[소담 에이전트: 대기 · 다른 작업 실행 중 · 자동 학습 진행 불가]'};
    if(report.remaining.experiences===0 || report.remaining.turns===0 || area.remainingMutations===0)
      return {state:'blocked',marker:'[소담 에이전트: 제한 · 학습 저장 한도 도달]'};
    return {state:'active',marker:`[소담 에이전트: 활성 · 자동 학습 켜짐 · 에이전트 자동 시험 적용 ${policy.autoPilot?'켜짐':'꺼짐'}]`,
      assurance:'Authorization and capacity only. Pilot enablement does not mean an agent ran or improved.'};
  } catch {return unknownDisplay();}
}
export function displayInstruction(display,started=false) {
  return ` SoDam visible status: ${display.marker}. In ordinary natural-language replies, show this exact marker once near the top, after any higher-priority required persona line. User-specified JSON/code-only formats prevail. ${started?'This request start is registered; you may show [소담 진행: 요청 시작 등록 확인]. Registration is not completed work. ':''}Use only returned progress markers after successful operations. Lesson return is not lesson application; never claim automatic operation from a label alone.`;
}
export function dispatchDisplay(count) {
  return {marker:`[소담 진행: 업무 시작 확인 · 관련 교훈 반환 ${count}건 · 적용 미확인]`,lessonApplicationVerified:false};
}
export function finishDisplay(record) {
  return {marker:record?.outcome==='verified' && record.lesson
    ? '[소담 진행: 검증된 교훈 저장 확인 · 후속 재사용 미확인]'
    : '[소담 진행: 작업 기록 저장 확인 · 성공 학습 미확인]',lessonApplicationVerified:false};
}
