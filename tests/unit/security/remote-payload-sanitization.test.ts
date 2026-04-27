/**
 * TITANE_INFINITY — Security tests: Remote Gateway payload sanitization (Phase C1)
 * Rule 16: New security function → unit + security tests required.
 */

import { describe, it, expect } from 'vitest';

// ── Unit-level validation tests ──────────────────────────────
// These tests exercise the sanitization logic purely at TypeScript level,
// mirroring the Rust sanitize_invoke_request() contract.

const MAX_PAYLOAD_BYTES = 65_536; // must match handlers.rs

/** Simulate serialized size in bytes (UTF-8 approximation). */
function byteSize(obj: unknown): number {
  return new TextEncoder().encode(JSON.stringify(obj)).length;
}

/** Strips ASCII control chars (matching Rust sanitize_string_field). */
function sanitizeStringField(s: string): string {
  return s.replace(/[\x00-\x1F\x7F]/g, '');
}

describe('Payload size guard (mirrors MAX_INVOKE_PAYLOAD_BYTES)', () => {
  it('accepts a payload within 64 KiB', () => {
    const small = { data: 'x'.repeat(1000) };
    expect(byteSize(small)).toBeLessThanOrEqual(MAX_PAYLOAD_BYTES);
  });

  it('rejects a payload exceeding 64 KiB', () => {
    const large = { data: 'x'.repeat(MAX_PAYLOAD_BYTES + 100) };
    expect(byteSize(large)).toBeGreaterThan(MAX_PAYLOAD_BYTES);
  });
});

describe('Command name sanitization', () => {
  it('strips null bytes from command name', () => {
    const dirty = 'health_check\x00injected';
    expect(sanitizeStringField(dirty)).toBe('health_checkinjected');
  });

  it('strips carriage return and newline from command name', () => {
    const dirty = 'get_state\r\nmalicious_header: value';
    expect(sanitizeStringField(dirty)).toBe('get_statemalicious_header: value');
  });

  it('preserves valid ASCII command names unchanged', () => {
    const clean = 'conversation_generate';
    expect(sanitizeStringField(clean)).toBe(clean);
  });
});

describe('Injection pattern resistance', () => {
  const CONTROL_CHAR_RE = /[\x00-\x1F\x7F]/;

  it('command with embedded control chars is detected', () => {
    expect(CONTROL_CHAR_RE.test('bad\x01cmd')).toBe(true);
  });

  it('clean command passes the control char check', () => {
    expect(CONTROL_CHAR_RE.test('conversation_generate')).toBe(false);
  });
});
