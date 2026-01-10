#!/usr/bin/env node

/**
 * TITANE∞ — COPILOT-XS scaffolding
 * Creator: Kevin Thibault
 * Generated/maintained with GitHub Copilot (GPT-5.2)
 * License: governed by repository LICENSE.md
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_ROOTS = ['src', 'src-tauri/src', 'tests'];
const DEFAULT_PROHIBITED = ['TODO', 'FIXME'];

const roots = (process.env.COPILOT_XS_ROOTS ?? DEFAULT_ROOTS.join(','))
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const prohibited = (process.env.COPILOT_XS_PROHIBITED ?? DEFAULT_PROHIBITED.join(','))
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const prohibitedAllowRegexRaw = process.env.COPILOT_XS_PROHIBITED_ALLOW_REGEX ?? '';
const prohibitedAllowRegex = prohibitedAllowRegexRaw
  ? new RegExp(prohibitedAllowRegexRaw)
  : null;

const prohibitedAllowPathRegexRaw =
  process.env.COPILOT_XS_PROHIBITED_ALLOW_PATH_REGEX ?? '';
const prohibitedAllowPathRegex = prohibitedAllowPathRegexRaw
  ? new RegExp(prohibitedAllowPathRegexRaw)
  : null;

// Validation scope:
// - staged (default): validate only git staged files (best for established repos)
// - all: walk roots and validate everything
const scope = (process.env.COPILOT_XS_SCOPE ?? 'staged').toLowerCase();

const secretScanEnabled = (process.env.COPILOT_XS_SECRET_SCAN ?? '1') !== '0';
const secretScanInTests = (process.env.COPILOT_XS_SECRET_SCAN_IN_TESTS ?? '0') === '1';
const allowProhibitedInTests =
  (process.env.COPILOT_XS_ALLOW_PROHIBITED_IN_TESTS ?? '0') === '1';

const secretMinChars = Number.parseInt(
  process.env.COPILOT_XS_SECRET_MIN_CHARS ?? '48',
  10
);
const secretAllowRegexRaw = process.env.COPILOT_XS_SECRET_ALLOW_REGEX ?? '';
const secretAllowRegex = secretAllowRegexRaw ? new RegExp(secretAllowRegexRaw) : null;

const EXCLUDED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  'target',
  '.git',
  '.vite',
  '.vite-cache',
  'runtime',
  'logs',
  '.disabled',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.rs',
  '.py',
  '.json',
]);

function isLikelySecretLine(line) {
  if (secretAllowRegex && secretAllowRegex.test(line)) return false;

  // PEM blocks (high confidence)
  if (/-----BEGIN (RSA|EC|OPENSSH|DSA|PRIVATE) PRIVATE KEY-----/.test(line)) return true;

  // Common token formats (still high confidence)
  if (/\bghp_[A-Za-z0-9]{30,}\b/.test(line)) return true;
  if (/\bsk-[A-Za-z0-9]{20,}\b/.test(line)) return true;
  if (/\bAIza[0-9A-Za-z\-_]{30,}\b/.test(line)) return true;

  // Heuristic assignments (lower confidence) — keep strict to reduce false positives
  const min = Number.isFinite(secretMinChars) && secretMinChars > 0 ? secretMinChars : 48;
  const assignment = new RegExp(
    String.raw`(api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-./+=]{${min},}['"]`,
    'i'
  );
  return assignment.test(line);
}

function isTestLikePath(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  return (
    normalized.includes('/__tests__/') ||
    normalized.includes('/tests/') ||
    /\.(test|spec)\.[^.]+$/.test(normalized)
  );
}

function listStagedFiles() {
  const result = spawnSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMRTUXB'],
    {
      encoding: 'utf8',
    }
  );

  if (result.status !== 0) {
    // Not a git repo or git unavailable; fallback to full scan.
    return null;
  }

  return result.stdout
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
}

function shouldValidatePath(relPath) {
  const normalized = relPath.split(path.sep).join(path.posix.sep);

  // Exclude common binary/build dirs if they appear in paths
  const parts = normalized.split('/');
  if (parts.some(p => EXCLUDED_DIR_NAMES.has(p))) return false;

  const ext = path.extname(normalized);
  if (!SOURCE_EXTENSIONS.has(ext)) return false;

  // Keep validation focused to configured roots
  if (roots.length === 0) return true;
  return roots.some(r => normalized === r || normalized.startsWith(`${r}/`));
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SOURCE_EXTENSIONS.has(ext)) {
        yield fullPath;
      }
    }
  }
}

async function validateFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const violations = [];

  const testLike = isTestLikePath(filePath);

  const normalizedPath = filePath.split(path.sep).join('/');
  const skipProhibitedScanForPath = prohibitedAllowPathRegex
    ? prohibitedAllowPathRegex.test(normalizedPath)
    : false;

  if (!(allowProhibitedInTests && testLike) && !skipProhibitedScanForPath) {
    const lines = content.split(/\r?\n/);
    for (const term of prohibited) {
      let found = false;
      for (const line of lines) {
        if (!line.includes(term)) continue;
        if (prohibitedAllowRegex && prohibitedAllowRegex.test(line)) continue;
        found = true;
        break;
      }
      if (found) {
        violations.push({ type: 'prohibited', term, filePath });
      }
    }
  }

  if (!secretScanEnabled) return violations;
  if (testLike && !secretScanInTests) return violations;

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isLikelySecretLine(line)) {
      violations.push({ type: 'secret', line: i + 1, filePath });
    }
  }

  return violations;
}

export async function runValidate() {
  const cwd = process.cwd();
  const violations = [];

  if (scope === 'staged') {
    const staged = listStagedFiles();
    if (staged === null) {
      // Not a git repo or git unavailable; fall back to full scan.
    } else if (staged.length === 0) {
      // Nothing staged means nothing to validate.
      return [];
    } else {
      for (const relPath of staged) {
        if (!shouldValidatePath(relPath)) continue;
        const absPath = path.resolve(cwd, relPath);
        const fileViolations = await validateFile(absPath);
        violations.push(...fileViolations);
      }
      return violations;
    }
  }

  for (const root of roots) {
    const absRoot = path.resolve(cwd, root);
    for await (const filePath of walk(absRoot)) {
      const fileViolations = await validateFile(filePath);
      violations.push(...fileViolations);
    }
  }

  return violations;
}

async function main() {
  const violations = await runValidate();

  if (violations.length === 0) {
    console.log('✅ COPILOT-XS VALIDATION PASSED');
    process.exit(0);
  }

  console.error('❌ COPILOT-XS VALIDATION FAILED');
  for (const v of violations) {
    if (v.type === 'prohibited') {
      console.error(`- ${v.filePath}: contains prohibited term "${v.term}"`);
    } else if (v.type === 'secret') {
      console.error(`- ${v.filePath}:${v.line}: potential secret detected`);
    } else {
      console.error(`- ${v.filePath}: ${JSON.stringify(v)}`);
    }
  }

  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Executed directly
  main().catch(err => {
    console.error('❌ COPILOT-XS VALIDATION CRASHED');
    console.error(err);
    process.exit(1);
  });
}
