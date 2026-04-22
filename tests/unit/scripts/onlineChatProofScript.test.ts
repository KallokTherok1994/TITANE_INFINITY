import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function loadScript(relativePath) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

describe('online chat proof wrapper', () => {
  it('blocks embedded proof runs when the native binary policy requires a rebuild', () => {
    const script = loadScript('scripts/e2e/run-online-chat-proof-ui.sh');

    expect(script).toContain('TITANE_E2E_SKIP_NATIVE_FRESHNESS_GUARD');
    expect(script).toContain("require('./scripts/e2e/native-binary-policy.cjs')");
    expect(script).toContain('freshness=${policy.freshnessClass}');
    expect(script).toContain('buildRequired=${policy.buildRequired}');
    expect(script).toContain(
      'Run pnpm run build:tauri:e2e before retrying the embedded desktop proof.'
    );
  });

  it('runs the embedded runtime-marker verifier before launching the desktop proof', () => {
    const script = loadScript('scripts/e2e/run-online-chat-proof-ui.sh');

    expect(script).toContain('TITANE_E2E_SKIP_EMBEDDED_MARKER_GUARD');
    expect(script).toContain('node scripts/e2e/verify_online_chat_proof_markers.mjs');
  });
});
