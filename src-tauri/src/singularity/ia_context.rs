// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞.19.3Ω — IA Context State
//   State tracking for Multi-Agents + Unified IA Engine
//   Phase 8: Integration with Singularity System
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Statut d'un moteur IA
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum IAStatus {
    /// Moteur disponible et opérationnel
    Available,

    /// Moteur indisponible (clé API manquante)
    Unavailable,

    /// Moteur en erreur (dernière tentative échouée)
    Error,

    /// Moteur désactivé par l'utilisateur
    Disabled,

    /// Moteur en cours de test
    Testing,
}

impl Default for IAStatus {
    fn default() -> Self {
        IAStatus::Unavailable
    }
}

/// Métrique d'utilisation d'un moteur IA
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct IAEngineMetrics {
    /// Nombre total de requêtes
    pub total_requests: u64,

    /// Nombre de requêtes réussies
    pub successful_requests: u64,

    /// Nombre de requêtes échouées
    pub failed_requests: u64,

    /// Latence moyenne (ms)
    pub average_latency_ms: u64,

    /// Total de tokens utilisés
    pub total_tokens: u64,

    /// Dernière utilisation (timestamp ISO 8601)
    pub last_used_at: Option<String>,
}

/// Contexte IA global du système
///
/// Intègre l'état des moteurs IA (OpenAI, Claude, Gemini, Local)
/// avec le système Multi-Agents (permissions, recommandations)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IAContext {
    /// Moteur IA actuellement actif
    pub active_engine: Option<String>,

    /// Liste des moteurs IA disponibles
    pub available_engines: Vec<String>,

    /// Statut de chaque moteur IA
    pub engine_status: HashMap<String, IAStatus>,

    /// Métriques d'utilisation par moteur
    pub engine_metrics: HashMap<String, IAEngineMetrics>,

    /// Dernier agent ayant utilisé l'IA (Phase 7)
    pub last_used_agent: Option<String>,

    /// Permissions IA par agent (agent_id → permission)
    pub agent_permissions: HashMap<String, String>,

    /// Recommandations de moteur par agent (agent_id → engine_name)
    pub agent_recommendations: HashMap<String, String>,

    /// Historique des requêtes IA (limité aux 100 dernières)
    pub request_history: Vec<IARequestRecord>,

    /// Configuration du fallback automatique
    pub auto_fallback_enabled: bool,

    /// Ordre de fallback (ex: ["claude", "openai", "gemini", "local"])
    pub fallback_order: Vec<String>,

    /// Version du contexte IA
    pub version: String,

    /// Timestamp de dernière mise à jour
    pub updated_at: String,
}

/// Enregistrement d'une requête IA
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IARequestRecord {
    /// ID unique de la requête
    pub request_id: String,

    /// Moteur utilisé
    pub engine: String,

    /// Agent ayant fait la requête (optionnel)
    pub agent_id: Option<String>,

    /// Timestamp de la requête
    pub timestamp: String,

    /// Latence (ms)
    pub latency_ms: u64,

    /// Nombre de tokens
    pub tokens: usize,

    /// Succès ou échec
    pub success: bool,

    /// Message d'erreur éventuel
    pub error_message: Option<String>,

    /// Fallback utilisé ?
    pub fallback_used: bool,
}

