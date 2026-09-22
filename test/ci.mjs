import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

const actionPins = [...workflow.matchAll(/uses:\s+(actions\/(?:checkout|setup-node))@([^\s#]+)/g)];
assert.equal(actionPins.length, 2, "CI must use checkout and setup-node exactly once");

const pins = Object.fromEntries(actionPins.map(([, action, pin]) => [action, pin]));
assert.match(pins["actions/checkout"], /^[0-9a-f]{40}$/, "checkout must be pinned to a full commit SHA");
assert.equal(
  pins["actions/setup-node"],
  "49933ea5288caeca8642d1e84afbd3f7d6820020",
  "setup-node must use the verified v4 commit SHA",
);
assert.match(workflow, /permissions:\s*\r?\n\s+contents:\s+read/, "CI must use read-only repository permissions");
assert.match(workflow, /timeout-minutes:\s+10/, "CI must have a bounded timeout");
assert.match(workflow, /node-version:\s+22/, "CI must use a supported Node.js version");

console.log("CI workflow safety checks passed.");
