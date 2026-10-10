# MCP 보강 및 회귀 결과 2026-10-10

정본: <canonical-project>

## 구현
- 오래된 또는 읽을 수 없는 MCP 소스는 manage_workflow 상태 변경 전에 거부한다. 진단과 산출물 읽기는 유지한다.
- 고정 check_node_syntax 구조화된 완전 성공만 역할 작업 증거 후보로 인정한다. 평문, 실패, 잘못된 경로/해시를 제외한다. 의미 검수와 개선 효과 판정은 별도다.
- 운영 문서에 재연결, 조건별 교훈 검토, 승인 만료와 보관 판단을 명시했다. 예약 작업 없음.

## 검증
- npm test: 18개 테스트 파일 전체 종료값 0.
- npm run validate: 12 plugins, 56 skills, 24 manifests, dependencies 0.
- D 격리 복사본 node test/bridge.mjs: 25 groups 통과. node test/mcp.mjs: 19 groups 통과.
- 설치본 3곳 각각 18개 파일 정본 해시 일치. 이전 파일 백업.
- 새 설치 CLI diagnose: sourceStatus current, authorization valid, workEligible true.
- 실제 연결 Desktop inspect_runtime: sourceStatus changed, reconnect-runtime. 자동 호출 해결 완료 아님.

## 한계
단위/격리 시험은 실제 업무 경험이 아니다. 현재 실제 turn의 13개 이벤트는 종료 정보 부족으로 unknown 보존한다. 성공 학습으로 전환하지 않는다. 기존 교훈은 이번 dispatch에서 조회하고 실행 상태/설치 구분에 적용했다. Desktop 자동 호출과 후속 업무 재사용 및 장기 효과는 미확인. 실제 파서 시간 초과, OS ACL 거부 및 부하 시험은 미실행. 독립 코드 리뷰는 완료하지 못했다.

## 다음
설치 묶음을 고정한다. Desktop 재연결 후 current 여부를 확인하고 승인된 D 프로젝트 실제 요청에서 호출, 결과 검수, 저장과 다음 업무 재사용을 각각 확인한다. 만료/한도를 자동 갱신하지 않는다.
