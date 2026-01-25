import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { openSync, closeSync } from 'node:fs';
import net from 'node:net';

const PID_FILE = 'runtime/dev/tauri-desktop.pid';
const LOG_DIR = 'runtime/dev/logs/e2e';
const LOG_FILE = `${LOG_DIR}/tauri-desktop-dev.log`;

async function waitForPort(port, timeoutMs = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const socket = net.createConnection(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
          return;
        }
        setTimeout(tick, 500);
      });
    };
    tick();
  });
}

await fs.mkdir(LOG_DIR, { recursive: true });

// If already running, keep it.
try {
  const existingPid = Number((await fs.readFile(PID_FILE, 'utf8')).trim());
  if (existingPid && Number.isFinite(existingPid)) {
    process.stdout.write(`Tauri desktop already started (PID ${existingPid})\n`);
    process.exit(0);
  }
} catch {
  // ignore
}

// Start a local dev Tauri session without Ollama to keep E2E lightweight.
// IMPORTANT: The WDIO onPrepare hook waits for this script to exit.
// We must detach the long-running process and exit once the dev server is ready.
const logFd = openSync(LOG_FILE, 'a');
const child = spawn('pnpm', ['run', 'dev:tauri:no-ollama'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    TAURI_E2E_MODE: 'true',
  },
  detached: true,
  stdio: ['ignore', logFd, logFd],
});

child.unref();
closeSync(logFd);

await fs.writeFile(PID_FILE, String(child.pid));

await waitForPort(5173, 120000);
process.stdout.write('Tauri desktop dev ready on 127.0.0.1:5173\n');
process.exit(0);
