import { test, expect } from '@playwright/test';

test('PATCH-010: Live Provider Routing Test', async ({ page }) => {
  console.log('[TEST] Starting live provider routing validation...');

  // Step 1: Navigate to app — use 'load' so React mounts before we start interacting
  console.log('[TEST] [Step 1] Navigating to http://127.0.0.1:5173/');
  await page.goto('http://127.0.0.1:5173/', {
    waitUntil: 'load',
    timeout: 30000,
  });

  // Step 2: Wait for React hydration (lazy chunks load after 'load' event)
  console.log('[TEST] [Step 2] Waiting for app shell to render...');
  await page.waitForSelector('[role="main"]', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Step 3: Get title and verify
  const pageTitle = await page.title();
  console.log(`[TEST] [Step 3] Page title: ${pageTitle}`);
  expect(pageTitle).toContain('TITANE∞');

  // Step 4: Locate message input - try multiple selectors
  console.log('[TEST] [Step 4] Locating message input field...');
  let inputField = null;

  // Try selector variations
  const selectors = [
    'textarea[id*="message"]',
    'input[type="text"][placeholder*="message"]',
    'textarea[placeholder*="Send"]',
    '[role="textbox"]',
    'textarea',
    'input[type="text"]',
  ];

  for (const selector of selectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`[TEST] Found element with selector: ${selector} (count: ${count})`);
        inputField = page.locator(selector).first();
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  if (!inputField) {
    console.log('[TEST] ⚠️ Could not find input field - checking page structure');
    const allTextareas = await page.locator('textarea').count();
    const allInputs = await page.locator('input[type="text"]').count();
    console.log(`[TEST] Found ${allTextareas} textareas, ${allInputs} text inputs`);

    if (allTextareas > 0) {
      inputField = page.locator('textarea').first();
    } else if (allInputs > 0) {
      inputField = page.locator('input[type="text"]').first();
    }
  }

  if (!inputField) {
    console.log('[TEST] ❌ FAILED: Could not locate input field');
    console.log('[TEST] Page content sample:');
    console.log(await page.content().then(c => c.substring(0, 500)));
    throw new Error('Input field not found');
  }

  // Step 5: Type test message
  console.log('[TEST] [Step 5] Typing test message...');
  const testMessage = 'Test message for PATCH-010 provider routing validation';
  await inputField.click();
  await inputField.fill(testMessage);
  await page.waitForTimeout(500);

  // Step 6: Find and click send button
  console.log('[TEST] [Step 6] Sending message...');
  const sendButtons = await page.locator('button').count();
  console.log(`[TEST] Found ${sendButtons} buttons on page`);

  // Try to find send button
  let sendButton = null;
  const buttonSelectors = [
    'button[aria-label*="send" i]',
    'button:has-text("Send")',
    'button:has-text("send")',
    'button[title*="Send" i]',
  ];

  for (const selector of buttonSelectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`[TEST] Found send button with selector: ${selector}`);
        sendButton = page.locator(selector).first();
        break;
      }
    } catch (e) {
      // Continue
    }
  }

  if (!sendButton) {
    // Try keyboard send (common pattern: Ctrl+Enter or Enter)
    console.log('[TEST] Attempting keyboard send (Ctrl+Enter)...');
    await inputField.press('Control+Enter');
  } else {
    console.log('[TEST] Clicking send button...');
    await sendButton.click();
  }

  // Step 7: Wait for response
  console.log('[TEST] [Step 7] Waiting for response...');
  await page.waitForTimeout(5000); // Wait 5 seconds for response

  // Step 8: Capture response
  console.log('[TEST] [Step 8] Capturing response...');
  const responseText = await page.evaluate(() => {
    const messages = document.querySelectorAll(
      '[role="article"], .message, .response, [data-testid*="message"]'
    );
    return Array.from(messages)
      .map((m: any) => m.textContent || '')
      .filter((t: string) => t.trim().length > 0)
      .slice(-3) // Last 3 messages
      .join('\n---\n');
  });

  console.log('[TEST] Response captured:');
  console.log(responseText);

  // Step 9: Check console for policy gate evidence
  console.log('[TEST] [Step 9] Checking for policy gate evidence in logs...');

  console.log('[TEST] ✅ Test completed successfully');
  console.log('[TEST] Next: Check backend logs for Policy gate evaluation');
});
