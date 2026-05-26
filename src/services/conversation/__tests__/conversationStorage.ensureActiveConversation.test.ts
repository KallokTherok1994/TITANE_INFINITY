/**
 * TITANE∞ — conversationStorage.initialize() active-conversation guarantee tests
 *
 * Verifies that initialize() always ensures a non-null active conversation ID
 * exists after completion, and that the method is idempotent.
 *
 * Covers: src/services/conversation/conversationStorage.ts lines 58-104
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock heavy engine deps before importing the service ────────────────────

const STORAGE_KEY_ACTIVE = 'titane_active_conversation_id';

vi.mock('@/engines/conversation/conversationLifecycleEngine', () => {
  const conversationLifecycle = {
    addEventListener: vi.fn(),
    createConversation: vi.fn((opts?: { title?: string }) => ({
      id: `conv-lifecycle-${Math.random().toString(36).substring(7)}`,
      title: opts?.title ?? 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })),
    createSummary: vi.fn(
      (conv: {
        id: string;
        title?: string;
        messages?: unknown[];
        updatedAt?: number;
      }) => ({
        id: conv.id,
        title: conv.title ?? 'Untitled',
        messageCount: (conv.messages ?? []).length,
        updatedAt: conv.updatedAt ?? Date.now(),
      })
    ),
    setActiveConversation: vi.fn((id: string) => {
      // Mirror the real engine: persist active ID to localStorage
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE, id);
      } catch {
        /* ignore */
      }
    }),
    getActiveConversationId: vi.fn(),
  };

  return { conversationLifecycle };
});

vi.mock('@/services/conversation/legacyCleanup', () => ({
  cleanupLegacyConversationKeys: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

// ── localStorage stub ──────────────────────────────────────────────────────

function makeLocalStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
  } as unknown as Storage;
}

// ── Import the real service (after mocks are registered) ───────────────────

import { ConversationStorageService } from '@/services/conversation/conversationStorage';

describe('conversationStorage.initialize() — active conversation guarantee', () => {
  let localStorageMock: Storage;

  beforeEach(() => {
    localStorageMock = makeLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  it('fresh state (localStorage empty): initialize() → getActiveConversationId() returns non-null string', async () => {
    const storage = new ConversationStorageService();

    await storage.initialize();

    const activeId = storage.getActiveConversationId();
    expect(activeId).not.toBeNull();
    expect(typeof activeId).toBe('string');
    expect((activeId as string).length).toBeGreaterThan(0);
  });

  it('existing active ID in localStorage: initialize() → getActiveConversationId() returns the same ID', async () => {
    const EXISTING_ID = 'existing-conv-abc123';
    const STORAGE_KEY_ACTIVE = 'titane_active_conversation_id';
    const STORAGE_KEY_INDEX = 'titane_conversations_index';
    const STORAGE_KEY_PREFIX = 'titane_conversation_';

    // Seed localStorage with a known conversation
    const existingConversation = {
      id: EXISTING_ID,
      title: 'Existing conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockImplementation(
      (key: string) => {
        if (key === STORAGE_KEY_ACTIVE) return EXISTING_ID;
        if (key === STORAGE_KEY_INDEX)
          return JSON.stringify([{ id: EXISTING_ID, title: 'Existing conversation' }]);
        if (key === `${STORAGE_KEY_PREFIX}${EXISTING_ID}`)
          return JSON.stringify(existingConversation);
        return null;
      }
    );

    const storage = new ConversationStorageService();
    await storage.initialize();

    const activeId = storage.getActiveConversationId();
    expect(activeId).toBe(EXISTING_ID);
  });

  it('initialize() is idempotent: calling it twice only runs initialization logic once', async () => {
    const { conversationLifecycle } =
      await import('@/engines/conversation/conversationLifecycleEngine');
    const createConversationSpy = conversationLifecycle.createConversation as ReturnType<
      typeof vi.fn
    >;
    createConversationSpy.mockClear();

    const storage = new ConversationStorageService();
    await storage.initialize();
    await storage.initialize(); // second call — must be a no-op

    // createConversation is called at most once regardless of how many times
    // initialize() is invoked (the initialized flag prevents re-execution).
    expect(createConversationSpy.mock.calls.length).toBeLessThanOrEqual(1);

    const activeId = storage.getActiveConversationId();
    expect(activeId).not.toBeNull();
  });
});
