import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const cleanupScript = fs.readFileSync(
  path.join(rootDir, 'scripts/dev/cleanup-dev-env.sh'),
  'utf8'
);

describe('dev cleanup script', () => {
  it('covers the repo dev ports used by current Linux runtime helpers', () => {
    expect(cleanupScript).toContain('get_port_pid() {');
    expect(cleanupScript).toContain('for PORT in 4000 5173 4173 1420 1430; do');
    expect(cleanupScript).toContain(
      'Port $PORT toujours occupé par PID $PID - force kill...'
    );
  });

  it('cleans generic Vite leftovers instead of only matching `vite dev`', () => {
    expect(cleanupScript).toContain('VITE_PIDS=$(pgrep -f "vite" || true)');
    expect(cleanupScript).toContain('REMAINING_VITE_PIDS=$(pgrep -f "vite" || true)');
    expect(cleanupScript).toContain('REMAINING_VITE=$(pgrep -f "vite" || true)');
    expect(cleanupScript).toContain('Force kill des processus Vite restants');
    expect(cleanupScript).not.toContain('pgrep -f "vite.*dev"');
  });

  it('limits TITANE process detection to explicit runtime signatures', () => {
    expect(cleanupScript).toContain(
      "TITANE_PROCESS_PATTERN='titane[-_ ]?infinity|dev_tauri_monitor|tauri dev|cargo run.*titane|src-tauri/target/.*/titane-infinity|runtime/stable/.*titane'"
    );
    expect(cleanupScript).toContain('get_titane_pids() {');
    expect(cleanupScript).toContain('get_titane_process_lines() {');
    expect(cleanupScript).toContain('REMAINING_TITANE=$(get_titane_process_lines)');
    expect(cleanupScript).toContain('TITANE DEV: $REMAINING_TITANE');
    expect(cleanupScript).not.toContain('REMAINING_TITANE=$(pgrep -f "titane" || true)');
  });
});
