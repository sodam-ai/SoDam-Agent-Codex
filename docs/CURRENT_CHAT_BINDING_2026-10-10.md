# Current-chat workspace binding verification — 2026-10-10

Canonical development: <canonical-project>.
Test project: <authorized-test-copy>.

## Change and reason

A user-approved current chat can route host hook events to an already-authorized project while retaining the original host cwd. Binding stores a hashed session identifier, exact canonical roots, directory identities, policy fingerprint and inherited expiry. It does not initialize the source workspace, copy policy, renew approval, alter Codex configuration or schedule work. Other sessions are not routed. Existing bindings are never silently overwritten.

Changes: runtime/workspace-binding.mjs, hooks/entry.mjs, runtime/cli.mjs, skills/autonomy-team/SKILL.md, test/workspace-binding.mjs, root package.json (test entry).

## Defect and regression

First full run failed test/areas.mjs: an unmarked host project was resolved before the original host-area connector could connect it. Fixed by checking for an exact-cwd binding first and retaining the existing connector when none exists. No production validation was relaxed. Separate initial binding-test failure used a one-step lesson below the existing two-step requirement; the fixture was corrected.

After fix: npm test passed all 17 test files; npm run validate passed (12 plugins, 56 skills, 24 manifests, zero dependencies). Targeted node test/areas.mjs passed 23 groups. Node test/workspace-binding.mjs passed explicit permission, source non-initialization, session isolation, expiry, changed policy, changed directory identity, subprocess hook routing, lesson save/reuse and invalidated evidence checks.

Copy test runs use verification/sodam-binding-20261010 in the user test project and temporary isolated fixture roots. They are synthetic technical tests, not real Desktop hook receipts or business improvement evidence.

## Boundaries

MCP inspect_runtime returned sourceStatus=changed from the existing Desktop server started 2026-10-10T01:47:45.662Z. Fresh CLI can execute current code, but does not prove host MCP reconnection. No supported host reconnection or chat cwd-change tool is available in this task. No processes or other sessions are terminated.

The actual host cwd remains C. Session routing targets the approved D project only. Actual automatic UserPromptSubmit, work dispatch, successful work telemetry, lesson finish and follow-up reuse must be observed from subsequent genuine requests; no hook event is manually inserted into the real project.

Lint/type-check/build scripts are absent. They were not run as separate commands. Real-work long-term improvement remains unverified. Source repository Git metadata is not available to git status in this environment; no commit/push was performed.
Installation after validation: 3 approved targets updated, 12 files verified by SHA-256, previous files backed up under the current C workspace workflow-evidence-20261010/installation/chat-binding. Hook definitions unchanged. Fresh local MCP source/current authorization were checked separately from the existing Desktop connection.

Current host-session binding activated and read back: exact approved D test project, other session excluded, no source policy initialized, target expiry inherited. No synthetic hook events sent to the real project. The next genuine UserPromptSubmit is required for actual automatic invocation evidence.
