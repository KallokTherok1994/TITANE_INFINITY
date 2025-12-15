# 🔥 DIAGNOSTIC COMPLET — IA LOCALE TITANE∞ v21

## Audit, Analyse & Plan de Correction

**Date**: 2025-12-11  
**Version**: v24.2.0  
**Branch**: staging  
**Status**: 🔴 **IA LOCALE NON FONCTIONNELLE**

---

## 1. RÉSUMÉ EXÉCUTIF

### État Global

| Composant                | État                    | Détail                                                          |
| ------------------------ | ----------------------- | --------------------------------------------------------------- |
| **Moteur IA (Ollama)**   | 🟡 **PARTIELLEMENT OK** | Code existe, config présente, santé non testée au démarrage     |
| **Backend (Tauri/Rust)** | 🟡 **PARTIELLEMENT OK** | Modules Rust existent mais pas clairement utilisés              |
| **Frontend (React/TS)**  | 🟢 **OK**               | UI chat prête, providers déclarés, sélection existe             |
| **Connexion Mémoire**    | 🔴 **CASSÉE**           | MemoryIntegration existe mais NON appelée dans providers locaux |
| **Analyse Fichiers**     | 🟡 **PARTIELLEMENT OK** | Upload existe, analyse partielle, stockage incomplet            |

### Pourquoi le Chat IA Local = 0 ?

#### **CAUSE RACINE IDENTIFIÉE:**

```
┌─────────────────────────────────────────────────────────────┐
│  FLUX ACTUEL (CASSÉ)                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Input                                                 │
│      ↓                                                       │
│  ChatPage (sélection provider)                             │
│      ↓                                                       │
│  aiOrchestrator.generate()                                 │
│      ↓                                                       │
│  selectOptimalProvider() ← ❌ PROBLÈME 1                   │
│      │                    (privilégie cloud par défaut)     │
│      ↓                                                       │
│  ollamaProvider.generate() ← ❌ PROBLÈME 2                 │
│      │                       (ne charge PAS la mémoire)     │
│      ↓                                                       │
│  fetch('http://127.0.0.1:11434') ← ❌ PROBLÈME 3           │
│      │                               (santé jamais testée)  │
│      ↓                                                       │
│  ❌ TIMEOUT / ERROR / AUCUNE RÉPONSE                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3 Causes Critiques (P0)

1. **P0 - Sélection Provider Défaillante**
   - `orchestrator.ts::selectOptimalProvider()` privilégie cloud providers
   - Ollama score = ~50-70, Claude/OpenAI score = ~80-90
   - **Résultat**: Ollama jamais sélectionné même si demandé

2. **P0 - Mémoire Jamais Injectée**
   - `ollamaProvider.ts::buildPrompt()` construit prompt SANS mémoire
   - `memoryIntegration.ts` existe mais n'est jamais appelé
   - **Résultat**: L'IA oublie tout entre chaque message

3. **P0 - Health Check Non Effectué**
   - `checkEndpointHealth()` existe mais n'est jamais appelé au démarrage
   - Pas de test de connexion Ollama avant utilisation
   - **Résultat**: Requêtes envoyées vers endpoint potentiellement offline

---

## 2. CARTE COMPLÈTE DES FLUX

### Flux Détecté (Actuel)

```mermaid
graph TD
    A[User Input] --> B[ChatPage]
    B --> C{Provider Sélectionné?}
    C -->|Auto| D[orchestrator.selectOptimalProvider]
    C -->|Manuel: local| E[Force ollama]
    C -->|Manuel: cloud| F[Force openai/claude]

    D --> G{Score Providers}
    G -->|Ollama: 50-70| H[Rarement sélectionné]
    G -->|Claude: 80-90| I[Souvent sélectionné]
    G -->|OpenAI: 85-95| I

    H --> J[ollamaProvider.generate]
    I --> K[claudeProvider/openaiProvider.generate]

    J --> L[buildPrompt - SANS mémoire]
    L --> M[fetch Ollama API]
    M --> N{Ollama Running?}
    N -->|Non| O[❌ Timeout/Error]
    N -->|Oui| P[Réponse Ollama]

    P --> Q[Pas de sauvegarde mémoire]
    Q --> R[Affichage UI]

    style O fill:#f99
    style Q fill:#f99
    style L fill:#ff9
