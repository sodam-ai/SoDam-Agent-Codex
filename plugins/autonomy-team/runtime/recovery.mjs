// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import {verifyArtifacts} from './output-verifier.mjs';

// Keep failed telemetry immutable. A caller-reviewed repair links a later,
// recognized successful work event and a still-current artifact to that failure.
// This proves the linkage, not the semantic correctness of the repair.
export function recordRecovery(bridge,input) {
  assert.ok(input && typeof input==='object' && !Array.isArray(input));
  assert.deepEqual(Object.keys(input).sort(),['evidence','failedToolKey','reason','semanticReviewed','successfulToolKey','turnKey'].sort());
  for(const field of ['turnKey','failedToolKey','successfulToolKey'])assert.match(input[field],/^[a-f0-9]{32}$/);
  assert.equal(input.semanticReviewed,true);
  assert.ok(['corrected-input','repaired-environment','corrected-output'].includes(input.reason));
  verifyArtifacts({workspace:bridge.c.root,evidence:input.evidence});
  return bridge.mutate(j=>{
    const t=bridge.turn(j,input.turnKey);
    assert.equal(t.status,'open');assert.ok(t.plan);
    assert.ok(!bridge.c.state().experiences.some(e=>e.id==='event-'+t.key),'finish already saved');
    const failed=t.tools.findIndex(x=>x.key===input.failedToolKey && x.outcome==='failed');
    const successful=t.tools.findIndex(x=>x.key===input.successfulToolKey && x.outcome==='executed' && x.workTool===true);
    assert.ok(failed>=0 && successful>failed,'later successful work event required');
    const receipt={failedToolKey:input.failedToolKey,successfulToolKey:input.successfulToolKey,reason:input.reason,evidence:bridge.c.fingerprint(input.evidence),semanticReviewedByCaller:true};
    const prior=(t.recoveries??[]).find(x=>x.failedToolKey===input.failedToolKey);
    if(prior){assert.deepEqual(prior,receipt,'recovery receipt changed');return {recorded:true,duplicate:true,semanticRecoveryVerified:false};}
    assert.ok(!(t.recoveries??[]).some(x=>x.successfulToolKey===input.successfulToolKey),'work event already used for recovery');
    t.recoveries??=[];assert.ok(t.recoveries.length<100);t.recoveries.push(receipt);
    return {recorded:true,duplicate:false,semanticRecoveryVerified:false};
  });
}

export function unresolvedFailures(bridge,turn) {
  return turn.tools.filter(tool=>tool.outcome==='failed' && !(turn.recoveries??[]).some(r=>{
    try {
      assert.equal(r.failedToolKey,tool.key);assert.equal(r.semanticReviewedByCaller,true);
      const failed=turn.tools.findIndex(x=>x.key===r.failedToolKey && x.outcome==='failed');
      assert.ok(turn.tools.findIndex(x=>x.key===r.successfulToolKey && x.outcome==='executed' && x.workTool===true)>failed);
      assert.deepEqual(r.evidence,bridge.c.fingerprint(r.evidence.map(p=>p.path)));
      return true;
    } catch {return false;}
  }));
}
