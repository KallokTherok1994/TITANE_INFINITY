/**
 * TITANE Remote Key Agent — AI Intelligence Layer
 * Connects to Ollama (gemma2:2b) via Tauri IPC for AI-powered key analysis.
 *
 * All AI methods are safe: they degrade gracefully when Ollama is unavailable.
 */

import { safeInvokeCanonical } from '@/utils/invoke';
import type { AgentConfig, UsageLogEntry } from './AgentConfig';
import { appendUsageLog } from './AgentConfig';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AiAnalysisResult {
  ok: boolean;
  summary: string;
  recommendations: string[];
  anomalyScore: number; // 0.0 (clean) to 1.0 (critical)
  rawResponse?: string;
  error?: string;
}

export interface AiLabelSuggestion {
  ok: boolean;
  suggestions: string[];
  error?: string;
}

export interface KeySummary {
  keyId: string;
  label: string;
  scopes: string[];
  createdAt: string;
  active: boolean;
  daysSinceCreation: number;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function daysSince(isoDate: string): number {
  const ms = Date.now() - new Date(isoDate).getTime();
  return Math.floor(ms / 86_400_000);
}

async function ollamaGenerate(
  model: string,
  systemPrompt: string,
  userMessage: string,
  temperature: number
): Promise<string> {
  // Use Tauri IPC conversation_generate so all traffic goes through One Door
  const ipcResult = await safeInvokeCanonical<string>(
    'conversation_generate',
    {
      prompt: userMessage,
      model,
      temperature,
      system: systemPrompt,
      max_tokens: 512,
    }
  );
  if (!ipcResult.ok || !ipcResult.content) {
    throw new Error(ipcResult.error?.message ?? 'Ollama returned no content');
  }
  return ipcResult.content;
}

// ─── AgentAI class ───────────────────────────────────────────────────────────

export class AgentAI {
  constructor(private config: AgentConfig) {}

  /** Update the config reference (called when user saves new config) */
  updateConfig(config: AgentConfig): void {
    this.config = config;
  }

  /**
   * Analyse the full key list and return AI recommendations.
   * Fails gracefully with `ok: false` when Ollama is unreachable.
   */
  async analyzeKeyUsage(
    keys: KeySummary[],
    usageLog: UsageLogEntry[]
  ): Promise<AiAnalysisResult> {
    try {
      const keySummary = keys
        .map(
          k =>
            `- [${k.keyId.slice(0, 12)}] "${k.label}" | scopes: ${k.scopes.join(',')} | ${k.daysSinceCreation}j | actif: ${k.active}`
        )
        .join('\n');

      const logSummary = usageLog
        .slice(-30)
        .map(
          e =>
            `${e.ts.slice(0, 16)} ${e.action} ${e.keyId?.slice(0, 12) ?? '-'} ${e.detail ?? ''}`
        )
        .join('\n');

      const prompt = `INVENTAIRE DES CLÉS API (${keys.length} clés):
${keySummary || 'Aucune clé active.'}

LOG D'UTILISATION (30 dernières entrées):
${logSummary || 'Aucun log.'}

Analyse la sécurité et l'utilisation de ces clés. Réponds en JSON strictement:
{
  "summary": "résumé en 1-2 phrases",
  "recommendations": ["conseil1", "conseil2"],
  "anomaly_score": 0.0
}`;

      appendUsageLog({ action: 'ai_query', detail: 'analyzeKeyUsage' });

      const raw = await ollamaGenerate(
        this.config.training.model,
        this.config.training.systemPrompt,
        prompt,
        this.config.training.temperature
      );

      // Parse the JSON block from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          ok: true,
          summary: raw.slice(0, 200),
          recommendations: [],
          anomalyScore: 0,
          rawResponse: raw,
        };
      }
      const parsed = JSON.parse(jsonMatch[0]) as {
        summary?: string;
        recommendations?: string[];
        anomaly_score?: number;
      };
      return {
        ok: true,
        summary: parsed.summary ?? '',
        recommendations: parsed.recommendations ?? [],
        anomalyScore: Math.min(1, Math.max(0, parsed.anomaly_score ?? 0)),
        rawResponse: raw,
      };
    } catch (err) {
      return {
        ok: false,
        summary: '',
        recommendations: [],
        anomalyScore: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Ask the agent to suggest key labels for a given context description.
   */
  async suggestLabels(context: string): Promise<AiLabelSuggestion> {
    try {
      const prompt = `Contexte d'usage d'une clé API TITANE: "${context}"
Suggère 3 labels courts, clairs et descriptifs pour cette clé.
Réponds en JSON: { "suggestions": ["label1", "label2", "label3"] }`;

      appendUsageLog({ action: 'ai_query', detail: 'suggestLabels' });

      const raw = await ollamaGenerate(
        this.config.training.model,
        this.config.training.systemPrompt,
        prompt,
        0.5
      );

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return { ok: true, suggestions: [] };
      const parsed = JSON.parse(jsonMatch[0]) as { suggestions?: string[] };
      return { ok: true, suggestions: parsed.suggestions ?? [] };
    } catch (err) {
      return {
        ok: false,
        suggestions: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Check which keys need rotation according to the configured policy.
   */
  getRotationWarnings(
    keys: KeySummary[]
  ): { keyId: string; label: string; days: number; critical: boolean }[] {
    const { autoRotateDays, warnAfterDays } = this.config.rotation;
    if (warnAfterDays === 0) return [];
    return keys
      .filter(k => k.active && k.daysSinceCreation >= warnAfterDays)
      .map(k => ({
        keyId: k.keyId,
        label: k.label,
        days: k.daysSinceCreation,
        critical: autoRotateDays > 0 && k.daysSinceCreation >= autoRotateDays,
      }));
  }
}
