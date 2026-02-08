/* eslint-disable */
const path = require('node:path');

exports.config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: Number(process.env.WDIO_PORT || process.env.TAURI_DRIVER_PORT || 4444),
  path: '/',
  specs: [
    path.resolve(__dirname, 'e2e/desktop/boot-smoke.e2e.cjs'),
    path.resolve(__dirname, 'e2e/desktop/ai-verification.full.e2e.js'),
  ],
  maxInstances: 1,
  logLevel: 'info',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 1800000,
  },
  capabilities: [
    {
      'tauri:options': {
        application: path.resolve(__dirname, 'src-tauri/target/debug/titane-infinity'),
      },
    },
  ],
};
