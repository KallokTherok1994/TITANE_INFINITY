/**
 * TITANE∞ — Contract test for the 17+1 TIME-IPC v3 commands.
 * Validates that every TS service command:
 *   1. exists as `#[tauri::command]` in Rust,
 *   2. is registered in `invoke_handler!`,
 *   3. is allow-listed in BOTH Rust and frontend security guards.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TEMPORAL_V3_COMMANDS } from '../../src/services/temporal';

const ROOT = process.cwd();

const RUST_CMD = fs.readFileSync(
  path.join(ROOT, 'src-tauri/src/commands/temporal_commands.rs'),
  'utf-8'
);
const RUST_MAIN = fs.readFileSync(path.join(ROOT, 'src-tauri/src/main.rs'), 'utf-8');
const RUST_SEC = fs.readFileSync(
  path.join(ROOT, 'src-tauri/src/commands/security.rs'),
  'utf-8'
);
const TS_SEC = fs.readFileSync(path.join(ROOT, 'src/lib/security.ts'), 'utf-8');

describe('TIME-IPC v3 — 18 commandes (17 + temporal_metrics_health)', () => {
  it('liste canonique = 18 commandes', () => {
    expect(TEMPORAL_V3_COMMANDS.length).toBe(18);
    expect(new Set(TEMPORAL_V3_COMMANDS).size).toBe(18);
  });

  it.each(TEMPORAL_V3_COMMANDS)(
    '%s — déclarée en Rust + handler + allowlist Rust + allowlist TS',
    cmd => {
      const rustDecl = new RegExp(
        `#\\[tauri::command\\][\\s\\S]*?pub\\s+async\\s+fn\\s+${cmd}\\b`
      );
      expect(rustDecl.test(RUST_CMD)).toBe(true);

      const handlerRef = new RegExp(`commands::temporal_commands::${cmd}\\b`);
      expect(handlerRef.test(RUST_MAIN)).toBe(true);

      expect(RUST_SEC.includes(`commands.insert("${cmd}")`)).toBe(true);
      expect(TS_SEC.includes(`'${cmd}'`)).toBe(true);
    }
  );
});
