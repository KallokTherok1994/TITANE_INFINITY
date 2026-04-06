/**
 * TITANE∞ — APISupport Unit Tests
 * Regression guard for hasMicrophone/hasCamera false-negative fix.
 * AH-2026-03-18-CHAT-MULTIMODAL-DEFAULTS-HEAL
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APISupport } from '@/utils/APISupport';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function mockEnumerateDevices(devices: Partial<MediaDeviceInfo>[]) {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      enumerateDevices: vi.fn().mockResolvedValue(devices),
      getUserMedia: vi.fn(),
      getDisplayMedia: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// hasMicrophone
// ─────────────────────────────────────────────────────────────────────────────

describe('APISupport — hasMicrophone', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when audioinput device is present with label (post-permission)', async () => {
    mockEnumerateDevices([
      { kind: 'audioinput', label: 'K66 USB Audio', deviceId: 'abc123' },
    ]);
    expect(await APISupport.hasMicrophone()).toBe(true);
  });

  it('returns true when audioinput device is present with EMPTY label (pre-permission) — regression guard', async () => {
    // This was the bug: label === '' triggered false return before fix
    mockEnumerateDevices([{ kind: 'audioinput', label: '', deviceId: '' }]);
    expect(await APISupport.hasMicrophone()).toBe(true);
  });

  it('returns false when no audioinput device exists', async () => {
    mockEnumerateDevices([
      { kind: 'videoinput', label: 'Camera', deviceId: 'vid1' },
      { kind: 'audiooutput', label: 'Speaker', deviceId: 'out1' },
    ]);
    expect(await APISupport.hasMicrophone()).toBe(false);
  });

  it('returns false when enumerateDevices throws', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    });
    expect(await APISupport.hasMicrophone()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hasCamera
// ─────────────────────────────────────────────────────────────────────────────

describe('APISupport — hasCamera', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when videoinput device is present with label', async () => {
    mockEnumerateDevices([
      { kind: 'videoinput', label: 'Logitech C920', deviceId: 'cam1' },
    ]);
    expect(await APISupport.hasCamera()).toBe(true);
  });

  it('returns true when videoinput device is present with empty label — regression guard', async () => {
    mockEnumerateDevices([{ kind: 'videoinput', label: '', deviceId: '' }]);
    expect(await APISupport.hasCamera()).toBe(true);
  });

  it('returns false when no videoinput device exists', async () => {
    mockEnumerateDevices([{ kind: 'audioinput', label: 'Mic', deviceId: 'mic1' }]);
    expect(await APISupport.hasCamera()).toBe(false);
  });

  it('returns false when enumerateDevices throws', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn().mockRejectedValue(new Error('Not allowed')),
      },
    });
    expect(await APISupport.hasCamera()).toBe(false);
  });
});
