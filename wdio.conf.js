import { execSync, spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs/promises';
import { accessSync, constants as fsConstants } from 'node:fs';
import http from 'node:http';

let tauriDriverProcess;

function isTauriE2eMode() {
  return process.env.TAURI_E2E_MODE === 'true' || process.env.TAURI_E2E_MODE === '1';
}

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

async function waitForHttpStatus({ hostname, port, path, timeoutMs = 60000 }) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.request(
        {
          hostname,
          port,
          path,
          method: 'GET',
          timeout: 1000,
        },
        res => {
          res.resume();
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
            return;
          }

          const elapsed = Date.now() - start;
          if (elapsed > timeoutMs) {
            reject(new Error(`Timeout waiting for HTTP ${hostname}:${port}${path}`));
            return;
          }
          setTimeout(attempt, 250);
        }
      );
      req.on('error', () => {
        const elapsed = Date.now() - start;
        if (elapsed > timeoutMs) {
          reject(new Error(`Timeout waiting for HTTP ${hostname}:${port}${path}`));
          return;
        }
        setTimeout(attempt, 250);
      });
      req.on('timeout', () => {
        req.destroy();
      });
      req.end();
    };

    attempt();
  });
}

function resolveWebKitWebDriverPath() {
  const candidateFromEnv = process.env.WEBKIT_WEBDRIVER_PATH;
  if (candidateFromEnv) {
    accessSync(candidateFromEnv, fsConstants.X_OK);
    return candidateFromEnv;
  }

  const candidates = [
    '/usr/bin/WebKitWebDriver',
    '/usr/libexec/webkit2gtk-4.1/WebKitWebDriver',
    '/usr/libexec/webkit2gtk-4.0/WebKitWebDriver',
  ];
  for (const candidate of candidates) {
    try {
      accessSync(candidate, fsConstants.X_OK);
      return candidate;
    } catch {
      // continue
    }
  }

  throw new Error(
    'WebKitWebDriver introuvable. Installez `webkit2gtk-driver` (Ubuntu) ou exportez WEBKIT_WEBDRIVER_PATH vers un binaire exécutable.'
  );
}

async function runNodeScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      cwd: process.cwd(),
      env: { ...process.env, TAURI_E2E_MODE: 'true' },
      stdio: 'pipe',
    });

    child.stdout?.on('data', data => {
      if (process.env.WDIO_DEBUG) {
        process.stdout.write(`[wdio:${scriptPath}:stdout] ${data}`);
      }
    });

    child.stderr?.on('data', data => {
      process.stderr.write(`[wdio:${scriptPath}:stderr] ${data}`);
    });

    child.on('error', err => reject(err));
    child.on('exit', code => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`${scriptPath} exited with code ${code}`));
      }
    });
  });
}

function killPortUsers(port) {
  try {
    const pidsRaw = execSync(
      `lsof -nP -t -iTCP:${port} -sTCP:LISTEN 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
    if (!pidsRaw) return;

    const pids = pidsRaw
      .split(/\s+/)
      .map(v => v.trim())
      .filter(Boolean);

    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        // ignore
      }
    }

    // Best-effort hard kill after a short grace period
    execSync('sleep 0.3');
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGKILL');
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

export const config = {
  runner: 'local',
  specs: isTauriE2eMode() ? ['./e2e/desktop/**/*.wdio.test.js'] : ['./e2e/**/*.test.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      browserName: isTauriE2eMode() ? 'MiniBrowser' : 'chrome',
      ...(isTauriE2eMode()
        ? {}
        : {
            'goog:chromeOptions': {
              args: ['--headless', '--disable-gpu'],
            },
          }),
    },
  ],
  logLevel: 'info',
  bail: 0,
  baseUrl: isTauriE2eMode() ? 'http://127.0.0.1:5173' : 'http://localhost:5173',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  hostname: isTauriE2eMode() ? '127.0.0.1' : undefined,
  port: isTauriE2eMode() ? Number(process.env.TAURI_DRIVER_PORT || '4447') : undefined,
  path: isTauriE2eMode() ? '/' : undefined,
  services: [],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: isTauriE2eMode() ? 240000 : 60000,
  },
  onPrepare: async () => {
    if (!isTauriE2eMode()) {
      throw new Error(
        '🔒 TAURI-ONLY MODE: lancer WDIO avec TAURI_E2E_MODE=true (desktop harness)'
      );
    }

    const driverPort = Number(process.env.TAURI_DRIVER_PORT || '4447');
    const nativePort = Number(process.env.TAURI_NATIVE_PORT || '5557');
    const nativeHost = process.env.TAURI_NATIVE_HOST || '127.0.0.1';

    await fs.mkdir('runtime/dev/logs/e2e', { recursive: true });

    const webkitDriverPath = resolveWebKitWebDriverPath();

    tauriDriverProcess = spawn(
      'tauri-driver',
      [
        '--port',
        String(driverPort),
        '--native-driver',
        webkitDriverPath,
        '--native-host',
        nativeHost,
        '--native-port',
        String(nativePort),
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, TAURI_E2E_MODE: 'true' },
        stdio: 'pipe',
      }
    );

    tauriDriverProcess.stdout?.on('data', data => {
      if (process.env.WDIO_DEBUG) {
        process.stdout.write(`[wdio:tauri-driver] ${data}`);
      }
    });
    tauriDriverProcess.stderr?.on('data', data => {
      process.stderr.write(`[wdio:tauri-driver:err] ${data}`);
    });

    await waitForPort(driverPort, 30000);
    await waitForHttpStatus({
      hostname: '127.0.0.1',
      port: driverPort,
      path: '/status',
      timeoutMs: 30000,
    });

    await runNodeScript('scripts/e2e/start-tauri-desktop.js');
  },
  onComplete: async () => {
    try {
      if (isTauriE2eMode()) {
        await runNodeScript('scripts/e2e/stop-tauri-desktop.js');
      }
    } finally {
      if (tauriDriverProcess && !tauriDriverProcess.killed) {
        tauriDriverProcess.kill('SIGTERM');
      }

      if (isTauriE2eMode()) {
        const driverPort = Number(process.env.TAURI_DRIVER_PORT || '4447');
        const nativePort = Number(process.env.TAURI_NATIVE_PORT || '5557');
        killPortUsers(driverPort);
        killPortUsers(nativePort);
      }
    }
  },
};
