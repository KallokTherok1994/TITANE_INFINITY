const path = require('node:path');
const fs = require('node:fs');

const ROOT = __dirname;
const REPORTS_DIR = path.resolve(ROOT, 'reports/e2e-desktop');
const CAPS_LOG = path.join(REPORTS_DIR, 'wdio_caps.json');
const APP_PATH = process.env.TAURI_BINARY_PATH
  ? path.resolve(process.env.TAURI_BINARY_PATH)
  : path.resolve(ROOT, 'src-tauri/target/release/titane-infinity');

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
        application: APP_PATH,
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
};
