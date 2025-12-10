/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — TESTS MÉMOIRE PERSISTANTE
 *   Tests unitaires pour le système de mémoire 3-niveaux
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  MemoryEntry,
  MemoryLevel,
  MemoryTopic,
  MemoryContentType,
  MemoryImportance,
  SessionMemoryEntry,
  IntermediateMemoryEntry,
  LongTermMemoryEntry,
  MemorySummary,
  MemoryBundle,
  MemoryStats,
  ModeMemoryPermissions,
} from '../services/memory/persistentMemory.config';
import {
  MEMORY_LEVEL_LABELS,
  MEMORY_TOPIC_LABELS,
  MEMORY_CONTENT_TYPE_LABELS,
  IMPORTANCE_COLORS,
  DEFAULT_SESSION_TTL,
  DEFAULT_INTERMEDIATE_TTL,
  AUTO_PROMOTION_THRESHOLD,
  MAX_CONTEXT_INJECTION_TOKENS,
  MIN_RELEVANCE_FOR_INJECTION,
  MEMORY_SCHEMA_VERSION,
  MODE_MEMORY_PERMISSIONS,
  DEFAULT_MEMORY_PERMISSIONS,
  DEFAULT_AUTO_SAVE_RULES,
  MEMORY_BLACKLIST_PATTERNS,
  EXCLUDED_MESSAGE_PATTERNS,
} from '../services/memory/persistentMemory.config';
import {
  memoryUtils,
  calculateRelevanceScore,
  calculateTFIDFScore,
  rankByRelevance,
  classifyTopic,
  classifyContentType,
  calculateAutoImportance,
  extractAutoTags,
  containsSensitiveData,
  isTrivialMessage,
  shouldSaveContent,
  getMemoryPermissions,
  filterByPermissions,
  generateAutoTitle,
  estimateTokens,
  truncateToTokenLimit,
  prepareContextInjection,
  calculateContentHash,
  areSimilarContents,
  findDuplicates,
} from '../services/memory/memoryUtils';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE TEST
// ─────────────────────────────────────────────────────────────────────────────

const createMockSessionEntry = (
  overrides?: Partial<SessionMemoryEntry>
): SessionMemoryEntry => ({
  id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  level: 'session',
  contentType: 'message',
  content: 'Test session memory content',
  topic: 'general',
  importance: 3,
  tags: ['test'],
  metadata: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    accessCount: 0,
    source: 'chat_user',
    schemaVersion: MEMORY_SCHEMA_VERSION,
  },
  ttl: DEFAULT_SESSION_TTL,
  promotable: true,
  ...overrides,
});

