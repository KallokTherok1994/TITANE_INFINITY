#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const files = [
  'runtime/dev/reports/DEV_BRIDGE_INVENTORY.md',
  'runtime/dev/proofs/DEV_BRIDGE_PROOF_PACK.md',
  'runtime/dev/reports/DEV_BRIDGE_FINAL_VERDICT.md',
  'docs/capabilities/TITANE_DEV_BRIDGE.md',
  'docs/contracts/dev-bridge.contract.schema.json',
  'scripts/dev/dev-bridge.mjs',
  'scripts/dev/dev-bridge-contract-test.mjs'
];

const checks = files.map(file => {
  const filePath = path.join(root, file);
  return {
    name: file,
    ok: fs.existsSync(filePath)
  };
});

const contractRun = spawnSync('node', ['scripts/dev/dev-bridge-contract-test.mjs'], {
  encoding: 'utf8'
});

const contractOk = contractRun.status === 0;

checks.push({
  name: 'contract_test',
  ok: contractOk
});

const ok = checks.every(check => check.ok);

const payload = {
  ok,
  guard: 'dev-bridge',
  checks,
  contract_stdout: (contractRun.stdout || '').trim(),
  contract_stderr: (contractRun.stderr || '').trim()
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exit(ok ? 0 : 1);
