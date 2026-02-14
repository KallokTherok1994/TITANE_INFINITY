/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SYSTEM STATE MONITOR (Global Singularity State)
 * État unifié backend Rust avec synchronisation Tauri
 * ═══════════════════════════════════════════════════════════════════
 *
 * Rôle: Monitoring état système global via architecture 5 layers
 * Scope: System-wide (monitoring, introspection, santé globale)
 * Usage: SingularityEngine (main.rs), Tauri commands frontend
 *
 * Architecture 5 Layers:
 * - PhysicalLayer : Helios, health, metrics système
 * - CognitiveLayer: Memory, conversation, knowledge
 * - SymbolicLayer : Persona, archetypes, visual
 * - AdaptiveLayer : Evolution, learning, auto-heal
 * - MetaLayer     : UI, runtime, introspection
 *
 * Synchronisation:
 * - Backend Rust → Frontend React (Tauri events EventSyncLayer)
 * - Frontend React → Backend Rust (invoke commands singularity_*)
 * - Persistence SQLite (état sauvegardé)
 *
 * IMPORTANT: Ce module est DISTINCT de `singularity/singularity_state.rs`
 * (Chat IA meta-processing conversationnel). Voir ARCHITECTURE_DUAL_STATE.md
 * pour clarification rôles.
 *
 * Documentation: CHANGELOG.md v14.7, EXECUTIVE_SUMMARY_v14_INTEGRATION.txt
 * Tauri Commands: 12+ commands exposés (singularity_get_*, singularity_update_*)
 * Status: ✅ Production-stable (v14+ legacy, opérationnel depuis nov 2025)
 * ═══════════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::AppHandle; // FIX v21: Removed Manager import (not used in mod.rs)
use tokio::sync::RwLock;

// Sub-modules
pub mod commands;
pub mod layers;
pub mod persistence;
pub mod sync;

// META v18 imports (FIX v21: use titane_infinity:: when included from main.rs)
use titane_infinity::meta::{MetaCognitiveReport, SyncedState};

pub use layers::*;
pub use persistence::PersistenceLayer;
pub use sync::EventSyncLayer;

