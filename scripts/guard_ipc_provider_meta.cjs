#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcTauriDir = path.join(rootDir, 'src-tauri');
const proofPack = process.argv[2];

if (!proofPack) {
  console.error('Usage: node scripts/guard_ipc_provider_meta.cjs <proof_pack_dir>');
  process.exit(1);
}

const outDir = path.resolve(rootDir, proofPack);
fs.mkdirSync(outDir, { recursive: true });

function runTest(outputPath, mode) {
  const env = {
    ...process.env,
    P3_IPC_CONTRACT_OUT: outputPath,
    P3_IPC_MODE: mode || 'default',
  };

  execFileSync(
    'cargo',
    ['test', 'ipc_meta_contract_smoke', '--', '--nocapture'],
    {
      cwd: srcTauriDir,
      env,
      stdio: 'inherit',
    }
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const run1 = path.join(outDir, '03_IPC_CONTRACT_RUN1.json');
const run2 = path.join(outDir, '04_IPC_CONTRACT_RUN2.json');
const run3 = path.join(outDir, '05_IPC_CONTRACT_RUN3.json');

runTest(run1, 'default');
runTest(run2, 'default');
runTest(run3, 'default');

const offline1 = path.join(outDir, 'offline_1.json');
const offline2 = path.join(outDir, 'offline_2.json');
const offline3 = path.join(outDir, 'offline_3.json');

runTest(offline1, 'offline');
runTest(offline2, 'offline');
runTest(offline3, 'offline');

const offlineRuns = [readJson(offline1), readJson(offline2), readJson(offline3)];
fs.writeFileSync(
  path.join(outDir, '06_OFFLINE_RUNS.json'),
  JSON.stringify(offlineRuns, null, 2)
);

fs.unlinkSync(offline1);
fs.unlinkSync(offline2);
fs.unlinkSync(offline3);

const determinism = [readJson(run1), readJson(run2), readJson(run3)];
const keys = determinism.map((item) => {
  const meta = item.meta || {};
  return {
    provider_used: meta.provider_used,
    mode: meta.mode,
    reason_code: meta.reason_code,
  };
});

const determinismOk = keys.every(
  (entry) =>
    entry.provider_used === keys[0].provider_used &&
    entry.mode === keys[0].mode &&
    entry.reason_code === keys[0].reason_code
);

const determinismReport = [
  '# P3-4 DETERMINISM CHECK',
  '',
  `Status: ${determinismOk ? 'PASS' : 'FAIL'}`,
  '',
  'Observed meta tuples:',
  JSON.stringify(keys, null, 2),
  '',
].join('\n');

fs.writeFileSync(path.join(outDir, '07_DETERMINISM.md'), determinismReport);

console.log('✅ IPC meta contract runs captured');
