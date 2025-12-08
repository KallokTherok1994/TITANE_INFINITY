# 📋 MÉMOIRE MULTI-COUCHES v∞ — QUICK START

## 🎯 Vue d'ensemble

La **Mémoire Conversationnelle Multi-Couches** étend le Conversation Engine v∞ avec 5 niveaux de mémoire intelligente qui permettent à TITANE∞ de :

1. **Retenir** le contexte de session immédiat
2. **Se souvenir** des moments significatifs (milestones, décisions)
3. **Comprendre** vos concepts et votre vocabulaire
4. **Apprendre** vos préférences et rituels
5. **S'améliorer** par auto-évaluation continue

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│         ConversationEngineState                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────────────────────┐       │
│  │  MultiLayerMemoryManager                 │       │
│  ├──────────────────────────────────────────┤       │
│  │  [1] IMMÉDIATE    (session courante)     │       │
│  │  [2] ÉPISODIQUE   (événements clés)      │       │
│  │  [3] SÉMANTIQUE   (concepts)             │       │
│  │  [4] PROCÉDURALE  (préférences)          │       │
│  │  [5] RÉFLEXIVE    (auto-évaluation)      │       │
│  └──────────────────────────────────────────┘       │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 📦 Types disponibles

### **MemoryLayers**
```rust
pub struct MemoryLayers {
    pub immediate: bool,        // Toujours true
    pub episodic: bool,         // Si événement significatif
    pub semantic: Vec<String>,  // Concepts extraits
    pub procedural: Vec<String>,// Patterns détectés
    pub reflective: bool,       // Si nécessite évaluation
}
```

### **EpisodicMemory**
```rust
pub struct EpisodicMemory {
    pub id: String,
    pub timestamp: i64,
    pub event_type: EpisodeType,  // Milestone/Decision/Pivot/ConversationKey
    pub title: String,
    pub summary: String,
    pub emotional_valence: f64,
    pub importance: f64,
    pub linked_projects: Vec<String>,
    pub linked_decisions: Vec<String>,
    pub tags: Vec<String>,
}
```

### **Concept**
```rust
pub struct Concept {
    pub name: String,
    pub definition: String,
    pub aliases: Vec<String>,
    pub related_concepts: Vec<String>,
    pub first_mentioned: i64,
    pub usage_count: i32,
    pub examples: Vec<String>,
}
```

### **Preference**
```rust
pub struct Preference {
    pub category: PreferenceCategory,  // Format/Depth/Style/Structure
    pub rule: String,
    pub confidence: f64,
    pub evidence_count: i32,
    pub last_confirmed: i64,
}
```

### **Evaluation**
```rust
pub struct Evaluation {
    pub timestamp: i64,
    pub dimension: EvaluationDimension,  // Clarity/Utility/Coherence/Depth
    pub score: f64,
    pub evidence: String,
    pub action_taken: String,
}
```

---

## 🚀 Utilisation

### **1. Accès depuis ConversationEngineState**

```rust
// Accéder au gestionnaire de mémoire multi-couches
let multilayer = conversation_engine.multilayer_memory.read().await;

// Ajouter message à mémoire immédiate
multilayer.add_to_immediate(
    user_message.to_string(),
    assistant_message.to_string(),
);

// Sauvegarder événement épisodique
multilayer.save_episode(
    "Décision Architecture v∞".to_string(),
    "Kevin a validé l'architecture du système...".to_string(),
    EpisodeType::Decision,
    &emotion,
    0.95,  // importance élevée
    vec!["architecture", "v∞", "validation"],
);
```

### **2. Mémoire Épisodique**

```rust
let mut memory = conversation_engine.multilayer_memory.write().await;

// Enregistrer milestone
memory.save_episode(
    "Lancement TITANE∞ v19.2.3".to_string(),
    "Déploiement réussi avec tous les moteurs actifs".to_string(),
    EpisodeType::Milestone,
    &emotion_state,
    1.0,
    vec!["milestone", "deployment", "v19.2.3"],
);

// Récupérer épisodes récents
let recent = memory.get_recent_episodes(5);
for episode in recent {
    println!("{}: {}", episode.title, episode.summary);
}
```

### **3. Mémoire Sémantique**

```rust
let mut memory = conversation_engine.multilayer_memory.write().await;

// Apprendre nouveau concept
memory.update_concept(
    "SingularityState".to_string(),
    "État global unifié de TITANE∞ (5 layers, 20 moteurs)".to_string(),
    "Le SingularityState synchronise tous les moteurs...".to_string(),
);

// Récupérer définition
if let Some(concept) = memory.get_concept("SingularityState") {
    println!("Concept: {}", concept.definition);
    println!("Utilisé {} fois", concept.usage_count);
}
```

### **4. Mémoire Procédurale**

```rust
let mut memory = conversation_engine.multilayer_memory.write().await;

// Apprendre préférence
memory.learn_preference(
    PreferenceCategory::Format,
    "Kevin préfère listes à puces + structures claires".to_string(),
    0.92,  // confiance élevée
);

// Récupérer préférences de format
let format_prefs = memory.get_preferences(&PreferenceCategory::Format);
for pref in format_prefs {
    println!("{} (confiance: {})", pref.rule, pref.confidence);
}
```

### **5. Mémoire Réflexive**

