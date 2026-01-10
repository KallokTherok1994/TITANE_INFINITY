#!/usr/bin/env node

/**
 * TITANE∞ — COPILOT-XS scaffolding
 * Creator: Kevin Thibault
 * Generated/maintained with GitHub Copilot (GPT-5.2)
 * License: governed by repository LICENSE.md
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Avoid noisy Node deprecation warnings from tooling (e.g. corepack/pnpm internals)
      NODE_OPTIONS: process.env.NODE_OPTIONS
        ? `${process.env.NODE_OPTIONS} --no-deprecation`
        : '--no-deprecation',
    },
  });

  // Command not found
  if (result.error && result.error.code === 'ENOENT') {
    return { ok: false, reason: 'not-found' };
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return { ok: true };
}

function runCapture(cmd, args) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS
        ? `${process.env.NODE_OPTIONS} --no-deprecation`
        : '--no-deprecation',
    },
  });

  if (result.error && result.error.code === 'ENOENT') {
    return { ok: false, reason: 'not-found', stdout: '', stderr: '' };
  }

  return {
    ok: (result.status ?? 1) === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function runInDir(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd,
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS
        ? `${process.env.NODE_OPTIONS} --no-deprecation`
        : '--no-deprecation',
    },
  });

  if (result.error && result.error.code === 'ENOENT') {
    return { ok: false, reason: 'not-found' };
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return { ok: true };
}

function runCaptureInDir(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    cwd,
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS
        ? `${process.env.NODE_OPTIONS} --no-deprecation`
        : '--no-deprecation',
    },
  });

  if (result.error && result.error.code === 'ENOENT') {
    return { ok: false, reason: 'not-found', stdout: '', stderr: '' };
  }

  return {
    ok: (result.status ?? 1) === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function runOrFallback(primaryCmd, primaryArgs, fallbackCmd, fallbackArgs) {
  const primary = run(primaryCmd, primaryArgs);
  if (primary.ok) {
    return primary;
  }

  if (primary.reason !== 'not-found') {
    return primary;
  }

  return run(fallbackCmd, fallbackArgs);
}

const hasPnpmLock = existsSync('pnpm-lock.yaml');
const hasTauriCargoLock = existsSync('src-tauri/Cargo.lock');
const reportDir = (process.env.COPILOT_XS_SECURITY_REPORT_DIR ?? '').trim();

function ensureReportDir() {
  if (!reportDir) return;
  mkdirSync(reportDir, { recursive: true });
}

function writeReport(name, content) {
  if (!reportDir) return;
  ensureReportDir();
  writeFileSync(`${reportDir}/${name}`, content, 'utf8');
}

const CARGO_AUDIT_IGNORES_FILE = '.github/copilot-xs/cargo-audit-ignores.txt';

function readCargoAuditIgnores() {
  if (!existsSync(CARGO_AUDIT_IGNORES_FILE)) return [];
  const raw = readFileSync(CARGO_AUDIT_IGNORES_FILE, 'utf8');
  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}

if (hasPnpmLock) {
  // Prefer corepack when available; fallback to pnpm.
  const pnpmResult = runOrFallback('corepack', ['pnpm', 'audit'], 'pnpm', ['audit']);

  // Optional report output for CI/log archiving.
  // Note: pnpm audit JSON output is printed to stdout; we capture it only when reportDir is set.
  if (reportDir) {
    const primary = runCapture('corepack', ['pnpm', 'audit', '--json']);
    if (primary.reason === 'not-found') {
      const fallback = runCapture('pnpm', ['audit', '--json']);
      if (fallback.reason !== 'not-found') {
        writeReport('pnpm-audit.json', fallback.stdout);
      }
    } else {
      writeReport('pnpm-audit.json', primary.stdout);
    }
  }

  if (!pnpmResult.ok) {
    console.warn(
      '[COPILOT-XS] ⚠️ Security scan skipped: pnpm-lock.yaml detected but neither pnpm nor corepack is available.'
    );
  }
  // Continue: we also scan Rust advisories if this workspace contains src-tauri.
}

if (!hasPnpmLock) {
  console.warn('[COPILOT-XS] ⚠️ Security scan skipped: pnpm-lock.yaml not found.');
}

if (hasTauriCargoLock) {
  // Run cargo-audit from src-tauri if available.
  // Mode: strict (deny warnings), but with a baseline ignore list so we fail only on new advisories.
  const ignoreIds = readCargoAuditIgnores();
  const ignoreArgs = ignoreIds.flatMap(id => ['--ignore', id]);
  const cargoAudit = runInDir(
    'cargo',
    ['audit', '--deny', 'warnings', ...ignoreArgs, '--file', 'Cargo.lock'],
    'src-tauri'
  );

  if (!cargoAudit.ok) {
    console.warn(
      '[COPILOT-XS] ⚠️ Security scan skipped: src-tauri/Cargo.lock detected but cargo-audit is not available.'
    );
  }

  // Optional SARIF report for tooling ingestion.
  // We generate it in non-strict mode (still applying baseline ignores) to always emit a report file.
  if (reportDir) {
    const sarif = runCaptureInDir(
      'cargo',
      ['audit', '--format', 'sarif', ...ignoreArgs, '--file', 'Cargo.lock'],
      'src-tauri'
    );
    if (sarif.reason !== 'not-found') {
      // cargo-audit writes SARIF to stdout; stderr may contain DB fetch noise.
      writeReport('cargo-audit.sarif', sarif.stdout);
    }
  }
}

process.exit(0);
