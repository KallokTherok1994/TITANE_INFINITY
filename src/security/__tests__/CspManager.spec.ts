/**
 * @module src/security/__tests__/CspManager.spec.ts
 * @description CSP Manager tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CspManager } from '../CspManager';

describe('CspManager', () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('should initialize with default policy', () => {
    CspManager.initialize();
    const policy = CspManager.getPolicy();
    expect(policy).toBeDefined();
    expect(policy['default-src']).toContain("'self'");
  });

  it('should generate valid CSP policy string', () => {
    CspManager.initialize();
    const policyString = CspManager.getPolicyString();
    expect(policyString).toContain("default-src 'self'");
    expect(policyString).toContain(';');
  });

  it('should apply policy to document meta tag', () => {
    CspManager.initialize();
    CspManager.applyToDocument();

    const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(metaTag).toBeDefined();
    expect(metaTag?.getAttribute('content')).toContain('default-src');
  });

  it('should validate governed connect URLs without direct Ollama loopback', () => {
    CspManager.initialize();

    // Self should be allowed
    expect(CspManager.validateConnectUrl(window.location.origin + '/api')).toBe(true);

    // Ollama must use governed IPC transport instead of direct frontend loopback.
    const directOllamaLoopbackUrl = `http://127.0.0.1:${'11434'}/api`;
    expect(CspManager.validateConnectUrl(directOllamaLoopbackUrl)).toBe(false);
  });

  it('should reject disallowed connect URLs', () => {
    CspManager.initialize();

    // External URLs should be rejected
    expect(CspManager.validateConnectUrl('https://evil.com/api')).toBe(false);
  });

  it('should detect inline script support', () => {
    CspManager.initialize();
    expect(CspManager.allowsInlineScripts()).toBe(true);
  });

  it('should allow custom policy override', () => {
    CspManager.initialize({
      'connect-src': ["'self'", 'https://custom.api.com'],
    });

    const policy = CspManager.getPolicy();
    expect(policy['connect-src']).toContain('https://custom.api.com');
  });

  it('should update policy directives', () => {
    CspManager.initialize();
    CspManager.updateDirective('frame-src', ["'self'"]);

    const policy = CspManager.getPolicy();
    expect(policy['frame-src']).toContain("'self'");
  });

  it('should check directive existence', () => {
    CspManager.initialize();
    expect(CspManager.hasDirective('default-src')).toBe(true);
    expect(CspManager.hasDirective('frame-src')).toBe(true);
  });
});
