#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { classifyMonitorLine, normalizeMonitorArgs } from './dev_tauri_monitor_rules.mjs';

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'runtime', 'dev', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'tauri-dev-monitor.log');
const STATUS_FILE = path.join(LOG_DIR, 'tauri-dev-monitor-status.json');
const SUMMARY_FILE = path.join(LOG_DIR, 'tauri-dev-monitor-summary.json');

function bootstrapWindowsDevEnv(env) {
  const nextEnv = { ...env };
  if (process.platform !== 'win32') {
    return nextEnv;
  }

  if (!nextEnv.HOME) {
    nextEnv.HOME = nextEnv.USERPROFILE || process.env.USERPROFILE || process.env.HOME;
  }

  const hostAppData = nextEnv.APPDATA || path.join(nextEnv.HOME, 'AppData', 'Roaming');
  const devAppData = nextEnv.TITANE_DEV_APPDATA_ROOT || path.join(hostAppData, 'TITANE_INFINITY', 'dev', 'appdata');
  mkdirSync(devAppData, { recursive: true });

  nextEnv.APPDATA = devAppData;
  nextEnv.TITANE_DEV_APPDATA_ROOT = devAppData;
  nextEnv.TITANE_SECRETS_PATH =
    nextEnv.TITANE_SECRETS_PATH || path.join(devAppData, 'titane_infinity', 'secrets.enc');
  nextEnv.TITANE_DEV_AUTO_TOKEN = nextEnv.TITANE_DEV_AUTO_TOKEN || '1';

  // Fix Windows conversation DB path: use LOCALAPPDATA (stable) instead of HOME/.local/share (Linux-style)
  const localAppData = process.env.LOCALAPPDATA
    || path.join(nextEnv.HOME || nextEnv.USERPROFILE, 'AppData', 'Local');
  if (!nextEnv.TITANE_CONVOS_DB_PATH) {
    const convosDbDir = path.join(localAppData, 'TITANE_INFINITY', 'runtime', 'memory');
    mkdirSync(convosDbDir, { recursive: true });
    nextEnv.TITANE_CONVOS_DB_PATH = path.join(convosDbDir, 'conversation_os_v1.db');
  }

  if (!nextEnv.TITANE_SECRETS_PASSPHRASE) {
    const devDir = path.join(hostAppData, 'TITANE_INFINITY', 'dev');
    const passphraseFile = path.join(devDir, 'secrets-passphrase.txt');
    mkdirSync(devDir, { recursive: true });
    if (!existsSync(passphraseFile)) {
      writeFileSync(passphraseFile, randomBytes(32).toString('hex'), { encoding: 'ascii', mode: 0o600 });
    }
    nextEnv.TITANE_SECRETS_PASSPHRASE = readFileSync(passphraseFile, 'utf8').trim();
  }

  return nextEnv;
}

// Fonction d'aide
function showHelp() {
  console.log(`
🚀 TITANE∞ Dev Tauri Monitor
`);
  console.log('Usage: node dev_tauri_monitor.mjs [OPTIONS] [-- COMMAND_ARGS]\n');
  console.log('OPTIONS:');
  console.log('  --help, -h        Affiche cette aide');
  console.log('  --smoke SECONDS   Mode test rapide (arrêt auto après X secondes)');
  console.log('  --polling         Active le polling de fichiers (pour Docker/VM)');
  console.log('  --no-ollama       Démarre sans Ollama');
  console.log('\nEXEMPLES:');
  console.log('  pnpm run dev:tauri');
  console.log('  pnpm run dev:tauri --smoke 10');
  console.log('  pnpm run dev:tauri --no-ollama');
  console.log('\n📋 LOGS:');
  console.log(`  Monitor: ${LOG_FILE}`);
  console.log(`  Status:  ${STATUS_FILE}`);
  console.log('');
}

// Traiter les arguments
const passthroughArgs = normalizeMonitorArgs(process.argv.slice(2));

// Vérifier si l'aide est demandée
if (passthroughArgs.includes('--help') || passthroughArgs.includes('-h')) {
  showHelp();
  process.exit(0);
}

mkdirSync(LOG_DIR, { recursive: true });

const isSmokeRun = passthroughArgs.includes('--smoke');
const scriptPath = path.join('scripts', 'launch', 'deploy_full_local_dev.sh');
const isWindows = process.platform === 'win32';
const command = isWindows ? 'bash' : scriptPath;
const commandArgs = isWindows ? [scriptPath, ...passthroughArgs] : passthroughArgs;

