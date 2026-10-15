# Public distribution and commercial-use guide

Modified: 2026-10-12. This is a file/document review guide, not individual legal advice or a rights guarantee. Korean counterpart: [LEGAL_AND_DISTRIBUTION.md](LEGAL_AND_DISTRIBUTION.md).

## Confirmed facts

- The project declares Apache-2.0. Its LICENSE matches the official Apache License, Version 2.0 text after whitespace normalization. The English text governs. No additional restrictions were added to LICENSE.
- The existing notice is Copyright 2026 SoDam AI Studio. It is preserved; this does not establish contributor agreements or assignments of original rights.
- NOTICE supplies attribution, not additional license conditions. Because this distribution includes it, retain applicable readable notices when redistributing. This does not mean every Apache project must create a new NOTICE.
- Root package.json has no direct dependencies/devDependencies. No lockfile, node_modules, assets, public, images, fonts, audio or video were found in the public candidate inventory. Skill documents, prompts and test examples are included.
- web-app-team and research-team separately run @upstash/context7-mcp@4.1.1 through npx. Its version-specific npm metadata and official repository LICENSE identify MIT. No blanket prohibition against combination with Apache-2.0 was identified where MIT notices are retained. It is not bundled here. The full runtime dependency tree, other MCPs and service terms remain unverified.

## What can you do?

| Use | Guidance |
|---|---|
| Personal/internal business use, study, teaching | Use Apache-2.0-covered material subject to its terms; redistributed teaching material must retain notices too. |
| Modification, copying, forking | Permitted. Mark modified files and retain applicable original notices. |
| Redistribution, sale, client delivery | Permitted. Supply LICENSE and applicable NOTICE/attribution, and preserve modification notices. Client inputs and contractual rights need separate review. |
| Paid service operation | Apache-2.0 does not itself prohibit commercial operation. Separately check service terms, privacy, client contracts and API costs. |
| Keeping modified source private | Apache-2.0 does not generally require publication of modified source. Redistribution conditions and other included licenses still apply. |
| External API results, AI output, images, fonts, models | This project's license does not automatically cover them. Check provider policies, input rights, sources, similarity/infringement risk and final review. |

## Prohibited conduct and responsibility boundaries

- Do not remove applicable notices or claim exclusive ownership of others' code/content. Apache-2.0 does not authorize trademarks, logos, characters or claims of official affiliation.
- Do not publish client internal material, personal information, credentials, private APIs or detailed local execution records in samples or lessons. Do not replace dummy test values with real accounts.
- No copyright eligibility, exclusive rights, provenance or commercial safety is guaranteed for AI-generated code, documents, images or content. Review provider policies, input permissions and similarity/infringement risks before final use.
- Warranty disclaimers and liability limits depend on LICENSE Sections 7–9, applicable law and separate agreements. Mandatory exceptions, such as deliberate or grossly negligent acts, are not erased. Offer extra warranties only on your own responsibility.
- The patent grant is limited to relevant contribution claims and may terminate in specified patent litigation. It does not eliminate every patent risk.

## Priorities before public or client distribution

**Must Have:** Include distribution files and LICENSE/NOTICE, mark changes, exclude secrets/personal data, verify actual input rights, and review version-specific licenses/notices if bundling external packages. Exclude CHECKPOINT.md, .sodam-agent, local outputs records/backups, caches, keys and environment settings. .gitignore does not untrack existing files: inspect git ls-files and staged diffs too.

**Should Have:** Review client contracts, commercial AI/API pricing and data terms, contributor/original rights evidence and trademark presentation. Resolve newly identified questionable material before publishing it.

**Could Have:** Add an SBOM, per-file rights register and periodic reviews for actual distributed dependencies. Do not install a scanner unconditionally in a dependency-free repository.

## Legal/professional review required

Original SoDam-Agent and contributor ownership/licensing authority, trademarks, jurisdiction-specific AI/privacy law and client warranty, indemnity and confidentiality terms cannot be established by this file review. Reassess when introducing real client data, third-party content or additional packages. Distinguish technical checking of public source changes from rights guarantees for a particular delivery.

