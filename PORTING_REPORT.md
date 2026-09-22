# Porting evidence

- Source: local SoDam-Agent working tree supplied by the user
- Source repository: https://github.com/sodam-ai/SoDam-Agent
- Source commit: `34866df` (clean, upstream aligned at inspection time)
- Baseline: original `npm test` passed 47 checks
- Mapping: 10 team plugins, 31 original role definitions, 10 new Codex orchestrators, 5 management commands converted to skills
- Excluded from the product port: `.git`, `.omc`, `.remember`, `.browser-pilot`, `node_modules`, logs, and session/cache artifacts
- Reason for exclusions: repository history, third-party dependencies, and machine-local runtime state are not distributable product behavior and may contain stale or private state
- No source repository files, user Codex configuration, or installed plugins are modified by this port
