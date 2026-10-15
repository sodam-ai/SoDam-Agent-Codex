# 공통 에이전트 / Common agents

## 한국어

공통 에이전트는 같은 PC 사용자에게 속합니다. 새 채팅·다른 프로젝트·다른 업무 종류에서도 관련 역량과 적용 조건이 맞으면 같은 이름·파일·버전을 선택합니다. 모든 역할을 모든 업무에 무조건 적용하지 않습니다. 여러 PC 사이의 자동 동기화는 제공하지 않습니다.

공통 자동 운영의 `commonAgents:true`로 사용합니다. 기존 설정에서 이 항목이 없으면 이전 방식이 유지됩니다. 기존 에이전트와 기록을 삭제하거나 자동 이전하지 않습니다. 공통 설정을 끄면 선택을 중지하고 파일은 보존합니다. 실제 호스트 시작 훅과 파일 권한도 필요합니다.

저장 위치는 사용자 홈의 `.sodam-agent-automatic/agents/registry.json`과 `agents/roles/이름/SKILL.md`입니다. 설치 캐시 갱신으로 이 저장소를 덮어쓰지 않습니다. 도구가 반환하는 `.sodam-agent/common-roles/이름/SKILL.md`는 컨트롤러가 공통 실제 파일로 해석하는 경로입니다. 프로젝트 내부 증거로 제출할 수 없습니다.

검증된 비공개 자료 없는 절차만 공통 역할로 만듭니다. 원문·결과 증거·실패 기록·생성 근거는 프로젝트에 보존합니다. 같은 역량의 후보 예약과 저장 잠금으로 중복 생성을 막습니다. 잠금 오류를 강제로 해제하지 않습니다. 역할 생성은 필요성과 기존 역할 검토를 통과해야 하며, 호출 횟수만으로 생성하지 않습니다.

개선 후보는 먼저 시험 적용합니다. 별도 두 과제에서 같은 품질 기준의 이전 결과와 비교해야 확정합니다. 결과가 나쁘면 이전 역할로 되돌립니다. 다른 프로젝트가 사용 중이면 교체·되돌리기를 차단하여 진행 중인 업무를 보존합니다. 차단은 완료가 아니며 사용 종료 후 다시 판단해야 합니다.

목록·상세는 `agent-list`, 영향 미리보기는 `agent-preview`, 승인된 변경은 `agent-manage`로 조회합니다. 자연어로 목록을 요청할 수도 있습니다. 보호·보호 해제·끄기·켜기·보관·복구가 가능하며, 공통 역할 변경은 연결된 프로젝트 전체에 영향을 줍니다. 미리보기의 최신 snapshot과 대상별 승인 및 확인된 백업이 필요합니다. 사용 중인 항목과 중요한 항목을 임의로 정리하지 않습니다. 보관은 삭제가 아니며 확보 공간은 0바이트입니다. 설치된 외부 에이전트까지 모두 관리하는 기능은 아닙니다.

`node test/common-registry.mjs`는 분리된 임시 사용자 홈과 프로젝트에서 검사합니다. 전체 검사는 `npm test`, 구조 검사는 `npm run validate`입니다. 이 시험은 실제 Desktop 새 채팅 자동 작동이나 장기 업무 개선의 증명이 아닙니다. 설치 반영·재연결·실제 업무 확인은 별도입니다. 예약 작업은 사용하지 않습니다.

### 승인된 프로젝트 사이의 비교 평가

절차 공유가 승인된 다른 프로젝트의 `eval-` 평가 과제도 공통 역할의 비교 평가에 사용합니다. 각 프로젝트의 이전 결과와 시험 결과, 원본 해시, 동일 품질 기준, 절차 실행 증거를 확인합니다. 서로 다른 두 과제가 필요합니다. 개인 원문과 작업 기록을 공통 저장소로 복사하지 않습니다. 읽기 실패나 검사 범위 초과는 확정을 보류하고, 환경 오류는 역할 부족으로 판단하지 않습니다.

