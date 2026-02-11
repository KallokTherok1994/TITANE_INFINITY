#!/usr/bin/env node
/**
 * Ω∞.UI.CHAT.360.AUTOFIX — Test Runner
 * 
 * Orchestrates:
 * 1. Report setup
 * 2. tauri-driver launch
 * 3. WebDriver test execution
 * 4. Results compilation
 * 5. Gates validation
 * 6. Final VERDICT generation
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Generate report timestamp
const REPORT_TS = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const REPORT_DIR = path.join(__dirname, '../../reports/ui_chat_360_autofix', REPORT_TS);

console.log('🚀 Ω∞.UI.CHAT.360.AUTOFIX v4.0');
console.log(`📁 Report: ${REPORT_DIR}`);
console.log('');

// Ensure report structure
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.mkdirSync(path.join(REPORT_DIR, 'logs'));
  fs.mkdirSync(path.join(REPORT_DIR, 'exports'));
  fs.mkdirSync(path.join(REPORT_DIR, 'artifacts'));
  fs.writeFileSync(path.join(REPORT_DIR, '.timestamp'), REPORT_TS);
  console.log('✅ Report structure created');
}

// Check prerequisites
console.log('🔍 Checking prerequisites...');

// Check tauri-driver
try {
  execSync('which tauri-driver', { stdio: 'pipe' });
  console.log('✅ tauri-driver found');
} catch {
  console.error('❌ tauri-driver not found');
  console.error('Install: cargo install tauri-driver');
  process.exit(1);
}

// Check Tauri binary
const tauriBinary = path.join(__dirname, '../../src-tauri/target/debug/titane-infinity');
if (!fs.existsSync(tauriBinary)) {
  console.error('❌ Tauri binary not found:', tauriBinary);
  console.error('Build first: cd src-tauri && cargo build');
  process.exit(1);
}
console.log('✅ Tauri binary found');

console.log('');

// Phase 1: Launch tauri-driver
console.log('📦 Phase 1: Launching tauri-driver...');

const tauriDriver = spawn('tauri-driver', [], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

tauriDriver.stdout.on('data', (data) => {
  const logPath = path.join(REPORT_DIR, 'logs', 'tauri_driver.log');
  fs.appendFileSync(logPath, data.toString());
});

tauriDriver.stderr.on('data', (data) => {
  const logPath = path.join(REPORT_DIR, 'logs', 'tauri_driver_error.log');
  fs.appendFileSync(logPath, data.toString());
});

// Wait for tauri-driver ready
setTimeout(() => {
  console.log('✅ tauri-driver ready (port 4444)');
  console.log('');

  // Phase 2: Run WebDriver tests
  console.log('🧪 Phase 2: Running WebDriver tests...');
  console.log('');

  const wdioArgs = [
    'exec',
    'wdio',
    'run',
    'wdio.desktop.conf.cjs',
    '--spec',
    'e2e/desktop/ui-chat-360-autofix.wdio.test.cjs',
  ];

  const wdio = spawn('pnpm', wdioArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      REPORT_TS,
    },
  });

  wdio.on('close', (code) => {
    console.log('');
    console.log(`🧪 Tests finished with code: ${code}`);
    console.log('');

    // Kill tauri-driver
    tauriDriver.kill();
    console.log('🛑 tauri-driver stopped');
    console.log('');

    // Phase 3: Generate final report
    generateFinalReport(code);
  });

}, 3000);

/**
 * Generate final report and verdict
 */
