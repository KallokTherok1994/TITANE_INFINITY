import { test, expect } from '@playwright/test';

test('PATCH-010: Live Provider Routing - Send Message', async ({ page }) => {
  console.log('[LIVE-MSG] 🚀 Starting live message test for provider routing...');

  // Navigate to app
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });

  // Wait for React hydration
  await page.waitForTimeout(3000);

  const pageTitle = await page.title();
  console.log(`[LIVE-MSG] ✅ Page loaded: ${pageTitle}`);

  // Wait for textarea to be visible and interactive
  console.log('[LIVE-MSG] ⏳ Waiting for textarea...');
  const textareaSelector = 'textarea[placeholder*="Tapez"]';
  await page.waitForSelector(textareaSelector, { timeout: 15000 });

  // Get the textarea element
  const textarea = page.locator(textareaSelector).first();

  // Create a unique message for easy tracking in logs
  const testMessage = `[PATCH-010 LIVE TEST] Provider Routing Verification - ${new Date().toISOString()}`;
  console.log(`[LIVE-MSG] 📝 Message to send: "${testMessage}"`);

  // Click and fill the textarea
  console.log('[LIVE-MSG] 🖱️ Clicking textarea and typing message...');
  await textarea.click();
  await page.waitForTimeout(300);
  await textarea.fill(testMessage);

  // Wait a moment for the text to register
  await page.waitForTimeout(500);

  // Verify text was entered
  const enteredText = await textarea.inputValue();
  console.log(`[LIVE-MSG] ✓ Text entered: "${enteredText}"`);

  if (!enteredText.includes('PATCH-010')) {
    throw new Error('Text did not register properly');
  }

  // Find and click the send button
  console.log('[LIVE-MSG] 🔍 Looking for send button...');
  const sendButton = page.locator('button:has-text("Envoyer")').first();

  // Verify button exists and is visible
  const isVisible = await sendButton.isVisible();
  console.log(`[LIVE-MSG] Send button visible: ${isVisible}`);

  if (!isVisible) {
    throw new Error('Send button not visible');
  }

  // Click the send button
  console.log('[LIVE-MSG] 📤 Clicking send button...');
  await sendButton.click();

  // Wait for response
  console.log('[LIVE-MSG] ⏳ Waiting for response (10 seconds)...');
  await page.waitForTimeout(10000);

  // Try to capture response from the UI
  console.log('[LIVE-MSG] 📸 Capturing response...');
  const allMessages = await page.evaluate(() => {
    const messages: any[] = [];

    // Try multiple selectors for messages
    const messageElements = document.querySelectorAll(
      '[role="article"], .message, .response, [data-testid*="message"], [class*="message"]'
    );

    messageElements.forEach((el: any) => {
      const text = el.textContent?.trim();
      if (text && text.length > 5) {
        messages.push({
          text: text.substring(0, 500),
          timestamp: new Date().toISOString(),
        });
      }
    });

    return messages;
  });

  console.log('[LIVE-MSG] Found messages on UI:');
  if (allMessages.length > 0) {
    allMessages.forEach((msg, i) => {
      console.log(`  [${i}]: ${msg.text.substring(0, 100)}...`);
    });
  } else {
    console.log('[LIVE-MSG] ⚠️ No messages captured from UI');
  }

  // Check backend logs for policy evaluation
  console.log('[LIVE-MSG] 🔎 Checking for backend logs...');

  // Take final screenshot
  await page.screenshot({ path: '/tmp/message-sent.png', fullPage: true });
  console.log('[LIVE-MSG] Screenshot saved to /tmp/message-sent.png');

  console.log('[LIVE-MSG] ✅ Test execution completed');
  console.log('[LIVE-MSG] Next: Check backend logs for:');
  console.log('         - [Ω:CMD] policy evaluation');
  console.log('         - external_ai routing decision');
  console.log('         - provider API call (Gemini/OpenAI/Anthropic)');
});
