import { spawn } from 'node:child_process';
import net from 'node:net';

let devServerProcess;

async function waitForPort(port, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = net.createConnection(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.once('error', () => {
        const elapsed = Date.now() - start;
        if (elapsed > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

export const config = {
  runner: 'local',
  specs: ['./e2e/**/*.test.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless', '--disable-gpu'],
      },
    },
  ],
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
    timeout: 60000,
  },
  onPrepare: async () => {
    const envPath = `${process.env.PATH}:${process.cwd()}/.tools/node/current/bin`;
    devServerProcess = spawn(
      'pnpm',
      [
        'exec',
        'vite',
        'dev',
        '--config',
        'vite.config.ts',
        '--host',
        '127.0.0.1',
        '--port',
        '5173',
        '--strictPort',
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, PATH: envPath },
        stdio: 'pipe',
      }
    );

    devServerProcess.stdout?.on('data', data => {
      if (process.env.WDIO_DEBUG) {
        process.stdout.write(`[wdio:devserver] ${data}`);
      }
    });
    devServerProcess.stderr?.on('data', data => {
      process.stderr.write(`[wdio:devserver:err] ${data}`);
    });

    await waitForPort(5173);
  },
  onComplete: async () => {
    if (devServerProcess && !devServerProcess.killed) {
      devServerProcess.kill('SIGTERM');
    }
  },
};
