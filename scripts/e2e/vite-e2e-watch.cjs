#!/usr/bin/env node

const { spawn } = require('node:child_process');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const repoRoot = path.resolve(__dirname, '../..');
const localPnpmBin = path.resolve(repoRoot, '.tools/node/current/bin/pnpm');

function hasCommand(command, commandArgs = ['--version']) {
  const probe = spawnSync(command, commandArgs, {
    stdio: 'ignore',
    shell: false,
  });
  return probe.status === 0;
}

function resolvePnpmLauncher() {
  if (process.env.TITANE_E2E_PNPM_BIN) {
    return {
      cmd: process.env.TITANE_E2E_PNPM_BIN,
      prefixArgs: [],
      label: `env:${process.env.TITANE_E2E_PNPM_BIN}`,
    };
  }

  if (fs.existsSync(localPnpmBin)) {
    return {
      cmd: localPnpmBin,
      prefixArgs: [],
      label: `local:${localPnpmBin}`,
    };
  }

  if (hasCommand('corepack', ['pnpm', '--version'])) {
    return {
      cmd: 'corepack',
      prefixArgs: ['pnpm'],
      label: 'corepack pnpm',
    };
  }

  if (hasCommand('pnpm')) {
    return {
      cmd: 'pnpm',
      prefixArgs: [],
      label: 'pnpm',
    };
  }

  throw new Error(
    `No pnpm launcher available. Checked: ${localPnpmBin}, corepack pnpm, pnpm.`
  );
}

const pnpmLauncher = resolvePnpmLauncher();

const maxRestarts = Number(process.env.TITANE_E2E_VITE_RESTARTS || '2');
let restartCount = 0;
let shuttingDown = false;
let child = null;

function log(message) {
  process.stdout.write(`[E2E_VITE] ${message}\n`);
}

function startChild() {
  const viteArgs = [...pnpmLauncher.prefixArgs, 'exec', 'vite', 'dev', ...args];
  log(`start: [${pnpmLauncher.label}] ${pnpmLauncher.cmd} ${viteArgs.join(' ')}`);

  const childEnv = { ...process.env };
  // Some runners inject NODE_OPTIONS for Vitest-only polyfills that break Vite startup.
  // Keep Vite webServer environment minimal and deterministic.
  delete childEnv.NODE_OPTIONS;

  child = spawn(pnpmLauncher.cmd, viteArgs, {
    cwd: repoRoot,
    env: childEnv,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      process.exit(code ?? 0);
      return;
    }

    restartCount += 1;
    if (restartCount > maxRestarts) {
      log(`exit: code=${code} signal=${signal} (restarts exceeded)`);
      process.exit(code ?? 1);
      return;
    }

    const delayMs = 1000 * restartCount;
    log(
      `exit: code=${code} signal=${signal} (restart ${restartCount}/${maxRestarts} in ${delayMs}ms)`
    );
    setTimeout(startChild, delayMs);
  });
}

function shutdown() {
  shuttingDown = true;
  if (child && !child.killed) {
    child.kill('SIGTERM');
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

startChild();
