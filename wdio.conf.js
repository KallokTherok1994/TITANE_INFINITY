export const config = {
  runner: 'local',
  specs: ['./e2e/**/*.test.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: ['--headless', '--disable-gpu']
    }
  }],
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost:5173',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  }
};