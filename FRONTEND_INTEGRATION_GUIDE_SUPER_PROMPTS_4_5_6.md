# 🔌 GUIDE D'INTÉGRATION FRONTEND
## Super Prompts #4, #5, #6 — TypeScript & React

**Version :** 1.0.0
**Date :** 3 décembre 2025
**Public :** Développeurs Frontend

---

## 📋 TABLE DES MATIÈRES

1. [Types TypeScript](#types-typescript)
2. [Services](#services)
3. [Hook Unifié](#hook-unifié)
4. [Intégration Chat](#intégration-chat)
5. [Exemples d'Utilisation](#exemples-dutilisation)
6. [Monitoring](#monitoring)

---

## 1️⃣ TYPES TYPESCRIPT

### `src/types/conversation.ts`

```typescript
// ═══════════════════════════════════════════════════════════
// SUPER PROMPT #4 — CONVERSATIONAL REALISM
// ═══════════════════════════════════════════════════════════

export type IntentionLevel = 'Explicit' | 'Implicit' | 'Exploratory' | 'Confirmatory';
export type ConversationalRhythm = 'Rapid' | 'Steady' | 'Deliberate' | 'Hesitant';
export type MicroPrompt = 'Deepen' | 'Simplify' | 'Clarify' | 'Continue' | 'Redirect' | 'None';

export interface RealismRequest {
  context: string;
  user_message: string;
  draft_response: string;
  conversation_history: string[];
  recent_topics: string[];
}

export interface RealismResponse {
  finalized_response: string;
  micro_prompt: string | null;
  detected_rhythm: ConversationalRhythm;
  detected_intention: IntentionLevel;
  smart_links: string[];
  interaction_quality: InteractionQuality;
}

export interface InteractionQuality {
  fluidity: number;           // 0-1
  autonomy: number;           // 0-1
  coherence: number;          // 0-1
  natural_feel: number;       // 0-1
  cognitive_load: number;     // 0-1 (bas = mieux)
}

// ═══════════════════════════════════════════════════════════
// SUPER PROMPT #5 — EMOTIONAL SUBTLETY
// ═══════════════════════════════════════════════════════════

export type EnergyLevel = 'High' | 'Medium' | 'Low';
export type ClarityLevel = 'Clear' | 'Fuzzy' | 'VeryFuzzy';
export type MentalLoad = 'High' | 'Normal' | 'Low';
export type EmotionalState = 'Frustration' | 'Fatigue' | 'Confusion' | 'Enthusiasm' | 'Neutral';
export type ResponseTone = 'Calm' | 'Direct' | 'Expansive' | 'Analytical';

export interface EmotionalRequest {
  context: string;
  user_message: string;
  draft_response: string;
  conversation_velocity: number;  // messages par minute
  message_history: string[];
}

export interface EmotionalResponse {
  finalized_response: string;
  detected_energy: EnergyLevel;
  detected_clarity: ClarityLevel;
  detected_load: MentalLoad;
  detected_emotion: EmotionalState;
  applied_tone: ResponseTone;
  adaptation_quality: AdaptationQuality;
}

export interface AdaptationQuality {
  emotional_accuracy: number;    // 0-1
  tone_appropriateness: number;  // 0-1
  subtlety: number;              // 0-1
  support_level: number;         // 0-1
  cognitive_protection: number;  // 0-1
}

// ═══════════════════════════════════════════════════════════
// SUPER PROMPT #6 — BEHAVIORAL CONSISTENCY
// ═══════════════════════════════════════════════════════════

export type BehavioralDeviation =
  | 'ToneExcess'
  | 'StyleInconsistency'
  | 'RhythmIssue'
  | 'PostureShift'
  | 'ValueMisalignment'
  | 'None';

export interface BehavioralRequest {
  response_draft: string;
  conversation_context: string;
  previous_responses: string[];
  user_message: string;
}

export interface BehavioralResponse {
  finalized_response: string;
  deviations_detected: BehavioralDeviation[];
  corrections_applied: string[];
  consistency_score: ConsistencyScore;
}

export interface ConsistencyScore {
  tone_stability: number;         // 0-1
  style_coherence: number;        // 0-1
  rhythm_balance: number;         // 0-1
  posture_alignment: number;      // 0-1
  value_match: number;            // 0-1
  temporal_consistency: number;   // 0-1
  overall: number;                // 0-1
}

// ═══════════════════════════════════════════════════════════
// PIPELINE COMPLET
// ═══════════════════════════════════════════════════════════

export interface ConversationPipelineResult {
  final_response: string;
  realism: RealismResponse;
  emotional: EmotionalResponse;
  behavioral: BehavioralResponse;
  processing_time_ms: number;
}
```

---

## 2️⃣ SERVICES

### `src/services/realismService.ts`

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { RealismRequest, RealismResponse } from '@/types/conversation';

/**
 * Applique le réalisme conversationnel (Super Prompt #4)
 */
export async function processRealism(
  request: RealismRequest
): Promise<RealismResponse> {
  return await invoke<RealismResponse>('conversation_realism_process', {
    context: request.context,
    userMessage: request.user_message,
    draftResponse: request.draft_response,
    conversationHistory: request.conversation_history,
    recentTopics: request.recent_topics,
  });
}

/**
 * Améliore automatiquement une réponse avec le réalisme
 */
export async function autoEnhanceInteraction(
  userMessage: string,
  draftResponse: string,
  context: string = '',
  history: string[] = [],
  topics: string[] = []
): Promise<string> {
  const result = await processRealism({
    context,
    user_message: userMessage,
    draft_response: draftResponse,
    conversation_history: history,
    recent_topics: topics,
  });

  // Ajouter micro-prompt si pertinent
  if (result.micro_prompt) {
    return `${result.finalized_response}\n\n${result.micro_prompt}`;
  }

  return result.finalized_response;
}
```

---

### `src/services/emotionalService.ts`

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { EmotionalRequest, EmotionalResponse } from '@/types/conversation';

/**
 * Applique la subtilité émotionnelle (Super Prompt #5)
 */
export async function processEmotional(
  request: EmotionalRequest
): Promise<EmotionalResponse> {
  return await invoke<EmotionalResponse>('conversation_emotional_process', {
    context: request.context,
    userMessage: request.user_message,
    draftResponse: request.draft_response,
    conversationVelocity: request.conversation_velocity,
    messageHistory: request.message_history,
  });
}

/**
 * Détecte l'état émotionnel d'un message
 */
export async function detectEmotionalState(
  message: string,
  context: string = '',
  velocity: number = 1
): Promise<EmotionalResponse> {
  return await processEmotional({
    context,
    user_message: message,
    draft_response: '', // Juste pour détection
    conversation_velocity: velocity,
    message_history: [],
  });
}

/**
 * Adapte le ton selon l'état émotionnel détecté
 */
export function getAdaptationSuggestion(emotion: EmotionalResponse): string {
  switch (emotion.detected_emotion) {
    case 'Frustration':
      return 'Utilisateur frustré → Style direct, détendre';
    case 'Fatigue':
      return 'Utilisateur fatigué → Simplifier, 3 points max';
    case 'Confusion':
      return 'Utilisateur confus → Reformuler calmement';
    case 'Enthusiasm':
      return 'Utilisateur enthousiaste → Amplifier légèrement';
    default:
      return 'État neutre → Style standard';
  }
}
```

---

### `src/services/behavioralService.ts`

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { BehavioralRequest, BehavioralResponse } from '@/types/conversation';

/**
 * Vérifie la cohérence comportementale (Super Prompt #6)
 */
export async function checkBehavioral(
  request: BehavioralRequest
): Promise<BehavioralResponse> {
  return await invoke<BehavioralResponse>('conversation_behavioral_check', {
    responseDraft: request.response_draft,
    conversationContext: request.conversation_context,
    previousResponses: request.previous_responses,
    userMessage: request.user_message,
  });
}

/**
 * Force la cohérence d'une réponse
 */
export async function enforceConsistency(
  response: string,
  context: string,
  history: string[],
  userMessage: string
): Promise<string> {
  const result = await checkBehavioral({
    response_draft: response,
    conversation_context: context,
    previous_responses: history,
    user_message: userMessage,
  });

  // Log des corrections si en développement
  if (import.meta.env.DEV && result.corrections_applied.length > 0) {
    console.log('🔧 Corrections appliquées:', result.corrections_applied);
    console.log('📊 Score cohérence:', result.consistency_score.overall.toFixed(2));
  }

  return result.finalized_response;
}

/**
 * Évalue la qualité comportementale d'une réponse
 */
export function evaluateConsistency(score: ConsistencyScore): {
  level: 'excellent' | 'good' | 'needs_improvement';
  message: string;
} {
  if (score.overall >= 0.9) {
    return { level: 'excellent', message: 'Cohérence comportementale excellente' };
  } else if (score.overall >= 0.7) {
    return { level: 'good', message: 'Cohérence comportementale bonne' };
  } else {
    return { level: 'needs_improvement', message: 'Corrections nécessaires' };
  }
}
```

---

## 3️⃣ HOOK UNIFIÉ

### `src/hooks/useConversationPipeline.ts`

```typescript
import { useState, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { processRealism } from '@/services/realismService';
import { processEmotional } from '@/services/emotionalService';
import { checkBehavioral } from '@/services/behavioralService';
import type { ConversationPipelineResult } from '@/types/conversation';

interface UseConversationPipelineOptions {
  enableRealism?: boolean;       // Défaut: true
  enableEmotional?: boolean;     // Défaut: true
  enableBehavioral?: boolean;    // Défaut: true
  conversationId?: string;
}

export function useConversationPipeline(
  options: UseConversationPipelineOptions = {}
) {
  const {
    enableRealism = true,
    enableEmotional = true,
    enableBehavioral = true,
    conversationId,
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ConversationPipelineResult | null>(null);

  // Historique pour continuité
  const historyRef = useRef<string[]>([]);
  const topicsRef = useRef<string[]>([]);
  const messageTimesRef = useRef<number[]>([]);

  /**
   * Envoie un message à travers le pipeline complet
   */
  const sendMessage = useCallback(async (
    userMessage: string
  ): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    const startTime = performance.now();

    try {
      // ──────────────────────────────────────────────────────
      // ÉTAPE 1: Conversation Engine (Super Prompt #1)
      // ──────────────────────────────────────────────────────
      const engineResponse = await invoke<{ content: string }>('conversation_process_message', {
        userMessage,
        conversationId,
        mode: 'Default',
      });

      let currentResponse = engineResponse.content;
      const context = `Conversation ${conversationId || 'nouvelle'}`;

      // ──────────────────────────────────────────────────────
      // ÉTAPE 2: French Mastery (Super Prompt #3) - Optionnel
      // ──────────────────────────────────────────────────────
      // Déjà intégré dans le backend, mais peut être appelé explicitement

      // ──────────────────────────────────────────────────────
      // ÉTAPE 3: Conversational Realism (Super Prompt #4)
      // ──────────────────────────────────────────────────────
      let realismResult = null;
      if (enableRealism) {
        realismResult = await processRealism({
          context,
          user_message: userMessage,
          draft_response: currentResponse,
          conversation_history: historyRef.current,
          recent_topics: topicsRef.current,
        });
        currentResponse = realismResult.finalized_response;

        // Ajouter micro-prompt si pertinent
        if (realismResult.micro_prompt) {
          currentResponse += `\n\n${realismResult.micro_prompt}`;
        }
      }

      // ──────────────────────────────────────────────────────
      // ÉTAPE 4: Emotional Subtlety (Super Prompt #5)
      // ──────────────────────────────────────────────────────
      let emotionalResult = null;
      if (enableEmotional) {
        const velocity = calculateVelocity(messageTimesRef.current);
        emotionalResult = await processEmotional({
          context,
          user_message: userMessage,
          draft_response: currentResponse,
          conversation_velocity: velocity,
          message_history: historyRef.current,
        });
        currentResponse = emotionalResult.finalized_response;
      }

      // ──────────────────────────────────────────────────────
      // ÉTAPE 5: Behavioral Consistency (Super Prompt #6)
      // ──────────────────────────────────────────────────────
      let behavioralResult = null;
      if (enableBehavioral) {
        behavioralResult = await checkBehavioral({
          response_draft: currentResponse,
          conversation_context: context,
          previous_responses: historyRef.current.slice(-5), // 5 dernières
          user_message: userMessage,
        });
        currentResponse = behavioralResult.finalized_response;
      }

      // ──────────────────────────────────────────────────────
      // MISE À JOUR HISTORIQUE
      // ──────────────────────────────────────────────────────
      historyRef.current.push(currentResponse);
      messageTimesRef.current.push(Date.now());

      // Garder uniquement 50 derniers messages
      if (historyRef.current.length > 50) {
        historyRef.current = historyRef.current.slice(-50);
        messageTimesRef.current = messageTimesRef.current.slice(-50);
      }

      const processingTime = performance.now() - startTime;

      const result: ConversationPipelineResult = {
        final_response: currentResponse,
        realism: realismResult!,
        emotional: emotionalResult!,
        behavioral: behavioralResult!,
        processing_time_ms: processingTime,
      };

      setLastResult(result);

      return currentResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [conversationId, enableRealism, enableEmotional, enableBehavioral]);

  /**
   * Réinitialise l'historique
   */
  const resetHistory = useCallback(() => {
    historyRef.current = [];
    topicsRef.current = [];
    messageTimesRef.current = [];
    setLastResult(null);
  }, []);

  /**
   * Ajoute un sujet aux topics récents
   */
  const addTopic = useCallback((topic: string) => {
    if (!topicsRef.current.includes(topic)) {
      topicsRef.current.push(topic);
      if (topicsRef.current.length > 10) {
        topicsRef.current = topicsRef.current.slice(-10);
      }
    }
  }, []);

  return {
    sendMessage,
    isProcessing,
    error,
    lastResult,
    resetHistory,
    addTopic,
  };
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Calcule la vélocité conversationnelle (messages/minute)
 */
function calculateVelocity(messageTimes: number[]): number {
  if (messageTimes.length < 2) return 1;

  const lastFive = messageTimes.slice(-5);
  const timeSpan = (lastFive[lastFive.length - 1] - lastFive[0]) / 1000 / 60; // minutes

  return timeSpan > 0 ? lastFive.length / timeSpan : 1;
}
```

---

## 4️⃣ INTÉGRATION CHAT

### `src/components/Chat.tsx`

```typescript
import React, { useState } from 'react';
import { useConversationPipeline } from '@/hooks/useConversationPipeline';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { QualityIndicator } from './QualityIndicator';

export function Chat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);

  const {
    sendMessage,
    isProcessing,
    error,
    lastResult,
    addTopic,
  } = useConversationPipeline({
    enableRealism: true,
    enableEmotional: true,
    enableBehavioral: true,
  });

  const handleSendMessage = async (content: string) => {
    // Ajouter message utilisateur
    setMessages(prev => [...prev, { role: 'user', content }]);

    try {
      // Pipeline complet
      const response = await sendMessage(content);

      // Ajouter réponse assistant
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Extraire topics du message (simple heuristique)
      const topics = content.match(/\b[A-Z][a-z]+Engine\b/g) || [];
      topics.forEach(topic => addTopic(topic));

    } catch (err) {
      console.error('Erreur pipeline:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>

      {/* Indicateur qualité (développement uniquement) */}
      {import.meta.env.DEV && lastResult && (
        <QualityIndicator result={lastResult} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2">
          {error}
        </div>
      )}

      <MessageInput
        onSend={handleSendMessage}
        disabled={isProcessing}
      />
    </div>
  );
}
```

---

### `src/components/QualityIndicator.tsx`

```typescript
import React from 'react';
import type { ConversationPipelineResult } from '@/types/conversation';

interface Props {
  result: ConversationPipelineResult;
}

export function QualityIndicator({ result }: Props) {
  const { realism, emotional, behavioral } = result;

  return (
    <div className="bg-blue-50 border-t border-blue-200 p-4 text-xs font-mono">
      <div className="flex gap-6">
        {/* Réalisme */}
        <div>
          <div className="font-bold text-blue-900">🌊 Réalisme</div>
          <div>Rythme: {realism.detected_rhythm}</div>
          <div>Intention: {realism.detected_intention}</div>
          <div>Fluidité: {(realism.interaction_quality.fluidity * 100).toFixed(0)}%</div>
        </div>

        {/* Émotionnel */}
        <div>
          <div className="font-bold text-purple-900">🎭 Émotionnel</div>
          <div>État: {emotional.detected_emotion}</div>
          <div>Énergie: {emotional.detected_energy}</div>
          <div>Ton: {emotional.applied_tone}</div>
        </div>

        {/* Comportemental */}
        <div>
          <div className="font-bold text-green-900">🎯 Cohérence</div>
          <div>Score: {(behavioral.consistency_score.overall * 100).toFixed(0)}%</div>
          <div>Corrections: {behavioral.corrections_applied.length}</div>
        </div>

        {/* Performance */}
        <div>
          <div className="font-bold text-gray-900">⚡ Performance</div>
          <div>{result.processing_time_ms.toFixed(0)}ms</div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5️⃣ EXEMPLES D'UTILISATION

### Exemple 1 : Pipeline complet automatique

```typescript
import { useConversationPipeline } from '@/hooks/useConversationPipeline';

function MyChat() {
  const { sendMessage, isProcessing, lastResult } = useConversationPipeline();

  const handleSubmit = async (message: string) => {
    const response = await sendMessage(message);
    console.log('Réponse finale:', response);

    if (lastResult) {
      console.log('Rythme détecté:', lastResult.realism.detected_rhythm);
      console.log('État émotionnel:', lastResult.emotional.detected_emotion);
      console.log('Score cohérence:', lastResult.behavioral.consistency_score.overall);
    }
  };

  return (
    <input
      onSubmit={handleSubmit}
      disabled={isProcessing}
    />
  );
}
```

---

### Exemple 2 : Désactiver certains moteurs

```typescript
// Uniquement Realism + Behavioral (pas d'adaptation émotionnelle)
const { sendMessage } = useConversationPipeline({
  enableRealism: true,
  enableEmotional: false,
  enableBehavioral: true,
});
```

---

### Exemple 3 : Détection émotionnelle standalone

```typescript
import { detectEmotionalState } from '@/services/emotionalService';

async function analyzeUserState(message: string) {
  const emotion = await detectEmotionalState(message);

  if (emotion.detected_emotion === 'Frustration') {
    // Afficher message de soutien
    showToast('Je vois que ça bloque. On prend une approche directe ?');
  } else if (emotion.detected_emotion === 'Fatigue') {
    // Proposer simplification
    showToast('Tu veux une version simplifiée en 3 points ?');
  }
}
```

---

### Exemple 4 : Vérification cohérence avant envoi

```typescript
import { enforceConsistency } from '@/services/behavioralService';

async function validateBeforeSending(
  draft: string,
  context: string,
  history: string[]
) {
  const corrected = await enforceConsistency(draft, context, history, '');

  if (draft !== corrected) {
    console.log('⚠️ Réponse corrigée pour cohérence');
  }

  return corrected;
}
```

---

## 6️⃣ MONITORING

### Analytics Dashboard

```typescript
// src/components/ConversationAnalytics.tsx

import React, { useEffect, useState } from 'react';

interface ConversationStats {
  total_messages: number;
  avg_realism_score: number;
  avg_emotional_accuracy: number;
  avg_consistency_score: number;
  most_common_rhythm: string;
  most_common_emotion: string;
}

export function ConversationAnalytics() {
  const [stats, setStats] = useState<ConversationStats | null>(null);

  useEffect(() => {
    // Charger stats depuis storage local ou backend
    loadStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-2">Fluidité moyenne</h3>
        <div className="text-3xl font-bold text-blue-600">
          {(stats.avg_realism_score * 100).toFixed(0)}%
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-2">Justesse émotionnelle</h3>
        <div className="text-3xl font-bold text-purple-600">
          {(stats.avg_emotional_accuracy * 100).toFixed(0)}%
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-2">Cohérence comportementale</h3>
        <div className="text-3xl font-bold text-green-600">
          {(stats.avg_consistency_score * 100).toFixed(0)}%
        </div>
      </div>

      <div className="col-span-3 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-2">Patterns détectés</h3>
        <div className="flex gap-4 text-sm">
          <div>Rythme dominant: <span className="font-bold">{stats.most_common_rhythm}</span></div>
          <div>État fréquent: <span className="font-bold">{stats.most_common_emotion}</span></div>
        </div>
      </div>
    </div>
  );
}

async function loadStats(): Promise<ConversationStats> {
  // Implémenter chargement stats
  return {
    total_messages: 0,
    avg_realism_score: 0,
    avg_emotional_accuracy: 0,
    avg_consistency_score: 0,
    most_common_rhythm: 'Steady',
    most_common_emotion: 'Neutral',
  };
}
```

---

## 🎯 CHECKLIST INTÉGRATION

- [ ] Créer fichiers types (`conversation.ts`)
- [ ] Implémenter services (`realismService.ts`, `emotionalService.ts`, `behavioralService.ts`)
- [ ] Créer hook unifié (`useConversationPipeline.ts`)
- [ ] Intégrer dans `Chat.tsx`
- [ ] Ajouter `QualityIndicator.tsx` (dev uniquement)
- [ ] Tester pipeline complet
- [ ] Tester cas edge (frustration, fatigue, confusion)
- [ ] Vérifier cohérence sur conversation longue (50+ messages)
- [ ] Ajouter analytics (optionnel)
- [ ] Documentation utilisateur

---

## 🚀 PROCHAINES ÉTAPES

1. **Implémenter services TypeScript** (1-2h)
2. **Créer hook unifié** (1h)
3. **Intégrer dans Chat** (30min)
4. **Tests E2E** (1h)
5. **Optimisations** (selon besoins)

---

**FIN DU GUIDE — Prêt pour intégration frontend ! 🎉**
