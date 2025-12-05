#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const args = process.argv.slice(2);
const desiredNodeOption = '--max-old-space-size=8192';
const existingNodeOptions = process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(' ') : [];

if (!existingNodeOptions.includes(desiredNodeOption)) {
  existingNodeOptions.push(desiredNodeOption);
}

process.env.NODE_OPTIONS = existingNodeOptions.filter(Boolean).join(' ').trim();

const suites = [
  { label: 'unit', config: 'vitest.unit.config.ts' },
  { label: 'integration', config: 'vitest.integration.config.ts' }
];

for (const suite of suites) {
  const result = spawnSync('vitest', ['run', '--config', suite.config, ...args], {
    stdio: 'inherit',
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
