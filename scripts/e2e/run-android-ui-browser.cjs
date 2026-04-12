#!/usr/bin/env node
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const repoRoot = process.cwd();
const viteBin = path.join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const host = '127.0.0.1';
const port = 5173;
const baseUrl = `http://${host}:${port}/`;

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
        reject(new Error(`Timeout waiting for ${url}`));
        return;
      }
      setTimeout(probe, 500);
    };

    probe();
  });
}

async function main() {
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
    await waitForHttpReady(baseUrl, 90000);

    const pw = spawn(
      process.execPath,
      [
        path.join(repoRoot, 'node_modules', '@playwright', 'test', 'cli.js'),
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
        },
      }
    );

    const code = await new Promise(resolve => {
      pw.on('exit', exitCode => resolve(exitCode ?? 1));
    });

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
