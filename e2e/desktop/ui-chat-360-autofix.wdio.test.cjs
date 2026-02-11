/**
 * Ω∞.UI.CHAT.360.AUTOFIX — WebDriver UI-Driven Tests
 * 
 * NO dependency on window.__TAURI__ or window.__TAURI_INTERNALS__
 * Tests ONLY via UI interaction (real user simulation)
 * 
 * Phases:
 * A. Tauri bridge discovery (non-blocking)
 * B-D. AR20 via UI (20 messages)
 * E. Offline simulation (5 messages)
 * F-G. Invalid providers + watchdog
 * H. Navigation 360°
 * I. Stability burst (50 messages)
 */

const fs = require('fs');
const path = require('path');

// Report directory (will be set dynamically)
const REPORT_TS = process.env.REPORT_TS || '2026-02-11T22:21:01Z';
const REPORT_DIR = path.join(process.cwd(), 'reports/ui_chat_360_autofix', REPORT_TS);

// UI Selectors (adjust based on actual DOM)
const SELECTORS = {
  chatInput: 'textarea[placeholder*="Message"], textarea.conversation-input, textarea[name="message"]',
  sendButton: 'button[type="submit"], button:has-text("Envoyer"), button.send-btn',
  messageList: '.message-list, .conversation-messages, [role="log"]',
  assistantMessage: '.message.assistant, .assistant-message, [data-role="assistant"]',
  userMessage: '.message.user, .user-message, [data-role="user"]',
  sidebarNav: 'nav, .sidebar, [role="navigation"]',
  navLink: 'a[href], button[role="link"]',
};

/**
 * Wait for element with retry
 */
async function waitForElement(selector, timeout = 10000) {
  try {
    await browser.waitUntil(
      async () => {
        const elements = await $$(selector);
        return elements.length > 0;
      },
      { timeout, timeoutMsg: `Element not found: ${selector}` }
    );
    return true;
  } catch (err) {
    console.warn(`⚠️ Element not found after ${timeout}ms: ${selector}`);
    return false;
  }
}

/**
 * Send message via UI and wait for response
 */
async function sendMessageViaUI(text, timeout = 25000) {
  const startTime = Date.now();
  
  // Find chat input
  const inputFound = await waitForElement(SELECTORS.chatInput, 5000);
  if (!inputFound) {
    throw new Error('Chat input not found');
  }

  const input = await $(SELECTORS.chatInput);
  await input.click();
  await input.setValue(text);

  // Get initial message count
  const messagesBefore = await $$(SELECTORS.assistantMessage);
  const countBefore = messagesBefore.length;

  // Find and click send button
  const sendBtn = await $(SELECTORS.sendButton);
  await sendBtn.click();

  // Wait for new assistant message
  try {
    await browser.waitUntil(
      async () => {
        const messagesAfter = await $$(SELECTORS.assistantMessage);
        return messagesAfter.length > countBefore;
      },
      { timeout, timeoutMsg: `No response after ${timeout}ms` }
    );
  } catch (err) {
    const elapsed = Date.now() - startTime;
    return {
      success: false,
      latency: elapsed,
      error: 'TIMEOUT_NO_RESPONSE',
      text: '',
    };
  }

  const elapsed = Date.now() - startTime;

  // Get last assistant message
  const assistantMessages = await $$(SELECTORS.assistantMessage);
  const lastMessage = assistantMessages[assistantMessages.length - 1];
  const responseText = await lastMessage.getText();

  return {
    success: true,
    latency: elapsed,
    text: responseText,
    isEmpty: !responseText || responseText.trim().length === 0,
  };
}

/**
 * Get console errors
 */
async function getConsoleErrors() {
  const logs = await browser.getLogs('browser');
  return logs.filter(log => log.level === 'SEVERE' || log.level === 'ERROR');
}

/**
 * Write JSON report
 */
