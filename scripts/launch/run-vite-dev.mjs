#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'runtime', 'dev', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'vite.log');
const DEV_URL = process.env.TITANE_VITE_DEV_URL || 'http://127.0.0.1:5173';
const HOST = process.env.TITANE_VITE_HOST || '127.0.0.1';
const PORT = process.env.TITANE_VITE_PORT || '5173';

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.writeFileSync(LOG_FILE, '', 'utf8');

function log(line) {
  fs.appendFileSync(LOG_FILE, `${line}\n`, 'utf8');
  process.stdout.write(`${line}\n`);
}

async function isDevServerRunning() {
  try {
    const response = await fetch(DEV_URL, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

function commandExists(command) {
  return Boolean(resolveCommand(command));
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
      .map(line => line.trim())
      .flatMap(line => {
        if (!line) {
          return [];
        }
        const ext = path.extname(line).toLowerCase();
        return ext ? [line] : [`${line}.cmd`, `${line}.exe`, line];
      })
      .find(candidate => fs.existsSync(candidate)) || ''
  );
}

const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const hasLocalVite = fs.existsSync(viteBin);
const usePnpmDirect = !hasLocalVite && commandExists('pnpm');
const useCorepack = !hasLocalVite && !usePnpmDirect && commandExists('corepack');
const usePnpm = hasLocalVite || usePnpmDirect || useCorepack;

if (!usePnpm) {
  log('[tauri.dev] ERROR: pnpm introuvable');
  process.exit(1);
}

if (await isDevServerRunning()) {
  log('[tauri.dev] Vite deja actif sur :5173 - skip beforeDevCommand');
  process.exit(0);
}

const commandName = hasLocalVite ? 'node' : useCorepack ? 'corepack' : 'pnpm';
const command = hasLocalVite ? process.execPath : resolveCommand(commandName);
const args = hasLocalVite
  ? [viteBin, 'dev', '--host', HOST, '--port', PORT, '--strictPort']
  : useCorepack
    ? ['pnpm', 'exec', 'vite', 'dev', '--host', HOST, '--port', PORT, '--strictPort']
    : ['exec', 'vite', 'dev', '--host', HOST, '--port', PORT, '--strictPort'];

log(`[tauri.dev] Starting: ${commandName} ${args.join(' ')}`);

const child = spawn(command, args, {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', chunk => {
  fs.appendFileSync(LOG_FILE, chunk);
  process.stdout.write(chunk);
});

child.stderr.on('data', chunk => {
  fs.appendFileSync(LOG_FILE, chunk);
  process.stderr.write(chunk);
});

child.on('exit', (code, signal) => {
  if (code === 130 || code === 143 || signal === 'SIGINT' || signal === 'SIGTERM') {
    process.exit(0);
  }
  process.exit(code ?? 0);
});
