// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Read-only reconciliation. A missing stage is never classified as data loss.
export function auditWorkflow(journal, state) {
  const counts = {verified:0,failed:0,unverified:0,storageNotRecorded:0,skipped:0,interrupted:0,startWithoutDispatch:0,dispatchWithoutFinish:0,recordAwaitingClose:0};
  const pending = [];
  for (const turn of journal.turns) {
    const experience = state.experiences.find(item => item.id === 'event-' + turn.key);
    let stage;
    if (turn.status === 'skipped') stage = 'skipped';
    else if (turn.status === 'interrupted') stage = 'interrupted';
    else if (turn.status === 'closed') stage = turn.storageLimited ? 'storageNotRecorded' : ['verified','failed','unverified'].includes(experience?.outcome) ? experience.outcome : 'unverified';
    else if (experience) stage = 'recordAwaitingClose';
    else stage = turn.plan ? 'dispatchWithoutFinish' : 'startWithoutDispatch';
    counts[stage]++;
    if (['recordAwaitingClose','dispatchWithoutFinish','startWithoutDispatch'].includes(stage) && pending.length < 20)
      pending.push({turnKey:turn.key,stage,nextAction:stage === 'recordAwaitingClose' ? 'review-original-finish-input-and-evidence' : 'review-original-request-and-work-evidence'});
  }
  return {readOnly:true,inspected:journal.turns.length,counts,pending,pendingTruncated:counts.recordAwaitingClose + counts.dispatchWithoutFinish + counts.startWithoutDispatch > pending.length,
    historyRewritten:false,automaticReplay:false,assurance:'Missing stages need review; interruptions, intentional skips and unknown execution are not proven data loss. Original input and authority are required to resume.'};
}