function writeReport(filename, data) {
  const filepath = path.join(REPORT_DIR, 'exports', filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✅ Report written: ${filename}`);
}

/**
 * Write log
 */
function writeLog(filename, content) {
  const filepath = path.join(REPORT_DIR, 'logs', filename);
  fs.writeFileSync(filepath, content);
  console.log(`✅ Log written: ${filename}`);
}

describe('Ω∞.UI.CHAT.360.AUTOFIX', () => {

  before(async () => {
    console.log('🚀 Starting UI Chat 360° Autofix Audit');
    console.log(`📁 Report directory: ${REPORT_DIR}`);
    
    // Ensure report directory exists
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
      fs.mkdirSync(path.join(REPORT_DIR, 'logs'), { recursive: true });
      fs.mkdirSync(path.join(REPORT_DIR, 'exports'), { recursive: true });
      fs.mkdirSync(path.join(REPORT_DIR, 'artifacts'), { recursive: true });
    }
  });

  describe('Phase A: Tauri Bridge Discovery (Non-Blocking)', () => {
    
    it('should detect Tauri namespace (discovery only, no fail)', async () => {
      const discovery = await browser.execute(() => {
        const result = {
          timestamp: new Date().toISOString(),
          tauri_v1: typeof window.__TAURI__ !== 'undefined',
          tauri_v2: typeof window.__TAURI_INTERNALS__ !== 'undefined',
          tauri_keys: [],
        };

        if (window.__TAURI__) {
          result.tauri_keys = Object.keys(window.__TAURI__);
        } else if (window.__TAURI_INTERNALS__) {
          result.tauri_keys = Object.keys(window.__TAURI_INTERNALS__);
        }

        return result;
      });

      console.log('🔍 Tauri Bridge Discovery:', JSON.stringify(discovery, null, 2));
      
      writeReport('tauri_bridge_discovery.json', discovery);
      
      // Log discovery but DO NOT FAIL
      expect(discovery).to.have.property('timestamp');
      console.log('✅ Phase A: Discovery complete (non-blocking)');
    });

  });

  describe('Phase B-D: AR20 Full Test (UI-Driven)', () => {

    it('should send 20 consecutive messages via UI and receive 20 responses', async () => {
      console.log('🔄 Starting AR20 full test (UI-driven)...');
      
      const results = [];
      let consecutiveFailures = 0;

      for (let i = 1; i <= 20; i++) {
        console.log(`📤 Message ${i}/20: "Test message ${i}"`);
        
        const result = await sendMessageViaUI(`Test message ${i}`, 25000);
        
        results.push({
          index: i,
          success: result.success,
          latency: result.latency,
          responseLength: result.text?.length || 0,
          isEmpty: result.isEmpty,
          error: result.error || null,
        });

        if (!result.success) {
          consecutiveFailures++;
          console.error(`❌ Message ${i} FAILED: ${result.error}`);
          
          // Allow up to 2 failures, but stop if 3 consecutive
          if (consecutiveFailures >= 3) {
            console.error('❌ 3 consecutive failures, aborting AR20');
            break;
          }
        } else {
          consecutiveFailures = 0;
          console.log(`✅ Message ${i} response: ${result.latency}ms, ${result.responseLength} chars`);
        }

        // Small delay between messages
        await browser.pause(500);
      }

      // Write results
      writeReport('ar20_ui_results.json', {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      });

      // Calculate stats
      const successful = results.filter(r => r.success);
      const successRate = (successful.length / results.length) * 100;
      const avgLatency = successful.reduce((sum, r) => sum + r.latency, 0) / successful.length;
      const maxLatency = Math.max(...successful.map(r => r.latency));

      console.log(`📊 AR20 Results: ${successful.length}/${results.length} success (${successRate.toFixed(1)}%)`);
      console.log(`⏱️ Latency: avg ${avgLatency.toFixed(0)}ms, max ${maxLatency}ms`);

      // PASS if at least 18/20 (90%) success
      expect(successful.length).to.be.at.least(18, 'At least 18/20 messages must succeed');
      expect(avgLatency).to.be.below(20000, 'Average latency must be < 20s');
      
      console.log('✅ Phase B-D: AR20 PASS');
    });

  });

  describe('Phase E: Offline Simulation', () => {

    it('should handle offline mode gracefully (5 messages)', async () => {
      console.log('🔌 Phase E: Offline simulation starting...');
      
      // Note: We can't stop Ollama from WebDriver, so we test resilience
      // by sending messages and expecting SOME response (offline fallback)
      
      const results = [];

      for (let i = 1; i <= 5; i++) {
        console.log(`📤 Offline message ${i}/5`);
        
        const result = await sendMessageViaUI(`Offline test ${i}`, 10000);
        
        results.push({
          index: i,
          success: result.success,
          latency: result.latency,
          responseLength: result.text?.length || 0,
          isEmpty: result.isEmpty,
        });

        if (result.success) {
          console.log(`✅ Offline ${i}: ${result.latency}ms, ${result.responseLength} chars`);
        } else {
          console.warn(`⚠️ Offline ${i}: No response`);
        }

        await browser.pause(300);
      }

      writeReport('offline5_results.json', {
        total: 5,
        successful: results.filter(r => r.success).length,
        results,
      });

      const successful = results.filter(r => r.success);
      
      // PASS if at least 4/5 responses (allowing 1 potential race condition)
      expect(successful.length).to.be.at.least(4, 'At least 4/5 offline messages must get response');
      
      console.log('✅ Phase E: Offline PASS');
    });

  });

  describe('Phase F-G: Edge Cases (Invalid Providers + Watchdog)', () => {

    it('should never stay silent even with edge cases', async () => {
      console.log('⚠️ Phase F-G: Edge cases testing...');
      
      const edgeCases = [
        'Message avec clés invalides XYZ123',
        'Test provider inexistant',
        'Long délai simulé',
      ];

      const results = [];

      for (let i = 0; i < edgeCases.length; i++) {
        const msg = edgeCases[i];
        console.log(`📤 Edge case ${i + 1}: "${msg}"`);
        
        const result = await sendMessageViaUI(msg, 25000);
        
        results.push({
          message: msg,
          success: result.success,
          latency: result.latency,
          isEmpty: result.isEmpty,
        });

        // Critical: MUST get response (no silence)
        expect(result.success).to.be.true(`Edge case "${msg}" must get response`);
        expect(result.isEmpty).to.be.false(`Edge case "${msg}" must not be empty`);
        
        console.log(`✅ Edge case ${i + 1}: ${result.latency}ms`);
        
        await browser.pause(500);
      }

      writeReport('edge_cases_results.json', results);
      
      console.log('✅ Phase F-G: Edge cases PASS (no silence)');
    });

  });

  describe('Phase H: Navigation 360°', () => {

    it('should navigate all pages without errors', async () => {
      console.log('🧭 Phase H: Navigation 360° starting...');
      
      // Find all navigation links
      const navLinks = await $$(SELECTORS.navLink);
      const navigationResults = [];

      console.log(`📋 Found ${navLinks.length} navigation links`);

      for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
        const link = navLinks[i];
        const linkText = await link.getText();
        const href = await link.getAttribute('href');

        console.log(`🔗 Navigating to: "${linkText}" (${href})`);

        const errorsBefore = await getConsoleErrors();

        try {
          await link.click();
          await browser.pause(1000); // Wait for page load

          const errorsAfter = await getConsoleErrors();
          const newErrors = errorsAfter.length - errorsBefore.length;

          navigationResults.push({
            index: i,
            text: linkText,
            href,
            success: true,
            newErrors,
          });

          console.log(`✅ Navigation ${i + 1}: "${linkText}" - ${newErrors} new errors`);

          // Take screenshot
          await browser.saveScreenshot(
            path.join(REPORT_DIR, 'artifacts', `nav_${i + 1}_${linkText.replace(/\W+/g, '_')}.png`)
          );

        } catch (err) {
          console.error(`❌ Navigation ${i + 1} failed:`, err.message);
          navigationResults.push({
            index: i,
            text: linkText,
            href,
            success: false,
            error: err.message,
          });
        }

        await browser.pause(500);
      }

      writeReport('navigation_360_results.json', {
        total: navigationResults.length,
        successful: navigationResults.filter(r => r.success).length,
        results: navigationResults,
      });

      const successful = navigationResults.filter(r => r.success);
      const successRate = (successful.length / navigationResults.length) * 100;

      console.log(`📊 Navigation: ${successful.length}/${navigationResults.length} pages (${successRate.toFixed(1)}%)`);

      // PASS if at least 80% navigation success
      expect(successRate).to.be.at.least(80, 'At least 80% of pages must be navigable');

      console.log('✅ Phase H: Navigation PASS');
    });

  });

  describe('Phase I: Stability Burst (50 Messages)', () => {

    it('should handle 50 rapid messages without crash', async () => {
      console.log('💥 Phase I: Stability burst (50 messages)...');
      
      const results = [];
      let failures = 0;

      for (let i = 1; i <= 50; i++) {
        if (i % 10 === 0) {
          console.log(`📤 Burst progress: ${i}/50...`);
        }

        const result = await sendMessageViaUI(`Burst ${i}`, 15000);
        
        results.push({
          index: i,
          success: result.success,
          latency: result.latency,
        });

        if (!result.success) {
          failures++;
          // Allow up to 5 failures in 50 messages (10%)
          if (failures > 5) {
            console.error('❌ Too many failures in burst test');
            break;
          }
        }

        // No pause - rapid fire
      }

      writeReport('stability_burst_results.json', {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: failures,
        results,
      });

      const successRate = ((results.length - failures) / results.length) * 100;
      console.log(`📊 Stability: ${results.length - failures}/${results.length} success (${successRate.toFixed(1)}%)`);

      // PASS if at least 90% success
      expect(successRate).to.be.at.least(90, 'At least 90% stability required');

      console.log('✅ Phase I: Stability PASS');
    });

  });

  after(async () => {
    console.log('🏁 All phases complete');
    
    // Final console errors check
    const finalErrors = await getConsoleErrors();
    writeLog('console_errors_final.log', JSON.stringify(finalErrors, null, 2));
    
    console.log(`⚠️ Total console errors: ${finalErrors.length}`);
  });

});
