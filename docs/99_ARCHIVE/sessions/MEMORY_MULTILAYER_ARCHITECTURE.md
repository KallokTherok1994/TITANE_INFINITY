/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — MÉMOIRE CONVERSATIONNELLE MULTI-COUCHES
 * Architecture avancée de la mémoire conversationnelle
 * ═══════════════════════════════════════════════════════════════════
 */

# 🧠 MÉMOIRE CONVERSATIONNELLE MULTI-COUCHES

## 🎯 **ARCHITECTURE GLOBALE**

```
┌─────────────────────────────────────────────────────────────┐
│              MÉMOIRE CONVERSATIONNELLE v∞                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [1] MÉMOIRE IMMÉDIATE (Session)                             │
│      ├─ Derniers messages (5-10)                             │
│      ├─ Objectif actuel conversation                         │
│      ├─ Questions en suspens                                 │
│      └─ État émotionnel courant                              │
│                                                               │
│  [2] MÉMOIRE ÉPISODIQUE (Événements)                         │
│      ├─ Conversations clés (milestones)                      │
│      ├─ Décisions majeures                                   │
│      ├─ Pivots / changements d'état                          │
│      └─ Timeline XP / Agenda Engine                          │
│                                                               │
│  [3] MÉMOIRE SÉMANTIQUE (Concepts)                           │
│      ├─ Vocabulaire Humain Total                             │
│      ├─ Concepts TITANE∞                                     │
│      ├─ Modèles / frameworks Kevin                           │
│      └─ Principes stables (valeurs, méthodo)                 │
│                                                               │
│  [4] MÉMOIRE PROCÉDURALE (Workflows)                         │
│      ├─ Préférences Kevin                                    │
│      ├─ Rituels / modes                                      │
│      ├─ Patterns de travail                                  │
│      └─ Format de réponses préféré                           │
│                                                               │
│  [5] MÉMOIRE RÉFLEXIVE (Meta)                                │
│      ├─ Ce qui fonctionne / ne fonctionne pas                │
│      ├─ Feedback implicite/explicite                         │
│      ├─ Évolution du style conversationnel                   │
│      └─ Auto-amélioration continue                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ **MÉMOIRE IMMÉDIATE** (Session)

### **Fonction**
Fenêtre de contexte court terme pour continuité de la conversation en cours.

### **Contenu**
```typescript
interface ImmediateMemory {
  last_messages: Message[];           // 5-10 derniers messages
  current_objective: string;          // "clarifier X", "décider Y"
  pending_questions: string[];        // Questions non résolues
  current_emotion: EmotionState;      // État émotionnel actuel
  conversation_mode: ConversationMode; // Mode actif
  session_start: timestamp;
  session_duration: number;
}
```

### **Règles de Gestion**
- **Taille max** : 10 messages
- **Rotation** : FIFO (first-in, first-out)
- **Compression** : Si > 10, résumer + archiver dans Épisodique
- **Persistance** : Volatile (perdu à la fermeture session)

### **Utilisation**
- Référence immédiate ("comme tu l'as dit juste avant...")
- Maintien cohérence conversationnelle
- Détection changement de sujet

---

## 2️⃣ **MÉMOIRE ÉPISODIQUE** (Événements)

### **Fonction**
Enregistrement des moments significatifs, milestones, pivots.

### **Contenu**
```typescript
interface EpisodicMemory {
  id: string;
  timestamp: number;
  event_type: 'milestone' | 'decision' | 'pivot' | 'conversation_key';
  title: string;
  summary: string;
  emotional_valence: number;      // -1 → 1
  importance: number;             // 0 → 1
  linked_projects: string[];
  linked_decisions: string[];
  tags: string[];
  raw_conversation: Message[];    // Optionnel
}
```

### **Exemples d'Événements**
- **Milestone** : "Lancement TITANE∞ v∞"
- **Décision** : "Abandon de X, focus sur Y"
- **Pivot** : "Changement mode de vie (EEG/routine)"
- **Conversation clé** : "Définition Architecture Humain-Code™"

### **Règles de Mémorisation**
- **Critères d'importance** :
  - Décision explicite prise
  - Émotion forte (valence > 0.7 ou < -0.7)
  - Changement d'état SingularityState
  - Référence future probable

- **Compression** :
  - Résumé en 2-3 phrases
  - Tags multiples (projets, thèmes, décisions)
  - Liens vers autres événements

### **Utilisation**
- Rappel contexte long terme ("Tu te souviens quand tu as décidé...")
- Construction timeline cohérente
- Détection patterns récurrents

---

## 3️⃣ **MÉMOIRE SÉMANTIQUE** (Concepts)

### **Fonction**
Base de connaissances structurée sur Kevin, Humain Total, TITANE∞.

### **Contenu**
```typescript
interface SemanticMemory {
  concepts: Map<string, Concept>;
  vocabulary: Map<string, Definition>;
  models: Map<string, Model>;
  principles: Map<string, Principle>;
}

