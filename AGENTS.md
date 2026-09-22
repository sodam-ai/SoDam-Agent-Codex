# SoDam-Agent-Codex contributor guidance

- Treat `.agents/plugins/marketplace.json` as the catalog source of truth.
- Every plugin must have matching `plugin.json` and `.codex-plugin/plugin.json`.
- Every skill directory must contain a valid `SKILL.md` with a safe kebab-case name.
- Do not edit user Codex configuration or install plugins during validation.
- Run `npm test` before claiming a change is complete.
