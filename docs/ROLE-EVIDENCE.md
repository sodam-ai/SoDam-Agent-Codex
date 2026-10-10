# Role selection, loading and execution

After dispatch selects a generated role, call `manage_workflow` with
`operation:"read-role"` and `request:{turnKey}` in the same authorized workspace.
The runtime verifies the selected role, reads its file, checks its SHA-256 and returns
its bounded content. A roleRead receipt is saved in the live turn journal. Modified
files and turns without a selected role cannot acquire receipts. No authorization
or role file is changed.

This proves a controller read, not host understanding or procedure execution. Finish
links role name/hash and successful hook events after loading to roleEvidence.
Those events can include bookkeeping calls; the count does not prove work steps.
procedureExecutionVerified is always false. Direct CLI record cannot supply a live
bridge receipt. Existing records without receipts stay caller-attributed role use,
not independently witnessed application or quality certification.

Reads are idempotent while the role hash is unchanged; closed/interrupted turns
cannot read roles. Finish retry preserves stored evidence. Local state and hook
transport are trusted boundaries, not cryptographic protection against a user who
can modify the store or invoke internal JavaScript methods.

Stricter improvement confirmation, installation and real Desktop procedure execution remain separate unfinished stages.

## Step attribution

Use manage_workflow operation:role-step with request:{turnKey,phase:begin,stepIndex} before the actual step. Indices start at zero and previous steps must be completed. Repeat begin after executing authorized work to retrieve eligibleToolKeys, then submit phase:complete with toolKeys, evidence and semanticReviewed:true. Complete retries must match the original receipt.

Only successful recognized work tools after begin are eligible: exec_command, apply_patch, read_file, write_file, functions.exec_command and functions.apply_patch. Missing or other names remain unverified; management tools do not count. Tool IDs are hashed and raw names/arguments/output are not persisted. A tool event cannot be attributed to two steps. Artifacts require existing safe nonempty text checks and are fingerprinted, but may preexist; the receipt does not prove that the tool created the file or fulfilled the step.

Finish revalidates completed step artifact hashes and stores roleEvidence.steps. procedureEvidenceComplete means every declared step has linked evidence, not semantic correctness. procedureExecutionVerified remains false. Changed/missing step evidence blocks verified finish; failed/unverified finish excludes invalidated step links and marks invalidatedStepEvidence:true, preserving honest failure recording. Interrupted/closed/expired turns cannot add steps; a partially saved finish cannot add steps retroactively.

Hook transport and local state remain trusted boundaries. Caller semantic review, tool naming and step attribution are not independent certification. No new tool execution, scheduler, authority, global settings or model training is introduced.

Copyright 2026 SoDam AI Studio. Repository code/document licensing follows Apache-2.0; see ../LICENSE and ../NOTICE. Modification, copying, redistribution and commercial use follow those terms and required notices. No warranty is provided; liability is limited by the license. Third-party data and tools require their own rights/terms review; this feature grants no permissions to them.
