// Copyright 2026 SoDam AI Studio. Apache-2.0.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

export function reviewSource(controller,name,routes) {
  assert.ok(typeof name==='string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) && name.length<=50);
  const role=controller.state().agents.find(a=>a.name===name);
  let file;
  if(role){controller.verifyAgent(role);file=controller.safe(role.relativePath,true);}
  else {
    assert.ok(Object.values(routes).includes(name),'registered role required');
    const local=['autonomy-team','archviz-production','cad-bim-review','comfyui-operator'].includes(name);
    file=fileURLToPath(new URL(local?`../skills/${name}/SKILL.md`:`../../${name}/skills/${name}/SKILL.md`,import.meta.url));
    if(!local && !fs.existsSync(file)){
      const peer=fileURLToPath(new URL(`../../../${name}/`,import.meta.url));
      assert.ok(fs.existsSync(peer) && !fs.lstatSync(peer).isSymbolicLink(),'trusted peer role directory required');
      const versions=fs.readdirSync(peer,{withFileTypes:true});
      assert.ok(versions.length<=20,'bounded installed versions required');
      const candidates=versions.filter(entry=>entry.isDirectory() && !entry.isSymbolicLink() && /^\d+\.\d+\.\d+(?:[+-][a-zA-Z0-9.-]+)?$/.test(entry.name)).map(entry=>path.join(peer,entry.name,'skills',name,'SKILL.md')).filter(candidate=>fs.existsSync(candidate));
      assert.equal(candidates.length,1,'one unambiguous installed role version required');
      file=candidates[0];
    }
    let ancestor=file;
    while(true){assert.ok(!fs.lstatSync(ancestor).isSymbolicLink(),'linked role reference');const parent=path.dirname(ancestor);if(parent===ancestor)break;ancestor=parent;}
  }
  assert.ok(fs.statSync(file).isFile() && fs.statSync(file).size<=262144,'bounded role reference required');
  const content=fs.readFileSync(file,'utf8');
  return {name,sha256:crypto.createHash('sha256').update(content).digest('hex'),content};
}

export function validReviewEvidence(controller,experience,routes) {
  const names=experience.lesson?.agentReview?.reviewedRoles;
  if(!names || !Array.isArray(experience.reviewEvidence) || experience.reviewEvidence.length!==names.length)return false;
  try {return names.every(name=>{const receipt=experience.reviewEvidence.find(r=>r.name===name);return receipt?.sha256===reviewSource(controller,name,routes).sha256;});}
  catch{return false;}
}
