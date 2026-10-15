# 작업 기록 확인 안내 / Workflow feedback

소담 에이전트 기록·학습 기능의 설정이 켜져 있어도 요청별 실제 저장은 별도로 확인해야 합니다. ‘작업 기록 확인 중 · 학습 저장 미확인’은 AI가 빠진 시작 또는 종료 기록을 확인한다는 뜻입니다. 사용자가 명령을 입력할 필요는 없습니다. 완료 전에 실제 결과와 파일 증거를 검수하며 저장 실패를 성공으로 표시하지 않습니다.

Enabling the recording and learning feature does not prove that an individual request was saved. The Korean status means that the assistant is checking a missing start or finish record. The user does not need to enter a command. Actual output and artifact evidence must be reviewed before completion; a failed save is never reported as success.

종료 훅은 한 번만 후속 확인을 요청합니다. 이미 시작된 작업에는 시작을 다시 등록하라고 안내하지 않습니다. 같은 세션에서 원래 후속 문구 전체가 일치할 때만 원본 요청에 연결합니다. 호스트의 hook_prompt 포장도 이 조건에서 처리하며, 다른 세션·일부 인용·변경된 문구·중단된 요청에는 연결하지 않습니다. 이전 버전의 정확한 자체 문구도 호환하지만 과거 미완료 요청을 자동 재생하지 않습니다.

The stop hook permits one follow-up only. A dispatched request is asked to finish rather than dispatch again. Only the complete owned feedback in the same session can resume its original request, including the host's hook_prompt wrapper. Other sessions, partial quotations, altered messages and interrupted requests cannot resume it. Exact legacy feedback remains compatible; historical incomplete requests are not replayed automatically.

기록 누락은 곧바로 데이터 손실이나 전체 에이전트 고장을 뜻하지 않습니다. 훅은 모델 대신 업무 의미나 교훈의 타당성을 판단하지 않습니다. 실제 시작 등록·도구 실행·산출물 검사·종료 저장·교훈 재조회를 구분합니다. 설치 파일 변경과 실행 중 MCP 연결 갱신도 별개입니다. 예약 작업, 권한 확대, 기존 기록 삭제는 수행하지 않습니다.

A missing stage does not by itself prove data loss or total agent failure. Hooks cannot replace the model's task classification or semantic lesson review. Start registration, execution, artifact checks, finish storage and lesson readback remain distinct checks. Updating installed files does not reload an existing MCP process. No scheduler, permission expansion or history deletion is introduced.