```

### Flux Attendu (À Implémenter)

```mermaid
graph TD
    A[User Input] --> B[ChatPage]
    B --> C[✅ Test Health Ollama]
    C -->|Offline| D[Fallback: titaneLocal]
    C -->|Online| E[orchestrator.generate]

    E --> F[✅ Charger Mémoire STM/MTM/LTM]
    F --> G[✅ Injection contexte dans prompt]
    G --> H[ollamaProvider.generate]

    H --> I[✅ Prompt enrichi + mémoire]
    I --> J[fetch Ollama API]
    J --> K[Réponse Ollama]

    K --> L[✅ Sauvegarder interaction mémoire]
    L --> M[Affichage UI]

    style C fill:#9f9
    style F fill:#9f9
    style L fill:#9f9
```

---

## 3. AUDIT DÉTAILLÉ

### 🔹 ÉTAPE 1 — MOTEUR IA LOCAL (OLLAMA)

#### Fichiers Identifiés

```
✅ src/services/ai/providers/ollama.ts (422 lignes)
✅ src/utils/ollama.ts
✅ src-tauri/src/ai/ollama.rs
✅ src-tauri/src/ollama.rs
```

#### Configuration Détectée

```typescript
// src/services/ai/providers/ollama.ts
const OLLAMA_API_URL = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'llama3.1';
const ENDPOINT_TIMEOUT = 8000; // 8s
const MAX_ENDPOINT_ERRORS = 5;
```

#### Fonctions Disponibles

- ✅ `checkEndpointHealth()` - Teste `/api/tags`
- ✅ `buildPrompt()` - Construit prompt (sans mémoire)
- ✅ `generate()` - Appel API Ollama
- ❌ `NO STARTUP HEALTH CHECK` - Jamais appelé au boot

#### Test Simulation

```typescript
// Ce qui DEVRAIT être fait au démarrage :
async function testOllamaAtStartup() {
  const healthy = await checkEndpointHealth();
  if (!healthy) {
    console.warn('[OLLAMA] ⚠️ Offline - fallback to titaneLocal');
  } else {
    console.log('[OLLAMA] ✅ Online - ready');
  }
}
```

#### 🔴 PROBLÈMES IDENTIFIÉS

| #   | Problème                                          | Impact                                | Priorité |
| --- | ------------------------------------------------- | ------------------------------------- | -------- |
| 1   | `checkEndpointHealth()` jamais appelée au startup | Ollama offline = erreurs silencieuses | **P0**   |
| 2   | `buildPrompt()` ne charge jamais la mémoire       | Contexte perdu entre messages         | **P0**   |
| 3   | Pas de retry automatique si timeout               | Échec définitif sur erreur temporaire | **P1**   |
| 4   | Error handling async (`.then().catch()`)          | Erreurs peuvent être ignorées         | **P2**   |

---

### 🔹 ÉTAPE 2 — BACKEND (TAURI/RUST)

#### Fichiers Identifiés

```
✅ src-tauri/src/ai/ollama.rs (non lu - Rust)
✅ src-tauri/src/ollama.rs (non lu - Rust)
✅ src-tauri/src/ai/providers/local.rs (non lu - Rust)
```

#### Statut

🟡 **PARTIELLEMENT IMPLÉMENTÉ**

- Les modules Rust existent
- TypeScript utilise `fetch()` direct (pas via Tauri commands)
- **Potentiel gaspillé**: Backend Rust non utilisé pour Ollama

#### 🟡 PROBLÈMES IDENTIFIÉS

| #   | Problème                                         | Impact                             | Priorité |
| --- | ------------------------------------------------ | ---------------------------------- | -------- |
| 5   | Backend Rust Ollama non utilisé par Frontend     | Duplication logique, moins robuste | **P2**   |
| 6   | Pas d'abstraction unifiée (Rust vs fetch direct) | Incohérence architecture           | **P2**   |

---

### 🔹 ÉTAPE 3 — FRONTEND (REACT/TS)

#### Fichiers Identifiés

```
✅ src/pages/ChatPage.tsx (1040 lignes)
✅ src/features/chat/ChatInput.tsx (607 lignes)
✅ src/features/chat/ChatProviderSelector.tsx
✅ src/services/ai/orchestrator.ts (1321 lignes)
✅ src/services/ai/chatEngine.ts
```

#### Flux de Sélection Provider

```typescript
// ChatPage.tsx - ligne ~150
const [provider, setProvider] = useState<ProviderChoice>('auto');

