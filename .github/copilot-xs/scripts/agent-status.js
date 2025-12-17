#!/usr/bin/env node

/**
 * TITANE∞ — COPILOT-XS scaffolding
 * Creator: Kevin Thibault
 * Generated/maintained with GitHub Copilot (GPT-5.2)
 * License: governed by repository LICENSE.md
 */

import fs from 'node:fs/promises';

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const checks = [
    ['Layer 1: Instructions', await exists('.github/copilot-instructions.md')],
    ['Layer 2: Agent roster', await exists('.github/copilot-agents.md')],
    ['Layer 3: Routing', await exists('.github/copilot-routing.json')],
    ['Layer 3: Workflow', await exists('.github/copilot-workflow.mermaid')],
    ['Automation: validate.js', await exists('.github/copilot-xs/scripts/validate.js')],
    ['Automation: precommit.js', await exists('.github/copilot-xs/scripts/precommit.js')],
  ];

  console.log('🎯 COPILOT-XS STATUS REPORT');
  console.log('');
  for (const [label, ok] of checks) {
    console.log(`${ok ? '✅' : '❌'} ${label}`);
  }

  const allOk = checks.every(([, ok]) => ok);
  console.log('');
  console.log(allOk ? '🚀 System Status: OPERATIONAL' : '🛠️ System Status: INCOMPLETE');
  process.exit(allOk ? 0 : 1);
}

main().catch(err => {
  console.error('❌ STATUS CHECK FAILED');
  console.error(err);
  process.exit(1);
});
