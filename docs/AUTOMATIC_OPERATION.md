# 기간 만료 없는 자동 운영 / Persistent automatic operation

Copyright 2026 SoDam AI Studio. Apache-2.0.

## 한국어

### 눈에 보이는 상태 표시

일반 답변에서 페르소나 다음 줄에 `[소담 에이전트: 활성 · 자동 학습 켜짐 · 에이전트 자동 시험 적용 켜짐]`처럼 표시합니다. 진단에 따라 비활성(승인 없음·만료·공통 설정 꺼짐), 대기(잠금), 제한(저장 한도), 미확인(연결·정책 오류)을 구분합니다. 활성은 정책과 한도가 유효하다는 뜻이며 실제 역할 실행이나 개선 효과의 증거는 아닙니다.

요청 시작 등록과 dispatch 후 업무 시작, finish 후 검증된 교훈 저장을 구분합니다. 조회된 교훈은 `관련 교훈 반환 N건 · 적용 미확인`으로 표시합니다. 단순 반환을 실제 적용으로 바꾸지 않습니다. JSON·코드 전용 요청에서는 요청 형식이 우선합니다. 이 기능은 훅 문맥을 받은 모델의 답변 상태줄이며 Codex 앱 자체의 고정 배지는 아닙니다. 실제 Desktop 표시와 설치본 반영은 코드 시험과 별도입니다. 훅 실패 응답을 호스트가 받지 못하면 읽기 전용 diagnose/inspect_runtime의 display.marker를 확인합니다.

새 프로젝트마다 학습 활성화를 요청하는 불편을 줄이기 위해 PC 사용자별 공통 설정을 추가했습니다. 한 번 명시적으로 켜면 새 작업공간의 SessionStart 또는 UserPromptSubmit 훅이 프로젝트 상태를 만들고, 이후 새 채팅에서도 사용합니다. 승인 기간은 없습니다. 사용자가 끄면 자동 운영이 중지됩니다. 파일 작업 권한이나 호스트가 전달하지 않은 시작 이벤트를 이 설정으로 우회할 수는 없습니다.

기존 프로젝트와 영역은 자동으로 이전하지 않습니다. 공통 끄기는 기존 기간제 정책에도 적용됩니다. 독립 프로젝트는 `automatic-adopt`로 기간 없는 설정에 이전하고 `automatic-restore`로 백업한 기간제 정책을 복구할 수 있습니다. 같은 이전·복구 요청은 중복 기록을 만들지 않습니다. 기존 기록을 보존합니다.

승인된 영역은 `{ "authorize":true, "areaId":"진단에서 확인한 실제 식별자", "enabled":true }` 요청 파일을 `area-persistent "영역 절대 경로" "요청 파일 상대 경로"`에 전달해 기간 없는 운영으로 전환합니다. 기존 영역 등록·제외 경로·공유 동의·한도·철회 상태는 보존하고 별도 설정만 저장합니다. 철회된 영역은 전환할 수 없습니다. 끄면 원래 기간이 다시 적용되며, 전환 후 새로 연결된 프로젝트의 기간 없는 정책은 비활성화됩니다.

### 한 번 설정하기

기존 독립 프로젝트의 기간제 설정은 공통 설정을 켠 뒤 `automatic-adopt`로 이전할 수 있습니다. 프로젝트 안에 `automatic-adopt.json`을 `{"authorize":true}`로 작성하고 `node "설치 위치/runtime/cli.mjs" automatic-adopt "프로젝트 절대 경로" automatic-adopt.json`을 실행합니다. 기존 경험·교훈·역할을 보존하고, 이전 정책을 `.sodam-agent/previous-period-policy.json`에 보관합니다. 자동 시험 적용은 공통 설정과 기존 선택이 모두 켜져야 유지됩니다. 영역 승인 정책은 이 명령으로 바꾸지 않습니다. 기존 한도가 공통 한도보다 큰 프로젝트는 거부합니다. 실제 설정 변경은 해당 이전을 명시적으로 허용한 경우에만 실행합니다.

