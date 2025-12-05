/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Service Validation Schemas
 * Schemas Zod pour validation responses Tauri backend
 * ═══════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

// ────────────────────────────────────────────────────────────────
// Memory Service Schemas
// ────────────────────────────────────────────────────────────────

export const ProjectSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'paused', 'completed', 'archived']),
  progress: z.number().min(0).max(100),
  lastUpdate: z.string(),
  tags: z.array(z.string()),
  priority: z.number().min(1).max(5).optional(),
});

export const DecisionSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['strategic', 'tactical', 'operational']),
  timestamp: z.string(),
  context: z.string(),
  outcome: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const KnowledgeEntrySchema = z.object({
  id: z.string(),
  topic: z.string(),
  content: z.string(),
  category: z.string(),
  relevance: z.number().min(0).max(1),
  source: z.string().optional(),
  timestamp: z.string(),
});

export const RitualInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'on-demand']),
  lastExecution: z.string().optional(),
  nextScheduled: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed']),
});

export const TimelineEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['event', 'decision', 'milestone', 'interaction']),
  title: z.string(),
  description: z.string().optional(),
  impact: z.number().min(-1).max(1).optional(),
});

export const MemoryContextSchema = z.object({
  activeProjects: z.array(ProjectSummarySchema),
  recentDecisions: z.array(DecisionSummarySchema),
  relevantKnowledge: z.array(KnowledgeEntrySchema),
  activeRituals: z.array(RitualInfoSchema),
  timeline: z.array(TimelineEntrySchema),
});

// ────────────────────────────────────────────────────────────────
// Chat Service Schemas
// ────────────────────────────────────────────────────────────────

export const EmotionStateSchema = z.object({
  valence: z.number().min(-1).max(1),
  intensity: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
  label: z.string().optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
  emotionState: EmotionStateSchema.optional(),
});

export const ChatResponseSchema = z.object({
  content: z.string(),
  usage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    })
    .optional(),
  finishReason: z.string(),
  model: z.string(),
});

// ────────────────────────────────────────────────────────────────
// Voice Service Schemas
// ────────────────────────────────────────────────────────────────

export const ASRResultSchema = z.object({
  transcript: z.string(),
  confidence: z.number().min(0).max(1),
  isFinal: z.boolean(),
  alternatives: z
    .array(
      z.object({
        transcript: z.string(),
        confidence: z.number().min(0).max(1),
      })
    )
    .optional(),
});

export const AudioStateSchema = z.object({
  isRecording: z.boolean(),
  isSpeaking: z.boolean(),
  volume: z.number().min(0).max(1),
  duration: z.number().min(0),
});

export const VoiceInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  language: z.string(),
  gender: z.enum(['male', 'female', 'neutral']).optional(),
});

// ────────────────────────────────────────────────────────────────
// Persona Service Schemas
// ────────────────────────────────────────────────────────────────

export const PersonaMultipliersSchema = z.object({
  creativity: z.number().min(0).max(2),
  analytical: z.number().min(0).max(2),
  empathy: z.number().min(0).max(2),
  efficiency: z.number().min(0).max(2),
  risk_taking: z.number().min(0).max(2),
});

export const PersonaStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  archetype: z.string(),
  activeMultipliers: z.record(z.string(), z.number()),
  moodState: z.object({
    energy: z.number().min(0).max(1),
    focus: z.number().min(0).max(1),
    creativity: z.number().min(0).max(1),
  }),
  timestamp: z.string(),
});

export const PersonaListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  archetype: z.string(),
  isActive: z.boolean(),
});

// ────────────────────────────────────────────────────────────────
// System Service Schemas
// ────────────────────────────────────────────────────────────────

export const CoreStatusSchema = z.object({
  name: z.string(),
  status: z.enum(['running', 'stopped', 'error']),
  lastActivity: z.string(),
  metrics: z.object({
    requests: z.number().min(0),
    errors: z.number().min(0),
    latency: z.number().min(0),
  }),
});

export const SystemStatusSchema = z.object({
  timestamp: z.string(),
  uptime: z.number().min(0),
  version: z.string(),
  cores: z.object({
    helios: CoreStatusSchema,
    nexus: CoreStatusSchema,
    harmonia: CoreStatusSchema,
    sentinel: CoreStatusSchema,
  }),
  resources: z.object({
    cpu: z.number().min(0).max(100),
    memory: z.number().min(0),
    disk: z.number().min(0),
  }),
  health: z.enum(['healthy', 'degraded', 'critical']),
});

