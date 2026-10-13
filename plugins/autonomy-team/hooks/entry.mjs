// Copyright 2026 SoDam AI Studio. Apache-2.0.
import { fileURLToPath } from 'node:url';
import { Bridge } from '../runtime/bridge.mjs';
import {connectWorkspace,resolveWorkspace} from '../runtime/areas.mjs';
import {boundWorkspace} from '../runtime/workspace-binding.mjs';
import {Controller} from '../runtime/engine.mjs';
import {connectAutomatic} from '../runtime/automatic.mjs';
import {statusDisplay,unknownDisplay,displayInstruction} from '../runtime/status-display.mjs';
import {retainAutomatic} from '../runtime/retention.mjs';
import {capacityNotices} from '../runtime/capacity-governance.mjs';
let stage = 'input';
let startEvent = false;
let startEventName;
let resolvedController;
const trace = (state) => process.stderr.write(JSON.stringify({ component: 'sodam-hook', stage: state }) + '\n');
try {
  const chunks = []; let bytes = 0;
  for await (const chunk of process.stdin) { bytes += chunk.length; if (bytes > 8_000_000) throw new Error('event too large'); chunks.push(chunk); }
  const event = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  startEvent = ['SessionStart','UserPromptSubmit'].includes(event?.hook_event_name);
  if(startEvent)startEventName=event.hook_event_name;
  if (startEvent) trace('received');
  stage = 'workspace';
  const runtime = fileURLToPath(new URL('../runtime/cli.mjs', import.meta.url));
  // Only the trusted host's workspace event supplies an unmarked project root.
  // Tool command cwd and model-supplied MCP arguments cannot do so.
  const resolved = boundWorkspace(event) ?? (startEvent ? connectWorkspace(event.cwd,true) : resolveWorkspace(event.cwd));
  const workspace = resolved.root;
  resolvedController=new Controller(workspace);
  if(startEvent && resolved.mode==='missing')connectAutomatic(new Controller(workspace));
  if(startEvent && fsPolicyExists(resolvedController))retainAutomatic(resolvedController);
  if (startEvent) trace('workspace-resolved');
  stage = 'bridge';
  const output = new Bridge(workspace).event(event, runtime);
  if(startEvent && output.hookSpecificOutput) {
    const display=statusDisplay(new Controller(workspace));
    const started=startEventName==='UserPromptSubmit' && display.state==='active';
    output.hookSpecificOutput.additionalContext=displayInstruction(display,started)+output.hookSpecificOutput.additionalContext;
    if(fsPolicyExists(resolvedController)) {
      try {const review=capacityNotices(resolvedController);
        output.hookSpecificOutput.additionalContext+=' Capacity policy: preserve existing agents and lessons; never delete, merge or disable for capacity without explicit reviewed consent. '+review.notices.map(n=>n.message).join(' ');
      } catch {output.hookSpecificOutput.additionalContext+=' Capacity warning inspection unavailable; preserve all existing items. Do not claim capacity is healthy.';}
    }
  }
  stage = 'output';
  process.stdout.write(`${JSON.stringify(output)}\n`);
  if (startEvent) trace('handled');
} catch {
  trace('failed-' + stage);
  // Fail visibly without echoing prompts, tool responses, credentials or paths.
  process.stderr.write('SoDam hook failed; automatic workflow is unverified.\n');
  if(startEvent) {
    const checked=resolvedController?statusDisplay(resolvedController):unknownDisplay();
    const display=checked.state==='active'?unknownDisplay():checked;
    process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:startEventName,additionalContext:displayInstruction(display)}})+'\n');
  }
  process.exitCode = 1;
}
function fsPolicyExists(controller) {
  try {controller.policy();return true;} catch{return false;}
}
