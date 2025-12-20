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
    pub value: f32, // -1.0 à 1.0 (bipolaire)
    pub polarity_negative: String,
    pub polarity_positive: String,
    pub volatility: f32, // Susceptibilité au changement
}

/// Matrice d'identité complète
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityMatrix {
    pub dimensions: Vec<IdentityDimension>,
    pub coherence_score: f32,
    pub stability_score: f32,
    pub evolution_vector: Vec<f32>,
    pub signature: String, // Hash unique de l'état
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
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

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

        let sum_sq: f32 = v1.iter().zip(v2.iter()).map(|(a, b)| (a - b).powi(2)).sum();

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

// ═══════════════════════════════════════════════════════════════
// LOADER ROBUSTE (Super Prompt #4 - Phase 3)
// ═══════════════════════════════════════════════════════════════

use std::fs;
use std::path::Path;

/// Charge IdentityMatrix depuis fichier avec fallback
///
/// Séquence:
/// 1. Tente chargement identity.json
/// 2. Valide structure
/// 3. Si échec → DEFAULT
pub fn load_identity_matrix_robust(app_data_dir: &Path) -> IdentityMatrix {
    let identity_path = app_data_dir.join("identity.json");

    match fs::read_to_string(&identity_path) {
        Ok(content) => match serde_json::from_str::<IdentityMatrix>(&content) {
            Ok(matrix) => {
                if validate_identity_matrix(&matrix) {
                    log::info!("✅ Identity matrix loaded from {}", identity_path.display());
                    matrix
                } else {
                    log::warn!("⚠️ Identity matrix invalid structure, using default");
                    IdentityMatrix::new()
                }
            }
            Err(e) => {
                log::error!("❌ Failed to parse identity.json: {}", e);
                log::info!("📝 Using default identity matrix");
                IdentityMatrix::new()
            }
        },
        Err(_) => {
            log::info!("📄 identity.json not found, creating default");
            let default_matrix = IdentityMatrix::new();

            // Tente de sauvegarder default
            if let Err(e) = save_identity_matrix_atomic(&default_matrix, app_data_dir) {
                log::warn!("⚠️ Failed to save default identity matrix: {}", e);
            }

            default_matrix
        }
    }
}

/// Valide structure IdentityMatrix
fn validate_identity_matrix(matrix: &IdentityMatrix) -> bool {
    if matrix.dimensions.is_empty() {
        return false;
    }

    for dim in &matrix.dimensions {
        if dim.name.is_empty() {
            return false;
        }
        if !(-1.0..=1.0).contains(&dim.value) {
            return false;
        }
        if !(0.0..=1.0).contains(&dim.volatility) {
            return false;
        }
    }

    true
}

/// Sauvegarde atomic IdentityMatrix
///
/// Pattern: backup → write temp → atomic rename
pub fn save_identity_matrix_atomic(
    matrix: &IdentityMatrix,
    app_data_dir: &Path,
) -> Result<(), String> {
    let identity_path = app_data_dir.join("identity.json");
    let temp_path = app_data_dir.join("identity.json.tmp");
    let backup_path = app_data_dir.join("identity.json.backup");

    // Serialize
    let content =
        serde_json::to_string_pretty(matrix).map_err(|e| format!("Serialization failed: {}", e))?;

    // Backup existant si présent
    if identity_path.exists() {
        fs::copy(&identity_path, &backup_path).map_err(|e| format!("Backup failed: {}", e))?;
    }

    // Write to temp
    fs::write(&temp_path, content).map_err(|e| format!("Write temp failed: {}", e))?;

    // Atomic rename
    fs::rename(&temp_path, &identity_path).map_err(|e| format!("Atomic rename failed: {}", e))?;

    log::info!("💾 Identity matrix saved to {}", identity_path.display());
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_load_identity_matrix_missing_file() {
        let temp_dir = TempDir::new().expect("TempDir should be creatable");
        let matrix = load_identity_matrix_robust(temp_dir.path());

        // Should return default
        assert_eq!(matrix.dimensions.len(), 8);
        assert!(!matrix.signature.is_empty());
    }

    #[test]
    fn test_save_and_load_identity_matrix() {
        let temp_dir = TempDir::new().expect("TempDir should be creatable");
        let mut matrix = IdentityMatrix::new();
        matrix.set_dimension("Rationalité-Émotivité", 0.5);

        // Save
        save_identity_matrix_atomic(&matrix, temp_dir.path())
            .expect("identity matrix should save atomically");

        // Load
        let loaded = load_identity_matrix_robust(temp_dir.path());
        assert_eq!(
            loaded
                .get_dimension("Rationalité-Émotivité")
                .expect("dimension should exist")
                .value,
            0.5
        );
    }

    #[test]
    fn test_validate_identity_matrix() {
        let mut matrix = IdentityMatrix::new();
        assert!(validate_identity_matrix(&matrix));

        // Invalid: empty dimensions
        matrix.dimensions.clear();
        assert!(!validate_identity_matrix(&matrix));
    }

    #[test]
    fn test_atomic_save_creates_backup() {
        let temp_dir = TempDir::new().expect("TempDir should be creatable");
        let matrix1 = IdentityMatrix::new();
        let mut matrix2 = IdentityMatrix::new();
        matrix2.set_dimension("Rationalité-Émotivité", 0.8);

        // First save
        save_identity_matrix_atomic(&matrix1, temp_dir.path())
            .expect("first atomic save should succeed");

        // Second save (should create backup)
        save_identity_matrix_atomic(&matrix2, temp_dir.path())
            .expect("second atomic save should succeed");

        // Check backup exists
        let backup_path = temp_dir.path().join("identity.json.backup");
        assert!(backup_path.exists());
    }

    #[test]
    fn test_identity_matrix_default() {
        let matrix = IdentityMatrix::default();
        assert_eq!(matrix.dimensions.len(), 8);
        assert_eq!(matrix.coherence_score, 1.0);
        assert_eq!(matrix.stability_score, 1.0);
    }

    #[test]
    fn test_to_vector() {
        let matrix = IdentityMatrix::new();
        let vector = matrix.to_vector();

        assert_eq!(vector.len(), 8);
        for val in &vector {
            assert!(*val >= -1.0 && *val <= 1.0);
        }
    }

    #[test]
    fn test_distance_to_same() {
        let matrix1 = IdentityMatrix::new();
        let matrix2 = IdentityMatrix::new();

        let distance = matrix1.distance_to(&matrix2);
        assert_eq!(distance, 0.0);
    }

    #[test]
    fn test_distance_to_different() {
        let matrix1 = IdentityProfiles::professional();
        let matrix2 = IdentityProfiles::creative();

        let distance = matrix1.distance_to(&matrix2);
        assert!(distance > 0.0);
    }

    #[test]
    fn test_interpolate() {
        let matrix1 = IdentityProfiles::professional();
        let matrix2 = IdentityProfiles::creative();

        // Midpoint interpolation
        let mid = matrix1.interpolate(&matrix2, 0.5);

        for (i, dim) in mid.dimensions.iter().enumerate() {
            let m1_val = matrix1.dimensions[i].value;
            let m2_val = matrix2.dimensions[i].value;
            let expected = (m1_val + m2_val) / 2.0;
            assert!((dim.value - expected).abs() < 0.01);
        }
    }

    #[test]
    fn test_interpolate_bounds() {
        let matrix1 = IdentityMatrix::new();
        let matrix2 = IdentityProfiles::technical();

        // t=0 should return original
        let at_zero = matrix1.interpolate(&matrix2, 0.0);
        assert_eq!(at_zero.to_vector(), matrix1.to_vector());

        // t=1 should return target
        let at_one = matrix1.interpolate(&matrix2, 1.0);
        for (i, dim) in at_one.dimensions.iter().enumerate() {
            assert!((dim.value - matrix2.dimensions[i].value).abs() < 0.01);
        }
    }

    #[test]
    fn test_set_dimension_invalid() {
        let mut matrix = IdentityMatrix::new();
        let result = matrix.set_dimension("NonexistentDimension", 0.5);
        assert!(!result);
    }

    #[test]
    fn test_set_dimension_clamping() {
        let mut matrix = IdentityMatrix::new();

        matrix.set_dimension("Rationalité-Émotivité", 5.0);
        assert_eq!(
            matrix
                .get_dimension("Rationalité-Émotivité")
                .expect("dimension Rationalité-Émotivité should exist")
                .value,
            1.0
        );

        matrix.set_dimension("Rationalité-Émotivité", -5.0);
        assert_eq!(
            matrix
                .get_dimension("Rationalité-Émotivité")
                .expect("dimension Rationalité-Émotivité should exist")
                .value,
            -1.0
        );
    }

    #[test]
    fn test_evolve() {
        let mut matrix = IdentityMatrix::new();
        let initial = matrix
            .get_dimension("Prudence-Audace")
            .expect("dimension Prudence-Audace should exist")
            .value;

        let mut deltas = HashMap::new();
        deltas.insert("Prudence-Audace".to_string(), 0.5);

        matrix.evolve(&deltas);

        let evolved = matrix
            .get_dimension("Prudence-Audace")
            .expect("dimension Prudence-Audace should exist")
            .value;
        assert!(evolved != initial);
    }

    #[test]
    fn test_profiles_professional() {
        let profile = IdentityProfiles::professional();
        // Professional should be formal and serious
        assert!(
            profile
                .get_dimension("Formalité-Familiarité")
                .expect("dimension Formalité-Familiarité should exist")
                .value
                < 0.0
        );
        assert!(
            profile
                .get_dimension("Sérieux-Ludique")
                .expect("dimension Sérieux-Ludique should exist")
                .value
                < 0.0
        );
    }

    #[test]
    fn test_profiles_mentor() {
        let profile = IdentityProfiles::mentor();
        // Mentor should be proactive
        assert!(
            profile
                .get_dimension("Réactif-Proactif")
                .expect("dimension Réactif-Proactif should exist")
                .value
                > 0.0
        );
    }

    #[test]
    fn test_profiles_creative() {
        let profile = IdentityProfiles::creative();
        // Creative should be audacious
        assert!(
            profile
                .get_dimension("Prudence-Audace")
                .expect("dimension Prudence-Audace should exist")
                .value
                > 0.5
        );
    }

    #[test]
    fn test_profiles_technical() {
        let profile = IdentityProfiles::technical();
        // Technical should be specialist and rational
        assert!(
            profile
                .get_dimension("Généraliste-Spécialiste")
                .expect("dimension Généraliste-Spécialiste should exist")
                .value
                > 0.5
        );
        assert!(
            profile
                .get_dimension("Rationalité-Émotivité")
                .expect("dimension Rationalité-Émotivité should exist")
                .value
                < 0.0
        );
    }

    #[test]
    fn test_signature_uniqueness() {
        let matrix1 = IdentityProfiles::professional();
        let matrix2 = IdentityProfiles::creative();

        assert_ne!(matrix1.signature, matrix2.signature);
    }

    #[test]
    fn test_validate_out_of_range_value() {
        let mut matrix = IdentityMatrix::new();
        // Force an invalid value
        matrix.dimensions[0].value = 2.0; // Out of range

        assert!(!validate_identity_matrix(&matrix));
    }

    #[test]
    fn test_validate_empty_name() {
        let mut matrix = IdentityMatrix::new();
        matrix.dimensions[0].name = String::new();

        assert!(!validate_identity_matrix(&matrix));
    }

    #[test]
    fn test_identity_matrix_new() {
        let matrix = IdentityMatrix::new();
        assert!(!matrix.signature.is_empty());
        assert_eq!(matrix.dimensions.len(), 8);
    }

    #[test]
    fn test_identity_matrix_clone() {
        let matrix = IdentityMatrix::new();
        let cloned = matrix.clone();
        assert_eq!(cloned.dimensions.len(), matrix.dimensions.len());
        assert_eq!(cloned.signature, matrix.signature);
    }

    #[test]
    fn test_identity_matrix_debug() {
        let matrix = IdentityMatrix::new();
        let debug_str = format!("{:?}", matrix);
        assert!(debug_str.contains("IdentityMatrix"));
    }

    #[test]
    fn test_identity_dimension_clone() {
        let dim = IdentityDimension {
            name: "Test".to_string(),
            description: "Test desc".to_string(),
            value: 0.5,
            polarity_negative: "Neg".to_string(),
            polarity_positive: "Pos".to_string(),
            volatility: 0.3,
        };
        let cloned = dim.clone();
        assert_eq!(cloned.name, "Test");
        assert_eq!(cloned.value, 0.5);
    }

    #[test]
    fn test_identity_dimension_debug() {
        let dim = IdentityDimension {
            name: "Debug Test".to_string(),
            description: "Testing debug".to_string(),
            value: 0.0,
            polarity_negative: "A".to_string(),
            polarity_positive: "B".to_string(),
            volatility: 0.5,
        };
        let debug_str = format!("{:?}", dim);
        assert!(debug_str.contains("IdentityDimension"));
    }

    #[test]
    fn test_get_dimension_exists() {
        let matrix = IdentityMatrix::new();
        let dim = matrix.get_dimension("Rationalité-Émotivité");
        assert!(dim.is_some());
        assert_eq!(
            dim.expect("dimension Rationalité-Émotivité should exist").name,
            "Rationalité-Émotivité"
        );
    }

    #[test]
    fn test_get_dimension_not_exists() {
        let matrix = IdentityMatrix::new();
        let dim = matrix.get_dimension("NonexistentDimension");
        assert!(dim.is_none());
    }

    #[test]
    fn test_set_dimension_valid() {
        let mut matrix = IdentityMatrix::new();
        let result = matrix.set_dimension("Prudence-Audace", 0.8);
        assert!(result);
        assert_eq!(
            matrix
                .get_dimension("Prudence-Audace")
                .expect("dimension Prudence-Audace should exist")
                .value,
            0.8
        );
    }

    #[test]
    fn test_evolve_multiple_dimensions() {
        let mut matrix = IdentityMatrix::new();
        let mut deltas = HashMap::new();
        deltas.insert("Rationalité-Émotivité".to_string(), 0.3);
        deltas.insert("Prudence-Audace".to_string(), -0.2);

        let initial_rat = matrix
            .get_dimension("Rationalité-Émotivité")
            .expect("dimension Rationalité-Émotivité should exist")
            .value;
        let initial_pru = matrix
            .get_dimension("Prudence-Audace")
            .expect("dimension Prudence-Audace should exist")
            .value;

        matrix.evolve(&deltas);

        // Values should have changed (modulated by volatility)
        let new_rat = matrix
            .get_dimension("Rationalité-Émotivité")
            .expect("dimension Rationalité-Émotivité should exist")
            .value;
        let new_pru = matrix
            .get_dimension("Prudence-Audace")
            .expect("dimension Prudence-Audace should exist")
            .value;

        assert!(new_rat != initial_rat || new_pru != initial_pru);
    }

    #[test]
    fn test_evolve_nonexistent_dimension() {
        let mut matrix = IdentityMatrix::new();
        let initial_vector = matrix.to_vector();

        let mut deltas = HashMap::new();
        deltas.insert("FakeDimension".to_string(), 0.5);

        matrix.evolve(&deltas);

        // Vector should be unchanged for existing dimensions
        // (only signature might update)
    }

    #[test]
    fn test_recalculate_scores_consistency() {
        let mut matrix = IdentityMatrix::new();

        // Set all dimensions to same value for high coherence
        for dim in &mut matrix.dimensions {
            dim.value = 0.5;
        }
        matrix.recalculate_scores();

        assert!(matrix.coherence_score > 0.9); // High coherence when uniform
    }

    #[test]
    fn test_signature_changes_on_modification() {
        let mut matrix = IdentityMatrix::new();
        let initial_sig = matrix.signature.clone();

        matrix.set_dimension("Sérieux-Ludique", 0.9);

        assert_ne!(matrix.signature, initial_sig);
    }

    #[test]
    fn test_interpolate_t_clamping() {
        let matrix1 = IdentityMatrix::new();
        let matrix2 = IdentityProfiles::creative();

        // t > 1 should be clamped to 1
        let result = matrix1.interpolate(&matrix2, 2.0);
        for (i, dim) in result.dimensions.iter().enumerate() {
            assert!((dim.value - matrix2.dimensions[i].value).abs() < 0.01);
        }

        // t < 0 should be clamped to 0
        let result2 = matrix1.interpolate(&matrix2, -1.0);
        for (i, dim) in result2.dimensions.iter().enumerate() {
            assert!((dim.value - matrix1.dimensions[i].value).abs() < 0.01);
        }
    }

    #[test]
    fn test_distance_symmetry() {
        let matrix1 = IdentityProfiles::professional();
        let matrix2 = IdentityProfiles::mentor();

        let dist1 = matrix1.distance_to(&matrix2);
        let dist2 = matrix2.distance_to(&matrix1);

        assert!((dist1 - dist2).abs() < 0.0001);
    }

    #[test]
    fn test_all_profiles_valid() {
        let profiles = vec![
            IdentityProfiles::professional(),
            IdentityProfiles::mentor(),
            IdentityProfiles::creative(),
            IdentityProfiles::technical(),
        ];

        for profile in profiles {
            assert!(validate_identity_matrix(&profile));
            assert_eq!(profile.dimensions.len(), 8);
        }
    }

    #[test]
    fn test_validate_volatility_out_of_range() {
        let mut matrix = IdentityMatrix::new();
        matrix.dimensions[0].volatility = 1.5; // Out of 0.0-1.0 range

        assert!(!validate_identity_matrix(&matrix));
    }

    #[test]
    fn test_validate_negative_volatility() {
        let mut matrix = IdentityMatrix::new();
        matrix.dimensions[0].volatility = -0.1;

        assert!(!validate_identity_matrix(&matrix));
    }

    #[test]
    fn test_load_corrupted_file() {
        let temp_dir = TempDir::new().expect("TempDir should be creatable");
        let identity_path = temp_dir.path().join("identity.json");

        // Write invalid JSON
        fs::write(&identity_path, "not valid json")
            .expect("writing corrupted identity.json fixture should succeed");

        let matrix = load_identity_matrix_robust(temp_dir.path());
        // Should return default on parse error
        assert_eq!(matrix.dimensions.len(), 8);
    }

    #[test]
    fn test_dimension_value_serialization() {
        let dim = IdentityDimension {
            name: "Test".to_string(),
            description: "Desc".to_string(),
            value: 0.123456,
            polarity_negative: "Neg".to_string(),
            polarity_positive: "Pos".to_string(),
            volatility: 0.5,
        };

        let json = serde_json::to_string(&dim)
            .expect("IdentityDimension should serialize to JSON");
        let restored: IdentityDimension = serde_json::from_str(&json)
            .expect("IdentityDimension should deserialize from JSON");

        assert_eq!(restored.name, dim.name);
        assert!((restored.value - dim.value).abs() < 0.0001);
    }

    #[test]
    fn test_matrix_serialization_roundtrip() {
        let matrix = IdentityProfiles::creative();
        let json = serde_json::to_string(&matrix).expect("IdentityMatrix should serialize to JSON");
        let restored: IdentityMatrix =
            serde_json::from_str(&json).expect("IdentityMatrix should deserialize from JSON");

        assert_eq!(restored.dimensions.len(), matrix.dimensions.len());
        assert_eq!(restored.signature, matrix.signature);
    }

    #[test]
    fn test_evolution_vector_default() {
        let matrix = IdentityMatrix::default();
        assert_eq!(matrix.evolution_vector.len(), 8);
        for val in &matrix.evolution_vector {
            assert_eq!(*val, 0.0);
        }
    }

    #[test]
    fn test_stability_score_calculation() {
        let mut matrix = IdentityMatrix::new();

        // Low volatility = high stability
        for dim in &mut matrix.dimensions {
            dim.volatility = 0.1;
        }
        matrix.recalculate_scores();
        let high_stability = matrix.stability_score;

        // High volatility = low stability
        for dim in &mut matrix.dimensions {
            dim.volatility = 0.9;
        }
        matrix.recalculate_scores();
        let low_stability = matrix.stability_score;

        assert!(high_stability > low_stability);
    }

    #[test]
    fn test_coherence_with_variance() {
        let mut matrix = IdentityMatrix::new();

        // High variance = low coherence
        matrix.dimensions[0].value = -1.0;
        matrix.dimensions[1].value = 1.0;
        matrix.dimensions[2].value = -0.8;
        matrix.dimensions[3].value = 0.8;
        matrix.recalculate_scores();

        assert!(matrix.coherence_score < 0.9);
    }

    #[test]
    fn test_all_default_dimensions_have_valid_values() {
        let matrix = IdentityMatrix::default();
        for dim in &matrix.dimensions {
            assert!(!dim.name.is_empty());
            assert!(!dim.description.is_empty());
            assert!(!dim.polarity_negative.is_empty());
            assert!(!dim.polarity_positive.is_empty());
            assert!((-1.0..=1.0).contains(&dim.value));
            assert!((0.0..=1.0).contains(&dim.volatility));
        }
    }

    #[test]
    fn test_to_vector_length() {
        let matrix = IdentityMatrix::new();
        let vector = matrix.to_vector();
        assert_eq!(vector.len(), matrix.dimensions.len());
    }

    #[test]
    fn test_interpolate_midpoint_accuracy() {
        let mut matrix1 = IdentityMatrix::new();
        let mut matrix2 = IdentityMatrix::new();

        // Set specific values for testing
        matrix1.set_dimension("Rationalité-Émotivité", 0.0);
        matrix2.set_dimension("Rationalité-Émotivité", 1.0);

        let mid = matrix1.interpolate(&matrix2, 0.5);
        let mid_val = mid
            .get_dimension("Rationalité-Émotivité")
            .expect("dimension Rationalité-Émotivité should exist")
            .value;

        assert!((mid_val - 0.5).abs() < 0.01);
    }
}
