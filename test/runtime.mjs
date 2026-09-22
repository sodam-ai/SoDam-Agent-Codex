import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(packageJson.engines.node, '>=20.18.1');

for (const plugin of ['web-app-team', 'research-team']) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'plugins', plugin, '.mcp.json'), 'utf8'));
  assert.deepEqual(config.mcpServers.context7.args, ['-y', '@upstash/context7-mcp@4.1.1']);
}

console.log('PASS: Node requirement and Context7 version are deployment-safe and consistent');
