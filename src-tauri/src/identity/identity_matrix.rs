// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — IDENTITY MATRIX ENGINE
//   Matrice d'identité multidimensionnelle
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Dimension de la matrice identitaire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityDimension {
    pub name: String,
    pub description: String,
    pub value: f32,           // -1.0 à 1.0 (bipolaire)
    pub polarity_negative: String,
    pub polarity_positive: String,
    pub volatility: f32,      // Susceptibilité au changement
}

/// Matrice d'identité complète
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityMatrix {
    pub dimensions: Vec<IdentityDimension>,
    pub coherence_score: f32,
    pub stability_score: f32,
    pub evolution_vector: Vec<f32>,
    pub signature: String,    // Hash unique de l'état
}

impl Default for IdentityMatrix {
    fn default() -> Self {
        Self {
            dimensions: vec![
                IdentityDimension {
                    name: "Rationalité-Émotivité".to_string(),
                    description: "Balance entre logique et ressenti".to_string(),
                    value: 0.3,
                    polarity_negative: "Purement logique".to_string(),
                    polarity_positive: "Empathique".to_string(),
                    volatility: 0.2,
                },
                IdentityDimension {
                    name: "Concision-Élaboration".to_string(),
                    description: "Tendance à la brièveté vs détail".to_string(),
                    value: 0.0,
                    polarity_negative: "Minimaliste".to_string(),
                    polarity_positive: "Exhaustif".to_string(),
                    volatility: 0.5,
                },
                IdentityDimension {
                    name: "Formalité-Familiarité".to_string(),
                    description: "Registre de langage".to_string(),
                    value: -0.2,
                    polarity_negative: "Formel".to_string(),
                    polarity_positive: "Décontracté".to_string(),
                    volatility: 0.4,
                },
                IdentityDimension {
                    name: "Prudence-Audace".to_string(),
                    description: "Attitude face au risque".to_string(),
                    value: 0.1,
                    polarity_negative: "Conservateur".to_string(),
                    polarity_positive: "Innovateur".to_string(),
                    volatility: 0.3,
                },
                IdentityDimension {
                    name: "Directive-Collaborative".to_string(),
                    description: "Style d'interaction".to_string(),
                    value: 0.4,
                    polarity_negative: "Directif".to_string(),
                    polarity_positive: "Participatif".to_string(),
                    volatility: 0.25,
                },
                IdentityDimension {
                    name: "Généraliste-Spécialiste".to_string(),
                    description: "Approche de la connaissance".to_string(),
                    value: 0.2,
                    polarity_negative: "Vision large".to_string(),
                    polarity_positive: "Expertise ciblée".to_string(),
                    volatility: 0.15,
                },
                IdentityDimension {
                    name: "Réactif-Proactif".to_string(),
                    description: "Initiative dans l'interaction".to_string(),
                    value: 0.5,
                    polarity_negative: "Attentiste".to_string(),
                    polarity_positive: "Anticipatif".to_string(),
                    volatility: 0.35,
                },
                IdentityDimension {
                    name: "Sérieux-Ludique".to_string(),
                    description: "Tonalité de l'échange".to_string(),
                    value: -0.1,
                    polarity_negative: "Professionnel".to_string(),
                    polarity_positive: "Enjoué".to_string(),
                    volatility: 0.45,
                },
            ],
            coherence_score: 1.0,
            stability_score: 1.0,
            evolution_vector: vec![0.0; 8],
            signature: String::new(),
        }
    }
}

impl IdentityMatrix {
    /// Crée une nouvelle matrice
    pub fn new() -> Self {
        let mut matrix = Self::default();
        matrix.update_signature();
        matrix
    }

    /// Obtient une dimension par nom
    pub fn get_dimension(&self, name: &str) -> Option<&IdentityDimension> {
        self.dimensions.iter().find(|d| d.name == name)
    }

    /// Modifie une dimension
    pub fn set_dimension(&mut self, name: &str, value: f32) -> bool {
        if let Some(dim) = self.dimensions.iter_mut().find(|d| d.name == name) {
            dim.value = value.clamp(-1.0, 1.0);
            self.recalculate_scores();
            self.update_signature();
            true
        } else {
            false
        }
    }

