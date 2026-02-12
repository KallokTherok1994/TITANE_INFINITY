const path = require('node:path');
const fs = require('node:fs');

const ROOT = __dirname;
const REPORTS_DIR = path.resolve(ROOT, 'reports/e2e-desktop');
const CAPS_LOG = path.join(REPORTS_DIR, 'wdio_caps.json');
const WORKER_LOG = path.join(REPORTS_DIR, 'wdio_worker.log');

// Use E2E wrapper to inject TITANE_E2E env vars (memory/log isolation)
const WRAPPER_PATH = path.resolve(ROOT, 'scripts/e2e/tauri-wrapper.sh');
const APP_PATH = process.env.TAURI_BINARY_PATH
  ? path.resolve(process.env.TAURI_BINARY_PATH)
  : path.resolve(ROOT, 'src-tauri/target/debug/titane-infinity');

exports.config = {
  runner: 'local',
  protocol: 'http',
  hostname: '127.0.0.1',
  port: 4444,
  path: '/',
  specs: ['./e2e/desktop/**/*.e2e.js', './e2e/desktop/**/*.wdio.test.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'wry',
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
};
