// Copyright 2026 SoDam AI Studio. Apache-2.0.
// Synthetic technical receipts only; run in the isolated test-suite HOME.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Controller} from '../plugins/autonomy-team/runtime/engine.mjs';
import {configureAutomatic} from '../plugins/autonomy-team/runtime/automatic.mjs';
import {authorizeArea,connectWorkspace,setProcedureSharing} from '../plugins/autonomy-team/runtime/areas.mjs';
import {adaptFromWork} from '../plugins/autonomy-team/runtime/learning.mjs';
assert.equal(process.env.SODAM_TEST_ISOLATED,'1','Run through npm test with an isolated home');
const base=fs.mkdtempSync(path.join(os.tmpdir(),'sodam-evaluation-'));
try {
  configureAutomatic({authorize:true,enabled:true,commonAgents:true});
  const area=authorizeArea(base,{authorize:true,days:7,maxProjects:30,maxMutations:1000,maxAgents:8,maxExperiences:200,maxRetries:1,autoPilot:true});
  const make=id=>{const root=path.join(base,id);fs.mkdirSync(root);connectWorkspace(root,true);return new Controller(root);};
  const a=make('a'),b=make('b');
  const spec={portable:true,objective:'Compare acceptance evidence before completion.',applicability:{required:['coverage'],excluded:[]},procedure:[{action:'inspect-requirements',detail:'Read the acceptance criteria.'},{action:'verify-output',detail:'Compare the saved result with the acceptance criteria.'}],checks:['Unverified requirements remain unverified.']};
  const scope={kind:'docs',gap:'coverage',contextTags:['coverage']};
  for(const id of ['basis-one','basis-two']) {
    fs.writeFileSync(path.join(a.root,id+'.md'),'Synthetic missing coverage.');
    a.record({...scope,id,taskId:id,outcome:'failed',cause:'missing-role',seconds:1,corrections:0,evidence:[id+'.md'],reflection:spec},true);
  }
  const candidate=a.propose({kind:'docs',gap:'coverage',spec}).candidate;
  a.evaluate({candidate});const role=a.promote({candidate}).activated;
  const agent=()=>a.state().agents.find(item=>item.name===role);
  const quality={criteriaId:'coverage',criteria:1,passed:1,errors:0,definition:['All acceptance items verified.']};
  for(const [controller,id,kind] of [[a,'eval-one','docs'],[b,'eval-two','research']]) {
    const file=id+'.md';fs.writeFileSync(path.join(controller.root,file),'Synthetic complete coverage.');
    const evidence=controller.fingerprint([file]);
    controller.record({id:id+'-baseline',taskId:id,kind,gap:'coverage',outcome:'verified',cause:'none',seconds:30,corrections:2,evidence:[file],quality,contextTags:['coverage']});
    // Test receipt never enters a personal project or registry.
    controller.record({id:id+'-pilot',taskId:id,kind,gap:'coverage',agent:role,outcome:'verified',cause:'none',seconds:20,corrections:1,evidence:[file],quality,contextTags:['coverage'],roleEvidence:{name:role,sha256:agent().sha256,loadedByController:true,successfulToolEventsAfterLoad:2,procedureExecutionVerified:false,procedureEvidenceComplete:true,steps:spec.procedure.map((step,index)=>({stepIndex:index,action:step.action,toolKeys:[(index?'b':'a').repeat(32)],evidence,semanticReviewedByCaller:true}))}},true);
  }
  assert.equal(a.evaluationPairs(agent()).coverage.pairedTasks,1);
  assert.throws(()=>a.assess({agent:role}),/two distinct/);
  setProcedureSharing(base,{authorize:true,areaId:area.areaId,enabled:true});
  const assessment=a.evaluationPairs(agent());
  assert.equal(assessment.coverage.pairedTasks,2);assert.equal(assessment.coverage.projects,2);
  assert.equal(assessment.coverage.sourceArtifactsCopied,false);
  fs.writeFileSync(path.join(b.root,'eval-two.md'),'Changed fixture.');
  assert.throws(()=>a.assess({agent:role}),/paired evidence changed/);
  fs.writeFileSync(path.join(b.root,'eval-two.md'),'Synthetic complete coverage.');
  const before=b.state();const failed=structuredClone(before);
  failed.experiences.push({...failed.experiences.at(-1),id:'peer-error',taskId:'peer-error',outcome:'failed',cause:'environment'});
  b.save(failed);
  assert.equal(adaptFromWork(a,scope).status,'pilot-environment-unresolved');
  assert.throws(()=>a.assess({agent:role}),/environment unresolved/);
  b.save(before);
  assert.ok(!JSON.stringify(assessment.coverage).includes(b.root));
  const confirmed=a.assess({agent:role});assert.equal(confirmed.status,'confirmed');
  assert.equal(confirmed.evaluationCoverage.pairedTasks,2);
  assert.equal(b.state().experiences.length,before.experiences.length);
  const confirmedBefore=b.state(), environment=structuredClone(confirmedBefore);
  environment.experiences.push({...environment.experiences.at(-1),id:'confirmed-env',taskId:'confirmed-env',outcome:'failed',cause:'environment'});
  b.save(environment);
  assert.equal(adaptFromWork(a,scope).status,'confirmed-environment-unresolved');
  assert.equal(agent().status,'confirmed');
  const qualityFailure=structuredClone(confirmedBefore);
  qualityFailure.experiences.push({...qualityFailure.experiences.at(-1),id:'confirmed-quality',taskId:'confirmed-quality',outcome:'failed',cause:'quality'});
  b.save(qualityFailure);
  assert.equal(adaptFromWork(a,scope).status,'rolled-back');
  assert.equal(agent().status,'disabled');
  a.verifyAgent(agent()); // The disabled role file and its verified hash survive rollback.
  console.log('PASS common evaluation: sharing opt-in, cross-kind paired projects, changed evidence, peer environment failure, no record copying; synthetic only');
} finally {assert.ok(base.startsWith(os.tmpdir()+path.sep));fs.rmSync(base,{recursive:true,force:true});}