// Quand user envoie message :
const handleSendMessage = useCallback(
  async (message: string) => {
    // ...
    const response = await chatEngineCommands.sendMessage({
      message: userMessage,
      provider: provider === 'auto' ? undefined : provider,
      // ❌ Pas de mémoire injectée ici
    });
  },
  [provider, conversationId, currentModeId]
);
```

#### Sélection dans Orchestrator

```typescript
// orchestrator.ts::selectOptimalProvider()
private selectOptimalProvider(message: string, history: AIMessage[]) {
  // Scoring :
  // Ollama : 50 (base) + 10 (local) + 15 (privacy) = 75
  // Claude : 70 (base) + 15 (complex) + 5 (reliability) = 90
  // OpenAI : 75 (base) + 20 (creative) = 95

  // ❌ Résultat : Ollama rarement choisi
}
```

#### 🔴 PROBLÈMES IDENTIFIÉS

| #   | Problème                                   | Impact                                   | Priorité |
| --- | ------------------------------------------ | ---------------------------------------- | -------- |
| 7   | Scoring provider favorise cloud            | Ollama jamais utilisé en mode auto       | **P0**   |
| 8   | Pas de flag "force local" explicite        | User ne peut pas forcer local facilement | **P1**   |
| 9   | ChatPage n'injecte pas mémoire avant envoi | Contexte perdu                           | **P0**   |

---

### 🔹 ÉTAPE 4 — CONNEXION À LA MÉMOIRE

#### Fichiers Identifiés

```
✅ src/services/ai/memoryIntegration.ts (286 lignes) - ⚠️ NON UTILISÉ
✅ src/services/memory/memoryEngineService.ts
✅ src/services/api/memory.ts
✅ src/stores/memoryStore.ts
✅ src/core/prompts/memoryTemplates.ts
```

#### Architecture Mémoire Existante

```typescript
// memoryIntegration.ts
export class MemoryIntegration {
  async loadContext(config: MemoryLoadConfig): Promise<MemoryContext> {
    // Charge :
    // - activeProjects
    // - recentDecisions
    // - relevantKnowledge
    // - activeRituals
    // - timeline
  }

  async saveInteraction(data: {
    userMessage: string;
    aiResponse: string;
    mode: string;
    emotionState?: ...;
  }) {
    // Sauvegarde dans Memory Core
  }
}
```

#### Où Devrait-Elle Être Appelée ?

```typescript
// ❌ ACTUEL (ollamaProvider.ts)
function buildPrompt(message: string, history: AIMessage[]): string {
  const recentHistory = history.slice(-5); // Seulement 5 derniers
  // Pas de mémoire STM/MTM/LTM
  return `Tu es TITANE∞...
${contextLines.join('\n')}
Utilisateur: ${message}`;
}

