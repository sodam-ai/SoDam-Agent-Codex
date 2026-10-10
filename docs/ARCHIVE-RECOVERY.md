# Explicit learning archive and recovery

These operations run on request through the local runtime; they create no scheduled task.

`node plugins/autonomy-team/runtime/cli.mjs archive <absolute-workspace> <request-relative-path>`

Request: `{ "authorize": true, "destination": "learning-snapshot.json" }`.
Finish or skip all open work first. The controller's exclusive lock protects a snapshot
from other cooperating controller writes. It never bypasses an existing lock.
Snapshots contain all regular files in `.sodam-agent`, except its transient lock.
Limits: 500 files/directories, 12 directory levels, 32 MB decoded file data.
Linked entries and hardlinks are rejected. Every file is hashed and the written
snapshot is reread. Existing destinations and destinations inside the active store
are rejected, including Windows case variants. Expired policy may be archived.

`node plugins/autonomy-team/runtime/cli.mjs restore <absolute-workspace> <request-relative-path>`

Request: `{ "authorize": true, "archive": "learning-snapshot.json", "destination": "recovered-learning" }`.
The destination's parent must exist; the destination itself must not exist.
All entries are validated before creating the recovery directory. Recovered bytes
are reread and compared. A write failure leaves the partial recovery directory for
inspection and returns failure; it does not delete or overwrite existing data.

Recovery is a separate, inactive copy for the same original workspace. It does not
replace the active store, reset capacity, migrate projects or renew authorization.
External task artifacts are not copied; their referenced hashes remain in records.
Keep these artifacts separately to retain reusable evidence. External programs
that ignore the lock are outside the snapshot consistency guarantee. Hashes detect
accidental changes, not malicious replacement of both data and hashes.
Snapshots contain private local work records: do not commit or publish them.

## Bound quality criteria and lesson provenance

Optional `quality.definition` contains an ordered description for each actual check
(1–1000 checks, each at most 400 characters). Its length must equal `quality.criteria`.
Definitions are trimmed, Unicode-normalized and SHA-256 hashed for paired comparison.
Changed definitions, or a definition present on only one side, defer confirmation.
Legacy records without definitions remain supported; they do not bind full criteria.
Checks and counts are caller-reviewed, not independent semantic certification.

Recalled lessons include `sourceExperienceId`, `recordedAt` and evidence paths/hashes.
Applicability still needs review of the objective and checks. Exact duplicate removal
and same-objective alternatives do not provide complete semantic conflict detection.

Next stages remain explicit: safe active-history continuation, structured application
conditions, role application receipts and reproducible installed-version recovery.

## Explicit bounded continuation

`node plugins/autonomy-team/runtime/cli.mjs continue <absolute-workspace> <request-relative-path>`

Request fields: `authorize:true`, `expectedPolicySha256` from capacity inspection,
`archive` (new snapshot path), and a strictly increased `maxExperiences` or
`maxAgents`. Policy limits stay at 1000 experiences and 20 roles. A verified archive
is saved first, then the policy/state/journal must still match it under the lock.
No existing records are removed, budgets are not reset, and expiry is unchanged.
Expired authorization cannot continue. This requires an explicitly authorized
capacity change; the learning hooks never call it automatically. It is not archive
rotation, unlimited operation, or a new authorization lease. New requests after a
partial failure must use a different archive path; the existing snapshot is retained.

## Storage pressure and CLI fallback

`capacity` reports the sizes of policy/state/hooks JSON files, each capped at
4,000,000 bytes. `nearLimit` starts at 80 percent. Other recovery/role files
are not included in this core-file total. Oversize writes stop before replacing
existing readable state; there is no automatic pruning or expiry renewal.
Archives retain their separate 48,000,000-byte encoded JSON limit.
If MCP is unavailable, `read-role` and `role-step` use the same guarded workflow
through `node runtime/cli.mjs <operation> <absolute-workspace> <request-file>`.
These operations require an authorized live dispatched turn and selected role.