이 절차는 공통 자동 운영과 후보 역할의 자동 시험 적용을 명시적으로 허용한 뒤 실행합니다. 현재 프로젝트에 `automatic-enable.json` 파일을 다음 내용으로 만듭니다.

```json
{"authorize":true,"enabled":true,"autoPilot":true,"maxAgents":8,"maxExperiences":200,"maxRetries":1}
```

실제 설치된 autonomy-team의 CLI 경로를 사용합니다. 아래 경로는 자리표시자입니다.

```powershell
node "설치 위치/runtime/cli.mjs" automatic-configure "현재 프로젝트 절대 경로" automatic-enable.json
node "설치 위치/runtime/cli.mjs" automatic-inspect
node "설치 위치/runtime/cli.mjs" diagnose "업무 프로젝트 절대 경로"
```

공통 설정은 현재 PC 사용자의 홈 폴더 아래 `.sodam-agent-automatic/policy.json`에 저장됩니다. 다른 PC로 개인 승인 파일을 복사하지 않습니다. 설치본은 이 코드를 포함해야 하며 이전 MCP 프로세스는 자동으로 새 코드로 바뀌지 않습니다. 시작 훅의 실제 실행도 확인해야 합니다.

### 끄기와 다시 켜기

프로젝트 안에 `automatic-disable.json`을 `{"authorize":true,"enabled":false}`로 작성하고 같은 `automatic-configure` 명령에 전달합니다. 다시 켤 때는 enable 파일을 사용합니다. 기록과 식별자를 보존하며, 기존 기간제 프로젝트·영역을 포함해 다음 정책 검사부터 자동 운영이 중지됩니다.

### 제한과 검증

- 만료가 없다는 뜻은 무제한 실행이 아닙니다. 프로젝트당 경험 200건·역할 8개·재시도 1회가 위 예제의 한도입니다. 최대 허용치는 경험 1000건·역할 20개·재시도 2회입니다. 한도에 도달하면 기존 보관·정리 절차를 사용하고 기록을 임의 삭제하지 않습니다.
- 새 역할은 시험 적용 후 근거를 평가합니다. 성공을 추정하거나 모델 가중치를 재학습하는 기능이 아닙니다.
- 프로젝트 간 원문·개인정보·고객 자료를 공유하지 않습니다. 검수된 일반 절차의 프로젝트 간 공유는 기존 영역별 별도 동의를 따릅니다. 이 공통 설정은 공유를 켜지 않습니다.
- 보호 폴더·드라이브 루트·홈 루트·연결 폴더·변조된 설정은 거부합니다. 공통 설정 변경으로 한도를 줄이면 더 큰 한도의 기존 파생 정책은 검토가 필요합니다.
- `test/automatic.mjs`는 격리된 홈 폴더에서 두 프로젝트·새 세션·끄기/켜기·철회 우선·위치 연결·잘못된 입력·읽기 전용 진단을 검사합니다. 실제 Desktop의 모든 새 채팅 작동과 장기 품질 개선은 별도 확인 항목입니다.
- 이번 개발 검증은 실제 사용자의 공통 설정을 활성화하지 않았습니다. 설치본 반영·실제 활성화와 코드 시험 통과를 구분합니다. 예약 작업은 사용하지 않습니다.

## English

완료 기록 보관: 지속 모드는 시작 이벤트에서 한도에 도달한 완료 기록을 `.sodam-agent-history/`에 해시 검증 후 보관합니다. 미완료 업무·실패·역할 평가 근거·최근 절차를 유지합니다. 중단된 교체는 다음 이벤트에서 복구하고, 보관한 시작 식별자의 재실행을 거부합니다. 최대 128묶음·식별자 32,768개·묶음당 4MB이며, 보호 기록이나 영역 변경 한도가 차면 중지합니다. 모든 과거 교훈을 검색하는 기능은 아닙니다. 예약 작업은 없습니다.

Terminal history retention: persistent mode archives eligible completed history to `.sodam-agent-history/` after hash verification at start events. Unfinished work, failures, role evidence and recent procedures remain active. Interrupted replacement recovers at the next event; archived start identifiers cannot replay. Limits are 128 batches, 32,768 identifiers and 4MB per batch. Protected history or area mutation limits can still stop operation. This is not retrieval of every historical lesson. No scheduler is used.