// ✅ ATTENDU (avec mémoire)
async function buildPromptWithMemory(
  message: string,
  history: AIMessage[]
): Promise<string> {
  // 1. Charger mémoire
  const memory = await memoryIntegration.loadContext({
    includeProjects: true,
    includeDecisions: true,
    maxDecisions: 5,
    timeWindow: '7d',
  });

  // 2. Injecter dans prompt
  const contextParts = [
    `Tu es TITANE∞ v21, OS cognitif personnel de Kevin.`,
    ``,
    `📋 CONTEXTE MÉMOIRE:`,
    memory.activeProjects.length > 0
      ? `Projets actifs: ${memory.activeProjects.map(p => p.name).join(', ')}`
      : '',
    memory.recentDecisions.length > 0
      ? `Décisions récentes: ${memory.recentDecisions.map(d => d.summary).join('; ')}`
      : '',
    ``,
    `💬 CONVERSATION RÉCENTE:`,
    ...history.slice(-5).map(m => `${m.role}: ${m.content}`),
    ``,
    `Utilisateur: ${message}`,
    `TITANE∞:`,
  ];

  return contextParts.filter(Boolean).join('\n');
}
```

#### 🔴 PROBLÈMES IDENTIFIÉS

| #   | Problème                                           | Impact                | Priorité |
| --- | -------------------------------------------------- | --------------------- | -------- |
| 10  | `memoryIntegration` JAMAIS importée dans providers | Mémoire inaccessible  | **P0**   |
| 11  | `buildPrompt()` ne charge pas mémoire              | IA amnésique          | **P0**   |
| 12  | Pas de `saveInteraction()` après réponse           | Conversations perdues | **P0**   |
| 13  | Pas de STM/MTM/LTM différenciés                    | Contexte plat         | **P1**   |

---

### 🔹 ÉTAPE 5 — ANALYSE DE FICHIERS & STOCKAGE

#### Fichiers Identifiés

```
✅ src/features/chat/FileUploadButton.tsx
✅ src/services/singularityBridge.ts (merge file knowledge)
✅ src/services/fileAnalysis/ (si existe)
```

#### Flux Actuel

```typescript
// ChatInput.tsx - handleFileImport()
const handleFileImport = useCallback(async () => {
  const files = await open({ multiple: true });

  // 1. Lecture fichier via Tauri
  const content = await readFile(filePath);

  // 2. ✅ Analyse basique (type, taille, nom)
  const analyzedFile = {
    path: filePath,
    name: fileName,
    type: fileType,
    size: stats.size,
  };

  // 3. ❌ PAS d'analyse IA du contenu
  // 4. ❌ PAS de stockage dans mémoire
  // 5. ❌ PAS d'indexation pour RAG

  onFilesAnalyzed?.([analyzedFile]);
}, []);
```

#### Flux Attendu

```mermaid
graph TD
    A[User Upload File] --> B[readFile via Tauri]
    B --> C[Détection type MIME]
    C --> D{Type?}

    D -->|PDF| E[Extract text via pdf.js]
    D -->|TXT| F[Read direct]
    D -->|MD| F
    D -->|Image| G[OCR via tesseract]

    E --> H[Analyse IA: résumé + tags]
    F --> H
    G --> H

    H --> I[Générer embeddings]
    I --> J[Stocker dans vector DB]
    J --> K[Indexer dans mémoire LTM]
    K --> L[Disponible pour RAG]