export const PerformanceMetricsSchema = z.object({
  timestamp: z.string(),
  cpu: z.object({
    usage: z.number().min(0).max(100),
    cores: z.number().min(1),
    frequency: z.number().min(0),
  }),
  memory: z.object({
    total: z.number().min(0),
    used: z.number().min(0),
    free: z.number().min(0),
    cached: z.number().min(0),
  }),
  disk: z.object({
    total: z.number().min(0),
    used: z.number().min(0),
    free: z.number().min(0),
    readSpeed: z.number().min(0),
    writeSpeed: z.number().min(0),
  }),
  network: z.object({
    sent: z.number().min(0),
    received: z.number().min(0),
    latency: z.number().min(0),
  }),
});

export const SystemConfigSchema = z.object({
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error']),
  cacheSize: z.number().min(0),
  maxConnections: z.number().min(1),
  timeout: z.number().min(1),
  features: z.object({
    autoHeal: z.boolean(),
    adaptiveLearning: z.boolean(),
    voiceMode: z.boolean(),
    metaMode: z.boolean(),
  }),
});

// ────────────────────────────────────────────────────────────────
// Evolution Service Schemas
// ────────────────────────────────────────────────────────────────

export const EvolutionStateSchema = z.object({
  version: z.string(),
  cycle: z.number().min(0),
  phase: z.enum(['learning', 'adapting', 'evolving', 'stable']),
  metrics: z.object({
    learningRate: z.number().min(0).max(1),
    adaptationScore: z.number().min(0).max(1),
    evolutionProgress: z.number().min(0).max(100),
  }),
  timestamp: z.string(),
});

export const EvolutionDataSchema = z.object({
  interactions: z.number().min(0),
  patterns: z.array(
    z.object({
      name: z.string(),
      frequency: z.number().min(0),
      effectiveness: z.number().min(0).max(1),
    })
  ),
  adaptations: z.array(
    z.object({
      type: z.string(),
      timestamp: z.string(),
      impact: z.number().min(-1).max(1),
    })
  ),
});

export const EvolutionConfigSchema = z.object({
  autoEvolve: z.boolean(),
  learningRate: z.number().min(0).max(1),
  adaptationThreshold: z.number().min(0).max(1),
  evolutionInterval: z.number().min(1),
  preserveStability: z.boolean(),
});

export const EvolutionSuggestionSchema = z.object({
  id: z.string(),
  type: z.enum(['optimization', 'adaptation', 'new_feature']),
  description: z.string(),
  impact: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
  estimated_improvement: z.number(),
});

export const PatternAnalysisSchema = z.object({
  pattern: z.string(),
  frequency: z.number().min(0),
  trend: z.enum(['increasing', 'stable', 'decreasing']),
});

// ────────────────────────────────────────────────────────────────
// Helper: Validation avec error handling
// ────────────────────────────────────────────────────────────────

/**
 * Valider données avec Zod schema
 * @throws ValidationError si validation échoue
 */
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context?: string
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );

    const contextMsg = context ? ` [${context}]` : '';
    console.error(`[Validation Error]${contextMsg}:`, errors);

    throw new Error(
      `Validation failed${contextMsg}: ${errors.join(', ')}`
    );
  }

  return result.data;
}

/**
 * Valider optionnellement (retourne null si invalid)
 */
export function validateDataOptional<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validation partielle (accepte champs manquants)
 */
export function validatePartial<T extends z.ZodRawShape>(
  data: unknown,
  schema: z.ZodObject<T>
): unknown {
  const partialSchema = schema.partial();
  return validateData(data, partialSchema);
}

// ────────────────────────────────────────────────────────────────
// Export Types (TypeScript inference from Zod)
// ────────────────────────────────────────────────────────────────

export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;
export type DecisionSummary = z.infer<typeof DecisionSummarySchema>;
export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;
export type RitualInfo = z.infer<typeof RitualInfoSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type MemoryContext = z.infer<typeof MemoryContextSchema>;

export type EmotionState = z.infer<typeof EmotionStateSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export type ASRResult = z.infer<typeof ASRResultSchema>;
export type AudioState = z.infer<typeof AudioStateSchema>;
export type VoiceInfo = z.infer<typeof VoiceInfoSchema>;

export type PersonaMultipliers = z.infer<typeof PersonaMultipliersSchema>;
export type PersonaState = z.infer<typeof PersonaStateSchema>;
export type PersonaListItem = z.infer<typeof PersonaListItemSchema>;

export type CoreStatus = z.infer<typeof CoreStatusSchema>;
export type SystemStatus = z.infer<typeof SystemStatusSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type SystemConfig = z.infer<typeof SystemConfigSchema>;

export type EvolutionState = z.infer<typeof EvolutionStateSchema>;
export type EvolutionData = z.infer<typeof EvolutionDataSchema>;
export type EvolutionConfig = z.infer<typeof EvolutionConfigSchema>;
export type EvolutionSuggestion = z.infer<typeof EvolutionSuggestionSchema>;
export type PatternAnalysis = z.infer<typeof PatternAnalysisSchema>;