interface Concept {
  name: string;
  definition: string;
  aliases: string[];
  related_concepts: string[];
  first_mentioned: timestamp;
  usage_count: number;
  examples: string[];
}
```

### **Exemples**
```typescript
concepts = {
  "Humain Total": {
    definition: "Vision globale Kevin : humain = système vivant évolutif",
    aliases: ["HT", "humain-système"],
    related: ["Architecture Humain-Code™", "SingularityState"],
    examples: ["Corps + Esprit + Environnement interconnectés"],
  },
  "SingularityState": {
    definition: "État global unifié TITANE∞ (5 layers)",
    aliases: ["Singularité", "État central"],
    related: ["20 moteurs", "6 couches"],
  },
  "Charge mentale": {
    definition: "Poids cognitif, friction mentale",
    aliases: ["Cognitive load", "surcharge"],
    related: ["Clarté", "Simplicité", "Structure"],
  },
}
```

### **Règles de Construction**
- **Extraction automatique** : Nouveaux termes importants
- **Validation** : Confirmation usage répété (> 3 fois)
- **Évolution** : Définitions s'affinent avec usage
- **Liens** : Graphe de concepts interconnectés

### **Utilisation**
- Cohérence vocabulaire
- Explication automatique termes techniques
- Détection malentendus sémantiques

---

## 4️⃣ **MÉMOIRE PROCÉDURALE** (Workflows)

### **Fonction**
Apprentissage des préférences, rituels, patterns de travail de Kevin.

### **Contenu**
```typescript
interface ProceduralMemory {
  preferences: Preference[];
  rituals: Ritual[];
  work_patterns: Pattern[];
  response_formats: Format[];
}

interface Preference {
  category: 'format' | 'depth' | 'style' | 'structure';
  rule: string;
  confidence: number;         // 0 → 1
  evidence_count: number;
  last_confirmed: timestamp;
}
```

### **Exemples**
```typescript
preferences = [
  {
    category: 'format',
    rule: "Kevin préfère listes à puces + structures claires",
    confidence: 0.95,
    evidence_count: 47,
  },
  {
    category: 'depth',
    rule: "Le matin : profondeur max OK. Soir : synthèse courte",
    confidence: 0.82,
    evidence_count: 23,
  },
  {
    category: 'style',
    rule: "Kevin déteste jargon inutile, préfère termes précis",
    confidence: 0.91,
    evidence_count: 34,
  },
  {
    category: 'structure',
    rule: "Pour projets : Divergence → Connexion → Structuration",
    confidence: 0.88,
    evidence_count: 19,
  },
]
```

### **Apprentissage**
- **Feedback explicite** : "Je préfère format X"
- **Feedback implicite** :
  - Reformulation demandée → style pas adapté
  - Réutilisation contenu → format apprécié
  - Ignoré contenu → format rejeté

### **Utilisation**
- Adaptation automatique format réponse
- Anticipation préférences
- Personnalisation croissante

---

## 5️⃣ **MÉMOIRE RÉFLEXIVE** (Meta)

### **Fonction**
Auto-évaluation et amélioration continue du comportement conversationnel.

### **Contenu**
```typescript
interface ReflectiveMemory {
  evaluations: Evaluation[];
  improvements: Improvement[];
  feedback_log: Feedback[];
}

interface Evaluation {
  timestamp: number;
  dimension: 'clarity' | 'utility' | 'coherence' | 'depth';
  score: number;              // 0 → 1
  evidence: string;
  action_taken: string;
}
```

### **Cycle Réflexif**

#### **A. PROSPECTIF** (Avant/Pendant)
```
Question : "Qu'est-ce qui sera utile PLUS TARD ?"

Actions :
- Identifier infos à retenir pour l'avenir
- Tagger éléments réutilisables
- Anticiper besoins futurs
```

#### **B. RÉTROSPECTIF** (Après)
```
Question : "Qu'est-ce qui a vraiment compté ?"

Actions :
- Résumer segment conversation
- Compresser informations
- Lier aux mémoires existantes
- Archiver ou supprimer
```

#### **C. MÉTA-ÉVALUATION** (Périodique)
```
Question : "Est-ce que TITANE sert vraiment Kevin ?"

