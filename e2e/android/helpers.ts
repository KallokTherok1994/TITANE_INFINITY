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
      !entry.includes('cognitive_get_knowledge_vault')
  );
}