## Official sources and inspection limits

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), [official text](https://www.apache.org/licenses/LICENSE-2.0.txt), [Context7 MIT LICENSE](https://github.com/upstash/context7/blob/master/LICENSE). Checked 2026-10-10. Metadata was queried using npm view @upstash/context7-mcp@4.1.1 license repository.url --json; no package was installed. No findings in known-key/file-name checks do not guarantee the absence of all personal information, infringement or confidential material. The previous 2026-10-10 guide reported a historical Git scan; this review cannot reconfirm it because the canonical folder has no Git metadata. Full semantic privacy/copyright review of history, external service internals and runtime dependencies not downloaded remain outside scope.

## Current-file review on 2026-10-12

This review is not legal advice or a non-infringement guarantee. Confirm the delivery files, contracts and rights evidence before publication or client delivery.

| Scope | Confirmed facts | Remaining checks |
|---|---|---|
| LICENSE / NOTICE | Whitespace-normalized comparison matches official Apache License, Version 2.0. Copyright 2026 SoDam AI Studio retained | A notice does not establish all original, employment, contribution or assignment rights |
| Code, skills, prompts, templates, documentation, test examples | Present in project files. Root package has no direct dependencies/devDependencies | Complete per-file creation, reuse, quotation and AI-generation provenance is unverified |
| Images, icons, fonts, video, audio, binaries | Such files and assets/public directories were not found in this inventory | Review future additions separately. Example strings in documents are distinct from absent data files |
| External SDKs / APIs / models | Context7 MCP 4.1.1 is obtained separately through npx; version-specific npm metadata says MIT | Full installed transitive dependency tree, service terms, pricing, data processing and commercial model policies unverified |
| Git status, branch, changes, tracked files, history | This canonical folder is not a Git repository. Git checks exit with code 128 | Staged diffs, tracked files and history of the actual public repository were not verified in this review |

The current `npm pack --dry-run --json` candidate lists 173 files, excluding CHECKPOINT.md, .sodam-agent/, outputs/ and .env. No archive, upload or distribution was performed. Package `private: true` prevents npm publish; it does not ensure privacy of GitHub or manual ZIP exports. The npm list does not establish the GitHub publication list.

**Publication path cleanup:** On 2026-10-12, PC absolute paths in the following review/requirements documents were replaced with `<project-root>`, `<test-project-root>`, and `<approved-test-area>`. Originals remain in a private local backup. These labels identify the development source, test project, and authorized area; they are not installation paths. Actual Git-tracked files and history must still be checked before distribution.

- `docs/FINAL_VERIFICATION_85947ceb_KO.md`
- `docs/LEARNING_MANAGEMENT_ACCEPTANCE_20261012_2e24063e_KO.md`
- `docs/MIDTEST_06f2430a_KO.md`
- `docs/USER_INTENT_AND_REQUIREMENTS_2026-10-11.md`

Known token/private-key patterns and risky filenames were not found across 233 local text files. This does not fully detect ordinary passwords, personal data, client secrets, similar protected works or private APIs. Resolve suspicious material with its rights holder; do not approve unverified material for sale or delivery.

### Beginner steps for delivery or sale

1. Separate your material from external material; record source, owner, license, modification and evidence links. Missing original SoDam-Agent/contributor rights evidence requires **legal/professional review**.
2. Material you have authority to provide under Apache-2.0 can be copied, forked, modified, taught, sold, used in services or delivered to companies/clients. Redistribution must supply LICENSE and applicable NOTICE, original notices and change notices. Permission to sell does not guarantee compliance with client warranties or indemnities.
3. If bundling external packages, record version-specific license texts, copyright notices and transitive dependencies. Retain the MIT notices if bundling that MIT package. Code licenses are separate from API access, commercial plans and model-output policies.
4. Human review of AI-generated code, prompts, documentation and content must check input permissions, sources, similarity/infringement risks and provider policies. Generation alone does not guarantee exclusive rights or commercial safety.
5. Separate client inputs, learning stores, test accounts, personal data, screenshots, settings and keys from public copies. Sharing reviewed generic procedures does not supersede client confidentiality contracts or input rights.
6. Apply these checks to actual publication files, Git tracking/staging/history and final artifacts. Hold publication/delivery of unresolved material; seek professional review for contract, privacy, trademark and AI rights. Warranty disclaimers and liability limits follow LICENSE, mandatory law and separate contracts.

This review adds no license restrictions and guarantees neither original rights, external-service compliance nor legality of a particular delivery.

## 2026-10-15 current public candidate review

This review checked **207 files** in the npm distribution candidate. Earlier counts of 173 and 233 describe historical scopes, not current results. LICENSE and NOTICE are included; CHECKPOINT.md, private learning records, outputs and key files are excluded. No known secret-key patterns were found. This does not establish the absence of all personal data, copyright issues or customer secrets.

The root has zero direct runtime/development dependencies. No lockfiles, assets/public directories, images, fonts, video or audio were found in the public candidate. Version-specific npm metadata again identifies Context7 4.1.1 as MIT; separately downloaded transitive dependencies, pricing, service terms and model policies were not verified. No scanner was installed and no external package was executed.

**Required before publication, distribution or delivery:** the canonical folder is not a Git repository, so Git status, current branch, changed files, tracked files and history remain unverified. This review covers the npm candidate and does not certify GitHub files or a manual ZIP. Repeat inspection on the exact delivery bundle. Treat excluded local directories such as outputs and .remember as private; do not ZIP the whole working folder.

**Rights evidence register:** for each added or delivered item record its path, author, source, exact version/license, commercial-use/modification/redistribution conditions, changes, evidence location and reviewer. Incomplete original-contribution or AI provenance must remain marked 'legal/professional review required'; do not guarantee rights. Apply the same review to customer personal data, internal documents, marks, characters and private API information.

**Service operation and learning data:** the source license does not authorize storing customer material or sharing it across projects. Separately establish customer/NDA obligations, input rights, lawful personal-data processing, retention and deletion-request handling; use the minimum necessary material. Enabling learning or sharing does not replace copyright permission.

**Commercial use:** material that may validly be provided under Apache-2.0 can conditionally be used for personal, educational and company work, copying, forks, modification, sales, redistribution, services and delivery. Preserve the license copy, applicable NOTICE/attribution and change notices. Check external API plans, models, fonts, images and AI outputs separately. Warranty disclaimers and liability limits do not override mandatory law or separate contracts. This guidance adds no license restrictions and is not legal advice.

Official sources rechecked: [Apache current license](https://www.apache.org/licenses/), [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), [Context7 MIT text](https://github.com/upstash/context7/blob/master/LICENSE). Commands: npm pack --dry-run --json; npm view @upstash/context7-mcp@4.1.1 license repository.url dist.integrity --json. No package installation, publication or delivery was performed.
