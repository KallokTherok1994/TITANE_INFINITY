# 🇫🇷 FRENCH MASTERY POST-PROCESSOR — GUIDE D'INTÉGRATION

**Date :** 3 décembre 2025
**Version :** 1.0.0
**Module :** `french_mastery.rs` + commande Tauri

---

## 🎯 Vue d'ensemble

Le **French Mastery Post-Processor** est une couche linguistique finale qui polit toutes les réponses de TITANE∞ pour garantir :

- ✅ **Français impeccable** (orthographe, grammaire, accords)
- ✅ **Clarté maximale** (phrases courtes, structure logique)
- ✅ **Style TITANE** (copilote stratégique, humain, rigoureux)
- ✅ **Adaptation contextuelle** (ton, densité, niveau technique)

---

## 🏗️ Architecture

```
[Conversation Engine v∞]
        ↓
[Pipeline génère brouillon]
        ↓
[Mémoire Multi-Couches enrichit contexte]
        ↓
[French Mastery Post-Processor] ← COUCHE FINALE
        ↓
[Réponse finalisée en FR avancé]
        ↓
[Affichage à Kevin]
```

---

## 📦 Types TypeScript

### **FrenchMasteryRequest**

```typescript
interface FrenchMasteryRequest {
  context: string;           // Contexte conversation
  draft_response: string;    // Brouillon à améliorer
  mode?: ProcessingMode;     // Mode d'intervention
  constraints?: {
    tone?: 'neutral' | 'warm' | 'professional';
    length?: 'short' | 'medium' | 'long';
    technical_level?: 'beginner' | 'intermediate' | 'expert';
  };
}

type ProcessingMode =
  | 'correction'      // Correction pure
  | 'optimization'    // Style TITANE (défaut)
  | 'simplification'  // Version condensée
  | 'enrichment'      // Ajout pédagogique
  | 'double';         // Deux versions
```

### **FrenchMasteryResponse**

```typescript
interface FrenchMasteryResponse {
  comment?: string;           // Commentaire rapide (2-3 lignes)
  finalized_response: string; // Réponse principale
  variant?: string;           // Version alternative (optionnel)
  quality_scores: {
    linguistic_correctness: number; // 0.0 → 1.0
    clarity: number;
    titane_style_match: number;
    context_adaptation: number;
    optimal_density: number;
    reusability: number;
  };
}
```

---

## 🚀 Utilisation Frontend

### **1. Service TypeScript**

```typescript
// src/services/frenchMastery.ts

import { invoke } from '@tauri-apps/api/tauri';

export interface FrenchMasteryRequest {
  context: string;
  draft_response: string;
  mode?: 'correction' | 'optimization' | 'simplification' | 'enrichment' | 'double';
  tone?: 'neutral' | 'warm' | 'professional';
  length?: 'short' | 'medium' | 'long';
  technical_level?: 'beginner' | 'intermediate' | 'expert';
}

export interface FrenchMasteryResponse {
  comment?: string;
  finalized_response: string;
  variant?: string;
  quality_scores: {
    linguistic_correctness: number;
    clarity: number;
    titane_style_match: number;
    context_adaptation: number;
    optimal_density: number;
    reusability: number;
  };
}

/**
 * Post-traiter une réponse en français avancé
 */
export async function postProcessFrench(
  request: FrenchMasteryRequest
): Promise<FrenchMasteryResponse> {
  return invoke('conversation_french_postprocess', {
    context: request.context,
    draftResponse: request.draft_response,
    mode: request.mode,
    tone: request.tone,
    length: request.length,
    technicalLevel: request.technical_level,
  });
}

/**
 * Post-traiter avec mode automatique (optimisation)
 */
export async function autoPolishResponse(
  draft: string,
  context: string = ''
): Promise<string> {
  const result = await postProcessFrench({
    context,
    draft_response: draft,
    mode: 'optimization',
  });

  return result.finalized_response;
}

/**
 * Obtenir version synthèse + complète
 */
export async function getDoubleVersion(
  draft: string,
  context: string = ''
): Promise<{ short: string; full: string }> {
  const result = await postProcessFrench({
    context,
    draft_response: draft,
    mode: 'double',
  });

  return {
    short: result.variant || draft,
    full: result.finalized_response,
  };
}
```