```

#### 🔴 PROBLÈMES IDENTIFIÉS

| #   | Problème                            | Impact                        | Priorité |
| --- | ----------------------------------- | ----------------------------- | -------- |
| 14  | Pas d'analyse IA du contenu fichier | Fichiers non exploitables     | **P1**   |
| 15  | Pas de stockage dans mémoire        | Fichiers perdus après session | **P1**   |
| 16  | Pas d'indexation / embedding        | Impossible de faire du RAG    | **P2**   |
| 17  | Pas de classification automatique   | Désorganisation               | **P2**   |

---

### 🔹 ÉTAPE 6 — BAGAGE CONVERSATIONNEL

#### Prompt Système Actuel (Ollama)

```typescript
// ollama.ts::buildPrompt()
`Tu es TITANE∞, une IA cognitive avancée. 
Réponds en français de manière professionnelle et précise.`;
```

**ANALYSE:**

- ✅ Identité basique
- ✅ Langue française
- ❌ Pas de contexte Kevin / TITANE∞
- ❌ Pas de principes (local-first, etc.)
- ❌ Pas de style détaillé
- ❌ Pas de rôle spécifique

#### Prompt Système Actuel (titaneLocal)

```typescript
// titaneLocal.ts - TITANE_KNOWLEDGE
const TITANE_KNOWLEDGE = {
  identity: 'TITANE∞ v19.2Ω',
  nature: "Système d'auto-évolution cognitive local",
  capabilities: [
    'Architecture MAÎTRE ANTI-SILENCE',
    'Monitoring système (Helios)',
    'Mémoire persistante',
    // ... 40+ capabilities
  ],
  personality: {
    tone: 'professionnel, précis, technique, rassurant',
    language: 'français',
  },
  responses: {
    greeting: [...],
    status: [...],
    architecture: [...],
    // ... patterns prédéfinis
  }
}
```

**ANALYSE:**

- ✅ Identité complète
- ✅ Personnalité définie
- ✅ Patterns de réponse
- ❌ Utilisé UNIQUEMENT en fallback
- ❌ Pas injecté dans Ollama

---

## 4. MATRICE DES PROBLÈMES & RISQUES

| #      | Problème                       | Gravité | Impact                            | Fichier           | Cause                      | Solution                     |
| ------ | ------------------------------ | ------- | --------------------------------- | ----------------- | -------------------------- | ---------------------------- |
| **1**  | Health check jamais appelé     | **P0**  | Ollama offline = échec silencieux | `ollama.ts`       | Pas d'init au boot         | Appeler au startup           |
| **2**  | Mémoire jamais injectée        | **P0**  | IA amnésique                      | `ollama.ts`       | `buildPrompt()` incomplet  | Intégrer `memoryIntegration` |
| **3**  | Interactions non sauvegardées  | **P0**  | Conversations perdues             | `ollama.ts`       | Pas de `saveInteraction()` | Appeler après réponse        |
| **7**  | Scoring favorise cloud         | **P0**  | Ollama jamais sélectionné         | `orchestrator.ts` | Algorithme biaisé          | Ajuster scores               |
| **9**  | ChatPage n'injecte pas mémoire | **P0**  | Contexte perdu                    | `ChatPage.tsx`    | Pas de `loadContext()`     | Charger avant envoi          |
| **8**  | Pas de mode "force local"      | **P1**  | User ne peut pas forcer           | `ChatPage.tsx`    | UI manquante               | Ajouter toggle               |
| **14** | Fichiers non analysés par IA   | **P1**  | Inutilisables                     | `ChatInput.tsx`   | Pipeline incomplet         | Implémenter analyse          |
| **15** | Fichiers non stockés           | **P1**  | Perdus après session              | `fileAnalysis`    | Module manquant            | Créer stockage               |
| **5**  | Backend Rust non utilisé       | **P2**  | Duplication                       | `ollama.rs`       | Architecture mixte         | Unifier via Tauri            |

---

## 5. PLAN DE CORRECTION PAR PHASES

### 📍 PHASE 0 — RAMENER LE CHAT IA LOCAL À LA VIE

**Objectif**: Ollama répond "OK_LOCAL" à un test simple

**Actions:**

1. ✅ Créer `initializeOllama()` qui teste santé au démarrage
2. ✅ Appeler dans `App.tsx` ou entry point
3. ✅ Ajouter flag `OLLAMA_HEALTHY` global
4. ✅ Modifier `selectOptimalProvider()` pour forcer Ollama si `mode=local`
5. ✅ Tester: "Réponds 'OK_LOCAL'"

**Fichiers à modifier:**

- `src/services/ai/providers/ollama.ts`
- `src/App.tsx`
- `src/services/ai/orchestrator.ts`

**Test de validation:**

```typescript
// Test manuel
1. Lancer app
2. Ouvrir DevTools Console
3. Vérifier: "[OLLAMA] ✅ Health check passed"
4. Envoyer message en mode "local"
5. Attendre réponse Ollama
```

---

### 📍 PHASE 1 — RECONNECTER LA MÉMOIRE

**Objectif**: Messages précédents pris en compte

**Actions:**

1. ✅ Importer `memoryIntegration` dans `ollama.ts`
2. ✅ Modifier `buildPrompt()` → `buildPromptWithMemory()` (async)
3. ✅ Charger STM/MTM (5-10 derniers messages)
4. ✅ Injecter dans prompt Ollama
5. ✅ Sauvegarder interaction après réponse

**Fichiers à modifier:**

- `src/services/ai/providers/ollama.ts`
- `src/services/ai/memoryIntegration.ts` (valider fonctionne)

**Test de validation:**

```typescript
// Test conversationnel
1. "Je m'appelle Kevin"
2. "Quel est mon prénom ?"
   ✅ Devrait répondre "Kevin"
