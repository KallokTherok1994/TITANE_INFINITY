//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE-2 — COGNITIVE COMPRESSION ENGINE
//! Compression intelligente des données anciennes
//! © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/// Âge en jours avant compression (données anciennes)
pub const DEFAULT_AGE_THRESHOLD_DAYS: u64 = 30;

/// Nombre minimum d'items avant compression
pub const MIN_ITEMS_FOR_COMPRESSION: usize = 100;

/// Ratio de compression cible
pub const TARGET_COMPRESSION_RATIO: f32 = 0.2; // Garder 20% des données

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Résumé cognitif (données compressées)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveSummary {
    /// ID unique du résumé
    pub id: String,
    /// Période couverte (début)
    pub period_start: u64,
    /// Période couverte (fin)
    pub period_end: u64,
    /// Nombre d'items originaux
    pub original_count: u64,
    /// Thèmes principaux
    pub themes: Vec<Theme>,
    /// Points clés
    pub key_points: Vec<KeyPoint>,
    /// Marqueurs de contexte
    pub context_markers: Vec<ContextMarker>,
    /// Timestamp de création
    pub created_at: u64,
    /// Hash des données originales (pour vérification)
    pub source_hash: String,
}

/// Thème extrait
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub weight: f32,
    pub occurrences: u32,
}

/// Point clé
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPoint {
    pub content: String,
    pub importance: f32,
    pub timestamp: u64,
    pub source_type: String,
}

/// Marqueur de contexte
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMarker {
    pub marker_type: String,
    pub value: String,
    pub timestamp: u64,
}

/// Configuration de compression
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionConfig {
    /// Âge minimum en jours
    pub age_threshold_days: u64,
    /// Nombre minimum d'items
    pub min_items: usize,
    /// Ratio de compression
    pub compression_ratio: f32,
    /// Garder les événements importants
    pub preserve_important: bool,
    /// Seuil d'importance (0-1)
    pub importance_threshold: f32,
}

impl Default for CompressionConfig {
    fn default() -> Self {
        Self {
            age_threshold_days: DEFAULT_AGE_THRESHOLD_DAYS,
            min_items: MIN_ITEMS_FOR_COMPRESSION,
            compression_ratio: TARGET_COMPRESSION_RATIO,
            preserve_important: true,
            importance_threshold: 0.8,
        }
    }
}

