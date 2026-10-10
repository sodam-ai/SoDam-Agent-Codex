# Porting evidence

- Source: local SoDam-Agent working tree supplied by the user
- Source repository: https://github.com/sodam-ai/SoDam-Agent
- Source commit: `34866df` (clean, upstream aligned at inspection time)
- Baseline: original `npm test` passed 47 checks
- Mapping: 10 team plugins, 31 original role definitions, 10 new Codex orchestrators, 5 management commands converted to skills
- Excluded from the product port: `.git`, `.omc`, `.remember`, `.browser-pilot`, `node_modules`, logs, and session/cache artifacts
- Reason for exclusions: repository history, third-party dependencies, and machine-local runtime state are not distributable product behavior and may contain stale or private state
- No source repository files, user Codex configuration, or installed plugins are modified by this port

## 0.2.0 project upgrade (2026-10-09)

- Preserves the 11 original plugins and 46 skills; adds autonomy-team and 10 skills, totaling 12 plugins / 56 skills.
- Adds a zero-dependency project-local lifecycle CLI. Tests cover routes, evidence hashes, bounded generation, pilots, paired outcomes, rollback, revision, expired authorization, collisions, concurrency and junction preservation.
- Baseline snapshot and hashes were taken before edits. No user Codex configuration, installed plugin cache, personal memory, vault or model was modified. The supplied source directory has no .git metadata; no commit or PR was created.
- Runtime tests use synthetic fixtures and explicitly do not certify Codex model behavior or real task improvement. Default Windows sandbox refused atomic file replacement (EPERM); the same tests passed in the normal Windows temporary environment.
- History-derived improvements cover source preservation, completion evidence, environment-vs-role failure separation, handoff and optional CAD/ArchViz/ComfyUI workflows. Private historical messages are not bundled.

## 새 Codex 대화 시험 결과 (2026-10-09)

별도 ephemeral Codex CLI를 읽기 전용으로 실행했다. 프로세스는 종료 코드 0이었으나 파일 읽기 exec_command가 실행 정책에 거부돼 controller_actually_called=false로 보고했다. 따라서 새 대화의 실제 역할 선택·컨트롤러 호출은 통과로 계산하지 않았다. 실행 정책·기존 설치의 frontmatter 오류·일부 외부 MCP 인증 오류는 현재 사용자 환경 문제로 기록하고 전역 설정·플러그인·권한을 변경하거나 우회하지 않았다.
