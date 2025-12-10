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
        let temp_dir = TempDir::new().unwrap();
        let matrix = load_identity_matrix_robust(temp_dir.path());

        // Should return default
        assert_eq!(matrix.dimensions.len(), 8);
        assert!(!matrix.signature.is_empty());
    }

    #[test]
    fn test_save_and_load_identity_matrix() {
        let temp_dir = TempDir::new().unwrap();
        let mut matrix = IdentityMatrix::new();
        matrix.set_dimension("Rationalité-Émotivité", 0.5);

        // Save
        save_identity_matrix_atomic(&matrix, temp_dir.path()).unwrap();

        // Load
        let loaded = load_identity_matrix_robust(temp_dir.path());
        assert_eq!(
            loaded.get_dimension("Rationalité-Émotivité").unwrap().value,
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
        let temp_dir = TempDir::new().unwrap();
        let matrix1 = IdentityMatrix::new();
        let mut matrix2 = IdentityMatrix::new();
        matrix2.set_dimension("Rationalité-Émotivité", 0.8);

        // First save
        save_identity_matrix_atomic(&matrix1, temp_dir.path()).unwrap();

        // Second save (should create backup)
        save_identity_matrix_atomic(&matrix2, temp_dir.path()).unwrap();

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
        assert_eq!(matrix.get_dimension("Rationalité-Émotivité").unwrap().value, 1.0);

        matrix.set_dimension("Rationalité-Émotivité", -5.0);
        assert_eq!(matrix.get_dimension("Rationalité-Émotivité").unwrap().value, -1.0);
    }

    #[test]
    fn test_evolve() {
        let mut matrix = IdentityMatrix::new();
        let initial = matrix.get_dimension("Prudence-Audace").unwrap().value;

        let mut deltas = HashMap::new();
        deltas.insert("Prudence-Audace".to_string(), 0.5);

        matrix.evolve(&deltas);

        let evolved = matrix.get_dimension("Prudence-Audace").unwrap().value;
        assert!(evolved != initial);
    }

    #[test]
    fn test_profiles_professional() {
        let profile = IdentityProfiles::professional();
        // Professional should be formal and serious
        assert!(profile.get_dimension("Formalité-Familiarité").unwrap().value < 0.0);
        assert!(profile.get_dimension("Sérieux-Ludique").unwrap().value < 0.0);
    }

    #[test]
    fn test_profiles_mentor() {
        let profile = IdentityProfiles::mentor();
        // Mentor should be proactive
        assert!(profile.get_dimension("Réactif-Proactif").unwrap().value > 0.0);
    }

    #[test]
    fn test_profiles_creative() {
        let profile = IdentityProfiles::creative();
        // Creative should be audacious
        assert!(profile.get_dimension("Prudence-Audace").unwrap().value > 0.5);
    }

    #[test]
    fn test_profiles_technical() {
        let profile = IdentityProfiles::technical();
        // Technical should be specialist and rational
        assert!(profile.get_dimension("Généraliste-Spécialiste").unwrap().value > 0.5);
        assert!(profile.get_dimension("Rationalité-Émotivité").unwrap().value < 0.0);
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
}