3. "Rappelle-moi ce qu'on vient de dire"
   ✅ Devrait mentionner le prénom
```

---

### 📍 PHASE 2 — RÉACTIVER ANALYSE DE FICHIERS

**Objectif**: Upload fichier → analyse IA → stockage

**Actions:**

1. ✅ Créer `analyzeFileWithIA(content, filename)`
2. ✅ Utiliser Ollama pour résumer + extraire tags
3. ✅ Stocker résultat dans `memoryIntegration` (LTM)
4. ✅ Indexer pour RAG futur

**Fichiers à créer/modifier:**

- `src/services/fileAnalysis/fileAnalyzer.ts` (nouveau)
- `src/features/chat/FileUploadButton.tsx`
- `src/services/ai/memoryIntegration.ts`

**Test de validation:**

```typescript
// Test upload
1. Upload un fichier .txt
2. Vérifier analyse dans console
3. Vérifier stockage mémoire
4. Dans un message futur, demander "résume le fichier X"
   ✅ Devrait retrouver l'info
```

---

### 📍 PHASE 3 — INSTALLER BAGAGE CONVERSATIONNEL

**Objectif**: Prompt système cohérent TITANE∞

**Actions:**

1. ✅ Créer `TITANE_SYSTEM_PROMPT` complet
2. ✅ Injecter dans `buildPromptWithMemory()`
3. ✅ Tester style de réponse

**Prompt proposé:**

```typescript
const TITANE_SYSTEM_PROMPT = `Tu es TITANE∞ v21, un OS cognitif personnel développé pour Kevin Thibault.

IDENTITÉ:
- Système local-first (priorité absolue à la vie privée)
- Multi-IA orchestré (Ollama local, Claude, OpenAI en backup)
- Mémoire persistante (STM/MTM/LTM)
- Auto-évolution cognitive

PRINCIPES:
- Local-first: toujours privilégier Ollama quand possible
- Mémoire vivante: utiliser le contexte passé pour répondre
- Précision technique: réponses structurées, claires, sourcées
- Français: langue par défaut

STYLE:
- Réponses structurées (titres, listes, sections)
- Ton professionnel mais accessible
- Citer la mémoire quand pertinent
- Admettre quand tu ne sais pas

CONTEXTE ACTUEL:
- Utilisateur: Kevin Thibault, développeur TITANE∞
- Projet: OS cognitif personnel en Rust/React/TypeScript
- Environnement: Linux, développement local

CAPACITÉS:
- Analyser des fichiers uploadés
- Se souvenir de conversations passées
- Aider au développement TITANE∞
- Fournir de l'assistance technique`;
```

**Fichiers à modifier:**

- `src/services/ai/providers/ollama.ts`
- `src/config/prompts/systemPrompts.ts` (nouveau)

---

### 📍 PHASE 4 — OPTIMISATION & ROBUSTESSE

**Objectif**: Gestion erreurs + fallbacks + logs

**Actions:**

1. ✅ Améliorer error handling
2. ✅ Ajouter retry logic (3 tentatives)
3. ✅ Fallback automatique vers `titaneLocal` si Ollama fail
4. ✅ Logs structurés avec niveaux (debug/info/warn/error)
5. ✅ Monitoring santé provider (dashboard)

**Fichiers à modifier:**

- `src/services/ai/providers/ollama.ts`
- `src/services/ai/orchestrator.ts`
- `src/services/monitoring/` (si existe)

---

## 6. PROPOSITION PROMPT SYSTÈME + BAGAGE MINIMAL

Voir **PHASE 3** ci-dessus pour le prompt complet.

**Bagage conversationnel minimal à injecter:**

```typescript
// src/config/knowledge/baseKnowledge.ts
export const BASE_KNOWLEDGE = {
  about_kevin: `Kevin Thibault, développeur principal de TITANE∞. 
    Passionné par les systèmes cognitifs, l'IA locale, la vie privée.`,

  about_titane: `TITANE∞ v21 - OS cognitif personnel. 
    Local-first, multi-IA, mémoire persistante, auto-évolution.
    Stack: Rust + React + TypeScript + Tauri v2.`,

  principles: [
    'Local-first (privacy)',
    'Multi-provider orchestration',
    'Memory-aware responses',
    'Technical precision',
    'French language',
  ],

  current_capabilities: [
    'Chat IA local (Ollama)',
    'Fallback cloud (Claude/OpenAI)',
    'File analysis',
    'Memory (STM/MTM/LTM)',
    'Monitoring (Helios/Sentinel)',
  ],
};
```

**Où l'injecter:**

- Dans `buildPromptWithMemory()` après le system prompt
- Utiliser conditionnellement selon contexte

---

## 7. LISTE DES FICHIERS À MODIFIER

### Modifications Critiques (P0)

```
✅ src/services/ai/providers/ollama.ts
   - Ajouter initializeOllama()
   - Modifier buildPrompt() → buildPromptWithMemory() (async)
   - Importer memoryIntegration
   - Appeler saveInteraction() après réponse