/// Rapport de compression
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionReport {
    pub items_processed: u64,
    pub items_compressed: u64,
    pub summaries_created: u64,
    pub bytes_before: u64,
    pub bytes_after: u64,
    pub compression_ratio: f32,
    pub duration_ms: u64,
    pub success: bool,
    pub errors: Vec<String>,
    pub timestamp: u64,
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPRESSION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur de compression cognitive
pub struct CognitiveCompressionEngine {
    config: CompressionConfig,
    /// Résumés créés
    summaries: Vec<CognitiveSummary>,
    /// Historique des compressions
    history: Vec<CompressionReport>,
}

impl CognitiveCompressionEngine {
    pub fn new() -> Self {
        Self::with_config(CompressionConfig::default())
    }

    pub fn with_config(config: CompressionConfig) -> Self {
        Self {
            config,
            summaries: Vec::new(),
            history: Vec::new(),
        }
    }

    /// Compresser des messages/conversations anciennes
    pub fn compress_messages(
        &mut self,
        messages: &[Message],
    ) -> Result<CompressionReport, CompressionError> {
        let start = std::time::Instant::now();
        let now = chrono::Utc::now().timestamp_millis() as u64;
        let threshold_ms = now - (self.config.age_threshold_days * 24 * 60 * 60 * 1000);

        let mut report = CompressionReport {
            items_processed: messages.len() as u64,
            items_compressed: 0,
            summaries_created: 0,
            bytes_before: 0,
            bytes_after: 0,
            compression_ratio: 0.0,
            duration_ms: 0,
            success: false,
            errors: Vec::new(),
            timestamp: now,
        };

        // Filtrer les messages anciens
        let old_messages: Vec<&Message> = messages
            .iter()
            .filter(|m| m.timestamp < threshold_ms)
            .collect();

        if old_messages.len() < self.config.min_items {
            log::debug!(
                "[CognitiveCompression] Pas assez de messages anciens ({} < {})",
                old_messages.len(),
                self.config.min_items
            );
            report.success = true;
            report.duration_ms = start.elapsed().as_millis() as u64;
            return Ok(report);
        }

        // Calculer la taille avant
        for msg in &old_messages {
            report.bytes_before += msg.content.len() as u64;
        }

        // Grouper par période (jour/semaine)
        let grouped = self.group_by_period(&old_messages);

        // Créer un résumé par groupe
        for (period_key, group) in grouped {
            let period_key_clone = period_key.clone();
            match self.create_summary(period_key, &group) {
                Ok(summary) => {
                    report.bytes_after += serde_json::to_string(&summary)
                        .map(|s| s.len() as u64)
                        .unwrap_or(0);
                    report.summaries_created += 1;
                    report.items_compressed += group.len() as u64;
                    self.summaries.push(summary);
                }
                Err(e) => {
                    report
                        .errors
                        .push(format!("Groupe {}: {}", period_key_clone, e));
                }
            }
        }

        // Calculer le ratio
        if report.bytes_before > 0 {
            report.compression_ratio =
                1.0 - (report.bytes_after as f32 / report.bytes_before as f32);
        }

        report.duration_ms = start.elapsed().as_millis() as u64;
        report.success = report.errors.is_empty();

        self.history.push(report.clone());

        log::info!(
            "[CognitiveCompression] ✅ {} messages → {} résumés (ratio: {:.1}%)",
            report.items_compressed,
            report.summaries_created,
            report.compression_ratio * 100.0
        );

        Ok(report)
    }

    /// Compresser des événements du journal
    pub fn compress_events(
        &mut self,
        events: &[super::types::TitanEvent],
    ) -> Result<CompressionReport, CompressionError> {
        let start = std::time::Instant::now();
        let now = chrono::Utc::now().timestamp_millis() as u64;
        let threshold_ms = now - (self.config.age_threshold_days * 24 * 60 * 60 * 1000);

        let mut report = CompressionReport {
            items_processed: events.len() as u64,
            items_compressed: 0,
            summaries_created: 0,
            bytes_before: 0,
            bytes_after: 0,
            compression_ratio: 0.0,
            duration_ms: 0,
            success: false,
            errors: Vec::new(),
            timestamp: now,
        };

        // Filtrer les événements anciens
        let old_events: Vec<&super::types::TitanEvent> = events
            .iter()
            .filter(|e| e.timestamp < threshold_ms)
            .collect();

        if old_events.len() < self.config.min_items {
            report.success = true;
            report.duration_ms = start.elapsed().as_millis() as u64;
            return Ok(report);
        }

        // Calculer taille avant
        for event in &old_events {
            if let Ok(json) = serde_json::to_string(event) {
                report.bytes_before += json.len() as u64;
            }
        }

        // Grouper par module + période
        let grouped = self.group_events_by_module(&old_events);

        for ((module, period), group) in grouped {
            let key_points: Vec<KeyPoint> = group
                .iter()
                .take(10) // Garder les 10 premiers
                .map(|e| KeyPoint {
                    content: format!("{}:{}", e.event_type, e.module),
                    importance: 0.5,
                    timestamp: e.timestamp,
                    source_type: "event".to_string(),
                })
                .collect();

            let summary = CognitiveSummary {
                id: uuid::Uuid::new_v4().to_string(),
                period_start: group.first().map(|e| e.timestamp).unwrap_or(0),
                period_end: group.last().map(|e| e.timestamp).unwrap_or(0),
                original_count: group.len() as u64,
                themes: vec![Theme {
                    name: module.clone(),
                    weight: 1.0,
                    occurrences: group.len() as u32,
                }],
                key_points,
                context_markers: vec![ContextMarker {
                    marker_type: "period".to_string(),
                    value: period.clone(),
                    timestamp: now,
                }],
                created_at: now,
                source_hash: Self::compute_hash(&format!("{}:{}", module, period)),
            };

            if let Ok(json) = serde_json::to_string(&summary) {
                report.bytes_after += json.len() as u64;
            }
            report.summaries_created += 1;
            report.items_compressed += group.len() as u64;
            self.summaries.push(summary);
        }

        if report.bytes_before > 0 {
            report.compression_ratio =
                1.0 - (report.bytes_after as f32 / report.bytes_before as f32);
        }

        report.duration_ms = start.elapsed().as_millis() as u64;
        report.success = true;

        self.history.push(report.clone());
        Ok(report)
    }

    /// Grouper les messages par période
    fn group_by_period<'a>(&self, messages: &[&'a Message]) -> HashMap<String, Vec<&'a Message>> {
        let mut groups: HashMap<String, Vec<&'a Message>> = HashMap::new();

        for msg in messages {
            let date = chrono::DateTime::from_timestamp_millis(msg.timestamp as i64)
                .map(|dt| dt.format("%Y-%m-%d").to_string())
                .unwrap_or_else(|| "unknown".to_string());

            groups.entry(date).or_default().push(*msg);
        }

        groups
    }

    /// Grouper les événements par module et période
    fn group_events_by_module<'a>(
        &self,
        events: &[&'a super::types::TitanEvent],
    ) -> HashMap<(String, String), Vec<&'a super::types::TitanEvent>> {
        let mut groups: HashMap<(String, String), Vec<&'a super::types::TitanEvent>> =
            HashMap::new();

        for event in events {
            let date = chrono::DateTime::from_timestamp_millis(event.timestamp as i64)
                .map(|dt| dt.format("%Y-%m-%d").to_string())
                .unwrap_or_else(|| "unknown".to_string());

            let key = (event.module.clone(), date);
            groups.entry(key).or_default().push(*event);
        }

        groups
    }

    /// Créer un résumé depuis un groupe de messages
    fn create_summary(
        &self,
        period: String,
        messages: &[&Message],
    ) -> Result<CognitiveSummary, CompressionError> {
        let now = chrono::Utc::now().timestamp_millis() as u64;

        // Extraire les thèmes (mots les plus fréquents)
        let mut word_counts: HashMap<String, u32> = HashMap::new();
        for msg in messages {
            for word in msg.content.split_whitespace() {
                if word.len() > 3 {
                    *word_counts.entry(word.to_lowercase()).or_insert(0) += 1;
                }
            }
        }

        let mut themes: Vec<Theme> = word_counts
            .into_iter()
            .map(|(name, count)| Theme {
                name,
                weight: count as f32 / messages.len() as f32,
                occurrences: count,
            })
            .collect();
        themes.sort_by(|a, b| b.occurrences.cmp(&a.occurrences));
        themes.truncate(5);

        // Extraire les points clés (premiers et derniers messages)
        let key_points: Vec<KeyPoint> = messages
            .iter()
            .take(3)
            .chain(messages.iter().rev().take(2))
            .map(|m| KeyPoint {
                content: if m.content.len() > 100 {
                    format!("{}...", &m.content[..100])
                } else {
                    m.content.clone()
                },
                importance: 0.7,
                timestamp: m.timestamp,
                source_type: m.role.clone(),
            })
            .collect();

        // Calculer le hash des données source
        let content_concat: String = messages.iter().map(|m| m.content.as_str()).collect();
        let source_hash = Self::compute_hash(&content_concat);

        Ok(CognitiveSummary {
            id: uuid::Uuid::new_v4().to_string(),
            period_start: messages.first().map(|m| m.timestamp).unwrap_or(0),
            period_end: messages.last().map(|m| m.timestamp).unwrap_or(0),
            original_count: messages.len() as u64,
            themes,
            key_points,
            context_markers: vec![ContextMarker {
                marker_type: "period".to_string(),
                value: period,
                timestamp: now,
            }],
            created_at: now,
            source_hash,
        })
    }

    /// Calculer un hash SHA256 (premiers 16 caractères hex)
    fn compute_hash(data: &str) -> String {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())[..16].to_string()
    }

    /// Obtenir tous les résumés
    pub fn get_summaries(&self) -> &[CognitiveSummary] {
        &self.summaries
    }

    /// Obtenir l'historique des compressions
    pub fn get_history(&self) -> &[CompressionReport] {
        &self.history
    }

    /// Nettoyer les anciens résumés (plus vieux que X jours)
    pub fn cleanup_old_summaries(&mut self, max_age_days: u64) {
        let threshold =
            chrono::Utc::now().timestamp_millis() as u64 - (max_age_days * 24 * 60 * 60 * 1000);

        let before = self.summaries.len();
        self.summaries.retain(|s| s.created_at > threshold);

        log::info!(
            "[CognitiveCompression] 🗑️ Nettoyage: {} → {} résumés",
            before,
            self.summaries.len()
        );
    }
}

