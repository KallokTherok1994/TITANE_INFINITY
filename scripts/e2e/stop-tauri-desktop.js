import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';

const PID_FILE = 'runtime/dev/tauri-desktop.pid';

function killPid(pid) {
  const targets = [
    // When started with `detached: true`, the child becomes a process group leader.
    // Killing `-pid` stops the whole tree (pnpm + tauri + vite).
    { label: 'group', value: -pid },
    { label: 'pid', value: pid },
  ];

  for (const t of targets) {
    try {
      process.kill(t.value, 'SIGTERM');
      break;
    } catch {
      // try next
    }
  }

  try {
    execSync('sleep 1');
  } catch {
    // ignore
  }

  try {
    process.kill(-pid, 'SIGKILL');
  } catch {
    // ignore
  }

  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    // ignore
  }
}

let pid = null;
try {
  pid = Number((await fs.readFile(PID_FILE, 'utf8')).trim());
} catch {
  pid = null;
}

if (pid && Number.isFinite(pid)) {
  killPid(pid);
}

try {
  await fs.unlink(PID_FILE);
} catch {
  // ignore
}