const child = spawn(command, commandArgs, {
  cwd: ROOT,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
  env: bootstrapWindowsDevEnv({
    ...process.env,
    TITANE_DEV_MONITOR: '1',
    // Override global rustflags: /DEFAULTLIB:crt_stub_exe causes STATUS_ACCESS_VIOLATION when
    // rustc loads proc-macro DLLs (displaydoc used by ICU4X: tinystr, zerotrie, icu_collections).
    // The crt_stub_exe CRT init conflicts with rustc's own CRT when loaded as a DLL.
    // Keep only -C panic=abort; linker path flags are handled by ~/.cargo/config.toml for the
    // final binary link step (not proc-macro compilation).
    RUSTFLAGS: process.env.RUSTFLAGS ?? '-C panic=abort -C link-arg=/STACK:67108864',
  }),
});

const startedAt = Date.now();
let lineCount = 0;
let errorCount = 0;
let warnCount = 0;
let timeoutCount = 0;
let unknownCount = 0;
let lastErrorLine = '';
let lastWarnLine = '';
let bootSeen = false;

const out = createWriteStream(LOG_FILE, { flags: 'w' });
let finalized = false;

function nowIso() {
  return new Date().toISOString();
}

function writeStatus(extra = {}) {
  const payload = {
    ts: nowIso(),
    pid: child.pid,
    uptime_sec: Math.floor((Date.now() - startedAt) / 1000),
    line_count: lineCount,
    error_count: errorCount,
    warn_count: warnCount,
    timeout_count: timeoutCount,
    unknown_count: unknownCount,
    boot_seen: bootSeen,
    last_error_line: lastErrorLine,
    last_warn_line: lastWarnLine,
    ...extra,
  };
  writeFileSync(STATUS_FILE, JSON.stringify(payload, null, 2));
}

function inspectLine(line) {
  const classification = classifyMonitorLine(line);

  // Détection améliorée du boot
  if (classification.bootSeen) {
    bootSeen = true;
  }

  if (classification.hasTimeout) {
    timeoutCount += 1;
  }

  if (classification.hasUnknown) {
    unknownCount += 1;
  }

  if (classification.ignore) {
    return;
  }

  if (classification.isError) {
    errorCount += 1;
    lastErrorLine = classification.normalized.slice(0, 500);
  }

  if (classification.isWarn) {
    warnCount += 1;
    lastWarnLine = classification.normalized.slice(0, 500);
  }
}

function printMonitorLine() {
  const uptime = Math.floor((Date.now() - startedAt) / 1000);
  const state = bootSeen ? 'BOOT:READY' : 'BOOTING';
  const memoryMB = process.memoryUsage().rss / 1024 / 1024;
  process.stdout.write(
    `\n[TAURI_MONITOR] state=${state} uptime=${uptime}s pid=${child.pid} lines=${lineCount} warn=${warnCount} error=${errorCount} memory=${memoryMB.toFixed(1)}MB\n`
  );
}

function onChunk(source, chunk) {
  const text = chunk.toString('utf8');
  out.write(text);
  if (source === 'stdout') {
    process.stdout.write(text);
  } else {
    process.stderr.write(text);
  }

  const lines = text.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    lineCount += 1;
    inspectLine(line);
  }

  writeStatus();
}

child.stdout.on('data', chunk => onChunk('stdout', chunk));
child.stderr.on('data', chunk => onChunk('stderr', chunk));

const interval = setInterval(() => {
  printMonitorLine();
  writeStatus();
}, 10000);

function shutdown(signal) {
  clearInterval(interval);
  if (!child.killed) {
    child.kill(signal);
  }

  if (isSmokeRun) {
    finalize(0, null, { forcedBySignal: signal });
  }
}

function finalize(code, signal, extra = {}) {
  if (finalized) {
    return;
  }
  finalized = true;

  const summary = {
    ts: nowIso(),
    code,
    signal,
    pid: child.pid,
    duration_sec: Math.floor((Date.now() - startedAt) / 1000),
    line_count: lineCount,
    warn_count: warnCount,
    error_count: errorCount,
    timeout_count: timeoutCount,
    unknown_count: unknownCount,
    boot_seen: bootSeen,
    log_file: LOG_FILE,
    status_file: STATUS_FILE,
    ...extra,
  };
  writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
  writeStatus({ finished: true, exit_code: code, exit_signal: signal, ...extra });
  out.end();

  process.stdout.write(
    `\n[TAURI_MONITOR] session ended code=${code ?? 'null'} signal=${signal ?? 'null'}\n`
  );
  process.stdout.write(`[TAURI_MONITOR] summary: ${SUMMARY_FILE}\n`);
  process.exit(code ?? 0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

child.on('exit', (code, signal) => {
  clearInterval(interval);
  const normalizedCode =
    isSmokeRun && (code === 143 || signal === 'SIGTERM' || signal === 'SIGINT')
      ? 0
      : code;
  const normalizedSignal = isSmokeRun ? null : signal;
  finalize(normalizedCode, normalizedSignal);
});