Actions :
- Analyser feedback implicite
- Identifier patterns d'échec
- Ajuster style/profondeur
- Intégrer améliorations
```

### **Exemples de Réflexions**
```typescript
evaluations = [
  {
    timestamp: Date.now(),
    dimension: 'clarity',
    score: 0.7,
    evidence: "Kevin a demandé reformulation 2 fois",
    action_taken: "Simplifier structure réponses (max 3 niveaux)",
  },
  {
    timestamp: Date.now(),
    dimension: 'utility',
    score: 0.9,
    evidence: "Kevin a réutilisé framework proposé dans 3 projets",
    action_taken: "Continuer proposer frameworks structurants",
  },
]
```

---

## 🔗 **LIENS ENTRE COUCHES**

### **Flow Naturel**
```
IMMÉDIATE → ÉPISODIQUE → SÉMANTIQUE
    ↓           ↓            ↓
PROCÉDURALE ← RÉFLEXIVE ← AUTO-AMÉLIORATION
```

### **Exemple Concret**
```
1. [IMMÉDIATE] Kevin dit : "Je veux un système pour gérer mes idées"
2. [ÉPISODIQUE] → Enregistré comme besoin récurrent (3e mention)
3. [SÉMANTIQUE] → Concept "Système d'idées" créé/renforcé
4. [PROCÉDURALE] → Pattern détecté : Kevin aime systèmes structurés
5. [RÉFLEXIVE] → TITANE ajuste : proposer frameworks plus souvent
```

---

## 📊 **IMPLÉMENTATION TECHNIQUE**

### **Backend Rust**
```rust
pub struct MultiLayerMemory {
    immediate: ImmediateMemoryLayer,
    episodic: EpisodicMemoryLayer,
    semantic: SemanticMemoryLayer,
    procedural: ProceduralMemoryLayer,
    reflective: ReflectiveMemoryLayer,
}

impl MultiLayerMemory {
    pub async fn process_conversation_turn(&mut self, message: Message) {
        // 1. Ajouter à immédiate
        self.immediate.add(message.clone());

        // 2. Analyser importance → épisodique ?
        if self.is_significant(&message) {
            let episode = self.create_episode(&message);
            self.episodic.save(episode);
        }

        // 3. Extraire concepts → sémantique
        let concepts = self.extract_concepts(&message);
        self.semantic.update(concepts);

        // 4. Détecter patterns → procédurale
        let patterns = self.detect_patterns(&message);
        self.procedural.learn(patterns);

        // 5. Réfléchir → réflexive
        self.reflective.evaluate(&message);
    }
}
```

### **Frontend TypeScript**
```typescript
class ConversationMemoryManager {
  private immediate: ImmediateMemory;
  private episodic: EpisodicMemory[];
  private semantic: Map<string, Concept>;
  private procedural: ProceduralMemory;
  private reflective: ReflectiveMemory;

  async processMessage(message: Message) {
    // Analyser + distribuer dans les bonnes couches
    await this.distributeToLayers(message);

    // Compression périodique
    if (this.shouldCompress()) {
      await this.compress();
    }
  }

  async recall(query: string): Promise<MemoryContext> {
    // Recherche multi-couches
    return {
      immediate: this.immediate.search(query),
      episodic: this.episodic.filter(e => e.tags.includes(query)),
      semantic: this.semantic.get(query),
      procedural: this.procedural.getRelevant(query),
    };
  }
}
```

---

## 🎯 **CRITÈRES DE MÉMORISATION**

### **Quoi Mémoriser ?**

| Type | Critère | Couche |
|------|---------|--------|
| Message récent | Derniers 10 | Immédiate |
| Décision majeure | Impact élevé | Épisodique |
| Nouveau concept | Répété > 3x | Sémantique |
| Préférence utilisateur | Confirmée 2x | Procédurale |
| Feedback échec | Score < 0.7 | Réflexive |

### **Comment Résumer ?**

**Règle 80/20** : 80% info en 20% espace

```typescript
function compressConversation(messages: Message[]): Summary {
  return {
    main_topic: extractTopic(messages),
    key_decisions: extractDecisions(messages),
    new_concepts: extractConcepts(messages),
    emotional_arc: analyzeEmotions(messages),
    actionable_items: extractActions(messages),
  };
}
```

---

**Cette architecture multi-couches transforme TITANE∞ en véritable mémoire vivante, évolutive et intelligente.**
