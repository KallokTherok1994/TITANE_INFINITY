#!/usr/bin/env node
/**
 * TITANE∞ vΩ.STABLE0 — CSP Baseline Gate
 * Bloquant: refuse CSP trop permissive sans justification explicite
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSP_FILE = path.join(__dirname, '../../src-tauri/tauri.conf.json');
const ALLOW_UNSAFE = process.env.CSP_ALLOW_UNSAFE === '1';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  GATE_CSP_BASELINE — CSP minimum viable                 ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

if (!fs.existsSync(CSP_FILE)) {
  console.error(`❌ FAIL: CSP file not found: ${CSP_FILE}`);
  process.exit(1);
}

const raw = fs.readFileSync(CSP_FILE, 'utf-8');
const cspMatch = raw.match(/"csp"\s*:\s*"([^"]+)"/);

if (!cspMatch) {
  console.error('❌ FAIL: CSP not found in tauri.conf.json');
  process.exit(1);
}

const csp = cspMatch[1];

// Baseline: no wildcard connect-src
const directives = csp.split(';').map(d => d.trim());
const connectSrc = directives.find(d => d.startsWith('connect-src')) || '';
if (connectSrc.includes('*')) {
  console.error('❌ FAIL: CSP contains wildcard * in connect-src');
  process.exit(1);
}

// Baseline: unsafe-eval/unsafe-inline must be explicitly justified
const hasUnsafe = csp.includes("'unsafe-eval'") || csp.includes("'unsafe-inline'");
if (hasUnsafe && !ALLOW_UNSAFE) {
  console.error(
    '❌ FAIL: CSP contains unsafe-eval/unsafe-inline without CSP_ALLOW_UNSAFE=1'
  );
  process.exit(1);
}

console.log('✅ PASS: CSP baseline OK');
if (hasUnsafe) {
  console.log('⚠️  WARNING: CSP unsafe directives allowed via CSP_ALLOW_UNSAFE=1');
}
process.exit(0);
