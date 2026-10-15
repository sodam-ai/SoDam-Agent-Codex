// Copyright 2026 SoDam AI Studio. Apache-2.0.
import assert from 'node:assert/strict';
import {auditWorkflow} from '../plugins/autonomy-team/runtime/workflow-audit.mjs';
const turns=[
  {key:'a',status:'open'}, {key:'b',status:'incomplete',plan:{}},
  {key:'c',status:'interrupted'}, {key:'d',status:'skipped'},
  {key:'e',status:'open',plan:{}}, {key:'f',status:'closed'},
  {key:'g',status:'closed',storageLimited:true}, {key:'h',status:'closed'}, {key:'i',status:'closed'}
];
const state={experiences:[{id:'event-e',outcome:'verified'},{id:'event-f',outcome:'verified'},{id:'event-h',outcome:'failed'},{id:'event-i',outcome:'unverified'}]};
const before=JSON.stringify({turns,state});
const r=auditWorkflow({turns},state);
assert.equal(r.counts.startWithoutDispatch,1);assert.equal(r.counts.dispatchWithoutFinish,1);
assert.equal(r.counts.recordAwaitingClose,1);assert.equal(r.counts.interrupted,1);assert.equal(r.counts.skipped,1);
assert.equal(r.counts.storageNotRecorded,1);assert.equal(r.counts.verified,1);assert.equal(r.counts.failed,1);assert.equal(r.counts.unverified,1);
assert.equal(r.historyRewritten,false);assert.equal(r.automaticReplay,false);assert.equal(r.pending.length,3);
assert.equal(JSON.stringify({turns,state}),before);
const bounded=auditWorkflow({turns:Array.from({length:50},(_,i)=>({key:String(i),status:'open'}))},{experiences:[]});
assert.equal(bounded.inspected,50);assert.equal(bounded.pending.length,20);assert.equal(bounded.pendingTruncated,true);
console.log('PASS: complete bounded stage classification, pending limit, missing versus interrupted and immutable history');