학습 종료의 `review-incomplete`는 저장 성공과 별개입니다. `nextActions`는 누락된 교훈 추출·역할 읽기·판단 근거 기록을 안내합니다. 안내 반환은 실제 수행 증명이 아닙니다.

## English

### Cross-project paired evaluation

Common roles can use `eval-` assessment tasks from other projects with approved procedure sharing. Each project must retain its own baseline, pilot output, matching quality criteria and procedure receipts. Two distinct tasks are required. Source hashes are rechecked; private output and experience records are not copied to common storage. Read failures or scan truncation defer confirmation. Environment errors do not establish a capability deficiency.

Learning completion may remain `review-incomplete` even after successful storage. `nextActions` identifies missing lesson extraction, role reads and decision evidence. Returning guidance does not prove its execution.


Common agents belong to the same PC user. New chats, different projects and different task kinds select the same identity, file and version when capability and applicability match. Roles are not applied indiscriminately. Automatic multi-PC synchronization is not provided.

Enable through `commonAgents:true` in the persistent profile. An absent flag retains legacy behavior. Existing roles and records are neither deleted nor silently migrated. Disabling the profile stops selection while retaining files. Actual trusted host start hooks and file permissions are also required.

Storage uses `.sodam-agent-automatic/agents/registry.json` and `agents/roles/name/SKILL.md` under the user home, outside the installation cache. The controller resolves returned `.sodam-agent/common-roles/name/SKILL.md` paths to these actual files. Such paths cannot serve as project output evidence.

Only reviewed private-data-free procedures become common roles. Original outputs, evidence, failures and generation basis remain in the project. Capability reservations and storage locks prevent duplicate generation. Never force-unlock a failed operation. Generation requires need and existing-role review, not invocation counts.

Improvements start as pilots. Confirmation requires two separate tasks compared with prior results under identical quality criteria. Regressions restore the predecessor. Replacement and rollback are blocked while another project uses the role, preserving ongoing work. A blocked action is incomplete and must be reconsidered after use ends.

Use `agent-list` for inventory/details, `agent-preview` for impact and `agent-manage` for approved changes, or request the inventory in natural language. Protect/unprotect/disable/enable/archive/restore are supported. Common-role changes affect all connected projects. A current preview snapshot, action-specific consent and verified backup are required. Important or in-use items are not arbitrarily cleaned up. Archive preserves data and frees zero bytes. Unmanaged installed host agents are outside controller ownership.

`node test/common-registry.mjs` tests isolated temporary homes and projects. Run `npm test` for regressions and `npm run validate` for structure. Fixtures do not prove actual Desktop new-chat execution or long-term improvement. Installation, reconnection and real work verification are separate. No scheduled jobs are used.

## 검토 누락 안내와 확정 후 실패 확인 / Review reminders and confirmed-role failures

다음 관련 업무의 management.pendingReviewSelection은 같은 분야·역량·문맥의 최근 닫힌 학습 요청 최대 24개에서 검토 누락을 안내합니다. 과거 기록을 수정하거나 검토 완료로 바꾸지 않으며 원문은 반환하지 않습니다. 문맥 태그의 순서는 무관합니다. truncated는 전체 조회 미완료이고, 안내 자체는 조치 실행 증거가 아닙니다. 공통 확정 역할은 공유가 승인된 프로젝트의 품질 실패도 확인하여 기존 보호·사용 중 잠금·복귀 규칙을 따릅니다. 환경 실패는 역량 부족으로 처리하지 않고, 조회 실패·범위 초과이면 추가 개선을 보류합니다.

At the next matching task, management.pendingReviewSelection reports missing reviews from at most 24 recent closed learning turns with the same kind, capability and normalized context. It does not rewrite historical results or return original task text. Tag order is irrelevant. Truncation means incomplete coverage; a reminder is not execution evidence. Confirmed common roles also check quality failures in projects authorized for procedure sharing and follow existing protection, in-use lock and rollback rules. Environment failures do not establish a capability deficiency. Failed or truncated reads defer further improvement.
