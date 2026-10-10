# Public distribution and commercial-use guide

Modified: 2026-10-10. This is a file/document review guide, not individual legal advice or a rights guarantee. Korean counterpart: [LEGAL_AND_DISTRIBUTION.md](LEGAL_AND_DISTRIBUTION.md).

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

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), [official text](https://www.apache.org/licenses/LICENSE-2.0.txt), [Context7 MIT LICENSE](https://github.com/upstash/context7/blob/master/LICENSE). Checked 2026-10-10. Metadata was queried using npm view @upstash/context7-mcp@4.1.1 license repository.url --json; no package was installed. No findings in known-key/file-name checks do not guarantee the absence of all personal information, infringement or confidential material. Known-key patterns were also checked in 93 unique blobs across nine reachable historical commits. Full semantic privacy/copyright review of history, external service internals and runtime dependencies not downloaded remain outside scope.
