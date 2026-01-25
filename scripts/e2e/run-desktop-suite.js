import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function killPortUsers(port) {
  try {
    const pidsRaw = spawnSync(
      'bash',
      ['-lc', `lsof -nP -t -iTCP:${port} -sTCP:LISTEN 2>/dev/null || true`],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    )
      .stdout?.toString()
      .trim();

    if (!pidsRaw) return;

    const pids = pidsRaw
      .split(/\s+/)
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => Number(v))
      .filter(v => Number.isFinite(v));

    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        // ignore
      }
    }

    spawnSync('bash', ['-lc', 'sleep 0.3'], { stdio: 'ignore' });

    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

let didCleanup = false;
function cleanupSync(reason) {
  if (didCleanup) return;
  didCleanup = true;

  try {
    spawnSync('node', ['scripts/e2e/stop-tauri-desktop.js'], {
      cwd: process.cwd(),
      env: { ...process.env, TAURI_E2E_MODE: 'true' },
      stdio: 'ignore',
    });
  } catch {
    // ignore
  }

  // Best-effort port cleanup in case WDIO didn't reach onComplete.
  const driverPort = Number(process.env.TAURI_DRIVER_PORT || '4447');
  const nativePort = Number(process.env.TAURI_NATIVE_PORT || '5557');
  if (Number.isFinite(driverPort)) killPortUsers(driverPort);
  if (Number.isFinite(nativePort)) killPortUsers(nativePort);

  if (process.env.WDIO_DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`Desktop E2E cleanup executed (${reason})`);
  }
}

process.once('SIGINT', () => {
  cleanupSync('SIGINT');
  process.exit(130);
});
process.once('SIGTERM', () => {
  cleanupSync('SIGTERM');
  process.exit(143);
});
process.once('beforeExit', () => {
  cleanupSync('beforeExit');
});

function hasExecutable(cmd) {
  const res = spawnSync('bash', ['-lc', `command -v ${cmd} >/dev/null 2>&1`], {
    stdio: 'ignore',
  });
  return res.status === 0;
}

function resolveWebKitWebDriverPath() {
  const candidateFromEnv = process.env.WEBKIT_WEBDRIVER_PATH;
  if (candidateFromEnv && fs.existsSync(candidateFromEnv)) {
    return candidateFromEnv;
  }

  const candidates = [
    '/usr/bin/WebKitWebDriver',
    '/usr/libexec/webkit2gtk-4.1/WebKitWebDriver',
    '/usr/libexec/webkit2gtk-4.0/WebKitWebDriver',
    '/usr/lib/webkit2gtk-4.1/WebKitWebDriver',
    '/usr/lib/webkit2gtk-4.0/WebKitWebDriver',
  ];

  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // continue
    }
  }

  return null;
}

function parseArgs(argv) {
  const out = { runner: 'wdio', subset: false };
  for (const arg of argv) {
    if (arg.startsWith('--runner=')) out.runner = arg.split('=')[1] || out.runner;
    if (arg === '--subset=true' || arg === '--subset=1') out.subset = true;
  }
  return out;
}

const { runner, subset } = parseArgs(process.argv.slice(2));
const strict = process.env.DESKTOP_E2E_STRICT === '1';

if (runner !== 'wdio') {
  console.error(`Runner non supporté: ${runner}`);
  process.exit(1);
}

const missing = [];
if (!hasExecutable('tauri-driver')) missing.push('tauri-driver');
const webkitPath = resolveWebKitWebDriverPath();
if (!webkitPath) missing.push('WebKitWebDriver (webkit2gtk-driver)');

if (missing.length) {
  const msg = `Desktop E2E WDIO indisponible (pré-requis manquants): ${missing.join(', ')}`;
  if (strict) {
    console.error(`❌ ${msg}`);
    process.exit(1);
  }
  console.warn(`⚠️ ${msg}`);
  console.warn('↪︎ SKIP (set DESKTOP_E2E_STRICT=1 pour rendre cela bloquant)');
  process.exit(0);
}

console.log(`Desktop E2E (WDIO) démarrage — mode=${subset ? 'smoke' : 'full'}`);

const repoRoot = process.cwd();
const wdioBin = path.join(repoRoot, 'node_modules', '.bin', 'wdio');
const wdioArgs = ['run', 'wdio.conf.js'];

if (subset) {
  wdioArgs.push('--spec', './e2e/desktop/smoke.wdio.test.js');
}

console.log(`Commande: ${wdioBin} ${wdioArgs.join(' ')}`);

const child = spawn(wdioBin, wdioArgs, {
  cwd: repoRoot,
  env: {
    ...process.env,
    TAURI_E2E_MODE: 'true',
    WEBKIT_WEBDRIVER_PATH: webkitPath,
  },
  stdio: 'inherit',
});

// Safety net: avoid hangs in CI/dev.
const maxRuntimeMs = subset ? 240_000 : 900_000;
const timer = setTimeout(() => {
  console.error(
    `\n⏳ Timeout desktop E2E (${Math.round(maxRuntimeMs / 1000)}s) — arrêt WDIO`
  );
  child.kill('SIGINT');
}, maxRuntimeMs);
timer.unref();

child.on('exit', code => {
  clearTimeout(timer);
  cleanupSync('wdio-exit');
  process.exit(code ?? 1);
});
