import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';
import path from 'node:path';
import net from 'node:net';
import os from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  resolveNativeBinaryPolicy,
  formatPolicySummary,
} = require('./native-binary-policy.cjs');

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
const WDIO_SPEC = process.env.WDIO_SPEC || '';
const E2E_FORCE_LOCAL_PROVIDER = process.env.E2E_FORCE_LOCAL_PROVIDER !== '0';
const E2E_OLLAMA_MODEL = process.env.TITANE_E2E_OLLAMA_MODEL || 'gemma2:2b';
const E2E_OLLAMA_REQUEST_TIMEOUT_SECS = process.env.OLLAMA_REQUEST_TIMEOUT_SECS || '90';
const E2E_AI_VERIFY_RESPONSE_TIMEOUT_MS =
  process.env.AI_VERIFY_RESPONSE_TIMEOUT_MS || '150000';

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
  child.stdout.pipe(output, { end: false });
  child.stderr.pipe(output, { end: false });
  child.once('close', () => {
    output.end();
  });
  return { child, output };
}

async function waitForStreamFinish(stream, timeoutMs = 3000) {
  if (stream.writableEnded || stream.destroyed) return;
  await Promise.race([
    once(stream, 'finish'),
    new Promise(resolve => setTimeout(resolve, timeoutMs)),
  ]);
}

const isExecutable = filePath => {
  try {
    fsSync.accessSync(filePath, fsSync.constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const findPlaywrightWebKitDriver = () => {
  const cacheRoot = path.join(os.homedir(), '.cache', 'ms-playwright');
  if (!fsSync.existsSync(cacheRoot)) return '';

  const candidates = [];
  for (const entry of fsSync.readdirSync(cacheRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('webkit-')) continue;
    candidates.push(
      path.join(cacheRoot, entry.name, 'minibrowser-gtk', 'WebKitWebDriver')
    );
    candidates.push(
      path.join(cacheRoot, entry.name, 'minibrowser-gtk', 'bin', 'WebKitWebDriver')
    );
  }

  for (const candidate of candidates) {
    if (isExecutable(candidate)) return candidate;
  }
  return '';
};

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
if (!nativeDriverPath) {
  nativeDriverPath = findPlaywrightWebKitDriver();
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
await appendDiag(
  `FORCE_LOCAL_PROVIDER for desktop E2E: ${E2E_FORCE_LOCAL_PROVIDER ? 'enabled' : 'disabled'}`
);
await appendDiag(
  `E2E Ollama profile: model=${E2E_OLLAMA_MODEL} requestTimeout=${E2E_OLLAMA_REQUEST_TIMEOUT_SECS}s responseTimeout=${E2E_AI_VERIFY_RESPONSE_TIMEOUT_MS}ms`
);
await appendDiag(`tauri-driver args: ${['tauri-driver', ...tauriArgs].join(' ')}`);

const nativePolicy = resolveNativeBinaryPolicy({
  rootDir: ROOT,
  explicitBinaryPath: TAURI_BINARY_PATH,
  tauriDevServerUrl: process.env.TAURI_DEV_SERVER_URL || '',
  mode: process.env.TITANE_NATIVE_BINARY_MODE || '',
});

await appendDiag(`[NATIVE_BINARY_POLICY] ${formatPolicySummary(nativePolicy)}`);
await appendDiag(
  `[NATIVE_BINARY_POLICY] precedence=${nativePolicy.precedence.join('>')} candidates=${JSON.stringify(nativePolicy.candidates)}`
);

const enforceFreshness = process.env.TITANE_ENFORCE_BINARY_FRESHNESS !== '0';
if (enforceFreshness && nativePolicy.shouldBlock) {
  await appendDiag(
    `[NATIVE_BINARY_POLICY] BLOCKER class=${nativePolicy.freshnessClass} buildRequired=${nativePolicy.buildRequired}`
  );
  await appendDiag(
    `[NATIVE_BINARY_POLICY] workspaceAheadPaths=${JSON.stringify(nativePolicy.workspaceAheadPaths)}`
  );
  process.exit(32);
}

const tauriDriver = spawnLogged('tauri-driver', tauriArgs, TAURI_DRIVER_LOG, {
  RUST_LOG: process.env.RUST_LOG || 'debug',
});

await waitForPort(4444).catch(() => false);

const wdioArgs = ['exec', 'wdio', 'run', WDIO_CONFIG];
if (WDIO_SPEC) {
  wdioArgs.push('--spec', WDIO_SPEC);
}

await appendDiag(`wdio command: pnpm ${wdioArgs.join(' ')}`);
const wdio = spawnLogged('pnpm', wdioArgs, WDIO_LOG, {
  ...(E2E_FORCE_LOCAL_PROVIDER ? { FORCE_LOCAL_PROVIDER: '1' } : {}),
  TITANE_E2E_OLLAMA_MODEL: E2E_OLLAMA_MODEL,
  OLLAMA_DEFAULT_MODEL: E2E_OLLAMA_MODEL,
  OLLAMA_REQUEST_TIMEOUT_SECS: E2E_OLLAMA_REQUEST_TIMEOUT_SECS,
  AI_VERIFY_RESPONSE_TIMEOUT_MS: E2E_AI_VERIFY_RESPONSE_TIMEOUT_MS,
});

const shutdown = () => {
  for (const child of [wdio.child, tauriDriver.child]) {
    if (!child?.pid) continue;
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
};

wdio.child.on('close', async (code, signal) => {
  await appendDiag(`wdio close: code=${code ?? 'null'} signal=${signal ?? 'null'}`);
  if (code && code !== 0) {
    await appendDiag('FAILURE SUMMARY');
    await appendDiag(`exit_code=${code}`);
    await appendDiag(`wdio_log=${WDIO_LOG}`);
    await appendDiag(`tauri_driver_log=${TAURI_DRIVER_LOG}`);
    await appendDiag(`webkit_log=${WEBKIT_LOG}`);
  }

  await waitForStreamFinish(wdio.output);
  shutdown();
  await appendDiag('shutdown sent to child processes');
  await waitForStreamFinish(tauriDriver.output);
  process.exit(code ?? 1);
});

tauriDriver.child.on('close', async (code, signal) => {
  await appendDiag(
    `tauri-driver close: code=${code ?? 'null'} signal=${signal ?? 'null'}`
  );
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
