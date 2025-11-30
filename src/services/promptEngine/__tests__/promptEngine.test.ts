/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Tests Unitaires
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// =============================================================================
// INTENT PARSER TESTS
// =============================================================================

describe('IntentParser', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let IntentParser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parser: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../intentParser');
    IntentParser = module.IntentParser;
    IntentParser.resetInstance();
    parser = IntentParser.getInstance();
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const instance1 = IntentParser.getInstance();
      const instance2 = IntentParser.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance', () => {
      const instance1 = IntentParser.getInstance();
      IntentParser.resetInstance();
      const instance2 = IntentParser.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Intent Parsing', () => {
    it('should parse a question', () => {
      const result = parser.parseIntent('Comment fonctionne ce système ?');
      expect(result.category).toBe('question');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.parsed.primary).toBe('question');
    });

    it('should parse a command', () => {
      const result = parser.parseIntent('Créé un nouveau fichier test.ts');
      expect(['command', 'creation']).toContain(result.category);
    });

    it('should parse a search query', () => {
      const result = parser.parseIntent('Cherche des informations sur React');
      expect(result.category).toBe('search');
    });

    it('should detect entities', () => {
      const result = parser.parseIntent('Ouvre le fichier test.ts dans /src/components');
      expect(result.parsed.entities.length).toBeGreaterThan(0);
      const fileEntity = result.parsed.entities.find((e: { type: string }) => e.type === 'file');
      expect(fileEntity).toBeDefined();
    });

    it('should calculate complexity', () => {
      const simpleResult = parser.parseIntent('Salut');
      const complexResult = parser.parseIntent('Analyse le code backend et optimise les performances de la base de données en utilisant des algorithmes avancés pour l\'architecture système');

      expect(complexResult.parsed.complexity).toBeGreaterThan(simpleResult.parsed.complexity);
    });

    it('should detect urgency', () => {
      const normalResult = parser.parseIntent('Peux-tu m\'aider ?');
      const urgentResult = parser.parseIntent('URGENT! J\'ai besoin d\'aide immédiatement!!!');

      expect(urgentResult.parsed.urgency).toBeGreaterThan(normalResult.parsed.urgency);
    });

    it('should analyze sentiment', () => {
      const positiveResult = parser.parseIntent('Merci beaucoup, c\'est excellent !');
      const negativeResult = parser.parseIntent('Il y a un problème, erreur critique');

      expect(positiveResult.parsed.sentiment).toBeGreaterThan(0);
      expect(negativeResult.parsed.sentiment).toBeLessThan(0);
    });

    it('should suggest mode', () => {
      const result = parser.parseIntent('Analyse l\'architecture système complète');
      expect(['dev', 'architect']).toContain(result.suggestedMode);
    });

    it('should extract keywords', () => {
      const result = parser.parseIntent('Comment optimiser les performances React');
      expect(result.parsed.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Methods', () => {
    it('should quick categorize', () => {
      const category = parser.quickCategorize('Qu\'est-ce que TypeScript ?');
      expect(category).toBe('question');
    });

    it('should detect question', () => {
      expect(parser.isQuestion('Comment ça marche ?')).toBe(true);
      expect(parser.isQuestion('Fais cela')).toBe(false);
    });

    it('should detect command', () => {
      expect(parser.isCommand('Créé un fichier')).toBe(true);
      expect(parser.isCommand('Salut')).toBe(false);
    });
  });

  describe('Caching', () => {
    it('should cache results', () => {
      const input = 'Test de cache';
      parser.parseIntent(input);
      const stats1 = parser.getStats();

      parser.parseIntent(input);
      const stats2 = parser.getStats();

      expect(stats2.cacheHits).toBe(stats1.cacheHits + 1);
    });

    it('should clear cache', () => {
      parser.parseIntent('Test');
      parser.clearCache();
      const stats = parser.getStats();
      expect(stats.cacheHits).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track stats', () => {
      parser.parseIntent('Test 1');
      parser.parseIntent('Test 2');

      const stats = parser.getStats();
      expect(stats.totalParsed).toBe(2);
    });

    it('should reset stats', () => {
      parser.parseIntent('Test');
      parser.resetStats();

      const stats = parser.getStats();
      expect(stats.totalParsed).toBe(0);
    });
  });
});

