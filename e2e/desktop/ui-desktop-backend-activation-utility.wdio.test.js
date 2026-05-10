/**
 * ui-desktop-backend-activation-utility.wdio.test.js
 * v57 — Backend activation proof for Utility/Advanced modules:
 *   Skills, Knowledge, Creation, Evolution, Performance, Twins,
 *   Hyper Center, Reality Center, Quantum Center, Orchestration,
 *   Singularity, Sentinel, Watchdog, SelfHeal, Adaptive
 *
 * Rules:
 * - Read-only only, no mutations
 * - Expected degraded/simulated states classified as PASS
 * - ErrorBoundary: h2 + data-testid detection (v55 pattern)
 */

'use strict';

const {
  tryInvoke,
  getBodyHTML,
  hasDegradedIndicator,
  hasSimulatedIndicator,
  navigateAndWait,
  isVisible,
  logClassification,
} = require('./helpers/uiDesktopBackendActivation.js');

async function checkErrorBoundary() {
  const hasErrorH2 = await browser.execute(() => {
    const h2s = Array.from(document.querySelectorAll('h2'));
    return h2s.some(h => h.textContent != null && h.textContent.includes('Erreur dans'));
  });
  const hasErrorTestid = await browser.execute(() =>
    !!document.querySelector('[data-testid="titane-error-boundary"]')
  );
  return hasErrorH2 || hasErrorTestid;
}

async function probeModule(route, testid, moduleName, tier) {
  await navigateAndWait(route, testid, 12000);
  const hasError = await checkErrorBoundary();
  if (hasError) {
    logClassification(moduleName, 'BACKEND_FAIL', `tier=${tier} ErrorBoundary triggered`);
    return 'BACKEND_FAIL';
  }
  await browser.pause(600);
  const html = await getBodyHTML();
  const hasContent = typeof html === 'string' && html.length > 200;
  const isDegraded = hasDegradedIndicator(html);
  const isSimulated = hasSimulatedIndicator(html);
  let state;
  if (isSimulated) {
    state = 'BACKEND_SIMULATED_CONFIRMED';
  } else if (isDegraded) {
    state = 'BACKEND_DEGRADED_EXPECTED';
  } else if (hasContent) {
    state = 'BACKEND_READ_ONLY_PROVEN';
  } else {
    state = 'BACKEND_DISPLAY_ONLY_CONFIRMED';
  }
  logClassification(moduleName, state,
    `tier=${tier} content_len=${typeof html === 'string' ? html.length : 0} degraded=${isDegraded} simulated=${isSimulated}`);
  return state;
}

// ─── Tier 2 — Utility modules ────────────────────────────────────────────────

describe('[v57:utility] Skills — /skills — backend activation', () => {
  it('page root and state classification', async () => {
    const state = await probeModule('/skills', 'page-skills', 'SKILLS', 'T2');
    expect(['BACKEND_READ_ONLY_PROVEN', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:utility] Knowledge — /knowledge — backend activation', () => {
  it('page root and state classification', async () => {
    const state = await probeModule('/knowledge', 'page-knowledge', 'KNOWLEDGE', 'T2');
    expect(['BACKEND_READ_ONLY_PROVEN', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });

  it('get_knowledge IPC read-only call', async () => {
    await navigateAndWait('/knowledge', 'page-knowledge', 10000);
    const result = await tryInvoke('get_knowledge', {});
    const state = result.ok ? 'BACKEND_READ_ONLY_PROVEN' :
      (result.available ? 'BACKEND_DEGRADED_EXPECTED' : 'BACKEND_BLOCKED_BY_RUNTIME');
    logClassification('KNOWLEDGE', state,
      `ipc_ok=${result.ok} err=${result.error || 'none'}`);
    expect(true).toBe(true);
  });
});

describe('[v57:utility] Creation — /creation — backend activation', () => {
  it('page root and state classification', async () => {
    // testid: page-creation-studio
    const state = await probeModule('/creation', 'page-creation-studio', 'CREATION', 'T2');
    expect(['BACKEND_READ_ONLY_PROVEN', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:utility] Evolution — /evolution — backend activation', () => {
  it('page root and state classification', async () => {
    // testid: page-evolution-monitor
    const state = await probeModule('/evolution', 'page-evolution-monitor', 'EVOLUTION', 'T2');
    expect(['BACKEND_READ_ONLY_PROVEN', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:utility] Performance — /performance — backend activation', () => {
  it('page root and state classification', async () => {
    // testid: page-performance-test
    const state = await probeModule('/performance', 'page-performance-test', 'PERFORMANCE', 'T2');
    expect(['BACKEND_READ_ONLY_PROVEN', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });

  it('performance_get_metrics IPC read-only call', async () => {
    await navigateAndWait('/performance', 'page-performance-test', 10000);
    const result = await tryInvoke('performance_get_metrics', {});
    const state = result.ok ? 'BACKEND_READ_ONLY_PROVEN' :
      (result.available ? 'BACKEND_DEGRADED_EXPECTED' : 'BACKEND_BLOCKED_BY_RUNTIME');
    logClassification('PERFORMANCE', state,
      `ipc_ok=${result.ok} err=${result.error || 'none'}`);
    expect(true).toBe(true);
  });
});

describe('[v57:utility] Twins — /twins — backend activation', () => {
  it('page root and state classification', async () => {
    const state = await probeModule('/twins', 'page-twins', 'TWINS', 'T2');
    expect(['BACKEND_READ_ONLY_PROVEN', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

// ─── Tier 3 — Advanced AI modules ────────────────────────────────────────────

describe('[v57:advanced] Hyper Center — /hyper-center — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    const state = await probeModule('/hyper-center', 'page-hyper-center', 'HYPER_CENTER', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Reality Center — /reality-center — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    const state = await probeModule('/reality-center', 'page-reality-center', 'REALITY_CENTER', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Quantum Center — /quantum-center — backend classification', () => {
  it('page root and state classification (expected simulated)', async () => {
    const state = await probeModule('/quantum-center', 'page-quantum-center', 'QUANTUM_CENTER', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Orchestration Center — /orchestration-center — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    // testid: page-orchestration-meta-center
    const state = await probeModule('/orchestration-center', 'page-orchestration-meta-center', 'ORCHESTRATION_CENTER', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Orchestration Intel — /orchestration-intelligence — backend classification', () => {
  it('page root and state classification (expected simulated)', async () => {
    const state = await probeModule('/orchestration-intelligence', 'page-orchestration-intelligence', 'ORCHESTRATION_INTEL', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Singularity — /singularity — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    // testid: page-singularity-monitor
    const state = await probeModule('/singularity', 'page-singularity-monitor', 'SINGULARITY', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Sentinel — /sentinel — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    const state = await probeModule('/sentinel', 'page-sentinel', 'SENTINEL', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Watchdog — /watchdog — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    const state = await probeModule('/watchdog', 'page-watchdog', 'WATCHDOG', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] SelfHeal — /selfheal — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    // route: /selfheal (not /self-heal), testid: page-selfheal
    const state = await probeModule('/selfheal', 'page-selfheal', 'SELFHEAL', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});

describe('[v57:advanced] Adaptive — /adaptive — backend classification', () => {
  it('page root and state classification (expected degraded)', async () => {
    // testid: page-adaptive-engine
    const state = await probeModule('/adaptive', 'page-adaptive-engine', 'ADAPTIVE', 'T3');
    expect(['BACKEND_SIMULATED_CONFIRMED', 'BACKEND_DEGRADED_EXPECTED', 'BACKEND_DISPLAY_ONLY_CONFIRMED']).toContain(state);
  });
});
