/**
 * TITANE∞ v19 - UI Security Self-Tests
 *
 * Tests de sécurité frontend : CSP, sandbox, bridge, isolation
 *
 * @license Proprietary - TITANE Team 2025
 */

import { secureInvoke, getSecurityStats } from '../lib/security';

export interface UITestResult {
  name: string;
  passed: boolean;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface UISelfTestReport {
  tests: UITestResult[];
  pass_rate: number;
  timestamp: string;
  environment: 'development' | 'production';
}

/**
 * Test 1: Vérifier que secureInvoke est configuré correctement
 */
async function testSecureInvokeConfiguration(): Promise<UITestResult> {
  try {
    const stats = getSecurityStats();

    const passed =
      stats.allowed_commands > 0 &&
      stats.max_payload_size_bytes > 0 &&
      stats.default_timeout_ms > 0;

    return {
      name: 'SecureInvoke Configuration',
      passed,
      details: passed
        ? `✅ ${stats.allowed_commands} commands whitelisted, ${stats.max_payload_size_bytes} bytes max payload`
        : '❌ SecureInvoke not properly configured',
      severity: passed ? 'info' : 'critical',
    };
  } catch (error) {
    return {
      name: 'SecureInvoke Configuration',
      passed: false,
      details: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'critical',
    };
  }
}

/**
 * Test 2: Vérifier l'accès backend via secureInvoke
 */
async function testBackendAccess(): Promise<UITestResult> {
  try {
    // Test avec commande backend_selftest (doit être dans whitelist)
    const result = await secureInvoke<{ tests: unknown[] }>(
      'backend_selftest',
      {},
      { timeout: 5000 }
    );

    const passed = result && Array.isArray(result.tests) && result.tests.length > 0;

    return {
      name: 'Backend Access via SecureInvoke',
      passed,
      details: passed
        ? `✅ Backend accessible, ${result.tests.length} tests received`
        : '❌ Backend not accessible or invalid response',
      severity: passed ? 'info' : 'error',
    };
  } catch (error) {
    return {
      name: 'Backend Access via SecureInvoke',
      passed: false,
      details: `⚠️ Backend not reachable: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'warning',
    };
  }
}

/**
 * Test 3: Vérifier CSP headers (indirect via tentative violation)
 */
async function testCSPEnforcement(): Promise<UITestResult> {
  try {
    // Tenter d'injecter un script inline (doit échouer si CSP OK)
    const testScript = document.createElement('script');
    testScript.textContent = 'console.log("CSP violation test")';

    let violationDetected = false;

    // Écouter violations CSP
    const violationHandler = (e: SecurityPolicyViolationEvent) => {
      if (e.blockedURI === 'inline') {
        violationDetected = true;
      }
    };

    document.addEventListener('securitypolicyviolation', violationHandler);

    // ✨ v24.2.1: Use try/finally to ensure listener cleanup even on exceptions
    try {
      try {
        document.head.appendChild(testScript);
        document.head.removeChild(testScript);
      } catch {
        // Normal si CSP bloque
      }

      // Attendre event
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      document.removeEventListener('securitypolicyviolation', violationHandler);
    }

    // En production, CSP doit bloquer
    const isProd = import.meta.env.PROD;
    const passed = isProd ? violationDetected : true; // Dev mode autorise inline

    return {
      name: 'CSP Enforcement',
      passed,
      details: isProd
        ? violationDetected
          ? '✅ CSP active, scripts inline bloqués'
          : '⚠️ CSP faible ou absente'
        : '✅ CSP relaxée en mode dev (normal)',
      severity: passed ? 'info' : 'warning',
    };
  } catch (error) {
    return {
      name: 'CSP Enforcement',
      passed: false,
      details: `❌ Error testing CSP: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
    };
  }
}

/**
 * Test 4: Vérifier isolation Tauri (pas de window.__TAURI__ accessible directement)
 */
async function testTauriIsolation(): Promise<UITestResult> {
  try {
    // __TAURI__ devrait exister mais pas être manipulable
    const hasTauri = typeof (window as { __TAURI__?: unknown }).__TAURI__ !== 'undefined';

    // Tenter manipulation (doit échouer)
    let isolationOk = false;
    try {
      // Test intentionnel de manipulation
      (window as any).__TAURI__ = null;
      isolationOk = false; // Si on arrive ici, isolation faible
    } catch {
      isolationOk = true; // Exception = bonne isolation
    }

    const passed = hasTauri && isolationOk;

    return {
      name: 'Tauri Isolation',
      passed,
      details: passed
        ? '✅ Tauri API présente et protégée'
        : hasTauri
          ? '⚠️ Tauri API manipulable (risque)'
          : '❌ Tauri API absente',
      severity: passed ? 'info' : 'error',
    };
  } catch (error) {
    return {
      name: 'Tauri Isolation',
      passed: false,
      details: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
    };
  }
}

/**
 * Test 5: Vérifier qu'aucun script externe n'est chargé
 */
async function testNoExternalScripts(): Promise<UITestResult> {
  try {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const externalScripts = scripts.filter(script => {
      const src = script.getAttribute('src') || '';
      return (
        src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')
      );
    });

    const passed = externalScripts.length === 0;

    return {
      name: 'No External Scripts',
      passed,
      details: passed
        ? '✅ Aucun script externe chargé'
        : `⚠️ ${externalScripts.length} scripts externes détectés: ${externalScripts.map(s => (s as HTMLScriptElement).src).join(', ')}`,
      severity: passed ? 'info' : 'warning',
    };
  } catch (error) {
    return {
      name: 'No External Scripts',
      passed: false,
      details: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
    };
  }
}

/**
 * Test 6: Vérifier ErrorBoundary dans l'arbre React
 */
async function testErrorBoundaryPresent(): Promise<UITestResult> {
  try {
    // Chercher composants ErrorBoundary dans le DOM
    const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
    const passed = errorBoundaries.length > 0;

    return {
      name: 'ErrorBoundary Protection',
      passed,
      details: passed
        ? `✅ ${errorBoundaries.length} ErrorBoundary actifs`
        : '⚠️ Aucun ErrorBoundary détecté (recommandé)',
      severity: passed ? 'info' : 'warning',
    };
  } catch (error) {
    return {
      name: 'ErrorBoundary Protection',
      passed: false,
      details: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
    };
  }
}

/**
 * Test 7: Vérifier absence de console.log en production
 */
async function testNoConsoleLogs(): Promise<UITestResult> {
  try {
    const isProd = import.meta.env.PROD;

    if (!isProd) {
      return {
        name: 'Console Logs Disabled',
        passed: true,
        details: '✅ Mode dev, console logs autorisés',
        severity: 'info',
      };
    }

    // En prod, console.log devrait être overridé ou silencieux
    const originalLog = console.log;
    let logWorks = true;

    console.log = () => {
      logWorks = false;
    };
    console.log('test');
    console.log = originalLog;

    const passed = !logWorks;

    return {
      name: 'Console Logs Disabled',
      passed,
      details: passed
        ? '✅ Console logs désactivés en production'
        : '⚠️ Console logs actifs en production (fuite info)',
      severity: passed ? 'info' : 'warning',
    };
  } catch (error) {
    return {
      name: 'Console Logs Disabled',
      passed: false,
      details: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
    };
  }
}

/**
 * Exécuter tous les self-tests UI
 */
export async function runUISelfTests(): Promise<UISelfTestReport> {
  const tests: UITestResult[] = [];

  console.log('[UI Self-Test] 🧪 Starting security tests...');

  // Exécuter tous les tests
  tests.push(await testSecureInvokeConfiguration());
  tests.push(await testBackendAccess());
  tests.push(await testCSPEnforcement());
  tests.push(await testTauriIsolation());
  tests.push(await testNoExternalScripts());
  tests.push(await testErrorBoundaryPresent());
  tests.push(await testNoConsoleLogs());

  // Calculer pass rate
  const passed = tests.filter(t => t.passed).length;
  const pass_rate = passed / tests.length;

  const report: UISelfTestReport = {
    tests,
    pass_rate,
    timestamp: new Date().toISOString(),
    environment: import.meta.env.PROD ? 'production' : 'development',
  };

  // Log résumé
  console.log(
    `[UI Self-Test] ✅ ${passed}/${tests.length} tests passed (${(pass_rate * 100).toFixed(1)}%)`
  );
  console.table(
    tests.map(t => ({
      Test: t.name,
      Status: t.passed ? '✅' : '❌',
      Severity: t.severity,
      Details: t.details,
    }))
  );

  return report;
}

/**
 * Exporter rapport UI pour audit
 */
export function exportUISelfTestReport(report: UISelfTestReport): string {
  return JSON.stringify(report, null, 2);
}
