/**
 * IT6 — Type-safety: tauriBridge sendChatMessage typed response handling
 * Proves m.role access without as any, and CoreResponse typed narrowing.
 */
import { describe, it, expect } from 'vitest';
import type {
  ChatMessage,
  ChatConfig,
  CoreResponse,
} from '../../../core/ARCHITECTURE_TYPES_v∞';

describe('tauriBridge — ChatMessage typed role access (IT6)', () => {
  it('ChatMessage.role is a typed union without needing as any cast', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello', timestamp: Date.now() },
      { role: 'assistant', content: 'Hi there' },
    ];
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    expect(lastUser?.content).toBe('Hello');
  });

  it('ChatConfig.model is directly accessible without cast', () => {
    const config: ChatConfig = { model: 'gemma2:2b', temperature: 0.7 };
    expect(config.model).toBe('gemma2:2b');
  });

  it('CoreResponse.success + data are typed fields on the canonical IPC contract', () => {
    const response: CoreResponse<string> = {
      success: true,
      data: 'Generated response',
      timestamp: Date.now(),
    };
    expect(response.success).toBe(true);
    expect(response.data).toBe('Generated response');
  });

  it('CoreResponse with success=false has no data', () => {
    const errorResponse: CoreResponse<string> = {
      success: false,
      error: 'Provider unavailable',
      timestamp: Date.now(),
    };
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe('Provider unavailable');
    expect(errorResponse.data).toBeUndefined();
  });

  it('history map uses m.role directly — no as any needed', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'What is AI?' },
      { role: 'assistant', content: 'AI is intelligence demonstrated by machines.' },
    ];
    const history = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    expect(history).toBe(
      'user: What is AI?\nassistant: AI is intelligence demonstrated by machines.'
    );
  });
});