impl Default for CognitiveCompressionEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPE (pour compression)
// ═══════════════════════════════════════════════════════════════════════════════

/// Message générique pour compression
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub content: String,
    pub role: String,
    pub timestamp: u64,
    pub metadata: Option<HashMap<String, String>>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════════════════════

/// Erreurs de compression
#[derive(Debug, Clone, Serialize, Deserialize, thiserror::Error)]
pub enum CompressionError {
    #[error("Données insuffisantes pour compression")]
    InsufficientData,

    #[error("Erreur de traitement: {0}")]
    ProcessingError(String),

    #[error("Erreur de sérialisation: {0}")]
    SerializationError(String),
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_messages(count: usize, age_days: u64) -> Vec<Message> {
        let base_timestamp =
            chrono::Utc::now().timestamp_millis() as u64 - (age_days * 24 * 60 * 60 * 1000);

        (0..count)
            .map(|i| Message {
                id: uuid::Uuid::new_v4().to_string(),
                content: format!("Test message {} about TITANE and AI systems", i),
                role: if i % 2 == 0 { "user" } else { "assistant" }.to_string(),
                timestamp: base_timestamp + (i as u64 * 1000),
                metadata: None,
            })
            .collect()
    }

    #[test]
    fn test_compression_not_needed() {
        let mut engine = CognitiveCompressionEngine::new();
        let messages = create_test_messages(10, 1); // Seulement 10 messages, 1 jour

        let report = engine
            .compress_messages(&messages)
            .expect("compression should succeed even if not needed");

        assert!(report.success);
        assert_eq!(report.summaries_created, 0); // Pas assez de messages
    }

    #[test]
    fn test_compression_needed() {
        let mut engine = CognitiveCompressionEngine::with_config(CompressionConfig {
            age_threshold_days: 1,
            min_items: 10,
            ..Default::default()
        });

        let messages = create_test_messages(100, 5); // 100 messages, 5 jours

        let report = engine
            .compress_messages(&messages)
            .expect("compression should succeed for large aged set");

        assert!(report.success);
        assert!(report.summaries_created > 0);
        assert!(report.compression_ratio > 0.0);
    }
}
