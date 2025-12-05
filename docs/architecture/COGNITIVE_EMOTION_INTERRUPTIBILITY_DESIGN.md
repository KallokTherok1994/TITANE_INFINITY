# Design Complet: Cognitive Engine + Emotion Engine + Interruptibility 2.0

**Version**: v13.0.0
**Date**: 22 novembre 2025
**Philosophie**: Trois Centres (Mental, Cœur, Corps) + Divergence → Connexion → Structuration

---

## ÉTAPE 1: CARTOGRAPHIE DE L'EXISTANT

### 1.1 Modules Cognitifs Actuels

#### Interruptibility 2.0 (`src-tauri/src/interruptibility/`)
**Fichiers**: `analyzer.rs`, `adaptor.rs`, `learner.rs`, `window.rs`

**Structures clés**:
```rust
pub enum InterruptionCause {
    Confusion, Correction, Impatience, BetterWording,
    TopicChange, EmotionalReaction, ContextLoss, Politeness
}

pub struct ConversationState {
    pub current_topic: String,
    pub topic_depth: u32,
    pub emotional_state: EmotionalState,
    pub natural_pause_detected: bool,
}

pub struct InterruptionAnalyzer {
    timing_weight: f32,      // 0.4
    content_weight: f32,     // 0.3
    emotion_weight: f32,     // 0.3
}
```

**Méthodes**: `analyze_interruption()`, `calculate_timing_score()`, `analyze_content()`, `is_natural_pause()`

#### Emotion Engine (`src-tauri/src/emotion/`)
**Fichiers**: `detector.rs`, `adaptor.rs`

**Structures clés**:
```rust
pub struct EmotionalState {
    pub valence: f32,              // -1.0 → +1.0
    pub intensity: f32,            // 0.0 → 1.0
    pub primary_emotion: String,   // 11 types
    pub confidence: f32,
}

pub struct AudioFeatures {
    pub pitch_mean: f32,
    pub pitch_variance: f32,
    pub energy: f32,
    pub speech_rate: f32,
}
```

**11 émotions**: Neutral, Joy, Sadness, Anger, Fear, Surprise, Disgust, Trust, Anticipation, Confusion, Frustration

#### Evolutive Twin P85 (`src-tauri/src/system/evolutive_twin/`)
**Fichier**: `mod.rs`

**Structure clé**:
```rust
pub struct P85Core {
    human_state: HumanStateVector,
    system_state: SystemStateVector,
    coevolution_state: CoEvolutionActiveState,
}

pub struct HumanStateVector {
    cognitive_load: f32,          // 0.0 → 1.0
    emotional_valence: f32,       // -1.0 → +1.0
    interaction_rhythm: f32,      // mots/min
    topic_coherence: f32,         // 0.0 → 1.0
}
```

**Méthodes**: `synchronization_score()`, `alignment_quality()`, `evolution_momentum()`, `recommend_adaptation()`

#### Compression Cognitive (`src-tauri/src/compression/`)
**Structure clé**:
```rust
pub enum MemoryLevel {
    ShortTerm,      // < 5 min
    MediumTerm,     // 5-60 min
    LongTerm,       // > 1h
    MetaSummary,    // patterns
}

pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub level: MemoryLevel,
    pub importance: f32,
    pub access_count: u32,
    pub linked_entries: Vec<String>,
}
```

#### Noise Adaptive (`src-tauri/src/noise_adaptive/`)
**Structure clé**:
```rust
pub struct AdaptiveAudioConfig {
    vad_threshold: f32,
    noise_reduction_level: f32,
    environment: EnvironmentProfile,
}

pub enum EnvironmentProfile {
    Silent,      // < 30 dB
    Quiet,       // 30-45 dB
    Moderate,    // 45-60 dB
    Noisy,       // 60-75 dB
    Industrial,  // > 75 dB
}
```

### 1.2 Cores Système

**Helios**: Monitoring CPU/RAM/Disk
**Nexus**: Coherence & état modules
**Harmonia**: Équilibrage système
**Sentinel**: Sécurité & anomalies
**Memory**: Stockage hiérarchique
**SelfHeal**: Auto-réparation

---

## ÉTAPE 2: MODÈLES DE DONNÉES - TROIS CENTRES

### 2.1 Centre Mental (Charge Cognitive)