// =============================================================================
// CONTEXT COLLECTOR TESTS
// =============================================================================

describe('ContextCollector', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ContextCollector: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let collector: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../contextCollector');
    ContextCollector = module.ContextCollector;
    ContextCollector.resetInstance();
    collector = ContextCollector.getInstance();
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const instance1 = ContextCollector.getInstance();
      const instance2 = ContextCollector.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = collector.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.timeout).toBeGreaterThan(0);
    });

    it('should allow configuration updates', () => {
      collector.configure({ timeout: 10000 });
      const config = collector.getConfig();
      expect(config.timeout).toBe(10000);
    });
  });

  describe('Source Management', () => {
    it('should list available sources', () => {
      const sources = collector.getAvailableSources();
      expect(sources.length).toBeGreaterThan(0);
      expect(sources).toContain('memory_session');
    });

    it('should check source availability', () => {
      expect(collector.isSourceAvailable('memory_session')).toBe(true);
      expect(collector.isSourceAvailable('invalid_source')).toBe(false);
    });

    it('should get source priority', () => {
      const priority = collector.getSourcePriority('memory_session');
      expect(priority).toBeGreaterThan(0);
    });
  });

  describe('Collection', () => {
    it('should collect all context', async () => {
      const results = await collector.collectAll('standard');
      expect(results).toBeInstanceOf(Map);
      expect(results.has('physical')).toBe(true);
      expect(results.has('cognitive')).toBe(true);
    });

    it('should collect from specific sources', async () => {
      const results = await collector.collectFromSources(['memory_session'], 'standard');
      expect(results).toBeInstanceOf(Map);
    });
  });

  describe('Caching', () => {
    it('should cache results', async () => {
      await collector.collectAll('standard');
      const stats1 = collector.getStats();

      await collector.collectAll('standard');
      const stats2 = collector.getStats();

      expect(stats2.cacheHits).toBeGreaterThan(stats1.cacheHits);
    });

    it('should clear cache', () => {
      collector.clearCache();
      // Should not throw
      expect(true).toBe(true);
    });

    it('should invalidate specific cache', () => {
      collector.invalidateCache('memory_session');
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should track stats', async () => {
      await collector.collectAll('standard');
      const stats = collector.getStats();
      expect(stats.totalCollections).toBeGreaterThan(0);
    });

    it('should reset stats', () => {
      collector.resetStats();
      const stats = collector.getStats();
      expect(stats.totalCollections).toBe(0);
    });
  });
});

// =============================================================================
// PROMPT ASSEMBLER TESTS
// =============================================================================