const createMockIntermediateEntry = (
  overrides?: Partial<IntermediateMemoryEntry>
): IntermediateMemoryEntry => ({
  id: `intermediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  level: 'intermediate',
  contentType: 'summary',
  title: 'Test Summary',
  content: 'Test intermediate memory content',
  topic: 'general',
  importance: 3,
  tags: ['test', 'intermediate'],
  status: 'active',
  metadata: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    accessCount: 1,
    source: 'auto_summary',
    schemaVersion: MEMORY_SCHEMA_VERSION,
  },
  sourceEntryIds: [],
  relevanceScore: 0.75,
  expiresAt: Date.now() + DEFAULT_INTERMEDIATE_TTL,
  promotable: true,
  ...overrides,
});

const createMockLongTermEntry = (
  overrides?: Partial<LongTermMemoryEntry>
): LongTermMemoryEntry => ({
  id: `long_term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  level: 'long_term',
  contentType: 'knowledge',
  title: 'Long Term Knowledge',
  summary: 'Important knowledge summary',
  content: 'Test long term memory content with important knowledge',
  topic: 'technical',
  importance: 5,
  tags: ['knowledge', 'important'],
  status: 'active',
  metadata: {
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 jours
    updatedAt: Date.now(),
    accessCount: 10,
    source: 'manual_save',
    schemaVersion: MEMORY_SCHEMA_VERSION,
  },
  sourceEntryIds: [],
  confidenceScore: 95,
  userVerified: true,
  editable: true,
  version: 2,
  versionHistory: ['v1'],
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: CONFIGURATION ET CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Configuration', () => {
  describe('Memory Levels', () => {
    it('should define all 3 memory levels', () => {
      expect(MEMORY_LEVEL_LABELS).toHaveProperty('session');
      expect(MEMORY_LEVEL_LABELS).toHaveProperty('intermediate');
      expect(MEMORY_LEVEL_LABELS).toHaveProperty('long_term');
    });

    it('should have proper labels for each level', () => {
      expect(MEMORY_LEVEL_LABELS.session.label).toBe('Session');
      expect(MEMORY_LEVEL_LABELS.intermediate.label).toBe('Intermédiaire');
      expect(MEMORY_LEVEL_LABELS.long_term.label).toBe('Long Terme');
    });

    it('should have icons for each level', () => {
      expect(MEMORY_LEVEL_LABELS.session.icon).toBe('⏱️');
      expect(MEMORY_LEVEL_LABELS.intermediate.icon).toBe('📝');
      expect(MEMORY_LEVEL_LABELS.long_term.icon).toBe('🗄️');
    });

    it('should have colors for each level', () => {
      expect(MEMORY_LEVEL_LABELS.session.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(MEMORY_LEVEL_LABELS.intermediate.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(MEMORY_LEVEL_LABELS.long_term.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('Memory Topics', () => {
    it('should define all 11 memory topics', () => {
      const expectedTopics = [
        'general',
        'coding',
        'project',
        'personal',
        'technical',
        'creative',
        'learning',
        'decisions',
        'preferences',
        'automation',
        'system',
      ];
      expectedTopics.forEach(topic => {
        expect(MEMORY_TOPIC_LABELS).toHaveProperty(topic);
      });
    });

    it('should have labels and icons for each topic', () => {
      Object.values(MEMORY_TOPIC_LABELS).forEach(config => {
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('icon');
        expect(config.label.length).toBeGreaterThan(0);
        expect(config.icon.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Memory Content Types', () => {
    it('should define all 11 content types', () => {
      const expectedTypes = [
        'message',
        'summary',
        'knowledge',
        'preference',
        'project_context',
        'code_snippet',
        'decision',
        'reference',
        'identity',
        'automation_result',
        'milestone',
      ];
      expectedTypes.forEach(type => {
        expect(MEMORY_CONTENT_TYPE_LABELS).toHaveProperty(type);
      });
    });
  });

  describe('Importance Levels', () => {
    it('should define colors for all 5 importance levels', () => {
      for (let i = 1; i <= 5; i++) {
        expect(IMPORTANCE_COLORS).toHaveProperty(i.toString());
        expect(IMPORTANCE_COLORS[i as MemoryImportance]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  });

  describe('System Constants', () => {
    it('should have correct TTL values', () => {
      expect(DEFAULT_SESSION_TTL).toBe(24 * 60 * 60 * 1000); // 24h
      expect(DEFAULT_INTERMEDIATE_TTL).toBe(30 * 24 * 60 * 60 * 1000); // 30 jours
    });

    it('should have auto-promotion threshold at importance 4', () => {
      expect(AUTO_PROMOTION_THRESHOLD).toBe(4);
    });

    it('should have context injection limits', () => {
      expect(MAX_CONTEXT_INJECTION_TOKENS).toBe(2000);
      expect(MIN_RELEVANCE_FOR_INJECTION).toBe(0.5);
    });

    it('should have schema version', () => {
      expect(MEMORY_SCHEMA_VERSION).toBe('1.0.0');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: SCORING DE PERTINENCE
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Relevance Scoring', () => {
  describe('calculateRelevanceScore', () => {
    it('should return 0.5 for empty query', () => {
      const entry = createMockSessionEntry({ content: 'Test content' });
      const score = calculateRelevanceScore(entry, '');
      expect(score).toBe(0.5);
    });

    it('should return higher score for matching content', () => {
      const entry = createMockSessionEntry({
        content: 'TypeScript is great for building applications',
      });
      const matchingScore = calculateRelevanceScore(entry, 'TypeScript applications');
      const nonMatchingScore = calculateRelevanceScore(entry, 'Python Django');
      expect(matchingScore).toBeGreaterThan(nonMatchingScore);
    });

    it('should boost score for matching tags', () => {
      const entryWithTags = createMockSessionEntry({
        content: 'Some content',
        tags: ['typescript', 'react', 'frontend'],
      });
      const scoreWithTagMatch = calculateRelevanceScore(entryWithTags, 'typescript');
      const scoreWithoutTagMatch = calculateRelevanceScore(entryWithTags, 'python');
      expect(scoreWithTagMatch).toBeGreaterThan(scoreWithoutTagMatch);
    });

    it('should boost score for matching topic context', () => {
      const entry = createMockSessionEntry({
        content: 'Code review best practices',
        topic: 'coding',
      });
      const scoreWithTopicMatch = calculateRelevanceScore(entry, 'code review', {
        currentTopic: 'coding',
      });
      const scoreWithoutTopicMatch = calculateRelevanceScore(entry, 'code review', {
        currentTopic: 'personal',
      });
      expect(scoreWithTopicMatch).toBeGreaterThan(scoreWithoutTopicMatch);
    });

    it('should consider importance in scoring', () => {
      const highImportance = createMockSessionEntry({
        content: 'Important content',
        importance: 5,
      });
      const lowImportance = createMockSessionEntry({
        content: 'Important content',
        importance: 1,
      });
      const highScore = calculateRelevanceScore(highImportance, 'Important');
      const lowScore = calculateRelevanceScore(lowImportance, 'Important');
      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  describe('calculateTFIDFScore', () => {
    it('should return 0 for empty query', () => {
      const entry = createMockSessionEntry({ content: 'Test content' });
      const score = calculateTFIDFScore(entry, '', [entry]);
      expect(score).toBe(0);
    });

    it('should give higher score for unique terms', () => {
      const entries = [
        createMockSessionEntry({ content: 'TypeScript is amazing' }),
        createMockSessionEntry({ content: 'JavaScript is everywhere' }),
        createMockSessionEntry({ content: 'Python is popular' }),
      ];
      // 'TypeScript' est unique, devrait avoir un score plus élevé
      const typeScriptScore = calculateTFIDFScore(
        entries[0],
        'TypeScript amazing',
        entries
      );
      expect(typeScriptScore).toBeGreaterThan(0);
    });
  });

  describe('rankByRelevance', () => {
    it('should rank entries by relevance score', () => {
      const entries = [
        createMockSessionEntry({ content: 'Random content about cats' }),
        createMockSessionEntry({ content: 'TypeScript React development guide' }),
        createMockSessionEntry({ content: 'TypeScript is the best for frontend' }),
      ];

      const ranked = rankByRelevance(entries, 'TypeScript frontend');

      // Les entrées avec TypeScript devraient être en haut
      expect(ranked[0].score).toBeGreaterThan(ranked[2].score);
    });

    it('should return all entries with scores', () => {
      const entries = [
        createMockSessionEntry({ content: 'First entry' }),
        createMockSessionEntry({ content: 'Second entry' }),
      ];

      const ranked = rankByRelevance(entries, 'test');

      expect(ranked).toHaveLength(2);
      ranked.forEach(item => {
        expect(item).toHaveProperty('entry');
        expect(item).toHaveProperty('score');
        expect(typeof item.score).toBe('number');
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: CLASSIFICATION INTELLIGENTE
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Classification', () => {
  describe('classifyTopic', () => {
    it('should classify coding content', () => {
      expect(classifyTopic('Fixed the bug in the API endpoint code')).toBe('coding');
      expect(classifyTopic('TypeScript class implementation with function')).toBe(
        'coding'
      );
      expect(classifyTopic('debug error in backend code')).toBe('coding');
    });

    it('should classify project content', () => {
      expect(classifyTopic('Project milestone reached for v2.0')).toBe('project');
      expect(classifyTopic('Sprint planning for next feature')).toBe('project');
    });

    it('should classify technical content', () => {
      expect(classifyTopic('System architecture optimization performance')).toBe(
        'technical'
      );
      expect(classifyTopic('Performance monitoring configuration infra')).toBe(
        'technical'
      );
    });

    it('should classify creative content', () => {
      expect(classifyTopic('Design concept for the new UI')).toBe('creative');
      expect(classifyTopic('Color palette and style guide')).toBe('creative');
    });

    it('should classify learning content', () => {
      expect(classifyTopic('apprendre about the tutoriel and cours')).toBe('learning');
      expect(classifyTopic('Tutorial documentation guide')).toBe('learning');
    });

    it('should default to general for unclassified content', () => {
      expect(classifyTopic('Hello world')).toBe('general');
      expect(classifyTopic('Random text without keywords')).toBe('general');
    });
  });

  describe('classifyContentType', () => {
    it('should detect code snippets', () => {
      expect(classifyContentType('```typescript\nconst x = 1;\n```')).toBe(
        'code_snippet'
      );
      expect(classifyContentType('function test() { return true; }')).toBe(
        'code_snippet'
      );
      expect(classifyContentType('const myVar = "value";')).toBe('code_snippet');
    });

    it('should detect summaries', () => {
      expect(classifyContentType('En bref, voici les points principaux')).toBe('summary');
      expect(classifyContentType('Récapitulatif de la réunion synthèse')).toBe('summary');
    });

    it('should detect decisions', () => {
      expect(classifyContentType('Nous avons décidé conclusion choix')).toBe('decision');
      expect(classifyContentType('Choix final solution retenu validé')).toBe('decision');
    });

    it('should detect preferences', () => {
      expect(classifyContentType('je préfère toujours utiliser VS Code')).toBe(
        'preference'
      );
      expect(classifyContentType("J'aime le dark mode jamais light")).toBe('preference');
    });

    it('should default to message', () => {
      expect(classifyContentType('Bonjour, comment ça va ?')).toBe('message');
    });
  });

  describe('calculateAutoImportance', () => {
    it('should give higher importance to decisions', () => {
      const decisionImportance = calculateAutoImportance(
        'Important decision made',
        'decision',
        'user'
      );
      const messageImportance = calculateAutoImportance(
        'Simple message',
        'message',
        'user'
      );
      expect(decisionImportance).toBeGreaterThan(messageImportance);
    });

    it('should give higher importance to longer content', () => {
      const longContent = 'A'.repeat(1001);
      const shortContent = 'Short';

      const longImportance = calculateAutoImportance(longContent, 'message', 'user');
      const shortImportance = calculateAutoImportance(shortContent, 'message', 'user');

      expect(longImportance).toBeGreaterThan(shortImportance);
    });

    it('should boost importance for important keywords', () => {
      const importantContent = calculateAutoImportance(
        'Ceci est important à retenir',
        'message',
        'user'
      );
      const normalContent = calculateAutoImportance('Ceci est normal', 'message', 'user');
      expect(importantContent).toBeGreaterThan(normalContent);
    });

    it('should return value between 1 and 5', () => {
      const importance = calculateAutoImportance('Test content', 'message', 'user');
      expect(importance).toBeGreaterThanOrEqual(1);
      expect(importance).toBeLessThanOrEqual(5);
    });
  });

  describe('extractAutoTags', () => {
    it('should extract significant words', () => {
      const tags = extractAutoTags('TypeScript development with React components');
      expect(tags).toContain('typescript');
      expect(tags).toContain('development');
      expect(tags).toContain('components');
    });

    it('should respect limit', () => {
      const tags = extractAutoTags(
        'One two three four five six seven eight nine ten eleven twelve',
        3
      );
      expect(tags.length).toBeLessThanOrEqual(3);
    });

    it('should include detected topic', () => {
      const tags = extractAutoTags('function myFunction() { return code; }');
      expect(tags).toContain('coding');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: VALIDATION ET FILTRAGE
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Validation', () => {
  describe('containsSensitiveData', () => {
    it('should detect passwords', () => {
      expect(containsSensitiveData('My password is secret123')).toBe(true);
      expect(containsSensitiveData('Mon mot de passe: test')).toBe(true);
    });

    it('should detect API keys', () => {
      expect(containsSensitiveData('API_KEY=abc123xyz')).toBe(true);
      expect(containsSensitiveData('apikey: sk_test_123')).toBe(true);
    });

    it('should detect private keys', () => {
      expect(containsSensitiveData('-----BEGIN RSA PRIVATE KEY-----')).toBe(true);
      expect(containsSensitiveData('ssh_key: my_private_key')).toBe(true);
    });

    it('should detect bearer tokens', () => {
      expect(containsSensitiveData('Authorization: Bearer eyJhbGc...')).toBe(true);
    });

    it('should allow normal content', () => {
      expect(containsSensitiveData('This is normal content')).toBe(false);
      expect(containsSensitiveData('Code review feedback')).toBe(false);
    });
  });

  describe('isTrivialMessage', () => {
    it('should detect greetings', () => {
      expect(isTrivialMessage('Bonjour')).toBe(true);
      expect(isTrivialMessage('Hello!')).toBe(true);
      expect(isTrivialMessage('Salut')).toBe(true);
    });

    it('should detect acknowledgments', () => {
      expect(isTrivialMessage('OK')).toBe(true);
      expect(isTrivialMessage('Merci!')).toBe(true);
      expect(isTrivialMessage("D'accord")).toBe(true);
    });

    it('should detect short messages', () => {
      expect(isTrivialMessage('Hi')).toBe(true);
      expect(isTrivialMessage('Oui')).toBe(true);
    });

    it('should allow substantial messages', () => {
      expect(isTrivialMessage("Peux-tu m'expliquer comment fonctionne React?")).toBe(
        false
      );
      expect(isTrivialMessage("J'ai besoin d'aide avec TypeScript")).toBe(false);
    });
  });

  describe('shouldSaveContent', () => {
    it('should reject sensitive data', () => {
      const result = shouldSaveContent('password: secret123');
      expect(result.save).toBe(false);
      expect(result.reason).toContain('sensibles');
    });

    it('should reject trivial messages', () => {
      const result = shouldSaveContent('OK');
      expect(result.save).toBe(false);
      expect(result.reason).toContain('trivial');
    });

    it('should reject very short content', () => {
      const result = shouldSaveContent('Sho');
      expect(result.save).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should accept valid content', () => {
      const result = shouldSaveContent(
        'This is a valid message with enough content to be saved.'
      );
      expect(result.save).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('getMemoryPermissions', () => {
    it('should return permissions for known modes', () => {
      const devPermissions = getMemoryPermissions('dev');
      expect(devPermissions.canReadSession).toBe(true);
      expect(devPermissions.canReadLongTerm).toBe(true);
      expect(devPermissions.maxImportance).toBe(5);
    });

    it('should return default permissions for unknown modes', () => {
      const defaultPerms = getMemoryPermissions('unknown_mode' as any);
      expect(defaultPerms).toEqual(DEFAULT_MEMORY_PERMISSIONS);
    });

    it('should restrict default mode', () => {
      const defaultPermissions = getMemoryPermissions('default');
      expect(defaultPermissions.canReadLongTerm).toBe(false);
      expect(defaultPermissions.maxImportance).toBe(3);
    });
  });

  describe('filterByPermissions', () => {
    it('should filter entries by level permissions', () => {
      const entries: MemoryEntry[] = [
        createMockSessionEntry() as MemoryEntry,
        createMockIntermediateEntry() as MemoryEntry,
        createMockLongTermEntry() as MemoryEntry,
      ];

      const filtered = filterByPermissions(entries, 'default');

      // default ne peut pas lire long_term
      expect(filtered.some(e => e.level === 'long_term')).toBe(false);
    });

    it('should filter entries by topic permissions', () => {
      const entries: MemoryEntry[] = [
        createMockSessionEntry({ topic: 'general' }) as MemoryEntry,
        createMockSessionEntry({ topic: 'coding' }) as MemoryEntry,
        createMockSessionEntry({ topic: 'automation' }) as MemoryEntry,
      ];

      const filtered = filterByPermissions(entries, 'default');

      // default ne peut pas accéder à coding ou automation
      expect(
        filtered.every(e => ['general', 'personal', 'creative'].includes(e.topic))
      ).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: HELPERS
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Helpers', () => {
  describe('generateAutoTitle', () => {
    it('should generate title from entries', () => {
      const entries: MemoryEntry[] = [
        createMockSessionEntry({ topic: 'coding' }) as MemoryEntry,
        createMockSessionEntry({ topic: 'coding' }) as MemoryEntry,
      ];

      const title = generateAutoTitle(entries);

      expect(title).toContain('Code');
      expect(title).toContain('2 éléments');
    });

    it('should handle empty entries', () => {
      const title = generateAutoTitle([]);
      expect(title).toBe('Résumé vide');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens based on character count', () => {
      const text = 'A'.repeat(100);
      const tokens = estimateTokens(text);
      expect(tokens).toBe(25); // ~4 chars per token
    });
  });

  describe('truncateToTokenLimit', () => {
    it('should truncate long content', () => {
      const longContent = 'A'.repeat(1000);
      const truncated = truncateToTokenLimit(longContent, 100);
      expect(truncated.length).toBeLessThan(longContent.length);
      expect(truncated.endsWith('...')).toBe(true);
    });

    it('should not truncate short content', () => {
      const shortContent = 'Short text';
      const result = truncateToTokenLimit(shortContent, 100);
      expect(result).toBe(shortContent);
    });
  });

  describe('prepareContextInjection', () => {
    it('should return empty context for empty entries', () => {
      const result = prepareContextInjection([], 'test query', 'dev');
      expect(result.context).toBe('');
      expect(result.usedEntries).toHaveLength(0);
    });

    it('should filter by permissions', () => {
      const entries: MemoryEntry[] = [
        createMockLongTermEntry({ topic: 'coding' }) as MemoryEntry,
      ];

      // default ne peut pas accéder aux topics coding
      const result = prepareContextInjection(entries, 'test', 'default');
      expect(result.usedEntries).toHaveLength(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: DÉTECTION DE DOUBLONS
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Duplicate Detection', () => {
  describe('calculateContentHash', () => {
    it('should generate consistent hash', () => {
      const content = 'Test content';
      const hash1 = calculateContentHash(content);
      const hash2 = calculateContentHash(content);
      expect(hash1).toBe(hash2);
    });

    it('should normalize whitespace', () => {
      const hash1 = calculateContentHash('Test   content');
      const hash2 = calculateContentHash('Test content');
      expect(hash1).toBe(hash2);
    });

    it('should be case insensitive', () => {
      const hash1 = calculateContentHash('TEST CONTENT');
      const hash2 = calculateContentHash('test content');
      expect(hash1).toBe(hash2);
    });
  });

  describe('areSimilarContents', () => {
    it('should detect identical content', () => {
      expect(areSimilarContents('Same content', 'Same content')).toBe(true);
    });

    it('should detect similar content', () => {
      // Les contenus doivent être très similaires avec seuil de 0.75
      // "TypeScript is a great programming language" (7 mots)
      // "TypeScript is a great programming language for web" (9 mots)
      // Similarité Jaccard = 7/9 = 0.778 > 0.75
      expect(
        areSimilarContents(
          'TypeScript is a great programming language',
          'TypeScript is a great programming language for web',
          0.75
        )
      ).toBe(true);
    });

    it('should reject dissimilar content', () => {
      expect(
        areSimilarContents('TypeScript is great', 'Python is amazing for data science')
      ).toBe(false);
    });

    it('should respect custom threshold', () => {
      const content1 = 'TypeScript programming language';
      const content2 = 'TypeScript language';

      expect(areSimilarContents(content1, content2, 0.5)).toBe(true);
      expect(areSimilarContents(content1, content2, 0.95)).toBe(false);
    });
  });

  describe('findDuplicates', () => {
    it('should find duplicate entries', () => {
      const existingEntries: MemoryEntry[] = [
        createMockSessionEntry({
          content: 'TypeScript is great for web development',
        }) as MemoryEntry,
        createMockSessionEntry({
          content: 'Python is good for data science',
        }) as MemoryEntry,
      ];

      const duplicates = findDuplicates(
        'TypeScript is great for web development',
        existingEntries
      );

      expect(duplicates).toHaveLength(1);
    });

    it('should return empty for unique content', () => {
      const existingEntries: MemoryEntry[] = [
        createMockSessionEntry({ content: 'Existing content' }) as MemoryEntry,
      ];

      const duplicates = findDuplicates(
        'Completely different content here',
        existingEntries
      );

      expect(duplicates).toHaveLength(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: AUTO-SAVE RULES
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Auto-Save Rules', () => {
  it('should have default auto-save rules', () => {
    expect(DEFAULT_AUTO_SAVE_RULES).toBeInstanceOf(Array);
    expect(DEFAULT_AUTO_SAVE_RULES.length).toBeGreaterThan(0);
  });

  it('should have session messages rule', () => {
    const sessionRule = DEFAULT_AUTO_SAVE_RULES.find(
      r => r.id === 'auto_session_messages'
    );
    expect(sessionRule).toBeDefined();
    expect(sessionRule?.targetLevel).toBe('session');
    expect(sessionRule?.enabled).toBe(true);
  });

  it('should have code snippets rule', () => {
    const codeRule = DEFAULT_AUTO_SAVE_RULES.find(r => r.id === 'auto_code_snippets');
    expect(codeRule).toBeDefined();
    expect(codeRule?.contentType).toBe('code_snippet');
    expect(codeRule?.applicableModes).toContain('dev');
  });

  it('should have daily summary rule', () => {
    const summaryRule = DEFAULT_AUTO_SAVE_RULES.find(r => r.id === 'auto_daily_summary');
    expect(summaryRule).toBeDefined();
    expect(summaryRule?.contentType).toBe('summary');
    expect(summaryRule?.autoSummarize).toBe(true);
  });

  it('should have decisions rule', () => {
    const decisionRule = DEFAULT_AUTO_SAVE_RULES.find(r => r.id === 'auto_decisions');
    expect(decisionRule).toBeDefined();
    expect(decisionRule?.targetLevel).toBe('long_term');
    expect(decisionRule?.defaultImportance).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: MODE PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Mode Permissions', () => {
  describe('dev mode', () => {
    it('should have full read access', () => {
      const perms = MODE_MEMORY_PERMISSIONS['dev'];
      expect(perms?.canReadSession).toBe(true);
      expect(perms?.canReadIntermediate).toBe(true);
      expect(perms?.canReadLongTerm).toBe(true);
    });

    it('should have high context injection limit', () => {
      const perms = MODE_MEMORY_PERMISSIONS['dev'];
      expect(perms?.contextInjectionLimit).toBeGreaterThanOrEqual(2000);
    });
  });

  describe('default mode', () => {
    it('should have limited read access', () => {
      const perms = MODE_MEMORY_PERMISSIONS['default'];
      expect(perms?.canReadSession).toBe(true);
      expect(perms?.canReadIntermediate).toBe(true);
      expect(perms?.canReadLongTerm).toBe(false);
    });

    it('should have limited topics', () => {
      const perms = MODE_MEMORY_PERMISSIONS['default'];
      expect(perms?.allowedTopics).toContain('general');
      expect(perms?.allowedTopics).not.toContain('coding');
      expect(perms?.allowedTopics).not.toContain('automation');
    });
  });

  describe('admin mode', () => {
    it('should have full access', () => {
      const perms = MODE_MEMORY_PERMISSIONS['admin'];
      expect(perms?.canReadSession).toBe(true);
      expect(perms?.canReadIntermediate).toBe(true);
      expect(perms?.canReadLongTerm).toBe(true);
      expect(perms?.maxImportance).toBe(5);
    });

    it('should have access to all topics', () => {
      const perms = MODE_MEMORY_PERMISSIONS['admin'];
      const allTopics = Object.keys(MEMORY_TOPIC_LABELS);
      allTopics.forEach(topic => {
        expect(perms?.allowedTopics).toContain(topic);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: BLACKLIST PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Blacklist Patterns', () => {
  it('should have blacklist patterns defined', () => {
    expect(MEMORY_BLACKLIST_PATTERNS).toBeInstanceOf(Array);
    expect(MEMORY_BLACKLIST_PATTERNS.length).toBeGreaterThan(0);
  });

  it('should match password patterns', () => {
    const hasPasswordPattern = MEMORY_BLACKLIST_PATTERNS.some(p =>
      p.test('password: test123')
    );
    expect(hasPasswordPattern).toBe(true);
  });

  it('should match API key patterns', () => {
    const hasApiKeyPattern = MEMORY_BLACKLIST_PATTERNS.some(p =>
      p.test('api_key=abc123')
    );
    expect(hasApiKeyPattern).toBe(true);
  });

  it('should have excluded message patterns', () => {
    expect(EXCLUDED_MESSAGE_PATTERNS).toBeInstanceOf(Array);
    expect(EXCLUDED_MESSAGE_PATTERNS.length).toBeGreaterThan(0);
  });

  it('should match simple greetings', () => {
    const matchesGreeting = EXCLUDED_MESSAGE_PATTERNS.some(p => p.test('Bonjour!'));
    expect(matchesGreeting).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS: MEMORY UTILS EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Persistent Memory - Utils Exports', () => {
  it('should export memoryUtils object', () => {
    expect(memoryUtils).toBeDefined();
  });

  it('should have all scoring functions', () => {
    expect(memoryUtils.calculateRelevanceScore).toBeDefined();
    expect(memoryUtils.calculateTFIDFScore).toBeDefined();
    expect(memoryUtils.rankByRelevance).toBeDefined();
  });

  it('should have all classification functions', () => {
    expect(memoryUtils.classifyTopic).toBeDefined();
    expect(memoryUtils.classifyContentType).toBeDefined();
    expect(memoryUtils.calculateAutoImportance).toBeDefined();
    expect(memoryUtils.extractAutoTags).toBeDefined();
  });

  it('should have all validation functions', () => {
    expect(memoryUtils.containsSensitiveData).toBeDefined();
    expect(memoryUtils.isTrivialMessage).toBeDefined();
    expect(memoryUtils.shouldSaveContent).toBeDefined();
    expect(memoryUtils.getMemoryPermissions).toBeDefined();
    expect(memoryUtils.filterByPermissions).toBeDefined();
  });

  it('should have all helper functions', () => {
    expect(memoryUtils.generateAutoTitle).toBeDefined();
    expect(memoryUtils.estimateTokens).toBeDefined();
    expect(memoryUtils.truncateToTokenLimit).toBeDefined();
    expect(memoryUtils.prepareContextInjection).toBeDefined();
  });

  it('should have all duplicate detection functions', () => {
    expect(memoryUtils.calculateContentHash).toBeDefined();
    expect(memoryUtils.areSimilarContents).toBeDefined();
    expect(memoryUtils.findDuplicates).toBeDefined();
  });
});