```rust
/// Mode cognitif actif de l'utilisateur
pub enum CognitiveMode {
    /// Exploration libre, divergence, brainstorming
    Discovery {
        curiosity_level: f32,        // 0.0 → 1.0
        topic_jumping: bool,
    },
    /// Concentration profonde, tâche unique
    Focus {
        depth: f32,                  // 0.0 → 1.0
        interruption_cost: f32,      // coût d'interrompre
    },
    /// Structuration, organisation, synthèse
    Organization {
        clarity_target: f32,
        structuring_phase: StructurePhase,
    },
    /// Repos mental, faible charge
    Rest {
        recovery_rate: f32,
    },
}

pub enum StructurePhase {
    Collecting,      // rassembler
    Connecting,      // relier
    Hierarchizing,   // ordonner
    Crystallizing,   // finaliser
}

/// Tâche cognitive en cours
pub struct CognitiveTask {
    pub id: String,
    pub task_type: TaskType,
    pub complexity: f32,              // 0.0 → 1.0
    pub progress: f32,                // 0.0 → 1.0
    pub mental_load: f32,             // 0.0 → 1.0 (charge actuelle)
    pub started_at: Instant,
    pub interruptions: Vec<InterruptionEvent>,
}

pub enum TaskType {
    Reading,
    Writing,
    Coding,
    Debugging,
    Planning,
    Learning,
    Creating,
}

/// Session cognitive complète
pub struct CognitiveSession {
    pub id: String,
    pub mode: CognitiveMode,
    pub tasks: Vec<CognitiveTask>,
    pub mental_charge: MentalCharge,
    pub started_at: Instant,
    pub paused_at: Option<Instant>,
    pub context: SessionContext,
}

/// Charge mentale globale
pub struct MentalCharge {
    pub current: f32,                 // 0.0 → 1.0
    pub capacity: f32,                // max sustainable
    pub fatigue: f32,                 // 0.0 → 1.0
    pub recovery_needed: bool,
    pub history: VecDeque<f32>,       // 60 dernières minutes
}
```

### 2.2 Centre Cœur (Alignement/Désir/Sens)

```rust
/// État du centre cœur
pub struct HeartState {
    pub alignment: f32,               // 0.0 → 1.0 (tâche = désir?)
    pub motivation: f32,              // 0.0 → 1.0
    pub meaning_connection: f32,      // sens perçu
    pub authenticity: f32,            // "deuxième vitesse"
    pub emotional_state: EmotionalState,
}

/// Recommandation basée cœur
pub enum HeartRecommendation {
    /// La tâche est alignée, continuer
    Continue { reinforcement: String },
    /// Désalignement détecté, proposer pause
    PauseAndReflect { reason: String },
    /// Tâche non-alignée, suggérer changement
    Redirect { suggestion: String },
    /// Fatigue émotionnelle, repos
    EmotionalRest { duration: Duration },
}
```

### 2.3 Centre Corps (Énergie/Fatigue)

```rust
/// État du centre corps
pub struct BodyState {
    pub energy_level: f32,            // 0.0 → 1.0
    pub physical_tension: f32,        // 0.0 → 1.0
    pub voice_fatigue: f32,           // détecté audio
    pub rhythm_quality: f32,          // respiration, débit
    pub environment_stress: f32,      // bruit, interruptions
}

/// Indicateurs physiologiques (via audio)
pub struct PhysiologicalSignals {
    pub speech_rate: f32,             // mots/min
    pub pitch_stability: f32,         // variabilité pitch
    pub energy_mean: f32,             // volume moyen
    pub pause_pattern: PausePattern,  // régularité pauses
    pub stress_markers: Vec<StressMarker>,
}

pub enum StressMarker {
    RapidSpeech,
    PitchTension,
    IrregularPauses,
    LowEnergy,
}
```

### 2.4 État Cognitif Global

```rust
/// État unifié des trois centres
pub struct CognitiveState {
    /// Centre Mental
    pub mental: MentalState {
        pub mode: CognitiveMode,
        pub charge: MentalCharge,
        pub current_task: Option<CognitiveTask>,
        pub session: Option<CognitiveSession>,
    },

    /// Centre Cœur
    pub heart: HeartState,

    /// Centre Corps
    pub body: BodyState,

    /// Scores de cohérence inter-centres
    pub coherence: CenterCoherence {
        pub mental_heart: f32,        // 0.0 → 1.0
        pub heart_body: f32,
        pub body_mental: f32,
        pub global: f32,              // moyenne
    },

    /// Timestamp
    pub timestamp: Instant,
}
```

---

## ÉTAPE 3: ALGORITHMES EMOTION ENGINE

### 3.1 Détection Émotionnelle Multi-Sources