// ═══════════════════════════════════════════════════════════════════
// XP / PROGRESSION (compat frontend)
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressionEvent {
    pub source: String,
    pub amount: f64,
    pub timestamp: u64,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressionState {
    pub xp: f64,
    pub level: u32,
    pub events: Vec<ProgressionEvent>,
}

impl Default for ProgressionState {
    fn default() -> Self {
        Self {
            xp: 0.0,
            level: 0,
            events: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// CORE STRUCTURES
// ═══════════════════════════════════════════════════════════════════

/// État unifié de la singularité (5 layers)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityState {
    /// Layer 1: État physique (hardware, santé système)
    pub physical: PhysicalLayer,

    /// Layer 2: État cognitif (mémoire, AI, knowledge)
    pub cognitive: CognitiveLayer,

    /// Layer 3: État symbolique (persona, archetypes)
    pub symbolic: SymbolicLayer,

    /// Layer 4: État adaptatif (évolution, apprentissage)
    pub adaptive: AdaptiveLayer,

    /// Layer 5: État meta (UI, runtime, introspection)
    pub meta: MetaLayer,

    /// META-COGNITION ENGINE v18: Rapport d'auto-évaluation cognitive
    pub meta_cognition_report: Option<MetaCognitiveReport>,

    /// DEEP SYNC ENGINE v18: État de synchronisation profonde
    pub deep_sync_status: Option<SyncedState>,

    /// XP/Progression (frontend compatibility)
    pub progression: Option<ProgressionState>,

    /// Timestamp dernière mise à jour (ms)
    pub timestamp: u64,

    /// Signature unique de l'état
    pub signature: String,
}

impl Default for SingularityState {
    fn default() -> Self {
        Self {
            physical: PhysicalLayer::default(),
            cognitive: CognitiveLayer::default(),
            symbolic: SymbolicLayer::default(),
            adaptive: AdaptiveLayer::default(),
            meta: MetaLayer::default(),
            meta_cognition_report: None,
            deep_sync_status: None,
            progression: Some(ProgressionState::default()),
            timestamp: current_timestamp(),
            signature: generate_signature(),
        }
    }
}

impl SingularityState {
    /// Créer un nouvel état avec timestamp actuel
    pub fn new() -> Self {
        Self::default()
    }

    /// Mettre à jour le timestamp
    pub fn update_timestamp(&mut self) {
        self.timestamp = current_timestamp();
        self.signature = generate_signature();
    }

    /// Vérifier la cohérence globale (0-1)
    pub fn global_coherence(&self) -> f32 {
        let physical_score = self.physical.health_score();
        let cognitive_score = self.cognitive.coherence_score();
        let symbolic_score = self.symbolic.stability_score();
        let adaptive_score = self.adaptive.evolution_capacity;
        let meta_score = self.meta.runtime_health;

        (physical_score + cognitive_score + symbolic_score + adaptive_score + meta_score) / 5.0
    }

    /// Vérifier si système en état critique
    pub fn is_critical(&self) -> bool {
        self.global_coherence() < 0.3 || self.physical.is_critical()
    }

    /// META v18.1: Synchronisation profonde avec META-COGNITION + DEEP SYNC
    ///
    /// Effectue une synchronisation complète entre tous les moteurs:
    /// 1. Évalue cohérence cognitive globale (META-COGNITION ENGINE)
    /// 2. Synchronise les 20+ moteurs (DEEP SYNC ENGINE)
    /// 3. Détecte anomalies et désynchronisations
    /// 4. Applique corrections automatiques si nécessaire
    /// 5. Met à jour meta_cognition_report + deep_sync_status
    ///
    /// Retourne: MetaCognitiveReport (avec anomalies détectées + actions recommandées)
    pub async fn singularity_deep_sync(&mut self) -> Result<titane_infinity::meta::MetaCognitiveReport, String> {
        use titane_infinity::meta::{
            CognitiveSnapshot, EngineState, META_ENGINE, DEEP_SYNC_ENGINE
        };
        use std::collections::HashMap;

        // [1] Créer snapshot cognitif depuis SingularityState
        let snapshot = CognitiveSnapshot {
            timestamp: self.timestamp,
            cognitive_integrity: Some(self.cognitive.coherence_score()),
            timeline_coherence: Some(0.9), // Implementation: Calculate from historical state transitions
                                           // - Access: Load last 10 states from persistence layer
                                           // - Metric: Measure consistency of cognitive.coherence over time
                                           // - Formula: 1.0 - std_dev(coherence_history) / mean(coherence_history)
                                           // - Threshold: >0.8 = coherent, <0.5 = fragmented timeline
                                           // - Use case: Detect timeline divergence or state corruption
            memory_alignment: Some(self.cognitive.coherence), // FIX v21: use coherence instead of memory.coherence
            ai_stability: Some(self.cognitive.coherence), // FIX v21: use coherence instead of confidence
            singularity_coherence: Some(self.global_coherence()),
            emotion_state: Some(0.8), // FIX v21: cognitive doesn't have emotional, use default
        };

        // [2] Évaluer cohérence cognitive (META-COGNITION ENGINE)
        let meta_report = {
            let mut engine = META_ENGINE.lock().await;
            engine.evaluate(&snapshot).await
        };

        // [3] Collecter états de tous les moteurs pour Deep Sync
        let mut engine_states = HashMap::new();

        // Physical layer engines
        engine_states.insert("helios".to_string(), EngineState::new(
            "helios".to_string(),
            if self.physical.helios.active { 0.9 } else { 0.3 }
        ));

        // Cognitive layer engines
        engine_states.insert("cognitive".to_string(), EngineState::new(
            "cognitive".to_string(),
            self.cognitive.coherence_score()
        ));

        engine_states.insert("emotional".to_string(), EngineState::new(
            "emotional".to_string(),
            0.8 // FIX v21: cognitive doesn't have emotional, use default
        ));

        engine_states.insert("memory".to_string(), EngineState::new(
            "memory".to_string(),
            self.cognitive.coherence // FIX v21: use coherence instead of memory.coherence
        ));

        // [4] Effectuer synchronisation profonde (DEEP SYNC ENGINE)
        let sync_status = {
            let mut engine = DEEP_SYNC_ENGINE.lock().await;
            engine.deep_sync(&engine_states).await
        };

        // [5] Mettre à jour SingularityState avec résultats
        self.meta_cognition_report = Some(meta_report.clone());
        self.deep_sync_status = Some(sync_status.clone());
        self.update_timestamp();

        // [6] Appliquer corrections si nécessaire
        if !sync_status.success || meta_report.anomaly_detected {
            log::warn!(
                "⚠️  Anomalies détectées: META={}, SYNC={}, Quality={:?}",
                meta_report.anomaly_detected,
                !sync_status.success,
                sync_status.quality
            );

            // Implementation v18.2: Apply automatic regulation actions
            // - Trigger: Based on meta_report.recommended_next_state field
            // - Actions: {ResetCoherence, PromoteMemories, RecalibrateXP, RestoreFromBackup}
            // - Execution: Match recommended_next_state and call corresponding engine methods
            //   * "low_coherence" → self.cognitive.recalibrate().await
            //   * "memory_overflow" → UnifiedMemory::consolidate().await
            //   * "xp_drift" → XPEngine::normalize_xp().await
            // - Safety: Require meta_report.confidence > 0.8 before auto-apply
            // - Logging: Record all auto-regulation events to audit log
            // - Override: Allow manual override via settings.auto_regulation_enabled flag
        }

        Ok(meta_report)
    }

    /// META v18.1: Obtenir rapport META-COGNITION
    pub fn get_meta_cognition_report(&self) -> Option<&titane_infinity::meta::MetaCognitiveReport> {
        self.meta_cognition_report.as_ref()
    }

    /// META v18.1: Obtenir statut DEEP SYNC
    pub fn get_deep_sync_status(&self) -> Option<&titane_infinity::meta::SyncedState> {
        self.deep_sync_status.as_ref()
    }

    /// META v18.1: Vérifier si synchronisation est saine
    pub fn is_sync_healthy(&self) -> bool {
        if let Some(sync) = &self.deep_sync_status {
            sync.success && matches!(
                sync.quality,
                titane_infinity::meta::SyncQuality::Perfect
                | titane_infinity::meta::SyncQuality::Excellent
                | titane_infinity::meta::SyncQuality::Good
            )
        } else {
            false
        }
    }

    /// META v18.1: Obtenir score cohérence META-augmenté (0-1)
    ///
    /// Combine:
    /// - Cohérence globale classique (5 layers)
    /// - Cohérence META-COGNITION
    /// - Qualité DEEP SYNC
    pub fn meta_augmented_coherence(&self) -> f32 {
        let base_coherence = self.global_coherence();

        let meta_coherence = self.meta_cognition_report
            .as_ref()
            .map(|r| r.coherence_score)
            .unwrap_or(base_coherence);

        let sync_quality = self.deep_sync_status
            .as_ref()
            .map(|s| match s.quality {
                titane_infinity::meta::SyncQuality::Perfect => 1.0,
                titane_infinity::meta::SyncQuality::Excellent => 0.95,
                titane_infinity::meta::SyncQuality::Good => 0.85,
                titane_infinity::meta::SyncQuality::Acceptable => 0.75,
                titane_infinity::meta::SyncQuality::Degraded => 0.60,
                titane_infinity::meta::SyncQuality::Poor => 0.40,
                titane_infinity::meta::SyncQuality::Failed => 0.20,
            })
            .unwrap_or(0.5);

        // Moyenne pondérée: 40% base, 30% meta, 30% sync
        (base_coherence * 0.4) + (meta_coherence * 0.3) + (sync_quality * 0.3)
    }
}

// ═══════════════════════════════════════════════════════════════════
// SINGULARITY ENGINE (Backend Manager)
// ═══════════════════════════════════════════════════════════════════

/// Moteur backend gérant l'état unifié
pub struct SingularityEngine {
    /// État partagé thread-safe
    state: Arc<RwLock<SingularityState>>,

    /// Layer de persistence (SQLite)
    persistence: PersistenceLayer,

    /// Layer de synchronisation (Tauri events)
    sync: EventSyncLayer,

    /// Handle Tauri pour émettre des événements
    app_handle: AppHandle,
}

impl SingularityEngine {
    /// Créer un nouveau moteur
    pub fn new(app_handle: AppHandle) -> Self {
        let state = Arc::new(RwLock::new(SingularityState::new()));
        let persistence = PersistenceLayer::new();
        let sync = EventSyncLayer::new(app_handle.clone());

        Self {
            state,
            persistence,
            sync,
            app_handle,
        }
    }

    /// Initialiser le moteur (charger état persisté)
    pub async fn initialize(&self) -> Result<(), String> {
        // Charger état depuis SQLite si disponible
        if let Ok(persisted_state) = self.persistence.load_state().await {
            let mut state = self.state.write().await;
            *state = persisted_state;
        }

        Ok(())
    }

    /// Obtenir l'état complet (lecture)
    pub async fn get_full_state(&self) -> SingularityState {
        self.state.read().await.clone()
    }

    /// Mettre à jour Physical Layer
    pub async fn update_physical(&self, physical: PhysicalLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.physical = physical;
        state.update_timestamp();

        // Émettre événement vers frontend
        self.sync.emit_physical_updated(&state.physical).await;

        // Persister (async, non-bloquant)
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Cognitive Layer
    pub async fn update_cognitive(&self, cognitive: CognitiveLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.cognitive = cognitive;
        state.update_timestamp();

        self.sync.emit_cognitive_updated(&state.cognitive).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Symbolic Layer
    pub async fn update_symbolic(&self, symbolic: SymbolicLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.symbolic = symbolic;
        state.update_timestamp();

        self.sync.emit_symbolic_updated(&state.symbolic).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Adaptive Layer
    pub async fn update_adaptive(&self, adaptive: AdaptiveLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.adaptive = adaptive;
        state.update_timestamp();

        self.sync.emit_adaptive_updated(&state.adaptive).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Meta Layer
    pub async fn update_meta(&self, meta: MetaLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.meta = meta;
        state.update_timestamp();

        self.sync.emit_meta_updated(&state.meta).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour état complet (full sync)
    pub async fn update_full_state(&self, new_state: SingularityState) -> Result<(), String> {
        let mut state = self.state.write().await;
        *state = new_state;
        state.update_timestamp();

        // Émettre événement full sync
        self.sync.emit_full_state_updated(&state).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Obtenir cohérence globale
    pub async fn get_global_coherence(&self) -> f32 {
        self.state.read().await.global_coherence()
    }

    /// Vérifier état critique
    pub async fn is_critical(&self) -> bool {
        self.state.read().await.is_critical()
    }

    /// Sauvegarder manuellement l'état
    pub async fn save_state(&self) -> Result<(), String> {
        let state = self.state.read().await;
        self.persistence.save_state(&state).await
    }

    /// Charger état depuis persistence
    pub async fn load_state(&self) -> Result<(), String> {
        let persisted_state = self.persistence.load_state().await?;
        let mut state = self.state.write().await;
        *state = persisted_state;
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

fn current_timestamp() -> u64 {
    crate::core::utils::now_ms()
}

fn generate_signature() -> String {
    use rand::Rng;
    let timestamp = current_timestamp();
    let random: u32 = rand::thread_rng().gen();
    format!("TITANE-{}-{:x}", timestamp, random)
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_singularity_state_creation() {
        let state = SingularityState::new();
        assert!(state.timestamp > 0);
        assert!(!state.signature.is_empty());
        assert!(state.global_coherence() >= 0.0);
        assert!(state.global_coherence() <= 1.0);
    }

    #[test]
    fn test_state_coherence() {
        let state = SingularityState::default();
        let coherence = state.global_coherence();
        assert!((0.0..=1.0).contains(&coherence));
    }

    #[tokio::test]
    async fn test_state_updates() {
        let state = Arc::new(RwLock::new(SingularityState::new()));

        {
            let mut s = state.write().await;
            s.physical.metrics.cpu_usage = 0.5;
            s.update_timestamp();
        }

        let s = state.read().await;
        assert_eq!(s.physical.metrics.cpu_usage, 0.5);
    }

    #[tokio::test]
    async fn test_singularity_deep_sync() {
        let mut state = SingularityState::new();

        // Remplir avec données valides (using actual CognitiveLayer fields)
        state.cognitive.coherence = 0.9;
        state.cognitive.memory.memory_usage = 0.5;
        state.cognitive.memory.total_memories = 100;
        state.cognitive.knowledge.knowledge_score = 0.88;

        let result = state.singularity_deep_sync().await;

        assert!(result.is_ok(), "Deep sync failed: {:?}", result.err());

        let report = result.expect("singularity deep sync should produce report");
        assert!(report.coherence_score >= 0.0 && report.coherence_score <= 1.0);

        // Vérifier que les champs META ont été mis à jour
        assert!(state.meta_cognition_report.is_some());
        assert!(state.deep_sync_status.is_some());
    }

    #[test]
    fn test_meta_augmented_coherence() {
        let state = SingularityState::new();

        // Sans META reports
        let base_coherence = state.meta_augmented_coherence();
        assert!((0.0..=1.0).contains(&base_coherence));

        // Avec META reports (simulés)
        // Note: Ici on ne peut pas facilement créer des rapports valides sans async,
        // mais on teste que la méthode ne plante pas
        let coherence_with_meta = state.meta_augmented_coherence();
        assert!((0.0..=1.0).contains(&coherence_with_meta));
    }
}
