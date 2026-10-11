# Automatic operation across different projects

This document separates implemented behavior from unverified scope. No scheduled task or persistent background process is created.

## Workflow

1. A trusted start hook for a real new request resolves the current workspace.
2. A project inside an existing approved work area can connect automatically. Outside, excluded, expired or exhausted scopes are not authorized.
3. The model classifies the task. Use `kind:general`, `route:autonomy-team` when none of the existing 13 specialist routes fits. The general route performs the work without recursively invoking this skill.
4. Dispatch with the real start identifier recalls project-local lessons. Matching `contextTags` and separate sharing consent also allow retrieval of suitable portable procedures from connected projects.
5. Review actual work, saved artifacts and execution before finish. Save only procedures supported by actual work.
6. Existing agent creation, pilot use, evaluation, disabling and rollback remain in place. A shared lesson does not prove agent creation, independent execution or measured improvement.

## Sharing consent and disabling

Work-area approval defines file-operation scope. Cross-project procedure reuse is a separate management decision. Existing areas default to sharing disabled. Ordinary hooks and MCP calls cannot grant or renew sharing.

An administrator obtains the actual area ID through `area-inspect` and writes a JSON request inside the approved area. Replace the example ID with its actual value.

```json
{"authorize":true,"areaId":"actual 32-character area ID","enabled":true}
```

```powershell
node "actual installed runtime/cli.mjs path" area-sharing "absolute approved work-area path" "relative request file.json"
```

Set `enabled:false` to disable sharing. Disabling remains possible after expiry or revocation and preserves experience records. Enabling never renews consent. Both the requesting and source areas must opt in. Legacy independently authorized project stores are not automatically enrolled.

Sharing consent is stored separately in `procedure-sharing.json`. No new field is added to the existing `registry.json`, preserving legacy authorization checks. The new version checks the area ID, directory identity and existing grant validity together. Corrupt sharing data rejects sharing without overwriting or automatically repairing authorization data. Older versions do not execute sharing, so installed-copy synchronization and a fresh-process check remain necessary.

A `shareProcedures` field left by an intermediate development version remains readable but is not treated as separate sharing consent. The new code does not automatically delete or migrate that field. Older versions reject it, so an existing field requires explicit recovery.

## Eligible shared lessons

A portable procedure requires `lesson.portable:true`, at least one `applicability.required` tag, semantic review `semanticReviewed:true`, privacy review `portableReviewed:true`, and actual verified workflow finish. Failed hypotheses and unverified results are not shared as successful lessons.

The model must remove customer/project names, personal information, source text, local paths and confidential details while specifying applicability. Validation rejects representative paths, email addresses, phone numbers, secrets and executable instructions; it does not guarantee complete anonymization. Omit `portable` when safety is uncertain, retaining a local lesson only.

Source files and contents are not copied. Shared responses contain the bounded procedure, conditions, opaque source ID and evidence hashes without source paths. Retrieval rechecks evidence changes or loss, authorization expiry/revocation, exclusions and replaced directories. Agent-attributed lessons require a confirmed source role with valid files. Pilot and disabled roles are excluded.

Retrieval is limited to 16 connected projects, 24 recent records per project and up to 3 shared procedures (in addition to up to 3 project-local lessons). Each evidence file is limited to 256 KiB and total evidence to 4 MB per retrieval. `sharedSelection` distinguishes missing consent/context, unavailable retrieval, truncation and inspection counts. File checks do not prove work effects.

## Current completion boundaries

- General-task routing and separately consented cross-project procedure retrieval are implemented.
- Existing authorization, real event identifiers, failure handling, source preservation and agent lifecycle rules remain intact.
- New chats require actual start hooks and identifiers from the host. Missing events in cross-chat transport are not replaced with fabricated starts.
- Arbitrary unapproved projects, automatic storage for projectless chats, every new chat's actual behavior, and the complete common-agent creation/improvement/on-off operation are not claimed complete.
- Technical tests with isolated HOME do not prove real user work or long-term improvement. Installed-copy synchronization and separate actual requests across different projects require further verification.

This project does not train model weights. The working model extracts bounded procedures from verified experience and applies them to later work.