```rust
impl EmotionEngine {
    /// Détecte émotion depuis audio + contexte + historique
    pub async fn detect_emotion(
        &self,
        audio_features: AudioFeatures,
        context: &ConversationContext,
        history: &EmotionHistory,
    ) -> AppResult<EmotionalState> {

        // 1. Score audio (50%)
        let audio_score = self.analyze_audio_features(&audio_features);

        // 2. Score contextuel (30%)
        let context_score = self.analyze_context(context, history);

        // 3. Score tendance (20%)
        let trend_score = self.analyze_trend(history);

        // 4. Fusion scores
        let emotion = self.fuse_scores(audio_score, context_score, trend_score);

        // 5. Validation cohérence
        self.validate_coherence(emotion, history)?;

        Ok(emotion)
    }

    /// Analyse caractéristiques audio
    fn analyze_audio_features(&self, features: &AudioFeatures) -> EmotionScore {
        // Pitch: colère/joie (élevé), tristesse (bas)
        let pitch_emotion = if features.pitch_mean > 200.0 {
            if features.pitch_variance > 50.0 {
                ("anger", 0.7)
            } else {
                ("joy", 0.6)
            }
        } else if features.pitch_mean < 120.0 {
            ("sadness", 0.6)
        } else {
            ("neutral", 0.5)
        };

        // Énergie: intensité émotionnelle
        let intensity = features.energy / 100.0; // normaliser

        // Speech rate: stress/excitement
        let rate_factor = if features.speech_rate > 180.0 {
            0.3 // rapide = stress/excitation
        } else if features.speech_rate < 100.0 {
            -0.2 // lent = calme/tristesse
        } else {
            0.0
        };

        EmotionScore {
            emotion: pitch_emotion.0.to_string(),
            confidence: pitch_emotion.1,
            valence: self.compute_valence(pitch_emotion.0),
            intensity: intensity.clamp(0.0, 1.0),
        }
    }

    /// Génère recommandations système
    pub fn generate_recommendations(
        &self,
        emotion: &EmotionalState,
        cognitive_state: &CognitiveState,
    ) -> Vec<SystemRecommendation> {
        let mut recommendations = Vec::new();

        // Si émotion négative intense + charge mentale élevée
        if emotion.valence < -0.5 && emotion.intensity > 0.7
           && cognitive_state.mental.charge.current > 0.7 {
            recommendations.push(SystemRecommendation::PauseSession {
                reason: "Fatigue cognitive + émotion négative détectées".into(),
                suggested_duration: Duration::from_secs(300), // 5 min
            });
        }

        // Si confusion + mode Focus
        if emotion.primary_emotion == "confusion"
           && matches!(cognitive_state.mental.mode, CognitiveMode::Focus { .. }) {
            recommendations.push(SystemRecommendation::SwitchToDiscovery {
                reason: "Confusion détectée en mode Focus, suggère exploration".into(),
            });
        }

        // Si joie + alignement fort = renforcer
        if emotion.primary_emotion == "joy"
           && cognitive_state.heart.alignment > 0.8 {
            recommendations.push(SystemRecommendation::ReinforceBehavior {
                message: "Excellent alignement cœur-mental détecté, continuez!".into(),
            });
        }

        recommendations
    }
}
```

### 3.2 Historique & Tendances

```rust
pub struct EmotionHistory {
    entries: VecDeque<EmotionEntry>,
    max_size: usize, // 100 dernières émotions
}

impl EmotionHistory {
    /// Calcule tendance émotionnelle
    pub fn compute_trend(&self, window: Duration) -> EmotionTrend {
        let recent = self.get_recent(window);

        let avg_valence = recent.iter()
            .map(|e| e.state.valence)
            .sum::<f32>() / recent.len() as f32;

        let avg_intensity = recent.iter()
            .map(|e| e.state.intensity)
            .sum::<f32>() / recent.len() as f32;

        let volatility = self.compute_volatility(&recent);

        EmotionTrend {
            average_valence: avg_valence,
            average_intensity: avg_intensity,
            volatility,
            dominant_emotion: self.find_dominant(&recent),
        }
    }

    /// Détecte changements brusques
    pub fn detect_emotional_shift(&self) -> Option<EmotionalShift> {
        if self.entries.len() < 3 { return None; }

        let last = self.entries.back()?;
        let prev = self.entries.get(self.entries.len() - 2)?;

        let valence_delta = (last.state.valence - prev.state.valence).abs();
        let intensity_delta = (last.state.intensity - prev.state.intensity).abs();

        if valence_delta > 0.5 || intensity_delta > 0.4 {
            Some(EmotionalShift {
                from: prev.state.clone(),
                to: last.state.clone(),
                magnitude: valence_delta.max(intensity_delta),
                timestamp: last.timestamp,
            })
        } else {
            None
        }
    }
}
```

---

## ÉTAPE 4: ALGORITHMES INTERRUPTIBILITY 2.0

### 4.1 Décision d'Interruption Intelligente

