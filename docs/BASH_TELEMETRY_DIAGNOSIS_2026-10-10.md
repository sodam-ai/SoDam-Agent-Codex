# Actual Bash telemetry diagnosis and correction — 2026-10-10

Development source: <canonical-project>.
Validation copy: <authorized-test-copy>.

## Reproduction and cause
Actual Desktop PostToolUse delivered tool_name=Bash and tool_response as stdout text without typed exit metadata. Earlier code-mode-only normalization did not identify this transport. A stdout JSON object or success sentence cannot establish process exit status, so these events must remain unknown.
Actual verify_artifacts events delivered structured metadata and were recorded executed. Genuine current turn 24f7a92581c875f3e835057e12d1cac8 contained executed=2, failed=0, unknown=11 at the observation point. Counts are a snapshot, not final totals.

## Minimal canonical changes
plugins/autonomy-team/runtime/bridge.mjs:
- Bounded tool identifier and fixed header labels identify transport without command or response contents.
- Unknown reasons distinguish execution-metadata-missing from unsupported-response. Old events remain unchanged.
- Bash is recognized for role attribution only when an actual typed execution result passes the existing outcome guard. Plain Bash text and stdout JSON remain unknown and cannot serve as role-step evidence.
- Success is not inferred from event names, human-readable completion strings, transport delivery, or synthetic history.
test/bridge.mjs:
- Added Bash plain-text/stdout-JSON/typed-success/typed-failure and non-persistence cases; total 24 bridge groups.

## Executed validation and installation
node --check plugins/autonomy-team/runtime/bridge.mjs: exit 0.
node test/bridge.mjs: exit 0; 24 groups.
npm test: exit 0; all 17 configured test files completed.
npm run validate: exit 0; 12 plugins, 56 skills, 24 manifests, zero dependencies.
Copied bridge tests in verification/sodam-binding-20261010: exit 0; 24 groups.
Global, CLI cache and Desktop cache bridge source hashes match canonical; prior files backed up.
Actual post-installation event recorded Bash/unknown/execution-metadata-missing/text.
No schedules, approval changes, account changes, history replacement or unrelated project source edits were performed.

## Learning acceptance scope
This actual code diagnosis/correction can teach a bounded transport-verification procedure. Unit fixtures are not learning experiences and are not improvement evidence. A saved technical procedure does not certify that every actual work tool is attributable or that long-term work quality improved.
Follow-up work is a necessary installation-integrity audit: recall the new procedure, distinguish source installation from running-process freshness, verify actual hashes, and report remaining host limits. This same-session follow-up is not a later independent natural-language request.

## Remaining limits
The host's text-only Bash transport still lacks exit metadata. Retain unknown until the trusted host provides it; do not parse stdout as success. Actual specialized role-step execution is therefore not proven for text-only Bash events.
Updating the source changes the existing MCP's fingerprint; use fresh installed CLI for workflow writes while sourceStatus is changed. Read-only artifact verification remains a separate operation.
Full automatic reuse on a later independent task and long-term improvement require subsequent actual work. No large-scale refactor or host configuration change is justified by this diagnosis.