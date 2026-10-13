# SoDam-Agent-Codex

<!-- Modified 2026-10-13 by SoDam AI Studio: beginner-oriented README restructure and synchronized HTML. -->

**English** | [한국어](README.md) · [HTML](README.en.html)

> A Codex plugin marketplace for specialist work instructions and reuse of verified experience. It provides **12 plugins and 56 skills**, with **version 0.3.9 and current reinforcements**.

Open Codex on your computer and request ordinary work. Follow installation → quick start → automatic operation. Phones can display the guide; mobile execution of this local plugin is unverified.

## Contents

0. [Version status and update summary](#section-0)
1. [What is SoDam-Agent-Codex?](#section-1)
2. [Prerequisites and required programs](#section-2)
3. [Download](#section-3)
4. [Installation](#section-4)
5. [Quick start](#section-5)
6. [Teams and management tools](#section-6)
7. [Running and using the plugin](#section-7)
8. [Automatic learning and agent operations](#section-8)
9. [Command reference](#section-9)
10. [Workflow](#section-10)
11. [File and document locations](#section-11)
12. [Troubleshooting](#section-12)
13. [FAQ](#section-13)
14. [Security and data flow](#section-14)
15. [Folder structure and architecture](#section-15)
16. [Development, tests and distribution](#section-16)
17. [Updating and contributing](#section-17)
18. [Legal, copyright, licensing and commercial use](#section-18)
19. [Limits and unverified scope](#section-19)
20. [Original project and sources](#section-20)

---

<a id="section-0"></a>

## 0. Version status and update summary

Current inventory: **12 / 56 / 24** (plugins / skills / manifests). Check package.json and the installation/automatic-operation chapters. Technical tests and actual effects are distinct.

<details open>
<summary>Latest reinforcements — click to collapse</summary>

- Persistent global operation until disabled, with separate migration of existing policies.
- Visible active/inactive state, verified lesson storage and relevant reuse.
- Role generation/improvement pilots, failure disable/rollback and completed-history retention.
- Preserved failure records linked to subsequent repair evidence, plus actual role-file reads and hash reviews.
- Twenty-six isolated test scripts and a separate installation-layout test; these do not guarantee every new chat or long-term effects.

</details>

<details>
<summary>Earlier release history</summary>

<h3 id="autonomy-039">0.3.9 Windows MCP cache directory lock fix (2026-10-09)</h3>

On Windows, the MCP process moves its working directory to the Node executable directory to release the mutable plugin cache. Absolute workspace authorization checks and hook definitions are preserved. Existing processes need a separate reconnect; live Desktop automation remains a separate verification target.

<h3 id="autonomy-038">0.3.8 Paired evaluation task linkage (2026-10-09)</h3>

An optional evaluationTaskId links baseline and candidate runs across separate turns. Turn execution evidence and experiences remain separate; conflicting kind, gap or goal is rejected. Matching inputs and actual quality improvement still require separate verification. This does not certify live Desktop hook execution.

<h3 id="autonomy-037">0.3.7 Nested command failure handling (2026-10-09)</h3>

MCP delivery success is distinguished from command success. Bounded JSON metadata failures and timeouts remain failures; oversized or malformed status remains unknown. Raw failure output is not persisted. Full CLI/Desktop workflows and role improvement still require separate real-use validation.

<h3 id="autonomy-036">0.3.6 Structured workflow dispatch and finish (2026-10-09)</h3>

An explicitly authorized project can dispatch and finish through structured MCP input. Verified finish requires caller semantic review, actual artifact checks, execution evidence and no unresolved failures. Existing CLI operations and failed records are preserved; kind-only lesson recall is supported. Automatic selection, reuse and role effectiveness require separate real-use evidence.

<h3 id="autonomy-035">0.3.5 read-only artifact verification (2026-10-09)</h3>

A bundled read-only MCP checks authorized project text artifacts and returns execution status and hashes without exposing content. Invalid paths, linked files, expired authorization, oversized files and known secret shapes reject. Semantic review remains required. Actual Codex connection and cross-session verified reuse require separate live tests.

<h3 id="autonomy-034">0.3.4 invalid options and journal preservation (2026-10-09)</h3>

Empty strings, zero, false and null in gap/excludedKinds are validated instead of being treated as omitted options. Invalid requests reject before changing classification or experience state. Valid requests and existing records are preserved. Actual automation still requires separate host verification.

<h3 id="autonomy-033">0.3.3 relevant experience selection and role integrity (2026-10-09)</h3>

Recall filters by task kind and capability gap before selecting at most three reusable lessons. Recent unrelated work no longer hides matching experience. Active roles included in recall are checked against their file, hash and canonical template; tampering stops recall for review. Existing experience and roles are preserved. Actual Codex automation and task quality improvements still require separate verification.

<h3 id="autonomy-032">0.3.2 bounded maintenance and hook compatibility fixes (2026-10-09)</h3>

Adds bounded local maintenance, deadlines, recovery and Interrupt compatibility. See [autonomy guide](docs/AUTONOMY.md) for scope and limits. This does not certify actual host automation or improved task quality.

<h3 id="autonomy-030">0.3.0 automatic connection and verified experience reuse (2026-10-09)</h3>

The original 11 plugins and 46 skills remain preserved: **12 plugins and 56 skills** in total. autonomy-team adds project-authorized SessionStart, UserPromptSubmit, PostToolUse, Stop and Interrupt hooks with dispatch/finish. It records actual tool events, measured time and artifact hashes, and revalidates successful procedures before reuse. Repeated capability gaps can produce bounded task-specific role instructions.

Read [the operating guide, trust setup and limits](docs/AUTONOMY.md). Install with `codex plugin add autonomy-team@sodam-agent-codex`, then review and trust the actual definition through Codex `/hooks`. Installation alone does not execute hooks. Desktop and CLI profiles and fresh conversations need separate verification.

This does not retrain model weights or provide a background scheduler. Work uses installed relevant skills and current tool permissions. Generated roles remain pilots until paired effectiveness checks pass. Hook telemetry and hashes are execution/file evidence, not semantic quality certification. Local tests and actual Codex automatic use are separate. Historical 2026-09-23 installation evidence below covers the previous 11 plugins.

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
- Added tests that verify eight adversarial and error cases are rejected, not only that valid cases pass.
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

<details>
<summary><strong>2026-09-23 — Installed plugin and repository sync</strong></summary>

- Updated the verification guide to reflect the plugins installed on this PC.
- Corrected all 11 plugins' information links from the original Claude Code repository to this Codex port and bumped versions so the update can reach installed copies.
- Fixed validation of CRLF line endings produced by Git on Windows and added a regression test.
- Kept natural-language team selection and external MCP communication separate from installation status.

</details>

</details>

Documentation restructure: 2026-10-13. Chapters describe the current source; earlier history records its dated context. Removing expiry is separate from proving learning effects in every project.

---

<a id="section-1"></a>

## 1. What is SoDam-Agent-Codex?

This project is **a toolbox that adds role-specific work instructions to Codex**. For example, after installing `docs-team`, you can ask, “Use the documentation team to write a beginner guide,” and Codex can apply the writer, editor, and fact-checker instructions.

Important points:

- Not every team runs automatically. Codex uses relevant skills based on installed plugins and your request.
- A team skill uses only the roles needed for a small request.
- It does not create subagents automatically unless you explicitly request team work or parallel processing.
- High-impact actions such as deletion, deployment, and external transmission require user authority and confirmation.
- AI output needs review. Legal, security, privacy, and deployment results especially need final human verification.

### Terms for beginners

| Term | Plain meaning |
|---|---|
| Project folder | A location holding files for one piece of work. |
| Terminal / PowerShell | A window for giving a program commands. Search for PowerShell in the Windows Start menu. |
| Node.js / npm | The program running these JavaScript tools and its accompanying package command. |
| Codex | The environment receiving requests and performing AI work. Downloading this repository alone does not run AI. |
| Plugin / skill | An added feature bundle / a document describing a work procedure. |
| Hook | Processing connected to events such as request start or tool completion. Installation and trust are separate. |
| MCP | A request/response connection between Codex and a separate tool process. |
| Learning while working | Saving evidence and lessons for relevant later work. It does not retrain the underlying model weights. |

---

<a id="section-2"></a>

## 2. Prerequisites and required programs

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

---

<a id="section-3"></a>

## 3. Download

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

---

<a id="section-4"></a>

## 4. Installation

Installation has two stages: register the **marketplace**, then add the **plugins** you want.

### 4.1 Register the local folder as a marketplace

Run this in Windows PowerShell or a terminal. Replace the example path with the actual project folder:

```powershell
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"
```

Verify registration:

```powershell
codex plugin marketplace list
```

Look for `sodam-agent-codex` in the output.

### 4.2 Register the GitHub marketplace

```powershell
codex plugin marketplace add sodam-ai/SoDam-Agent-Codex --ref main
```

If this fails, the repository may not exist yet, may be private, or there may be a network or access-permission problem.

### 4.3 Add selected plugins

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

### 4.4 Add all twelve plugins

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
codex plugin add autonomy-team@sodam-agent-codex
```

If installed plugins do not immediately appear in the current Codex UI, open a new task or restart Codex, then check the list again. Display location and naming can vary by app version.

---

<a id="section-5"></a>

## 5. Quick start

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

For work learning also add `codex plugin add autonomy-team@sodam-agent-codex`, then configure the global profile once in [chapter 8](#section-8). Do not reconfigure a PC already active.

---

<a id="section-6"></a>

## 6. Teams and management tools

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

### One coordination and learning plugin

`autonomy-team` provides 10 coordination, archviz/cad/comfyui specialization, role building, piloting, review and rollback skills, with local hooks and an MCP runtime. Check `.agents/plugins/marketplace.json` and `plugins/autonomy-team/skills/` for exact names.

---

<a id="section-7"></a>

## 7. Running and using the plugin

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

---

<a id="section-8"></a>

## 8. Automatic learning and agent operations

<!-- automatic-operation-start -->
An explicitly enabled persistent profile stays on **until you disable it**. Trusted start hooks identify and connect new chats and different work projects. Weekly renewal is unnecessary. Existing finite project/area policies are not silently migrated; check migration separately. Storage, role, retry and file-access limits still apply.
<!-- automatic-operation-end -->

### Configure once

After installation, review `autonomy-team/hooks/hooks.json` and its executables, then follow the host's hook-trust procedure. This does not trust unrelated plugins. Check actual CLI and Desktop connections separately.

A beginner can ask Codex: “Enable persistent SoDam operation and automatic agent pilots until I disable them. Check the installed path and policy and preserve existing records.” Actual tools and permissions are required; the request alone does not prove activation.

For manual setup, save `automatic-enable.json` **inside the work project** with the following content. These numbers are example capacity limits, not an expiry period.

```json
{"authorize":true,"enabled":true,"autoPilot":true,"maxAgents":8,"maxExperiences":200,"maxRetries":1}
```

Replace the installed and project paths below. Commands go in the terminal; JSON goes in a file. Never publish personal authorization files.

```powershell
node "installed path/runtime/cli.mjs" automatic-configure "absolute work project path" automatic-enable.json
node "installed path/runtime/cli.mjs" automatic-inspect
node "installed path/runtime/cli.mjs" diagnose "absolute work project path"
```

The installed path is the actual `autonomy-team` folder. For downloaded source use `plugins/autonomy-team/runtime/cli.mjs`. The profile lives at `.sodam-agent-automatic/policy.json` under the current PC user's home. Explicitly migrate independent existing projects with `automatic-adopt` and approved areas with `area-persistent`. Read the [automatic-operation guide](docs/AUTOMATIC_OPERATION.md) for exact input and rollback. Existing policies that retain finite mode still have their configured expiry.

### Disable and inspect

Save `{"authorize":true,"enabled":false}` in `automatic-disable.json` and change the final filename in the configure command. Operation stops at the next policy check and records remain. Use the enable file to turn it on again.

Ordinary replies show this status line:

> [소담 에이전트: 활성 · 자동 학습 켜짐 · 에이전트 자동 시험 적용 켜짐]

Active means policy and capacity permit work. It does not prove task completion or improvement. Inactive, waiting, limited and unverified states are distinct. This is a response line, not a fixed application button.

### Learning, pilots and role management

Learning means **saving verified experience as procedures and applying it to relevant later work**. It does not retrain model weights. Automatic pilots try new or improved roles as `pilot` candidates when evidence qualifies. Roles are not all generated or executed on every request.

Reread real output → validate → save a lesson → review conditions and apply on a later relevant request. Retrieval alone is not application. Environmental or permission errors do not teach capability failure. Keep a lesson without adding a role when sufficient; review improvement of an existing confirmed role first. For a distinct role, record overlap, necessity and maintenance considerations. One actual correction with artifact, quality and role-review evidence can produce a pilot. Legacy proposals without that review still require two distinct work records. Confirmation requires two separate held-out comparisons, matching quality criteria and procedure execution evidence. Correction counts and review judgments are worker-reported, not independent quality guarantees. Failed pilots are disabled and restore the previous verified role with history preserved. Manually disabled versions can be restored with explicit management consent; quality-failed versions cannot be reactivated without qualifying evidence.

**Role review in the latest source:** `review-role` reads an actual registered file and records its content hash before reviewing a new or improved role. Names alone or reviews whose files have changed cannot satisfy the single-correction pilot threshold. A read receipt does not prove procedure execution or improved quality. Ambiguous cached versions are not selected arbitrarily.

**Recovery with failures preserved:** `resolve-failure` links an actual failed event to a later successful work-tool event in the same request and a reviewed output file. Changed files or insufficient evidence cannot support verified completion. The controller checks event ordering and file identity; the worker reviews whether the problem was actually resolved. Environment and permission errors do not become evidence that a new agent is needed.

Beginners can ask Codex: **“Preserve the error record and check the actual repair result. Do not report success or completed learning while it remains unresolved.”** You do not need to manually write the development commands below for each task. Check enabled learning and successful lesson storage separately.

The global profile **does not enable cross-project sharing**. Only reviewed portable procedures are retrieved with separate area consent and matching task conditions. Raw files, personal data and client material are not shared. Read the [cross-project guide](docs/CROSS_PROJECT_OPERATION.en.md) and [learning procedure](plugins/autonomy-team/reference/learning-management.md).

At start events eligible completed history can be hash-checked and archived in `.sodam-agent-history/`. Unfinished work, failures, evaluation evidence and recent procedures remain. Interrupted replacement recovery and replay protection are included, but archive and protected-history limits remain. It does not retrieve every historical lesson without bounds. No scheduled task is required.

Storage and agent counts are inspected separately, with default notices at 80%, 95%, and the limit. Notices at the same stage are not repeated. Important roles and roles whose importance cannot be established are preserved; capacity never triggers arbitrary deletion, merging, or disabling. At the experience limit, task completion and failed learning storage are reported separately. See [capacity and preservation guidance](docs/CAPACITY_GOVERNANCE.md) for rules and limitations.

### Updates and multiple PCs

Ask “Show the SoDam agent list” or use CLI `agent-list` to view generated roles, candidates and defined built-in routes. `agent-catalog` combines explicitly selected projects. Assessments explain protection, verified uses, successors and unknown impact; `capacity` includes management backup storage. Use `agent-preview` to review impact, then `agent-manage` with target-specific consent for protection, on/off, archive and restore. Archive does not reclaim space. Built-in routes are read-only; whole-PC crawling, merge and permanent deletion are unsupported. See [agent management](docs/AGENT_MANAGEMENT.md).

Update source → review changes → update installed files → reconnect the running MCP → verify real calls. `sourceStatus: changed` means the running connection still uses older code. Save work, use a supported reconnect or fully exit/restart the app, then confirm `current`. Do not repeatedly restart once current is confirmed. On another PC recheck installation, profile, paths and authorization rather than copying personal approval files.

---

<a id="section-9"></a>

## 9. Command reference

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

### Automatic-operation and learning runtime commands

These are repository development and diagnostic commands. Ordinary users can request work in natural language. Verify authorization and exact request files before write operations.

```powershell
cd "C:\path\to\SoDam-Agent-Codex"
npm run validate
npm test
node plugins/autonomy-team/runtime/cli.mjs diagnose "C:\path\to\WorkProject"
node plugins/autonomy-team/runtime/cli.mjs status "C:\path\to\WorkProject"
```

| Command | Purpose / caution |
|---|---|
| `diagnose`, `status`, `capacity` | Inspect environment, state and capacity. A healthy diagnostic does not establish complete task success. |
| `capacity-review`, `capacity-rules` | Inspect capacity and protection reasons, or set explicitly authorized project notice and protection rules. See the capacity guidance for usage. |
| `agent-list`, `agent-catalog` | Read agents, states and assessment evidence in the current project or up to 20 explicitly selected projects. This does not search the whole PC. |
| `agent-preview`, `agent-manage`, `agent-recover` | Preview impact, apply target-specific authorized management and recover interrupted writes from backup. Read the [exact request format](docs/AGENT_MANAGEMENT.md) first. |
| `dispatch`, `finish`, `skip` | Start, record outcomes and handle excluded requests. Never record verified success without actual evidence. |
| `recall` | Retrieve lessons and review their applicability. |
| `initialize`, `area-authorize`, `area-revoke`, `area-inspect`, `area-sharing`, `connect`, `workspace-bind` | Manage project/area authorization and connections without expanding permissions automatically. |
| `syntax-check` | Bounded Node source syntax checks, not file execution or full application tests. |
| `read-role`, `role-step`, `continue` | Inspect roles and progress evidence and continue authorized work. |
| `review-role` | Read an actual registered role file and record its hash. Names alone do not constitute review evidence. |
| `resolve-failure` | Link failed and later successful events to reviewed output in the same request. Neither erase failures nor automatically certify repairs. |
| `record`, `plan`, `propose`, `evaluate`, `promote`, `assess`, `rollback`, `cycle` | Handle experiences, candidates, evaluation, promotion and rollback. Recording alone does not prove improvement. |
| `archive`, `restore` | Authorized state archiving and recovery; verify originals and preserve data. |
| `maintenance-authorize`, `maintenance-recover`, `maintenance` | Separately authorized and limited maintenance tools, not prerequisites for everyday use or recommendations for scheduling. |

Commands needing a request file use `node plugins/autonomy-team/runtime/cli.mjs <command> "<absolute workspace>" <request JSON file path>`. Angle brackets indicate placeholders; do not execute them literally. Do not paste JSON contents where a filename is expected. Consult the operating guide for command-specific fields and limits.

### Beginner steps: from listing to safe management

1. Open the project in Codex and ask **“Show this project's SoDam agents and protection reasons.”** Listing does not delete or disable anything.
2. Select a name and ask **“Explain this agent's role, recent records, assessment reasons and effects on other functions.”** Unrecorded usage is unknown. Displayed counts cover the active records, not lifetime totals.
3. For a change, ask **“Preview the impact and backup procedure before disabling this agent.”** Review the exact name, action, protection and blockers. Do not assume unknown external dependencies are safe.
4. After consent to the reviewed target and action, a backup is saved and reread before the change. Changed state requires renewed review. Protected, running and core security/recovery roles may block disable/archive.
5. Inspect the resulting state. **Disable** stops use; **archive** changes state while retaining originals; **restore** returns the pre-archive state. Disable/archive do not reclaim disk space. Merge and permanent deletion are unsupported.

For read-only commands, run these from the repository folder. Replace `C:\Work\MyProject` with your actual existing project path.

```powershell
node plugins/autonomy-team/runtime/cli.mjs agent-list "C:\Work\MyProject"
node plugins/autonomy-team/runtime/cli.mjs capacity "C:\Work\MyProject"
```

For several projects, ask **“Show agents and assessment reasons in these two selected projects”** and specify exact paths. This does not crawl the PC or create authorization in other projects. Failed project queries remain unverified. `/sodam-agent` is an example phrase, not a registered host slash command.

Measured storage includes role files, management backups and archived learning history. Arbitrary external folders and total disk free space are not measured. When warned, review usage, protected items and assessment evidence first. A missing response never authorizes cleanup of important agents or lessons.

### When configuration or connection fails

- Checking this repository does not require a new API key or `.env` file. Follow each connected external service's authentication guidance and keep secret values out of documents.
- If replaced installation files produce `source-changed` or a running-code mismatch, save ongoing work, fully quit and restart Codex, then check MCP again. Matching file hashes and matching running-server code require separate checks.
- An interrupted agent change blocks further mutations; follow the [backup recovery procedure](docs/AGENT_MANAGEMENT.md). Do not remove locks or interruption records after recovery failure.
- Distinguish legacy time-limited authorization from persistent settings. See [automatic operation](docs/AUTOMATIC_OPERATION.md) for operation retained until explicitly turned off. This does not remove host permissions or project access restrictions.

Persistent profile commands: `automatic-configure`, `automatic-inspect`, `automatic-adopt`, `automatic-restore`, `area-persistent`. See chapter 8 for request files and examples.

---

<a id="section-10"></a>

## 10. Workflow

Actual learning follows **request-start registration → work-start record → real work → artifact review → evidence-based experience/lesson storage → relevant lesson selection and review in later work → result verification after application**. Receiving a lesson does not establish application or improvement. Learning here manages procedures, experiences and role instructions; it does not retrain the AI model itself. Newly created or improved roles still require separate technical and actual-work checks. Scheduled jobs are unnecessary.

The project's `.sodam-agent/` may contain private state, experiences, roles and backups. Exclude this folder and personal shared settings from GitHub and delivery files. Cross-project sharing covers reviewed procedures, not raw source material, client information or secrets. When using external MCP or APIs, also review the data sent to the tool and the service's data policy.

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

---

<a id="section-11"></a>

## 11. File and document locations

| File | Purpose |
|---|---|
| `README.md` | Korean Markdown guide |
| `README.en.md` | English Markdown guide |
| `README.html` | Korean HTML guide |
| `README.en.html` | English HTML guide |
| `PORTING_REPORT.md` | Original-to-port mapping, exclusions, and evidence |
| `LICENSE` | Full Apache License 2.0 text |
| `NOTICE` | Copyright, trademark, and external-service cautions |
| `.agents/plugins/marketplace.json` | Source of truth for the 12 installable plugins |
| `plugins/*/plugin.json` | Plugin name, version, description, and skill paths |
| `plugins/*/.codex-plugin/plugin.json` | Compatibility manifest |
| `plugins/*/skills/*/SKILL.md` | Actual role instructions read by Codex |
| `plugins/web-app-team/.mcp.json` | Web app Context7 configuration |
| `plugins/research-team/.mcp.json` | Research Context7 configuration |
| `plugins/autonomy-team/.mcp.json` | Local sodam-output MCP configuration |
| `plugins/autonomy-team/hooks/hooks.json` | Five host event hooks |
| `plugins/autonomy-team/runtime/cli.mjs` | Bounded project operations and read-only diagnosis |
| `plugins/autonomy-team/reference/learning-management.md` | Work-time lesson and role-management procedure |
| `docs/AUTONOMY.md` | Approval, exact request fields, limits and recovery |
| `docs/AUTOMATIC_OPERATION.md` | Automatic operation retained until explicitly turned off |
| `docs/AGENT_MANAGEMENT.md` | Lists, search, assessment evidence, protection, on/off, archive and recovery |
| `docs/CAPACITY_GOVERNANCE.md` | Capacity notices, important-item protection and authorized actions |
| `docs/CROSS_PROJECT_OPERATION.en.md` | Cross-project procedure sharing and privacy review |
| `docs/LEGAL_AND_DISTRIBUTION.md` | Detailed rights and distribution checks (Korean) |
| `scripts/validate.mjs` | Full structure and security-policy validation |
| `plugins/autonomy-team/runtime/role-review.mjs` | Role-file reads and content-hash review |
| `plugins/autonomy-team/runtime/recovery.mjs` | Preserved failures linked to subsequent repair events and evidence |
| `test/*.mjs` | Normal, failure, boundary, and CI-condition tests |

---

<a id="section-12"></a>

## 12. Troubleshooting

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

---

<a id="section-13"></a>

## 13. FAQ

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

### Q11. Does one error permanently make the task a failure?

The original failure stays in the record. The latest source can link later successful work and reviewed output in the same request to record recovery. Unresolved errors prevent verified completion. Success in another request or simply saying “fixed” is not repair evidence.

### Q12. Does reading this guide install the latest features?

No. Source documentation, installed files and running MCP reconnection are separate. If new commands are missing from an existing connection, check installed files, save ongoing work and reconnect. This documentation task does not change installation or configuration.

---

<a id="section-14"></a>

## 14. Security and data flow

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

`web-app-team` and `research-team` declare external Context7 MCP. `autonomy-team/.mcp.json` declares the bundled local sodam-output runtime.

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
- Test rejection of eight adversarial cases, including path traversal, wrong types, name mismatch, MCP path traversal, invalid UTF-8, and invalid MCP structure

---

<a id="section-15"></a>

## 15. Folder structure and architecture

```text
SoDam-Agent-Codex/
├─ .agents/
│  └─ plugins/
│     └─ marketplace.json       # Single registry for 12 plugins
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
│  ├─ autonomy-team/             # Local hooks, MCP, runtime and learning
│  └─ sodam-agent/
│     ├─ plugin.json            # Current manifest
│     ├─ .codex-plugin/
│     │  └─ plugin.json         # Compatibility manifest
│     ├─ .mcp.json              # Present only when required
│     └─ skills/<skill>/SKILL.md
├─ docs/                        # Detailed operation, rights and sharing guides
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

---

<a id="section-16"></a>

## 16. Development, tests and distribution

Run from the project root:

```powershell
cd "C:\path\to\SoDam-Agent-Codex"
npm run validate
npm test
```

The current `npm test` runs these 26 scripts sequentially and stops after a failure. They check normal/error/boundary paths, persistence, permissions, MCP, hooks, lessons and role lifecycle regressions. They do not establish actual model-work effects.

1. `node test/e2e.mjs`
2. `node test/adversarial.mjs`
3. `node test/runtime.mjs`
4. `node test/ci.mjs`
5. `node test/autonomy.mjs`
6. `node test/bridge.mjs`
7. `node test/documentation.mjs`
8. `node test/release.mjs`
9. `node test/maintenance.mjs`
10. `node test/mcp.mjs`
11. `node test/syntax-checker.mjs`
12. `node test/workflow.mjs`
13. `node test/work-learning.mjs`
14. `node test/archive.mjs`
15. `node test/continuation.mjs`
16. `node test/diagnostics.mjs`
17. `node test/areas.mjs`
18. `node test/workspace-binding.mjs`
19. `node test/cross-project.mjs`
20. `node test/automatic.mjs`
21. `node test/status-display.mjs`
22. `node test/retention.mjs`
23. `node test/capacity-governance.mjs`
24. `node test/agent-management.mjs`
25. `node test/agent-catalog.mjs`
26. `node test/recovery.mjs`

Additional checks:

```powershell
node test/role-review-layout.mjs
npm pack --dry-run --json
```

The installation-layout test is currently outside the 26-suite `npm test` runner. It checks single-version resolution and safe rejection of ambiguous versions in a temporary folder. `npm pack --dry-run` inspects a candidate file list without publishing or installing it.

Expected baseline:

- 12 plugins
- 56 skills
- 24 manifests
- 0 runtime dependencies

This repository has no separate application-source lint, TypeScript type-check, or build command. Do not interpret their absence as a pass. The distributable artifacts are plugins, skills, and documents, and the validators target that structure and policy.

---

<a id="section-17"></a>

## 17. Updating and contributing

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

---

<a id="section-18"></a>

## 18. Legal, copyright, licensing and commercial use

Review on 2026-10-12: official LICENSE text and MIT metadata for external Context7 4.1.1 confirmed. The canonical folder has no Git metadata; branch, tracking and history remain unverified. PC absolute paths in four review documents in the npm candidate were sanitized during the publication review; originals remain in a local backup. Per-file original rights, AI output, transitive dependencies and client contracts require legal/professional review. See the [rights and distribution guide](docs/LEGAL_AND_DISTRIBUTION.en.md) for the file list and delivery steps.

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

---

<a id="section-19"></a>

## 19. Limits and unverified scope

**Before packaging:** `.gitignore` does not guarantee exclusion from every ZIP or npm package. `npm pack --dry-run --json` previews included files; it does not deploy them. Exclude `.sodam-agent/`, personal settings, `.env`, keys/certificates, work logs, backups, test outputs and client data, then inspect the actual distribution list. `private: true` in `package.json` prevents npm publication; do not use `npm publish` as an installation step.

**License basis:** Use the [Apache current-license guidance](https://www.apache.org/licenses/) and [Apache License, Version 2.0 text](https://www.apache.org/licenses/LICENSE-2.0). The English text is authoritative. This project license does not establish rights to external services, inputs or AI output. Read chapter 18, `LICENSE` and `NOTICE` together for commercial use, modification and redistribution conditions.

The following were not verified while writing this document or are outside project scope:

- Historical registration and installation/enabled status of the then-existing 11 plugins on this PC: **verified** (2026-09-23, Codex CLI 0.155.1). Other computers/accounts: **unverified**
- Appropriate automatic selection of every team in every new project: **not fully verified**. Installation/enabled status alone does not guarantee selection on every request.
- Context7 MCP initialization negotiation and a real documentation query: **not run**
- Separate `actionlint` validation: **not run because the tool was unavailable**
- Service web/mobile screens, login/authorization APIs and SQL database CRUD: **not applicable because these features do not exist here**. Runtime tests cover local JSON persistence, permissions and errors.
- README HTML display and browser console: documentation checks apply. Checking a document page does not verify service screens or every device.
- Installation and path compatibility on physical macOS and Linux systems: **unverified**

Passing local static tests does not prove user installation or external-service communication. Before production use, test marketplace registration, list verification, representative team requests, removal, and reinstallation in a separate test Codex environment.

---

<a id="section-20"></a>

## 20. Original project and sources

- Original project: [sodam-ai/SoDam-Agent](https://github.com/sodam-ai/SoDam-Agent)
- Codex port repository: [sodam-ai/SoDam-Agent-Codex](https://github.com/sodam-ai/SoDam-Agent-Codex)
- Original baseline commit for the port: `34866df`
- Copyright: Copyright 2026 SoDam AI Studio
- License: Apache License 2.0 — see `LICENSE` and `NOTICE`

The commands in this document were written from the current local Codex CLI help, project `package.json`, manifests, tests, and CI configuration. Before installation, also check `codex plugin --help` for the Codex version you are using.

---

