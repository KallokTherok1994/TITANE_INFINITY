/**
 * TITANE∞ — P2.5 SECURITY / CAPABILITIES / RED TEAM FOUNDATION
 * Security Foundation Tests
 *
 * Proves that IPC capabilities are well-formed and security
 * commands exist for hardening the attack surface.
 *
 * SC1: Capabilities JSON files are parseable
 * SC2: Each capability has required top-level fields
 * SC3: IPC contract defines One Door governance
 * SC4: Security commands module exists
 * SC5: Tauri command count is documented (not unbounded)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════════
// SC1: CAPABILITIES JSON FILES — parseable
// ═══════════════════════════════════════════════════════════════════

describe('SC1: capabilities JSON files are parseable', () => {
  const capsDir = join(process.cwd(), 'src-tauri/capabilities');
  let capFiles: string[] = [];

  try {
    capFiles = readdirSync(capsDir).filter(f => f.endsWith('.json'));
  } catch {
    capFiles = [];
  }

  it('finds at least 6 capability files', () => {
    expect(capFiles.length).toBeGreaterThanOrEqual(6);
  });

  for (const file of capFiles) {
    it(`parses ${file} without errors`, () => {
      const raw = readFileSync(join(capsDir, file), 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe('object');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SC2: EACH CAPABILITY — required fields
// ═══════════════════════════════════════════════════════════════════

describe('SC2: each capability has required fields', () => {
  const capsDir = join(process.cwd(), 'src-tauri/capabilities');
  let capFiles: string[] = [];

  try {
    capFiles = readdirSync(capsDir).filter(f => f.endsWith('.json'));
  } catch {
    capFiles = [];
  }

  for (const file of capFiles) {
    describe(file, () => {
      const raw = readFileSync(join(capsDir, file), 'utf-8');
      const parsed = JSON.parse(raw);

      it('has at least one identifier field', () => {
        const hasIdentifier =
          parsed.identifier !== undefined ||
          parsed.name !== undefined ||
          parsed.capability !== undefined;
        expect(hasIdentifier).toBe(true);
      });

      it('has at least one permission or command field', () => {
        const hasPermission =
          parsed.permissions !== undefined ||
          parsed.commands !== undefined ||
          parsed.allowlist !== undefined ||
          parsed.windows !== undefined;
        expect(hasPermission).toBe(true);
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SC3: IPC CONTRACT — One Door governance defined
// ═══════════════════════════════════════════════════════════════════

describe('SC3: IPC contract defines One Door governance', () => {
  const contractPath = join(process.cwd(), 'docs/IPC_CONTRACT.md');

  it('IPC contract document exists', () => {
    expect(existsSync(contractPath)).toBe(true);
  });

  if (existsSync(contractPath)) {
    const content = readFileSync(contractPath, 'utf-8');

    it('defines response envelope {ok, content, error}', () => {
      expect(content).toContain('ok');
      expect(content).toContain('content');
      expect(content).toContain('error');
    });

    it('defines error handling contract', () => {
      const hasContract =
        content.includes('Erreurs') ||
        content.includes('error') ||
        content.includes('silence') ||
        content.includes('pas de');
      expect(hasContract).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SC4: SECURITY COMMANDS — module exists
// ═══════════════════════════════════════════════════════════════════

describe('SC4: security commands module exists', () => {
  const secureCommandsPath = join(process.cwd(), 'src-tauri/src/secure_commands.rs');

  it('secure_commands.rs exists', () => {
    expect(existsSync(secureCommandsPath)).toBe(true);
  });

  if (existsSync(secureCommandsPath)) {
    const content = readFileSync(secureCommandsPath, 'utf-8');

    it('contains tauri::command annotations', () => {
      expect(content).toContain('tauri::command');
    });

    it('has at least 5 commands', () => {
      const matches = content.match(/#\[tauri::command\]/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(5);
    });
  }

  it('security module directory exists', () => {
    const securityDir = join(process.cwd(), 'src-tauri/src/security');
    expect(existsSync(securityDir)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC5: COMMAND COUNT — documented (not unbounded)
// ═══════════════════════════════════════════════════════════════════

describe('SC5: Tauri command surface is documented', () => {
  it('tauri.conf.json exists and is valid JSON', () => {
    const configPath = join(process.cwd(), 'src-tauri/tauri.conf.json');
    expect(existsSync(configPath)).toBe(true);
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed).toBeDefined();
  });

  it('capabilities directory has bounded count', () => {
    const capsDir = join(process.cwd(), 'src-tauri/capabilities');
    let count = 0;
    try {
      count = readdirSync(capsDir).filter(f => f.endsWith('.json')).length;
    } catch {
      count = 0;
    }
    // Capabilities should be a finite, governed set
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(20);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC6: ALLOWED_COMMANDS COMPLETENESS — v29.0.0 fix validation
// Verifies that the commands added in the IPC whitelist gap fix are
// present in both ALLOWED_COMMANDS and the tauri.conf.json allow list.
// ═══════════════════════════════════════════════════════════════════

describe('SC6: ALLOWED_COMMANDS includes all production IPC commands', () => {
  const securityPath = join(process.cwd(), 'src/lib/security.ts');
  const configPath = join(process.cwd(), 'src-tauri/tauri.conf.json');

  // Commands added in the v29.0.0 IPC whitelist gap fix (AH-2026-04-06-IPC-WHITELIST-ALLOWLIST-060)
  const requiredCommands = [
    'agenda_save_event',
    'agenda_save_events',
    'agenda_delete_event',
    'agenda_sync',
    'calibrate_titane_voice',
    'chat_mode_change',
    'chat_mode_sync',
    'evolution_save_state',
    'submit_evolution_data',
    'knowledge_ingest',
    'knowledge_save_state',
    'progression_save_state',
  ];

  it('security.ts ALLOWED_COMMANDS contains all required production commands', () => {
    const raw = readFileSync(securityPath, 'utf-8');
    for (const cmd of requiredCommands) {
      expect(raw, `ALLOWED_COMMANDS must include '${cmd}'`).toContain(`'${cmd}'`);
    }
  });

  it('tauri.conf.json allow list contains all required production commands', () => {
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const caps = parsed?.app?.security?.capabilities ?? [];
    const allowed = new Set<string>();
    for (const cap of caps) {
      for (const entry of cap.allow ?? []) {
        if (typeof entry?.command === 'string') {
          allowed.add(entry.command);
        }
      }
    }
    for (const cmd of requiredCommands) {
      expect(allowed.has(cmd), `tauri.conf.json allow list must include '${cmd}'`).toBe(true);
    }
  });
});
