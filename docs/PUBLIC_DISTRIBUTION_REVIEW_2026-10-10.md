# Public distribution verification — 2026-10-10

## Scope
Canonical SoDam-Agent-Codex source was compared with an isolated clone preserving existing GitHub history. The source folder itself has no .git. Publication uses a feature branch and PR, never direct main push. Local workflow stores, outputs backups/logs and CHECKPOINT.md are excluded.

## Legal and security evidence
Official Apache License 2.0 matches existing LICENSE after whitespace normalization; Copyright 2026 SoDam AI Studio retained. NOTICE kept informational. Korean/English commercial guides added. Optional Context7 4.1.1 npm metadata reports MIT; no direct root dependencies or lockfiles, media/assets/public detected. Runtime transitive dependencies and contributor title evidence require separate review. No rights guarantee or individual legal advice.

152 public candidate files were inspected for prohibited filenames, size over 1 MiB and known credential patterns. One broad assignment match was reviewed in test/mcp.mjs: explicitly synthetic examples, not real credentials. Existing nine reachable Git commits / 93 unique blobs had no findings for the selected private-key, GitHub token, AWS key and API-key patterns. These bounded checks are not a guarantee that all confidential or personal information is absent.

## Validation
npm run validate passed: 12 plugins, 56 skills, 24 manifests, zero dependencies. npm test passed all 18 test files in ordinary local execution. Sandbox execution stopped at EPERM during temporary state file rename; no test or sandbox setting was weakened. README Markdown/HTML embedded bytes, TOC targets and local links passed. git diff --check passed. No separate lint/type-check/build scripts exist. Desktop real-use and long-term effects remain outside this technical release check.

## Distribution decisions
No standalone Release is automatically created. A versioned Release may be useful after actual Desktop use and release packaging are reviewed. Repository was already public; no visibility conversion is needed. Existing relevant Topics can remain; About should describe 12 plugins / 56 skills and bounded work learning without asserting proven long-term improvement. Homepage is empty and no URL is invented.
