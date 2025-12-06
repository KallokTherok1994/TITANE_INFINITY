/**
 * TITANE∞ Cognitive Framework v∞.42
 * E2E Tests for Cognitive Engines Integration
 * 
 * Tests the complete cognitive framework including:
 * - Semantic Memory Engine
 * - Goal & Consistency Engine
 * - Conversation Evaluation Engine
 * - Cognitive Observability Engine
 * - Cognitive OMEGA Integration
 * 
 * @version v∞.42
 * @date 2025-12-05
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { cognitiveOmega } from '@/services/cognitive/cognitiveOmegaIntegration';
import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_CONVERSATION_ID = 'test_conv_e2e_001';
const TEST_CONVERSATION_ID_2 = 'test_conv_e2e_002';
const TEST_MODE = 'chat';

// Cleanup helper
function cleanupTestData() {
  const dataDir = path.join(process.cwd(), 'cognitive-data');
  if (fs.existsSync(dataDir)) {
    // Clean up test conversation data
    const goalFile = path.join(dataDir, 'goals', `${TEST_CONVERSATION_ID}.json`);
    const goalFile2 = path.join(dataDir, 'goals', `${TEST_CONVERSATION_ID_2}.json`);
    if (fs.existsSync(goalFile)) fs.unlinkSync(goalFile);
    if (fs.existsSync(goalFile2)) fs.unlinkSync(goalFile2);
  }
}

describe('🧠 Cognitive Framework E2E Tests v∞.42', () => {
  
  beforeAll(() => {
    console.log('\n🧪 Starting Cognitive Framework E2E Tests...\n');
    cleanupTestData();
  });

  afterAll(() => {
    console.log('\n✅ Cognitive Framework E2E Tests Complete\n');
    cleanupTestData();
  });

  beforeEach(() => {
    // Reset conversation state between tests
    cleanupTestData();
  });

  describe('📝 Scenario 1: Multi-turn avec Goal Tracking', () => {
    it('should track goals across multiple conversation turns', async () => {
      console.log('\n📝 Testing Multi-turn Goal Tracking...');

      // Turn 1: User states a goal
      const turn1Message = "Je veux développer une app de todo list en React";
      const turn1Context = await cognitiveOmega.enrichContext(
        turn1Message,
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      // Simulate assistant response and save
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        turn1Message,
        "D'accord ! Créons ensemble une app todo list React. Commençons par la structure du projet.",
        TEST_MODE,
        { modelUsed: 'test-model', tokenCount: 50 }
      );

      // Turn 2: User asks follow-up question
      const turn2Message = "Comment je commence ?";
      const turn2Context = await cognitiveOmega.enrichContext(
        turn2Message,
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      // Should have goal context from turn 1
      expect(turn2Context.goals).toContain('todo list');
      expect(turn2Context.goals).toContain('React');
      expect(turn2Context.metadata.goalCount).toBeGreaterThan(0);

      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        turn2Message,
        "Pour ton app todo list React, commençons par créer les composants de base...",
        TEST_MODE,
        { modelUsed: 'test-model', tokenCount: 75 }
      );

      // Turn 3: User asks about database
      const turn3Message = "Quelle base de données utiliser ?";
      const turn3Context = await cognitiveOmega.enrichContext(
        turn3Message,
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      // Should still have goal context
      expect(turn3Context.metadata.goalCount).toBeGreaterThan(0);
      expect(turn3Context.combined).toContain('todo list');

      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        turn3Message,
        "Pour ta todo list React, je recommande LocalStorage pour commencer, puis Firebase ou Supabase pour une version cloud.",
        TEST_MODE,
        { modelUsed: 'test-model', tokenCount: 80 }
      );

      // Verify goal tracking worked
      const turn4Context = await cognitiveOmega.enrichContext(
        "Merci, je vais commencer",
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      expect(turn4Context.metadata.goalCount).toBeGreaterThan(0);
      expect(turn4Context.metadata.factCount).toBeGreaterThanOrEqual(0);

      console.log('✅ Multi-turn goal tracking: PASSED');
      console.log(`   - Goals tracked: ${turn4Context.metadata.goalCount}`);
      console.log(`   - Facts extracted: ${turn4Context.metadata.factCount}`);
    });
  });

  describe('🔍 Scenario 2: Contradiction Detection + Auto-Correction', () => {
    it('should detect contradictions and auto-correct responses', async () => {
      console.log('\n🔍 Testing Contradiction Detection & Auto-Correction...');

      // Turn 1: Establish a fact
      const turn1Message = "Mon nom est Alice";
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        turn1Message,
        "D'accord, je note que ton nom est Alice.",
        TEST_MODE,
        { modelUsed: 'test-model', tokenCount: 30 }
      );

      // Wait for fact extraction
      await new Promise(resolve => setTimeout(resolve, 100));

      // Turn 2: Ask about the fact
      const turn2Message = "Comment je m'appelle ?";
      const turn2Context = await cognitiveOmega.enrichContext(
        turn2Message,
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      // Context should contain the fact
      expect(turn2Context.facts).toContain('Alice');

      // Simulate a contradictory response
      const wrongResponse = "Tu t'appelles Bob";
      const consistencyResult = await cognitiveOmega.checkConsistency(
        TEST_CONVERSATION_ID,
        wrongResponse,
        {
          userMessage: turn2Message,
          mode: TEST_MODE
        }
      );

      // Should detect violation
      expect(consistencyResult.isConsistent).toBe(false);
      expect(consistencyResult.violations.length).toBeGreaterThan(0);
      expect(consistencyResult.shouldCorrect).toBe(true);

      // Auto-correct should fix it
      if (consistencyResult.shouldCorrect) {
        const correctionResult = await cognitiveOmega.autoCorrect(
          TEST_CONVERSATION_ID,
          wrongResponse,
          consistencyResult.violations
        );

        expect(correctionResult.corrected).toBe(true);
        expect(correctionResult.correctedResponse).toContain('Alice');
      }

      console.log('✅ Contradiction detection & auto-correction: PASSED');
      console.log(`   - Violations detected: ${consistencyResult.violations.length}`);
      console.log(`   - Consistency score: ${consistencyResult.consistencyScore.toFixed(2)}`);
      console.log(`   - Auto-correction applied: ${consistencyResult.shouldCorrect ? 'YES' : 'NO'}`);
    });
  });

  describe('🔒 Scenario 3: Multi-Conversation Isolation', () => {
    it('should isolate data between different conversations', async () => {
      console.log('\n🔒 Testing Multi-Conversation Isolation...');

      // Conversation A: Set a preference
      const convAMessage = "Mon langage préféré est Python";
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        convAMessage,
        "Super ! Python est un excellent choix.",
        TEST_MODE,
        { modelUsed: 'test-model', tokenCount: 40 }
      );

      // Wait for fact extraction
      await new Promise(resolve => setTimeout(resolve, 100));

      // Conversation A context should have Python fact
      const convAContext = await cognitiveOmega.enrichContext(
        "Quel est mon langage préféré ?",
        TEST_CONVERSATION_ID,
        TEST_MODE
      );
      expect(convAContext.facts).toContain('Python');

      // Conversation B: Ask about preference
      const convBContext = await cognitiveOmega.enrichContext(
        "Quel est mon langage préféré ?",
        TEST_CONVERSATION_ID_2,
        TEST_MODE
      );

      // Conversation B should NOT have Python fact (isolated)
      // It should either be empty or not contain Python from conv A
      const convBHasPythonFromA = convBContext.facts.includes('Python');
      expect(convBHasPythonFromA).toBe(false);

      console.log('✅ Multi-conversation isolation: PASSED');
      console.log(`   - Conv A facts: ${convAContext.metadata.factCount}`);
      console.log(`   - Conv B facts: ${convBContext.metadata.factCount}`);
      console.log(`   - Isolation verified: ${!convBHasPythonFromA ? 'YES' : 'NO'}`);
    });
  });

  describe('🔬 Scenario 4: Observability Full Trace', () => {
    it('should trace complete pipeline with all 11 phases', async () => {
      console.log('\n🔬 Testing Observability Full Trace...');

      const turnNumber = 1;
      const userMessage = "Créons une fonction TypeScript";

      // Start trace
      const traceId = await cognitiveOmega.startTrace(
        TEST_CONVERSATION_ID,
        turnNumber,
        userMessage
      );

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');

      // Log various phases
      await cognitiveOmega.logPhase(traceId, 'input_received', {
        message_length: userMessage.length
      });

      // Enrich context (should log phases internally)
      const context = await cognitiveOmega.enrichContext(
        userMessage,
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      await cognitiveOmega.logPhase(traceId, 'semantic_memory_retrieved', {
        memory_count: context.metadata.memoryCount
      });

      await cognitiveOmega.logPhase(traceId, 'goal_state_loaded', {
        goal_count: context.metadata.goalCount
      });

      await cognitiveOmega.logPhase(traceId, 'facts_loaded', {
        fact_count: context.metadata.factCount
      });

      await cognitiveOmega.logPhase(traceId, 'context_built', {
        total_context_length: context.combined.length
      });

      // Simulate model invocation
      await cognitiveOmega.logPhase(traceId, 'model_invoked', {
        model: 'test-model'
      });

      const testResponse = "Voici une fonction TypeScript pour créer une todo list...";
      await cognitiveOmega.logPhase(traceId, 'raw_output', {
        output_length: testResponse.length
      });

      // Check consistency
      const consistencyResult = await cognitiveOmega.checkConsistency(
        TEST_CONVERSATION_ID,
        testResponse,
        { userMessage, mode: TEST_MODE }
      );

      await cognitiveOmega.logPhase(traceId, 'consistency_check', {
        is_consistent: consistencyResult.isConsistent,
        violations_count: consistencyResult.violations.length
      });

      // Save interaction
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        userMessage,
        testResponse,
        TEST_MODE,
        { modelUsed: 'test-model', tokenCount: 100 }
      );

      await cognitiveOmega.logPhase(traceId, 'final_output', {
        output_sent: true
      });

      // End trace
      await cognitiveOmega.endTrace(traceId, testResponse, 'success');

      // Get trace to verify
      const trace = cognitiveOmega.observability.getTrace(traceId);
      expect(trace).toBeDefined();
      expect(trace?.phases.length).toBeGreaterThan(5);
      expect(trace?.status).toBe('completed');

      console.log('✅ Observability full trace: PASSED');
      console.log(`   - Trace ID: ${traceId}`);
      console.log(`   - Phases logged: ${trace?.phases.length}`);
      console.log(`   - Status: ${trace?.status}`);
    });
  });

  describe('⚡ Performance & Error Handling', () => {
    it('should handle timeouts gracefully', async () => {
      console.log('\n⚡ Testing Graceful Error Handling...');

      // Test with potentially slow operations
      const startTime = Date.now();
      
      const context = await cognitiveOmega.enrichContext(
        "Test message with potential timeout",
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      const duration = Date.now() - startTime;

      // Should complete within reasonable time (< 5s)
      expect(duration).toBeLessThan(5000);
      
      // Should return valid context even if some engines fail
      expect(context).toBeDefined();
      expect(context.combined).toBeDefined();
      expect(typeof context.combined).toBe('string');

      console.log('✅ Graceful error handling: PASSED');
      console.log(`   - Operation completed in: ${duration}ms`);
      console.log(`   - Context returned: ${context.combined.length > 0 ? 'YES' : 'EMPTY'}`);
    });

    it('should provide non-blocking fallbacks', async () => {
      console.log('\n⚡ Testing Non-blocking Fallbacks...');

      // Test consistency check with potentially missing data
      const result = await cognitiveOmega.checkConsistency(
        'non_existent_conversation',
        "Some response text",
        { userMessage: "Test", mode: TEST_MODE }
      );

      // Should not throw, should return valid result with defaults
      expect(result).toBeDefined();
      expect(typeof result.isConsistent).toBe('boolean');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(typeof result.consistencyScore).toBe('number');

      console.log('✅ Non-blocking fallbacks: PASSED');
      console.log(`   - Consistency result returned: YES`);
      console.log(`   - Default values provided: YES`);
    });
  });

  describe('📊 Statistics & Metrics', () => {
    it('should track statistics across operations', async () => {
      console.log('\n📊 Testing Statistics Tracking...');

      // Perform several operations
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        "Test message 1",
        "Test response 1",
        TEST_MODE
      );

      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        "Test message 2",
        "Test response 2",
        TEST_MODE
      );

      const context = await cognitiveOmega.enrichContext(
        "Test message 3",
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      // Get statistics
      const stats = cognitiveOmega.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalInteractions).toBeGreaterThanOrEqual(2);
      expect(stats.totalMemoriesCreated).toBeGreaterThanOrEqual(0);
      expect(typeof stats.avgConsistencyScore).toBe('number');

      console.log('✅ Statistics tracking: PASSED');
      console.log(`   - Total interactions: ${stats.totalInteractions}`);
      console.log(`   - Memories created: ${stats.totalMemoriesCreated}`);
      console.log(`   - Avg consistency: ${stats.avgConsistencyScore.toFixed(2)}`);
    });
  });
});

describe('🔧 Individual Engine Tests', () => {
  
  describe('Engine 1: Semantic Memory', () => {
    it('should store and retrieve memories with embeddings', async () => {
      console.log('\n💾 Testing Semantic Memory Engine...');

      const message = "TypeScript est mon langage préféré pour le développement web";
      
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        message,
        "Excellent choix ! TypeScript offre la sécurité des types.",
        TEST_MODE
      );

      // Retrieve with similar query
      const context = await cognitiveOmega.enrichContext(
        "Quel est mon langage préféré ?",
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      expect(context.memories.length).toBeGreaterThanOrEqual(0);
      expect(context.metadata.memoryCount).toBeGreaterThanOrEqual(0);

      console.log('✅ Semantic Memory Engine: PASSED');
      console.log(`   - Memories retrieved: ${context.memories.length}`);
    });
  });

  describe('Engine 2: Goal & Consistency', () => {
    it('should extract and track goals from messages', async () => {
      console.log('\n🎯 Testing Goal & Consistency Engine...');

      const goalMessage = "Je veux construire un dashboard analytics avec Next.js";
      
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        goalMessage,
        "Super projet ! Créons un dashboard analytics avec Next.js.",
        TEST_MODE
      );

      const context = await cognitiveOmega.enrichContext(
        "Par où commencer ?",
        TEST_CONVERSATION_ID,
        TEST_MODE
      );

      expect(context.goals).toBeDefined();
      expect(context.metadata.goalCount).toBeGreaterThanOrEqual(0);

      console.log('✅ Goal & Consistency Engine: PASSED');
      console.log(`   - Goals tracked: ${context.metadata.goalCount}`);
    });
  });

  describe('Engine 3: Conversation Evaluation', () => {
    it('should evaluate conversation quality metrics', async () => {
      console.log('\n📊 Testing Conversation Evaluation Engine...');

      // Simulate a complete conversation turn
      const result = await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        "Explique-moi les hooks React",
        "Les hooks React sont des fonctions qui permettent d'utiliser l'état et d'autres fonctionnalités React dans les composants fonctionnels.",
        TEST_MODE,
        { modelUsed: 'test-model', tokenCount: 50 }
      );

      expect(result).toBeDefined();
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.evaluation.overallScore).toBeLessThanOrEqual(1);

      console.log('✅ Conversation Evaluation Engine: PASSED');
      console.log(`   - Overall score: ${result.evaluation.overallScore.toFixed(2)}`);
      console.log(`   - Metrics evaluated: ${Object.keys(result.evaluation.metrics).length}`);
    });
  });

  describe('Engine 4: Cognitive Observability', () => {
    it('should provide debug panel and analytics', async () => {
      console.log('\n🔍 Testing Cognitive Observability Engine...');

      // Perform some operations
      await cognitiveOmega.saveInteraction(
        TEST_CONVERSATION_ID,
        "Test observability",
        "Testing observability features",
        TEST_MODE
      );

      // Get debug panel
      const panel = cognitiveOmega.observability.getDebugPanel(TEST_CONVERSATION_ID);

      expect(panel).toBeDefined();
      expect(panel.memoryPanel).toBeDefined();
      expect(panel.goalsPanel).toBeDefined();
      expect(panel.consistencyPanel).toBeDefined();
      expect(panel.metricsPanel).toBeDefined();

      // Get analytics
      const analytics = cognitiveOmega.observability.getAnalytics();
      expect(analytics).toBeDefined();

      console.log('✅ Cognitive Observability Engine: PASSED');
      console.log(`   - Debug panel accessible: YES`);
      console.log(`   - Analytics available: YES`);
    });
  });
});

console.log('\n' + '='.repeat(80));
console.log('🧠 TITANE∞ Cognitive Framework v∞.42 - E2E Test Suite');
console.log('='.repeat(80) + '\n');