✅ src/services/ai/orchestrator.ts
   - Ajuster selectOptimalProvider() scoring
   - Ajouter mode "force-local"

✅ src/pages/ChatPage.tsx
   - Charger mémoire avant handleSendMessage()
   - Ajouter toggle "Mode Local"

✅ src/App.tsx
   - Appeler initializeOllama() au startup
```

### Créations Nouvelles (P1)

```
✅ src/config/prompts/systemPrompts.ts (nouveau)
   - TITANE_SYSTEM_PROMPT complet

✅ src/config/knowledge/baseKnowledge.ts (nouveau)
   - BASE_KNOWLEDGE minimal

✅ src/services/fileAnalysis/fileAnalyzer.ts (nouveau)
   - analyzeFileWithIA()
   - storeFileInMemory()
```

### Optimisations (P2)

```
✅ src/services/ai/healthMonitor.ts
   - Ajouter monitoring Ollama health

✅ src/services/ai/providers/ollama.ts
   - Retry logic
   - Better error handling
```

---

## 8. TESTS RECOMMANDÉS

### Tests Unitaires

```typescript
// ollama.test.ts
describe('Ollama Provider', () => {
  it('should initialize and test health', async () => {
    const healthy = await initializeOllama();
    expect(healthy).toBe(true);
  });

  it('should build prompt with memory', async () => {
    const prompt = await buildPromptWithMemory('test', []);
    expect(prompt).toContain('TITANE∞ v21');
    expect(prompt).toContain('CONTEXTE MÉMOIRE');
  });

  it('should save interaction after response', async () => {
    const spy = jest.spyOn(memoryIntegration, 'saveInteraction');
    await ollamaProvider.generate('test');
    expect(spy).toHaveBeenCalled();
  });
});
```

### Tests d'Intégration

```typescript
// integration.test.ts
describe('IA Locale Flow', () => {
  it('should complete full conversation with memory', async () => {
    // 1. Init
    await initializeOllama();

    // 2. First message
    const r1 = await orchestrator.generate('Je suis Kevin');
    expect(r1.content).toBeTruthy();

    // 3. Second message (test mémoire)
    const r2 = await orchestrator.generate('Quel est mon prénom?');
    expect(r2.content.toLowerCase()).toContain('kevin');
  });

  it('should analyze uploaded file', async () => {
    const file = createMockFile('test.txt', 'Hello TITANE');
    const result = await analyzeFileWithIA(file);
    expect(result.summary).toBeTruthy();
    expect(result.tags).toContain('greeting');
  });
});
```

### Tests Manuels (Checklist)

```markdown
## Checklist Validation IA Locale

### Phase 0 - Boot & Health

- [ ] App démarre sans erreur
- [ ] Console affiche "[OLLAMA] ✅ Health check passed"
- [ ] Si Ollama offline, affiche warning clair

### Phase 1 - Chat Basique

- [ ] Envoyer "Bonjour" → Réponse Ollama
- [ ] Envoyer "Réponds 'OK_LOCAL'" → Réponse contient "OK_LOCAL"
- [ ] Temps réponse < 5s

### Phase 2 - Mémoire

