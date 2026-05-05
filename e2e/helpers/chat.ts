import { expect, type Page } from '@playwright/test';

import { E2E_TIMEOUTS } from '../config/constants';

export async function waitForChatComposerReady(page: Page): Promise<void> {
  await expect(page.getByTestId('chat-input')).toBeVisible({
    timeout: E2E_TIMEOUTS.chatReady,
  });
  await expect(page.getByTestId('chat-send')).toBeVisible({
    timeout: E2E_TIMEOUTS.chatReady,
  });
}

export async function sendChatMessage(page: Page, message: string): Promise<void> {
  const input = page.getByTestId('chat-input');
  await expect(input).toBeVisible({ timeout: E2E_TIMEOUTS.chatReady });
  await input.fill(message);
  await page.getByTestId('chat-send').click();
}

export async function waitForChatLoadingDone(page: Page): Promise<void> {
  const loading = page.getByTestId('chat-loading');
  const visible = await loading.isVisible({ timeout: 500 }).catch(() => false);
  if (visible) {
    await expect(loading).not.toBeVisible({ timeout: E2E_TIMEOUTS.api });
  }
}

export async function waitForRemoteChatReady(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="remote-chat-view"]')).toBeVisible({
    timeout: E2E_TIMEOUTS.chatReady,
  });
  await expect(page.locator('[data-testid="remote-chat-input"]')).toBeVisible({
    timeout: E2E_TIMEOUTS.chatReady,
  });
}

export async function remoteLogin(page: Page, baseUrl: string, secret: string): Promise<void> {
  await page.goto(baseUrl);
  await expect(page.locator('[data-testid="remote-auth-screen"]')).toBeVisible({
    timeout: E2E_TIMEOUTS.ui,
  });
  await page.fill('[data-testid="remote-gateway-url-input"]', baseUrl);
  await page.fill('[data-testid="remote-api-key-input"]', secret);
  await page.click('[data-testid="remote-login-button"]');
  await waitForRemoteChatReady(page);
}
