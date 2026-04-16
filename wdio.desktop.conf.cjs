const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { spawn } = require('node:child_process');
const {
  resolveNativeBinaryPolicy,
  formatPolicySummary,
} = require('./scripts/e2e/native-binary-policy.cjs');

const ROOT = __dirname;
const REPORTS_DIR = path.resolve(ROOT, 'reports/e2e-desktop');
const CAPS_LOG = path.join(REPORTS_DIR, 'wdio_caps.json');
const WORKER_LOG = path.join(REPORTS_DIR, 'wdio_worker.log');
const WRAPPER_ENV_FILE = '/tmp/titane-e2e-wrapper.env';
let tauriDriverProcess = null;
let tauriDriverStartedByWdio = false;

function shellQuote(value) {
  return `'${String(value ?? '').replace(/'/g, `'"'"'`)}'`;
}

function writeWrapperEnvFile() {
  const keys = [
    'OFFLINE_SIM',
    // TITANE_CONVERSATION_TIMEOUT_SECS removed — dead code, no Rust runtime honors it.
    // Use OLLAMA_REQUEST_TIMEOUT_SECS to govern the effective Rust HTTP client timeout.
    'OLLAMA_REQUEST_TIMEOUT_SECS',
    'TITANE_TIMEOUT_TRACE',
    'TAURI_DEV_SERVER_URL',
    'OLLAMA_DEFAULT_MODEL',
  ];

  const lines = keys.map(key => `${key}=${shellQuote(process.env[key] ?? '')}`);
  // H7-FIX: always propagate APP_PATH so wrapper uses the patched binary (not stale AppImage)
  lines.unshift(
    `TAURI_BINARY_PATH=${shellQuote(process.env.TAURI_BINARY_PATH || APP_PATH)}`
  );
  fs.writeFileSync(WRAPPER_ENV_FILE, `${lines.join('\n')}\n`, {
    mode: 0o600,
  });
}

function checkTauriDriverReady(hostname, port, timeoutMs = 1000) {
  return new Promise(resolve => {
    const req = http.request(
      {
        hostname,
        port,
        path: '/status',
        method: 'GET',
        timeout: timeoutMs,
      },
      res => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForTauriDriver(hostname, port, maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const ready = await checkTauriDriverReady(hostname, port, 1200);
    if (ready) return true;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return false;
}

// Use E2E wrapper to inject TITANE_E2E env vars (memory/log isolation)
const WRAPPER_PATH = path.resolve(ROOT, 'scripts/e2e/tauri-wrapper.sh');
const NATIVE_BINARY_POLICY = resolveNativeBinaryPolicy({
  rootDir: ROOT,
  explicitBinaryPath: process.env.TAURI_BINARY_PATH || '',
  tauriDevServerUrl: process.env.TAURI_DEV_SERVER_URL || '',
  mode: process.env.TITANE_NATIVE_BINARY_MODE || '',
});
const APP_PATH = NATIVE_BINARY_POLICY.selectedBinaryPath || '';

exports.config = {
  runner: 'local',
  protocol: 'http',
  hostname: '127.0.0.1',
  port: 4444,
  path: '/',
  specs: ['./e2e/desktop/**/*.e2e.js', './e2e/desktop/**/*.wdio.test.js'],
  // v20/v22/v24/v25/v26 files are historical cert/audit specs tied to specific
  // AppImage builds that no longer exist. They are kept for archaeology but must
  // not execute in the active suite (they would time-out or error on missing binaries).
  exclude: [
    './e2e/desktop/v20_desktop_cert_audit.wdio.test.js',
    './e2e/desktop/v20_dom_diag.wdio.test.js',
    './e2e/desktop/v22_visible_real_ui_cert.wdio.test.js',
    './e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js',
    './e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js',
    './e2e/desktop/v26_real_online_chat_truth.wdio.test.js',
  ],
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'wry',
      maxInstances: 1,
      'wdio:maxInstances': 1,
      'wdio:enforceWebDriverClassic': true,
      'tauri:options': {
        application: WRAPPER_PATH,
      },
    },
  ],
  logLevel: 'trace',
  logLevels: {
    webdriver: 'trace',
  },
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 1800000,
  },
  async onPrepare(config) {
    const hostname = config.hostname || '127.0.0.1';
    const port = Number(config.port || 4444);

    try {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      writeWrapperEnvFile();
      fs.appendFileSync(
        WORKER_LOG,
        `${new Date().toISOString()} PREPARE check tauri-driver ${hostname}:${port}\n` +
          `wrapperEnvFile=${WRAPPER_ENV_FILE}\n` +
          `binaryPolicy=${formatPolicySummary(NATIVE_BINARY_POLICY)}\n`
      );
    } catch {
      // ignore logging failures
    }

    if (!APP_PATH || !fs.existsSync(APP_PATH)) {
      throw new Error(
        `BLOCKER: NO_VALID_BINARY | selected=${APP_PATH || '<none>'} | ${formatPolicySummary(NATIVE_BINARY_POLICY)}`
      );
    }

    const alreadyRunning = await checkTauriDriverReady(hostname, port, 1000);
    if (alreadyRunning) {
      return;
    }

    tauriDriverProcess = spawn('tauri-driver', ['--port', String(port)], {
      stdio: 'ignore',
      detached: false,
    });
    tauriDriverStartedByWdio = true;

    const ready = await waitForTauriDriver(hostname, port, 15000);
    if (!ready) {
      throw new Error(
        `BLOCKER: tauri-driver failed to start on ${hostname}:${port} within timeout`
      );
    }
  },
  beforeSession(config, capabilities) {
    try {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      fs.appendFileSync(
        CAPS_LOG,
        `${new Date().toISOString()}\n${JSON.stringify(
          {
            config: {
              hostname: config.hostname,
              port: config.port,
              path: config.path,
            },
            capabilities,
          },
          null,
          2
        )}\n\n`
      );
    } catch {
      // ignore logging failures
    }
  },
  onWorkerStart(cid, caps, specs, args, execArgv) {
    try {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      fs.appendFileSync(
        WORKER_LOG,
        `${new Date().toISOString()} START ${cid}\n` +
          `specs=${JSON.stringify(specs)}\n` +
          `args=${JSON.stringify(args)}\n` +
          `execArgv=${JSON.stringify(execArgv)}\n\n`
      );
    } catch {
      // ignore logging failures
    }
  },
  onWorkerEnd(cid, exitCode, specs, retries) {
    try {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      fs.appendFileSync(
        WORKER_LOG,
        `${new Date().toISOString()} END ${cid} exitCode=${exitCode} retries=${retries}\n` +
          `specs=${JSON.stringify(specs)}\n\n`
      );
    } catch {
      // ignore logging failures
    }
  },
  async onComplete() {
    if (!tauriDriverStartedByWdio || !tauriDriverProcess) {
      return;
    }

    try {
      tauriDriverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      // ignore kill failures
    }
  },
};