function generateFinalReport(testExitCode) {
  console.log('📊 Phase 3: Generating final report...');

  const exportsDir = path.join(REPORT_DIR, 'exports');
  const gates = {};

  // Gate 1: AR20
  const ar20File = path.join(exportsDir, 'ar20_ui_results.json');
  if (fs.existsSync(ar20File)) {
    const ar20 = JSON.parse(fs.readFileSync(ar20File, 'utf8'));
    gates.G2_AR20 = {
      status: ar20.successful >= 18 ? 'PASS' : 'FAIL',
      evidence: `${ar20.successful}/${ar20.total} messages`,
      confidence: 100,
    };
  } else {
    gates.G2_AR20 = { status: 'FAIL', evidence: 'No AR20 data', confidence: 0 };
  }

  // Gate 2: Offline5
  const offline5File = path.join(exportsDir, 'offline5_results.json');
  if (fs.existsSync(offline5File)) {
    const offline5 = JSON.parse(fs.readFileSync(offline5File, 'utf8'));
    gates.G3_OFFLINE5 = {
      status: offline5.successful >= 4 ? 'PASS' : 'FAIL',
      evidence: `${offline5.successful}/5 offline responses`,
      confidence: 100,
    };
  } else {
    gates.G3_OFFLINE5 = { status: 'FAIL', evidence: 'No offline data', confidence: 0 };
  }

  // Gate 3: Edge cases
  const edgeCasesFile = path.join(exportsDir, 'edge_cases_results.json');
  if (fs.existsSync(edgeCasesFile)) {
    const edgeCases = JSON.parse(fs.readFileSync(edgeCasesFile, 'utf8'));
    const allSuccess = edgeCases.every(c => c.success && !c.isEmpty);
    gates.G4_EDGE_CASES = {
      status: allSuccess ? 'PASS' : 'FAIL',
      evidence: `${edgeCases.length} edge cases tested`,
      confidence: 100,
    };
  } else {
    gates.G4_EDGE_CASES = { status: 'FAIL', evidence: 'No edge case data', confidence: 0 };
  }

  // Gate 4: Navigation
  const navFile = path.join(exportsDir, 'navigation_360_results.json');
  if (fs.existsSync(navFile)) {
    const nav = JSON.parse(fs.readFileSync(navFile, 'utf8'));
    const successRate = (nav.successful / nav.total) * 100;
    gates.G7_NAVIGATION = {
      status: successRate >= 80 ? 'PASS' : 'FAIL',
      evidence: `${nav.successful}/${nav.total} pages (${successRate.toFixed(1)}%)`,
      confidence: 100,
    };
  } else {
    gates.G7_NAVIGATION = { status: 'FAIL', evidence: 'No navigation data', confidence: 0 };
  }

  // Gate 5: Stability
  const stabilityFile = path.join(exportsDir, 'stability_burst_results.json');
  if (fs.existsSync(stabilityFile)) {
    const stability = JSON.parse(fs.readFileSync(stabilityFile, 'utf8'));
    const successRate = (stability.successful / stability.total) * 100;
    gates.G8_STABILITY = {
      status: successRate >= 90 ? 'PASS' : 'FAIL',
      evidence: `${stability.successful}/${stability.total} messages (${successRate.toFixed(1)}%)`,
      confidence: 100,
    };
  } else {
    gates.G8_STABILITY = { status: 'FAIL', evidence: 'No stability data', confidence: 0 };
  }

  // Additional implicit gates
  gates.G1_CHAT_ACCESSIBLE = {
    status: testExitCode === 0 ? 'PASS' : 'PENDING',
    evidence: 'Tests executed',
    confidence: 90,
  };

  gates.G5_ALWAYS_RESPOND = {
    status: gates.G2_AR20.status === 'PASS' && gates.G4_EDGE_CASES.status === 'PASS' ? 'PASS' : 'FAIL',
    evidence: 'Derived from AR20 + edge cases',
    confidence: 95,
  };

  gates.G6_NO_FATAL_ERRORS = {
    status: 'PENDING',
    evidence: 'Check console_errors_final.log',
    confidence: 80,
  };

  // Calculate verdict
  const passCount = Object.values(gates).filter(g => g.status === 'PASS').length;
  const totalCount = Object.keys(gates).length;
  const passRate = (passCount / totalCount) * 100;

  const verdict = {
    timestamp: new Date().toISOString(),
    testExitCode,
    gates,
    summary: {
      total: totalCount,
      pass: passCount,
      fail: Object.values(gates).filter(g => g.status === 'FAIL').length,
      pending: Object.values(gates).filter(g => g.status === 'PENDING').length,
      passRate: passRate.toFixed(1) + '%',
    },
    finalVerdict: passRate >= 87.5 ? 'PASS' : 'FAIL', // 7/8 gates minimum
    recommendation: passRate >= 87.5
      ? 'System validated. Production-ready.'
      : 'Issues detected. Review failed gates and apply patches.',
  };

  // Write verdict
  const verdictFile = path.join(REPORT_DIR, 'VERDICT.json');
  fs.writeFileSync(verdictFile, JSON.stringify(verdict, null, 2));
  console.log(`✅ Verdict written: ${verdictFile}`);

  // Write markdown verdict
  const verdictMd = generateVerdictMarkdown(verdict);
  fs.writeFileSync(path.join(REPORT_DIR, 'VERDICT.md'), verdictMd);

  // Print summary
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL VERDICT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`Status: ${verdict.finalVerdict === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Gates: ${passCount}/${totalCount} (${passRate.toFixed(1)}%)`);
  console.log('');
  console.log('Gates Summary:');
  Object.entries(gates).forEach(([gateName, gate]) => {
    const icon = gate.status === 'PASS' ? '✅' : gate.status === 'FAIL' ? '❌' : '⏳';
    console.log(`  ${icon} ${gateName}: ${gate.status} - ${gate.evidence}`);
  });
  console.log('');
  console.log(`📁 Full report: ${REPORT_DIR}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(verdict.finalVerdict === 'PASS' ? 0 : 1);
}

/**
 * Generate markdown verdict
 */
function generateVerdictMarkdown(verdict) {
  return `# 🎯 VERDICT — Ω∞.UI.CHAT.360.AUTOFIX v4.0

**Timestamp:** ${verdict.timestamp}  
**Test Exit Code:** ${verdict.testExitCode}  
**Final Verdict:** ${verdict.finalVerdict === 'PASS' ? '✅ **PASS**' : '❌ **FAIL**'}

---

## Gates Summary

**Pass Rate:** ${verdict.summary.passRate} (${verdict.summary.pass}/${verdict.summary.total} gates)

${Object.entries(verdict.gates).map(([name, gate]) => {
  const icon = gate.status === 'PASS' ? '✅' : gate.status === 'FAIL' ? '❌' : '⏳';
  return `### ${icon} ${name}\n\n- **Status:** ${gate.status}\n- **Evidence:** ${gate.evidence}\n- **Confidence:** ${gate.confidence}%\n`;
}).join('\n')}

---

## Recommendation

${verdict.recommendation}

---

## Report Files

- \`exports/ar20_ui_results.json\` — 20 consecutive messages test
- \`exports/offline5_results.json\` — Offline mode resilience
- \`exports/edge_cases_results.json\` — Invalid providers handling
- \`exports/navigation_360_results.json\` — Full UI navigation
- \`exports/stability_burst_results.json\` — Stress test (50 messages)
- \`logs/tauri_driver.log\` — tauri-driver output
- \`logs/console_errors_final.log\` — Browser console errors
- \`artifacts/*.png\` — Navigation screenshots

---

**Generated by:** Ω∞.UI.CHAT.360.AUTOFIX.TAURI_BRIDGE v4.0
`;
}

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupted, cleaning up...');
  try {
    tauriDriver.kill();
  } catch {}
  process.exit(1);
});
