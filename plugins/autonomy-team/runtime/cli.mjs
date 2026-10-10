// Copyright 2026 SoDam AI Studio. Apache-2.0.
import { checkNodeSyntax } from './syntax-checker.mjs';
import { Controller } from './engine.mjs';
import { Bridge } from './bridge.mjs';
import { manageWorkflow } from './workflow.mjs';
import { capacity } from './capacity.mjs';
import {inspectRuntime} from './diagnostics.mjs';
import { archive, restore } from './archive.mjs';
import { continueLearning } from './continuation.mjs';
import { authorizeMaintenance, recoverMaintenance, runMaintenance } from './maintenance.mjs';
import {authorizeArea,revokeArea,connectWorkspace,inspectArea,readAreaRequest} from './areas.mjs';
import {bindWorkspace} from './workspace-binding.mjs';

const [, , command, workspace, requestFile] = process.argv;
try {
  if (command==='workspace-bind') {
    const result=bindWorkspace(workspace,new Controller(workspace).read(requestFile,8192));
    process.stdout.write(`${JSON.stringify({ok:true,result},null,2)}\n`);
  } else if (['area-authorize','area-revoke','area-inspect','connect'].includes(command)) {
    const request=['area-inspect','connect'].includes(command)?undefined:readAreaRequest(workspace,requestFile);
    const result=command==='area-authorize'?authorizeArea(workspace,request):command==='area-revoke'?revokeArea(workspace,request):command==='connect'?connectWorkspace(workspace):inspectArea(workspace);
    process.stdout.write(`${JSON.stringify({ok:true,result},null,2)}\n`);
  } else {
  if (!['syntax-check', 'diagnose', 'read-role', 'role-step', 'continue', 'archive', 'restore', 'capacity', 'initialize', 'plan', 'record', 'propose', 'evaluate', 'promote', 'assess', 'rollback', 'cycle', 'status', 'dispatch', 'finish', 'skip', 'recall', 'maintenance-authorize', 'maintenance-recover', 'maintenance'].includes(command)) throw new Error('unknown command');
  const controller = new Controller(workspace);
  const input = ['diagnose', 'capacity', 'status', 'recall', 'maintenance'].includes(command) ? undefined : controller.read(requestFile, 1_000_000);
  const result = command === 'syntax-check' ? checkNodeSyntax({...input,workspace}) : command === 'diagnose' ? inspectRuntime({workspace}) : ['read-role','role-step'].includes(command) ? manageWorkflow({workspace,operation:command,request:input}) : command === 'continue' ? continueLearning(workspace,input) : command === 'archive' ? archive(workspace,input) : command === 'restore' ? restore(workspace,input) : command === 'capacity' ? capacity(workspace) : command === 'maintenance-authorize' ? authorizeMaintenance(workspace, input) :
    command === 'maintenance-recover' ? recoverMaintenance(workspace, input) :
    command === 'maintenance' ? runMaintenance(workspace) :
    command === 'finish' && (input.semanticReviewed !== undefined || input.reflection !== undefined || new Bridge(workspace).turn(new Bridge(workspace).journal(), input.turnKey).plan?.learnWhileWorking) ? manageWorkflow({workspace,operation:'finish',request:input}) :
    ['dispatch', 'finish', 'skip', 'recall'].includes(command) ? new Bridge(workspace)[command](input) : controller[command](input);
  process.stdout.write(`${JSON.stringify({ ok: true, result }, null, 2)}\n`);
  if (command === 'syntax-check' && result.exit_code !== 0) process.exitCode = 1;
  }
} catch (error) {
  // Never echo request fragments, assertion values, file paths or system error messages.
  const message = error instanceof SyntaxError ? 'invalid JSON' :
    error.code === 'ERR_ASSERTION' ? 'invalid input or controller precondition' :
    error.code ? `filesystem operation failed (${String(error.code).replace(/[^A-Z0-9_]/g, '')})` :
    'controller operation failed';
  // Closed diagnostics only: never reflect assertion values or input fragments.
  const diagnostic = error.code === 'ENOENT' ? 'request-or-state-file-missing' :
    error.code === 'EACCES' || error.code === 'EPERM' ? 'permission-denied' :
    error instanceof SyntaxError ? 'malformed-json' :
    error.message === 'dispatched live turn required' ? 'dispatch-required-before-finish' :
    error.message === 'turn not registered' ? 'turn-not-registered' :
    error.message === 'tool execution evidence or unresolved error' ? 'execution-evidence-missing-or-failed' :
    error.message === 'unknown field' ? 'unsupported-input-field' :
    error.message === 'unknown command' ? 'unsupported-command' : 'controller-precondition';
  process.stderr.write(`${JSON.stringify({ ok: false, error: message, diagnostic })}\n`);
  process.exitCode = 1;
}
