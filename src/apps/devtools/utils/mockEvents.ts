/**
 * TITANE∞ v30.0.0 — DevTools Mock Events
 * Super Prompt #3: DevTools UI Advanced Suite — Phase 4 + 5
 * Simulateur d'événements temps réel pour démo/développement
 * v30: Ajout Journal d'Exécution OMEGA, traces de raisonnement, état cognitif
 * @license MIT
 */

import { emit } from '@tauri-apps/api/event';
import type {
  EngineStatus,
  LogLevel,
  JournalEntry,
  ReasoningTrace,
  CognitiveState,
  KernelMetrics,
} from '../store/devtools.store';

/**
 * Envoie une mise à jour de statut d'engine
 */
export async function sendEngineStatusUpdate(
  engineId: string,
  updates: {
    status?: EngineStatus;
    cpuUsage?: number;
    memoryUsage?: number;
    errorCount?: number;
    lastExecutionTime?: string;
    lastExecutionDuration?: number;
  }
) {
  try {
    await emit('engine-status-update', {
      id: engineId,
      ...updates,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send engine status update:', error);
  }
}

/**
 * Envoie une mise à jour de métrique
 */
export async function sendMetricUpdate(metricId: string, value: number) {
  try {
    await emit('metrics-update', {
      id: metricId,
      value,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send metric update:', error);
  }
}

/**
 * Envoie une ligne de log
 */
export async function sendLogLine(
  level: LogLevel,
  message: string,
  source: string,
  details?: string
) {
  try {
    await emit('log-line', {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      level,
      message,
      source,
      timestamp: new Date().toISOString(),
      details,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send log line:', error);
  }
}

/**
 * Envoie une erreur
 */
export async function sendError(
  engine: string,
  message: string,
  impact: 'high' | 'medium' | 'low',
  stack?: string
) {
  try {
    await emit('error-raised', {
      id: `error-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      engine,
      message,
      impact,
      timestamp: new Date().toISOString(),
      resolved: false,
      stack,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send error:', error);
  }
}

/**
 * Démarre une simulation d'activité système
 *
 * @param intervalMs - Intervalle entre chaque événement (défaut: 2000ms)
 * @returns Fonction pour arrêter la simulation
 *
 * @example
 * ```tsx
 * const stopSimulation = startMockActivity(2000);
 * // Plus tard...
 * stopSimulation();
 * ```
 */
export function startMockActivity(intervalMs = 2000): () => void {
  const engines = [
    'helios',
    'nexus',
    'sentinel',
    'harmonia',
    'memoryCore',
    'orchestrator',
    'style',
    'coherence',
    'engine-omega',
  ];

  const logLevels: LogLevel[] = ['info', 'warn', 'error', 'debug'];
  const logMessages = [
    'Processing request',
    'Cache hit',
    'Memory optimized',
    'Connection established',
    'Task completed',
    'Warning: High CPU usage',
    'Error: Connection timeout',
    'Debug: State updated',
  ];

  let active = true;

  const tick = async () => {
    if (!active) return;

    try {
      // Random engine status update
      if (Math.random() > 0.7) {
        const engine = engines[Math.floor(Math.random() * engines.length)] ?? 'unknown';
        await sendEngineStatusUpdate(engine, {
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 200,
        });
      }

      // Random metric update
      if (Math.random() > 0.5) {
        const metrics = [
          'ipc-latency-p50',
          'ipc-latency-p90',
          'omega-duration',
          'cpu-usage',
          'memory-usage',
        ];
        const metric = metrics[Math.floor(Math.random() * metrics.length)] ?? 'cpu-usage';
        const value = metric.includes('latency')
          ? Math.random() * 100
          : metric.includes('duration')
            ? Math.random() * 500
            : Math.random() * 100;
        await sendMetricUpdate(metric, value);
      }

      // Random log line
      if (Math.random() > 0.3) {
        const level = logLevels[Math.floor(Math.random() * logLevels.length)] ?? 'info';
        const message =
          logMessages[Math.floor(Math.random() * logMessages.length)] ?? 'Log message';
        const source = engines[Math.floor(Math.random() * engines.length)] ?? 'unknown';
        await sendLogLine(level, message, source);
      }

      // Random error (rare)
      if (Math.random() > 0.95) {
        const engine = engines[Math.floor(Math.random() * engines.length)] ?? 'unknown';
        const impacts: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
        const impact = impacts[Math.floor(Math.random() * impacts.length)];
        if (engine && impact) {
          await sendError(
            engine,
            'Unexpected error occurred',
            impact,
            `Error at ${engine}:42:15\n  at handleRequest (engine.ts:42:15)\n  at process (core.ts:87:20)`
          );
        }
      }

      // v30: Simulate OMEGA journal execution (every ~8 ticks on average)
      if (Math.random() > 0.88) {
        simulateOmegaExecution().catch(e =>
          console.error('[MockEvents] Journal simulation error:', e)
        );
      }
    } catch (error) {
      console.error('[MockEvents] Tick error:', error);
    }

    // Schedule next tick
    if (active) {
      setTimeout(tick, intervalMs);
    }
  };

  // Start simulation
  tick();

  // Return stop function
  return () => {
    active = false;
  };
}

// ─────────────────────────────────────────────────────────────────
// v30.0.0 — JOURNAL D'EXÉCUTION OMEGA MOCK HELPERS
// ─────────────────────────────────────────────────────────────────

const MOCK_MODES = [
  'OMEGA',
  'ARCHITECT',
  'DEEP_REASONING',
  'CERTIFY',
  'CREATIVE',
  'default',
];
const MOCK_PROVIDERS = ['ollama', 'openai', 'copilot', 'anthropic'];
const MOCK_EFFORT = ['max', 'high', 'medium', 'low'];
const MOCK_REQUESTS = [
  'Explique-moi la théorie de la relativité restreinte et ses implications',
  'Crée un plan complet pour un business SaaS B2B dans le domaine de la fintech',
  'Analyse les tendances actuelles du marché crypto et donne une stratégie',
  'Optimise ce code TypeScript pour les performances en production',
  "Génère une stratégie marketing complète pour le lancement d'un produit",
  "Continue à développer l'architecture OMEGA et améliore la cohérence",
];
const MOCK_RESPONSES = [
  "La relativité restreinte d'Einstein postule que les lois de la physique sont identiques dans tous les référentiels inertiels…",
  'Plan SaaS B2B Fintech: Phase 1 — MVP ciblé sur la gestion de trésorerie pour PME. KPIs: MRR, churn rate, CAC…',
  'Analyse crypto 2026: Bitcoin maintient sa dominance à 52%, ETH Layer-2 en forte croissance. Stratégie recommandée…',
  'Optimisation TypeScript: Remplacement des Map<string,any> par des types stricts, élimination des allocations hot-path…',
  'Stratégie marketing Q2 2026: Axe 1 — Content marketing thought leadership. Axe 2 — Communauté Discord…',
  'Architecture OMEGA v30: Renforcement du kernel canonique avec propagation EffortLevel max → chaîne complète…',
];

const MOCK_REASONING_THOUGHTS = [
  {
    label: "Analyse de l'entrée",
    thought:
      'Je reçois une requête complexe. Je détecte des signaux linguistiques qui indiquent un besoin de raisonnement approfondi. La longueur et la structure de la phrase suggèrent une attente de réponse détaillée et structurée.',
    decision: 'Traitement avancé requis',
  },
  {
    label: "Classification de l'intention",
    thought:
      "L'intention principale est informationnelle/analytique. Je détecte des concepts clés: architecture, optimisation, cohérence. Les signaux DEEP_REASONING sont présents (continue, développe, optimise). Score OMEGA élevé.",
    decision: 'Mode DEEP_REASONING ou OMEGA',
  },
  {
    label: 'Sélection du mode cognitif',
    thought:
      "Évaluation des modes disponibles: OMEGA (score 87), ARCHITECT (score 72), DEEP_REASONING (score 68). La cohérence Singularité est à 89%, ce qui booste le mode OMEGA. Contexte conversationnel: continuation d'un fil existant.",
    decision: 'Mode OMEGA sélectionné',
  },
  {
    label: 'Sélection du provider',
    thought:
      'Provider Ollama disponible avec latence 23ms. OpenAI disponible mais quota limité. Copilot disponible. Pour un effort "max", Ollama local offre le meilleur ratio qualité/latence pour ce type de requête.',
    decision: 'Provider: Ollama (llama3.1)',
  },
  {
    label: 'Engagement des moteurs',
    thought:
      'Activation: MemoryCore (STM + LTM), Coherence Engine, Harmonia (style), Nexus (knowledge). La base de connaissances contient 116 catégories pertinentes. Extraction de contexte conversationnel: 47 tokens pertinents récupérés.',
    decision: '5 moteurs engagés',
  },
  {
    label: 'Construction du prompt système',
    thought:
      'Assemblage du contexte: instructions système v30, profil utilisateur ARCHITECT_LEVEL, contexte conversationnel (3 derniers tours), base de connaissances pertinente (8 fragments). Effort max → chain-of-thought addendum inclus.',
    decision: 'Prompt système optimisé',
  },
  {
    label: 'Génération de la réponse',
    thought:
      'Streaming en cours vers Ollama. Température: 0.7 (profil OMEGA). Max tokens: 4096. La réponse se forme progressivement. Détection de cohérence interne: 92%. Pas de contradiction avec le contexte précédent.',
    decision: 'Réponse générée avec succès',
  },
  {
    label: 'Réflexion qualitative',
    thought:
      'Évaluation post-réponse: cohérence 94%, profondeur analytique bonne, structure claire. La réponse couvre tous les aspects demandés. XP attribué: 42 points (tier excellent × multiplicateur 3.5). Mise à jour LTM recommandée.',
    decision: 'Qualité: Excellent (42 XP)',
  },
];

const MOCK_CONCEPTS = [
  ['OMEGA', 'architecture', 'optimisation', 'cohérence'],
  ['fintech', 'SaaS', 'B2B', 'stratégie', 'MVP'],
  ['crypto', 'blockchain', 'DeFi', 'analyse'],
  ['TypeScript', 'performance', 'optimisation', 'code'],
  ['marketing', 'stratégie', 'lancement', 'croissance'],
  ['intelligence', 'artificielle', 'raisonnement', 'singularité'],
];

/** Envoie une mise à jour de l'état cognitif */
export async function sendCognitiveStateUpdate(update: Partial<CognitiveState>) {
  try {
    await emit('cognitive-state-update', update);
  } catch (error) {
    console.error('[MockEvents] Failed to send cognitive state update:', error);
  }
}

/** Envoie une trace de raisonnement */
export async function sendReasoningTrace(trace: ReasoningTrace) {
  try {
    await emit('omega-reasoning-trace', trace);
  } catch (error) {
    console.error('[MockEvents] Failed to send reasoning trace:', error);
  }
}

/** Envoie une entrée de journal */
export async function sendJournalEntry(entry: JournalEntry) {
  try {
    await emit('omega-journal-entry', entry);
  } catch (error) {
    console.error('[MockEvents] Failed to send journal entry:', error);
  }
}

/** Envoie les métriques du kernel OMEGA */
export async function sendKernelMetrics(metrics: KernelMetrics) {
  try {
    await emit('omega-kernel-metrics', metrics);
  } catch (error) {
    console.error('[MockEvents] Failed to send kernel metrics:', error);
  }
}

/** Simule une exécution OMEGA complète avec état cognitif et trace de raisonnement */
export async function simulateOmegaExecution() {
  const mode = MOCK_MODES[Math.floor(Math.random() * MOCK_MODES.length)] ?? 'OMEGA';
  const provider =
    MOCK_PROVIDERS[Math.floor(Math.random() * MOCK_PROVIDERS.length)] ?? 'ollama';
  const effort = MOCK_EFFORT[Math.floor(Math.random() * MOCK_EFFORT.length)] ?? 'high';
  const reqIdx = Math.floor(Math.random() * MOCK_REQUESTS.length);
  const request = MOCK_REQUESTS[reqIdx] ?? MOCK_REQUESTS[0] ?? '';
  const response = MOCK_RESPONSES[reqIdx] ?? MOCK_RESPONSES[0] ?? '';
  const concepts = MOCK_CONCEPTS[reqIdx] ?? MOCK_CONCEPTS[0] ?? [];
  const coherence = 80 + Math.floor(Math.random() * 20);
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // 1. Mark thinking
  await sendCognitiveStateUpdate({
    status: 'thinking',
    currentMode: mode,
    currentProvider: provider,
    effortLevel: effort,
    singularityCoherence: coherence,
    processingLoad: 30 + Math.floor(Math.random() * 40),
    lastRequestAt: Date.now(),
  });

  // 2. Build reasoning trace incrementally (simulate steps appearing)
  const steps = MOCK_REASONING_THOUGHTS.slice(0, 4 + Math.floor(Math.random() * 4));
  const traceSteps = steps.map((s, i) => ({
    id: `step-${i}`,
    label: s.label,
    thought: s.thought,
    decision: s.decision,
    confidence: 75 + Math.floor(Math.random() * 25),
    durationMs: 30 + Math.floor(Math.random() * 200),
    timestamp: Date.now() + i * 50,
  }));

  const startedAt = Date.now();
  await sendReasoningTrace({
    requestId,
    startedAt,
    steps: traceSteps,
    finalMode: mode,
    selectedProvider: provider,
    effortLevel: effort,
    singularityCoherence: coherence,
    keyConceptsExtracted: concepts,
  });

  // 3. Mark responding
  await sendCognitiveStateUpdate({
    status: 'responding',
    processingLoad: 70 + Math.floor(Math.random() * 20),
  });

  // 4. Mark reflecting + complete trace
  await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
  await sendCognitiveStateUpdate({ status: 'reflecting', processingLoad: 20 });

  const totalMs = 200 + Math.floor(Math.random() * 1500);
  const completedTrace: ReasoningTrace = {
    requestId,
    startedAt,
    completedAt: startedAt + totalMs,
    steps: traceSteps,
    finalMode: mode,
    selectedProvider: provider,
    effortLevel: effort,
    singularityCoherence: coherence,
    keyConceptsExtracted: concepts,
    reflectionNotes: `Réponse de qualité "${totalMs < 500 ? 'excellent' : totalMs < 1000 ? 'good' : 'basic'}". Cohérence ${coherence}%. XP accordé.`,
  };
  await sendReasoningTrace(completedTrace);

  // 5. Create pipeline steps
  const pipelineSteps = [
    {
      id: 'input',
      name: 'Entrée',
      status: 'complete' as const,
      duration: 5,
      outputSummary: `Message reçu: "${request.slice(0, 50)}…"`,
    },
    {
      id: 'normalize',
      name: 'Normalisation',
      status: 'complete' as const,
      duration: 12,
      engines: ['Helios'],
      outputSummary: 'Tokenisation + extraction concepts réussie',
    },
    {
      id: 'coherence',
      name: 'Cohérence',
      status: 'complete' as const,
      duration: 45,
      engines: ['Coherence', 'SingularityBridge'],
      outputSummary: `Score: ${coherence}%`,
    },
    {
      id: 'memory',
      name: 'Mémoire',
      status: 'complete' as const,
      duration: 38,
      engines: ['MemoryCore'],
      outputSummary: '47 tokens contexte récupérés, 3 souvenirs LTM activés',
    },
    {
      id: 'engines',
      name: 'Moteurs',
      status: 'complete' as const,
      duration: 67,
      engines: ['Harmonia', 'Nexus', 'Engine∞'],
      outputSummary: `Mode ${mode} activé, effort ${effort}`,
    },
    {
      id: 'conversation',
      name: 'Génération',
      status: 'complete' as const,
      duration: totalMs - 167,
      engines: [provider],
      outputSummary: `Réponse générée: "${response.slice(0, 60)}…"`,
    },
    {
      id: 'output',
      name: 'Sortie',
      status: 'complete' as const,
      duration: 8,
      outputSummary: 'Stream envoyé au client',
    },
  ];

  // 6. Send journal entry
  await sendJournalEntry({
    id: requestId,
    timestamp: startedAt,
    requestPreview: request.slice(0, 80),
    responsePreview: response.slice(0, 80),
    mode,
    provider,
    effortLevel: effort,
    totalDurationMs: totalMs,
    pipeline: pipelineSteps,
    reasoningTrace: completedTrace,
    success: true,
  });

  // 7. Back to idle
  await sendCognitiveStateUpdate({ status: 'idle', processingLoad: 0 });

  // 8. Emit kernel metrics update (cumulative simulation)
  const profileKeys = ['OMEGA', 'ARCHITECT', 'DEEP', 'DEVELOPED', 'BALANCED', 'DIRECT'];
  const dist: Record<string, number> = {};
  profileKeys.forEach(k => {
    dist[k] = Math.floor(Math.random() * 10);
  });
  const topKey = mode === 'OMEGA' ? 'OMEGA' : 'ARCHITECT';
  dist[topKey] = (dist[topKey] ?? 0) + 3;
  await sendKernelMetrics({
    totalDecisions: 12 + Math.floor(Math.random() * 40),
    avgConfidence: 0.72 + Math.random() * 0.22,
    avgProcessingTimeMs: 18 + Math.random() * 30,
    profileDistribution: dist,
    fallbackRate: Math.random() * 0.12,
  });
}
