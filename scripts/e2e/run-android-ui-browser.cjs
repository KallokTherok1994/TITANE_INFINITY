#!/usr/bin/env node
const { spawn } = require('node:child_process');
const http = require('node:http');

const repoRoot = process.cwd();
const canonicalServerUrl =
  process.env.TITANE_ANDROID_UI_SERVER_URL?.trim() || 'http://127.0.0.1:1420/';
const httpTimeoutMs = Number(process.env.TITANE_ANDROID_UI_TIMEOUT_MS ?? '90000');

function derivePlaywrightPort(url) {
  const parsed = new URL(url);
  if (parsed.port) {
    return parsed.port;
  }
  return parsed.protocol === 'https:' ? '443' : '80';
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
  const playwrightCli = require.resolve('@playwright/test/cli.js', { paths: [repoRoot] });
  const port = derivePlaywrightPort(serverUrl);
  const pw = spawn(
    process.execPath,
    [
      playwrightCli,
      'test',
      'e2e/android/android-build-ui.browser.spec.ts',
      '--project',
      'chromium',
      '--project',
      'chromium-android-ui',
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        TITANE_E2E_USE_WEBSERVER: '0',
        TITANE_E2E_PORT: String(port),
      },
    }
  );

  return new Promise(resolve => {
    pw.on('exit', exitCode => resolve(exitCode ?? 1));
  });
}

async function main() {
  console.log(`[android-ui:e2e] Canonical Android UI server: ${canonicalServerUrl}`);
  try {
    await waitForHttpReady(canonicalServerUrl, httpTimeoutMs);
    console.log('[android-ui:e2e] Canonical server reachable — starting Playwright');
    const code = await runPlaywright(canonicalServerUrl);
    process.exit(code);
  } catch (error) {
    console.error(`[android-ui:e2e] ${error.message}`);
    console.error(
      '[android-ui:e2e] Start the canonical authority first: corepack pnpm run android:dev:stable'
    );
    console.error(
      '[android-ui:e2e] Then verify reachability: curl -I -sS --max-time 5 http://127.0.0.1:1420'
    );
    process.exit(1);
  }
}

main();
