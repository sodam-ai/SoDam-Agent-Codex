# 채팅 간 전달 경로 확인 및 호스트 지원 재현 자료

확인일: 2026-10-11. 목적은 실제 전달 경로 구분과 안전한 수정 범위 판정이다. 전체 자동 학습 해결 완료 보고가 아니다.

## 현재 확인
- 최신 검증 채팅 전달 요청 하나의 실제 기록 항목을 읽기 전용으로 제한 확인했다. 해당 요청 구간에는 user 메시지 0개, codex_delegation을 담은 function_call_output 1개가 있었다. 본문과 개인 정보는 보고서에 복사하지 않았다.
- 공식 App Server 문서는 turn/start가 사용자 입력 또는 standalone tool output을 받을 수 있으며 도구 출력은 functionCallOutput으로 남는다고 설명한다. thread/inject_items는 사용자 turn을 시작하지 않는다. 이것은 공개 인터페이스의 차이이며 Desktop send_message_to_thread 내부 구현을 직접 확인한 것은 아니다.
- 공식 Hooks 문서는 UserPromptSubmit에 현재 turn_id와 사용자 prompt가 들어간다고 설명한다. 도구 출력마다 UserPromptSubmit이 실행된다는 보장은 확인하지 못했다. transcript_path 형식은 안정된 인터페이스가 아니므로 런타임 권한 판단이나 시작 등록 근거로 파싱하지 않는다.
- 현재 제공 도구에는 기존 Desktop의 turn/start, hook/started 알림 구독 또는 전달 방식 변경 기능이 없다. 별도 app-server 프로세스를 켜도 기존 Desktop 프로세스의 연결을 대신하는 증거가 되지 않으므로 실행하지 않았다.
- 현재 연결된 SoDam MCP sourceStatus=current, currentSourceMatchesStartup=true, 승인 valid, workEligible=true. 불필요한 재시작·재설치는 하지 않았다.

## 정본 보강과 검사
- test/bridge.mjs에 standalone delivery metadata and tool output cannot create a started workflow 검사를 추가했다.
- PostToolUse/Stop/Interrupt/미지원 이벤트는 시작 등록 없이 작업을 생성하지 않는다. 전송 성공 메타데이터나 본문의 요청문만으로 시작을 만들지 않는다. 다른 요청의 이벤트는 기존 기록을 바꾸지 않는다. 직접 입력 재전송은 중복 등록하지 않는다. 임의 key dispatch는 거부한다.
- node test/bridge.mjs: 26개 그룹 통과. npm run validate: plugins 12, skills 56, manifests 24 통과. npm test 전체 18개 시험 스크립트 통과(exit 0).
- 런타임 등록 조건·승인·설정은 유지했다. 수신 이벤트가 없다는 이유로 임의 ID 등록 또는 transcript 재생 기능을 추가하지 않았다.

## 호스트 지원 요청에 필요한 내용
1. 동일 승인 프로젝트와 동일 채팅에서 직접 사용자 입력은 UserPromptSubmit 문맥과 실제 등록을 제공하지만, send_message_to_thread 전달은 현재 turnKey가 없었다.
2. 전달 결과의 실제 항목 종류는 function_call_output이다. 메시지가 표시되거나 generation turn이 생겼다는 사실만으로 사용자 요청 훅 실행을 보장하지 않는다.
3. 확인 요청: 이 경로에서 사용자 요청 시작 훅이 의도적으로 제외되는지, 사용자 승인된 위임 작업용 신뢰된 시작 이벤트나 요청 식별자를 제공하는 공식 연결 지점이 있는지.
4. 공식 연결 지점이 있다면 승인 범위·현재 세션·현재 요청·중복 방지를 유지하는 SoDam 어댑터를 검토한다. 없다면 호스트 변경이 필요한 제한으로 분류한다.
5. 이 자료는 로컬에서 작성했다. 외부 지원 서비스에 자동 전송하거나 사용자 원문·로그·토큰을 첨부하지 않았다.

## 완료 기준과 남은 범위
직접 입력의 실제 학습 저장 및 후속 적용은 기존 실제 증거가 있다. 이번 요청은 반환된 기존 교훈의 입력 경로 구분과 계획/실제 완료 분리 원칙을 현재 분석에 적용했다. 채팅 간 전송의 신규 시작 등록·학습 저장·후속 재사용은 해결되지 않았다. 코드 시험으로 호스트 지원을 만들어낼 수 없다. 장기 효과는 실제 업무 누적 후 판단한다. 예약 작업은 만들지 않는다.

공식 근거:
- https://learn.chatgpt.com/docs/app-server
- https://learn.chatgpt.com/docs/hooks