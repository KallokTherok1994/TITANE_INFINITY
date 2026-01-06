#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const args = process.argv.slice(2);

const major = Number(process.versions.node.split('.')[0]);
const existing = process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(' ') : [];

// Node v23+ has experimental TypeScript "type stripping" flags.
// Some environments enable it and emit noisy warnings during Vite builds.
// We disable it explicitly when supported to keep CI/build logs clean.
let nodeOptions = existing.filter(Boolean);
if (major >= 23) {
  nodeOptions = nodeOptions.filter(opt => opt !== '--experimental-strip-types');
  if (!nodeOptions.includes('--no-experimental-strip-types')) {
    nodeOptions.push('--no-experimental-strip-types');
  }
}

process.env.NODE_OPTIONS = nodeOptions.join(' ').trim();

const result = spawnSync('vite', ['build', ...args], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
