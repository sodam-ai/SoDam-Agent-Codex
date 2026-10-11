# Missing chat-delivery start: cause analysis and host response
Checked: 2026-10-11. SoDam Autonomy Team 0.3.9.
## Result
Preserve the previously verified direct-input lesson storage and subsequent return/application. Automatic learning for tool-delivered chat requests remains unresolved.
Public Codex source for matching versions contains an input-specific start-hook exclusion. This matches the observed ResponseItem delivery. Repeated plugin installation or restart cannot change that branch.
## Evidence and confidence
Running paths include app-server-daemon 0.162.1 and a Desktop-bundled Codex. The bundled executable reported 0.162.0-alpha.17.2 with --version. Version lookup exited 0 with sandbox permission warnings for temporary PATH alias cleanup. Accounts, permissions and settings were not changed.
In both public versions, hook_runtime.rs inspect_pending_input calls UserPromptSubmit for UserInput, while ResponseItem and FunctionCallOutput return without additional context. InterAgentCommunication also does not call this start hook.
This directly establishes the public source branch, not binary equivalence or inspection of private Desktop delivery implementation. Together with observed delivery input types and reproduced missing starts, the upstream host input branch strongly explains the behavior. Developer intent is not established.
## SoDam handling and change decision
Canonical hooks/entry.mjs traces start receipt, workspace resolution, completion and failure. runtime/bridge.mjs derives a key from actual session_id and turn_id and registers starts only for UserPromptSubmit. Unregistered tool events and delivery text are not accepted as starts.
No current evidence reproduces SoDam losing a valid received start. Do not change execution code speculatively. Preserve lessons and user settings. Do not register from delivery text, previous task keys or invented keys, or retroactively treat PostToolUse/Stop as starts.
The live MCP source was current; the D test project had valid authorization and connectionRequired=false. These documentation changes do not update execution source and require no reinstall or reconnection.
## Host-side requirements
The chat delivery tool should preserve explicit human delivery authorization and provide a trusted recipient start event, or a documented delegated-task start hook. Link session_id, turn_id, workspace and input origin, and handle duplication, concurrency and interruption. Do not convert every ResponseItem to user input: that would also affect tool results and system context.
Official app-server turn/start begins work with user input. This does not imply control over the existing Desktop send_message_to_thread path. No arbitrary app-server connection, authentication access, separate server or request injection was performed. Available connected tools have no argument selecting the delivery input type or hook generation.
## Available response
Use direct input for ordinary new-chat work in authorized workspaces. Preserve existing learning evidence without guaranteeing every future chat. Distinguish completed file work from absent new learning on delivery.
A host support request should contain only versions, input types, minimal reproduction, expected registration, observed absence and regression criteria. Exclude customer data, raw prompts, logs and secrets. External submission requires explicit separate authorization. The following is a prepared reproduction, not a submitted request.
Reproduction: send real document work by tool to an idle chat bound to an authorized project. File work completes but no new UserPromptSubmit key or dispatch appears. Direct input in the same project has start and learning records. Prior self-forwarding contamination does not certify every direct-input case.
## Completion criteria and not-run work
Only after the host supports a real start event, or a newly reproduced SoDam receipt defect is fixed, retest delivered real work and a separate follow-up. Require actual keys, dispatch, reviewed lesson storage, subsequent return, source hashes and artifact application.
Host changes and post-fix actual delivery verification were not run. Do not repeat unchanged delivery and claim new learning. Long-term improvement and generated-role effects require real work accumulation. No scheduled task, daemon or authorization expansion.
## Official references
- [Codex public source 0.162.0-alpha.17.2](https://github.com/openai/codex/blob/rust-v0.162.0-alpha.17.2/codex-rs/core/src/hook_runtime.rs#L643-L680)
- [Codex public source 0.162.1](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/core/src/hook_runtime.rs#L643-L680)
- [Official hooks](https://learn.chatgpt.com/docs/hooks#userpromptsubmit)
- [Official app-server lifecycle](https://learn.chatgpt.com/docs/app-server#lifecycle-overview)
Korean: [CHAT_TRANSPORT_ROOT_CAUSE.md](CHAT_TRANSPORT_ROOT_CAUSE.md).