    /// Applique une évolution graduelle
    pub fn evolve(&mut self, deltas: &HashMap<String, f32>) {
        for (name, delta) in deltas {
            if let Some(dim) = self.dimensions.iter_mut().find(|d| &d.name == name) {
                let adjusted_delta = delta * dim.volatility;
                dim.value = (dim.value + adjusted_delta).clamp(-1.0, 1.0);
            }
        }

        self.recalculate_scores();
        self.update_signature();
    }

    /// Recalcule les scores de cohérence et stabilité
    fn recalculate_scores(&mut self) {
        // Cohérence: mesure de l'harmonie entre dimensions
        let values: Vec<f32> = self.dimensions.iter().map(|d| d.value).collect();
        let mean = values.iter().sum::<f32>() / values.len() as f32;
        let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f32>() / values.len() as f32;
        self.coherence_score = 1.0 - variance.sqrt();

        // Stabilité: inverse de la volatilité moyenne
        let avg_volatility = self.dimensions.iter().map(|d| d.volatility).sum::<f32>()
            / self.dimensions.len() as f32;
        self.stability_score = 1.0 - avg_volatility;
    }

    /// Met à jour la signature unique
    fn update_signature(&mut self) {
        use std::hash::{Hash, Hasher};
        use std::collections::hash_map::DefaultHasher;

        let mut hasher = DefaultHasher::new();
        for dim in &self.dimensions {
            dim.name.hash(&mut hasher);
            ((dim.value * 1000.0) as i32).hash(&mut hasher);
        }
        self.signature = format!("{:016x}", hasher.finish());
    }

    /// Génère un vecteur de positionnement
    pub fn to_vector(&self) -> Vec<f32> {
        self.dimensions.iter().map(|d| d.value).collect()
    }

    /// Distance à une autre matrice
    pub fn distance_to(&self, other: &IdentityMatrix) -> f32 {
        let v1 = self.to_vector();
        let v2 = other.to_vector();

        let sum_sq: f32 = v1.iter().zip(v2.iter())
            .map(|(a, b)| (a - b).powi(2))
            .sum();

        sum_sq.sqrt()
    }

    /// Interpolation vers une autre matrice
    pub fn interpolate(&self, other: &IdentityMatrix, t: f32) -> IdentityMatrix {
        let mut result = self.clone();
        let t = t.clamp(0.0, 1.0);

        for (i, dim) in result.dimensions.iter_mut().enumerate() {
            if let Some(other_dim) = other.dimensions.get(i) {
                dim.value = dim.value * (1.0 - t) + other_dim.value * t;
            }
        }

        result.recalculate_scores();
        result.update_signature();
        result
    }
}

/// Profils prédéfinis
pub struct IdentityProfiles;

impl IdentityProfiles {
    /// Profil professionnel
    pub fn professional() -> IdentityMatrix {
        let mut matrix = IdentityMatrix::new();
        matrix.set_dimension("Rationalité-Émotivité", -0.3);
        matrix.set_dimension("Formalité-Familiarité", -0.6);
        matrix.set_dimension("Sérieux-Ludique", -0.5);
        matrix.set_dimension("Concision-Élaboration", -0.2);
        matrix
    }

    /// Profil mentor
    pub fn mentor() -> IdentityMatrix {
        let mut matrix = IdentityMatrix::new();
        matrix.set_dimension("Rationalité-Émotivité", 0.4);
        matrix.set_dimension("Directive-Collaborative", 0.3);
        matrix.set_dimension("Réactif-Proactif", 0.6);
        matrix.set_dimension("Généraliste-Spécialiste", 0.3);
        matrix
    }

    /// Profil créatif
    pub fn creative() -> IdentityMatrix {
        let mut matrix = IdentityMatrix::new();
        matrix.set_dimension("Prudence-Audace", 0.7);
        matrix.set_dimension("Sérieux-Ludique", 0.5);
        matrix.set_dimension("Concision-Élaboration", 0.4);
        matrix.set_dimension("Formalité-Familiarité", 0.3);
        matrix
    }

    /// Profil technique
    pub fn technical() -> IdentityMatrix {
        let mut matrix = IdentityMatrix::new();
        matrix.set_dimension("Rationalité-Émotivité", -0.6);
        matrix.set_dimension("Généraliste-Spécialiste", 0.7);
        matrix.set_dimension("Concision-Élaboration", 0.3);
        matrix.set_dimension("Prudence-Audace", -0.2);
        matrix
    }
}
