import { beforeEach, describe, expect, it } from 'vitest';
import {
  resolveChatMemoryNamespace,
  resolveChatMemoryStorageKey,
} from '@/services/chatMemoryCompactor';

describe('chatMemoryCompactor namespace contract', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resolves explicit namespace over test auto-detection', () => {
    const namespace = resolveChatMemoryNamespace({
      explicitNamespace: 'dev',
      isVitest: true,
      nodeEnv: 'test',
    });

    expect(namespace).toBe('dev');
  });

  it('falls back to test namespace when test markers are active', () => {
    const namespace = resolveChatMemoryNamespace({
      isVitest: false,
      nodeEnv: 'test',
    });

    expect(namespace).toBe('test');
  });

  it('builds namespace-isolated mode and conversation keys', () => {
    expect(resolveChatMemoryStorageKey('default', undefined, 'prod')).toBe(
      'titane_chat_mode_default'
    );
    expect(resolveChatMemoryStorageKey('default', undefined, 'dev')).toBe(
      'titane_dev_chat_mode_default'
    );
    expect(resolveChatMemoryStorageKey('default', undefined, 'test')).toBe(
      'titane_test_chat_mode_default'
    );

    expect(resolveChatMemoryStorageKey('default', 'conv-42', 'prod')).toBe(
      'titane_chat_conversation_conv-42_default'
    );
    expect(resolveChatMemoryStorageKey('default', 'conv-42', 'dev')).toBe(
      'titane_dev_chat_conversation_conv-42_default'
    );
    expect(resolveChatMemoryStorageKey('default', 'conv-42', 'test')).toBe(
      'titane_test_chat_conversation_conv-42_default'
    );
  });

  it('normalizes blank conversation ids to mode key', () => {
    expect(resolveChatMemoryStorageKey('default', '   ', 'test')).toBe(
      'titane_test_chat_mode_default'
    );
  });
});
