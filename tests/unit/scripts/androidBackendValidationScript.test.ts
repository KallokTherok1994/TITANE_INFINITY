import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const backendValidationScript = fs.readFileSync(
  path.join(rootDir, 'scripts/e2e/validate-android-backends.sh'),
  'utf8'
);

describe('android backend validation script', () => {
  it('requires runtime validation tooling before probing Android and Ollama state', () => {
    expect(backendValidationScript).toContain('command -v adb');
    expect(backendValidationScript).toContain('command -v jq');
    expect(backendValidationScript).toContain('command -v curl');
  });

  it('extracts both the configured ollamaUrl and ollamaModel from runtime settings', () => {
    expect(backendValidationScript).toContain(
      ".ollamaUrl // .ollama_url // .ollama_base_url // empty"
    );
    expect(backendValidationScript).toContain(
      ".ollamaModel // .ollama_model // empty"
    );
  });

  it('verifies the live Ollama inventory from the configured endpoint', () => {
    expect(backendValidationScript).toContain('OLLAMA_TAGS_URL="${OLLAMA_URL%/}/api/tags"');
    expect(backendValidationScript).toContain('curl -fsS --max-time 10 "$OLLAMA_TAGS_URL"');
    expect(backendValidationScript).toContain(
      "jq -r '.models[]?.name' | grep -Fxq \"$OLLAMA_MODEL\""
    );
  });
});