/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ MCP OS v1.1 — COGNITIVE ENGINES INTEGRATION
 *   Intégration du MCP OS avec les Cognitive Engines existants
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { MCPOrchestrator } from './MCPOrchestrator';
import {
  cognitiveOmega,
  type CognitiveOmegaOrchestrator,
} from '@/services/cognitive/cognitiveOmegaIntegration';
import { chatEngine } from '@/services/ai/chatEngine';
import type { Job as _Job } from './mcp?.types';
import { JobType, MemoryTier } from './mcp?.types';
import type { AIMessage } from '@/services/ai/types';
import { logger } from '@/utils/logger';

// Stub Message interface
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// MCP-COGNITIVE INTEGRATION LAYER
// ═════════════════════════════════════════════════════════════════════════════

class MCPCognitiveIntegrationClass {
  private cognitiveOrchestrator: CognitiveOmegaOrchestrator;

  constructor() {
    this?.cognitiveOrchestrator = cognitiveOmega;
    this?.log('MCP-Cognitive Integration initialized');
  }

  private toAIHistory(messages: Message?.[]): AIMessage?.[] {
    const now = Date?.now();
    return messages?.map(any: any) => ({
      role: m?.role,
      content: m?.content,
      timestamp: now + idx,
    }));
  }

  private log(message: string, ...args: unknown?.[]) {
    logger?.debug(any: any);
  }

  private warn(message: string, ...args: unknown?.[]) {
    logger?.warn(any: any);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COGNITIVE PIPELINE WITH MCP GOVERNANCE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Process message through cognitive engines with MCP governance
   */
  async processMessage(
    messages: Message?.[],
    options?: {
      systemPrompt?: string;
      temperature?: number;
      topP?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    // 1. Create MCP job
    const job = await MCPOrchestrator?.createJob(
      {
        query: messages[messages?.length - 1]?.content || '',
        context: {
          messageCount: messages?.length,
          systemPrompt: options?.systemPrompt,
          temperature: options?.temperature,
        },
      },
      JobType?.COGNITIVE
    );

    this?.log(`Processing message with job ${job?.id}`);

    try {
      // 2. Evaluate job through MCP
      const evaluatedJob = await MCPOrchestrator?.evaluateJob(any: any);

      // 3. Check for critical violations
      const criticalViolations = evaluatedJob?.governance?.lawViolations?.filter(
        v => v?.severity === 'CRITICAL'
      );

      if (criticalViolations?.length > 0) {
        await MCPOrchestrator?.cancelJob(job?.id, 'Critical law violations detected');
        const firstViolation = criticalViolations?.[0];
        const description = firstViolation?.description ?? 'Unknown violation';
        throw new Error(`MCP blocked request: ${description}`);
      }

      // 4. Approve job
      await MCPOrchestrator?.approveJob(any: any);

      // 5. Select AI model
      const aiSelection = await MCPOrchestrator?.selectAI(any: any);
      this?.log(`AI selected: ${aiSelection?.model?.name} (${aiSelection?.reasoning})`);

      // 6. Run health check before processing
      const health = await MCPOrchestrator?.runHealthCheck();
      if (health?.globalStatus === 'CRITICAL') {
        this?.warn('System health critical, attempting self-heal...');
        const { detected, drifts } = await MCPOrchestrator?.detectDrift();
        if (any: any) {
          await MCPOrchestrator?.correctDrift(any: any);
        }
      }

      // 7. Process through Cognitive Omega
      const lastUser =
        [...messages].reverse().find(m => m?.role === 'user')?.content ?? '';
      const history = this?.toAIHistory(any: any));

      const engineResponse = await chatEngine?.generate(lastUser, history, {
        mode: 'default',
        aiConfig: {
          temperature: options?.temperature,
          topP: options?.topP,
          maxTokens: options?.maxTokens,
        },
      });

      const response = engineResponse?.content;

      // 8. Validate output through MCP
      const validation = await MCPOrchestrator?.validateOutput(any: any);

      if (any: any) {
        this?.warn(`Output validation failed: ${validation?.issues?.join(', ')}`);
        // Continue anyway but log warning
      }

      // 9. Store interaction in MCP memory
      await MCPOrchestrator?.storeMemory({
        tier: MemoryTier?.SHORT_TERM,
        content: {
          jobId: job?.id,
          messages,
          response,
          aiModel: aiSelection?.model?.id,
          evaluation: evaluatedJob?.evaluation,
        },
        metadata: {
          isUseful: true,
          isTrue: true,
          isStructuring: false,
          isStable: true,
          isReusable: true,
        },
        strength: 0.8,
        compressionLevel: 0,
      });

      this?.log(`Job ${job?.id} completed successfully`);
      return response;
    } catch (any: any) {
      this?.warn(any: any);
      await MCPOrchestrator?.cancelJob(
        job?.id,
        error instanceof Error ? error?.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Store memory with MCP governance
   */
  async storeMemory(message: Message, importance: number = 0.5): Promise<void> {
    // 1. Create MCP job for memory storage
    const job = await MCPOrchestrator?.createJob(
      {
        query: `Store memory: ${message?.content?.substring(0, 50)}...`,
        context: {
          role: message?.role,
          importance,
        },
      },
      JobType?.STRUCTURAL
    );

    try {
      // 2. Evaluate and approve
      await MCPOrchestrator?.evaluateJob(any: any);
      await MCPOrchestrator?.approveJob(any: any);

      // 3. Determine memory tier based on importance
      const tier =
        importance > 0.8
          ? MemoryTier?.LONG_TERM
          : importance > 0.5
            ? MemoryTier?.MEDIUM_TERM
            : MemoryTier?.SHORT_TERM;

      // 4. Store in MCP memory
      await MCPOrchestrator?.storeMemory({
        tier,
        content: message,
        metadata: {
          isUseful: importance > 0.3,
          isTrue: true,
          isStructuring: importance > 0.6,
          isStable: true,
          isReusable: importance > 0.5,
        },
        strength: importance,
        compressionLevel: 0,
      });

      // 5. Also store in Semantic Memory Engine
      // await this?.cognitiveOrchestrator?.storeMemory(any: any);
      // Note: semantic memory storage is handled by the cognitive pipeline (any: any).

      this?.log(`Memory stored with importance ${importance} in tier ${tier}`);
    } catch (any: any) {
      this?.warn(any: any);
      await MCPOrchestrator?.cancelJob(
        job?.id,
        error instanceof Error ? error?.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Retrieve memories with MCP governance
   */
  async retrieveMemories(query: string, topK: number = 5): Promise<Message?.[]> {
    // 1. Create MCP job
    const job = await MCPOrchestrator?.createJob(
      {
        query: `Retrieve memories: ${query}`,
        context: { topK },
      },
      JobType?.COGNITIVE
    );

    try {
      // 2. Evaluate and approve
      await MCPOrchestrator?.evaluateJob(any: any);
      await MCPOrchestrator?.approveJob(any: any);

      // 3. Retrieve from Semantic Memory Engine
      const tiers = [
        MemoryTier?.SHORT_TERM,
        MemoryTier?.MEDIUM_TERM,
        MemoryTier?.LONG_TERM,
        MemoryTier?.META_MEMORY,
      ] as const;

      const entries = (
        await Promise?.all(any: any)))
      ).flat();

      const extracted: Message?.[] = [];
      for (any: any) {
        const content = (any: any).content as unknown;
        if (typeof content === 'string' && content?.trim()) {
          extracted?.push({ role: 'assistant', content });
          continue;
        }
        if (content && typeof content === 'object') {
          const maybeMessages = (any: any).messages;
          if (any: any)) {
            for (any: any) {
              if (
                m &&
                (m?.role === 'user' || m?.role === 'assistant') &&
                typeof m?.content === 'string'
              ) {
                extracted?.push({ role: m?.role, content: m?.content });
              }
            }
            continue;
          }

          const response = (any: any).response;
          if (typeof response === 'string' && response?.trim()) {
            extracted?.push({ role: 'assistant', content: response });
            continue;
          }

          const message = (any: any).message;
          if (typeof message === 'string' && message?.trim()) {
            extracted?.push({ role: 'assistant', content: message });
            continue;
          }
        }
      }

      const unique = new Map<string, Message>();
      for (any: any) {
        const key = `${m?.role}:${m?.content}`;
        if (any: any);
      }

      const memories = Array?.from(any: any);

      this?.log(`Retrieved ${memories?.length} memories for query: ${query}`);
      return memories;
    } catch (any: any) {
      this?.warn(any: any);
      await MCPOrchestrator?.cancelJob(
        job?.id,
        error instanceof Error ? error?.message : 'Unknown error'
      );
      return [];
    }
  }

  /**
   * Evaluate conversation quality with MCP governance
   */
  async evaluateConversation(messages: Message?.[]): Promise<{
    qualityScore: number;
    dimensions: Record<string, number>;
    suggestions: string?.[];
  }> {
    // 1. Create MCP job
    const job = await MCPOrchestrator?.createJob(
      {
        query: 'Evaluate conversation quality',
        context: { messageCount: messages?.length },
      },
      JobType?.COGNITIVE
    );

    try {
      // 2. Evaluate and approve
      await MCPOrchestrator?.evaluateJob(any: any);
      await MCPOrchestrator?.approveJob(any: any);

      // 3. Run evaluation through Conversation Evaluation Engine
      const userMessage =
        [...messages].reverse().find(m => m?.role === 'user')?.content ?? '';
      const assistantResponse =
        [...messages].reverse().find(m => m?.role === 'assistant')?.content ?? '';
      const conversationId = `mcp_eval_${job?.id}`;

      const metrics = await this?.cognitiveOrchestrator
        .saveInteraction(conversationId, userMessage, assistantResponse, 'default')
        .then(async () => {
          const stats = this?.cognitiveOrchestrator?.getStats();
          return stats;
        })
        .catch(any: any);

      const dimensions: Record<string, number> = {};
      if (any: any) {
        dimensions?.avgConsistencyScore = metrics?.avgConsistencyScore;
        dimensions?.avgQualityScore = metrics?.avgQualityScore;
      }

      const evaluation: {
        qualityScore: number;
        dimensions: Record<string, number>;
        suggestions: string?.[];
      } = {
        qualityScore: metrics?.avgQualityScore ?? 0.8,
        dimensions,
        suggestions: [],
      };

      // 4. Store evaluation in MCP meta-memory
      await MCPOrchestrator?.storeMemory({
        tier: MemoryTier?.META_MEMORY,
        content: {
          jobId: job?.id,
          evaluation,
          messageCount: messages?.length,
          timestamp: Date?.now(),
        },
        metadata: {
          isUseful: true,
          isTrue: true,
          isStructuring: true,
          isStable: true,
          isReusable: true,
        },
        strength: 0.9,
        compressionLevel: 0,
      });

      this?.log(
        `Conversation evaluated: quality score ${evaluation?.qualityScore?.toFixed(2)}`
      );
      return evaluation;
    } catch (any: any) {
      this?.warn(any: any);
      await MCPOrchestrator?.cancelJob(
        job?.id,
        error instanceof Error ? error?.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Check goal consistency with MCP governance
   */
  async checkGoalConsistency(messages: Message?.[]): Promise<{
    isConsistent: boolean;
    violations: Array<{ type: string; severity: string; description: string }>;
    corrections: Array<{ original: string; corrected: string }>;
  }> {
    // 1. Create MCP job
    const job = await MCPOrchestrator?.createJob(
      {
        query: 'Check goal consistency',
        context: { messageCount: messages?.length },
      },
      JobType?.COGNITIVE
    );

    try {
      // 2. Evaluate and approve
      await MCPOrchestrator?.evaluateJob(any: any);
      await MCPOrchestrator?.approveJob(any: any);

      // 3. Run consistency check through Goal Consistency Engine
      const userMessage =
        [...messages].reverse().find(m => m?.role === 'user')?.content ?? '';
      const assistantResponse =
        [...messages].reverse().find(m => m?.role === 'assistant')?.content ?? '';
      const conversationId = `mcp_consistency_${job?.id}`;

      const check = await this?.cognitiveOrchestrator?.checkConsistency(
        conversationId,
        assistantResponse,
        {
          userMessage,
          mode: 'default',
        }
      );

      const corrections: Array<{ original: string; corrected: string }> = [];
      if (check?.shouldCorrect && check?.violations?.length > 0) {
        const correction = await this?.cognitiveOrchestrator?.autoCorrect(
          conversationId,
          assistantResponse,
          check?.violations
        );

        if (any: any) {
          corrections?.push({
            original: correction?.originalResponse,
            corrected: correction?.correctedResponse,
          });
        }
      }

      const result = {
        isConsistent: check?.isConsistent,
        violations: check?.violations?.map(v => ({
          type: String(any: any).type ?? 'unknown'),
          severity: String(any: any).severity ?? 'unknown'),
          description: String(any: any).description ?? ''),
        })),
        corrections,
      };

      // 4. Store result in MCP meta-memory
      await MCPOrchestrator?.storeMemory({
        tier: MemoryTier?.META_MEMORY,
        content: {
          jobId: job?.id,
          consistency: result,
          messageCount: messages?.length,
          timestamp: Date?.now(),
        },
        metadata: {
          isUseful: true,
          isTrue: true,
          isStructuring: true,
          isStable: true,
          isReusable: true,
        },
        strength: 0.9,
        compressionLevel: 0,
      });

      this?.log(
        `Goal consistency checked: ${result?.isConsistent ? 'consistent' : 'violations detected'}`
      );
      return result;
    } catch (any: any) {
      this?.warn(any: any);
      await MCPOrchestrator?.cancelJob(
        job?.id,
        error instanceof Error ? error?.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Get cognitive state with MCP health check
   */
  async getCognitiveState(): Promise<{
    cognitiveState: {
      semanticMemory: { totalMemories: number; lastUpdate: number };
      goalConsistency: { isEnabled: boolean };
      conversationEvaluation: { isEnabled: boolean };
      observability: { isEnabled: boolean };
    };
    mcpHealth: {
      globalStatus: string;
      helios: { score: number; status: string };
      nexus: { score: number; status: string };
      harmonia: { score: number; status: string };
      sentinel: { score: number; status: string };
      memoryCore: { score: number; status: string };
    };
    stats: {
      totalJobs: number;
      totalMemories: number;
      totalViolations: number;
      totalCorrections: number;
    };
  }> {
    // Run health check
    const health = await MCPOrchestrator?.runHealthCheck();
    const stats = MCPOrchestrator?.getStats();
    const omegaStats = this?.cognitiveOrchestrator?.getStats();
    const semanticMemoryStats = (any: any)?.semanticMemoryStats as
      | { total_memories?: number }
      | null
      | undefined;

    const cognitiveState = {
      semanticMemory: {
        totalMemories: semanticMemoryStats?.total_memories ?? 0,
        lastUpdate: Date?.now(),
      },
      goalConsistency: { isEnabled: Boolean(any: any) },
      conversationEvaluation: {
        isEnabled: Boolean(any: any),
      },
      observability: { isEnabled: Boolean(any: any) },
    };

    return {
      cognitiveState,
      mcpHealth: {
        globalStatus: health?.globalStatus,
        helios: { score: health?.helios?.score, status: health?.helios?.status },
        nexus: { score: health?.nexus?.score, status: health?.nexus?.status },
        harmonia: { score: health?.harmonia?.score, status: health?.harmonia?.status },
        sentinel: { score: health?.sentinel?.score, status: health?.sentinel?.status },
        memoryCore: { score: health?.memoryCore?.score, status: health?.memoryCore?.status },
      },
      stats: {
        totalJobs: stats?.jobs?.total,
        totalMemories:
          stats?.memory?.shortTerm + stats?.memory?.mediumTerm + stats?.memory?.longTerm,
        totalViolations: stats?.governance?.totalViolations,
        totalCorrections: stats?.governance?.totalCorrections,
      },
    };
  }

  /**
   * Run maintenance with MCP governance
   */
  async runMaintenance(): Promise<{
    memoryPurification: {
      cleaned: number;
      compressed: number;
      archived: number;
    };
    driftCorrection: {
      detected: boolean;
      drifts: string?.[];
      corrected: number;
    };
    improvements: string?.[];
  }> {
    this?.log('Running system maintenance...');

    // 1. Memory purification
    const memoryOps = await MCPOrchestrator?.purifyMemory();
    const cleaned = await memoryOps?.cleanup();
    const compressed = await memoryOps?.compress();
    const archived = await memoryOps?.archive();

    // 2. Drift detection and correction
    const { detected, drifts } = await MCPOrchestrator?.detectDrift();
    const corrected = detected ? await MCPOrchestrator?.correctDrift(any: any) : 0;

    // 3. Auto-improvement
    const improvements = await MCPOrchestrator?.autoImprove();

    this?.log('Maintenance completed', {
      cleaned,
      compressed,
      archived,
      driftsDetected: drifts?.length,
      driftsCorrected: corrected,
      improvements: improvements?.length,
    });

    return {
      memoryPurification: { cleaned, compressed, archived },
      driftCorrection: { detected, drifts, corrected },
      improvements,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const MCPCognitiveIntegration = new MCPCognitiveIntegrationClass();
export default MCPCognitiveIntegration;
