#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdirSync, createWriteStream, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'runtime', 'dev', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'tauri-dev-monitor.log');
const STATUS_FILE = path.join(LOG_DIR, 'tauri-dev-monitor-status.json');
const SUMMARY_FILE = path.join(LOG_DIR, 'tauri-dev-monitor-summary.json');

mkdirSync(LOG_DIR, { recursive: true });

const passthroughArgs = process.argv.slice(2);
const isSmokeRun = passthroughArgs.includes('--smoke');
const scriptPath = path.join('scripts', 'launch', 'deploy_full_local_dev.sh');

const child = spawn(scriptPath, passthroughArgs, {
  cwd: ROOT,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
  env: {
    ...process.env,
    TITANE_DEV_MONITOR: '1',
  },
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
  const lower = line.toLowerCase();

  if (
    lower.includes('tauri app started') ||
    lower.includes('running dev command') ||
    lower.includes('vite v') ||
    lower.includes('app render')
  ) {
    bootSeen = true;
  }

  if (lower.includes('timeout')) {
    timeoutCount += 1;
  }

  if (lower.includes('unknown')) {
    unknownCount += 1;
  }

  if (lower.includes('error') || lower.includes('panic') || lower.includes('failed')) {
    errorCount += 1;
    lastErrorLine = line.slice(0, 500);
  }

  if (lower.includes('warn')) {
    warnCount += 1;
    lastWarnLine = line.slice(0, 500);
  }
}

function printMonitorLine() {
  const uptime = Math.floor((Date.now() - startedAt) / 1000);
  const state = bootSeen ? 'UP' : 'BOOTING';
  process.stdout.write(
    `\n[TAURI_MONITOR] state=${state} uptime=${uptime}s pid=${child.pid} lines=${lineCount} warn=${warnCount} error=${errorCount} timeout=${timeoutCount} unknown=${unknownCount}\n`
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

  process.stdout.write(`\n[TAURI_MONITOR] session ended code=${code ?? 'null'} signal=${signal ?? 'null'}\n`);
  process.stdout.write(`[TAURI_MONITOR] summary: ${SUMMARY_FILE}\n`);
  process.exit(code ?? 0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

child.on('exit', (code, signal) => {
  clearInterval(interval);
  const normalizedCode =
    isSmokeRun && (code === 143 || signal === 'SIGTERM' || signal === 'SIGINT') ? 0 : code;
  const normalizedSignal = isSmokeRun ? null : signal;
  finalize(normalizedCode, normalizedSignal);
});
