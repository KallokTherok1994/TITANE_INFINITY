import { describe, expect, it } from 'vitest';
import {
  resolveUnifiedMemoryNamespace,
  resolveUnifiedMemoryPaths,
} from '@/services/memory/UnifiedMemoryService';

describe('UnifiedMemoryService namespace isolation', () => {
  it('resolves test namespace when vitest is active', () => {
    const namespace = resolveUnifiedMemoryNamespace({ VITEST: '1' } as NodeJS.ProcessEnv);
    expect(namespace).toBe('test');
  });

  it('keeps production namespace as default', () => {
    const namespace = resolveUnifiedMemoryNamespace({} as NodeJS.ProcessEnv);
    expect(namespace).toBe('prod');
  });

  it('prioritizes explicit TITANE_MEMORY_NAMESPACE when valid', () => {
    const namespace = resolveUnifiedMemoryNamespace({
      TITANE_MEMORY_NAMESPACE: 'dev',
      VITEST: '1',
      NODE_ENV: 'test',
    } as NodeJS.ProcessEnv);
    expect(namespace).toBe('dev');
  });

  it('ignores invalid TITANE_MEMORY_NAMESPACE values', () => {
    const namespace = resolveUnifiedMemoryNamespace({
      TITANE_MEMORY_NAMESPACE: 'sandbox',
      NODE_ENV: 'production',
    } as NodeJS.ProcessEnv);
    expect(namespace).toBe('prod');
  });

  const norm = (p: string) => p.replace(/\\/g, '/');

  it('resolves namespaced test paths under memory/test', () => {
    const paths = resolveUnifiedMemoryPaths('/workspace', 'test');
    expect(norm(paths.STM)).toBe('/workspace/memory/test/stm.json');
    expect(norm(paths.MTM)).toBe('/workspace/memory/test/mtm.json');
    expect(norm(paths.LTM)).toBe('/workspace/memory/test/ltm.json');
  });

  it('keeps production paths under memory root', () => {
    const paths = resolveUnifiedMemoryPaths('/workspace', 'prod');
    expect(norm(paths.STM)).toBe('/workspace/memory/stm.json');
    expect(norm(paths.MTM)).toBe('/workspace/memory/mtm.json');
    expect(norm(paths.LTM)).toBe('/workspace/memory/ltm.json');
  });

  it('resolves dev paths under memory/dev', () => {
    const paths = resolveUnifiedMemoryPaths('/workspace', 'dev');
    expect(norm(paths.STM)).toBe('/workspace/memory/dev/stm.json');
    expect(norm(paths.MTM)).toBe('/workspace/memory/dev/mtm.json');
    expect(norm(paths.LTM)).toBe('/workspace/memory/dev/ltm.json');
  });
});