---

### **2. Hook React**

```typescript
// src/hooks/useFrenchMastery.ts

import { useState } from 'react';
import { postProcessFrench, FrenchMasteryRequest, FrenchMasteryResponse } from '@/services/frenchMastery';

export function useFrenchMastery() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScores, setLastScores] = useState<FrenchMasteryResponse['quality_scores'] | null>(null);

  const polish = async (
    draft: string,
    options?: Partial<FrenchMasteryRequest>
  ): Promise<string> => {
    setIsProcessing(true);

    try {
      const result = await postProcessFrench({
        context: options?.context || '',
        draft_response: draft,
        mode: options?.mode || 'optimization',
        tone: options?.tone,
        length: options?.length,
        technical_level: options?.technical_level,
      });

      setLastScores(result.quality_scores);
      return result.finalized_response;
    } catch (error) {
      console.error('French mastery error:', error);
      return draft; // Fallback : retourner brouillon
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    polish,
    isProcessing,
    lastScores,
  };
}
```

---

### **3. Intégration dans Chat**

```typescript
// src/components/Chat.tsx

import { useFrenchMastery } from '@/hooks/useFrenchMastery';

function Chat() {
  const { polish } = useFrenchMastery();

  const sendMessage = async (userMessage: string) => {
    // 1. Générer brouillon via Conversation Engine
    const draft = await invoke('conversation_process_message', {
      userMessage,
      conversationId: currentConvId,
      mode: 'default',
    });

    // 2. Post-traiter en français avancé
    const finalResponse = await polish(draft.assistant_message, {
      context: `Conversation avec Kevin sur ${currentTopic}`,
      mode: 'optimization',
      tone: 'warm',
      length: userMessage.length < 50 ? 'short' : 'medium',
    });

    // 3. Afficher réponse finalisée
    setMessages([...messages, {
      role: 'assistant',
      content: finalResponse,
    }]);
  };

  // ...
}
```

---

## 📊 Exemples d'Usage

### **Exemple 1 : Correction automatique**

```typescript
const draft = "Les données est disponible maintenant.";
const corrected = await autoPolishResponse(draft);
// → "Les données sont disponibles maintenant."
```

### **Exemple 2 : Optimisation style TITANE**

```typescript
const draft = "Bon bah écoute, je pense qu'on pourrait peut-être essayer de faire un truc...";
const optimized = await polish(draft, { mode: 'optimization' });
// → "Je suggère de structurer ces informations en liste."
```

### **Exemple 3 : Simplification**

```typescript
const longDraft = `[Paragraphe de 200 mots avec détails techniques...]`;
const simple = await polish(longDraft, { mode: 'simplification', length: 'short' });
// → Version synthétique en 5 lignes
```

### **Exemple 4 : Double version**

```typescript
const { short, full } = await getDoubleVersion(
  "Explication technique longue...",
  "Kevin demande détails architecture"
);

// Affichage adaptatif
if (userIsFatigued) {
  display(short);  // Version courte
} else {
  display(full);   // Version complète
}
```

### **Exemple 5 : Adaptation contextuelle**

```typescript
// Kevin est en surcharge
const result = await polish(draft, {
  mode: 'simplification',
  tone: 'warm',
  length: 'short',
  technical_level: 'beginner',
});

// Kevin est en mode architecte
const result = await polish(draft, {
  mode: 'optimization',
  tone: 'professional',
  length: 'long',
  technical_level: 'expert',
});
```

---

## 🎯 Modes d'Intervention