```rust
impl InterruptibilityEngine {
    /// Décide si autoriser interruption maintenant
    pub fn should_allow_interruption(
        &self,
        cognitive_state: &CognitiveState,
        conversation_state: &ConversationState,
    ) -> InterruptionDecision {

        // 1. Score de coût d'interruption
        let cost = self.calculate_interruption_cost(cognitive_state);

        // 2. Fenêtre naturelle?
        let natural_window = conversation_state.natural_pause_detected;

        // 3. Mode cognitif
        let mode_factor = match cognitive_state.mental.mode {
            CognitiveMode::Focus { depth, .. } => {
                1.0 - (depth * 0.8) // Focus profond = coût élevé
            },
            CognitiveMode::Discovery { .. } => 0.3, // Exploration = faible coût
            CognitiveMode::Organization { .. } => 0.6,
            CognitiveMode::Rest { .. } => 0.1, // Repos = interruptible
        };

        // 4. État émotionnel
        let emotion_factor = if cognitive_state.heart.emotional_state.valence < -0.5 {
            1.5 // Émotion négative = augmente coût
        } else {
            1.0
        };

        // 5. Décision finale
        let final_cost = cost * mode_factor * emotion_factor;

        if natural_window && final_cost < 0.4 {
            InterruptionDecision::Allow {
                confidence: 1.0 - final_cost,
                reason: "Fenêtre naturelle + coût faible".into(),
            }
        } else if final_cost < 0.3 {
            InterruptionDecision::Allow {
                confidence: 0.8,
                reason: "Coût acceptable".into(),
            }
        } else if final_cost > 0.7 {
            InterruptionDecision::Deny {
                reason: "Coût trop élevé, focus profond".into(),
                retry_after: Duration::from_secs(30),
            }
        } else {
            InterruptionDecision::Queue {
                reason: "Coût modéré, attente fenêtre naturelle".into(),
                max_wait: Duration::from_secs(15),
            }
        }
    }

    /// Calcule coût d'interrompre la session actuelle
    fn calculate_interruption_cost(&self, state: &CognitiveState) -> f32 {
        let mut cost = 0.0;

        // Charge mentale élevée = coût élevé
        cost += state.mental.charge.current * 0.4;

        // Tâche complexe en cours
        if let Some(task) = &state.mental.current_task {
            cost += task.complexity * 0.3;

            // Tâche presque terminée = coût faible
            if task.progress > 0.8 {
                cost -= 0.2;
            }
        }

        // Fatigue = coût faible (pause bienvenue)
        cost -= state.body.energy_level * 0.2;

        // Cohérence inter-centres élevée = coût élevé (flow)
        cost += state.coherence.global * 0.3;

        cost.clamp(0.0, 1.0)
    }
}
```

### 4.2 Gestion de Sessions Multiples

```rust
pub struct SessionManager {
    active_sessions: Vec<CognitiveSession>,
    paused_sessions: Vec<PausedSession>,
    max_concurrent: usize, // 3
}

impl SessionManager {
    /// Interrompt session actuelle proprement
    pub async fn interrupt_current_session(
        &mut self,
        reason: InterruptionCause,
        context: &CognitiveState,
    ) -> AppResult<SessionSnapshot> {

        let current = self.get_active_session_mut()?;

        // 1. Snapshot état actuel
        let snapshot = SessionSnapshot {
            session_id: current.id.clone(),
            mode: current.mode.clone(),
            context: current.context.clone(),
            mental_state: context.mental.clone(),
            heart_state: context.heart.clone(),
            timestamp: Instant::now(),
            interruption_cause: reason,
        };

        // 2. Pause session
        current.paused_at = Some(Instant::now());

        // 3. Compression mémoire
        self.compress_session_memory(current).await?;

        // 4. Déplacer vers paused
        let paused = self.active_sessions.remove(0);
        self.paused_sessions.push(PausedSession {
            session: paused,
            snapshot: snapshot.clone(),
            resume_priority: self.calculate_resume_priority(&snapshot),
        });

        Ok(snapshot)
    }

    /// Reprend meilleure session en attente
    pub async fn resume_best_session(
        &mut self,
        context: &CognitiveState,
    ) -> AppResult<CognitiveSession> {

        // 1. Trier par priorité + contexte actuel
        self.paused_sessions.sort_by(|a, b| {
            let score_a = self.compute_resume_score(a, context);
            let score_b = self.compute_resume_score(b, context);
            score_b.partial_cmp(&score_a).unwrap()
        });

        // 2. Récupérer meilleure
        let mut best = self.paused_sessions.remove(0);

        // 3. Restaurer contexte
        best.session.paused_at = None;
        self.restore_session_memory(&best.session).await?;

        // 4. Activer
        self.active_sessions.push(best.session.clone());

        Ok(best.session)
    }

    /// Score de pertinence pour reprendre session
    fn compute_resume_score(
        &self,
        paused: &PausedSession,
        current: &CognitiveState,
    ) -> f32 {
        let mut score = 0.0;

        // Alignement mode cognitif
        let mode_match = match (&paused.snapshot.mode, &current.mental.mode) {
            (CognitiveMode::Focus { .. }, CognitiveMode::Focus { .. }) => 0.8,
            (CognitiveMode::Discovery { .. }, CognitiveMode::Discovery { .. }) => 0.7,
            _ => 0.3,
        };
        score += mode_match * 0.4;

        // Priorité intrinsèque
        score += paused.resume_priority * 0.3;

        // Temps écoulé (récent = prioritaire)
        let elapsed = paused.snapshot.timestamp.elapsed().as_secs() as f32;
        let recency = (1.0 - (elapsed / 3600.0)).clamp(0.0, 1.0);
        score += recency * 0.2;

        // Alignement cœur
        score += current.heart.alignment * 0.1;

        score
    }
}
```

