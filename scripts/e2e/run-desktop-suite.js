import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { openSync, closeSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const ROOT = process.cwd();
const REPORTS = path.resolve(ROOT, 'reports/e2e-desktop');
const WDIO_LOG = path.join(REPORTS, 'wdio.log');
const TAURI_DRIVER_LOG = path.join(REPORTS, 'tauri_driver.log');
const WEBKIT_LOG = path.join(REPORTS, 'webkit_driver.log');

await fs.mkdir(REPORTS, { recursive: true });
await fs.writeFile(WDIO_LOG, '');
await fs.writeFile(TAURI_DRIVER_LOG, '');
await fs.writeFile(WEBKIT_LOG, '');

function waitForPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const socket = net.createConnection(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
          return;
        }
        setTimeout(tick, 300);
      });
    };
    tick();
  });
}

function spawnLogged(cmd, args, logFile, envOverrides = {}) {
  const fd = openSync(logFile, 'a');
  const child = spawn(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...envOverrides },
    stdio: ['ignore', fd, fd],
  });
  closeSync(fd);
  return child;
}

let nativeDriverPath = process.env.WEBKIT_WEBDRIVER_PATH || '';
if (!nativeDriverPath) {
  try {
    nativeDriverPath = execSync('which WebKitWebDriver', {
      encoding: 'utf8',
    }).trim();
  } catch {
    nativeDriverPath = '';
  }
}
const tauriArgs = ['--port', '4444'];
if (nativeDriverPath) {
  tauriArgs.push(
    '--native-port',
    '4445',
    '--native-host',
    '127.0.0.1',
    '--native-driver',
    nativeDriverPath
  );
}

const tauriDriver = spawnLogged('tauri-driver', tauriArgs, TAURI_DRIVER_LOG, {
  RUST_LOG: process.env.RUST_LOG || 'debug',
});

await waitForPort(4444).catch(() => false);

const wdio = spawnLogged(
  'pnpm',
  ['exec', 'wdio', 'run', 'wdio.desktop.conf.cjs'],
  WDIO_LOG
);

const shutdown = () => {
  for (const child of [wdio, tauriDriver]) {
    if (!child?.pid) continue;
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
};

wdio.on('exit', code => {
  shutdown();
  process.exit(code ?? 1);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
