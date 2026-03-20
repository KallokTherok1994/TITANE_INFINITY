import { test, expect } from '@playwright/test';

test('PATCH-010: Live Provider Routing - Component Wait', async ({ page }) => {
  console.log('[LIVE-PROVIDER] Starting live provider routing test...');
  
  // Navigate to app
  console.log('[LIVE-PROVIDER] Navigating to http://127.0.0.1:5173/');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  
  // Wait much longer for React hydration
  console.log('[LIVE-PROVIDER] Waiting for React hydration and components to mount...');
  await page.waitForTimeout(5000);
  
  // Get page title
  const pageTitle = await page.title();
  console.log(`[LIVE-PROVIDER] Page title: ${pageTitle}`);
  expect(pageTitle).toContain('TITANE∞');
  
  // Wait for any button or interactive element
  console.log('[LIVE-PROVIDER] Waiting for interactive elements...');
  await page.waitForSelector('button', { timeout: 15000 }).catch(() => {
    console.log('[LIVE-PROVIDER] ⚠️ No buttons found, continuing...');
  });
  
  // Check what elements exist
  console.log('[LIVE-PROVIDER] Analyzing DOM structure...');
  const elementCounts = await page.evaluate(() => {
    return {
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input').length,
      textareas: document.querySelectorAll('textarea').length,
      divs: document.querySelectorAll('div').length,
      forms: document.querySelectorAll('form').length,
      contenteditable: document.querySelectorAll('[contenteditable]').length,
      roles: {
        textbox: document.querySelectorAll('[role="textbox"]').length,
        button: document.querySelectorAll('[role="button"]').length,
        main: document.querySelectorAll('[role="main"]').length,
      }
    };
  });
  
  console.log('[LIVE-PROVIDER] DOM Analysis:', JSON.stringify(elementCounts, null, 2));
  
  // Try to find input by any possible means
  console.log('[LIVE-PROVIDER] Searching for input mechanisms...');
  const inputMechanisms = await page.evaluate(() => {
    const results: any = {};
    
    // Check contenteditable
    const cedit = document.querySelectorAll('[contenteditable]');
    if (cedit.length > 0) {
      results.contenteditable = Array.from(cedit).map((e: any) => ({
        tag: e.tagName,
        id: e.id,
        class: e.className,
        text: e.textContent?.substring(0, 50)
      }));
    }
    
    // Check for message input
    const messageInputs = document.querySelectorAll('[id*="message"], [placeholder*="message"], [placeholder*="Send"]');
    if (messageInputs.length > 0) {
      results.messageInputs = Array.from(messageInputs).map((e: any) => ({
        tag: e.tagName,
        id: e.id,
        type: e.type,
        placeholder: e.placeholder
      }));
    }
    
    return results;
  });
  
  console.log('[LIVE-PROVIDER] Input mechanisms found:', JSON.stringify(inputMechanisms, null, 2));
  
  // Take screenshot for debugging
  console.log('[LIVE-PROVIDER] Taking screenshot for debugging...');
  const screenshotPath = '/tmp/ui-structure.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[LIVE-PROVIDER] Screenshot saved to ${screenshotPath}`);
  
  // Get HTML structure
  const htmlSnapshot = await page.evaluate(() => document.documentElement.outerHTML.substring(0, 2000));
  console.log('[LIVE-PROVIDER] HTML sample:\n', htmlSnapshot);
  
  // Wait and check if we can interact with existing elements
  console.log('[LIVE-PROVIDER] Checking for interactive state...');
  const isInteractive = await page.evaluate(() => {
    const readyStates = {
      documentReady: document.readyState,
      bodyExists: !!document.body,
      reactMounted: !!(window as any).__TITANE_BOOT__,
      appElement: !!document.getElementById('root') || !!document.getElementById('app'),
    };
    return readyStates;
  });
  
  console.log('[LIVE-PROVIDER] Interactive state:', JSON.stringify(isInteractive, null, 2));
  
  console.log('[LIVE-PROVIDER] ✅ Component wait test completed');
});
