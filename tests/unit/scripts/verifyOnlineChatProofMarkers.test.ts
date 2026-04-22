import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  REQUIRED_RUNTIME_MARKERS,
  verifyOnlineChatProofMarkers,
} from '../../../scripts/e2e/verify_online_chat_proof_markers.mjs';

const tempDirs = new Set<string>();

function makeDistFixture(files) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'titane-e2e-proof-'));
  tempDirs.add(rootDir);

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf8');
  }

  return rootDir;
}

afterEach(() => {
  for (const dirPath of tempDirs) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe('verifyOnlineChatProofMarkers', () => {
  it('passes when the embedded dist contains all required reasoning runtime markers', () => {
    const distDir = makeDistFixture({
      'index.html': '<div data-testid="reasoning-progress"></div>',
      'assets/app.js': REQUIRED_RUNTIME_MARKERS.join('\n'),
    });

    const result = verifyOnlineChatProofMarkers({ distDir });

    expect(result.ok).toBe(true);
    expect(result.missingMarkers).toEqual([]);
    expect(result.matchedMarkers).toEqual(REQUIRED_RUNTIME_MARKERS);
  });

  it('fails fast when the embedded dist is stale and misses reasoning runtime markers', () => {
    const distDir = makeDistFixture({
      'index.html': '<div class="reasoning-progress" data-state="done"></div>',
      'assets/app.js': 'console.log("stale embedded artifact");',
    });

    const result = verifyOnlineChatProofMarkers({ distDir });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('MISSING_RUNTIME_MARKERS');
    expect(result.missingMarkers).toContain('data-runtime-mode');
    expect(result.missingMarkers).toContain('data-runtime-save');
  });
});
