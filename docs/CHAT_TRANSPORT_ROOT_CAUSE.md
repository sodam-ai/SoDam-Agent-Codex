# 채팅 전송 시작 누락의 원인 분석과 호스트 대응
검사일: 2026-10-11. SoDam Autonomy Team 0.3.9.
## 결과
직접 입력의 기존 학습 저장·후속 반환·적용 증거는 유지한다. 채팅 전송 자동 학습은 미해결이다.
이번에 같은 버전의 공개 Codex 소스에서 입력별 시작 훅 제외 분기를 확인했다. 관측된 전송 입력이 ResponseItem인 점과 일치한다. 플러그인 설치나 재시작을 반복하는 것으로 이 분기를 변경할 수 없다.
## 근거와 확신의 범위
실행 중 프로세스 경로에는 app-server-daemon 0.162.1과 Desktop 번들 Codex가 함께 존재한다. 번들 실행 파일의 --version은 0.162.0-alpha.17.2였다. 버전 조회는 종료 코드 0이었지만 샌드박스의 임시 PATH 별칭 정리 권한 경고가 있었다. 계정·권한·설정을 변경하지 않았다.
이 두 버전의 공개 hook_runtime.rs의 inspect_pending_input에서 UserInput은 UserPromptSubmit을 호출하고 ResponseItem 및 FunctionCallOutput은 추가 문맥 없이 반환한다. InterAgentCommunication도 이 시작 훅을 호출하지 않는다.
이는 공개 코드 분기의 직접 증거다. 해당 바이너리가 공개 소스와 완전히 동일한 빌드라는 증명이나 비공개 Desktop 전송 구현의 코드 검수는 아니다. 실제 전송 입력 유형과 시작 누락 재현을 함께 고려하면 훅 호출 이전의 호스트 입력 분기가 관측 현상을 설명하는 강한 근거다. 개발자의 설계 의도는 단정하지 않는다.
## SoDam 처리와 수정 판단
정본 hooks/entry.mjs는 시작 수신·경로 결정·처리 완료와 실패 단계를 진단한다. runtime/bridge.mjs는 실제 session_id와 turn_id로 키를 계산하고 UserPromptSubmit에서만 시작을 등록한다. 등록 없는 다른 도구 사건이나 전달 문구는 시작으로 인정하지 않는다.
현재 증거에는 유효한 시작 사건을 SoDam이 수신한 뒤 잃어버린 반례가 없다. 실행 코드를 임의 변경하지 않는다. 기존 학습과 사용자 설정도 보존한다. 전달 문구·이전 업무 키·모델이 만든 키로 등록하거나 PostToolUse/Stop을 소급 시작으로 바꾸지 않는다.
현재 MCP의 소스는 current이며 D 테스트 프로젝트 승인은 valid, connectionRequired=false였다. 이번 문서 변경은 실행 소스 갱신이 아니므로 재설치·재연결이 필요하지 않다.
## 호스트 측 해결 요구
채팅 전송 도구가 사용자의 명시적 전송 승인을 보존하면서 수신 업무를 신뢰된 시작 사건으로 전달하거나, 별도로 문서화된 위임 업무 시작 훅을 제공해야 한다. 업무의 session_id·turn_id·대상 작업 영역과 입력 출처를 연결하고 중복·동시 실행·중단을 처리해야 한다. 모든 ResponseItem을 무조건 사용자 입력으로 바꾸면 도구 결과와 시스템 문맥도 실행할 위험이 있으므로 그러한 일반 변경은 요구하지 않는다.
공식 app-server의 turn/start는 사용자 입력으로 업무를 시작하는 인터페이스다. 이것만으로 현재 Desktop send_message_to_thread의 전달 경로를 바꿀 수 있다는 뜻은 아니다. 이번에 임의 app-server 연결·인증 접근·별도 서버 실행·요청 주입은 하지 않았다. 제공된 연결 도구에는 전송 입력 유형이나 훅 발생을 지정하는 인자가 없다.
## 실행 가능한 대응
일반적인 새 채팅 업무는 승인된 작업 영역에서 직접 입력으로 진행한다. 이미 확인한 학습 흐름을 사용하되 모든 미래 채팅의 무오류를 보장하지 않는다. 전송으로 파일 업무가 완료돼도 신규 학습이 없으면 구분해 보고한다.
호스트 지원 요청에는 버전, 입력 종류, 최소 재현, 기대한 시작 등록, 실제 누락, 회귀 기준만 담는다. 고객 자료·원문 요청·로그·비밀값은 넣지 않는다. 외부 지원팀 전송은 별도의 명시 승인이 필요하다. 아래 정보는 지원 요청 준비본이며 발송하지 않았다.
재현: 승인된 프로젝트에 연결된 유휴 채팅에 도구로 실제 문서 업무를 전송한다. 파일 저장은 성공하지만 신규 UserPromptSubmit 키와 dispatch가 없음을 확인한다. 같은 프로젝트의 직접 입력에서는 시작과 학습 기록이 존재한다. 과거 업무의 자기 재전송 혼입은 직접 입력 전체의 보장으로 쓰지 않는다.
## 수정 후 완료 조건과 현재 미실행
호스트가 실제 시작 사건을 지원하거나 SoDam 수신 결함이 새로 재현돼 수정된 경우에만 전송 실제 업무와 별도 후속 업무를 재시험한다. 실제 키·dispatch·검수한 교훈 저장·후속 반환·출처 해시·산출물 적용이 모두 필요하다.
호스트 코드 수정과 전송 경로의 해결 후 실제 검증은 미실행이다. 해결 전 같은 전송을 반복해 신규 학습을 주장하지 않는다. 장기 개선·역할 생성 효과는 실제 업무 누적으로 판단한다. 예약 작업·상시 데몬·승인 확대는 하지 않는다.
## 공식 근거
- [Codex 공개 소스 0.162.0-alpha.17.2](https://github.com/openai/codex/blob/rust-v0.162.0-alpha.17.2/codex-rs/core/src/hook_runtime.rs#L643-L680)
- [Codex 공개 소스 0.162.1](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/core/src/hook_runtime.rs#L643-L680)
- [공식 훅 설명](https://learn.chatgpt.com/docs/hooks#userpromptsubmit)
- [공식 app-server 실행 주기](https://learn.chatgpt.com/docs/app-server#lifecycle-overview)
영문: [CHAT_TRANSPORT_ROOT_CAUSE_EN.md](CHAT_TRANSPORT_ROOT_CAUSE_EN.md).