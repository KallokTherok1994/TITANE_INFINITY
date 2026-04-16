import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const devStableScript = fs.readFileSync(
  path.join(rootDir, 'scripts/android/dev-stable.sh'),
  'utf8'
);

describe('android dev stable script', () => {
  it('delegates Android UI serving to the canonical persistent Vite launcher', () => {
    expect(devStableScript).toContain('start_canonical_server()');
    expect(devStableScript).toContain('bash "${SCRIPT_DIR}/vite-network-server.sh"');
    expect(devStableScript).not.toContain('exec vite dev --host');
  });

  it('does not block on Vite child ownership when no device is connected', () => {
    expect(devStableScript).toContain(
      'Server remains available at http://127.0.0.1:${PORT}.'
    );
    expect(devStableScript).not.toContain('wait "$VITE_PID"');
  });
});
