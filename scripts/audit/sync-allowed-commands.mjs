#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v34.0.13 — SYNC ALLOWED_COMMANDS (Rust ↔ TypeScript)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Parses the Rust-side IPC handler registration:
 *   src-tauri/src/main.rs → tauri::generate_handler![ … ]
 * and (best-effort) the Remote Gateway allow-list:
 *   src-tauri/src/remote_gateway/handlers.rs → ALLOWED_COMMANDS / match arms
 *
 * Then cross-references those with the frontend whitelist:
 *   src/lib/security.ts → export const ALLOWED_COMMANDS = new Set<string>([ … ])
 *
 * Emits:
 *   reports/ipc-allowed-commands.json  — diff facts
 *   reports/ipc-allowed-commands.md    — operator summary
 *
 * Exit codes:
 *   0  → in sync (or non-strict mode)
 *   1  → drift detected and --strict given
 *
 * Usage:
 *   node scripts/audit/sync-allowed-commands.mjs           # report only
 *   node scripts/audit/sync-allowed-commands.mjs --strict  # exit 1 on drift
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const MAIN_RS = resolve(ROOT, 'src-tauri', 'src', 'main.rs');
const GATEWAY_RS = resolve(ROOT, 'src-tauri', 'src', 'remote_gateway', 'handlers.rs');
const SECURITY_TS = resolve(ROOT, 'src', 'lib', 'security.ts');
const REPORTS_DIR = resolve(ROOT, 'reports');

const STRICT = process.argv.includes('--strict');

function parseGenerateHandler(src) {
  const re = /tauri::generate_handler!\s*\[([\s\S]*?)\]/;
  const m = re.exec(src);
  if (!m) return [];
  const body = m[1];
  // Each entry is `crate::path::to::fn` or `fn_name` separated by commas.
  // We keep the last path segment as the IPC command name.
  return body
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !s.startsWith('//'))
    .map(s => {
      // strip line comments
      const noComment = s.replace(/\/\/.*$/g, '').trim();
      if (!noComment) return null;
      const parts = noComment.split('::');
      return parts[parts.length - 1].replace(/[^A-Za-z0-9_]/g, '');
    })
    .filter(Boolean);
}

function parseFrontendAllowed(src) {
  const re =
    /export\s+const\s+ALLOWED_COMMANDS\s*=\s*new\s+Set<string>\(\s*\[([\s\S]*?)\]\s*\)/;
  const m = re.exec(src);
  if (!m) return [];
  const body = m[1];
  const out = [];
  const strRe = /['"`]([A-Za-z0-9_]+)['"`]/g;
  let s;
  while ((s = strRe.exec(body))) {
    out.push(s[1]);
  }
  return out;
}

function parseGatewayAllowed(src) {
  // Best-effort: capture string literals inside ALLOWED_COMMANDS = […] or
  // match command names against patterns like `"foo" => …` in match arms.
  const out = new Set();
  const setRe = /ALLOWED_COMMANDS[\s\S]{0,40}=\s*[\[&]?\s*\[([\s\S]*?)\]/;
  const m = setRe.exec(src);
  if (m) {
    const body = m[1];
    const re = /"([A-Za-z0-9_]+)"/g;
    let s;
    while ((s = re.exec(body))) out.add(s[1]);
  }
  // Also scan match arms `"foo" =>`
  const armRe = /"([A-Za-z0-9_]+)"\s*=>/g;
  let s;
  while ((s = armRe.exec(src))) out.add(s[1]);
  return [...out];
}

function diff(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  return {
    onlyInA: [...setA].filter(x => !setB.has(x)).sort(),
    onlyInB: [...setB].filter(x => !setA.has(x)).sort(),
    common: [...setA].filter(x => setB.has(x)).sort(),
  };
}

function main() {
  if (!existsSync(MAIN_RS) || !existsSync(SECURITY_TS)) {
    console.error('[sync-allowed-commands] required sources missing');
    process.exit(2);
  }

  const rustCommands = parseGenerateHandler(readFileSync(MAIN_RS, 'utf-8'));
  const gatewayCommands = existsSync(GATEWAY_RS)
    ? parseGatewayAllowed(readFileSync(GATEWAY_RS, 'utf-8'))
    : [];
  const tsCommands = parseFrontendAllowed(readFileSync(SECURITY_TS, 'utf-8'));

  const dRustVsTs = diff(rustCommands, tsCommands);
  const dGatewayVsTs = diff(gatewayCommands, tsCommands);

  const report = {
    generated_at: new Date().toISOString(),
    counts: {
      rust_handlers: rustCommands.length,
      gateway_allowed: gatewayCommands.length,
      frontend_allowed: tsCommands.length,
    },
    rust_vs_frontend: {
      only_in_rust: dRustVsTs.onlyInA,
      only_in_frontend: dRustVsTs.onlyInB,
      common: dRustVsTs.common.length,
    },
    gateway_vs_frontend: {
      only_in_gateway: dGatewayVsTs.onlyInA,
      only_in_frontend: dGatewayVsTs.onlyInB,
      common: dGatewayVsTs.common.length,
    },
  };

  const drift =
    dRustVsTs.onlyInA.length > 0 ||
    dRustVsTs.onlyInB.length > 0 ||
    dGatewayVsTs.onlyInA.length > 0;

  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(
    resolve(REPORTS_DIR, 'ipc-allowed-commands.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf-8'
  );

  const lines = [
    '# IPC ALLOWED_COMMANDS audit — TITANE∞ v34.0.13',
    '',
    `Generated: ${report.generated_at}`,
    '',
    '## Counts',
    '',
    `- Rust handlers (\`main.rs::generate_handler!\`): **${rustCommands.length}**`,
    `- Remote Gateway allow-list: **${gatewayCommands.length}**`,
    `- Frontend \`ALLOWED_COMMANDS\`: **${tsCommands.length}**`,
    '',
    '## Rust → Frontend drift',
    '',
    '### Only in Rust (frontend cannot call → invisible capability)',
    '',
    ...dRustVsTs.onlyInA.map(c => `- \`${c}\``),
    '',
    '### Only in Frontend (whitelisted but no handler → silent IPC failure)',
    '',
    ...dRustVsTs.onlyInB.map(c => `- \`${c}\``),
    '',
    '## Gateway → Frontend drift',
    '',
    '### Only in Gateway (remote capability not exposed to local UI whitelist)',
    '',
    ...dGatewayVsTs.onlyInA.map(c => `- \`${c}\``),
    '',
    drift ? '## VERDICT: DRIFT' : '## VERDICT: IN SYNC',
    '',
  ];
  writeFileSync(
    resolve(REPORTS_DIR, 'ipc-allowed-commands.md'),
    lines.join('\n'),
    'utf-8'
  );

  console.log(
    '[sync-allowed-commands] rust=%d gateway=%d frontend=%d drift=%s',
    rustCommands.length,
    gatewayCommands.length,
    tsCommands.length,
    drift ? 'YES' : 'no'
  );
  console.log('[sync-allowed-commands] reports → %s', relative(ROOT, REPORTS_DIR));

  if (STRICT && drift) {
    console.error('[sync-allowed-commands] --strict: drift detected, failing.');
    process.exit(1);
  }
}

main();
