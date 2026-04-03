# Implementation Plan: BehavioralRouter — Phase 1 "TITANE Vivant"

[Overview]
Create a unified BehavioralController that connects TITANE's disconnected systems (memory, preferences, intent, observability) into a single decision-making component. This is the "nervous system" that will make TITANE's existing pieces work together coherently, enabling the first step toward a "living" system.

Currently, TITANE's memory, preferences, intent classification, and observability all operate in isolation. Memory is injected into the prompt but doesn't influence skill selection. Preferences shape the response post-LLM but don't influence depth selection. Observability collects traces but never feeds back into behavior. The BehavioralRouter will be the central component that takes signals from all these systems and produces a unified behavioral decision.

[Types]
Single sentence describing the type system changes.

New types for behavioral routing decisions and signals:

```typescript
// Signal from any subsystem to the behavioral router
export interface BehavioralSignal {
  source: 'memory' | 'preference' | 'intent' | 'observability' | 'identity';
  type: string; // e.g., 'depth_hint', 'skill_hint', 'initiative_hint'
  value: unknown;
  confidence: number; // 0.0-1.0
  timestamp: number;
}

// Unified behavioral decision produced by the router
export interface BehavioralDecision {
  profileId: ResponseProfileId;
  skillId?: string; // skill to activate (if any)
  initiativeAction?: InitiativeAction; // proactive action (if any)
  reasoning: string; // why this decision was made
  signals: BehavioralSignal[]; // signals that influenced this decision
  confidence: number; // 0.0-1.0
}

// Initiative action TITANE can propose
export interface InitiativeAction {
  type: 'suggest' | 'remind' | 'propose' | 'warn';
  message: string;
  trigger: string; // what triggered this initiative
  priority: 'low' | 'medium' | 'high';
}

// Configuration for the behavioral router
export interface BehavioralRouterConfig {
  enableMemoryInfluence: boolean; // default: true
  enablePreferenceInfluence: boolean; // default: true
  enableObservabilityInfluence: boolean; // default: false (Phase 3)
  enableInitiative: boolean; // default: false (Phase 2)
  maxSignalsPerDecision: number; // default: 10
  minConfidenceThreshold: number; // default: 0.4
}
```

[Files]
Single sentence describing file modifications.

New files to create:

- `src/services/ai/behavioralRouter.ts` — Main BehavioralRouter class with signal collection, decision making, and integration with existing systems

Existing files to modify:

- `src/services/ai/chatEngine.ts` — Integrate BehavioralRouter into the generate() pipeline, replacing the current disconnected calls to classifyIntent(), getEffectiveProfile(), checkMemoryForAnswer() with a unified BehavioralRouter.decide() call
- `src/services/ai/responsePolicy.ts` — Add BehavioralDecision type exports and integrate with existing profile selection

No files to delete or move.

No configuration file updates needed.

[Functions]
Single sentence describing function modifications.

New functions in `src/services/ai/behavioralRouter.ts`:

- `BehavioralRouter.collectSignals(message, memoryContext, preferences, intentResult)` — Collects all behavioral signals from memory, preferences, intent, and observability
- `BehavioralRouter.decide(signals, config)` — Takes collected signals and produces a unified BehavioralDecision
- `BehavioralRouter.resolveConflicts(signals)` — Resolves conflicting signals (e.g., memory says DEEP but preference says DIRECT)
- `BehavioralRouter.shouldActivateSkill(decision, availableSkills)` — Determines if a skill should be auto-activated based on the decision

Modified functions in `src/services/ai/chatEngine.ts`:

- `generate()` — Replace the current sequence of classifyIntent() → getEffectiveProfile() → checkMemoryForAnswer() with a single BehavioralRouter.decide() call that produces a unified decision
- No other functions need modification

[Classes]
Single sentence describing class modifications.

New class in `src/services/ai/behavioralRouter.ts`:

- `BehavioralRouter` — Singleton class with methods: collectSignals(), decide(), resolveConflicts(), shouldActivateSkill()
- Constructor takes config: BehavioralRouterConfig
- Integrates with existing: memoryIntegration, preferenceEngine, classifyIntent, RESPONSE_PROFILES

Modified classes:

- `ChatEngineOmega` in `src/services/ai/chatEngine.ts` — Add behavioralRouter property, replace disconnected signal collection with unified BehavioralRouter.decide() call

[Dependencies]
Single sentence describing dependency modifications.

No new external dependencies. The BehavioralRouter will use existing internal modules:

- `src/services/ai/memoryIntegration.ts` (memory context)
- `src/services/ai/preferenceEngine.ts` (preferences)
- `src/services/ai/responsePolicy.ts` (intent classification, profiles)
- `src/services/cognitive/CognitiveObservabilityEngine.ts` (observability traces)

[Testing]
Single sentence describing testing approach.

Test file: `src/__tests__/services/ai/behavioralRouter.test.ts`

Test scenarios:

1. **Low ambiguity action request** — Router selects DEVELOPED profile, no clarification
2. **User prefers short answers** — Router respects preference, selects DIRECT
3. **Memory suggests a skill** — Router evaluates skill activation
4. **Conflicting signals** — Router resolves conflicts (memory says DEEP, preference says DIRECT)
5. **No signals** — Router falls back to mode default

Each test verifies:

- The decision profile matches expected
- The reasoning is coherent
- The signals are properly collected
- The confidence is above threshold

[Implementation Order]
Single sentence describing the implementation sequence.

1. Create `src/services/ai/behavioralRouter.ts` with types and empty class
2. Implement `collectSignals()` — gather signals from memory, preferences, intent
3. Implement `resolveConflicts()` — handle conflicting signals
4. Implement `decide()` — produce unified BehavioralDecision
5. Integrate into `chatEngine.ts` generate() pipeline
6. Create test file with 5 scenarios
7. Run tests and verify TypeScript compilation
