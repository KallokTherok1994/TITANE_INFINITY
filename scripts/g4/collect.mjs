import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { exportLogpack } from './export_logpack.mjs';

const LOG_DIR = resolve('runtime/dev/logs');
const JSONL_PATH = resolve('runtime/dev/logs/conversations_g4.jsonl');
const LOGPACK_PATH = resolve('runtime/dev/logs/conversations_g4.logpack.txt');

const wait = ms => new Promise(r => setTimeout(r, ms));

const getAppDataDir = () => {
  if (process.env.TITANE_G4_APPDATA_DIR) return process.env.TITANE_G4_APPDATA_DIR;
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (process.platform === 'win32') {
    return resolve(process.env.APPDATA || home, 'TITANE_INFINITY');
  }
  if (process.platform === 'darwin') {
    return resolve(home, 'Library', 'Application Support', 'TITANE_INFINITY');
  }
  return resolve(home, '.local', 'share', 'TITANE_INFINITY');
};

const getAppDataCandidates = () => {
  const base = getAppDataDir();
  if (process.platform === 'win32' || process.platform === 'darwin') {
    return [base];
  }
  const home = process.env.HOME || process.env.USERPROFILE || '';
  return [
    base,
    resolve(home, '.local', 'share', 'com.titane.infinity.dev'),
    resolve(home, '.local', 'share', 'com.titane.infinity'),
    resolve(home, '.local', 'share', 'titane-infinity'),
    resolve(home, '.local', 'share', 'TITANE_INFINITY'),
  ];
};

const writeErrorLogpack = async (message, missing = []) => {
  await mkdir(LOG_DIR, { recursive: true });
  const errorLine = JSON.stringify({
    ts: new Date().toISOString(),
    tag: missing.length ? 'G4_MISSING_MARKER' : 'G4_ERROR',
    payload: missing.length ? { message, missing } : { message },
  });
  await writeFile(JSONL_PATH, `${errorLine}\n`, 'utf-8');
  const missingLine = missing.length
    ? `\n[G4_MISSING_MARKER] ${JSON.stringify(missing)}\n`
    : '\n';
  await writeFile(
    LOGPACK_PATH,
    `---ERROR---\n[G4_ERROR] ${message}${missingLine}\n---SUMMARY---\nINSTANCE_ID observed: n/a\nstorageCount vs UI len: n/a vs n/a\ndesync/skip_setstate: ERROR / ERROR\n`,
    'utf-8'
  );
};

const waitForMarkers = async (filePath, timeoutMs = 180000) => {
  const requiredSteps = new Set([
    'BOOT',
    'TOGGLE#1',
    'TOGGLE#2',
    'TOGGLE#3',
    'TAB_SWITCH',
    'RELOAD',
    'POST_RELOAD_SIDEBAR',
  ]);
  const start = Date.now();
  let lastSteps = new Set();
  while (Date.now() - start < timeoutMs) {
    if (existsSync(filePath)) {
      const raw = await readFile(filePath, 'utf-8');
      const steps = new Set();
      for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        try {
          const entry = JSON.parse(line);
          if (entry?.phase) {
            steps.add(entry.phase);
          } else if (entry?.tag === 'G4_MARK' && entry?.payload?.step) {
            steps.add(entry.payload.step);
          }
        } catch {
          // ignore parse errors
        }
      }
      lastSteps = steps;
      let ok = true;
      for (const step of requiredSteps) {
        if (!steps.has(step)) {
          ok = false;
          break;
        }
      }
      if (ok) return raw;
    }
    await wait(1000);
  }
  const missing = Array.from(requiredSteps).filter(step => !lastSteps.has(step));
  const err = new Error('Timeout waiting for G4 markers');
  err.missing = missing;
  throw err;
};

const main = async () => {
  await mkdir(LOG_DIR, { recursive: true });
  if (existsSync(JSONL_PATH)) await rm(JSONL_PATH, { force: true });
  if (existsSync(LOGPACK_PATH)) await rm(LOGPACK_PATH, { force: true });

  const candidates = getAppDataCandidates();
  const appDataJsonlCandidates = candidates.map(dir =>
    resolve(dir, 'runtime/dev/logs/conversations_g4.jsonl')
  );
  const verbose = process.env.TITANE_G4_VERBOSE === '1';

  for (const path of appDataJsonlCandidates) {
    if (existsSync(path)) {
      await rm(path, { force: true });
    }
  }

  const devProcess = spawn('pnpm', ['run', 'dev:tauri'], {
    stdio: verbose ? 'pipe' : 'ignore',
    env: { ...process.env, VITE_TITANE_G4: '1' },
  });

  if (verbose) {
    devProcess.stdout?.on('data', data => process.stdout.write(data));
    devProcess.stderr?.on('data', data => process.stderr.write(data));
  }

  try {
    const timeoutMs = Number(process.env.TITANE_G4_TIMEOUT_MS || 180000);
    let jsonl = null;
    let lastMissing = [];
    for (const path of appDataJsonlCandidates) {
      try {
        jsonl = await waitForMarkers(path, timeoutMs);
        break;
      } catch (error) {
        if (error?.missing) {
          lastMissing = error.missing;
        }
        // try next candidate
      }
    }
    if (!jsonl) {
      const err = new Error('Timeout waiting for G4 markers');
      err.missing = lastMissing;
      throw err;
    }
    await writeFile(JSONL_PATH, jsonl, 'utf-8');

    const result = await exportLogpack({
      jsonlPath: JSONL_PATH,
      logpackPath: LOGPACK_PATH,
    });

    console.log('G4 outputs:');
    console.log(JSONL_PATH);
    console.log(LOGPACK_PATH);
    console.log('G4 summary:', result.summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const missing = error?.missing ? error.missing : [];
    await writeErrorLogpack(message, missing);
    console.error('G4 runner failed:', message);
    process.exitCode = 1;
  } finally {
    if (devProcess?.pid) {
      devProcess.kill('SIGINT');
    }
  }
};

main();
