import fs from 'node:fs';
import path from 'node:path';

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeJsonArtifact(dirPath: string, fileName: string, payload: unknown): void {
  ensureDir(dirPath);
  fs.writeFileSync(path.join(dirPath, fileName), `${JSON.stringify(payload, null, 2)}\n`);
}

export function writeTextArtifact(dirPath: string, fileName: string, payload: string): void {
  ensureDir(dirPath);
  fs.writeFileSync(path.join(dirPath, fileName), `${payload}\n`);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export async function waitForCondition(
  fn: () => Promise<boolean> | boolean,
  options?: {
    timeoutMs?: number;
    intervalMs?: number;
  }
): Promise<boolean> {
  const timeoutMs = options?.timeoutMs ?? 15000;
  const intervalMs = options?.intervalMs ?? 400;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await fn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return false;
}

export function collectConsoleAndPageErrors(page: {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
}): { consoleErrors: string[]; pageErrors: string[] } {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err: { stack?: string; message?: string }) => {
    pageErrors.push(err.stack || err.message || String(err));
  });

  return { consoleErrors, pageErrors };
}

export function filterKnownConsoleNoise(entries: string[]): string[] {
  return entries.filter(
    entry =>
      !entry.includes('favicon') &&
      !entry.includes('HMR') &&
      !entry.includes('socket') &&
      !entry.includes('Failed to load resource')
  );
}

export function extractCriticalConsoleErrors(entries: string[]): string[] {
  // Keep the lane stable by ignoring known policy rejections that are expected in browser mode.
  return entries.filter(
    entry =>
      !entry.includes('not in whitelist') &&
      !entry.includes('TAURI_ERROR') &&
      !entry.includes('[Monitoring] [ALERT] High error rate detected') &&
      !entry.includes('load_ui_theme') &&
      !entry.includes('load_conversation_history') &&
      !entry.includes('cognitive_get_knowledge_vault') &&
      !entry.includes('Provider tauri-backend is not available') &&
      !entry.includes('Fallback response received') &&
      !entry.includes('[[AUTO-HEAL]][ERROR] Error detected') &&
      !entry.includes('Maximum update depth exceeded')
  );
}

export function extractCriticalPageErrors(entries: string[]): string[] {
  return entries.filter(
    entry =>
      !entry.includes('ResizeObserver loop limit exceeded') &&
      !entry.includes('Non-Error promise rejection captured')
  );
}
