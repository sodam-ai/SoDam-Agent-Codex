# 훅 시작 진단 보강 결과

정본 수정: plugins/autonomy-team/hooks/entry.mjs, test/bridge.mjs, test/areas.mjs.
시작 이벤트는 stderr에 received → workspace-resolved → handled 단계를 출력한다.
실패는 failed-input/workspace/bridge/output으로 구분한다. 요청 본문, 경로, 세션 식별자, 오류 원문을 출력하거나 별도 저장하지 않는다.
handled는 처리 반환을 뜻하며 승인 유효, 작업 등록, 학습 성공을 보장하지 않는다. 실제 hooks.json 및 workflow 상태와 대조해야 한다.
호스트가 stderr를 수집하지 않으면 진단 확인이 불가능하다. 진단 부재만으로 호스트 미전달을 확정하지 않는다.

bridge 실제 하위 프로세스 25개 검사 그룹 통과. validate: 12 plugins, 56 skills, 24 manifests 통과.
첫 전체 테스트는 areas의 이전 오류 문자열 일치 검사에서 실패했다. 새 단계 진단에 맞춰 실패 종료 및 경로 비노출을 유지하는 검사로 보강했다. 수정 후 전체 18개 시험 스크립트 재검사 통과(exit 0).

직접 사용자 입력의 학습 저장 및 후속 요청 재사용은 기존 실제 증거가 있다. 채팅 간 메시지 전달의 시작 이벤트 누락은 해결되지 않았다. 시작 식별자를 생성하거나 이전 요청의 것을 빌리지 않는다.
정본 수정 후 CLI·Desktop의 기존 entry.mjs를 백업하고 반영해 해시 일치를 확인했다. 설정·훅 정의·MCP 런타임은 변경하지 않았다. 실제 Desktop 새 진단 수집은 아직 미확인이다. 장기 개선 효과는 실제 업무 누적 후 평가한다. 예약 작업은 생성하지 않는다.