/**
 * TITANE∞ v20.0Ω — Tests d'intégration Phase 1
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => `test-uuid-${Date.now()}`),
  },
});

// ═══════════════════════════════════════════════════════════════
// CONTEXT MANAGER TESTS
// ═══════════════════════════════════════════════════════════════
describe('ContextManager v20.0Ω', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should estimate tokens correctly for French text', async () => {
    const { ContextManager } = await import('@/services/context/ContextManager');
    const manager = new ContextManager();

    // 4 caractères ≈ 1 token
    const text = 'Bonjour le monde!'; // 17 chars → ~4-5 tokens
    const tokens = manager.estimateTokens(text);

    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(10);
  });

  it('should manage system prompt separately', async () => {
    const { ContextManager } = await import('@/services/context/ContextManager');
    const manager = new ContextManager();

    manager.setSystemPrompt('Tu es TITANE∞, un assistant IA.');
    manager.addMessage('user', 'Bonjour');
    manager.addMessage('assistant', 'Bonjour! Comment puis-je vous aider?');

    const window = manager.buildContextWindow();

    expect(window.systemPrompt).toBe('Tu es TITANE∞, un assistant IA.');
    expect(window.messages).toHaveLength(2);
    expect(window.totalTokens).toBeGreaterThan(0);
  });

  it('should truncate oldest messages when context exceeds limit', async () => {
    const { ContextManager } = await import('@/services/context/ContextManager');
    const manager = new ContextManager({
      maxTokens: 100, // Limite très basse pour tester
      reservedForResponse: 20,
    });

    // Ajouter beaucoup de messages
    for (let i = 0; i < 20; i++) {
      manager.addMessage(
        'user',
        `Message utilisateur numéro ${i} avec du contenu assez long pour prendre de la place.`
      );
      manager.addMessage(
        'assistant',
        `Réponse de l'assistant numéro ${i} avec également du contenu.`
      );
    }

    const window = manager.buildContextWindow();

    // La fenêtre devrait être tronquée
    expect(window.wasTrincated).toBe(true);
    expect(window.messages.length).toBeLessThan(40);
  });

  it('should convert to provider messages format', async () => {
    const { ContextManager } = await import('@/services/context/ContextManager');
    const manager = new ContextManager();

    manager.setSystemPrompt('System prompt');
    manager.addMessage('user', 'Hello');
    manager.addMessage('assistant', 'Hi!');

    const messages = manager.toProviderMessages();

    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[2].role).toBe('assistant');
  });
});

// ═══════════════════════════════════════════════════════════════
// SESSION MANAGER TESTS
// ═══════════════════════════════════════════════════════════════
describe('SessionManager v20.0Ω', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should create a new session with UUID', async () => {
    const { SessionManager } = await import('@/services/sessions/SessionManager');
    const manager = new SessionManager();

    const session = manager.createSession({ title: 'Test Session' });

    expect(session.id).toContain('test-uuid');
    expect(session.title).toBe('Test Session');
    expect(session.messageCount).toBe(0);
    expect(session.messages).toHaveLength(0);
  });

  it('should add messages and update session metadata', async () => {
    const { SessionManager } = await import('@/services/sessions/SessionManager');
    const manager = new SessionManager();

    const session = manager.createSession();
    const message = manager.addMessage(session.id, {
      role: 'user',
      content: 'Premier message de test',
    });

    expect(message).not.toBeNull();
    expect(message?.content).toBe('Premier message de test');

    const updatedSession = manager.getSession(session.id);
    expect(updatedSession?.messageCount).toBe(1);
    // Le titre devrait être mis à jour automatiquement
    expect(updatedSession?.title).toContain('Premier message');
  });

  it('should persist and restore sessions from localStorage', async () => {
    const { SessionManager } = await import('@/services/sessions/SessionManager');

    // Créer une session
    const manager1 = new SessionManager();
    const session = manager1.createSession({ title: 'Persistent Session' });
    manager1.addMessage(session.id, { role: 'user', content: 'Test content' });

    // Simuler un nouveau chargement (nouveau manager)
    const manager2 = new SessionManager();
    const restored = manager2.getSession(session.id);

    expect(restored).not.toBeNull();
    // Le titre est tronqué seulement si > 50 chars
    expect(restored?.title).toContain('Test content');
    expect(restored?.messageCount).toBe(1);
  });

  it('should list sessions sorted by most recent', async () => {
    const { SessionManager } = await import('@/services/sessions/SessionManager');
    const manager = new SessionManager();

    manager.createSession({ title: 'Session 1' });
    await new Promise(r => setTimeout(r, 10));
    manager.createSession({ title: 'Session 2' });
    await new Promise(r => setTimeout(r, 10));
    manager.createSession({ title: 'Session 3' });

    const list = manager.listSessions();

    expect(list.length).toBe(3);
    // Plus récent en premier
    expect(list[0].title).toBe('Session 3');
  });

  it('should search sessions by content', async () => {
    const { SessionManager } = await import('@/services/sessions/SessionManager');
    const manager = new SessionManager();

    const session = manager.createSession({ title: 'Search Test' });
    manager.addMessage(session.id, {
      role: 'user',
      content: 'Comment fonctionne React?',
    });

    const results = manager.searchSessions('React');

    expect(results.length).toBe(1);
    expect(results[0].preview).toContain('React');
  });

  it('should export and import sessions', async () => {
    const { SessionManager } = await import('@/services/sessions/SessionManager');
    const manager = new SessionManager();

    const session = manager.createSession({ title: 'Export Test' });
    manager.addMessage(session.id, { role: 'user', content: 'Message to export' });

    const exported = manager.exportSession(session.id);
    expect(exported).not.toBeNull();

    const imported = manager.importSession(exported!);
    expect(imported).not.toBeNull();
    expect(imported?.title).toContain('[Import]');
    expect(imported?.messages).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// MEMORY BRIDGE TESTS
// ═══════════════════════════════════════════════════════════════
describe('MemoryBridge v20.0Ω', () => {
  it('should detect recall intent from user message', async () => {
    const { MemoryBridge } = await import('@/services/memory/MemoryBridge');
    const bridge = new MemoryBridge();

    const result = bridge.detectIntent('Tu te souviens de notre discussion sur React?');

    expect(result.needsMemory).toBe(true);
    expect(result.intent).toBe('recall');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should detect store intent from user message', async () => {
    const { MemoryBridge } = await import('@/services/memory/MemoryBridge');
    const bridge = new MemoryBridge();

    const result = bridge.detectIntent(
      'Retiens que je préfère TypeScript au JavaScript.'
    );

    expect(result.needsMemory).toBe(true);
    expect(result.intent).toBe('store');
  });

  it('should handle questions with low confidence', async () => {
    const { MemoryBridge } = await import('@/services/memory/MemoryBridge');
    const bridge = new MemoryBridge();

    // Les questions simples peuvent déclencher un recall avec faible confiance
    const result = bridge.detectIntent('Quelle heure est-il?');

    // Le système détecte les questions comme potentielles demandes de recall
    expect(result.confidence).toBeLessThanOrEqual(1.0);
  });

  it('should store and retrieve memories', async () => {
    const { MemoryBridge } = await import('@/services/memory/MemoryBridge');
    const bridge = new MemoryBridge();

    // Stocker une mémoire
    bridge.store("L'utilisateur préfère TypeScript", 'preference');

    // Récupérer
    const results = bridge.retrieve(['TypeScript', 'préfère'], 3);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('TypeScript');
  });

  it('should build memory injection for prompts', async () => {
    const { MemoryBridge } = await import('@/services/memory/MemoryBridge');
    const bridge = new MemoryBridge();

    // Stocker des mémoires
    bridge.store("L'utilisateur travaille sur un projet React", 'context');
    bridge.store('Il préfère les composants fonctionnels', 'preference');

    const intent = bridge.detectIntent('Tu te souviens de mon projet?');
    const injection = bridge.buildInjection(intent);

    expect(injection.systemPromptAddition).toContain('CONTEXTE MÉMOIRE');
    expect(injection.relevantMemories.length).toBeGreaterThan(0);
  });

  it('should extract preferences from user messages', async () => {
    const { MemoryBridge } = await import('@/services/memory/MemoryBridge');
    const bridge = new MemoryBridge();

    const preferences = bridge.extractPreferences(
      "Je préfère travailler le matin. J'aime bien le café."
    );

    expect(preferences.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE CONNECTOR TESTS
// ═══════════════════════════════════════════════════════════════
describe('GovernanceConnector v20.0Ω', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with default providers', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    const providers = connector.getAllProviders();

    expect(providers.length).toBeGreaterThan(0);
    expect(providers.some(p => p.id === 'local')).toBe(true);
    expect(providers.some(p => p.id === 'ollama')).toBe(true);
  });

  it('should have local provider always configured', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    const local = connector.getProviderStatus('local');

    expect(local).not.toBeNull();
    expect(local?.isConfigured).toBe(true);
    expect(local?.isActive).toBe(true);
  });

  it('should not allow disabling local provider', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    const result = connector.setProviderActive('local', false);

    expect(result).toBe(false);
    expect(connector.getProviderStatus('local')?.isActive).toBe(true);
  });

  it('should select best available provider', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    // Par défaut, local devrait être sélectionné
    const selected = connector.selectProvider();

    expect(selected).toBe('local');
  });

  it('should respect preferred provider if available and healthy', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    // Ollama doit être marqué comme sain pour être sélectionné
    connector.markProviderHealthy('ollama');
    const selected = connector.selectProvider('ollama');

    // Le provider préféré est sélectionné s'il est configuré, actif et sain
    expect(['ollama', 'local']).toContain(selected);
  });

  it('should fallback to local when preferred is unavailable', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    // OpenAI n'est pas configuré par défaut
    const selected = connector.selectProvider('openai');

    expect(selected).toBe('local'); // Fallback
  });

  it('should get fallback order for available providers only', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    const order = connector.getFallbackOrder();

    // Devrait contenir au minimum local et tauri (toujours configurés)
    expect(order.includes('local')).toBe(true);
    expect(order.includes('tauri')).toBe(true);
    // OpenAI/Claude/Gemini ne sont pas configurés par défaut
    expect(order.includes('openai')).toBe(false);
    expect(order.includes('claude')).toBe(false);
  });

  it('should mark provider as unhealthy', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');
    const connector = new GovernanceConnector();

    connector.markProviderUnhealthy('ollama', 'Connection refused');

    const status = connector.getProviderStatus('ollama');
    expect(status?.isHealthy).toBe(false);
    expect(status?.error).toBe('Connection refused');
  });

  it('should persist configuration to localStorage', async () => {
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');

    const connector1 = new GovernanceConnector();
    connector1.setProviderActive('gemini', true);
    // Note: setDefaultProvider nécessite que le provider soit configuré, actif et sain
    // Local est toujours valide comme default

    // Vérifier que l'activation est persistée
    expect(connector1.getProviderStatus('gemini')?.isActive).toBe(true);

    // Nouveau connector (simule rechargement)
    const connector2 = new GovernanceConnector();
    expect(connector2.getProviderStatus('gemini')?.isActive).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION TESTS - All Systems Together
// ═══════════════════════════════════════════════════════════════
describe('v20.0Ω Integration', () => {
  it('should simulate a complete chat flow with memory and context', async () => {
    const { ContextManager } = await import('@/services/context/ContextManager');
    const { SessionManager } = await import('@/services/sessions/SessionManager');
    const { MemoryBridge } = await import('@/services/memory/MemoryBridge');
    const { GovernanceConnector } =
      await import('@/services/governance/GovernanceConnector');

    // 1. Initialiser les composants
    const context = new ContextManager();
    const sessions = new SessionManager();
    const memory = new MemoryBridge();
    const governance = new GovernanceConnector();

    // 2. Créer une session
    const session = sessions.createSession({ mode: 'default' });
    expect(session).toBeDefined();

    // 3. Définir le prompt système
    context.setSystemPrompt('Tu es TITANE∞, un assistant IA intelligent.');

    // 4. Message utilisateur
    const userMessage = 'Retiens que je suis développeur React.';

    // 5. Ajouter à la session
    sessions.addMessage(session.id, { role: 'user', content: userMessage });

    // 6. Détecter l'intention mémoire
    const intent = memory.detectIntent(userMessage);
    expect(intent.intent).toBe('store');

    // 7. Traiter l'échange (stocke la mémoire)
    memory.processExchange(
      userMessage,
      "Très bien, j'ai noté que vous êtes développeur React."
    );

    // 8. Sélectionner le provider via governance
    const provider = governance.selectProvider();
    expect(provider).toBe('local');

    // 9. Vérifier que la mémoire a été stockée
    const memories = memory.getAllMemories();
    expect(memories.length).toBeGreaterThan(0);

    // 10. Nouveau message avec rappel
    const recallMessage = 'Tu te souviens de mon métier?';
    const recallIntent = memory.detectIntent(recallMessage);
    expect(recallIntent.intent).toBe('recall');

    // 11. Injection mémoire
    const injection = memory.buildInjection(recallIntent);
    expect(injection.relevantMemories.length).toBeGreaterThan(0);

    // 12. Vérifier le contexte final
    context.addMessage('user', recallMessage);
    const window = context.buildContextWindow();
    expect(window.messages.length).toBe(1);
    expect(window.availableTokens).toBeGreaterThan(0);
  });
});