---

## ÉTAPE 5: COMPRESSION COGNITIVE & NOISE ADAPTIVE

### 5.1 Compression Adaptative

```rust
impl CognitiveCompressor {
    /// Compresse mémoire selon charge mentale
    pub async fn adaptive_compress(
        &mut self,
        entries: &mut Vec<MemoryEntry>,
        mental_charge: &MentalCharge,
    ) -> AppResult<CompressionResult> {

        // Si charge élevée: compression agressive
        let compression_ratio = if mental_charge.current > 0.7 {
            0.5 // garder 50%
        } else if mental_charge.current > 0.4 {
            0.7
        } else {
            0.9 // garder presque tout
        };

        // Trier par importance
        entries.sort_by(|a, b| {
            let score_a = self.compute_importance(a, mental_charge);
            let score_b = self.compute_importance(b, mental_charge);
            score_b.partial_cmp(&score_a).unwrap()
        });

        // Garder top N%
        let keep_count = (entries.len() as f32 * compression_ratio) as usize;
        let compressed = entries.drain(keep_count..).collect::<Vec<_>>();

        // Créer meta-summary des entrées compressées
        let meta = self.create_meta_summary(&compressed);
        entries.push(meta);

        Ok(CompressionResult {
            original_count: entries.len() + compressed.len(),
            compressed_count: compressed.len(),
            retained_count: entries.len(),
            ratio: compression_ratio,
        })
    }

    /// Calcule importance entrée selon contexte
    fn compute_importance(
        &self,
        entry: &MemoryEntry,
        mental_charge: &MentalCharge,
    ) -> f32 {
        let mut score = entry.importance;

        // Récemment accédé = important
        score += (entry.access_count as f32 * 0.1).min(0.3);

        // Liens nombreux = important
        score += (entry.linked_entries.len() as f32 * 0.05).min(0.2);

        // Si charge élevée, privilégier short-term
        if mental_charge.current > 0.7 {
            score += match entry.level {
                MemoryLevel::ShortTerm => 0.2,
                _ => 0.0,
            };
        }

        score.clamp(0.0, 1.0)
    }
}
```

### 5.2 Adaptation Environnement

```rust
impl NoiseAdaptiveEngine {
    /// Ajuste config selon stress corporel
    pub async fn adapt_to_body_state(
        &mut self,
        body_state: &BodyState,
        current_config: &AdaptiveAudioConfig,
    ) -> AppResult<AdaptiveAudioConfig> {

        let mut new_config = current_config.clone();

        // Stress élevé: relaxer contraintes
        if body_state.environment_stress > 0.7 {
            new_config.vad_threshold -= 0.1;
            new_config.noise_reduction_level += 0.2;
        }

        // Fatigue vocale: augmenter sensibilité
        if body_state.voice_fatigue > 0.6 {
            new_config.vad_threshold -= 0.15;
        }

        // Tension physique: mode apaisant
        if body_state.physical_tension > 0.7 {
            new_config.enable_soothing_mode = true;
        }

        // Clamp valeurs
        new_config.vad_threshold = new_config.vad_threshold.clamp(0.2, 0.8);
        new_config.noise_reduction_level = new_config.noise_reduction_level.clamp(0.0, 1.0);

        Ok(new_config)
    }
}
```

---

## ÉTAPE 6: INTÉGRATION AVEC CORES SYSTÈME

### 6.1 Helios Integration

```rust
impl HeliosCore {
    /// Collecte métriques cognitives
    pub async fn collect_cognitive_metrics(
        &self,
        cognitive_state: &CognitiveState,
    ) -> CognitiveMetrics {
        CognitiveMetrics {
            mental_charge: cognitive_state.mental.charge.current,
            heart_alignment: cognitive_state.heart.alignment,
            body_energy: cognitive_state.body.energy_level,
            coherence_global: cognitive_state.coherence.global,
            mode: format!("{:?}", cognitive_state.mental.mode),
            timestamp: SystemTime::now(),
        }
    }
}
```

