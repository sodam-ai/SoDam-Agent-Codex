# SoDam-Agent-Codex

> A beginner-friendly installation and usage guide for the Codex port of SoDam-Agent

SoDam-Agent-Codex is a repository-based plugin marketplace that ports the specialist roles of the original **SoDam-Agent** for use in Codex. It provides ten teams for web app development, documentation, research, data, marketing, security audit, DevOps, customer support, product management, and localization, plus one plugin for safely managing user-owned skills.

This repository is not a standalone website, mobile app, server, or database. You register the marketplace with Codex CLI and add the plugins you need. Codex then reads the included `SKILL.md` instructions and applies them to your work.

## Languages and document formats

- Korean Markdown: `README.md`
- English Markdown: `README.en.md`
- Korean HTML: `README.html`
- English HTML: `README.en.html`

All four documents are in the project root. Each HTML document is generated from its corresponding Markdown source and contains the same information.

## Table of contents

1. [One-sentence explanation for first-time users](#1-one-sentence-explanation-for-first-time-users)
2. [Current status and verification scope](#2-current-status-and-verification-scope)
3. [Prerequisites and required software](#3-prerequisites-and-required-software)
4. [How to download](#4-how-to-download)
5. [How to install](#5-how-to-install)
6. [Five-minute quick start](#6-five-minute-quick-start)
7. [How to run and use it](#7-how-to-run-and-use-it)
8. [How it works and workflow](#8-how-it-works-and-workflow)
9. [Complete plugin and skill inventory](#9-complete-plugin-and-skill-inventory)
10. [Command reference](#10-command-reference)
11. [Folder structure and architecture](#11-folder-structure-and-architecture)
12. [Security and data flow](#12-security-and-data-flow)
13. [File and document locations](#13-file-and-document-locations)
14. [Development and verification](#14-development-and-verification)
15. [Update summary](#15-update-summary)
16. [Troubleshooting](#16-troubleshooting)
17. [FAQ](#17-faq)
18. [Legal, copyright, licensing, and commercial use](#18-legal-copyright-licensing-and-commercial-use)
19. [Current limitations and unverified items](#19-current-limitations-and-unverified-items)
20. [Update and contribution checklist](#20-update-and-contribution-checklist)
21. [Original project and sources](#21-original-project-and-sources)

## 1. One-sentence explanation for first-time users

This project is **a toolbox that adds role-specific work instructions to Codex**. For example, after installing `docs-team`, you can ask, “Use the documentation team to write a beginner guide,” and Codex can apply the writer, editor, and fact-checker instructions.

Important points:

- Not every team runs automatically. Codex uses relevant skills based on installed plugins and your request.
- A team skill uses only the roles needed for a small request.
- It does not create subagents automatically unless you explicitly request team work or parallel processing.
- High-impact actions such as deletion, deployment, and external transmission require user authority and confirmation.
- AI output needs review. Legal, security, privacy, and deployment results especially need final human verification.

## 2. Current status and verification scope

### Verified

- Marketplace plugins: **11**
- Total skills: **46**
  - 10 team orchestrator skills
  - 31 specialist role skills
  - 5 user-skill management skills
- Plugin manifests: current `plugin.json` and compatibility `.codex-plugin/plugin.json`
- Only the web app and research teams declare Context7 MCP `4.1.1`
- Project runtime dependencies: **0**
- Local structural, integration, adversarial-input, runtime-condition, and CI-configuration tests passed
- Full Apache License 2.0 text and NOTICE are included

### Status to understand before use

- The distribution address is [sodam-ai/SoDam-Agent-Codex](https://github.com/sodam-ai/SoDam-Agent-Codex). Check its public status and current README on GitHub before installation.
- Local paths below are examples. Replace them with the actual folder where you extracted or cloned the project.
- Actual marketplace registration and plugin installation were not run during validation because they would modify the user's Codex configuration.
- Context7 process startup was checked, but MCP initialization negotiation and a real documentation request were not verified.

## 3. Prerequisites and required software

### Required

1. **A computer**
   - It must be able to run Codex CLI on Windows, macOS, or Linux.
   - This port was verified in a local Windows environment. Paths and shell commands may differ on other operating systems.
   - A phone or tablet alone is not a practical environment for installing and running local Codex CLI plugins. Mobile devices can be used to read the documentation or GitHub pages.

2. **A Codex CLI version with plugin support**
   - Installation guide: [Official OpenAI Codex repository](https://github.com/openai/codex)
   - Verify after installation:

```powershell
codex --version
codex plugin --help
```

3. **Node.js 20.18.1 or newer**
   - Download: [Official Node.js downloads](https://nodejs.org/en/download)
   - `npm` and `npx` are normally installed with Node.js.
   - Node.js is needed by Context7 MCP in the web app and research teams and by this repository's validation commands.

```powershell
node --version
npm --version
npx --version
```

The value from `node --version` must be `v20.18.1` or newer. For example, `v22.x.x` meets the requirement.

### Helpful but optional

- **Git** for cloning and updates: [Official Git downloads](https://git-scm.com/downloads)
- **Web browser** for downloading a ZIP from GitHub
- **Code editor** for reading documents or editing user skills; it is not required

### Not required

- A separate database
- Docker
- Project-specific environment variables or API keys
- Running `npm install` for this repository: the current `package.json` has no runtime dependencies
- `npm publish`: this is a Codex plugin marketplace with `private: true`, not a published npm package

An internet connection may still be required the first time Context7 MCP runs because `npx` may download the pinned package from the npm registry.

## 4. How to download

### Method A: use an existing local folder

If you already have the project folder, no additional download is needed. This path is only an example; replace `C:\path\to` with the real location.

```text
C:\path\to\SoDam-Agent-Codex
```

### Method B: clone with Git

First confirm that the GitHub repository is accessible:

```powershell
git clone https://github.com/sodam-ai/SoDam-Agent-Codex.git
cd SoDam-Agent-Codex
```

### Method C: download a ZIP

1. Open the `sodam-ai/SoDam-Agent-Codex` page on GitHub.
2. Select **Code**.
3. Select **Download ZIP**.
4. Extract the downloaded ZIP file.
5. Confirm that the extracted folder contains `.agents`, `plugins`, `package.json`, and `LICENSE`.

> Do not install the original `sodam-ai/SoDam-Agent` as a substitute. The original and the Codex port use different structures and execution models.

## 5. How to install

Installation has two stages: register the **marketplace**, then add the **plugins** you want.

### 5.1 Register the local folder as a marketplace

Run this in Windows PowerShell or a terminal. Replace the example path with the actual project folder:

```powershell
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"
```

Verify registration:

```powershell
codex plugin marketplace list
```

Look for `sodam-agent-codex` in the output.

### 5.2 Register the GitHub marketplace

```powershell
codex plugin marketplace add sodam-ai/SoDam-Agent-Codex --ref main
```

If this fails, the repository may not exist yet, may be private, or there may be a network or access-permission problem.

### 5.3 Add selected plugins

For a first installation, start with only one or two plugins you need.

```powershell
codex plugin add docs-team@sodam-agent-codex
codex plugin add sodam-agent@sodam-agent-codex
```

Verify installation:

```powershell
codex plugin list
codex plugin list --marketplace sodam-agent-codex
```

### 5.4 Add all eleven plugins

Run only the lines for the plugins you want:

```powershell
codex plugin add web-app-team@sodam-agent-codex
codex plugin add docs-team@sodam-agent-codex
codex plugin add research-team@sodam-agent-codex
codex plugin add data-team@sodam-agent-codex
codex plugin add marketing-team@sodam-agent-codex
codex plugin add security-audit-team@sodam-agent-codex
codex plugin add devops-team@sodam-agent-codex
codex plugin add customer-support-team@sodam-agent-codex
codex plugin add pm-team@sodam-agent-codex
codex plugin add localization-team@sodam-agent-codex
codex plugin add sodam-agent@sodam-agent-codex
```

If installed plugins do not immediately appear in the current Codex UI, open a new task or restart Codex, then check the list again. Display location and naming can vary by app version.

## 6. Five-minute quick start

### Step 1: check required programs

```powershell
codex --version
node --version
```

### Step 2: register the current local marketplace

```powershell
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"
```

### Step 3: install the documentation team

```powershell
codex plugin add docs-team@sodam-agent-codex
```

### Step 4: ask in plain language in Codex

Enter a request like this in a new Codex task:

```text
Use the documentation team to write an installation guide for a first-time user.
Separate verified facts from unverified items and perform a final self-review.
```

### Step 5: inspect the result

- Check the paths of files that were created or changed.
- Check which validation commands actually ran and whether each passed or failed.
- Make sure unknown information was not presented as fact.
- If deletion, deployment, or external transmission is involved, recheck the target and impact before execution.

## 7. How to run and use it

### Do I need to start a separate server?

No. Regular team plugins do not start a standalone server or interface. Installed skill instructions are used when you make a relevant request in Codex.

When the web app or research team uses Context7, Codex may start this pinned package as an MCP process:

```text
npx -y @upstash/context7-mcp@4.1.1
```

### Examples by team

- Web app: `Use the web app team to break down requirements, implement frontend and backend work, and review the result.`
- Documentation: `Use the documentation team to write a beginner guide and fact-check it.`
- Research: `Use the research team to study official sources and separate facts, interpretation, and unknowns.`
- Data: `Use the data team to clean this CSV, analyze it, and propose easy-to-read charts.`
- Marketing: `Use the marketing team to create product copy, search keywords, and social posts.`
- Security audit: `Use the security audit team to inspect this code for vulnerabilities and compliance risk. Propose fixes only.`
- DevOps: `Use the DevOps team to inspect deployment and CI settings and diagnose failures.`
- Customer support: `Use the customer support team to draft replies, an FAQ, and recurring-complaint analysis.`
- PM: `Use the PM team to organize requirements, priorities, a roadmap, and meeting decisions.`
- Localization: `Use the localization team to translate this document into English and review terminology and cultural phrasing.`
- Skill management: `I want to create a new agent skill. Ask me one question at a time.`

You may also select a skill in the Codex UI or request it by name. Exact display formats can vary by Codex app or CLI version, so use `codex plugin list` and the installed list shown in your UI as the source of truth.

## 8. How it works and workflow

```text
User request
  ↓
Codex finds relevant installed plugins and skills
  ↓
The team orchestrator defines scope, deliverables, and role order
  ↓
Required specialist roles write, implement, or analyze
  ↓
The final role resolves conflicts and omissions using evidence
  ↓
Codex reports artifacts, validation run, failures, and unknowns
```

Shared operating principles:

1. Define scope and deliverables first.
2. Use only the necessary roles for a small request.
3. Separate facts, assumptions, and unverified information.
4. When roles disagree, the final review role uses evidence such as files, logs, and official documentation.
5. Obtain user authority for external transmission, deployment, deletion, and overwrite.
6. Do not claim completion from file existence alone; inspect the artifact and validation result.

## 9. Complete plugin and skill inventory

### Ten specialist team plugins

| Plugin | Purpose | Included skills |
|---|---|---|
| `web-app-team` | Web app planning, implementation, review | `web-app-team`, `planner`, `frontend-dev`, `backend-dev`, `reviewer` |
| `docs-team` | Writing, editing, fact checking | `docs-team`, `writer`, `editor`, `fact-checker` |
| `research-team` | Research, analysis, critical synthesis | `research-team`, `researcher`, `analyst`, `critic` |
| `data-team` | Data processing, analysis, visualization | `data-team`, `data-engineer`, `data-analyst`, `data-viz` |
| `marketing-team` | Copy, search, social operations | `marketing-team`, `copywriter`, `seo-analyst`, `social-manager` |
| `security-audit-team` | Security, vulnerability, compliance review | `security-audit-team`, `security-auditor`, `vulnerability-analyst`, `compliance-reviewer` |
| `devops-team` | Deployment, CI/CD, infrastructure troubleshooting | `devops-team`, `deploy-engineer`, `cicd-manager`, `infra-troubleshooter` |
| `customer-support-team` | Replies, FAQ, feedback analysis | `customer-support-team`, `support-agent`, `faq-writer`, `feedback-analyst` |
| `pm-team` | Requirements, roadmap, meeting records | `pm-team`, `requirements-analyst`, `roadmap-planner`, `meeting-scribe` |
| `localization-team` | Translation, localization, terminology review | `localization-team`, `translator`, `localization-specialist`, `terminology-reviewer` |

### One user-skill management plugin

| Plugin | Skill | Purpose and safeguards |
|---|---|---|
| `sodam-agent` | `new-agent` | Confirms name, job, scope, and rules; previews the exact path and full content before approval and creation |
| `sodam-agent` | `pick-agent` | Copies and adapts an installed role as a user skill; requires backup and approval on conflict |
| `sodam-agent` | `training-agent` | Does not train a model; it edits user-owned `SKILL.md` instructions after backup and diff review |
| `sodam-agent` | `save-agent` | Saves a user skill to a personal folder or chosen archive and performs secret scanning and hash/content comparison |
| `sodam-agent` | `remove-agent` | Targets user-owned skills only, creates a backup, and requires final approval; it does not directly delete installed plugin internals |

## 10. Command reference

### Environment checks

```powershell
codex --version
codex plugin --help
node --version
npm --version
npx --version
```

### Marketplace management

```powershell
# Register the local folder
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"

# Register the GitHub repository
codex plugin marketplace add sodam-ai/SoDam-Agent-Codex --ref main

# List marketplaces
codex plugin marketplace list

# Upgrade the registered marketplace
codex plugin marketplace upgrade sodam-agent-codex
```

### Plugin management

```powershell
# Add
codex plugin add docs-team@sodam-agent-codex

# List installed plugins
codex plugin list
codex plugin list --marketplace sodam-agent-codex

# List available plugins as JSON
codex plugin list --available --json

# Remove example
codex plugin remove docs-team@sodam-agent-codex
```

Before removing a plugin, confirm that customized files or important output are stored separately. Keep user skills in a user-owned skill directory instead of inside installed plugin files.

### Project validation

```powershell
npm run validate
npm test
npm pack --dry-run --json
```

## 11. Folder structure and architecture

```text
SoDam-Agent-Codex/
├─ .agents/
│  └─ plugins/
│     └─ marketplace.json       # Single registry for 11 plugins
├─ .github/
│  └─ workflows/
│     └─ ci.yml                 # GitHub Actions validation
├─ plugins/
│  ├─ web-app-team/
│  ├─ docs-team/
│  ├─ research-team/
│  ├─ data-team/
│  ├─ marketing-team/
│  ├─ security-audit-team/
│  ├─ devops-team/
│  ├─ customer-support-team/
│  ├─ pm-team/
│  ├─ localization-team/
│  └─ sodam-agent/
│     ├─ plugin.json            # Current manifest
│     ├─ .codex-plugin/
│     │  └─ plugin.json         # Compatibility manifest
│     ├─ .mcp.json              # Present only when required
│     └─ skills/<skill>/SKILL.md
├─ scripts/                     # Structure, plugin, skill validators
├─ test/                        # E2E, adversarial, runtime, CI tests
├─ README.md / README.html      # Korean documentation
├─ README.en.md / README.en.html # English documentation
├─ PORTING_REPORT.md            # Port scope and evidence
├─ LICENSE                      # Apache License 2.0
├─ NOTICE                       # Copyright, trademark, external-service notice
└─ package.json                 # Validation commands and Node requirement
```

`.agents/plugins/marketplace.json` is the source of truth for marketplace entries. Each entry points only to a local `plugins/<plugin name>` directory, and validation rejects path escape and symbolic links.

## 12. Security and data flow

### General plugin data flow

```text
User input and work files
  → local Codex runtime
  → installed local SKILL.md instructions
  → Codex works through permitted tools
  → result files and response
```

This repository provides no login system, account service, authorization server, database, analytics collector, or remote upload code. Codex itself and tools connected by the user have their own data-processing policies.

### When Context7 is used

Only `web-app-team` and `research-team` contain `.mcp.json`.

```text
Relevant request
  → Codex starts @upstash/context7-mcp@4.1.1 through npx
  → external documentation may be requested over the network
  → returned material is used in the Codex task
```

Security guidance:

- `npx` may download the package from the npm registry on first use.
- Context7, npm, Codex, and model-provider terms, privacy policies, and charges are separate from this repository.
- Do not place passwords, API keys, tokens, private keys, certificates, government IDs, payment details, or raw customer data in prompts or public files.
- Check organizational policy before sending confidential source code or documents to an external MCP.
- Do not commit `.env`, certificates, private keys, or account files; use a dedicated secret manager.
- Before running AI-generated commands, inspect paths, deletion scope, and external transmission.

### Validator safeguards

- Prevent marketplace and skill paths from escaping the repository
- Reject symbolic links under plugins
- Reject invalid UTF-8 documents
- Validate MCP structure and string fields
- Require skill directory and frontmatter names to match
- Reject unexpected MCP declarations
- Enforce zero project runtime dependencies
- Test rejection of seven adversarial cases, including path traversal, wrong types, name mismatch, MCP path traversal, invalid UTF-8, and invalid MCP structure

## 13. File and document locations

| File | Purpose |
|---|---|
| `README.md` | Korean Markdown guide |
| `README.en.md` | English Markdown guide |
| `README.html` | Korean HTML guide |
| `README.en.html` | English HTML guide |
| `PORTING_REPORT.md` | Original-to-port mapping, exclusions, and evidence |
| `LICENSE` | Full Apache License 2.0 text |
| `NOTICE` | Copyright, trademark, and external-service cautions |
| `.agents/plugins/marketplace.json` | Source of truth for the 11 installable plugins |
| `plugins/*/plugin.json` | Plugin name, version, description, and skill paths |
| `plugins/*/.codex-plugin/plugin.json` | Compatibility manifest |
| `plugins/*/skills/*/SKILL.md` | Actual role instructions read by Codex |
| `plugins/web-app-team/.mcp.json` | Web app Context7 configuration |
| `plugins/research-team/.mcp.json` | Research Context7 configuration |
| `scripts/validate.mjs` | Full structure and security-policy validation |
| `test/*.mjs` | Normal, failure, boundary, and CI-condition tests |

## 14. Development and verification

Run from the project root:

```powershell
cd "C:\path\to\SoDam-Agent-Codex"
npm run validate
npm test
```

The current `npm test` runs these checks in order:

1. `test/e2e.mjs`: 11-plugin ordering and directories, Context7 pin, and unexpected MCP detection
2. `test/adversarial.mjs`: actual rejection of seven malformed inputs
3. `test/runtime.mjs`: minimum Node version and Context7 version pin
4. `test/ci.mjs`: full CI action SHA pins, read-only permissions, timeout, and Node 22

Additional checks:

```powershell
npm pack --dry-run --json
```

Expected baseline:

- 11 plugins
- 46 skills
- 22 manifests
- 0 runtime dependencies
- Official plugin validation 11/11
- Official skill validation 46/46

This repository has no separate application-source lint, TypeScript type-check, or build command. Do not interpret their absence as a pass. The distributable artifacts are plugins, skills, and documents, and the validators target that structure and policy.

## 15. Update summary

<details>
<summary><strong>2026-09-23 — Codex port baseline</strong></summary>

- Ported the original SoDam-Agent at baseline commit `34866df` into Codex plugin structure.
- Added ten specialist teams, 31 role skills, and ten team orchestrators.
- Added five management skills for creating, selecting, training, saving, and removing user skills.
- Included both current and compatibility plugin manifests.

</details>

<details>
<summary><strong>Security and reliability hardening</strong></summary>

- Hardened validation against path escape, symbolic links, invalid UTF-8, and malformed MCP structures.
- Added tests that verify seven adversarial and error cases are rejected, not only that valid cases pass.
- Limited Context7 MCP to the two plugins that need it and pinned the version to `4.1.1`.
- Enforced zero project runtime dependencies.

</details>

<details>
<summary><strong>Runtime and CI verification</strong></summary>

- Declared and validated Node.js `20.18.1` as the minimum version.
- Configured GitHub Actions to run `npm test` with Node 22.
- Validated full commit SHA pins for CI actions, `contents: read`, a ten-minute timeout, and cancellation of duplicate runs.

</details>

<details open>
<summary><strong>Documentation expansion</strong></summary>

- Added Korean and English Markdown and HTML guides generated from matching sources.
- Added beginner download, installation, quick start, commands, team examples, security/data flow, troubleshooting, FAQ, licensing, and commercial-use guidance.
- Clearly separated verified facts from unverified installation and external-communication behavior.

</details>

## 16. Troubleshooting

### `codex` command not found

Reproduction: `codex --version` reports that the command cannot be found.

Resolution:

1. Confirm that Codex CLI is installed.
2. Close the terminal completely and open it again.
3. Confirm that the Codex installation directory is in the operating system PATH.
4. Compare your setup with the current instructions in the [official OpenAI Codex repository](https://github.com/openai/codex).

### Node.js is too old

Reproduction: `node --version` is below `v20.18.1`, or `npm test` reports an engine error.

Install a supported version from the official Node.js installer, open a new terminal, and verify again. If multiple Node versions are installed, check which executable the PATH resolves.

```powershell
node --version
Get-Command node
```

### Marketplace not found

Reproduction: `codex plugin add ...@sodam-agent-codex` cannot find the marketplace.

Check:

```powershell
codex plugin marketplace list
```

- For a local installation, confirm the folder exists and register it again with an absolute path.
- For GitHub, confirm publication, spelling, network access, and permissions.
- Make sure you did not confuse the original `SoDam-Agent` with the `SoDam-Agent-Codex` port.

### Plugin does not appear in the list or UI

1. Run `codex plugin list --marketplace sodam-agent-codex`.
2. Check the plugin name spelling.
3. Open a new Codex task or restart the app.
4. If the problem remains, compare these commands with the current output of `codex plugin --help`.

### Context7 or `npx` fails

Possible causes include an old Node version, blocked internet or npm registry access, proxy/firewall policy, a package download failure, or an external service outage.

Check:

```powershell
node --version
npx --version
npm view @upstash/context7-mcp@4.1.1 version
```

The final command uses the network and may be blocked by organizational policy. Never paste proxy passwords or tokens into an issue report. Other local role instructions can still be used without Context7, but work requiring current external documentation may be limited.

### `npm test` fails

1. Read the first failing message without omitting it.
2. Run `npm run validate` to isolate structural problems.
3. Inspect recently changed `marketplace.json`, `plugin.json`, `.mcp.json`, and `SKILL.md` files.
4. Do not delete validation rules or features just to make the test pass.
5. Run the full `npm test` again after a fix.

### Permission or antivirus error

- Keep the project in a normal user workspace rather than a protected system folder.
- Do not automatically use administrator privileges; identify the blocked file first.
- Do not add a broad antivirus exclusion. Review only the required path and executable under your organization's policy.

### Installation does not work on a phone

This is an expected limitation. The project is designed for a computer that runs Codex CLI. A phone can read the README and inspect the remote repository, but local plugin installation and validation should be done on a computer.

## 17. FAQ

### Q1. Is it free?

The repository code is provided under Apache-2.0. Codex, AI models, Context7, network access, and other connected services may have separate plans, fees, and terms.

### Q2. Must I install every plugin?

No. Install only the teams you need. Starting with `docs-team` or one team relevant to your work is recommended.

### Q3. Does installation automatically read every file on my computer?

This repository has no code that collects the entire computer. Actual file access depends on the Codex session permissions, your request, and tools you connect. Review the scope before starting work.

### Q4. Do I need an API key?

This repository itself does not require one. Codex and external MCPs or services may require separate authentication or an account. Never store keys in README files, tests, commits, or prompts.

### Q5. Does `training-agent` train an AI model?

No. It safely edits work instructions in a user-owned `SKILL.md`. It does not train model weights or perform fine-tuning.

### Q6. Can I edit installed plugin files directly?

You can, but updates may overwrite them. Copy custom skills to a user-owned skill folder and keep backups before changes, then validate afterward.

### Q7. Does it have a database or login system?

No. This repository is a package of plugin instructions and validation tools. It is not a service with login, authorization, or database CRUD, so those tests are outside its scope.

### Q8. Can it work offline?

Installed local skills may work depending on your Codex environment. Codex model access, GitHub downloads, `npx` package acquisition, and Context7 queries may require internet access.

### Q9. Can I use it commercially?

You may use this repository code commercially if you comply with Apache-2.0. External services, source material, generated output, fonts, images, data, personal information, and trademarks can have separate rights. Read the legal section below.

### Q10. What should I include in an error report?

Include the operating system, `codex --version`, `node --version`, the command, a sanitized error message, and reproduction steps. Remove API keys, tokens, sensitive names in local paths, and customer data.

## 18. Legal, copyright, licensing, and commercial use

### What the current files establish

- `package.json` declares `Apache-2.0`, and the root `LICENSE` contains the official Apache License, Version 2.0 text. Version 2.0 is the current version identified by the Apache Software Foundation.
- The existing copyright notice is `Copyright 2026 SoDam AI Studio`; it is preserved as a separate line at the end of the root `LICENSE` and in `NOTICE`. That notice alone does not independently prove ownership of every original contribution.
- The current distribution tree contains no image, icon, font, video, audio, or sample-data files and no `node_modules`. `package.json` has no direct runtime dependencies.
- The `.mcp.json` files for the web app and research teams reference `@upstash/context7-mcp@4.1.1` through `npx`. The package is not bundled here. npm metadata for that version says MIT, and the [Context7 project license](https://github.com/upstash/context7/blob/master/LICENSE) is MIT. Licenses for the complete installed dependency tree and the service terms need separate review.

### Beginner guide: what may I do?

“Permitted” below describes **this project's code, documentation, and prompts to the extent the rights holder can provide them under Apache-2.0**. It does not automatically grant rights to external services, third-party material, AI output, or trademarks.

| Intended use | Guidance for this project |
|---|---|
| Personal use, internal company use, educational material | Apache-2.0-covered material may be used. Check separate permissions for any third-party work added to teaching material. |
| Copying, forking, modifying | Permitted. When distributing changed files, mark the changes prominently and preserve existing notices. |
| Redistributing, selling, or delivering the original or a modified copy to a client | Permitted for Apache-2.0-covered material. Include a copy of `LICENSE`, keep relevant `NOTICE` information readable, and identify modified files. Client-contract rights and warranties are separate. |
| Operating a paid service using this tool | Apache-2.0 itself does not prohibit a paid service. Check separate terms, fees, data processing, and client contracts for Codex, Context7, and model services. |

### Conditions and actions to avoid

- When redistributing, provide a copy of `LICENSE` and retain relevant copyright, patent, trademark, attribution, and `NOTICE` information as required by Apache-2.0 Section 4. Mark changed files.
- Apache-2.0 does not grant contributor trademark rights. Do not imply affiliation or endorsement through names or logos such as OpenAI, Codex, Upstash, or Context7.
- Do not publish or sell unlicensed images, icons, fonts, video, audio, code, templates, data, characters, documents, or prompts on the assumption that this project's license covers them.
- Do not include client information, personal data, confidential material, API keys, tokens, or private addresses in samples, tests, screenshots, logs, or distributions. Use rights-cleared dummy data rather than copying real data into demos.
- Do not claim that this repository's Apache-2.0 license covers external MCPs, SDKs, APIs, models, npm packages, or content returned by them.
- Apache-2.0 includes a patent grant and termination in specified patent litigation. Section 7 disclaims warranties and Section 8 limits liability. Review both the license and any client contract before promising separate warranties.

### Checks before publication, commercial use, or client delivery

1. Verify the actual authors, contributors, incoming third-party material, and authority to license the original SoDam-Agent and this port's code, documentation, and prompts under Apache-2.0. Existing `NOTICE` text alone does not establish the chain of title.
2. If using AI-generated code, documents, images, or content, check rights to inputs, current generation-service policies, similarity to protected work, and final human review. Exclusive copyright or commercial safety of AI output is not guaranteed.
3. Before branding with `SoDam-Agent` or `SoDam-Agent-Codex`, search official trademark databases in launch jurisdictions and obtain professional review. Check logo rights separately.
4. Check current terms, commercial plans, and data-handling policies for Codex, Context7, npm, and any connected API, SDK, or model. `npx` may obtain Context7 and its dependencies at runtime, and transitive versions are not locked in this repository.
5. If images, icons, fonts, videos, audio, templates, or sample data are added later, record each file's source, owner, license, commercial-use scope, modification/redistribution rights, and evidence. If packages are bundled later, recheck the complete dependency tree and NOTICE obligations.
6. Immediately before release or delivery, rescan the actual distribution for secrets, personal information, and client data. Review the contract's ownership, disclaimer, warranty, support, and data-processing terms.

**Legal/professional review required:** The contribution chain for the original and port, brand/trademark conflicts, jurisdiction-specific privacy and contract duties, AI-output rights and similarity, and warranties in a specific client contract cannot be resolved from the current files alone. Recheck Context7 transitive dependencies and service terms for the actual delivery and operation model.

> **Legal disclaimer:** This information is for reference, does not guarantee legal effect, and does not replace advice from a qualified lawyer. The user remains responsible for use, publication, distribution, and commercialization. Obtain review from a qualified professional in the relevant jurisdiction before final decisions.

## 19. Current limitations and unverified items

The following were not verified while writing this document or are outside project scope:

- Actual marketplace registration and installation of all 11 plugins in the user's Codex configuration: **not run**
- End-to-end natural-language invocation of every team skill after installation: **not run**
- Context7 MCP initialization negotiation and a real documentation query: **not run**
- Separate `actionlint` validation: **not run because the tool was unavailable**
- Web UI, mobile UI, login, authentication, authorization APIs, database CRUD, server logs, and browser console: **not applicable because these features do not exist here**
- Installation and path compatibility on physical macOS and Linux systems: **unverified**

Passing local static tests does not prove user installation or external-service communication. Before production use, test marketplace registration, list verification, representative team requests, removal, and reinstallation in a separate test Codex environment.

## 20. Update and contribution checklist

When adding or changing a plugin or skill:

1. Read applicable `AGENTS.md`, `package.json`, existing manifests, and existing skills first.
2. Keep `.agents/plugins/marketplace.json` aligned with actual plugin directory names and order.
3. Keep `plugin.json` and `.codex-plugin/plugin.json` identical.
4. Match every skill directory name to the `name` in `SKILL.md` frontmatter.
5. Do not include secrets, personal data, machine-only paths, caches, or logs.
6. Declare an external MCP only where required and pin its version.
7. Run both `npm run validate` and `npm test`.
8. Inspect the package file list with `npm pack --dry-run --json`.
9. Update all four README files, `PORTING_REPORT.md`, and `NOTICE` when relevant.
10. Record real user installation and external-communication tests as passed, failed, or not run.

Do not disable features to pass a test, ignore failed tests, or perform unrelated large refactors.

## 21. Original project and sources

- Original project: [sodam-ai/SoDam-Agent](https://github.com/sodam-ai/SoDam-Agent)
- Codex port repository: [sodam-ai/SoDam-Agent-Codex](https://github.com/sodam-ai/SoDam-Agent-Codex)
- Original baseline commit for the port: `34866df`
- Copyright: Copyright 2026 SoDam AI Studio
- License: Apache License 2.0 — see `LICENSE` and `NOTICE`

The commands in this document were written from the current local Codex CLI help, project `package.json`, manifests, tests, and CI configuration. Before installation, also check `codex plugin --help` for the Codex version you are using.
