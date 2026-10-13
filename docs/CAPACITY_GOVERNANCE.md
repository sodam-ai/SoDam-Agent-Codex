# 한도 알림과 중요 자산 보호 / Capacity notices and preservation

Copyright 2026 SoDam AI Studio. Apache-2.0.

## 한국어

- 기록 개수, 에이전트·후보 보유 수, 훅 기록 개수, 개별 상태 파일 바이트 한도를 구분합니다. 실제 디스크 여유 공간과 동시에 실행하는 모델 수를 제어하는 기능은 아닙니다.
- 기본 알림은 80%, 95%, 한도 도달입니다. 같은 한도·같은 단계는 반복하지 않고 정상 범위로 내려갔다가 다시 도달하거나 한도가 변경되면 새로 알립니다. 실제 업무 시작 훅에서 점검하며 예약 작업은 없습니다.
- `capacity-review`는 읽기 전용입니다. 사용자가 보호한 에이전트, 실행 중인 에이전트, 보안·복구 역할을 표시합니다. 중요도·프로젝트 간 의존 관계가 확인되지 않은 모든 역할은 보존합니다. 빈 정리 후보 목록은 오류가 아니라 근거 부족으로 인한 보호입니다.
- `capacity-rules`는 해당 프로젝트의 명시적 설정입니다. 입력 파일은 `{authorize:true,rules:{schema:1,warningPercent:80,criticalPercent:95,protectedAgents:["core-role"]}}`입니다. 프로젝트별 보호 목록이며 다른 프로젝트 권한을 만들지 않습니다.
- 저장 한도에 도달해도 등록된 업무의 종료를 무한 재시도하지 않습니다. `recorded:false`, `learningStored:false`를 반환하고 해당 요청을 종료합니다. 저장하지 못한 교훈을 저장 완료로 표시하지 않습니다. 기존 기록·역할을 덮어쓰지 않습니다.
- 에이전트 보유 한도는 신규 생성을 제한하며 기존 유효 역할 선택을 막지 않습니다. 동시 실행은 기존 작업공간 잠금과 실제 호스트 권한을 따릅니다.
- 삭제·통합·비활성화는 이 기능이 실행하지 않습니다. 대상·영향·최신 상태 해시·검증된 백업을 확인하고 별도 구체적 승인이 필요합니다. 자동 한도 확대도 하지 않습니다.
- 기존 종료 기록 보관·복구 기능은 별도입니다. 모든 과거 교훈의 자동 검색, 임의 에이전트의 중요도 자동 인증, 모든 호스트의 경고 표시를 보장하지 않습니다. 훅 기록 자체가 꽉 차거나 상태 파일·디스크가 부족하면 등록·쓰기는 제한될 수 있으며 일반 업무는 학습 없이 진행하고 이를 알려야 합니다.

실제 설치 위치의 CLI로 실행합니다:

```text
node runtime/cli.mjs capacity-review PROJECT
node runtime/cli.mjs capacity-rules PROJECT request.json
```

## English

- Experience count, stored roles/candidates, hook records and individual state-file bytes are separate limits. They are not free-disk monitoring or a concurrent model scheduler.
- Default notices occur at 80%, 95% and the limit. Equal stages are deduplicated; a return to normal or changed limit starts a new notification cycle. Start hooks inspect capacity without scheduled jobs.
- `capacity-review` is read-only. User-protected, in-use and safety/recovery roles are identified. Every role with uncertified importance or cross-project dependencies is preserved; an empty cleanup list means insufficient evidence.
- `capacity-rules` explicitly configures one project using `{authorize:true,rules:{schema:1,warningPercent:80,criticalPercent:95,protectedAgents:["core-role"]}}`. It grants no permission in another project.
- A registered workflow can close at the experience limit with `recorded:false` and `learningStored:false`, without an endless finish retry or a false saved-lesson claim. Existing records and roles remain intact.
- The role count limits new creation, not selection of existing valid roles. Workspace locks and host permissions still govern execution.
- This feature never deletes, merges, disables or expands limits. Such changes require specific approval, a fresh state hash and a verified backup.
- Existing terminal-history archival/recovery is separate. Full historical recall, automatic importance certification and visible warnings on every host remain unverified. Full hook journals, state files or disks can restrict registration/writes; ordinary work must report unavailable learning rather than claim success.

Use the installed CLI with the two commands above. Technical fixture checks do not establish long-term improvement or Desktop delivery.
