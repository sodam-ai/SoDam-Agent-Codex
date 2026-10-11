# Desktop 재시작 후 검증 — 2026-10-12

## 확인한 결과
- 실제 Desktop MCP 시작 지문: a0b1ca96d16cf5a288facff6040c11a8d7f01d31a4fbf10d25e2b46d7b1d5154.
- 현재 정본 런타임을 직접 읽어 계산한 지문과 동일. sourceStatus=current, currentSourceMatchesStartup=true. 실행 메모리 전체의 바이트코드 인증은 아님.
- 정본과 Desktop 설치본의 runtime/hooks/skills/reference 파일 29개 SHA-256 비교: 차이 0. 전체 플러그인 파일 또는 모든 훅 실행 검증은 아님.
- 최신 연결의 manage_workflow 도구 정의에 skip 포함. 현재 요청에서 skip을 호출하지는 않음.
- 승인된 Context 테스트 프로젝트 authorization=valid, workEligible=true, connectionRequired=false. 승인 범위와 기간을 변경하지 않음.
- 현재 요청에서 자동 제공된 시작 식별자와 프로젝트 저널의 등록 식별자가 일치. dispatch는 모델이 명시 호출해 성공. 이를 모든 새 채팅의 훅 실행 증명으로 확대하지 않음.
- 현재 요청에서 기존 같은 프로젝트의 devops 교훈 3건 반환. 과거 계획 완료를 현재 자동 운영 완료로 확대하지 않는 검수 원칙을 적용.

## 다른 프로젝트 교훈 재사용 확인
- 이미 승인된 영역의 7개 프로젝트 상태를 읽기 전용으로 확인. Loop는 실제 하위 sodamloop 루트 확인.
- outcome=verified, lesson.portable=true인 저장 교훈: 각 프로젝트 0건.
- Harness 프로젝트에서 실제 Bridge.recall을 읽기 전용 호출(kind docs, beginner-guide/markdown-docs 맥락): sharedSelection.status=enabled, inspected=24, invalidRecords=0, lessons=[], activeRoles=[].
- 공유 기능은 활성화됐지만 현재 공유 대상 교훈이 없음. 기존 교훈의 공유 표시를 임의로 바꾸지 않음. 반환 및 업무 적용은 미확인.

## 새 메시지 경로
- 기존 승인된 검증 채팅에 신규 설치 전 확인서 작성 업무를 한 번 전송.
- 해당 채팅의 실제 응답: 현재 turnKey가 제공되지 않아 학습 저장하지 않음. 문서 작성 허용과 학습 저장 권한/시작 사건을 구분.
- 동일 원인으로 재전송하거나 시작 식별자를 만들거나 빌리지 않음. 신규 업무의 학습 저장 및 이후 공유 재사용 검증은 완료하지 못함.
- 이 경로의 최초 호스트 누락 지점은 확정하지 않음. 직접 입력 경로와 채팅 전송 경로를 혼동하지 않음.

## 판정과 보존
- Desktop 최신 정본 연결: 확인. 반복 재시작이나 재설치 요구 없음.
- 영역 공유 활성화: 확인. 서로 다른 프로젝트의 신규 학습 저장→반환→적용: 미확인.
- 에이전트 생성/개선/켜기/끄기와 장기 개선 효과: 이번 검증에서 미실행/미확인.
- 진단 자체를 성공 업무 경험으로 학습시키지 않음. 전체 요청의 검증 결과는 unverified로 종료하며 성공 교훈을 만들지 않음.
- 전체 시험은 변경 없는 상태에서 반복하지 않음. 기존 CLI setup refresh 오류를 재시도하거나 never 승인 정책을 우회하지 않음.
- 프로젝트 코드·기존 산출물·설정·개인 기억 보존. 예약 작업 생성 없음.