### 6.2 Nexus Integration

```rust
impl NexusEngine {
    /// Valide cohérence états cognitifs
    pub async fn validate_cognitive_coherence(
        &self,
        cognitive_state: &CognitiveState,
        emotion_state: &EmotionalState,
    ) -> AppResult<CoherenceReport> {
        let mut issues = Vec::new();

        // Incohérence mental-émotion
        if cognitive_state.mental.mode == CognitiveMode::Focus { .. }
           && emotion_state.primary_emotion == "confusion" {
            issues.push("Focus mode incompatible avec confusion".into());
        }

        // Incohérence cœur-corps
        if cognitive_state.heart.alignment > 0.8
           && cognitive_state.body.energy_level < 0.2 {
            issues.push("Alignement fort mais énergie faible: risque burnout".into());
        }

        Ok(CoherenceReport {
            is_coherent: issues.is_empty(),
            issues,
            global_score: cognitive_state.coherence.global,
        })
    }
}
```

### 6.3 Harmonia Integration

```rust
impl HarmoniaCore {
    /// Recommande équilibrage des trois centres
    pub async fn balance_three_centers(
        &self,
        cognitive_state: &CognitiveState,
    ) -> Vec<BalanceAction> {
        let mut actions = Vec::new();

        // Mental surchargé, corps faible
        if cognitive_state.mental.charge.current > 0.8
           && cognitive_state.body.energy_level < 0.3 {
            actions.push(BalanceAction::ForcePhysicalBreak {
                duration: Duration::from_secs(600),
                reason: "Mental overload + low body energy".into(),
            });
        }

        // Désalignement cœur
        if cognitive_state.heart.alignment < 0.3 {
            actions.push(BalanceAction::HeartCheckIn {
                prompt: "Cette tâche a-t-elle du sens pour vous?".into(),
            });
        }

        // Cohérence faible globale
        if cognitive_state.coherence.global < 0.4 {
            actions.push(BalanceAction::CenteringExercise {
                exercise_type: "Respiration + introspection rapide".into(),
            });
        }

        actions
    }
}
```

### 6.4 Memory Integration

```rust
impl MemoryCore {
    /// Stocke session cognitive complète
    pub async fn store_cognitive_session(
        &mut self,
        session: &CognitiveSession,
    ) -> AppResult<()> {
        let entry = MemoryEntry {
            id: session.id.clone(),
            content: serde_json::to_string(session)?,
            level: MemoryLevel::MediumTerm,
            importance: self.compute_session_importance(session),
            access_count: 0,
            linked_entries: vec![],
        };

        self.store(entry).await
    }

    fn compute_session_importance(&self, session: &CognitiveSession) -> f32 {
        let mut score = 0.5;

        // Session longue = importante
        let duration = session.started_at.elapsed().as_secs() as f32;
        score += (duration / 3600.0).min(0.3);

        // Haute cohérence = importante
        // (récupérer depuis contexte final)

        score.clamp(0.0, 1.0)
    }
}
```

### 6.5 SelfHeal Integration

```rust
impl SelfHealCore {
    /// Détecte incidents cognitifs
    pub async fn detect_cognitive_incidents(
        &self,
        cognitive_state: &CognitiveState,
        history: &StateHistory,
    ) -> Vec<CognitiveIncident> {
        let mut incidents = Vec::new();

        // Charge mentale bloquée à 100%
        if cognitive_state.mental.charge.current > 0.95 {
            if let Some(duration) = self.check_sustained_high_load(history) {
                if duration > Duration::from_secs(1800) {
                    incidents.push(CognitiveIncident::SustainedOverload {
                        duration,
                        severity: IncidentSeverity::Critical,
                    });
                }
            }
        }

        // Désalignement prolongé
        if cognitive_state.heart.alignment < 0.2 {
            incidents.push(CognitiveIncident::ProlongedMisalignment {
                current_alignment: cognitive_state.heart.alignment,
                severity: IncidentSeverity::Warning,
            });
        }

        // Épuisement corporel
        if cognitive_state.body.energy_level < 0.1
           && cognitive_state.mental.charge.current > 0.6 {
            incidents.push(CognitiveIncident::EnergyDepletion {
                severity: IncidentSeverity::Critical,
            });
        }

        incidents
    }

    /// Auto-réparation cognitive
    pub async fn auto_repair_cognitive(
        &mut self,
        incident: &CognitiveIncident,
    ) -> AppResult<RepairAction> {
        match incident {
            CognitiveIncident::SustainedOverload { .. } => {
                Ok(RepairAction::ForceSystemPause {
                    duration: Duration::from_secs(900),
                    notification: "Surcharge détectée: pause forcée 15min".into(),
                })
            },
            CognitiveIncident::ProlongedMisalignment { .. } => {
                Ok(RepairAction::TriggerReflection {
                    prompt: "Questionnaire alignement cœur/mental".into(),
                })
            },
            CognitiveIncident::EnergyDepletion { .. } => {
                Ok(RepairAction::ShutdownNonEssential {
                    modules: vec!["analytics", "background_tasks"],
                    notification: "Mode économie d'énergie activé".into(),
                })
            },
        }
    }
}
```

