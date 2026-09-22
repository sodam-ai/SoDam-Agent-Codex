import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = spawnSync(process.execPath, ['scripts/validate.mjs'], { cwd: root, encoding: 'utf8' });
assert.equal(run.status, 0, run.stderr || run.stdout);

const market = JSON.parse(fs.readFileSync(path.join(root, '.agents/plugins/marketplace.json'), 'utf8'));
assert.deepEqual(market.plugins.map((plugin) => plugin.name), [
  'web-app-team', 'docs-team', 'research-team', 'data-team', 'marketing-team',
  'security-audit-team', 'devops-team', 'customer-support-team', 'pm-team',
  'localization-team', 'sodam-agent',
]);

for (const name of ['web-app-team', 'research-team']) {
  const mcp = JSON.parse(fs.readFileSync(path.join(root, 'plugins', name, '.mcp.json'), 'utf8'));
  assert.equal(mcp.mcpServers.context7.command, 'npx');
  assert.deepEqual(mcp.mcpServers.context7.args, ['-y', '@upstash/context7-mcp@4.1.1']);
}

for (const name of market.plugins.map((plugin) => plugin.name).filter((name) => !['web-app-team', 'research-team'].includes(name))) {
  assert.ok(!fs.existsSync(path.join(root, 'plugins', name, '.mcp.json')), `${name}: unexpected MCP`);
}

const pluginDirectories = fs.readdirSync(path.join(root, 'plugins'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory());
assert.equal(pluginDirectories.length, 11);
console.log('PASS: marketplace order, manifests, 46 skills, pinned MCP scope, and zero dependencies');
