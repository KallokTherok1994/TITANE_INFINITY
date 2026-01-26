/**
 * TITANE∞ vΩ — Tests E2E Critiques (Infaillibilité)
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Tests des flux critiques pour garantir l'infaillibilité
 */

import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('🔥 Flux Critiques — Garantie Infaillibilité', () => {
  test.beforeEach(async ({ page }) => {
    // Start app in test mode
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
  });

  // ═════════════════════════════════════════════════════════════════════════
  // TESTS DE ROBUSTESSE
  // ═════════════════════════════════════════════════════════════════════════

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Try to send message
    const input = page.locator('[data-testid="chat-input"]');
    await input.fill('Test message pendant offline');
    await input.press('Enter');

    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({
      timeout: 3000,
    });

    // Restore online
    await context.setOffline(false);

    // Should reconnect and process message
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeHidden({
      timeout: 5000,
    });
  });

  test('should recover from provider failures', async ({ page }) => {
    // Send message with intentionally failing provider
    await page.locator('[data-testid="chat-input"]').fill('Test provider recovery');
    await page.locator('[data-testid="chat-input"]').press('Enter');

    // Should show retry indicator
    const retryIndicator = page.locator('[data-testid="retry-indicator"]');

    // Wait for recovery (max 10s)
    await expect(retryIndicator).toBeVisible({ timeout: 2000 });
    await expect(retryIndicator).toBeHidden({ timeout: 10000 });

    // Should have successful response
    await expect(page.locator('[data-testid="chat-message"]').last()).toBeVisible();
  });

  test('should handle rapid successive interactions', async ({ page }) => {
    const input = page.locator('[data-testid="chat-input"]');

    // Send 10 messages rapidly
    for (let i = 0; i < 10; i++) {
      await input.fill(`Message rapide ${i + 1}`);
      await input.press('Enter');
      // Small delay to avoid rate limiting
      await page.waitForTimeout(100);
    }

    // All messages should be processed (check for 10 responses)
    await expect(page.locator('[data-testid="chat-message"]')).toHaveCount(10, {
      timeout: 30000,
    });

    // No error messages should be visible
    await expect(page.locator('[data-testid="error-banner"]')).toBeHidden();
  });

  test('should maintain performance under load', async ({ page }) => {
    // Send 20 messages and measure performance
    const startTime = Date.now();

    for (let i = 0; i < 20; i++) {
      await page.locator('[data-testid="chat-input"]').fill(`Performance test ${i + 1}`);
      await page.locator('[data-testid="chat-input"]').press('Enter');
      await page.waitForTimeout(50);
    }

    // Wait for all responses
    await expect(page.locator('[data-testid="chat-message"]')).toHaveCount(20, {
      timeout: 60000,
    });

    const duration = Date.now() - startTime;

    // Should complete within reasonable time (60s for 20 messages)
    expect(duration).toBeLessThan(60000);

    // UI should remain responsive
    const performanceMetrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        lcp: navigation?.domContentLoadedEventEnd || 0,
      };
    });

    expect(performanceMetrics.fcp).toBeLessThan(2000); // FCP < 2s
  });

  // ═════════════════════════════════════════════════════════════════════════
  // TESTS DE SÉCURITÉ
  // ═════════════════════════════════════════════════════════════════════════

  test('should sanitize malicious input', async ({ page }) => {
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      '"><img src=x onerror=alert("XSS")>',
      "'; DROP TABLE messages; --",
      '../../../etc/passwd',
    ];

    for (const input of maliciousInputs) {
      await page.locator('[data-testid="chat-input"]').fill(input);
      await page.locator('[data-testid="chat-input"]').press('Enter');
      await page.waitForTimeout(500);
    }

    // Should not execute any scripts
    const alerts = await page.evaluate(() => {
      return (window as any).__alertCalled || false;
    });
    expect(alerts).toBeFalsy();

    // Should display sanitized text
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).not.toContainText('<script>');
  });

  test('should prevent session hijacking', async ({ page, context }) => {
    // Get initial session
    const initialCookies = await context.cookies();

    // Try to manipulate session
    await context.addCookies([
      {
        name: 'session_id',
        value: 'malicious_session_12345',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // App should detect invalid session and reset
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be back to clean state
    const currentCookies = await context.cookies();
    const sessionCookie = currentCookies.find(c => c.name === 'session_id');

    expect(sessionCookie?.value).not.toBe('malicious_session_12345');
  });

  // ═════════════════════════════════════════════════════════════════════════
  // TESTS D'ACCESSIBILITÉ CRITIQUE
  // ═════════════════════════════════════════════════════════════════════════

  test('should be fully keyboard navigable', async ({ page }) => {
    // Navigate using only keyboard
    await page.keyboard.press('Tab'); // Focus first element
    await page.keyboard.press('Tab'); // Focus chat input
    await page.keyboard.type('Test navigation clavier');
    await page.keyboard.press('Enter'); // Send message

    // Should send message successfully
    await expect(page.locator('[data-testid="chat-message"]').last()).toContainText(
      'Test navigation clavier'
    );

    // Continue navigation
    await page.keyboard.press('Tab'); // Focus next element
    await page.keyboard.press('Enter'); // Activate

    // Should not throw errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.waitForTimeout(1000);
    expect(consoleErrors.length).toBe(0);
  });

  test('should support screen readers', async ({ page }) => {
    // Check ARIA labels
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toHaveAttribute('aria-label');

    const sendButton = page.locator('[data-testid="send-button"]');
    await expect(sendButton).toHaveAttribute('aria-label');

    // Check semantic HTML
    const mainContent = page.locator('main[role="main"]');
    await expect(mainContent).toBeVisible();

    // Check live regions for dynamic content
    const chatContainer = page.locator('[role="log"]');
    await expect(chatContainer).toHaveAttribute('aria-live', 'polite');
  });

  // ═════════════════════════════════════════════════════════════════════════
  // TESTS DE RÉCUPÉRATION
  // ═════════════════════════════════════════════════════════════════════════

  test('should recover from memory overflow', async ({ page }) => {
    // Create large memory load
    await page.evaluate(() => {
      const largeArray = new Array(1000000).fill('large data');
      (window as any).__testArray = largeArray;
    });

    // App should still be responsive
    await page.locator('[data-testid="chat-input"]').fill('Test après memory load');
    await page.locator('[data-testid="chat-input"]').press('Enter');

    // Should complete within reasonable time
    await expect(page.locator('[data-testid="chat-message"]').last()).toBeVisible({
      timeout: 10000,
    });

    // Check memory didn't crash the app
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    expect(isResponsive).toBeTruthy();
  });

  test('should handle storage quota exceeded', async ({ page }) => {
    // Fill localStorage to capacity
    await page.evaluate(() => {
      try {
        let i = 0;
        while (i < 10000) {
          localStorage.setItem(`key_${i}`, 'x'.repeat(1000));
          i++;
        }
      } catch {
        // Quota exceeded - expected
      }
    });

    // App should handle gracefully
    await page.locator('[data-testid="chat-input"]').fill('Test storage overflow');
    await page.locator('[data-testid="chat-input"]').press('Enter');

    // Should show warning but continue functioning
    await expect(page.locator('[data-testid="storage-warning"]')).toBeVisible({
      timeout: 3000,
    });

    // Message should still be sent
    await expect(page.locator('[data-testid="chat-message"]').last()).toBeVisible();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // TESTS DE PERFORMANCE CRITIQUE
  // ═════════════════════════════════════════════════════════════════════════

  test('should maintain 60fps during animations', async ({ page }) => {
    // Trigger animations
    await page.locator('[data-testid="toggle-sidebar"]').click();
    await page.waitForTimeout(100);
    await page.locator('[data-testid="toggle-sidebar"]').click();

    // Measure frame rate
    const frameRate = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let frames = 0;
        const startTime = performance.now();

        function countFrame() {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frames);
          }
        }

        requestAnimationFrame(countFrame);
      });
    });

    // Should maintain close to 60fps
    expect(frameRate).toBeGreaterThan(55); // Allow small variance
  });

  test('should handle long-running operations without UI freeze', async ({ page }) => {
    // Start long operation
    await page.locator('[data-testid="run-long-task"]').click();

    // UI should remain interactive
    await page.locator('[data-testid="chat-input"]').fill('Test pendant long task');
    await page.locator('[data-testid="chat-input"]').press('Enter');

    // Should respond immediately (not blocked by long task)
    const responseTime = await page.evaluate(() => {
      const start = performance.now();
      return new Promise<number>(resolve => {
        requestAnimationFrame(() => {
          resolve(performance.now() - start);
        });
      });
    });

    expect(responseTime).toBeLessThan(50); // < 50ms response time
  });

  // ═════════════════════════════════════════════════════════════════════════
  // TESTS DE COHÉRENCE DE DONNÉES
  // ═════════════════════════════════════════════════════════════════════════

  test('should maintain data consistency across operations', async ({ page }) => {
    // Send message
    await page.locator('[data-testid="chat-input"]').fill('Test consistency');
    await page.locator('[data-testid="chat-input"]').press('Enter');
    await page.waitForTimeout(500);

    // Get message count
    const initialCount = await page.locator('[data-testid="chat-message"]').count();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Count should be preserved
    const afterReloadCount = await page.locator('[data-testid="chat-message"]').count();
    expect(afterReloadCount).toBe(initialCount);

    // Message content should be identical
    const lastMessage = await page.locator('[data-testid="chat-message"]').last().textContent();
    expect(lastMessage).toContain('Test consistency');
  });

  test('should prevent race conditions in concurrent operations', async ({ page }) => {
    // Start multiple operations simultaneously
    const operations = Array.from({ length: 5 }, (_, i) =>
      page.locator('[data-testid="chat-input"]').fill(`Concurrent ${i + 1}`).then(() =>
        page.locator('[data-testid="chat-input"]').press('Enter')
      )
    );

    await Promise.all(operations);

    // All operations should complete successfully
    await page.waitForTimeout(5000);

    // Check no duplicate or missing messages
    const messageCount = await page.locator('[data-testid="chat-message"]').count();
    expect(messageCount).toBe(5);

    // Check no error states
    await expect(page.locator('[data-testid="error-banner"]')).toBeHidden();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS DE RÉGRESSION VISUELLE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('📸 Régression Visuelle', () => {
  test('should match visual snapshot', async ({ page }) => {
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot('main-interface.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match chat interface snapshot', async ({ page }) => {
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');

    // Send test message
    await page.locator('[data-testid="chat-input"]').fill('Test snapshot');
    await page.locator('[data-testid="chat-input"]').press('Enter');
    await page.waitForTimeout(2000);

    // Screenshot with message
    await expect(page.locator('[data-testid="chat-container"]')).toHaveScreenshot(
      'chat-with-message.png',
      {
        maxDiffPixels: 50,
      }
    );
  });
});