### **1. Correction (correction)**
**Usage :** Corriger uniquement la langue sans toucher au contenu.

```typescript
const result = await polish(draft, { mode: 'correction' });
```

**Avant :**
> "Les fichiers est corrompu. Il faut que tu les régénères."

**Après :**
> "Les fichiers sont corrompus. Il faut que tu les régénères."

---

### **2. Optimisation (optimization)** ⭐ **DÉFAUT**
**Usage :** Réécrire en style TITANE (copilote stratégique, structuré).

```typescript
const result = await polish(draft, { mode: 'optimization' });
```

**Avant :**
> "Bon bah écoute, je pense qu'on pourrait peut-être essayer de faire un truc avec des listes..."

**Après :**
> "Je suggère de structurer ces informations en liste. Voici ce que je propose :
> 1. [Point 1]
> 2. [Point 2]"

---

### **3. Simplification (simplification)**
**Usage :** Condenser en version courte, digeste, actionnable.

```typescript
const result = await polish(draft, { mode: 'simplification', length: 'short' });
```

**Avant :** 250 mots techniques

**Après :**
> "Trois actions concrètes :
> 1. [action 1]
> 2. [action 2]
> 3. [action 3]
>
> Détails disponibles sur demande."

---

### **4. Enrichissement (enrichment)**
**Usage :** Ajouter métaphores, exemples concrets, micro-explications.

```typescript
const result = await polish(draft, { mode: 'enrichment' });
```

**Avant :**
> "La mémoire épisodique stocke les événements significatifs."

**Après :**
> "La mémoire épisodique stocke les événements significatifs — comme un journal de bord qui ne garde que les étapes clés de ta progression."

---

### **5. Double (double)**
**Usage :** Générer version synthèse + version complète.

```typescript
const result = await polish(draft, { mode: 'double' });
console.log(result.finalized_response); // Version complète
console.log(result.variant);            // Version synthèse
```

---

## 📈 Scores de Qualité

Le post-processeur évalue automatiquement chaque réponse sur 6 dimensions :

```typescript
interface QualityScores {
  linguistic_correctness: number; // Correction orthographe/grammaire
  clarity: number;                // Phrases courtes, structure claire
  titane_style_match: number;     // Respect style TITANE
  context_adaptation: number;     // Adaptation au contexte Kevin
  optimal_density: number;        // Longueur appropriée (100-200 mots)
  reusability: number;            // Structure réutilisable (listes, sections)
}
```

**Affichage des scores :**

```typescript
const result = await polish(draft);

console.log('Qualité linguistique:', result.quality_scores.linguistic_correctness);
// → 1.0 (parfait)

console.log('Clarté:', result.quality_scores.clarity);
// → 0.95 (excellent)

console.log('Style TITANE:', result.quality_scores.titane_style_match);
// → 0.92 (très bon)
```

---

## 🔧 Configuration Avancée

### **Adapter au contexte émotionnel**

```typescript
import { useConversationEngine } from '@/hooks/useConversationEngine';

const { lastEmotion } = useConversationEngine();

// Si émotion négative → ton chaleureux, simplification
if (lastEmotion?.valence < -0.5) {
  await polish(draft, {
    mode: 'simplification',
    tone: 'warm',
    length: 'short',
  });
}

// Si émotion positive → optimisation complète
if (lastEmotion?.valence > 0.5) {
  await polish(draft, {
    mode: 'optimization',
    tone: 'professional',
    length: 'medium',
  });
}
```

### **Détection automatique charge mentale**

```typescript
function detectUserState(message: string): {
  mode: string;
  length: string;
  tone: string;
} {
  const isShort = message.length < 50;
  const hasEmotionalWords = /frustré|perdu|bloqué|fatigué/i.test(message);

  if (isShort || hasEmotionalWords) {
    // Surcharge probable
    return {
      mode: 'simplification',
      length: 'short',
      tone: 'warm',
    };
  }

  // Mode normal
  return {
    mode: 'optimization',
    length: 'medium',
    tone: 'neutral',
  };
}

// Usage
const userState = detectUserState(userMessage);
const result = await polish(draft, userState);
```

