#!/usr/bin/env node
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const repoRoot = process.cwd();
const viteBin = path.join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js');

// Configurable via env vars:
//   TITANE_ANDROID_UI_SERVER_URL  - use an already-running server (skips Vite startup)
//   TITANE_ANDROID_UI_PORT        - override default Vite port (default: 5173)
//   TITANE_ANDROID_UI_TIMEOUT_MS  - HTTP readiness timeout in ms (default: 90000)
const externalServerUrl = process.env.TITANE_ANDROID_UI_SERVER_URL ?? '';
const port = Number(process.env.TITANE_ANDROID_UI_PORT ?? '5173');
const host = '127.0.0.1';
const baseUrl = externalServerUrl || `http://${host}:${port}/`;
const httpTimeoutMs = Number(process.env.TITANE_ANDROID_UI_TIMEOUT_MS ?? '90000');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForHttpReady(url, timeoutMs = 60000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const probe = () => {
      const req = http.get(url, res => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve(true);
          return;
        }
        retry();
      });

      req.on('error', retry);
      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`[android-ui:e2e] Timeout (${timeoutMs}ms) waiting for ${url}`));
        return;
      }
      setTimeout(probe, 500);
    };

    probe();
  });
}

async function runPlaywright(serverUrl) {
  const playwrightCli = path.join(repoRoot, 'node_modules', '@playwright', 'test', 'cli.js');
  const pw = spawn(
    process.execPath,
    [
      playwrightCli,
      'test',
      'e2e/android/android-build-ui.browser.spec.ts',
      '--project', 'chromium',
      '--project', 'chromium-android-ui',
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        TITANE_E2E_USE_WEBSERVER: '0',
        // Allow overriding base URL for Playwright via port env
        ...(process.env.TITANE_ANDROID_UI_PORT
          ? { TITANE_E2E_PORT: String(port) }
          : {}),
      },
    }
  );

  return new Promise(resolve => {
    pw.on('exit', exitCode => resolve(exitCode ?? 1));
  });
}

async function main() {
  // ── Fast path: external server already running ─────────────────────────
  if (externalServerUrl) {
    console.log(`[android-ui:e2e] Using external server: ${externalServerUrl}`);
    try {
      await waitForHttpReady(externalServerUrl, httpTimeoutMs);
      console.log(`[android-ui:e2e] Server ready — starting Playwright`);
    } catch (err) {
      console.error(`[android-ui:e2e] ${err.message}`);
      process.exit(1);
    }
    const code = await runPlaywright(externalServerUrl);
    process.exit(code);
    return;
  }

  // ── Default path: start Vite dev server ───────────────────────────────
  console.log(`[android-ui:e2e] Starting Vite on ${host}:${port}`);
  const vite = spawn(process.execPath, [viteBin, 'dev', '--host', host, '--port', String(port), '--strictPort'], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  vite.stdout.on('data', chunk => {
    process.stdout.write(`[android-ui:vite] ${chunk}`);
  });
  vite.stderr.on('data', chunk => {
    process.stderr.write(`[android-ui:vite] ${chunk}`);
  });

  const shutdown = () => {
    if (!vite.killed) {
      vite.kill('SIGTERM');
    }
  };

  process.on('exit', shutdown);
  process.on('SIGINT', () => {
    shutdown();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    shutdown();
    process.exit(143);
  });

  try {
    await waitForHttpReady(baseUrl, httpTimeoutMs);
    console.log(`[android-ui:e2e] Vite ready at ${baseUrl} — starting Playwright`);

    const code = await runPlaywright(baseUrl);

    shutdown();
    await sleep(300);
    process.exit(code);
  } catch (error) {
    shutdown();
    console.error(`[android-ui:e2e] ${error.message}`);
    process.exit(1);
  }
}

main();
