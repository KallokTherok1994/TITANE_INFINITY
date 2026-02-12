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

const e2eMemoryDir = path.join(REPORT_DIR, 'memory');
const e2eLogDir = path.join(REPORT_DIR, 'logs', 'app');
fs.mkdirSync(e2eMemoryDir, { recursive: true });
fs.mkdirSync(e2eLogDir, { recursive: true });

// E2E wrapper path (for memory/log isolation)
const WRAPPER_PATH = path.resolve(__dirname, 'tauri-wrapper.sh');

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

// **PHASE 0.5: Start Vite dev server (CRITICAL for debug binary)**
// Note: tauri.conf.json specifies devUrl port1420, we match that
console.log('🔧 Phase 0.5: Starting Vite dev server (standalone on port 1420)...');

let viteProcess = null;
const VITE_PORT = 1420;

// Check if Vite already running on port 1420
try {
  execSync(`ss -ltn | grep :${VITE_PORT}`, { stdio: 'pipe' });
  console.log(`✅ Vite already running on port ${VITE_PORT}`);
} catch {
  console.log('⏳ Starting Vite standalone...');
  
  // Launch VITE ONLY (not tauri dev) on port 1420 to match tauri.conf.json
  viteProcess = spawn('pnpm', ['exec', 'vite', 'dev', '--port', String(VITE_PORT), '--host', '127.0.0.1'], {
    cwd: path.join(__dirname, '../..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });
  
  viteProcess.stdout.on('data', (data) => {
    const logPath = path.join(REPORT_DIR, 'logs', 'vite_standalone.log');
    fs.appendFileSync(logPath, data.toString());
  });
  
  viteProcess.stderr.on('data', (data) => {
    const logPath = path.join(REPORT_DIR, 'logs', 'vite_standalone_error.log');
    fs.appendFileSync(logPath, data.toString());
  });
  
  // Wait for Vite to be ready (check port listening)
  let viteReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      execSync(`ss -ltn | grep :${VITE_PORT}`, { stdio: 'pipe' });
      viteReady = true;
      console.log(`✅ Vite ready on port ${VITE_PORT} (after ${i + 1}s)`);
      break;
    } catch {
      // Not ready yet
      execSync('sleep 1', { stdio: 'inherit' });
    }
  }
  
  if (!viteReady) {
    console.error(`❌ Vite failed to start after 30s on port ${VITE_PORT}`);
    console.error('Check logs: logs/vite_standalone.log');
    if (viteProcess) viteProcess.kill();
    process.exit(1);
  }
}

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
      TAURI_BINARY_PATH: tauriBinary, // **CRITICAL:** Pass binary path to WebDriver config
      TITANE_E2E: '1',
      TITANE_MEMORY_DIR: e2eMemoryDir,
      TITANE_LOG_DIR: e2eLogDir,
    },
  });

  wdio.on('close', (code) => {
    console.log('');
    console.log(`🧪 Tests finished with code: ${code}`);
    console.log('');

    // Kill tauri-driver
    tauriDriver.kill();
    console.log('🛑 tauri-driver stopped');
    
    // Kill Vite if we started it
    if (viteProcess) {
      viteProcess.kill();
      console.log('🛑 Vite stopped');
    }
    
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

  const readJsonIfExists = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.warn(`⚠️ Failed to parse ${filePath}: ${err.message}`);
      return null;
    }
  };

  const resolveFirst = (paths) => {
    for (const filePath of paths) {
      const data = readJsonIfExists(filePath);
      if (data) return { data, filePath };
    }
    return { data: null, filePath: null };
  };

  // Gate 1: Chat page accessible
  const classificationFile = path.join(exportsDir, 'page_classification.json');
  const classification = readJsonIfExists(classificationFile);
  const finalClass = classification?.final?.pageClass || classification?.attempts?.slice(-1)?.[0]?.pageClass || null;

  const chatDomFile = path.join(exportsDir, 'chat_dom_map.json');
  const chatDom = readJsonIfExists(chatDomFile);
  const chatDetected = !!chatDom?.chatInput?.found;

  const chatAccessible = finalClass === 'CHAT' || chatDetected;
  gates.G1_CHAT_ACCESSIBLE = {
    status: chatAccessible ? 'PASS' : 'FAIL',
    evidence: finalClass ? `Class=${finalClass}` : (chatDetected ? 'Textarea detected' : 'No classification'),
    confidence: chatAccessible ? 100 : 0,
  };

  // Gate 2: Textarea detected
  gates.G2_TEXTAREA_DETECTED = {
    status: chatDetected ? 'PASS' : 'FAIL',
    evidence: chatDetected ? `Reason=${chatDom.chatInput.reason}` : 'Textarea not detected',
    confidence: chatDetected ? 100 : 0,
  };

  // Gate 3: AR20
  const ar20Resolved = resolveFirst([
    path.join(exportsDir, 'ar20_ui.json'),
    path.join(exportsDir, 'ar20_ui_results.json'),
  ]);
  if (ar20Resolved.data) {
    const ar20 = ar20Resolved.data;
    gates.G3_AR20 = {
      status: ar20.successful >= 18 ? 'PASS' : 'FAIL',
      evidence: `${ar20.successful}/${ar20.total} messages`,
      confidence: 100,
    };
  } else {
    gates.G3_AR20 = { status: 'FAIL', evidence: 'No AR20 data', confidence: 0 };
  }

  // Gate 4: Offline5
  const offlineResolved = resolveFirst([
    path.join(exportsDir, 'offline5_ui.json'),
    path.join(exportsDir, 'offline5_results.json'),
  ]);
  if (offlineResolved.data) {
    const offline5 = offlineResolved.data;
    gates.G4_OFFLINE5 = {
      status: offline5.successful >= 4 ? 'PASS' : 'FAIL',
      evidence: `${offline5.successful}/5 offline responses`,
      confidence: 100,
    };
  } else {
    gates.G4_OFFLINE5 = { status: 'FAIL', evidence: 'No offline data', confidence: 0 };
  }

  // Edge cases (used for G5 Always Respond)
  const edgeCasesFile = path.join(exportsDir, 'edge_cases_results.json');
  if (fs.existsSync(edgeCasesFile)) {
    const edgeCases = JSON.parse(fs.readFileSync(edgeCasesFile, 'utf8'));
    const allSuccess = edgeCases.every(c => c.success && !c.isEmpty);
    gates.G5_ALWAYS_RESPOND = {
      status: allSuccess && gates.G3_AR20.status === 'PASS' ? 'PASS' : 'FAIL',
      evidence: `${edgeCases.length} edge cases tested`,
      confidence: 100,
    };
  } else {
    gates.G5_ALWAYS_RESPOND = { status: 'FAIL', evidence: 'No edge case data', confidence: 0 };
  }

  // Gate 7: Navigation
  const navResolved = resolveFirst([
    path.join(exportsDir, 'navigation_matrix.json'),
    path.join(exportsDir, 'navigation_360_results.json'),
  ]);
  if (navResolved.data) {
    const nav = navResolved.data;
    const successRate = (nav.successful / nav.total) * 100;
    gates.G7_NAVIGATION = {
      status: successRate >= 80 ? 'PASS' : 'FAIL',
      evidence: `${nav.successful}/${nav.total} pages (${successRate.toFixed(1)}%)`,
      confidence: 100,
    };
  } else {
    gates.G7_NAVIGATION = { status: 'FAIL', evidence: 'No navigation data', confidence: 0 };
  }

  // Gate 8: Stability
  const stabilityResolved = resolveFirst([
    path.join(exportsDir, 'stability_burst.json'),
    path.join(exportsDir, 'stability_burst_results.json'),
  ]);
  if (stabilityResolved.data) {
    const stability = stabilityResolved.data;
    const successRate = (stability.successful / stability.total) * 100;
    gates.G8_STABILITY = {
      status: successRate >= 90 ? 'PASS' : 'FAIL',
      evidence: `${stability.successful}/${stability.total} messages (${successRate.toFixed(1)}%)`,
      confidence: 100,
    };
  } else {
    gates.G8_STABILITY = { status: 'FAIL', evidence: 'No stability data', confidence: 0 };
  }

  // Gate 6: No console fatal errors
  const consoleLogFile = path.join(REPORT_DIR, 'logs', 'console_errors_final.log');
  const consoleErrors = readJsonIfExists(consoleLogFile);
  const consoleErrorCount = Array.isArray(consoleErrors) ? consoleErrors.length : null;
  const noFatalErrors = consoleErrorCount === 0;
  gates.G6_NO_FATAL_ERRORS = {
    status: noFatalErrors ? 'PASS' : 'FAIL',
    evidence: consoleErrorCount !== null ? `${consoleErrorCount} console errors` : 'Missing console log',
    confidence: consoleErrorCount !== null ? 100 : 0,
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
    finalVerdict: passCount === totalCount ? 'PASS' : 'FAIL',
    recommendation: passCount === totalCount
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

- \`exports/page_classification.json\` — Page classification fingerprint
- \`exports/chat_dom_map.json\` — Chat DOM alignment map
- \`exports/ar20_ui.json\` — 20 consecutive messages test
- \`exports/offline5_ui.json\` — Offline mode resilience
- \`exports/edge_cases_results.json\` — Invalid providers handling
- \`exports/navigation_matrix.json\` — Full UI navigation
- \`exports/stability_burst.json\` — Stress test (50 messages)
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
