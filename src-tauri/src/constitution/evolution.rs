//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — CONSTITUTIONAL EVOLUTION ENGINE
//! Super Prompt #13 — Système d'amendements et évolution constitutionnelle
//! ═══════════════════════════════════════════════════════════════════════════════

use super::governance::AuthorityLevel;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;

/// Type d'amendement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AmendmentType {
    /// Ajout d'un nouveau principe/valeur/limite
    Addition,
    /// Modification d'un élément existant
    Modification,
    /// Suppression d'un élément
    Removal,
    /// Clarification (sans changement de fond)
    Clarification,
    /// Mise à jour technique
    Technical,
}

/// Statut d'un amendement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AmendmentStatus {
    /// En cours de rédaction
    Draft,
    /// Soumis pour révision
    Submitted,
    /// En cours de révision
    UnderReview,
    /// Approuvé
    Approved,
    /// Rejeté
    Rejected,
    /// En vigueur
    Active,
    /// Révoqué
    Revoked,
}

/// Proposition d'amendement
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Amendment {
    pub id: String,
    pub title: String,
    pub description: String,
    pub amendment_type: AmendmentType,
    pub target_section: String,
    pub current_text: Option<String>,
    pub proposed_text: String,
    pub rationale: String,
    pub proposer: String,
    pub proposer_authority: AuthorityLevel,
    pub status: AmendmentStatus,
    pub created_at: u64,
    pub reviewed_at: Option<u64>,
    pub activated_at: Option<u64>,
    pub votes_for: u32,
    pub votes_against: u32,
    pub reviewer_notes: Vec<String>,
}

/// Règle de révision
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ReviewRule {
    pub amendment_type: AmendmentType,
    pub required_authority: AuthorityLevel,
    pub required_votes: u32,
    pub review_period_ms: u64,
    pub requires_supermajority: bool,
}

/// État de l'évolution constitutionnelle
struct EvolutionState {
    amendments: Vec<Amendment>,
    review_rules: Vec<ReviewRule>,
    version_history: Vec<ConstitutionVersion>,
    current_version: String,
}

impl Default for EvolutionState {
    fn default() -> Self {
        Self {
            amendments: Vec::new(),
            review_rules: Self::default_review_rules(),
            version_history: vec![ConstitutionVersion {
                version: "1.0.0".to_string(),
                timestamp: 0,
                amendments: vec![],
                description: "Initial constitution".to_string(),
            }],
            current_version: "1.0.0".to_string(),
        }
    }
}

impl EvolutionState {
    fn default_review_rules() -> Vec<ReviewRule> {
        vec![
            // Clarifications: processus léger
            ReviewRule {
                amendment_type: AmendmentType::Clarification,
                required_authority: AuthorityLevel::System,
                required_votes: 1,
                review_period_ms: 86400000, // 1 jour
                requires_supermajority: false,
            },
            // Mises à jour techniques
            ReviewRule {
                amendment_type: AmendmentType::Technical,
                required_authority: AuthorityLevel::System,
                required_votes: 2,
                review_period_ms: 259200000, // 3 jours
                requires_supermajority: false,
            },
            // Ajouts: processus standard
            ReviewRule {
                amendment_type: AmendmentType::Addition,
                required_authority: AuthorityLevel::System,
                required_votes: 3,
                review_period_ms: 604800000, // 7 jours
                requires_supermajority: false,
            },
            // Modifications: processus renforcé
            ReviewRule {
                amendment_type: AmendmentType::Modification,
                required_authority: AuthorityLevel::Constitution,
                required_votes: 5,
                review_period_ms: 1209600000, // 14 jours
                requires_supermajority: true,
            },
            // Suppressions: processus le plus strict
            ReviewRule {
                amendment_type: AmendmentType::Removal,
                required_authority: AuthorityLevel::Constitution,
                required_votes: 7,
                review_period_ms: 2592000000, // 30 jours
                requires_supermajority: true,
            },
        ]
    }
}

/// Version de la constitution
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConstitutionVersion {
    pub version: String,
    pub timestamp: u64,
    pub amendments: Vec<String>,
    pub description: String,
}

/// Moteur d'évolution constitutionnelle
pub struct EvolutionEngine {
    state: RwLock<EvolutionState>,
}

