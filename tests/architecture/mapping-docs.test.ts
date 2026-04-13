/**
 * TITANE∞ — Architecture Tests: Mapping Documents Integrity
 *
 * Validates that all required mapping/cartography documents exist and
 * contain their mandatory sections (Rule 15).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

function readDoc(relPath: string): string {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf-8');
}

describe('🗺️ Architecture: Mapping Documents Integrity (Rule 15)', () => {
  describe('Required mapping documents exist', () => {
    const requiredDocs = [
      'UI_SURFACE_MAP.md',
      'ARCHITECTURE.md',
      'OLLAMA_RUNTIME_MAP.md',
      'RELEASE_SURFACE_INVENTORY.md',
      'docs/CARTOGRAPHY_COMPLETE.md',
      'docs/IPC_CATALOG.md',
    ];

    for (const doc of requiredDocs) {
      it(`${doc} must exist`, () => {
        expect(
          fs.existsSync(path.join(ROOT, doc)),
          `Mapping document ${doc} is missing — update required by Rule 15`
        ).toBe(true);
      });
    }
  });

  describe('UI_SURFACE_MAP.md content', () => {
    it('must have a Surface section', () => {
      const content = readDoc('UI_SURFACE_MAP.md');
      expect(content.length).toBeGreaterThan(100);
      // Should contain at least one surface or route reference
      expect(content).toMatch(/surface|route|page|component/i);
    });
  });

  describe('ARCHITECTURE.md content', () => {
    it('must describe ring architecture', () => {
      const content = readDoc('ARCHITECTURE.md');
      expect(content.length).toBeGreaterThan(100);
      expect(content).toMatch(/ring|Ring/);
    });

    it('must mention Tauri', () => {
      const content = readDoc('ARCHITECTURE.md');
      expect(content).toMatch(/tauri|Tauri/i);
    });
  });

  describe('docs/IPC_CATALOG.md content', () => {
    it('must exist and contain IPC command references', () => {
      const content = readDoc('docs/IPC_CATALOG.md');
      expect(content.length).toBeGreaterThan(100);
      // Should mention invoke or command
      expect(content).toMatch(/command|invoke|ipc/i);
    });
  });

  describe('docs/CARTOGRAPHY_COMPLETE.md content', () => {
    it('must exist and be non-trivial', () => {
      const content = readDoc('docs/CARTOGRAPHY_COMPLETE.md');
      expect(content.length).toBeGreaterThan(200);
    });
  });

  describe('AutoHeal registry', () => {
    it('autoheal_rules.jsonl must exist and have entries', () => {
      const full = path.join(ROOT, 'scripts/autoheal/autoheal_rules.jsonl');
      expect(fs.existsSync(full)).toBe(true);
      const lines = fs.readFileSync(full, 'utf-8').split('\n').filter(Boolean);
      expect(lines.length).toBeGreaterThan(0);
    });

    it('each autoheal entry must have mandatory fields', () => {
      const full = path.join(ROOT, 'scripts/autoheal/autoheal_rules.jsonl');
      const lines = fs.readFileSync(full, 'utf-8').split('\n').filter(Boolean);
      const requiredFields = ['id', 'date', 'scope', 'symptom', 'root_cause', 'fix', 'prevention_test', 'commands', 'files_changed', 'rollback'];

      const violations: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        let entry: Record<string, unknown>;
        try {
          entry = JSON.parse(lines[i]);
        } catch {
          violations.push(`Line ${i + 1}: invalid JSON`);
          continue;
        }
        for (const field of requiredFields) {
          if (!(field in entry)) {
            violations.push(`Line ${i + 1} (id=${entry['id'] ?? '?'}): missing field '${field}'`);
          }
        }
      }

      if (violations.length > 0) {
        console.warn('AutoHeal schema violations:', violations.slice(0, 10));
      }
      expect(violations).toHaveLength(0);
    });
  });

  describe('Governance scripts exist', () => {
    it('verify_instructions.sh must exist', () => {
      expect(fs.existsSync(path.join(ROOT, 'scripts/verify_instructions.sh'))).toBe(true);
    });

    it('detect_recurrence.sh must exist', () => {
      expect(fs.existsSync(path.join(ROOT, 'scripts/autoheal/detect_recurrence.sh'))).toBe(true);
    });

    it('g5-ci-wiring.sh must exist', () => {
      expect(fs.existsSync(path.join(ROOT, 'scripts/gates/g5-ci-wiring.sh'))).toBe(true);
    });
  });
});
