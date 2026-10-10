# 자동 업무 흐름 검증 — 2026-10-10

## 정본에 반영한 변경
plugins/autonomy-team/runtime/diagnostics.mjs: workflowEvidence에 요청 등록, dispatch, closed, 훅 연계 verified 경험, 전체 경험 수를 추가했다. 수동 기록·합성 훅 기록을 실제 호스트 자동 호출이나 개선 효과로 인증하지 않는다. 원문·요청·도구 응답을 반환하지 않는다.
test/diagnostics.mjs: 수동 경험과 중단된 요청이 자동 호출 증거로 오인되지 않는 회귀 검증을 추가했다.

## 실행한 검증
- node --check plugins/autonomy-team/runtime/diagnostics.mjs: 통과.
- 기본 샌드박스 node test/diagnostics.mjs: 기존 runtime-copy 파일 rename 시험에서 EPERM 실패.
- 일반 로컬 npm.cmd test: 전체 16개 묶음 통과, 진단 9개 그룹 및 작업 영역 23개 그룹 포함.
- npm.cmd run validate: 12 plugins, 56 skills, 24 manifests, 0 dependencies.
- 정본 CLI로 승인된 Context 복사본 읽기 전용 diagnose 실행.

## 현재 확인과 제한
C 채팅의 실제 호스트 cwd는 C에 남아 있다. D 복사본 명령 실행만으로 D의 UserPromptSubmit 이벤트가 발생하지 않는다. 다른 승인 복사나 가짜 turnKey 생성으로 이 경계를 우회하지 않는다.
자동 연결·중복·승인 없음·만료·실패·중단·경험 무효화·역할 복귀의 코드 검증은 격리 fixture에서 수행했다. 실제 Desktop 자연어 업무에서 자동 호출·자동 저장·자동 재사용, 장기 품질·시간 향상은 미확인이다.
이번 수정은 개발 정본과 설치본 3곳에 반영했다. 재시작 후 실제 Desktop inspect_runtime에서 sourceStatus=current 및 currentSourceMatchesStartup=true를 확인했고, D 시험 프로젝트 승인도 valid다. 예약 작업, 설정, 승인, 개인 기억은 변경하지 않았다.
## 후속 실제 업무: 설명서 동기화 점검
D Context 복사본에서 checkup-cli.mjs --action sync-check 실행: exit 0, applicable=true, onlyInClaude 0건, onlyInAgents 21건. 검사 방식은 안전 키워드가 있는 줄의 문자열 비교이며, 의미 충돌 또는 결함 21건으로 확정하지 않는다. 관련 node lib/sync-check.test.mjs: 8 통과, 0 실패. 두 설명서는 변경하지 않았다. 자동 훅 저널과 등록 업무 턴은 여전히 없으므로 이번 작업을 자동 호출·자동 학습의 증거로 기록하지 않았다.