impl Default for IAContext {
    fn default() -> Self {
        let mut engine_status = HashMap::new();
        engine_status.insert("openai".to_string(), IAStatus::Unavailable);
        engine_status.insert("claude".to_string(), IAStatus::Unavailable);
        engine_status.insert("gemini".to_string(), IAStatus::Unavailable);
        engine_status.insert("local".to_string(), IAStatus::Available);

        let mut engine_metrics = HashMap::new();
        for engine in &["openai", "claude", "gemini", "local"] {
            engine_metrics.insert(engine.to_string(), IAEngineMetrics::default());
        }

        Self {
            active_engine: None,
            available_engines: vec!["local".to_string()],
            engine_status,
            engine_metrics,
            last_used_agent: None,
            agent_permissions: HashMap::new(),
            agent_recommendations: HashMap::new(),
            request_history: Vec::new(),
            auto_fallback_enabled: true,
            fallback_order: vec![
                "claude".to_string(),
                "openai".to_string(),
                "gemini".to_string(),
                "local".to_string(),
            ],
            version: "v∞.19.3Ω".to_string(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

impl IAContext {
    /// Crée un nouveau contexte IA avec valeurs par défaut
    pub fn new() -> Self {
        Self::default()
    }

    /// Met à jour le moteur actif
    pub fn set_active_engine(&mut self, engine: String) {
        self.active_engine = Some(engine);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Met à jour la liste des moteurs disponibles
    pub fn update_available_engines(&mut self, engines: Vec<String>) {
        self.available_engines = engines;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Met à jour le statut d'un moteur
    pub fn update_engine_status(&mut self, engine: &str, status: IAStatus) {
        self.engine_status.insert(engine.to_string(), status);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Enregistre une nouvelle requête IA
    pub fn record_request(&mut self, record: IARequestRecord) {
        // Mettre à jour les métriques
        if let Some(metrics) = self.engine_metrics.get_mut(&record.engine) {
            metrics.total_requests += 1;
            if record.success {
                metrics.successful_requests += 1;
            } else {
                metrics.failed_requests += 1;
            }
            metrics.total_tokens += record.tokens as u64;

            // Mise à jour latence moyenne (moyenne mobile cumulative)
            // Utiliser calcul en f64 pour éviter perte de précision
            let total = metrics.total_requests;
            let prev_avg = metrics.average_latency_ms as f64;
            let new_latency = record.latency_ms as f64;
            let new_avg = (prev_avg * (total - 1) as f64 + new_latency) / total as f64;
            metrics.average_latency_ms = new_avg.round() as u64;

            metrics.last_used_at = Some(record.timestamp.clone());
        }

        // Ajouter à l'historique (max 100 entrées)
        self.request_history.push(record);
        if self.request_history.len() > 100 {
            self.request_history.remove(0);
        }

        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Met à jour le dernier agent utilisé
    pub fn set_last_used_agent(&mut self, agent_id: String) {
        self.last_used_agent = Some(agent_id);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Met à jour les permissions d'un agent
    pub fn update_agent_permission(&mut self, agent_id: String, permission: String) {
        self.agent_permissions.insert(agent_id, permission);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Met à jour la recommandation de moteur pour un agent
    pub fn update_agent_recommendation(&mut self, agent_id: String, engine: String) {
        self.agent_recommendations.insert(agent_id, engine);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    /// Obtient les statistiques globales
    pub fn get_global_stats(&self) -> IAGlobalStats {
        let mut total_requests = 0u64;
        let mut total_successful = 0u64;
        let mut total_failed = 0u64;
        let mut total_tokens = 0u64;

        for metrics in self.engine_metrics.values() {
            total_requests += metrics.total_requests;
            total_successful += metrics.successful_requests;
            total_failed += metrics.failed_requests;
            total_tokens += metrics.total_tokens;
        }

        let success_rate = if total_requests > 0 {
            (total_successful as f64 / total_requests as f64) * 100.0
        } else {
            0.0
        };

        IAGlobalStats {
            total_requests,
            total_successful,
            total_failed,
            success_rate,
            total_tokens,
            engines_available: self.available_engines.len(),
            active_engine: self.active_engine.clone(),
            last_used_agent: self.last_used_agent.clone(),
        }
    }

    /// Obtient le prochain moteur en cas de fallback
    pub fn get_next_fallback_engine(&self, current_engine: &str) -> Option<String> {
        if !self.auto_fallback_enabled {
            return None;
        }

        let current_index = self.fallback_order.iter().position(|e| e == current_engine)?;

        for engine in &self.fallback_order[(current_index + 1)..] {
            if self.available_engines.contains(engine) {
                if let Some(status) = self.engine_status.get(engine) {
                    if *status == IAStatus::Available {
                        return Some(engine.clone());
                    }
                }
            }
        }

        None
    }
}

/// Statistiques globales IA
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IAGlobalStats {
    pub total_requests: u64,
    pub total_successful: u64,
    pub total_failed: u64,
    pub success_rate: f64,
    pub total_tokens: u64,
    pub engines_available: usize,
    pub active_engine: Option<String>,
    pub last_used_agent: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ia_context_creation() {
        let ctx = IAContext::new();
        assert_eq!(ctx.available_engines, vec!["local"]);
        assert!(ctx.auto_fallback_enabled);
        assert_eq!(ctx.fallback_order.len(), 4);
    }

    #[test]
    fn test_record_request() {
        let mut ctx = IAContext::new();

        let record = IARequestRecord {
            request_id: "test-123".to_string(),
            engine: "openai".to_string(),
            agent_id: Some("code_gen".to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            latency_ms: 150,
            tokens: 500,
            success: true,
            error_message: None,
            fallback_used: false,
        };

        ctx.record_request(record);

        assert_eq!(ctx.request_history.len(), 1);
        let metrics = ctx.engine_metrics.get("openai").unwrap();
        assert_eq!(metrics.total_requests, 1);
        assert_eq!(metrics.successful_requests, 1);
        assert_eq!(metrics.total_tokens, 500);
    }

    #[test]
    fn test_fallback_chain() {
        let mut ctx = IAContext::new();
        ctx.available_engines = vec!["openai".to_string(), "local".to_string()];
        ctx.update_engine_status("openai", IAStatus::Available);
        ctx.update_engine_status("local", IAStatus::Available);

        let next = ctx.get_next_fallback_engine("claude");
        assert_eq!(next, Some("openai".to_string()));
    }

    #[test]
    fn test_global_stats() {
        let mut ctx = IAContext::new();

        for i in 0..10 {
            let record = IARequestRecord {
                request_id: format!("req-{}", i),
                engine: "openai".to_string(),
                agent_id: None,
                timestamp: chrono::Utc::now().to_rfc3339(),
                latency_ms: 100 + i,
                tokens: 100,
                success: i < 8,
                error_message: if i >= 8 { Some("Error".to_string()) } else { None },
                fallback_used: false,
            };
            ctx.record_request(record);
        }

        let stats = ctx.get_global_stats();
        assert_eq!(stats.total_requests, 10);
        assert_eq!(stats.total_successful, 8);
        assert_eq!(stats.total_failed, 2);
        assert_eq!(stats.success_rate, 80.0);
        assert_eq!(stats.total_tokens, 1000);
    }
}