impl EvolutionEngine {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(EvolutionState::default()),
        }
    }

    /// Propose un nouvel amendement
    pub async fn propose_amendment(&self, amendment: Amendment) -> Result<String, String> {
        let mut state = self.state.write().await;

        // Vérifier l'autorité
        let rule = state
            .review_rules
            .iter()
            .find(|r| r.amendment_type == amendment.amendment_type)
            .ok_or("No review rule found for this amendment type")?;

        if amendment.proposer_authority < rule.required_authority {
            return Err(format!(
                "Insufficient authority. Required: {:?}, Got: {:?}",
                rule.required_authority, amendment.proposer_authority
            ));
        }

        let id = amendment.id.clone();
        state.amendments.push(amendment);
        Ok(id)
    }

    /// Soumet un amendement pour révision
    pub async fn submit_for_review(&self, amendment_id: &str) -> Result<(), String> {
        let mut state = self.state.write().await;

        let amendment = state
            .amendments
            .iter_mut()
            .find(|a| a.id == amendment_id)
            .ok_or("Amendment not found")?;

        if amendment.status != AmendmentStatus::Draft {
            return Err("Only draft amendments can be submitted".to_string());
        }

        amendment.status = AmendmentStatus::Submitted;
        Ok(())
    }

    /// Vote pour un amendement
    pub async fn vote(
        &self,
        amendment_id: &str,
        in_favor: bool,
        voter_authority: AuthorityLevel,
    ) -> Result<(), String> {
        let mut state = self.state.write().await;

        if voter_authority < AuthorityLevel::System {
            return Err("Insufficient authority to vote".to_string());
        }

        // Find amendment index first
        let amendment_idx = state
            .amendments
            .iter()
            .position(|a| a.id == amendment_id)
            .ok_or("Amendment not found")?;

        let amendment_type = state.amendments[amendment_idx].amendment_type;

        if state.amendments[amendment_idx].status != AmendmentStatus::Submitted
            && state.amendments[amendment_idx].status != AmendmentStatus::UnderReview
        {
            return Err("Amendment is not open for voting".to_string());
        }

        // Find the rule
        let rule = state
            .review_rules
            .iter()
            .find(|r| r.amendment_type == amendment_type)
            .ok_or("No review rule found")?;

        let required_votes = rule.required_votes;
        let requires_supermajority = rule.requires_supermajority;

        // Now mutate the amendment
        let amendment = &mut state.amendments[amendment_idx];

        if in_favor {
            amendment.votes_for += 1;
        } else {
            amendment.votes_against += 1;
        }

        amendment.status = AmendmentStatus::UnderReview;

        // Vérifier si le seuil est atteint
        let total_votes = amendment.votes_for + amendment.votes_against;
        if total_votes >= required_votes {
            let approved = if requires_supermajority {
                amendment.votes_for as f32 / total_votes as f32 > 0.66
            } else {
                amendment.votes_for > amendment.votes_against
            };

            amendment.status = if approved {
                AmendmentStatus::Approved
            } else {
                AmendmentStatus::Rejected
            };
            amendment.reviewed_at = Some(Self::now());
        }

        Ok(())
    }

    /// Active un amendement approuvé
    pub async fn activate_amendment(&self, amendment_id: &str) -> Result<(), String> {
        let mut state = self.state.write().await;

        // Find amendment index first
        let amendment_idx = state
            .amendments
            .iter()
            .position(|a| a.id == amendment_id)
            .ok_or("Amendment not found")?;

        if state.amendments[amendment_idx].status != AmendmentStatus::Approved {
            return Err("Only approved amendments can be activated".to_string());
        }

        // Extract needed data before mutation
        let amendment_type = state.amendments[amendment_idx].amendment_type;
        let amendment_title = state.amendments[amendment_idx].title.clone();
        let current_version = state.current_version.clone();

        // Mutate the amendment
        state.amendments[amendment_idx].status = AmendmentStatus::Active;
        state.amendments[amendment_idx].activated_at = Some(Self::now());

        // Mettre à jour la version
        let new_version = self.increment_version(&current_version, &amendment_type);
        state.version_history.push(ConstitutionVersion {
            version: new_version.clone(),
            timestamp: Self::now(),
            amendments: vec![amendment_id.to_string()],
            description: amendment_title,
        });
        state.current_version = new_version;

        Ok(())
    }

    /// Révoque un amendement actif
    pub async fn revoke_amendment(&self, amendment_id: &str, reason: &str) -> Result<(), String> {
        let mut state = self.state.write().await;

        let amendment = state
            .amendments
            .iter_mut()
            .find(|a| a.id == amendment_id)
            .ok_or("Amendment not found")?;

        if amendment.status != AmendmentStatus::Active {
            return Err("Only active amendments can be revoked".to_string());
        }

        amendment.status = AmendmentStatus::Revoked;
        amendment
            .reviewer_notes
            .push(format!("Revoked: {}", reason));

        Ok(())
    }

    /// Incrémente la version selon le type d'amendement
    fn increment_version(&self, current: &str, amendment_type: &AmendmentType) -> String {
        let parts: Vec<u32> = current.split('.').filter_map(|p| p.parse().ok()).collect();

        let (major, minor, patch) = (
            parts.first().copied().unwrap_or(1),
            parts.get(1).copied().unwrap_or(0),
            parts.get(2).copied().unwrap_or(0),
        );

        match amendment_type {
            AmendmentType::Removal | AmendmentType::Modification => {
                format!("{}.0.0", major + 1)
            }
            AmendmentType::Addition => {
                format!("{}.{}.0", major, minor + 1)
            }
            AmendmentType::Clarification | AmendmentType::Technical => {
                format!("{}.{}.{}", major, minor, patch + 1)
            }
        }
    }

    /// Récupère les amendements par statut
    pub async fn amendments_by_status(&self, status: AmendmentStatus) -> Vec<Amendment> {
        let state = self.state.read().await;
        state
            .amendments
            .iter()
            .filter(|a| a.status == status)
            .cloned()
            .collect()
    }

    /// Récupère tous les amendements actifs
    pub async fn active_amendments(&self) -> Vec<Amendment> {
        self.amendments_by_status(AmendmentStatus::Active).await
    }

    /// Récupère les amendements en attente de vote
    pub async fn pending_amendments(&self) -> Vec<Amendment> {
        let state = self.state.read().await;
        state
            .amendments
            .iter()
            .filter(|a| {
                a.status == AmendmentStatus::Submitted || a.status == AmendmentStatus::UnderReview
            })
            .cloned()
            .collect()
    }

    /// Récupère la version courante
    pub async fn current_version(&self) -> String {
        let state = self.state.read().await;
        state.current_version.clone()
    }

    /// Récupère l'historique des versions
    pub async fn version_history(&self) -> Vec<ConstitutionVersion> {
        let state = self.state.read().await;
        state.version_history.clone()
    }

    /// Statistiques d'évolution
    pub async fn statistics(&self) -> EvolutionStats {
        let state = self.state.read().await;

        let by_status: HashMap<String, usize> =
            state.amendments.iter().fold(HashMap::new(), |mut acc, a| {
                *acc.entry(format!("{:?}", a.status)).or_insert(0) += 1;
                acc
            });

        let by_type: HashMap<String, usize> =
            state.amendments.iter().fold(HashMap::new(), |mut acc, a| {
                *acc.entry(format!("{:?}", a.amendment_type)).or_insert(0) += 1;
                acc
            });

        EvolutionStats {
            total_amendments: state.amendments.len(),
            active_amendments: state
                .amendments
                .iter()
                .filter(|a| a.status == AmendmentStatus::Active)
                .count(),
            pending_amendments: state
                .amendments
                .iter()
                .filter(|a| {
                    a.status == AmendmentStatus::Submitted
                        || a.status == AmendmentStatus::UnderReview
                })
                .count(),
            current_version: state.current_version.clone(),
            amendments_by_status: by_status,
            amendments_by_type: by_type,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for EvolutionEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques d'évolution
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EvolutionStats {
    pub total_amendments: usize,
    pub active_amendments: usize,
    pub pending_amendments: usize,
    pub current_version: String,
    pub amendments_by_status: HashMap<String, usize>,
    pub amendments_by_type: HashMap<String, usize>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_evolution_creation() {
        let engine = EvolutionEngine::new();
        let version = engine.current_version().await;
        assert_eq!(version, "1.0.0");
    }

    #[tokio::test]
    async fn test_propose_amendment() {
        let engine = EvolutionEngine::new();

        let amendment = Amendment {
            id: "test_amendment".to_string(),
            title: "Test Amendment".to_string(),
            description: "A test amendment".to_string(),
            amendment_type: AmendmentType::Clarification,
            target_section: "principles".to_string(),
            current_text: Some("Old text".to_string()),
            proposed_text: "New text".to_string(),
            rationale: "Testing".to_string(),
            proposer: "test_proposer".to_string(),
            proposer_authority: AuthorityLevel::System,
            status: AmendmentStatus::Draft,
            created_at: 0,
            reviewed_at: None,
            activated_at: None,
            votes_for: 0,
            votes_against: 0,
            reviewer_notes: vec![],
        };

        let result = engine.propose_amendment(amendment).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_amendment_workflow() {
        let engine = EvolutionEngine::new();

        // Proposer
        let amendment = Amendment {
            id: "workflow_test".to_string(),
            title: "Workflow Test".to_string(),
            description: "Testing the workflow".to_string(),
            amendment_type: AmendmentType::Clarification,
            target_section: "values".to_string(),
            current_text: None,
            proposed_text: "New clarification".to_string(),
            rationale: "For clarity".to_string(),
            proposer: "system".to_string(),
            proposer_authority: AuthorityLevel::System,
            status: AmendmentStatus::Draft,
            created_at: 0,
            reviewed_at: None,
            activated_at: None,
            votes_for: 0,
            votes_against: 0,
            reviewer_notes: vec![],
        };

        engine.propose_amendment(amendment).await.unwrap();

        // Soumettre
        engine.submit_for_review("workflow_test").await.unwrap();

        // Voter
        engine
            .vote("workflow_test", true, AuthorityLevel::System)
            .await
            .unwrap();

        // Vérifier approbation
        let pending = engine.pending_amendments().await;
        assert!(pending.is_empty()); // Should be approved now
    }

    #[tokio::test]
    async fn test_version_increment() {
        let engine = EvolutionEngine::new();

        // Test clarification increment (patch)
        let new_version = engine.increment_version("1.0.0", &AmendmentType::Clarification);
        assert_eq!(new_version, "1.0.1");

        // Test addition increment (minor)
        let new_version = engine.increment_version("1.0.1", &AmendmentType::Addition);
        assert_eq!(new_version, "1.1.0");

        // Test modification increment (major)
        let new_version = engine.increment_version("1.1.0", &AmendmentType::Modification);
        assert_eq!(new_version, "2.0.0");
    }
}