---

## ÉTAPE 7: API TAURI & STRATÉGIE DE TESTS

### 7.1 Commandes Tauri

```rust
// src-tauri/src/commands/cognitive.rs

#[tauri::command]
pub async fn get_cognitive_state(
    state: State<'_, Arc<Mutex<CognitiveEngine>>>,
) -> Result<CognitiveState, String> {
    let engine = state.lock().await;
    Ok(engine.get_current_state().clone())
}

#[tauri::command]
pub async fn update_cognitive_mode(
    mode: CognitiveMode,
    state: State<'_, Arc<Mutex<CognitiveEngine>>>,
) -> Result<(), String> {
    let mut engine = state.lock().await;
    engine.set_mode(mode).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_cognitive_session(
    mode: CognitiveMode,
    context: SessionContext,
    state: State<'_, Arc<Mutex<SessionManager>>>,
) -> Result<String, String> {
    let mut manager = state.lock().await;
    let session = manager.create_session(mode, context).await
        .map_err(|e| e.to_string())?;
    Ok(session.id)
}

#[tauri::command]
pub async fn interrupt_session(
    reason: InterruptionCause,
    state: State<'_, Arc<Mutex<SessionManager>>>,
) -> Result<SessionSnapshot, String> {
    let mut manager = state.lock().await;
    let cognitive_state = /* récupérer depuis CognitiveEngine */;
    manager.interrupt_current_session(reason, &cognitive_state).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_emotion_state(
    state: State<'_, Arc<Mutex<EmotionEngine>>>,
) -> Result<EmotionalState, String> {
    let engine = state.lock().await;
    Ok(engine.get_current_emotion().clone())
}

#[tauri::command]
pub async fn get_interruptibility_score(
    state: State<'_, Arc<Mutex<InterruptibilityEngine>>>,
) -> Result<f32, String> {
    let engine = state.lock().await;
    let cognitive_state = /* récupérer */;
    let conversation_state = /* récupérer */;
    let decision = engine.should_allow_interruption(&cognitive_state, &conversation_state);

    Ok(match decision {
        InterruptionDecision::Allow { confidence, .. } => confidence,
        InterruptionDecision::Queue { .. } => 0.5,
        InterruptionDecision::Deny { .. } => 0.0,
    })
}

#[tauri::command]
pub async fn get_three_centers_coherence(
    state: State<'_, Arc<Mutex<CognitiveEngine>>>,
) -> Result<CenterCoherence, String> {
    let engine = state.lock().await;
    Ok(engine.get_current_state().coherence.clone())
}
```

### 7.2 Streams Temps Réel

```rust
// src-tauri/src/streams/cognitive_stream.rs

pub fn setup_cognitive_stream(app: &AppHandle) {
    let app_handle = app.clone();

    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(2));

        loop {
            interval.tick().await;

            // Récupérer état actuel
            let cognitive_state = /* depuis CognitiveEngine */;

            // Émettre vers frontend
            app_handle.emit_all("cognitive-state-update", cognitive_state)
                .ok();
        }
    });
}

pub fn setup_emotion_stream(app: &AppHandle) {
    let app_handle = app.clone();

    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_millis(500));

        loop {
            interval.tick().await;

            let emotion = /* depuis EmotionEngine */;

            app_handle.emit_all("emotion-update", emotion)
                .ok();
        }
    });
}
```

### 7.3 Stratégie de Tests

