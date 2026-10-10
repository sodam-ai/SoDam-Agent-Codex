# Desktop telemetry hardening — 2026-10-10

## Scope and preservation
Development source: <canonical-project>.
Test project: <authorized-test-copy>.
No scheduled task was created. No Codex settings, account credentials, approvals, old tool history or unrelated project code were changed.

## Changes and rationale
- plugins/autonomy-team/runtime/bridge.mjs: bounded interpretation of complete code-mode execution metadata, nested failure propagation, and fixed response-shape diagnostics without raw response contents.
- test/bridge.mjs: code-mode array/text boundaries, incomplete/mixed output, nested errors, size limits and rejection of file-content arrays as execution evidence.
- Aggregate code-mode events remain ineligible for specialized role-step attribution (workTool=false).
- Earlier unknown events are preserved. Text claiming success does not count as execution evidence.

## Executed validation
- node test/bridge.mjs: exit 0; 23 bridge integration groups.
- npm test: exit 0; all 17 configured test files completed.
- npm run validate: exit 0; 12 plugins, 56 skills, 24 manifests, zero dependencies.
- Copied test/bridge.mjs under the test project's verification/sodam-binding-20261010: exit 0; 23 groups.
- Installation: bridge.mjs SHA-256 matches the canonical source in global, CLI cache and Desktop cache installations. Prior versions backed up before replacement.
- Fresh installed CLI diagnose: sourceStatus=current; authorization=valid; workEligible=true. Startup fingerprint 0566ac894903bb8e8653291eb08274528878279044c91ae1e13182d7b2f128d9.

## Actual Desktop evidence and limits
- Current UserPromptSubmit supplied the resolved D test workspace and genuine turn key 7a7e61017a9a43ef3053c2dbd8372211; dispatch was saved through the fresh installed CLI.
- Actual PostToolUse records include unknown outcomes despite the bounded format support. The host's exact serialized representation/tool attribution has not been fully established. No synthetic event was inserted into real history to replace these unknowns.
- Existing connected Desktop MCP inspect_runtime: startedAt=2026-10-10T01:47:45.662Z; sourceStatus=changed; nextAction=reconnect-runtime. It must not perform workflow writes until reconnected.
- Host cwd remains C; the approved session binding resolves SoDam's project to D. This does not claim to change the host cwd.
- No supported reconnect control was available in this session. No Desktop or unrelated Node process was terminated.
- Automatic successful learning storage, subsequent actual-work reuse, and long-term improvement are unverified. Unit/fixture tests are not actual-work improvement data.
- Separate lint, type-check and build scripts are absent from package.json; these were not run. Browser UI/server performance and comprehensive historical secret scanning were not exercised in this runtime-only change.

## Next acceptance gates, in order
1. Reconnect the Desktop MCP through a supported host action; inspect_runtime must report sourceStatus=current and valid target authorization.
2. During an actual authorized task, inspect host tool metadata without capturing secrets and confirm executed/failed/unknown classifications from genuine events.
3. Verify the actual saved artifact before recording a task-specific lesson. Unverified work must not produce a success lesson.
4. On a later actual relevant task, verify recall, applicability, application and saved-output quality independently.
5. Establish long-term improvement only from comparable actual work, preserving rollback, budgets and approvals.

Status: code hardening and installation verified; automatic Desktop workflow resolution is incomplete.