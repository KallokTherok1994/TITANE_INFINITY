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
import type {
  Goal as _Goal,
  Fact as _Fact,
  Contradiction as _Contradiction,
} from '@/services/consistency/consistencyEngine';
import type { AIMessage } from '@/services/ai/types';

type LegacyGoalInput = {
  description: string;
  priority?: 'low' | 'medium' | 'high' | number;
  deadline?: number;
  parentGoalId?: string;
  metadata?: Record<string, unknown>;
};

type LegacyFactInput = {
  content: string;
  confidence?: number;
  source?: 'conversation' | 'inference' | 'explicit';
  tags?: string[];
  supersedes?: string;
  metadata?: Record<string, unknown>;
};

const mapPriority = (priority?: LegacyGoalInput['priority']): number => {
  if (typeof priority === 'number') {
    return priority;
  }
  switch (priority) {
    case 'low':
      return 3;
    case 'high':
      return 8;
    case 'medium':
    default:
      return 5;
  }
};

const mapSource = (source?: LegacyFactInput['source']) => {
  switch (source) {
    case 'conversation':
      return 'user';
    case 'explicit':
      return 'external';
    case 'inference':
    default:
      return 'ai';
  }
};

const addGoal = (engine: ConsistencyEngine, input: LegacyGoalInput) =>
  engine.addGoal(input.description, {
    priority: mapPriority(input.priority),
    deadline: input.deadline,
    parentGoalId: input.parentGoalId,
    metadata: input.metadata,
  });

const getGoals = (engine: ConsistencyEngine) => engine.exportAll().goals;

const addFact = (engine: ConsistencyEngine, input: LegacyFactInput) =>
  engine.addFact(input.content, {
    confidence: input.confidence,
    source: mapSource(input.source),
    tags: input.tags,
    supersedes: input.supersedes,
    metadata: input.metadata,
  });

const getFacts = (engine: ConsistencyEngine) => engine.exportAll().facts;

const extractGoals = (engine: ConsistencyEngine, text: string) =>
  engine.extractGoalsFromMessage({
    role: 'user',
    content: text,
    timestamp: Date.now(),
  } as AIMessage);

