/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Tauri Commands Validation
 * Schémas Zod pour validation runtime des réponses Tauri
 * ═══════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────
// META-MODE ENGINE
// ─────────────────────────────────────────────────────────────────

export const InteractionRequestSchema = z.object({
  input: z.string().min(1, 'Input requis'),
  context: z.string(),
});

export const InteractionResponseSchema = z.object({
  active_mode: z.string(),
  mode_justification: z.string(),
  content: z.string(),
  adapted_tone: z.string(),
  adapted_depth: z.string(),
  adapted_speed: z.string(),
  next_suggested_modes: z.array(z.string()),
  timestamp: z.string(),
});

export const KevinStateResponseSchema = z.object({
  emotional_tone: z.string(),
  stress_level: z.number().min(0).max(1),
  emotional_stability: z.number().min(0).max(1),
  cognitive_load: z.number().min(0).max(1),
  clarity_level: z.number().min(0).max(1),
  focus_level: z.number().min(0).max(1),
  energy_level: z.number().min(0).max(1),
  saturation_level: z.number().min(0).max(1),
  need_structure: z.boolean(),
  need_validation: z.boolean(),
  need_guidance: z.boolean(),
  need_autonomy: z.boolean(),
  need_creativity: z.boolean(),
  need_rest: z.boolean(),
  task_type: z.string(),
  implicit_signals: z.array(z.string()),
});

export const MetaModeStatsSchema = z.object({
  total_interactions: z.number().int().min(0),
  current_mode: z.string(),
  mode_transitions_count: z.number().int().min(0),
  average_stress: z.number().min(0).max(1),
  average_clarity: z.number().min(0).max(1),
  average_energy: z.number().min(0).max(1),
});

// ─────────────────────────────────────────────────────────────────
// EXP ENGINE
// ─────────────────────────────────────────────────────────────────

export const CategoryExpSchema = z.object({
  category: z.string(),
  exp: z.number().int().min(0),
  level: z.number().int().min(1),
  contributions: z.number().int().min(0),
});

export const ExpProfileSchema = z.object({
  total_exp: z.number().int().min(0),
  level: z.number().int().min(1),
  exp_to_next_level: z.number().int().min(0),
  categories: z.record(z.string(), CategoryExpSchema),
  talents: z.array(z.string()),
  talent_points: z.number().int().min(0),
});

export const TalentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  tier: z.number().int().min(1).max(5),
  cost: z.number().int().min(0),
  requirements: z.array(z.string()),
  unlocked: z.boolean(),
});

export const LevelUpEventSchema = z.object({
  old_level: z.number().int().min(1),
  new_level: z.number().int().min(1),
  talent_points_earned: z.number().int().min(0),
  timestamp: z.number().int().min(0),
});

// ─────────────────────────────────────────────────────────────────
// MEMORY ENGINE
// ─────────────────────────────────────────────────────────────────

export const MemoryMetadataSchema = z.object({
  entry_type: z.string(),
  tags: z.array(z.string()),
  related_ids: z.array(z.string()),
  source: z.string(),
});

export const MemoryEntrySchema = z.object({
  id: z.string(),
  content: z.string(),
  embedding: z.array(z.number()),
  metadata: MemoryMetadataSchema,
  timestamp: z.number().int().min(0),
  importance: z.number().min(0).max(1),
  access_count: z.number().int().min(0),
});

export const MemoryQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100),
  min_similarity: z.number().min(0).max(1),
  filters: z.array(z.string()).optional(),
});

export const MemoryResultSchema = z.object({
  entry: MemoryEntrySchema,
  similarity: z.number().min(0).max(1),
});

export const MemoryStatsSchema = z.object({
  total_entries: z.number().int().min(0),
  total_tokens: z.number().int().min(0),
  vector_dimensions: z.number().int().min(0),
  index_size_mb: z.number().min(0),
  conversations_stored: z.number().int().min(0),
  facts_stored: z.number().int().min(0),
});

// ─────────────────────────────────────────────────────────────────
// SYSTEM TYPES
// ─────────────────────────────────────────────────────────────────

export const SystemStatusSchema = z.object({
  uptime_seconds: z.number().int().min(0),
  memory_usage_mb: z.number().min(0),
  cpu_usage_percent: z.number().min(0).max(100),
  active_modules: z.array(z.string()),
});
