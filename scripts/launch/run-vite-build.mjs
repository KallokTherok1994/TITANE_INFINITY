#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'runtime', 'dev', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'vite-build.log');

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.writeFileSync(LOG_FILE, '', 'utf8');

function log(line) {
  fs.appendFileSync(LOG_FILE, `${line}\n`, 'utf8');
  process.stdout.write(`${line}\n`);
}

function resolveCommand(command) {
  if (process.platform !== 'win32') {
    const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
    return result.status === 0 ? command : '';
  }

  const result = spawnSync('where.exe', [command], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (result.status !== 0) {
    return '';
  }

  return (
    result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .find((candidate) => fs.existsSync(candidate)) || ''
  );
}

const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const hasLocalVite = fs.existsSync(viteBin);
const pnpm = resolveCommand('pnpm');

const command = hasLocalVite ? process.execPath : pnpm;
const args = hasLocalVite ? [viteBin, 'build'] : ['exec', 'vite', 'build'];

if (!command) {
  log('[tauri.dev] ERROR: vite local introuvable et pnpm introuvable');
  process.exit(1);
}

log(`[tauri.dev] Starting build: ${hasLocalVite ? 'node' : 'pnpm'} ${args.join(' ')}`);

const child = spawn(command, args, {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (chunk) => {
  fs.appendFileSync(LOG_FILE, chunk);
  process.stdout.write(chunk);
});

child.stderr.on('data', (chunk) => {
  fs.appendFileSync(LOG_FILE, chunk);
  process.stderr.write(chunk);
});

child.on('error', (error) => {
  log(`[tauri.dev] ERROR: vite build failed to start: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