describe('PromptAssembler', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let PromptAssembler: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let assembler: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../promptAssembler');
    PromptAssembler = module.PromptAssembler;
    PromptAssembler.resetInstance();
    assembler = PromptAssembler.getInstance();
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const instance1 = PromptAssembler.getInstance();
      const instance2 = PromptAssembler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default config', () => {
      const config = assembler.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.defaultMode).toBe('standard');
    });

    it('should allow configuration updates', () => {
      assembler.configure({ defaultMode: 'dev' });
      const config = assembler.getConfig();
      expect(config.defaultMode).toBe('dev');
    });
  });

  describe('Prompt Assembly', () => {
    it('should assemble a prompt', async () => {
      const request = {
        id: 'test_1',
        userInput: 'Comment ça marche ?',
        mode: 'standard',
        timestamp: Date.now(),
      };

      const response = await assembler.assemblePrompt(request);
      expect(response.success).toBe(true);
      expect(response.prompt).toBeDefined();
    });

    it('should include all 9 sections', async () => {
      const request = {
        id: 'test_2',
        userInput: 'Aide-moi avec mon code',
        mode: 'dev',
        timestamp: Date.now(),
      };

      const response = await assembler.assemblePrompt(request);
      expect(response.success).toBe(true);
      expect(response.prompt?.sections.length).toBe(9);
    });

    it('should validate request', async () => {
      const invalidRequest = {
        id: '',
        userInput: '',
        timestamp: Date.now(),
      };

      const response = await assembler.assemblePrompt(invalidRequest);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should include metadata', async () => {
      const request = {
        id: 'test_3',
        userInput: 'Test',
        timestamp: Date.now(),
      };

      const response = await assembler.assemblePrompt(request);
      expect(response.prompt?.metadata).toBeDefined();
      expect(response.prompt?.metadata.mode).toBeDefined();
    });

    it('should calculate token count', async () => {
      const request = {
        id: 'test_4',
        userInput: 'Test prompt',
        timestamp: Date.now(),
      };

      const response = await assembler.assemblePrompt(request);
      expect(response.prompt?.tokenCount).toBeGreaterThan(0);
    });
  });

  describe('Quick Parse', () => {
    it('should quick parse intent', () => {
      const intent = assembler.quickParseIntent('Qu\'est-ce que c\'est ?');
      expect(intent.category).toBe('question');
    });
  });

  describe('Audit Log', () => {
    it('should maintain audit log', async () => {
      await assembler.assemblePrompt({
        id: 'audit_test',
        userInput: 'Test',
        timestamp: Date.now(),
      });

      const auditLog = assembler.getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);
    });

    it('should clear audit log', () => {
      assembler.clearAuditLog();
      const auditLog = assembler.getAuditLog();
      expect(auditLog.length).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track stats', async () => {
      await assembler.assemblePrompt({
        id: 'stats_test',
        userInput: 'Test',
        timestamp: Date.now(),
      });

      const stats = assembler.getStats();
      expect(stats.totalPrompts).toBeGreaterThan(0);
      expect(stats.successfulPrompts).toBeGreaterThan(0);
    });

    it('should reset stats', () => {
      assembler.resetStats();
      const stats = assembler.getStats();
      expect(stats.totalPrompts).toBe(0);
    });
  });
});

// =============================================================================
// PROMPT ENGINE ORCHESTRATOR TESTS
// =============================================================================

describe('PromptEngineOrchestrator', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let PromptEngineOrchestrator: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let engine: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../index');
    PromptEngineOrchestrator = module.PromptEngineOrchestrator;
    PromptEngineOrchestrator.resetInstance();
    engine = PromptEngineOrchestrator.getInstance();
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const instance1 = PromptEngineOrchestrator.getInstance();
      const instance2 = PromptEngineOrchestrator.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset all instances', () => {
      const instance1 = PromptEngineOrchestrator.getInstance();
      PromptEngineOrchestrator.resetInstance();
      const instance2 = PromptEngineOrchestrator.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize', async () => {
      await engine.initialize();
      const status = engine.getStatus();
      expect(status.initialized).toBe(true);
    });

    it('should accept config during init', async () => {
      await engine.initialize({ defaultMode: 'architect' });
      expect(true).toBe(true); // No error
    });
  });

  describe('Mode Management', () => {
    it('should default to standard mode', () => {
      expect(engine.getMode()).toBe('standard');
    });

    it('should set mode', () => {
      engine.setMode('dev');
      expect(engine.getMode()).toBe('dev');
    });
  });

  describe('Prompt Generation', () => {
    it('should generate prompt', async () => {
      const response = await engine.generatePrompt('Test question ?');
      expect(response.success).toBe(true);
    });

    it('should generate with specific mode', async () => {
      const response = await engine.generatePrompt('Test', 'architect');
      expect(response.prompt?.metadata.mode).toBe('architect');
    });

    it('should generate advanced prompt', async () => {
      const response = await engine.generatePromptAdvanced({
        id: 'advanced_1',
        userInput: 'Test avancé',
        mode: 'dev',
        timestamp: Date.now(),
        options: { debugInfo: true },
      });

      expect(response.success).toBe(true);
      expect(response.debug).toBeDefined();
    });
  });

  describe('Sub-module Access', () => {
    it('should access intent parser', () => {
      const parser = engine.getIntentParser();
      expect(parser).toBeDefined();
      expect(typeof parser.parseIntent).toBe('function');
    });

    it('should access context collector', () => {
      const collector = engine.getContextCollector();
      expect(collector).toBeDefined();
      expect(typeof collector.collectAll).toBe('function');
    });

    it('should access prompt assembler', () => {
      const assembler = engine.getPromptAssembler();
      expect(assembler).toBeDefined();
      expect(typeof assembler.assemblePrompt).toBe('function');
    });
  });

  describe('Quick Methods', () => {
    it('should parse intent', () => {
      const intent = engine.parseIntent('Comment faire ?');
      expect(intent.category).toBe('question');
    });

    it('should quick categorize', () => {
      const category = engine.quickCategorize('Créé un fichier');
      expect(['command', 'creation']).toContain(category);
    });
  });

  describe('Statistics', () => {
    it('should get combined stats', () => {
      const stats = engine.getStats();
      expect(stats.intent).toBeDefined();
      expect(stats.collector).toBeDefined();
      expect(stats.assembler).toBeDefined();
    });

    it('should reset all stats', () => {
      engine.resetStats();
      const stats = engine.getStats();
      expect(stats.intent.totalParsed).toBe(0);
    });

    it('should clear all caches', () => {
      engine.clearCaches();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Status', () => {
    it('should return status', async () => {
      await engine.initialize();
      const status = engine.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.mode).toBeDefined();
      expect(status.healthy).toBe(true);
    });
  });
});

