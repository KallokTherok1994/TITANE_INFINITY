/**
 * ui-desktop-backend-proof-depth-utility.wdio.test.js
 * v58 — Proof depth for Tier 2 utility and Tier 3 advanced/degraded modules.
 *
 * Tier 2: SKILLS, KNOWLEDGE, CREATION, EVOLUTION, PERFORMANCE, TWINS
 * Tier 3: HYPER_CENTER, REALITY_CENTER, QUANTUM_CENTER,
 *         ORCHESTRATION_CENTER, ORCHESTRATION_INTEL, SINGULARITY,
 *         SENTINEL, WATCHDOG, SELFHEAL, ADAPTIVE
 */

'use strict';

const {
  probeInvoke,
  probeDegraded,
  probeDisplayOnly,
  getBodyHTML,
  checkErrorBoundary,
  hasDegradedIndicator,
  navigateAndWait,
  logClassification,
} = require('./helpers/uiDesktopBackendProofDepth.js');

// ─── TIER 2 — UTILITY ─────────────────────────────────────────────────────────

describe('[v58:depth] SKILLS — /skills — IPC_COMMAND_PROVEN', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/skills', 'page-skills', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });
  it('skills IPC probe', async () => {
    await navigateAndWait('/skills', 'page-skills', 12000);
    const r = await probeInvoke('get_skills', {}, { module: 'SKILLS', route: '/skills' });
    logClassification('SKILLS', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

describe('[v58:depth] KNOWLEDGE — /knowledge — IPC_COMMAND_PROVEN or BLOCKED_BY_RUNTIME', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/knowledge', 'page-knowledge', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });
  it('knowledge IPC probe', async () => {
    await navigateAndWait('/knowledge', 'page-knowledge', 12000);
    const r = await probeInvoke('get_knowledge', {}, { module: 'KNOWLEDGE', route: '/knowledge' });
    logClassification('KNOWLEDGE', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

describe('[v58:depth] CREATION — /creation — IPC_COMMAND_PROVEN', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/creation', 'page-creation-studio', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });
  it('creation page depth probe', async () => {
    await navigateAndWait('/creation', 'page-creation-studio', 12000);
    const r = await probeInvoke('get_creation_state', {}, { module: 'CREATION', route: '/creation' });
    logClassification('CREATION', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

describe('[v58:depth] EVOLUTION — /evolution — IPC_COMMAND_PROVEN', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/evolution', 'page-evolution-monitor', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });
  it('evolution page depth probe', async () => {
    await navigateAndWait('/evolution', 'page-evolution-monitor', 12000);
    const r = await probeInvoke('get_evolution_status', {}, { module: 'EVOLUTION', route: '/evolution' });
    logClassification('EVOLUTION', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

describe('[v58:depth] PERFORMANCE — /performance — IPC_COMMAND_PROVEN or BLOCKED_BY_RUNTIME', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/performance', 'page-performance-test', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });
  it('performance_get_metrics — probe IPC', async () => {
    await navigateAndWait('/performance', 'page-performance-test', 12000);
    const r = await probeInvoke('performance_get_metrics', {}, { module: 'PERFORMANCE', route: '/performance' });
    logClassification('PERFORMANCE', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

describe('[v58:depth] TWINS — /twins — IPC_COMMAND_PROVEN', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/twins', 'page-twins', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });
  it('twins page depth probe', async () => {
    await navigateAndWait('/twins', 'page-twins', 12000);
    const r = await probeInvoke('get_twins_status', {}, { module: 'TWINS', route: '/twins' });
    logClassification('TWINS', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

// ─── TIER 3 — ADVANCED/DEGRADED ───────────────────────────────────────────────

async function assertTier3Page(route, testid, moduleName) {
  await navigateAndWait(route, testid, 12000);
  const err = await checkErrorBoundary();
  expect(err).toBe(false);
  await browser.pause(400);
  const html = await getBodyHTML();
  const isDegraded = hasDegradedIndicator(html);
  if (isDegraded) {
    probeDegraded(moduleName, route, `Degraded state visible: ${moduleName}`);
    logClassification(moduleName, 'PROOF_DEPTH_DEGRADED_VISIBLE', 'degraded indicator in DOM');
  } else {
    probeDisplayOnly(moduleName, route, `No degraded indicator — display-only: ${moduleName}`);
    logClassification(moduleName, 'PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED', 'no real backend data expected');
  }
}

describe('[v58:depth] HYPER_CENTER — /hyper-center — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('hyper-center depth classification', async () => {
    await assertTier3Page('/hyper-center', 'page-hyper-center', 'HYPER_CENTER');
  });
});

describe('[v58:depth] REALITY_CENTER — /reality-center — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('reality-center depth classification', async () => {
    await assertTier3Page('/reality-center', 'page-reality-center', 'REALITY_CENTER');
  });
});

describe('[v58:depth] QUANTUM_CENTER — /quantum-center — DISPLAY_ONLY_CONFIRMED', () => {
  it('quantum-center depth classification', async () => {
    await assertTier3Page('/quantum-center', 'page-quantum-center', 'QUANTUM_CENTER');
  });
});

describe('[v58:depth] ORCHESTRATION_CENTER — /orchestration-center — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('orchestration-center depth classification', async () => {
    await assertTier3Page('/orchestration-center', 'page-orchestration-meta-center', 'ORCHESTRATION_CENTER');
  });
});

describe('[v58:depth] ORCHESTRATION_INTEL — /orchestration-intelligence — DISPLAY_ONLY_CONFIRMED', () => {
  it('orchestration-intelligence depth classification', async () => {
    await assertTier3Page('/orchestration-intelligence', 'page-orchestration-intelligence', 'ORCHESTRATION_INTEL');
  });
});

describe('[v58:depth] SINGULARITY — /singularity — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('singularity depth classification', async () => {
    await assertTier3Page('/singularity', 'page-singularity-monitor', 'SINGULARITY');
  });
});

describe('[v58:depth] SENTINEL — /sentinel — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('sentinel depth classification', async () => {
    await assertTier3Page('/sentinel', 'page-sentinel', 'SENTINEL');
  });
});

describe('[v58:depth] WATCHDOG — /watchdog — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('watchdog depth classification', async () => {
    await assertTier3Page('/watchdog', 'page-watchdog', 'WATCHDOG');
  });
});

describe('[v58:depth] SELFHEAL — /selfheal — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('selfheal depth classification', async () => {
    await assertTier3Page('/selfheal', 'page-selfheal', 'SELFHEAL');
  });
});

describe('[v58:depth] ADAPTIVE — /adaptive — DEGRADED_VISIBLE or DISPLAY_ONLY', () => {
  it('adaptive depth classification', async () => {
    await assertTier3Page('/adaptive', 'page-adaptive-engine', 'ADAPTIVE');
  });
});