```rust
// tests/cognitive_engine_tests.rs

#[tokio::test]
async fn test_mental_charge_calculation() {
    let mut engine = CognitiveEngine::new();

    // Créer tâche complexe
    let task = CognitiveTask {
        id: "task1".into(),
        task_type: TaskType::Coding,
        complexity: 0.8,
        progress: 0.3,
        mental_load: 0.0,
        started_at: Instant::now(),
        interruptions: vec![],
    };

    engine.start_task(task).await.unwrap();

    let state = engine.get_current_state();
    assert!(state.mental.charge.current > 0.5);
}

#[tokio::test]
async fn test_emotion_trend_detection() {
    let mut history = EmotionHistory::new(100);

    // Ajouter séquence négative
    for _ in 0..10 {
        history.add(EmotionalState {
            valence: -0.6,
            intensity: 0.7,
            primary_emotion: "sadness".into(),
            confidence: 0.8,
        });
    }

    let trend = history.compute_trend(Duration::from_secs(60));
    assert!(trend.average_valence < -0.5);
    assert_eq!(trend.dominant_emotion, "sadness");
}

#[tokio::test]
async fn test_interruption_decision_focus_mode() {
    let engine = InterruptibilityEngine::new();

    let cognitive_state = CognitiveState {
        mental: MentalState {
            mode: CognitiveMode::Focus {
                depth: 0.9,
                interruption_cost: 0.8,
            },
            // ...
        },
        // ...
    };

    let decision = engine.should_allow_interruption(
        &cognitive_state,
        &ConversationState::default(),
    );

    assert!(matches!(decision, InterruptionDecision::Deny { .. }));
}

#[tokio::test]
async fn test_session_resume_scoring() {
    let mut manager = SessionManager::new();

    // Créer 2 sessions pausées
    let session1 = create_test_session(CognitiveMode::Focus { .. });
    let session2 = create_test_session(CognitiveMode::Discovery { .. });

    manager.pause_session(session1).await.unwrap();
    manager.pause_session(session2).await.unwrap();

    // Contexte actuel = Focus
    let current = CognitiveState {
        mental: MentalState {
            mode: CognitiveMode::Focus { depth: 0.7, interruption_cost: 0.6 },
            // ...
        },
        // ...
    };

    let resumed = manager.resume_best_session(&current).await.unwrap();
    assert!(matches!(resumed.mode, CognitiveMode::Focus { .. }));
}

#[tokio::test]
async fn test_three_centers_coherence() {
    let engine = CognitiveEngine::new();

    let state = CognitiveState {
        mental: MentalState { /* charge: 0.8 */ },
        heart: HeartState { alignment: 0.9, /* ... */ },
        body: BodyState { energy_level: 0.7, /* ... */ },
        coherence: CenterCoherence {
            mental_heart: 0.85,
            heart_body: 0.8,
            body_mental: 0.75,
            global: 0.8,
        },
        // ...
    };

    assert!(state.coherence.global > 0.7); // Bonne cohérence
}
```

### 7.4 Tests d'Intégration

```rust
#[tokio::test]
async fn test_full_cognitive_flow() {
    // 1. Initialiser tous les engines
    let mut cognitive_engine = CognitiveEngine::new();
    let mut emotion_engine = EmotionEngine::new();
    let mut interrupt_engine = InterruptibilityEngine::new();
    let mut session_manager = SessionManager::new();

    // 2. Démarrer session Focus
    let session = session_manager.create_session(
        CognitiveMode::Focus { depth: 0.0, interruption_cost: 0.5 },
        SessionContext::default(),
    ).await.unwrap();

    // 3. Simuler travail intense
    for i in 0..10 {
        cognitive_engine.update_mental_charge(0.1 * i as f32).await;
        tokio::time::sleep(Duration::from_millis(100)).await;
    }

    // 4. Tenter interruption
    let state = cognitive_engine.get_current_state();
    let decision = interrupt_engine.should_allow_interruption(
        &state,
        &ConversationState::default(),
    );

    // Focus profond = refus
    assert!(matches!(decision, InterruptionDecision::Deny { .. }));

    // 5. Pause naturelle
    cognitive_engine.set_natural_pause(true).await;

    let decision2 = interrupt_engine.should_allow_interruption(
        &state,
        &ConversationState { natural_pause_detected: true, .. },
    );

    // Pause naturelle = autorisation
    assert!(matches!(decision2, InterruptionDecision::Allow { .. }));
}
```

---

## RÉSUMÉ ARCHITECTURAL

### Composants Principaux

1. **CognitiveEngine**: Gestion état mental, modes, sessions
2. **EmotionEngine**: Détection émotions multi-sources, recommandations
3. **InterruptibilityEngine**: Décisions interruptions intelligentes
4. **SessionManager**: Gestion sessions multiples, pause/reprise
5. **CognitiveCompressor**: Compression mémoire adaptative
6. **NoiseAdaptiveEngine**: Adaptation environnement audio

### Philosophie des Trois Centres

- **Mental**: Charge cognitive, modes, tâches, fatigue
- **Cœur**: Alignement, motivation, sens, authenticité
- **Corps**: Énergie, tension, fatigue vocale, environnement

### Intégration Cores Système

- **Helios**: Métriques cognitives
- **Nexus**: Validation cohérence
- **Harmonia**: Équilibrage centres
- **Memory**: Stockage sessions
- **SelfHeal**: Incidents cognitifs + auto-réparation

### API Tauri

8 commandes principales + 2 streams temps réel pour monitoring continu

### Tests

- Tests unitaires par composant
- Tests d'intégration flow complet
- Validation philosophie trois centres

---

**FIN DU DOCUMENT** - Prêt pour implémentation v13+
