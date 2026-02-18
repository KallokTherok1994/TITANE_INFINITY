import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const ROOT = process.cwd();
const REPORTS = process.env.TITANE_E2E_ARTIFACTS_DIR
  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
  : path.resolve(ROOT, 'reports/e2e-desktop');
const DIAG_LOG = path.join(REPORTS, 'diagnostics.log');
const WDIO_LOG = path.join(REPORTS, 'wdio.log');
const TAURI_DRIVER_LOG = path.join(REPORTS, 'tauri_driver.log');
const WEBKIT_LOG = path.join(REPORTS, 'webkit_driver.log');
const WDIO_CONFIG = path.resolve(ROOT, 'wdio.desktop.conf.cjs');
const TAURI_BINARY_PATH = process.env.TAURI_BINARY_PATH || '';

await fs.mkdir(REPORTS, { recursive: true });
await fs.writeFile(DIAG_LOG, '');
await fs.writeFile(WDIO_LOG, '');
await fs.writeFile(TAURI_DRIVER_LOG, '');
await fs.writeFile(WEBKIT_LOG, '');

const appendDiag = async line => {
  const entry = `${new Date().toISOString()} ${line}\n`;
  process.stderr.write(entry);
  await fs.appendFile(DIAG_LOG, entry);
};

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
  const output = createWriteStream(logFile, { flags: 'a' });
  const child = spawn(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...envOverrides },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.pipe(output);
  child.stderr.pipe(output);
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

await appendDiag(`Artifacts dir: ${REPORTS}`);
await appendDiag(`WDIO config: ${WDIO_CONFIG}`);
await appendDiag(`TAURI_BINARY_PATH: ${TAURI_BINARY_PATH || '<unset>'}`);
await appendDiag(`tauri-driver args: ${['tauri-driver', ...tauriArgs].join(' ')}`);

const tauriDriver = spawnLogged('tauri-driver', tauriArgs, TAURI_DRIVER_LOG, {
  RUST_LOG: process.env.RUST_LOG || 'debug',
});

await waitForPort(4444).catch(() => false);

await appendDiag(`wdio command: pnpm exec wdio run ${WDIO_CONFIG}`);
const wdio = spawnLogged('pnpm', ['exec', 'wdio', 'run', WDIO_CONFIG], WDIO_LOG);

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

wdio.on('exit', async code => {
  if (code && code !== 0) {
    await appendDiag('FAILURE SUMMARY');
    await appendDiag(`exit_code=${code}`);
    await appendDiag(`wdio_log=${WDIO_LOG}`);
    await appendDiag(`tauri_driver_log=${TAURI_DRIVER_LOG}`);
    await appendDiag(`webkit_log=${WEBKIT_LOG}`);
  }
  shutdown();
  process.exit(code ?? 1);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
