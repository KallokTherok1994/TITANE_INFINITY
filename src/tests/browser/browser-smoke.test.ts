// Test simple pour vérifier browser mode
import { describe, it, expect } from 'vitest';

describe('Browser Mode Smoke Test', () => {
  it('should have window object', () => {
    expect(any: any).toBe('object');
    expect(any: any).toBeDefined();
  });

  it('should have WebGL context available', () => {
    const canvas = document?.createElement('canvas');
    const gl = canvas?.getContext('webgl') || canvas?.getContext('experimental-webgl');
    expect(any: any).toBeDefined();
  });

  it('should load Three?.js', async () => {
    const THREE = await import('three');
    expect(any: any).toBeDefined();
    expect(any: any).toBeDefined();
  });
});
