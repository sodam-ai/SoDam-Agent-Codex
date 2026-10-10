# 조건이 있는 자동 이어가기 결함 수정

## 재현과 원인
정본 test/work-learning.mjs에 조건 태그 unit-table을 가진 업무의 Stop -> 다음 UserPromptSubmit 회귀 검증을 추가했다. 수정 전 일반 로컬 실행에서 기존 turnKey와 다음 turnKey 불일치로 실패했다. 기존 Stop 문구는 contextTags 보존 지시를 추가했지만, 다음 요청의 별칭 인식은 이 지시를 제외한 문구만 비교했다. 따라서 동일 세션에서도 새로운 업무로 등록되어 원래 계획과 경험 저장 연결이 끊길 수 있었다.

## 최소 수정과 코드 검토
정본 plugins/autonomy-team/runtime/bridge.mjs에서 turnContinuationReason 함수를 두 경로가 공통 사용하도록 변경했다. 정확한 문구 일치, 동일 세션, 열린 상태, 최대 한 번 별칭 제한을 유지한다. 승인 생성/복사/확대, 저장 형식 변경, 임의 업무 분류는 추가하지 않았다. 변경 문구와 다른 세션은 기존 업무에 연결되지 않는 회귀 검증을 추가했다. 코드 검토는 직접 수행했으며 독립 에이전트 검증을 주장하지 않는다.

## 실행 결과
- 기본 샌드박스 work-learning 실행: 임시 파일 rename EPERM으로 실패. 성공으로 처리하지 않았다.
- 수정 전 일반 로컬 work-learning: turnKey 불일치로 결함 재현.
- 수정 후 일반 로컬 work-learning: 38개 그룹 통과.
- 정본 npm.cmd test: 전체 16개 묶음 exit 0.
- 정본 npm.cmd run validate: 12 plugins, 56 skills, 24 manifests, 0 dependencies.
- 마지막 추가 경계 검증 포함 D 복사본 verification/sodam-continuation-20261010/test/work-learning.mjs: 38개 그룹 통과. 테스트 코드와 런타임은 프로젝트 본체와 분리했다. 실제 사용자 업무 또는 자동 학습 효과로 인증하지 않는다.
- node --check plugins/autonomy-team/runtime/bridge.mjs: 통과.

## 설치와 남은 경계
검증 종료 후 bridge.mjs만 전역 배포본, CLI 캐시, Desktop 캐시에 백업하고 복사했다. 설치본 3곳 SHA-256은 정본과 동일하다. 훅 정의·신뢰·설정·승인·개인 기억은 변경하지 않았다. 설치 명령 첫 시도는 PowerShell 파이프 구문 오류로 실행 전 실패했고, 구문 수정 후 설치와 해시 검증을 완료했다.
실행 중인 Desktop inspect_runtime은 이번 업데이트로 sourceStatus=changed 및 reconnect-runtime을 반환했다. 새 설치본 CLI 프로세스는 currentSourceMatchesStartup=true와 D 프로젝트 authorization=valid를 확인했다. 기존 Desktop 프로세스의 재연결과 C 채팅 작업 위치 문제는 해결됐다고 주장하지 않는다.
실제 Desktop 자연어 자동 호출·저장·후속 자동 재사용, 장기 개선 효과는 미확인이다. D 프로젝트의 실제 hooks.json 또는 정책에 합성 이벤트를 쓰지 않았다. 테스트 fixture는 임시 위치에서 생성·정리됐다. Codex 예약 작업을 만들지 않았다.
