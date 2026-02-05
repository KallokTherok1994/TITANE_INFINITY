/**
 * TITANE∞ — Tests ConversationLifecycleEngine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationLifecycleEngine } from '../conversationLifecycleEngine';
import type { ConversationLifecycleEvent } from '@/types/conversation';

describe('ConversationLifecycleEngine', () => {
  let engine: ConversationLifecycleEngine;
  let events: ConversationLifecycleEvent[];

  beforeEach(() => {
    engine = new ConversationLifecycleEngine();
    events = [];
    engine.addEventListener((event) => events.push(event));
  });

  describe('createConversation', () => {
    it('should create a conversation with default title', () => {
      const conv = engine.createConversation();

      expect(conv.id).toBeDefined();
      expect(conv.id).toMatch(/^conv-/);
      expect(conv.title).toBe('Nouvelle conversation');
      expect(conv.status).toBe('active');
      expect(conv.messages).toEqual([]);
      expect(conv.created_at).toBeGreaterThan(0);
      expect(conv.updated_at).toBeGreaterThan(0);
    });

    it('should create a conversation with custom title', () => {
      const conv = engine.createConversation({ title: 'Test Conv' });

      expect(conv.title).toBe('Test Conv');
    });

    it('should emit conversation.created event', () => {
      const conv = engine.createConversation();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('conversation.created');
      expect(events[0].conversation_id).toBe(conv.id);
    });
  });

  describe('setActiveConversation', () => {
    it('should set active conversation', () => {
      const conv = engine.createConversation();
      events = []; // Reset

      engine.setActiveConversation(conv.id);

      expect(engine.getActiveConversation()).toBe(conv.id);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('conversation.activated');
    });

    it('should not emit event if already active', () => {
      const conv = engine.createConversation();
      engine.setActiveConversation(conv.id);
      events = []; // Reset

      engine.setActiveConversation(conv.id);

      expect(events).toHaveLength(0);
    });
  });

  describe('appendMessage', () => {
    it('should emit message appended event', () => {
      const conv = engine.createConversation();
      events = []; // Reset

      const message = {
        role: 'user' as const,
        content: 'Hello',
        timestamp: Date.now(),
      };

      engine.appendMessage(conv.id, message);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('conversation.message.appended');
      expect(events[0].conversation_id).toBe(conv.id);
      expect(events[0].data?.message).toEqual(message);
    });
  });

  describe('archiveConversation', () => {
    it('should emit archive event', () => {
      const conv = engine.createConversation();
      engine.setActiveConversation(conv.id);
      events = []; // Reset

      engine.archiveConversation(conv.id);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('conversation.archived');
      expect(events[0].conversation_id).toBe(conv.id);
    });

    it('should deactivate if it was active', () => {
      const conv = engine.createConversation();
      engine.setActiveConversation(conv.id);

      engine.archiveConversation(conv.id);

      expect(engine.getActiveConversation()).toBeNull();
    });
  });

  describe('updateConversationTitle', () => {
    it('should generate title from first user message', () => {
      const conv = engine.createConversation({ title: 'Original' });
      conv.messages.push({
        role: 'user',
        content: 'Hello, how are you today?',
        timestamp: Date.now(),
      });

      const newTitle = engine.updateConversationTitle(conv);

      expect(newTitle).toBe('Hello, how are you today?');
    });

    it('should truncate long titles', () => {
      const conv = engine.createConversation();
      conv.messages.push({
        role: 'user',
        content: 'A'.repeat(100),
        timestamp: Date.now(),
      });

      const newTitle = engine.updateConversationTitle(conv);

      expect(newTitle.length).toBeLessThanOrEqual(50);
      expect(newTitle).toContain('...');
    });

    it('should keep original title if no messages', () => {
      const conv = engine.createConversation({ title: 'Empty' });

      const newTitle = engine.updateConversationTitle(conv);

      expect(newTitle).toBe('Empty');
    });
  });

  describe('canReceiveMessages', () => {
    it('should return false if no conversation ID', () => {
      expect(engine.canReceiveMessages(null)).toBe(false);
    });

    it('should return false if not active', () => {
      const conv = engine.createConversation();
      engine.setActiveConversation('other-id');

      expect(engine.canReceiveMessages(conv.id)).toBe(false);
    });

    it('should return true if active', () => {
      const conv = engine.createConversation();
      engine.setActiveConversation(conv.id);

      expect(engine.canReceiveMessages(conv.id)).toBe(true);
    });
  });

  describe('createSummary', () => {
    it('should create a valid summary', () => {
      const conv = engine.createConversation({ title: 'Test', mode: 'default' });
      conv.messages.push(
        { role: 'user', content: 'Hello', timestamp: Date.now() },
        { role: 'assistant', content: 'Hi', timestamp: Date.now() }
      );

      const summary = engine.createSummary(conv);

      expect(summary.id).toBe(conv.id);
      expect(summary.title).toBe('Test');
      expect(summary.status).toBe('active');
      expect(summary.message_count).toBe(2);
      expect(summary.mode).toBe('default');
    });
  });

  describe('reset', () => {
    it('should reset engine state', () => {
      const conv = engine.createConversation();
      engine.setActiveConversation(conv.id);
      engine.addEventListener(() => {});

      engine.reset();

      expect(engine.getActiveConversation()).toBeNull();
    });
  });
});