// =============================================================================
// CONFIGURATION TESTS
// =============================================================================

describe('Prompt Engine Configuration', () => {
  it('should export default configs', async () => {
    const config = await import('../promptEngine.config');

    expect(config.DEFAULT_LAYER_METADATA).toBeDefined();
    expect(config.DEFAULT_MODE_PROFILES).toBeDefined();
    expect(config.DEFAULT_PROMPT_ENGINE_CONFIG).toBeDefined();
    expect(config.PROMPT_SECTION_NAMES).toBeDefined();
  });

  it('should have all 6 layers', async () => {
    const config = await import('../promptEngine.config');

    const layers = Object.keys(config.DEFAULT_LAYER_METADATA);
    expect(layers).toContain('physical');
    expect(layers).toContain('cognitive');
    expect(layers).toContain('symbolic');
    expect(layers).toContain('adaptive');
    expect(layers).toContain('meta');
    expect(layers).toContain('singularity');
  });

  it('should have all 4 modes', async () => {
    const config = await import('../promptEngine.config');

    const modes = Object.keys(config.DEFAULT_MODE_PROFILES);
    expect(modes).toContain('standard');
    expect(modes).toContain('dev');
    expect(modes).toContain('architect');
    expect(modes).toContain('autonomous');
  });

  it('should have 9 prompt sections', async () => {
    const config = await import('../promptEngine.config');

    const sections = Object.keys(config.PROMPT_SECTION_NAMES);
    expect(sections.length).toBe(9);
  });

  it('should have utility functions', async () => {
    const config = await import('../promptEngine.config');

    expect(typeof config.generateContextId).toBe('function');
    expect(typeof config.hashContent).toBe('function');
    expect(typeof config.estimateTokens).toBe('function');
    expect(typeof config.validatePromptRequest).toBe('function');
  });

  it('should estimate tokens', async () => {
    const config = await import('../promptEngine.config');

    const tokens = config.estimateTokens('Hello world test');
    expect(tokens).toBeGreaterThan(0);
  });

  it('should generate unique IDs', async () => {
    const config = await import('../promptEngine.config');

    const id1 = config.generateContextId('test');
    const id2 = config.generateContextId('test');
    expect(id1).not.toBe(id2);
  });

  it('should validate prompt request', async () => {
    const config = await import('../promptEngine.config');

    const validResult = config.validatePromptRequest({
      id: 'test',
      userInput: 'Hello',
      timestamp: Date.now(),
    });
    expect(validResult.valid).toBe(true);

    const invalidResult = config.validatePromptRequest({
      id: '',
      userInput: '',
      timestamp: Date.now(),
    });
    expect(invalidResult.valid).toBe(false);
  });
});