---

## 🎨 Personnalisation

### **Créer profils de post-traitement**

```typescript
const PROFILES = {
  kevin_fatigue: {
    mode: 'simplification' as const,
    tone: 'warm' as const,
    length: 'short' as const,
    technical_level: 'beginner' as const,
  },

  kevin_architecte: {
    mode: 'optimization' as const,
    tone: 'professional' as const,
    length: 'long' as const,
    technical_level: 'expert' as const,
  },

  kevin_normal: {
    mode: 'optimization' as const,
    tone: 'neutral' as const,
    length: 'medium' as const,
    technical_level: 'intermediate' as const,
  },
};

// Usage
const result = await polish(draft, PROFILES.kevin_normal);
```

---

## 🔄 Intégration Pipeline Complet

```typescript
async function processMessageWithFullPipeline(userMessage: string) {
  // 1. Conversation Engine → brouillon
  const convResponse = await invoke('conversation_process_message', {
    userMessage,
    conversationId: currentConvId,
  });

  // 2. French Mastery → polish
  const polished = await polish(convResponse.assistant_message, {
    context: buildContext(convResponse),
    mode: determineMode(convResponse.detected_emotion),
    tone: determineTone(convResponse.detected_emotion),
    length: determineLength(userMessage),
  });

  // 3. Stocker version finalisée en mémoire
  // (la version polie devient la référence)

  return polished;
}

function buildContext(response: ConversationResponse): string {
  return `
    Intention: ${response.detected_intention}
    Émotion: valence=${response.detected_emotion.valence}
    Tags: ${response.cognitive_tags.join(', ')}
  `;
}

function determineMode(emotion: EmotionState): ProcessingMode {
  if (emotion.valence < -0.5) return 'simplification';
  if (emotion.intensity > 0.8) return 'enrichment';
  return 'optimization';
}

function determineTone(emotion: EmotionState): Tone {
  if (emotion.valence < 0) return 'warm';
  if (emotion.energy > 0.7) return 'professional';
  return 'neutral';
}

function determineLength(userMsg: string): Length {
  if (userMsg.length < 50) return 'short';
  if (userMsg.length > 200) return 'long';
  return 'medium';
}
```

---

## 📊 Monitoring & Analytics

```typescript
// Collecter statistiques post-traitement
const stats = {
  total_processed: 0,
  avg_clarity: 0,
  avg_style_match: 0,
  mode_usage: {
    correction: 0,
    optimization: 0,
    simplification: 0,
    enrichment: 0,
    double: 0,
  },
};

async function polishWithTracking(draft: string) {
  const result = await polish(draft);

  // Incrémenter stats
  stats.total_processed++;
  stats.avg_clarity =
    (stats.avg_clarity * (stats.total_processed - 1) + result.quality_scores.clarity)
    / stats.total_processed;
  stats.avg_style_match =
    (stats.avg_style_match * (stats.total_processed - 1) + result.quality_scores.titane_style_match)
    / stats.total_processed;

  return result.finalized_response;
}
```

---

## ✅ Checklist d'Intégration

- [ ] Créer `src/services/frenchMastery.ts`
- [ ] Créer `src/hooks/useFrenchMastery.ts`
- [ ] Intégrer dans `Chat.tsx` ou composant principal
- [ ] Tester modes : correction, optimization, simplification, enrichment, double
- [ ] Configurer profils utilisateur (fatigué, normal, architecte)
- [ ] Implémenter détection automatique charge mentale
- [ ] Afficher scores qualité (optionnel, debug)
- [ ] Stocker versions polies en mémoire conversationnelle

---

**TITANE∞ parle maintenant un français impeccable, clair et adapté** 🇫🇷✨