```rust
let mut memory = conversation_engine.multilayer_memory.write().await;

// Enregistrer évaluation
memory.add_evaluation(
    EvaluationDimension::Clarity,
    0.85,
    "Kevin a demandé reformulation 1 fois".to_string(),
    "Simplifier structure des réponses".to_string(),
);

// Score moyen de clarté
let avg_clarity = memory.get_evaluation_average(&EvaluationDimension::Clarity);
println!("Score de clarté moyen: {}", avg_clarity);
```

### **6. Consolidation de Session**

```rust
let mut memory = conversation_engine.multilayer_memory.write().await;

// Consolider mémoire immédiate vers épisodique/sémantique
memory.consolidate_session();
```

---

## 🔄 Intégration avec Pipeline

Le **CognitiveCompressor** analyse automatiquement les couches de mémoire :

```rust
// Dans cognitive.rs
fn analyze_memory_layers(
    &self,
    intention: &Intention,
    emotion: &EmotionState,
    message: &str,
) -> MemoryLayers {
    let mut layers = MemoryLayers::default();

    // Immédiate : toujours
    layers.immediate = true;

    // Épisodique : si décision ou émotion forte
    layers.episodic = message.contains("décidé")
        || emotion.intensity > 0.7;

    // Sémantique : concepts détectés
    if message.contains("SingularityState") {
        layers.semantic.push("concept_titane".to_string());
    }

    // Procédurale : patterns
    if message.contains("liste") {
        layers.procedural.push("prefers_lists".to_string());
    }

    // Réflexive : si meta ou émotion négative
    layers.reflective = matches!(intention, Intention::Meta)
        || emotion.valence < -0.5;

    layers
}
```

---

## 📊 Critères de Mémorisation Automatique

### **Épisodique activée si :**
- Message contient "décidé", "choisir"
- Émotion intense (> 0.7) ou forte valence (< -0.7 ou > 0.7)
- Meta-conversation longue (> 200 caractères)

### **Sémantique activée si :**
- Détection concepts : "SingularityState", "Humain Total", "charge mentale"
- Nouveaux termes techniques répétés > 3 fois

### **Procédurale activée si :**
- Patterns détectés : "liste", "puces", "synthèse", "résumé"
- Profondeur demandée : "détail", "approfondi", "court", "simple"

### **Réflexive activée si :**
- Intention = Meta
- Émotion négative (valence < -0.5)
- Feedback explicite sur qualité réponse

---

## 🎯 Exemples d'Usage

### **Scénario 1 : Enregistrer décision importante**
```typescript
// Frontend
const response = await processMessage({
  user_message: "J'ai décidé d'adopter l'architecture v∞ pour le projet",
  conversation_id: currentConvId,
  mode: "default",
});

// Backend détecte automatiquement :
// - episodic: true (mot "décidé")
// - semantic: ["concept_architecture"]
// - procedural: []
// - reflective: false
```

### **Scénario 2 : Apprendre préférence**
```typescript
// Utilisateur dit plusieurs fois : "peux-tu faire une liste ?"
// Après 3 occurrences :
// - procedural: ["prefers_lists"]
// - confidence: augmente progressivement

// TITANE adapte automatiquement format réponses
```

### **Scénario 3 : Auto-évaluation**
```typescript
// Utilisateur : "reformule s'il te plaît, c'est pas clair"
// Backend enregistre :
memory.add_evaluation(
  EvaluationDimension::Clarity,
  0.4,  // score faible
  "Reformulation demandée",
  "Simplifier vocabulaire technique"
);

// TITANE ajuste style pour prochaines réponses
```

---

## 📈 Statistiques et Monitoring

```rust
// Compter épisodes
let episode_count = memory.episodic.len();

// Concepts appris
let concept_count = memory.semantic.len();

// Préférences détectées
let pref_count = memory.procedural.len();

// Moyenne d'évaluations
let avg_utility = memory.get_evaluation_average(&EvaluationDimension::Utility);
```

---

## 🔗 Liens entre Couches

```
IMMÉDIATE → ÉPISODIQUE → SÉMANTIQUE
    ↓           ↓            ↓
PROCÉDURALE ← RÉFLEXIVE ← AUTO-AMÉLIORATION
```

**Flow naturel :**
1. Message entre en **Immédiate**
2. Si significatif → **Épisodique**
3. Concepts extraits → **Sémantique**
4. Patterns détectés → **Procédurale**
5. Évaluation continue → **Réflexive**
6. Boucle d'amélioration : **Réflexive** informe **Procédurale** qui adapte comportement futur

---

## 🛠️ Commandes Tauri (à venir)

```rust
// À ajouter dans commands.rs
#[tauri::command]
pub async fn conversation_get_episodes(
    state: tauri::State<'_, ConversationEngineState>,
    count: usize,
) -> Result<Vec<EpisodicMemory>, String> {
    let memory = state.multilayer_memory.read().await;
    Ok(memory.get_recent_episodes(count).into_iter().cloned().collect())
}

#[tauri::command]
pub async fn conversation_get_concept(
    state: tauri::State<'_, ConversationEngineState>,
    concept_name: String,
) -> Result<Option<Concept>, String> {
    let memory = state.multilayer_memory.read().await;
    Ok(memory.get_concept(&concept_name).cloned())
}
```

---

**TITANE∞ possède maintenant une mémoire vivante, évolutive et auto-perfectionnante** 🚀
