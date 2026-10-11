// Copyright 2026 SoDam AI Studio. Apache-2.0.
import { fileURLToPath } from 'node:url';
import { Bridge } from '../runtime/bridge.mjs';
import {connectWorkspace,resolveWorkspace} from '../runtime/areas.mjs';
import {boundWorkspace} from '../runtime/workspace-binding.mjs';
let stage = 'input';
let startEvent = false;
const trace = (state) => process.stderr.write(JSON.stringify({ component: 'sodam-hook', stage: state }) + '\n');
try {
  const chunks = []; let bytes = 0;
  for await (const chunk of process.stdin) { bytes += chunk.length; if (bytes > 8_000_000) throw new Error('event too large'); chunks.push(chunk); }
  const event = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  startEvent = ['SessionStart','UserPromptSubmit'].includes(event?.hook_event_name);
  if (startEvent) trace('received');
  stage = 'workspace';
  const runtime = fileURLToPath(new URL('../runtime/cli.mjs', import.meta.url));
  // Only the trusted host's workspace event supplies an unmarked project root.
  // Tool command cwd and model-supplied MCP arguments cannot do so.
  const workspace = (boundWorkspace(event) ?? (['SessionStart','UserPromptSubmit'].includes(event.hook_event_name) ? connectWorkspace(event.cwd,true) : resolveWorkspace(event.cwd))).root;
  if (startEvent) trace('workspace-resolved');
  stage = 'bridge';
  const output = new Bridge(workspace).event(event, runtime);
  stage = 'output';
  process.stdout.write(`${JSON.stringify(output)}\n`);
  if (startEvent) trace('handled');
} catch {
  trace('failed-' + stage);
  // Fail visibly without echoing prompts, tool responses, credentials or paths.
  process.stderr.write('SoDam hook failed; automatic workflow is unverified.\n');
  process.exitCode = 1;
}
