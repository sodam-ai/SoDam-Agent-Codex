import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sodam-codex-test-'));

function validate(project) {
  return spawnSync(process.execPath, ['scripts/validate.mjs'], {
    cwd: project,
    encoding: 'utf8',
    timeout: 10_000,
  });
}

function mutateJson(project, rel, mutate) {
  const file = path.join(project, rel);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutate(data);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const cases = [
  ['marketplace path traversal', (project) => mutateJson(project, '.agents/plugins/marketplace.json', (data) => {
    data.plugins[0].source.path = '../../outside';
  })],
  ['wrong marketplace source type', (project) => mutateJson(project, '.agents/plugins/marketplace.json', (data) => {
    data.plugins[0].source.source = 'git';
  })],
  ['skill name differs from directory', (project) => {
    const file = path.join(project, 'plugins/web-app-team/skills/planner/SKILL.md');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('name: planner', 'name: other-name'));
  }],
  ['manifest skills path traversal', (project) => {
    for (const rel of ['plugins/web-app-team/plugin.json', 'plugins/web-app-team/.codex-plugin/plugin.json']) {
      mutateJson(project, rel, (data) => { data.skills = './../../outside'; });
    }
  }],
  ['MCP path traversal', (project) => {
    for (const rel of ['plugins/web-app-team/plugin.json', 'plugins/web-app-team/.codex-plugin/plugin.json']) {
      mutateJson(project, rel, (data) => { data.mcpServers = './../../package.json'; });
    }
  }],
  ['invalid UTF-8 skill', (project) => {
    fs.appendFileSync(path.join(project, 'plugins/web-app-team/skills/planner/SKILL.md'), Buffer.from([0xff]));
  }],
  ['invalid MCP structure', (project) => {
    fs.writeFileSync(path.join(project, 'plugins/web-app-team/.mcp.json'), '{"mcpServers":[]}\n');
  }],
];

try {
  const crlfProject = path.join(tempRoot, 'crlf-skill');
  fs.cpSync(source, crlfProject, { recursive: true });
  const crlfSkill = path.join(crlfProject, 'plugins/web-app-team/skills/planner/SKILL.md');
  fs.writeFileSync(crlfSkill, fs.readFileSync(crlfSkill, 'utf8').replace(/\r?\n/g, '\r\n'));
  const crlfResult = validate(crlfProject);
  assert.equal(crlfResult.status, 0, `CRLF skill was rejected: ${crlfResult.stderr || crlfResult.stdout}`);
  console.log('PASS: CRLF skill frontmatter accepted');

  for (const [name, mutate] of cases) {
    const project = path.join(tempRoot, name.replaceAll(' ', '-'));
    fs.cpSync(source, project, { recursive: true });
    mutate(project);
    const result = validate(project);
    assert.notEqual(result.status, 0, `${name} was not blocked`);
  }
  console.log(`PASS: ${cases.length} adversarial validation cases blocked`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
