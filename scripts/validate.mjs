import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { TextDecoder } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const utf8 = new TextDecoder('utf-8', { fatal: true });
const readUtf8 = (rel) => utf8.decode(fs.readFileSync(path.join(root, rel)));
const readJson = (rel) => JSON.parse(readUtf8(rel));
const safe = (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const market = readJson('.agents/plugins/marketplace.json');

function assertNoSymlinks(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `symlink is not allowed: ${path.relative(root, target)}`);
    if (entry.isDirectory()) assertNoSymlinks(target);
  }
}

assertNoSymlinks(path.join(root, 'plugins'));
assert.equal(market.plugins.length, 12, 'marketplace must contain 12 plugins');
assert.equal(new Set(market.plugins.map((plugin) => plugin.name)).size, 12, 'plugin names must be unique');

const pluginDirectories = fs.readdirSync(path.join(root, 'plugins'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert.deepEqual(
  pluginDirectories,
  market.plugins.map((plugin) => plugin.name).sort(),
  'plugin directories must exactly match marketplace entries',
);

let skills = 0;
for (const entry of market.plugins) {
  assert.ok(safe(entry.name), 'unsafe plugin name');
  assert.deepEqual(entry.source, { source: 'local', path: `./plugins/${entry.name}` }, `${entry.name}: invalid source`);
  assert.deepEqual(entry.policy, { installation: 'AVAILABLE', authentication: 'ON_INSTALL' });
  assert.ok(nonEmpty(entry.category), `${entry.name}: category is required`);

  const base = path.join('plugins', entry.name);
  const current = readJson(path.join(base, 'plugin.json'));
  const compat = readJson(path.join(base, '.codex-plugin', 'plugin.json'));
  assert.deepEqual(current, compat, `${entry.name}: manifests differ`);
  assert.equal(current.name, entry.name);
  assert.match(current.version, /^\d+\.\d+\.\d+$/);
  assert.ok(nonEmpty(current.description), `${entry.name}: description is required`);
  assert.ok(nonEmpty(current.author?.name), `${entry.name}: author.name is required`);
  assert.ok(nonEmpty(current.interface?.displayName), `${entry.name}: interface.displayName is required`);
  assert.equal(current.skills, './skills/', `${entry.name}: skills path must stay inside the plugin`);

  if (current.hooks) {
    assert.equal(current.hooks, './hooks/hooks.json');
    const definition = readJson(path.join(base, 'hooks/hooks.json'));
    assert.deepEqual(Object.keys(definition.hooks).sort(), ['Interrupt', 'PostToolUse', 'SessionStart', 'Stop', 'UserPromptSubmit'].sort());
    assert.ok(fs.existsSync(path.join(root, base, 'hooks/entry.mjs')));
    for (const [eventName, groups] of Object.entries(definition.hooks)) for (const group of groups) for (const hook of group.hooks) {
      assert.equal(hook.type, 'command'); assert.ok(nonEmpty(hook.commandWindows));
      assert.ok(hook.timeout > 0 && hook.timeout <= 10);
      if (eventName === 'Interrupt') assert.ok(hook.timeout <= 3, 'Interrupt timeout exceeds host limit');
    }
  }

  if (current.mcpServers) {
    assert.equal(current.mcpServers, './.mcp.json', `${entry.name}: MCP path must stay inside the plugin`);
    assert.ok(fs.existsSync(path.join(root, base, '.mcp.json')), `${entry.name}: missing MCP config`);
    const mcp = readJson(path.join(base, '.mcp.json'));
    assert.ok(mcp.mcpServers && !Array.isArray(mcp.mcpServers) && typeof mcp.mcpServers === 'object');
    for (const [serverName, server] of Object.entries(mcp.mcpServers)) {
      assert.ok(safe(serverName), `${entry.name}: unsafe MCP server name`);
      assert.ok(nonEmpty(server?.command), `${entry.name}/${serverName}: MCP command is required`);
      assert.ok(Array.isArray(server.args) && server.args.every((arg) => typeof arg === 'string'));
      if (server.env !== undefined) {
        assert.ok(server.env && !Array.isArray(server.env) && typeof server.env === 'object');
        assert.ok(Object.values(server.env).every((value) => typeof value === 'string'));
      }
    }
  }

  const skillsDir = path.join(root, base, 'skills');
  for (const dirent of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    assert.ok(dirent.isDirectory() && !dirent.isSymbolicLink(), `${entry.name}: unexpected skills entry`);
    assert.ok(safe(dirent.name), `${entry.name}: unsafe skill directory`);
    const file = path.join(skillsDir, dirent.name, 'SKILL.md');
    assert.ok(fs.existsSync(file), `${entry.name}: missing SKILL.md`);
    assert.ok(!fs.lstatSync(file).isSymbolicLink(), `${entry.name}: SKILL.md must not be a symlink`);
    const text = readUtf8(path.relative(root, file));
    const frontmatter = text.match(/^---\r?\nname: ([a-z0-9]+(?:-[a-z0-9]+)*)\r?\ndescription: (.+)\r?\n---\r?\n/s);
    assert.ok(frontmatter, `${entry.name}/${dirent.name}: invalid frontmatter`);
    assert.equal(frontmatter[1], dirent.name, `${entry.name}/${dirent.name}: skill name must match its directory`);
    assert.ok(!text.includes('[TODO:'), `${entry.name}/${dirent.name}: unfinished placeholder`);
    skills++;
  }
}

assert.equal(skills, 56, 'expected 56 skills');
assert.equal(Object.keys(readJson('package.json').dependencies || {}).length, 0, 'runtime dependencies must remain zero');
console.log(JSON.stringify({ plugins: 12, skills, manifests: 24, dependencies: 0 }, null, 2));
