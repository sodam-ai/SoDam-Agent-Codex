# 에이전트 관리 / Agent management

현재 프로젝트에서 SoDam이 생성한 에이전트와 대기 후보를 조회합니다. 다른 프로젝트의 비공개 기록이나 Codex 자체 에이전트는 이 목록에 포함하지 않습니다.

Lists SoDam-generated agents and pending candidates in the current project. Other projects' private records and host-managed Codex agents are outside this registry.

## 조회 / View

`node plugins/autonomy-team/runtime/cli.mjs agent-list PROJECT_PATH`

검색 JSON: `{"query":"docs"}`. 상세 JSON: `{"name":"docs-review-v1"}`. 마지막 인수로 프로젝트 내부 JSON 파일의 상대 경로를 지정합니다. 역할, 상태, 파일 크기, 기록된 사용, 관련 경험, 보호 이유와 이전 버전을 표시합니다. 기록에 없는 사용은 집계하지 않습니다.

Search JSON: `{"query":"docs"}`. Detail JSON: `{"name":"docs-review-v1"}`. Pass the project-relative request file as the last argument. Reports kind, status, file bytes, recorded uses, linked experiences, protection reasons and previous version. Unrecorded use is not counted.

## 변경 / Change

1. `agent-preview PROJECT_PATH request.json`: 요청은 `{"name":"docs-review-v1","action":"disable"}`입니다.
2. 대상·영향·차단 사유를 읽고 승인합니다. 외부 의존 관계는 미확인이므로 직접 확인해야 합니다.
3. `agent-manage PROJECT_PATH consent.json`: 정확한 name/action, 미리보기 snapshot, `authorize:true`를 전달합니다. 끄기·보관은 `externalImpactAcknowledged:true`도 필요합니다.

1. `agent-preview PROJECT_PATH request.json` with `{"name":"docs-review-v1","action":"disable"}`.
2. Review target, impact and blockers before consent. External dependencies are unknown and require owner review.
3. `agent-manage PROJECT_PATH consent.json` with exact name/action, preview snapshot and `authorize:true`. Disable/archive also require `externalImpactAcknowledged:true`.

지원 작업: protect(보호), unprotect(보호 해제), disable(끄기), enable(직접 끈 상태 복구), archive(끄거나 교체된 버전 보관), restore(보관 전 상태 복구). 실행 중·보호 지정·보안/복구 역할·활성 버전이 의존하는 항목은 끄기와 보관을 차단합니다. 매 변경 전에 상태와 원본을 백업하고 다시 읽어 확인합니다. 미리보기 이후 상태가 달라지면 재검토해야 합니다.

Actions: protect, unprotect, disable, enable, archive and restore. Running, protected, security/recovery roles and active version dependencies block disable/archive. Every change saves and rereads a backup first. Changed previews require renewed review.

보관은 원본과 학습 기록을 그대로 유지하는 상태 변경입니다. 공간 확보나 한도 확대가 아닙니다. 통합·영구 삭제, PC 전체 자동 검색, 호스트 기본 에이전트 관리는 미구현입니다. 자동 정리는 수행하지 않습니다. 교체된 버전은 검토 대상으로 설명하지만 외부 영향이 확인되지 않은 항목을 안전한 삭제 대상으로 보장하지 않습니다.

Archive is a retained status change, not space reclamation or quota expansion. Merge, permanent deletion and host-agent management are not implemented. No automatic cleanup occurs. Superseded versions are review suggestions, not certified safe deletion targets.

## 여러 프로젝트 조회 / Selected-project catalog

`agent-catalog PROJECT_PATH catalog.json`을 사용합니다. 요청은 `{"projects":["조회할 프로젝트의 절대 경로","다른 프로젝트의 절대 경로"]}`입니다. 실제 조회할 폴더를 지정하고 각 프로젝트의 기존 승인을 유지합니다. 최대 20개를 조회하며 같은 폴더의 중복 지정은 거부합니다. 목록에는 프로젝트별 고유 식별자, 상태, 사용 기록 수, 보호 사유와 추천 근거가 표시됩니다. 교훈 원문·백업 내용은 반환하지 않습니다. 실패한 프로젝트는 미확인으로 표시하고 나머지 결과를 구분합니다. PC 전체를 자동 검색하거나 새 승인을 만들지 않습니다.

Use `agent-catalog PROJECT_PATH catalog.json` with `{"projects":["absolute project path","another absolute project path"]}`. Select actual folders and retain their existing authorization. At most 20 projects are accepted; duplicate folders are rejected. Results show project-specific identity, status, recorded use counts, protection reasons and assessment evidence. Lesson bodies and backup contents are omitted. Failed projects are marked unverified separately. This does not crawl the PC or create authorization.

