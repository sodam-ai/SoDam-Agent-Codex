// Copyright 2026 SoDam AI Studio. Apache-2.0.
import { checkNodeSyntax } from './syntax-checker.mjs';
import { verifyArtifacts } from './output-verifier.mjs';
import { manageWorkflow } from './workflow.mjs';
import { StringDecoder } from 'node:string_decoder';
import {relocateMcpDirectory} from './startup.mjs';
import {inspectRuntime} from './diagnostics.mjs';
// Windows holds a directory handle for the process cwd. Release the mutable
// plugin cache before serving requests; imports are module-relative and all
// workspace operations require an explicitly authorized absolute path.
if (process.platform === 'win32') {
  if (!relocateMcpDirectory()) { process.stderr.write('MCP startup directory unavailable.\n'); process.exit(1); }
}
const tool = {
  name: 'verify_artifacts',
  description: 'Read-only checks of 1-4 saved text artifacts in an explicitly authorized SoDam project. Returns file hashes and actual execution status, never contents. Read and assess semantic quality separately. Does not run shell commands, modify state or certify agent improvement.',
  inputSchema: { type: 'object', additionalProperties: false, required: ['workspace', 'evidence'], properties: { workspace: { type: 'string', maxLength: 1000 }, evidence: { type: 'array', minItems: 1, maxItems: 4, uniqueItems: true, items: { type: 'string', maxLength: 200 } } } },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
};
const syntaxTool = { name: 'check_node_syntax',
  description: 'Read-only fixed Node parser of 1-4 authorized project .mjs/.cjs snapshots. No source evaluation, shell, custom arguments or raw output. Syntax only; not behavior, build or learning proof.',
  inputSchema: tool.inputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
};
const send = message => process.stdout.write(`${JSON.stringify(message)}\n`);
const diagnosticTool={name:'inspect_runtime',description:'Read-only startup source fingerprint and optional workspace authorization, capacity and missing workflow-stage counts. Does not initialize, repair, renew, run work or certify learning effects.',inputSchema:{type:'object',additionalProperties:false,properties:{workspace:{type:'string',minLength:1,maxLength:1000}}},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}};
const workflowTool = {
  name:'manage_workflow',
  description:'Start dispatch before substantive work or record finish afterward in an explicitly authorized SoDam project or user-approved work area. An approved area can connect an identified project; authorization itself is never created here. Uses the live hook turnKey. Writes bounded project workflow state and area budget reservations. Does not run commands, create permissions or train models. Verified finish requires prior successful execution, no failed event, caller semantic review and actual safe artifact checks. Read selected skills and reuse only relevant validated lessons.',
  inputSchema:{type:'object',additionalProperties:false,required:['workspace','operation','request'],properties:{
    workspace:{type:'string',minLength:1,maxLength:1000},operation:{type:'string',enum:['dispatch','finish','read-role','role-step','skip']},
    request:{oneOf:[
      {type:'object',additionalProperties:false,required:['turnKey','reason'],properties:{turnKey:{type:'string',pattern:'^[a-f0-9]{32}$'},reason:{type:'string',enum:['simple-query','excluded','user-stop']}}},
      {"type":"object","additionalProperties":false,"required":["turnKey","phase","stepIndex"],"properties":{"turnKey":{"type":"string","pattern":"^[a-f0-9]{32}$"},"phase":{"type":"string","enum":["begin","complete"]},"stepIndex":{"type":"integer","minimum":0,"maximum":7},"toolKeys":{"type":"array","minItems":1,"maxItems":4,"uniqueItems":true,"items":{"type":"string","pattern":"^[a-f0-9]{32}$"}},"evidence":{"type":"array","minItems":1,"maxItems":4,"items":{"type":"string","maxLength":200}},"semanticReviewed":{"type":"boolean"}}},
      {type:'object',additionalProperties:false,required:['turnKey'],properties:{turnKey:{type:'string',pattern:'^[a-f0-9]{32}$'}}},
      {type:'object',additionalProperties:false,required:['turnKey','kind','goal'],properties:{turnKey:{type:'string',pattern:'^[a-f0-9]{32}$'},kind:{type:'string',enum:['web','docs','research','data','marketing','security','devops','support','pm','localization','archviz','cad','comfyui','general']},goal:{type:'string',maxLength:500},gap:{type:'string',maxLength:50},contextTags:{type:'array',uniqueItems:true,maxItems:12,items:{type:'string',minLength:1,maxLength:50,pattern:'^[a-z0-9]+(?:-[a-z0-9]+)*$'}},learnWhileWorking:{type:'boolean'},evaluationTaskId:{type:'string',minLength:1,maxLength:40,pattern:'^[a-z0-9]+(?:-[a-z0-9]+)*$'},excludedKinds:{type:'array',items:{type:'string'},maxItems:14}}},
      {type:'object',additionalProperties:false,required:['turnKey','outcome','cause'],properties:{turnKey:{type:'string',pattern:'^[a-f0-9]{32}$'},outcome:{type:'string',enum:['verified','failed','unverified']},cause:{type:'string',enum:['none','missing-role','environment','permission','quality']},evidence:{type:'array',maxItems:4,items:{type:'string',maxLength:200}},corrections:{type:'integer',minimum:0,maximum:100},semanticReviewed:{type:'boolean'},portableReviewed:{type:'boolean'},lesson:{type:'object'},reflection:{type:'object'},quality:{type:'object',additionalProperties:false,required:['criteriaId','criteria','passed','errors'],properties:{criteriaId:{type:'string',minLength:1,maxLength:50,pattern:'^[a-z0-9]+(?:-[a-z0-9]+)*$'},definition:{type:'array',minItems:1,maxItems:1000,items:{type:'string',minLength:1,maxLength:400}},criteria:{type:'integer',minimum:1,maximum:1000},passed:{type:'integer',minimum:0,maximum:1000},errors:{type:'integer',minimum:0,maximum:1000}}}}}
    ]}}},
  annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:false},
};
let initialized = false; let calls = 0; let buffer = '';
const decoder = new StringDecoder('utf8');
function request(message) {
  const id = message?.id;
  const validId = Number.isSafeInteger(id) || (typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id));
  if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string' || (id !== undefined && !validId)) { send({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid request' } }); return; }
  if (id === undefined) return;
  const result = value => send({ jsonrpc: '2.0', id, result: value });
  if (message.method === 'initialize') {
    if (initialized || typeof message.params?.protocolVersion !== 'string') { send({ jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid initialization' } }); return; }
    initialized = true;
    const versions = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
    result({ protocolVersion: versions.includes(message.params.protocolVersion) ? message.params.protocolVersion : '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'sodam-output-verifier', version: '0.3.9' } }); return;
  }
  if (!initialized) { send({ jsonrpc: '2.0', id, error: { code: -32002, message: 'Initialize first' } }); return; }
  if (message.method === 'ping') { result({}); return; }
  if (message.method === 'tools/list') { result({ tools: [tool, workflowTool, diagnosticTool, syntaxTool] }); return; }
  if (message.method !== 'tools/call') { send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } }); return; }
  try {
    if (++calls > 1000 || ![tool.name,workflowTool.name,diagnosticTool.name,syntaxTool.name].includes(message.params?.name)) throw new Error('invalid call');
    // All workflow operations may write receipts or reserve area budget.
    // Fail before connecting a project when the loaded runtime is stale.
    if (message.params.name === workflowTool.name) {
      const runtime = inspectRuntime({}).runtime;
      if (runtime.sourceStatus !== 'current') {
        result({ isError: true, structuredContent: { exit_code: 1, diagnostic: 'runtime-source-' + (runtime.sourceStatus === 'changed' ? 'changed' : 'unreadable'), nextAction: 'reconnect-runtime' },
          content: [{ type: 'text', text: 'Runtime source is not current. Workflow state was not modified. Reconnect before workflow writes.' }] });
        return;
      }
    }
    const verified = message.params.name===syntaxTool.name?checkNodeSyntax(message.params.arguments):message.params.name===diagnosticTool.name?inspectRuntime(message.params.arguments):message.params.name===tool.name?verifyArtifacts(message.params.arguments):manageWorkflow(message.params.arguments);
    result({ isError: message.params.name === syntaxTool.name && verified.exit_code !== 0, structuredContent: verified, content: [{ type: 'text', text: JSON.stringify(verified) }] });
  } catch { result({ isError: true, structuredContent: { exit_code: 1 }, content: [{ type: 'text', text: 'SoDam operation failed; check authorized project, live turn, fixed input schema and actual execution evidence. No submitted values or file content were returned.' }] }); }
}
process.stdin.on('data', chunk => {
  buffer += decoder.write(chunk);
  if (Buffer.byteLength(buffer) > 65536) { process.stderr.write('MCP request exceeds bounded input.\n'); process.exitCode = 1; process.stdin.destroy(); return; }
  let end;
  while ((end = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
    if (!line.trim()) continue;
    try { request(JSON.parse(line)); } catch { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  }
});
process.stdin.on('end', () => { buffer += decoder.end(); if (buffer.trim()) { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Unterminated request' } }); process.exitCode = 1; } });
