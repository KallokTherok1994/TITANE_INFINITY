#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptPath = fileURLToPath(import.meta.url);
const rawArgs = process.argv
  .slice(2)
  .map(arg => arg.replace(/^"|"$/g, ''))
  .filter(arg => arg !== '--run');
const hasExplicitSelection = rawArgs.some(arg => !arg.startsWith('-'));
const vitestBin = path.join(
  path.dirname(require.resolve('vitest/package.json')),
  'vitest.mjs'
);
const desiredNodeOptions = [
  '--max-old-space-size=12288',
  '--require',
  './tests/polyfills/resizable-arraybuffer.cjs',
];

const existingNodeOptions = process.env.NODE_OPTIONS
  ? process.env.NODE_OPTIONS.split(' ').filter(Boolean)
  : [];

for (const option of desiredNodeOptions) {
  if (!existingNodeOptions.includes(option)) {
    existingNodeOptions.push(option);
  }
}

const env = {
  ...process.env,
  TZ: process.env.TZ || 'UTC',
  NODE_OPTIONS: existingNodeOptions.join(' '),
};

function runNode(args, extraEnv = {}) {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: { ...env, ...extraEnv },
    shell: false,
  });

  if (result.error) {
    console.error(`[vitest-sharded] failed to start node: ${result.error.message}`);
  }

  if (result.signal) {
    console.error(`[vitest-sharded] node exited via signal ${result.signal}`);
  }

  return result.status ?? 1;
}

function runVitest(args) {
  const verbose = process.env.TITANE_VITEST_VERBOSE === '1';
  const result = spawnSync(process.execPath, [vitestBin, 'run', ...args], {
    stdio: verbose ? 'inherit' : 'pipe',
    env,
    shell: false,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.error) {
    console.error(`[vitest-sharded] failed to start vitest: ${result.error.message}`);
  }

  if (result.signal) {
    console.error(`[vitest-sharded] vitest exited via signal ${result.signal}`);
  }

  const status = result.status ?? 1;
  if (!verbose && status !== 0) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
  }

  return status;
}

if (hasExplicitSelection) {
  process.exit(runVitest(rawArgs));
}

const totalShards = Number.parseInt(process.env.TITANE_VITEST_SHARDS || '678', 10);
const commonArgs = ['--pool=threads', '--maxWorkers=1', '--no-file-parallelism'];

if (process.env.TITANE_VITEST_RANGE_WORKER !== '1') {
  const batchSize = Number.parseInt(process.env.TITANE_VITEST_BATCH_SIZE || '1', 10);
  for (let start = 1; start <= totalShards; start += batchSize) {
    const end = Math.min(start + batchSize - 1, totalShards);
    console.log(`[vitest-sharded] batch ${start}-${end}/${totalShards}`);
    const code = runNode([scriptPath, ...rawArgs], {
      TITANE_VITEST_RANGE_WORKER: '1',
      TITANE_VITEST_SHARD_START: String(start),
      TITANE_VITEST_SHARD_END: String(end),
    });
    if (code !== 0) {
      process.exit(code);
    }
  }

  console.log('[vitest-sharded] all shards passed');
  process.exit(0);
}

const startShard = Number.parseInt(process.env.TITANE_VITEST_SHARD_START || '1', 10);
const endShard = Number.parseInt(
  process.env.TITANE_VITEST_SHARD_END || String(totalShards),
  10
);
const shardRetries = Number.parseInt(process.env.TITANE_VITEST_SHARD_RETRIES || '2', 10);

for (let shard = startShard; shard <= endShard; shard += 1) {
  console.log(`[vitest-sharded] shard ${shard}/${totalShards}`);
  const shardArgs = [...commonArgs, `--shard=${shard}/${totalShards}`, ...rawArgs];
  let code = runVitest(shardArgs);
  for (let attempt = 1; code !== 0 && attempt <= shardRetries; attempt += 1) {
    console.warn(
      `[vitest-sharded] shard ${shard}/${totalShards} failed, retry ${attempt}/${shardRetries}`
    );
    code = runVitest(shardArgs);
  }
  if (code !== 0) {
    process.exit(code);
  }
  console.log(`[vitest-sharded] shard ${shard}/${totalShards} passed`);
}

console.log(`[vitest-sharded] shard range ${startShard}-${endShard} passed`);