- [ ] "Je m'appelle Kevin" → OK
- [ ] "Quel est mon prénom?" → Répond "Kevin"
- [ ] "Résume notre conversation" → Mentionne prénom

### Phase 3 - Fichiers

- [ ] Upload fichier .txt → Analyse visible
- [ ] Console affiche résumé généré
- [ ] Message "Que contenait le fichier?" → Récupère info

### Phase 4 - Style & Personnalité

- [ ] Réponses en français ✓
- [ ] Structure claire (titres, listes) ✓
- [ ] Ton TITANE∞ (technique, précis) ✓
- [ ] Mentionne mémoire quand pertinent ✓

### Phase 5 - Robustesse

- [ ] Kill Ollama → Fallback titaneLocal fonctionne
- [ ] Restart Ollama → Reconnexion automatique
- [ ] Message vide → Erreur claire
- [ ] Message très long (>5000 chars) → Géré correctement
```

---

## 9. PLAN D'IMPLÉMENTATION (ROADMAP)

### Sprint 1 - Boot & Santé (2h)

- [x] Diagnostic complet (FAIT)
- [ ] Implémenter `initializeOllama()`
- [ ] Intégrer dans App.tsx
- [ ] Tester health check

### Sprint 2 - Mémoire Core (4h)

- [ ] Modifier `buildPrompt()` → async with memory
- [ ] Importer `memoryIntegration`
- [ ] Charger STM/MTM avant prompt
- [ ] Sauvegarder après réponse
- [ ] Tests conversationnels

### Sprint 3 - Provider Selection (2h)

- [ ] Ajuster scoring orchestrator
- [ ] Ajouter mode "force-local"
- [ ] UI toggle dans ChatPage
- [ ] Tests sélection

### Sprint 4 - Analyse Fichiers (6h)

- [ ] Créer `fileAnalyzer.ts`
- [ ] Implémenter analyse IA
- [ ] Stocker dans mémoire LTM
- [ ] Tests upload + retrieval

### Sprint 5 - Prompt System (2h)

- [ ] Créer `systemPrompts.ts`
- [ ] Créer `baseKnowledge.ts`
- [ ] Injecter dans prompt
- [ ] Tests style réponse

### Sprint 6 - Robustesse (4h)

- [ ] Retry logic
- [ ] Better error handling
- [ ] Fallback automatique
- [ ] Monitoring dashboard

**TOTAL ESTIMÉ: ~20h de dev**

---

## 10. CONCLUSION & NEXT STEPS

### État Actuel Résumé

🔴 **L'IA locale ne fonctionne pas** pour 3 raisons majeures :

1. Santé Ollama jamais testée → échecs silencieux
2. Mémoire jamais injectée → IA amnésique
3. Sélection provider biaisée cloud → Ollama jamais choisi

### Priorités Immédiates

**À FAIRE EN PREMIER** (P0 - aujourd'hui):

1. ✅ Implémenter `initializeOllama()` + health check
2. ✅ Intégrer mémoire dans `buildPrompt()`
3. ✅ Forcer sélection Ollama en mode "local"

**VALIDATION MINIMALE**:

```bash
# Test 1 - Boot
App démarre → Console: "[OLLAMA] ✅ Ready"

# Test 2 - Chat
User: "Réponds 'OK_LOCAL'"
IA: "OK_LOCAL" (via Ollama)

# Test 3 - Mémoire
User: "Je suis Kevin"
User: "Qui suis-je?"
IA: "Tu es Kevin" ✅
```

### Vision Long Terme

Une fois corrigé, TITANE∞ aura :

- ✅ IA locale 100% fonctionnelle (Ollama)
- ✅ Mémoire persistante active (STM/MTM/LTM)
- ✅ Analyse fichiers intégrée
- ✅ Personnalité cohérente
- ✅ Architecture local-first complète

---

**DIAGNOSTIC COMPLET** ✅  
**PLAN D'ACTION DÉFINI** ✅  
**PRÊT POUR IMPLÉMENTATION** ✅

---

_Généré par TITANE∞ Diagnostic Engine v21_  
_2025-12-11 - Branch: staging_