const extractFacts = (engine: ConsistencyEngine, text: string) =>
  engine.extractFactsFromMessages([
    {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    } as AIMessage,
  ]);

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Goals Tracking
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Consistency Engine — Goals Tracking (Phase 9)', () => {
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
    const goal = addGoal(engine, {
      description: 'Build a sample app',
      priority: 'high',
    });

    expect(goal.id).toBeDefined();
    expect(typeof goal.id).toBe('string');

    const goals = getGoals(engine);
    expect(goals).toHaveLength(1);
    const firstGoal = goals[0];
    expect(firstGoal).toBeDefined();
    expect(firstGoal?.description).toBe('Build a sample app');
    expect(firstGoal?.priority).toBeGreaterThan(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Update Goal Status
   * ─────────────────────────────────────────────────────────────────
   */
  it('should update goal status', () => {
    const goal = addGoal(engine, {
      description: 'Deploy app',
      priority: 'medium',
    });

    engine.updateGoalStatus(goal.id, 'achieved');

    const goals = getGoals(engine);
    const updated = goals.find(g => g.id === goal.id);
    expect(updated?.status).toBe('achieved');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: Link Goal to Message
   * ─────────────────────────────────────────────────────────────────
   */
  it('should link goal to message', () => {
    const goal = addGoal(engine, {
      description: 'Refactor code',
      priority: 'low',
    });

    engine.linkMessageToGoal(goal.id, 'msg-123');

    const goals = getGoals(engine);
    const updated = goals.find(g => g.id === goal.id);
    expect(updated?.relatedMessages).toContain('msg-123');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: Extract Goals from Conversation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should extract goals from conversation', () => {
    const text = 'I need to build a chat app and deploy it to production';
    extractGoals(engine, text);

    const goals = getGoals(engine);
    expect(goals.length).toBeGreaterThan(0);
    expect(goals.some(g => g.description.toLowerCase().includes('chat'))).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: Goal Priority Levels
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle all priority levels', () => {
    addGoal(engine, {
      description: 'Low priority',
      priority: 'low',
    });
    addGoal(engine, {
      description: 'Medium priority',
      priority: 'medium',
    });
    addGoal(engine, {
      description: 'High priority',
      priority: 'high',
    });

    const goals = getGoals(engine);
    expect(goals).toHaveLength(3);

    const priorities = goals.map(g => g.priority);
    expect(priorities).toContain(3);
    expect(priorities).toContain(5);
    expect(priorities).toContain(8);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: Goal Status Lifecycle
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle goal status lifecycle', () => {
    const goal = addGoal(engine, {
      description: 'Test goal',
      priority: 'medium',
    });

    // Active → Achieved
    engine.updateGoalStatus(goal.id, 'achieved');
    let updated = getGoals(engine).find(g => g.id === goal.id);
    expect(updated?.status).toBe('achieved');

    // Achieved → Abandoned
    engine.updateGoalStatus(goal.id, 'abandoned');
    updated = getGoals(engine).find(g => g.id === goal.id);
    expect(updated?.status).toBe('abandoned');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: Get Goals by Status
   * ─────────────────────────────────────────────────────────────────
   */
  it('should get goals by status', () => {
    addGoal(engine, { description: 'Active 1', priority: 'high' });
    addGoal(engine, { description: 'Active 2', priority: 'medium' });
    const achieved = addGoal(engine, { description: 'Achieved 1', priority: 'low' });
    engine.updateGoalStatus(achieved.id, 'achieved');

    const activeGoals = getGoals(engine).filter(g => g.status === 'active');
    const achievedGoals = getGoals(engine).filter(g => g.status === 'achieved');

    expect(activeGoals).toHaveLength(2);
    expect(achievedGoals).toHaveLength(1);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 8: Goal Context Generation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should generate context for goals', () => {
    addGoal(engine, { description: 'Goal 1', priority: 'high' });
    addGoal(engine, { description: 'Goal 2', priority: 'medium' });

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
    const goal = addGoal(engine, {
      description: 'Goal with deadline',
      priority: 'high',
      deadline,
    });

    const stored = getGoals(engine).find(g => g.id === goal.id);
    expect(stored?.deadline).toBe(deadline);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 10: Goal Subgoals
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle goal subgoals', () => {
    const parentGoal = addGoal(engine, {
      description: 'Parent goal',
      priority: 'high',
    });

    const subGoal = addGoal(engine, {
      description: 'Subgoal',
      priority: 'medium',
      parentGoalId: parentGoal.id,
    });

    const parent = getGoals(engine).find(g => g.id === parentGoal.id);
    expect(parent?.subgoals).toContain(subGoal.id);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Facts Database
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Consistency Engine — Facts Database (Phase 9)', () => {
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
    const fact = addFact(engine, {
      content: 'User prefers dark mode',
      confidence: 0.9,
      source: 'conversation',
    });

    expect(fact.id).toBeDefined();

    const facts = getFacts(engine);
    expect(facts).toHaveLength(1);
    const firstFact = facts[0];
    expect(firstFact).toBeDefined();
    expect(firstFact?.statement).toBe('User prefers dark mode');
    expect(firstFact?.confidence).toBe(0.9);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 12: Confirm Fact
   * ─────────────────────────────────────────────────────────────────
   */
  it('should confirm a fact', () => {
    const fact = addFact(engine, {
      content: 'User is a developer',
      confidence: 0.7,
      source: 'inference',
    });

    const before = getFacts(engine).find(f => f.id === fact.id)?.confidence ?? 0;
    engine.confirmFact(fact.id);

    const updated = getFacts(engine).find(f => f.id === fact.id);
    expect(updated?.confidence).toBeGreaterThan(before);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 13: Supersede Fact
   * ─────────────────────────────────────────────────────────────────
   */
  it('should supersede a fact', () => {
    const oldFact = addFact(engine, {
      content: 'User prefers Vue',
      confidence: 0.8,
      source: 'conversation',
    });

    const newFact = addFact(engine, {
      content: 'User prefers React',
      confidence: 0.9,
      source: 'conversation',
      supersedes: oldFact.id,
    });

    const updatedOld = getFacts(engine).find(f => f.id === oldFact.id);
    const updatedNew = getFacts(engine).find(f => f.id === newFact.id);
    expect(updatedNew?.supersedes).toBe(oldFact.id);
    expect(updatedOld?.confidence).toBeLessThan(0.8);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 14: Validate Fact
   * ─────────────────────────────────────────────────────────────────
   */
  it('should promote a fact into valid facts', () => {
    const fact = addFact(engine, {
      content: 'User lives in Paris',
      confidence: 0.45,
      source: 'inference',
    });

    expect(engine.getValidFacts().find(f => f.id === fact.id)).toBeUndefined();

    engine.confirmFact(fact.id);
    expect(engine.getValidFacts().find(f => f.id === fact.id)).toBeDefined();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 15: Extract Facts from Conversation
   * ─────────────────────────────────────────────────────────────────
   */
  it('should extract facts from conversation', () => {
    const text = 'I am a frontend developer working with React and TypeScript';
    extractFacts(engine, text);

    const facts = getFacts(engine);
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.some(f => f.statement.toLowerCase().includes('developer'))).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 16: Fact Confidence Levels
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle fact confidence levels', () => {
    const lowConfidence = addFact(engine, {
      content: 'Low confidence fact',
      confidence: 0.3,
      source: 'inference',
    });
    const mediumConfidence = addFact(engine, {
      content: 'Medium confidence fact',
      confidence: 0.6,
      source: 'conversation',
    });
    const highConfidence = addFact(engine, {
      content: 'High confidence fact',
      confidence: 0.95,
      source: 'explicit',
    });

    const facts = getFacts(engine);
    expect(facts).toHaveLength(3);

    const lowFact = facts.find(f => f.id === lowConfidence.id);
    const mediumFact = facts.find(f => f.id === mediumConfidence.id);
    const highFact = facts.find(f => f.id === highConfidence.id);

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
    addFact(engine, {
      content: 'From conversation',
      confidence: 0.8,
      source: 'conversation',
    });
    addFact(engine, {
      content: 'From inference',
      confidence: 0.6,
      source: 'inference',
    });
    addFact(engine, {
      content: 'From explicit',
      confidence: 1.0,
      source: 'explicit',
    });

    const facts = getFacts(engine);

    const sources = facts.map(f => f.source);
    expect(sources).toContain('user');
    expect(sources).toContain('ai');
    expect(sources).toContain('external');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 18: Get Facts by Confidence
   * ─────────────────────────────────────────────────────────────────
   */
  it('should get facts by confidence threshold', () => {
    addFact(engine, { content: 'Low confidence', confidence: 0.3, source: 'inference' });
    addFact(engine, { content: 'High confidence', confidence: 0.9, source: 'explicit' });

    const highConfidenceFacts = engine.getValidFacts().filter(f => f.confidence >= 0.8);
    expect(highConfidenceFacts).toHaveLength(1);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Contradiction Detection
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Consistency Engine — Contradiction Detection (Phase 9)', () => {
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
    addFact(engine, {
      content: 'User prefers dark mode',
      confidence: 0.9,
      source: 'conversation',
    });
    const response = 'You should use light mode for better readability.';
    const result = engine.checkResponseConsistency(response);

    expect(result.contradictions.length).toBeGreaterThan(0);
    expect(result.contradictions.some(c => c.type === 'fact-response')).toBe(true);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 20: Detect Fact-Response Contradiction
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect fact-response contradiction', () => {
    addFact(engine, {
      content: 'User is a frontend developer',
      confidence: 0.9,
      source: 'conversation',
    });

    const response = 'As a backend developer, you should focus on databases';
    const result = engine.checkResponseConsistency(response);

    expect(result.contradictions.length).toBeGreaterThan(0);
    const first = result.contradictions[0];
    expect(first).toBeDefined();
    expect(first?.type).toBe('fact-response');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 21: Detect Goal-Response Contradiction
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect goal-response contradiction', () => {
    addGoal(engine, {
      description: 'Build a mobile app',
      priority: 'high',
    });

    const response = "Let's focus on building a desktop application instead";
    const result = engine.checkResponseConsistency(response);

    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 22: No Contradiction Detection
   * ─────────────────────────────────────────────────────────────────
   */
  it('should not detect contradictions when consistent', () => {
    addFact(engine, {
      content: 'User prefers React',
      confidence: 0.9,
      source: 'conversation',
    });
    addGoal(engine, {
      description: 'Build a React app',
      priority: 'high',
    });

    const response = "Let's create a React application with TypeScript";
    const result = engine.checkResponseConsistency(response);

    expect(result.contradictions).toHaveLength(0);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 23: Contradiction Severity
   * ─────────────────────────────────────────────────────────────────
   */
  it('should calculate contradiction severity', () => {
    addFact(engine, { content: 'User hates PHP', confidence: 0.95, source: 'explicit' });

    const response = 'You should definitely use PHP for this project';
    const result = engine.checkResponseConsistency(response);

    expect(result.contradictions.length).toBeGreaterThan(0);
    const first = result.contradictions[0];
    expect(first).toBeDefined();
    expect(first?.severity).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(first?.severity);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 24: Multiple Contradictions
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect multiple contradictions', () => {
    addFact(engine, {
      content: 'User prefers TypeScript',
      confidence: 0.9,
      source: 'conversation',
    });
    addFact(engine, {
      content: 'User works with React',
      confidence: 0.9,
      source: 'conversation',
    });

    const response = "Let's use JavaScript and Vue for this project";
    const result = engine.checkResponseConsistency(response);

    expect(result.contradictions.length).toBeGreaterThanOrEqual(1);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Auto-Correction
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Consistency Engine — Auto-Correction (Phase 9)', () => {
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
    addFact(engine, {
      content: 'User prefers React',
      confidence: 0.9,
      source: 'conversation',
    });

    const response = 'You should use Vue for this project';
    const result = engine.checkResponseConsistency(response);
    const corrected = engine.autoCorrectResponse(response, result);

    expect(corrected).not.toBe(response);
    expect(corrected.toLowerCase()).toContain('react');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 26: No Correction Needed
   * ─────────────────────────────────────────────────────────────────
   */
  it('should not modify consistent response', () => {
    addFact(engine, {
      content: 'User prefers React',
      confidence: 0.9,
      source: 'conversation',
    });

    const response = "Let's build with React";
    const result = engine.checkResponseConsistency(response);
    const corrected = engine.autoCorrectResponse(response, result);

    expect(corrected).toBe(response);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 27: Correction Context
   * ─────────────────────────────────────────────────────────────────
   */
  it('should provide correction context', () => {
    addFact(engine, {
      content: 'User is building a sample app',
      confidence: 0.9,
      source: 'conversation',
    });

    const response = "Let's work on the e-commerce features";
    const result = engine.checkResponseConsistency(response);

    expect(result.contradictions.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Consistency Engine — Context Generation
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Consistency Engine — Context Generation (Phase 9)', () => {
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
    addGoal(engine, {
      description: 'Build a chat app',
      priority: 'high',
    });
    addFact(engine, {
      content: 'User prefers TypeScript',
      confidence: 0.9,
      source: 'conversation',
    });

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
      addGoal(engine, { description: `Goal ${i}`, priority: 'medium' });
      addFact(engine, { content: `Fact ${i}`, confidence: 0.8, source: 'conversation' });
    }

    const context = engine.generateContextPrompt(500);

    expect(context.length).toBeLessThanOrEqual(500);
  });
});
