/**
 * TITANE_INFINITY v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — CONSISTENCY ENGINE TESTS (Phase 9)
 *   Tests unitaires pour Consistency Engine (Phase 7)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConsistencyEngine } from '@/services/consistency/consistencyEngine';
import type { Goal, Fact, Contradiction } from '@/services/consistency/consistencyEngine';

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Goals Tracking
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Consistency Engine — Goals Tracking (Phase 9)', () => {
  let engine: ConsistencyEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new ConsistencyEngine();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Add Goal
   * ─────────────────────────────────────────────────────────────────
   */
  it('should add a goal', () => {
    const goalId = engine.addGoal({
      description: 'Build a TODO app',
      priority: 'high',
      status: 'active',
    });

    expect(goalId).toBeDefined();
    expect(typeof goalId).toBe('string');

    const goals = engine.getGoals();
    expect(goals).toHaveLength(1);
    expect(goals[0].description).toBe('Build a TODO app');
    expect(goals[0].priority).toBe('high');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Update Goal Status
   * ─────────────────────────────────────────────────────────────────
   */
  it('should update goal status', () => {
    const goalId = engine.addGoal({
      description: 'Deploy app',
      priority: 'medium',
      status: 'active',
    });

    engine.updateGoalStatus(goalId, 'completed');

    const goals = engine.getGoals();
    const goal = goals.find(g => g.id === goalId);
    expect(goal?.status).toBe('completed');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: Link Goal to Message
   * ─────────────────────────────────────────────────────────────────
   */
  it('should link goal to message', () => {
    const goalId = engine.addGoal({
      description: 'Refactor code',
      priority: 'low',
      status: 'active',
    });

    engine.linkGoalToMessage(goalId, 'msg-123');

    const goals = engine.getGoals();
    const goal = goals.find(g => g.id === goalId);
    expect(goal?.messageIds).toContain('msg-123');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: Extract Goals from Conversation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should extract goals from conversation', () => {
    const text = 'I need to build a chat app and deploy it to production';
    engine.extractGoals(text);

    const goals = engine.getGoals();
    expect(goals.length).toBeGreaterThan(0);
    expect(goals.some(g => g.description.toLowerCase().includes('chat'))).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: Goal Priority Levels
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle all priority levels', () => {
    const goalLow = engine.addGoal({ description: 'Low priority', priority: 'low', status: 'active' });
    const goalMedium = engine.addGoal({ description: 'Medium priority', priority: 'medium', status: 'active' });
    const goalHigh = engine.addGoal({ description: 'High priority', priority: 'high', status: 'active' });

    const goals = engine.getGoals();
    expect(goals).toHaveLength(3);

    const priorities = goals.map(g => g.priority);
    expect(priorities).toContain('low');
    expect(priorities).toContain('medium');
    expect(priorities).toContain('high');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: Goal Status Lifecycle
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle goal status lifecycle', () => {
    const goalId = engine.addGoal({ description: 'Test goal', priority: 'medium', status: 'active' });

    // Active → In Progress
    engine.updateGoalStatus(goalId, 'in-progress');
    let goal = engine.getGoals().find(g => g.id === goalId);
    expect(goal?.status).toBe('in-progress');

    // In Progress → Completed
    engine.updateGoalStatus(goalId, 'completed');
    goal = engine.getGoals().find(g => g.id === goalId);
    expect(goal?.status).toBe('completed');

    // Completed → Archived
    engine.updateGoalStatus(goalId, 'archived');
    goal = engine.getGoals().find(g => g.id === goalId);
    expect(goal?.status).toBe('archived');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: Get Goals by Status
   * ─────────────────────────────────────────────────────────────────
   */
  it('should get goals by status', () => {
    engine.addGoal({ description: 'Active 1', priority: 'high', status: 'active' });
    engine.addGoal({ description: 'Active 2', priority: 'medium', status: 'active' });
    engine.addGoal({ description: 'Completed 1', priority: 'low', status: 'completed' });

    const activeGoals = engine.getGoals().filter(g => g.status === 'active');
    const completedGoals = engine.getGoals().filter(g => g.status === 'completed');

    expect(activeGoals).toHaveLength(2);
    expect(completedGoals).toHaveLength(1);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 8: Goal Context Generation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should generate context for goals', () => {
    engine.addGoal({ description: 'Goal 1', priority: 'high', status: 'active' });
    engine.addGoal({ description: 'Goal 2', priority: 'medium', status: 'active' });

    const context = engine.generateContextPrompt();

    expect(context).toContain('Goal 1');
    expect(context).toContain('Goal 2');
    expect(context.length).toBeGreaterThan(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 9: Goal Deadline Tracking
   * ─────────────────────────────────────────────────────────────────
   */
  it('should track goal deadlines', () => {
    const deadline = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now
    const goalId = engine.addGoal({
      description: 'Goal with deadline',
      priority: 'high',
      status: 'active',
      deadline,
    });

    const goal = engine.getGoals().find(g => g.id === goalId);
    expect(goal?.deadline).toBe(deadline);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 10: Goal Subgoals
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle goal subgoals', () => {
    const parentGoalId = engine.addGoal({
      description: 'Parent goal',
      priority: 'high',
      status: 'active',
    });

    const subGoalId = engine.addGoal({
      description: 'Subgoal',
      priority: 'medium',
      status: 'active',
      parentGoalId,
    });

    const subGoal = engine.getGoals().find(g => g.id === subGoalId);
    expect(subGoal?.parentGoalId).toBe(parentGoalId);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Facts Database
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Consistency Engine — Facts Database (Phase 9)', () => {
  let engine: ConsistencyEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new ConsistencyEngine();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 11: Add Fact
   * ─────────────────────────────────────────────────────────────────
   */
  it('should add a fact', () => {
    const factId = engine.addFact({
      content: 'User prefers dark mode',
      confidence: 0.9,
      source: 'conversation',
    });

    expect(factId).toBeDefined();

    const facts = engine.getFacts();
    expect(facts).toHaveLength(1);
    expect(facts[0].content).toBe('User prefers dark mode');
    expect(facts[0].confidence).toBe(0.9);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 12: Confirm Fact
   * ─────────────────────────────────────────────────────────────────
   */
  it('should confirm a fact', () => {
    const factId = engine.addFact({
      content: 'User is a developer',
      confidence: 0.7,
      source: 'inference',
    });

    engine.confirmFact(factId);

    const fact = engine.getFacts().find(f => f.id === factId);
    expect(fact?.confirmed).toBe(true);
    expect(fact?.confidence).toBeGreaterThanOrEqual(0.9);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 13: Supersede Fact
   * ─────────────────────────────────────────────────────────────────
   */
  it('should supersede a fact', () => {
    const oldFactId = engine.addFact({
      content: 'User prefers Vue',
      confidence: 0.8,
      source: 'conversation',
    });

    const newFactId = engine.addFact({
      content: 'User prefers React',
      confidence: 0.9,
      source: 'conversation',
    });

    engine.supersedeFact(oldFactId, newFactId);

    const oldFact = engine.getFacts().find(f => f.id === oldFactId);
    expect(oldFact?.supersededBy).toBe(newFactId);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 14: Validate Fact
   * ─────────────────────────────────────────────────────────────────
   */
  it('should validate a fact', () => {
    const factId = engine.addFact({
      content: 'User lives in Paris',
      confidence: 0.6,
      source: 'inference',
    });

    engine.validateFact(factId, true);

    const fact = engine.getFacts().find(f => f.id === factId);
    expect(fact?.validated).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 15: Extract Facts from Conversation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should extract facts from conversation', () => {
    const text = 'I am a frontend developer working with React and TypeScript';
    engine.extractFacts(text);

    const facts = engine.getFacts();
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.some(f => f.content.toLowerCase().includes('developer'))).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 16: Fact Confidence Levels
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle fact confidence levels', () => {
    const lowConfidence = engine.addFact({ content: 'Low confidence fact', confidence: 0.3, source: 'inference' });
    const mediumConfidence = engine.addFact({ content: 'Medium confidence fact', confidence: 0.6, source: 'conversation' });
    const highConfidence = engine.addFact({ content: 'High confidence fact', confidence: 0.95, source: 'explicit' });

    const facts = engine.getFacts();
    expect(facts).toHaveLength(3);

    const lowFact = facts.find(f => f.id === lowConfidence);
    const mediumFact = facts.find(f => f.id === mediumConfidence);
    const highFact = facts.find(f => f.id === highConfidence);

    expect(lowFact?.confidence).toBe(0.3);
    expect(mediumFact?.confidence).toBe(0.6);
    expect(highFact?.confidence).toBe(0.95);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 17: Fact Sources
   * ─────────────────────────────────────────────────────────────────
   */
  it('should track fact sources', () => {
    const conversationFact = engine.addFact({ content: 'From conversation', confidence: 0.8, source: 'conversation' });
    const inferenceFact = engine.addFact({ content: 'From inference', confidence: 0.6, source: 'inference' });
    const explicitFact = engine.addFact({ content: 'From explicit', confidence: 1.0, source: 'explicit' });

    const facts = engine.getFacts();

    const sources = facts.map(f => f.source);
    expect(sources).toContain('conversation');
    expect(sources).toContain('inference');
    expect(sources).toContain('explicit');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 18: Get Facts by Confidence
   * ─────────────────────────────────────────────────────────────────
   */
  it('should get facts by confidence threshold', () => {
    engine.addFact({ content: 'Low confidence', confidence: 0.3, source: 'inference' });
    engine.addFact({ content: 'High confidence', confidence: 0.9, source: 'explicit' });

    const highConfidenceFacts = engine.getFacts().filter(f => f.confidence >= 0.8);
    expect(highConfidenceFacts).toHaveLength(1);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Contradiction Detection
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Consistency Engine — Contradiction Detection (Phase 9)', () => {
  let engine: ConsistencyEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new ConsistencyEngine();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 19: Detect Fact-Fact Contradiction
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect fact-fact contradiction', () => {
    const fact1Id = engine.addFact({ content: 'User prefers dark mode', confidence: 0.9, source: 'conversation' });
    const fact2Id = engine.addFact({ content: 'User prefers light mode', confidence: 0.8, source: 'conversation' });

    const contradictions = engine.detectContradictions();

    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions.some(c => c.type === 'fact-fact')).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 20: Detect Fact-Response Contradiction
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect fact-response contradiction', () => {
    engine.addFact({ content: 'User is a frontend developer', confidence: 0.9, source: 'conversation' });

    const response = 'As a backend developer, you should focus on databases';
    const contradictions = engine.checkResponseConsistency(response);

    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0].type).toBe('fact-response');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 21: Detect Goal-Response Contradiction
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect goal-response contradiction', () => {
    engine.addGoal({ description: 'Build a mobile app', priority: 'high', status: 'active' });

    const response = 'Let\'s focus on building a desktop application instead';
    const contradictions = engine.checkResponseConsistency(response);

    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0].type).toBe('goal-response');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 22: No Contradiction Detection
   * ─────────────────────────────────────────────────────────────────
   */
  it('should not detect contradictions when consistent', () => {
    engine.addFact({ content: 'User prefers React', confidence: 0.9, source: 'conversation' });
    engine.addGoal({ description: 'Build a React app', priority: 'high', status: 'active' });

    const response = 'Let\'s create a React application with TypeScript';
    const contradictions = engine.checkResponseConsistency(response);

    expect(contradictions).toHaveLength(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 23: Contradiction Severity
   * ─────────────────────────────────────────────────────────────────
   */
  it('should calculate contradiction severity', () => {
    engine.addFact({ content: 'User hates PHP', confidence: 0.95, source: 'explicit' });

    const response = 'You should definitely use PHP for this project';
    const contradictions = engine.checkResponseConsistency(response);

    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0].severity).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(contradictions[0].severity);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 24: Multiple Contradictions
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect multiple contradictions', () => {
    engine.addFact({ content: 'User prefers TypeScript', confidence: 0.9, source: 'conversation' });
    engine.addFact({ content: 'User works with React', confidence: 0.9, source: 'conversation' });

    const response = 'Let\'s use JavaScript and Vue for this project';
    const contradictions = engine.checkResponseConsistency(response);

    expect(contradictions.length).toBeGreaterThanOrEqual(1);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Auto-Correction
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Consistency Engine — Auto-Correction (Phase 9)', () => {
  let engine: ConsistencyEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new ConsistencyEngine();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 25: Auto-Correct Response
   * ─────────────────────────────────────────────────────────────────
   */
  it('should auto-correct contradictory response', () => {
    engine.addFact({ content: 'User prefers React', confidence: 0.9, source: 'conversation' });

    const response = 'You should use Vue for this project';
    const corrected = engine.autoCorrectResponse(response);

    expect(corrected).not.toBe(response);
    expect(corrected.toLowerCase()).toContain('react');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 26: No Correction Needed
   * ─────────────────────────────────────────────────────────────────
   */
  it('should not modify consistent response', () => {
    engine.addFact({ content: 'User prefers React', confidence: 0.9, source: 'conversation' });

    const response = 'Let\'s build with React';
    const corrected = engine.autoCorrectResponse(response);

    expect(corrected).toBe(response);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 27: Correction Context
   * ─────────────────────────────────────────────────────────────────
   */
  it('should provide correction context', () => {
    engine.addFact({ content: 'User is building a TODO app', confidence: 0.9, source: 'conversation' });

    const response = 'Let\'s work on the e-commerce features';
    const contradictions = engine.checkResponseConsistency(response);

    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0]).toHaveProperty('suggestedCorrection');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Context Generation
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Consistency Engine — Context Generation (Phase 9)', () => {
  let engine: ConsistencyEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new ConsistencyEngine();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 28: Generate Context with Goals and Facts
   * ─────────────────────────────────────────────────────────────────
   */
  it('should generate context with goals and facts', () => {
    engine.addGoal({ description: 'Build a chat app', priority: 'high', status: 'active' });
    engine.addFact({ content: 'User prefers TypeScript', confidence: 0.9, source: 'conversation' });

    const context = engine.generateContextPrompt();

    expect(context).toContain('chat app');
    expect(context).toContain('TypeScript');
    expect(context.length).toBeGreaterThan(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 29: Empty Context
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle empty context', () => {
    const context = engine.generateContextPrompt();

    expect(context).toBeDefined();
    expect(typeof context).toBe('string');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 30: Context Length Limit
   * ─────────────────────────────────────────────────────────────────
   */
  it('should limit context length', () => {
    // Add many goals and facts
    for (let i = 0; i < 20; i++) {
      engine.addGoal({ description: `Goal ${i}`, priority: 'medium', status: 'active' });
      engine.addFact({ content: `Fact ${i}`, confidence: 0.8, source: 'conversation' });
    }

    const context = engine.generateContextPrompt({ maxLength: 500 });

    expect(context.length).toBeLessThanOrEqual(500);
  });
});
