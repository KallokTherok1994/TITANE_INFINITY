#!/usr/bin/env node
/**
 * TITANE∞ — Allowlist Alignment Report Generator
 * Compare actually-used commands vs Tauri allowlist
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load tauriCommands.ts to get command string mappings
const tauriCommandsPath = resolve('src/lib/tauriCommands.ts');
const tauriCommandsContent = readFileSync(tauriCommandsPath, 'utf-8');

// Load tauriClient.ts to get wrapper → command mappings
const tauriClientPath = resolve('src/lib/tauriClient.ts');
const tauriClientContent = readFileSync(tauriClientPath, 'utf-8');

// Load allowlist
const allowlistPath = resolve('src-tauri/allowlist.whitelist.stable.json');
const allowlist = JSON.parse(readFileSync(allowlistPath, 'utf-8'));

// Load used wrappers
const usedWrappersPath = '/tmp/used_wrappers.txt';
const usedWrappers = readFileSync(usedWrappersPath, 'utf-8')
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`✅ Loaded ${usedWrappers.length} used wrappers`);

// Build TAURI_COMMANDS constant → value map
const commandMap = new Map();
const commandRegex = /([A-Z_]+):\s*'([a-z_]+)'/g;
let match;
while ((match = commandRegex.exec(tauriCommandsContent)) !== null) {
  commandMap.set(match[1], match[2]);
}

console.log(`✅ Extracted ${commandMap.size} command constants`);

// Build wrapper → command map (by parsing tauriClient methods)
const wrapperToCommand = new Map();
const methodRegex =
  /async\s+([a-zA-Z_][a-zA-Z0-9_]*)\([^)]*\)[^{]*{\s*return\s+await\s+this\.invoke\(\s*TAURI_COMMANDS\.([A-Z_]+)/g;
while ((match = methodRegex.exec(tauriClientContent)) !== null) {
  const wrapperName = match[1];
  const constantName = match[2];
  const commandString = commandMap.get(constantName);
  if (commandString) {
    wrapperToCommand.set(wrapperName, commandString);
  }
}

console.log(`✅ Mapped ${wrapperToCommand.size} wrappers to commands\n`);

// Get used commands
const usedCommands = new Set();
const unmappedWrappers = [];
usedWrappers.forEach(wrapper => {
  const cmd = wrapperToCommand.get(wrapper);
  if (cmd) {
    usedCommands.add(cmd);
  } else {
    unmappedWrappers.push(wrapper);
  }
});

console.log(`✅ ${usedCommands.size} unique commands actually used`);
if (unmappedWrappers.length > 0) {
  console.log(
    `⚠️  ${unmappedWrappers.length} wrappers not mapped (likely edge cases):\n`
  );
  unmappedWrappers.slice(0, 10).forEach(w => console.log(`   - ${w}`));
  if (unmappedWrappers.length > 10) {
    console.log(`   ... and ${unmappedWrappers.length - 10} more`);
  }
}

// Get allowlisted commands
const allowlistedCommands = new Set(allowlist.allowed_commands || []);
console.log(`\n✅ ${allowlistedCommands.size} commands in allowlist\n`);

// Compare
const missing = [...usedCommands].filter(cmd => !allowlistedCommands.has(cmd));
const unused = [...allowlistedCommands].filter(cmd => !usedCommands.has(cmd));

console.log('═══════════════════════════════════════════════════════════════');
console.log('ALLOWLIST COMPARISON REPORT');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`✅ Used & Allowed: ${usedCommands.size - missing.length}`);
console.log(`❌ Used but Missing: ${missing.length}`);
console.log(`⚠️  Allowed but Unused: ${unused.length}\n`);

if (missing.length > 0) {
  console.log('──────────────────────────────────────────────────────────────');
  console.log('❌ COMMANDS USED BUT NOT IN ALLOWLIST (MUST ADD):');
  console.log('──────────────────────────────────────────────────────────────');
  missing.forEach(cmd => console.log(`  - ${cmd}`));
  console.log('');
}

if (unused.length > 0 && unused.length < 50) {
  console.log('──────────────────────────────────────────────────────────────');
  console.log('⚠️  COMMANDS IN ALLOWLIST BUT NOT USED (Consider removing):');
  console.log('──────────────────────────────────────────────────────────────');
  unused.forEach(cmd => console.log(`  - ${cmd}`));
  console.log('');
} else if (unused.length >= 50) {
  console.log('──────────────────────────────────────────────────────────────');
  console.log(`⚠️  ${unused.length} commands in allowlist but unused (see full report)`);
  console.log('──────────────────────────────────────────────────────────────\n');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(`P1.ALLOWLIST.MATCH: ${missing.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Write detailed report
const reportLines = [
  '# Phase D: Allowlist Alignment Report',
  '',
  `**Date**: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
  `**Used Commands**: ${usedCommands.size}`,
  `**Allowlisted Commands**: ${allowlistedCommands.size}`,
  '',
  '---',
  '',
  '## Summary',
  '',
  `- ✅ **Used & Allowed**: ${usedCommands.size - missing.length}`,
  `- ❌ **Used but Missing**: ${missing.length}`,
  `- ⚠️  **Allowed but Unused**: ${unused.length}`,
  '',
  '---',
  '',
  '## Missing Commands (Must Add to Allowlist)',
  '',
];

if (missing.length > 0) {
  reportLines.push('```json');
  reportLines.push(JSON.stringify(missing, null, 2));
  reportLines.push('```');
} else {
  reportLines.push('✅ None - all used commands are allowlisted');
}

reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## Unused Commands (Consider Removing)');
reportLines.push('');

if (unused.length > 0) {
  reportLines.push('```json');
  reportLines.push(JSON.stringify(unused.slice(0, 100), null, 2));
  if (unused.length > 100) {
    reportLines.push(`... and ${unused.length - 100} more`);
  }
  reportLines.push('```');
} else {
  reportLines.push('✅ None - allowlist perfectly aligned');
}

reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push(
  `## Gate: P1.ALLOWLIST.MATCH — ${missing.length === 0 ? '✅ PASSED' : '❌ FAILED'}`
);
reportLines.push('');

import { writeFileSync } from 'fs';
const reportPath =
  'reports/auto_ipc_features/2026-02-10T20-36-36Z/04_ALLOWLIST_ALIGNMENT.md';
writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');
console.log(`📝 Report written to ${reportPath}\n`);
