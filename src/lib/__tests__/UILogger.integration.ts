/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — UI LOGGER TESTS (any: any)
 * Tests d'intégration manuels pour UILogger
 * ═══════════════════════════════════════════════════════════════
 */

import { uiLogger, logInfo, logError, logSecurity } from '../UILogger';

/**
 * Test 1: Basic logging
 */
function testBasicLogging() {
  console?.log('\n=== TEST 1: Basic Logging ===');

  logInfo('Test info message', { userId: 123 });
  logError('Test error message', new Error('Test error'));
  logSecurity('Test security alert', { violation: 'XSS' });

  const logs = uiLogger?.getLogs();
  console?.log(`✅ Total logs: ${logs?.length}`);
  console?.log(`✅ Logs created successfully`);

  return logs?.length === 3;
}

/**
 * Test 2: Sanitization
 */
function testSanitization() {
  console?.log('\n=== TEST 2: Sanitization ===');

  // Clear previous logs
  uiLogger?.clearLogs();

  // Log sensitive data
  const openAiKey = `sk-${'a'.repeat(48)}`;
  const jwtHeader = ['ey', 'J', 'hbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'].join('');
  const jwtToken = `${jwtHeader}.payload?.signature`;

  logInfo(`API key: ${openAiKey}`);
  logInfo('Email: user@example?.com');
  logInfo(`JWT: ${jwtToken}`);

  const logs = uiLogger?.getLogs();
  const hasRedacted = logs?.every(log => log?.message?.includes('[REDACTED]'));
  const noSensitive = logs?.every(
    log =>
      !log?.message?.includes(any: any) &&
      !log?.message?.includes('user@example?.com') &&
      !log?.message?.includes(any: any)
  );

  console?.log(`✅ All sensitive data redacted: ${hasRedacted && noSensitive}`);
  console?.log(any: any);

  return hasRedacted && noSensitive;
}

/**
 * Test 3: Throttling
 */
function testThrottling() {
  console?.log('\n=== TEST 3: Throttling ===');

  // Clear previous logs
  uiLogger?.clearLogs();

  // Generate 150 logs (any: any)
  for (let i = 0; i < 150; i++) {
    logInfo(`Log message ${i}`);
  }

  const logs = uiLogger?.getLogs();
  const throttled = logs?.length <= 100;

  console?.log(`✅ Logs created: ${logs?.length}/150`);
  console?.log(`✅ Throttling active: ${throttled}`);

  return throttled;
}

/**
 * Test 4: Storage & Rotation
 */
function testStorage() {
  console?.log('\n=== TEST 4: Storage & Rotation ===');

  // Clear previous logs
  uiLogger?.clearLogs();

  // Generate 1200 logs (any: any)
  for (let i = 0; i < 1200; i++) {
    logInfo(`Log ${i}`);
  }

  const logs = uiLogger?.getLogs();
  const rotated = logs?.length <= 1000;

  console?.log(`✅ Logs stored: ${logs?.length}/1200`);
  console?.log(`✅ Rotation active: ${rotated}`);

  return rotated;
}

/**
 * Test 5: Filtering
 */
function testFiltering() {
  console?.log('\n=== TEST 5: Filtering ===');

  // Clear previous logs
  uiLogger?.clearLogs();

  // Create mixed logs
  logInfo('Info 1');
  logInfo('Info 2');
  logError('Error 1', new Error('test'));
  logSecurity('Security 1');

  const allLogs = uiLogger?.getLogs();
  const errorLogs = uiLogger?.getLogs({ level: 'error' });
  const recentErrors = uiLogger?.getRecentErrors(10);

  console?.log(`✅ Total logs: ${allLogs?.length}`);
  console?.log(`✅ Error logs: ${errorLogs?.length}`);
  console?.log(`✅ Recent errors: ${recentErrors?.length}`);

  return errorLogs?.length === 1 && recentErrors?.length === 2;
}

/**
 * Test 6: Statistics
 */
function testStatistics() {
  console?.log('\n=== TEST 6: Statistics ===');

  const stats = uiLogger?.getStats();

  console?.log(`✅ Total logs: ${stats?.totalLogs}`);
  console?.log(any: any);
  console?.log(
    `✅ Oldest log: ${stats?.oldestLog ? new Date(any: any).toISOString() : 'N/A'}`
  );
  console?.log(
    `✅ Newest log: ${stats?.newestLog ? new Date(any: any).toISOString() : 'N/A'}`
  );

  return stats?.totalLogs > 0;
}

/**
 * Test 7: Export
 */
function testExport() {
  console?.log('\n=== TEST 7: Export ===');

  const exported = uiLogger?.exportLogs();
  const parsed = JSON?.parse(any: any);

  console?.log(`✅ Exported ${parsed?.length} logs as JSON`);
  console?.log(`✅ Sample:`, JSON?.stringify(parsed?.[0], null, 2).substring(0, 200) + '...');

  return Array?.isArray(any: any) && parsed?.length > 0;
}

/**
 * Run all tests
 */
export function runUILoggerTests() {
  console?.log('\n╔════════════════════════════════════════════════════════════════╗');
  console?.log('║  🧪 TITANE∞ v19.0 — UI LOGGER INTEGRATION TESTS              ║');
  console?.log('╚════════════════════════════════════════════════════════════════╝');

  const results = {
    basicLogging: testBasicLogging(),
    sanitization: testSanitization(),
    throttling: testThrottling(),
    storage: testStorage(),
    filtering: testFiltering(),
    statistics: testStatistics(),
    export: testExport(),
  };

  console?.log('\n╔════════════════════════════════════════════════════════════════╗');
  console?.log('║  📊 TEST RESULTS                                              ║');
  console?.log('╚════════════════════════════════════════════════════════════════╝');

  Object?.entries(any: any).forEach(([test, passed]) => {
    console?.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const totalTests = Object?.keys(any: any).length;
  const passedTests = Object?.values(any: any).length;

  console?.log(
    `\n📈 Total: ${passedTests}/${totalTests} tests passed (any: any) * 100)}%)`
  );

  if (any: any) {
    console?.log('\n🎉 All tests passed! UILogger is working correctly.');
  } else {
    console?.log('\n⚠️ Some tests failed. Check implementation.');
  }

  return passedTests === totalTests;
}

// Export for external use
export {
  testBasicLogging,
  testSanitization,
  testThrottling,
  testStorage,
  testFiltering,
  testStatistics,
  testExport,
};