## 추천과 저장량 / Assessments and storage

추천 근거는 보호·진행 중 사용·검증된 사용·실패·확정된 후속 버전을 함께 보여줍니다. 사용이 기록되지 않았다는 이유만으로 쓸모없다고 판단하지 않습니다. 고유 기능과 외부 의존 관계는 확인할 수 없으면 미확인으로 남깁니다. 추천은 검토 안내이며 자동 변경이나 안전한 삭제 보장이 아닙니다.

Assessments report protection, current use, verified uses, failures and confirmed successors together. Missing recorded use is not proof of no value. Unique capability and external dependencies remain unknown when not verified. Suggestions invite review; they do not authorize changes or certify safe deletion.

`capacity`는 기존 한도와 함께 역할 파일·관리 백업·기타 관리 파일·자동 보관 학습 이력의 실제 바이트 수를 표시합니다. 임의 위치에 만든 외부 보관 파일과 디스크 여유 공간은 측정하지 않습니다. 백업도 공간을 사용하며 자동 삭제하지 않습니다. 보관은 0바이트 확보, `continue`는 검증한 백업 후 승인 범위 안의 한도 조정입니다. 둘을 디스크 공간 정리로 설명하지 않습니다. 기존 지속 운영의 기록 보관은 원본을 별도 이력에 보존하며 현재 기록 공간을 관리합니다. 에이전트 수 한도와 물리적인 디스크 공간 문제를 모두 해소하는 기능은 아닙니다. 실제 공간 회수와 개별 에이전트 영구 삭제는 지원하지 않습니다.

`capacity` adds measured bytes for role files, management backups, other managed files and automatically archived learning history to existing quota information. Arbitrary external archives and disk free space are not measured. Backups consume space and are not automatically deleted. Archive frees zero bytes; `continue` adjusts quotas within authorized bounds after verified backup. Neither reclaims disk space. Existing persistent-operation retention preserves records in separate history while managing the active registry. It does not resolve both role-count limits and physical disk exhaustion. Physical reclamation and permanent per-agent deletion are unsupported.

사용 횟수는 현재 기록에 남아 있는 사용만 집계합니다. 별도 보관 이력의 사용은 합산하지 않으므로 전체 기간의 사용 횟수로 해석하지 마세요.

Use counts include only entries retained in the active registry. Separately archived history is not aggregated; these are not lifetime totals.

쉽게 요청하려면 “지정한 두 프로젝트의 에이전트 목록과 보호 이유를 보여줘”, “이 에이전트의 사용 기록과 정리 추천 근거를 설명해”, “백업까지 포함한 저장량과 가능한 조치를 알려줘”라고 말하세요. 변경은 기존 미리보기·대상별 승인 절차를 그대로 따릅니다.

Ask “Show agents and protection reasons in these two selected projects”, “Explain this agent's recorded use and assessment”, or “Report storage including backups and available options.” Changes still follow the existing preview and target-specific consent procedure.

## 자연어 / Natural language

저장 중단 기록이 남아 있으면 추가 변경을 차단합니다. `.sodam-agent/agent-management-pending.json`의 백업 경로와 해시를 먼저 검토하고, `agent-recover PROJECT_PATH recovery.json`에 `{"authorize":true,"backupSha256":"검토한 백업 해시"}`를 전달하여 변경 전 상태로 복구합니다. 백업 원문에는 프로젝트 기록이 있으므로 외부에 게시하지 마세요. 복구가 실패하면 기록을 지우거나 잠금을 강제로 해제하지 않습니다.

An interrupted-write record blocks further mutations. Review the backup path and hash in `.sodam-agent/agent-management-pending.json`, then use `agent-recover PROJECT_PATH recovery.json` with `{"authorize":true,"backupSha256":"reviewed backup hash"}` to restore the pre-change state. Backups contain private project records; do not publish them. Do not delete recovery records or force-unlock after recovery failure.

“이 프로젝트의 소담 에이전트 목록을 보여줘” 또는 “이 에이전트를 끄기 전에 영향부터 보여줘”라고 요청할 수 있습니다. `/sodam-agent`가 호스트에 등록된 명령이라고 보장하지 않습니다. 안내 스킬은 설치본 업데이트 및 호스트 재로딩 후 반영됩니다.

Ask “Show this project's SoDam agent list” or “Preview the impact before disabling this agent.” `/sodam-agent` is not claimed as a registered host command. Skill guidance requires installation update and host reload.