### Visible status

Ordinary replies show a line after the persona, such as `[소담 에이전트: 활성 · 자동 학습 켜짐 · 에이전트 자동 시험 적용 켜짐]`. Diagnosis distinguishes inactive (missing/expired approval or disabled global profile), waiting (lock), limited (storage budget), and unverified (connection/policy error). Active means policy and capacity permit work, not proof of role execution or improvement.

Request registration, dispatched work and verified lesson storage have separate labels. Retrieved lessons show a count with application unverified; retrieval alone never establishes application. JSON/code-only output requests prevail. This is a model-response status line supplied through hook context, not a fixed Codex application badge. Installed-code synchronization and actual Desktop rendering remain separate from technical tests. When the host cannot deliver failed hook output, use read-only diagnose/inspect_runtime display.marker.

A per-user persistent profile reduces repeated learning activation in new projects. Once explicitly enabled, SessionStart or UserPromptSubmit hooks create project state in new workspaces, reused by later chats. There is no expiry. Switching it off stops automatic operation. It cannot bypass file permissions or synthesize missing host start events.

Existing projects and areas are not silently migrated. Global off also stops existing finite policies. `automatic-adopt` migrates independent projects; `automatic-restore` restores the backed-up finite policy. Repeated requests are idempotent and records are preserved.

For an approved area, pass a request file containing `{ "authorize":true, "areaId":"actual identifier from diagnosis", "enabled":true }` to `area-persistent "absolute area path" "relative request file"`. A separate setting preserves the original registry, exclusions, sharing consent, limits and revocation. Revoked areas cannot migrate. Disabling restores the original expiry; null-expiry policies created after migration become inactive.

### Configure once

After enabling the global profile, migrate an independent finite project policy using `automatic-adopt`. Create `automatic-adopt.json` containing `{"authorize":true}`, then run `node "installed path/runtime/cli.mjs" automatic-adopt "absolute project path" automatic-adopt.json`. Experiences, lessons and roles are preserved. Pilots remain enabled only when both the global profile and previous choice allow them. The previous policy is backed up at `.sodam-agent/previous-period-policy.json`. Area policies are not migrated. Project limits exceeding global limits are rejected. Run only with explicit migration authorization.

Run only after explicit permission for persistent automatic operation and role pilots. Create `automatic-enable.json` in the current project with the JSON shown above. Use the actual installed autonomy-team CLI path; the following path is a placeholder.

```powershell
node "installed path/runtime/cli.mjs" automatic-configure "absolute current project path" automatic-enable.json
node "installed path/runtime/cli.mjs" automatic-inspect
node "installed path/runtime/cli.mjs" diagnose "absolute work project path"
```

The profile is stored at `.sodam-agent-automatic/policy.json` under the current PC user's home. Do not copy personal authorization between PCs. Installed files must include this implementation; an existing MCP process does not automatically reload code. Verify actual start-hook execution separately.

### Disable and re-enable

Create `automatic-disable.json` in the project with `{"authorize":true,"enabled":false}` and pass it to `automatic-configure`. Re-enable using the enable file. Records and identity are preserved. Existing finite projects and areas also stop at their next policy check.

### Limits and verification

- No expiry does not mean unlimited execution. The example allows 200 experiences, eight roles and one retry per project. Maximum values are 1000 experiences, 20 roles and two retries. Use existing archive/maintenance procedures at capacity; never silently delete records.
- Generated roles enter pilots and require evidence evaluation. This does not infer success or retrain model weights.
- Raw project contents, personal information and customer data are not shared. Reviewed portable procedures retain existing separate area-sharing consent. This profile does not enable sharing.
- Protected directories, drive/home roots, linked paths and malformed profiles are rejected. Lower global limits require review of derived policies with larger limits.
- `test/automatic.mjs` uses an isolated home to check two projects, new sessions, off/on, revocation precedence, workspace binding, invalid input and read-only diagnosis. Universal Desktop delivery and long-term improvement remain separate checks.
- Development tests did not enable the real user's profile. Installed-code synchronization and actual activation are separate from passing code tests. No scheduled job is used.
