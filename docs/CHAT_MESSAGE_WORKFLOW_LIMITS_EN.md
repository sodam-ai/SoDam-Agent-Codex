# Observed limits of chat forwarding and automatic learning
Verification date: 2026-10-11. Scope: observed cases in the then-running Codex Desktop host and SoDam Autonomy Team 0.3.9. This does not guarantee all versions or chats.

## What differs
Composer requests were observed as input=UserInput and turn_trigger=composer. Tool-forwarded requests were observed as input=ResponseItem and turn_trigger=app_tool_send_message with delegation context.
An actual document task forwarded to an idle recipient connected to the same authorized project completed file creation and checking, but had no new start identifier or registration. Earlier composer work registered and saved a lesson, and a separate task returned and applied it. The second earlier composer request included self-forwarding, so it does not establish two clean composer inputs or a fixed external forwarding path.

## Scope of the cause assessment
The forwarding path reproducibly lacked a trusted start event in the SoDam work context. Installation drift or missing authorization does not explain this observed case. Different host input forms are direct evidence; the exact internal hook exclusion branch and host intent remain unverified.
entry.mjs diagnoses receipt, workspace resolution, completion and failure stages. bridge.mjs validates host session_id and turn_id before registering UserPromptSubmit. Missing diagnostic logs alone do not prove that the hook process never ran.

## Use and response
- Request actual new work through the composer in a chat connected to an authorized project. Verify authorization, binding and hook context from each actual result.
- Completed forwarded file work does not establish automatic start, lesson storage or reuse.
- The host must provide trusted start events before forwarding can meet the same automatic learning criteria. Existing SoDam tool calls cannot change the host input path or force host hook invocation.
- Do not manufacture identifiers from forwarded text or reuse a previous task key. Transport success is not a trusted start event.
- Consider restarting only after verified source drift. A current connection and forwarding support are separate facts.
- Do not copy raw requests, tool outputs or secrets into learning or public reports. Support evidence should contain version, input classification, timing, stage presence and masked results only.

## Reproduction and retest
Check authorization and runtime match; forward one actual document task to an idle chat; check recipient work and saved output; compare new hook identity and project start registration; check lesson return and application in a separate follow-up.
Test active-turn delivery, duplicates and self-forwarding separately. Do not repeatedly execute normal work before identifying the cause branch.
If a plugin processing defect is reproduced, minimally fix the canonical source and regress malformed input, expiry, concurrency, interruption and duplicates. Synthetic hook tests do not prove actual Desktop start-event delivery.

## Completion criteria
Each forwarded request must link an actual host event to a unique task key, automatic dispatch, verified lesson storage, and lesson return and application in separate work. Long-term improvement and new-role quality require accumulated actual work and separate comparison. Scheduled tasks, persistent daemons and authorization expansion are not remedies.

Korean guide: [CHAT_MESSAGE_WORKFLOW_LIMITS.md](CHAT_MESSAGE_WORKFLOW_LIMITS.md).
