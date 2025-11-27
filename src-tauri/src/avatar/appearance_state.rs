// Copyright © 2025 TITANE∞ — Appearance State v24.5
// License: Proprietary — TITANE OS
// Module: Avatar Appearance State Management

use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR APPEARANCE STATE — État Complet de l'Apparence
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvatarAppearanceState {
    pub outfit: OutfitState,
    pub style: StyleState,
    pub accessories: AccessoriesState,
    pub hair: HairState,
    pub makeup: MakeupState,
    pub mode_preset: Option<String>,
    pub custom_styles: Vec<CustomStyle>,
}

impl Default for AvatarAppearanceState {
    fn default() -> Self {
        Self {
            outfit: OutfitState::default(),
            style: StyleState::default(),
            accessories: AccessoriesState::default(),
            hair: HairState::default(),
            makeup: MakeupState::default(),
            mode_preset: Some("Bureau_Pro_1".to_string()),
            custom_styles: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTFIT STATE — Vêtements
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutfitState {
    pub top: String,           // "chemise blanche", "t-shirt", "blouse", etc.
    pub bottom: String,        // "pantalon noir", "jupe", "jeans", etc.
    pub shoes: String,         // "escarpins", "baskets", "bottes", etc.
    pub outerwear: Option<String>, // "blazer", "veste", "manteau", etc.
    pub layering: Vec<String>, // calques additionnels
}

impl Default for OutfitState {
    fn default() -> Self {
        Self {
            top: "chemise claire".to_string(),
            bottom: "pantalon foncé".to_string(),
            shoes: "escarpins classiques".to_string(),
            outerwear: Some("blazer ajusté".to_string()),
            layering: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE STATE — Style Global
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleState {
    pub theme: String,         // "bureau", "casual", "sport", "soirée", "fantasy"
    pub formality: Formality,
    pub color_palette: String, // "neutre", "pastel", "terre", "monochrome", etc.
    pub vibe: Option<String>,  // "solaire", "lunaire", "mystique", "énergétique"
    pub epoch: Option<String>, // "moderne", "rétro", "futur"
    pub energy: Option<String>, // "enracinée", "dynamique", "calme"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Formality {
    Casual,
    Smart,
    Formal,
}

impl Default for StyleState {
    fn default() -> Self {
        Self {
            theme: "bureau".to_string(),
            formality: Formality::Formal,
            color_palette: "neutre".to_string(),
            vibe: Some("professionnelle".to_string()),
            epoch: Some("moderne".to_string()),
            energy: Some("calme".to_string()),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ACCESSORIES STATE — Accessoires
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessoriesState {
    pub glasses: Option<String>,   // "lunettes fines", "lunettes noires", etc.
    pub jewelry: Vec<String>,       // ["boucles d'oreilles discrètes", "collier fin"]
    pub bag: Option<String>,        // "sac élégant", "sac à dos", etc.
    pub other: Vec<String>,         // ["écharpe", "montre"]
}

impl Default for AccessoriesState {
    fn default() -> Self {
        Self {
            glasses: None,
            jewelry: vec!["boucles d'oreilles discrètes".to_string()],
            bag: Some("sac élégant".to_string()),
            other: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HAIR STATE — Coiffure
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HairState {
    pub style: String,  // "détachés", "queue de cheval", "chignon", "tressés"
    pub length: HairLength,
    pub color: Option<String>, // "dark", "châtain", "blonde", etc.
    pub details: Vec<String>,  // ["frange", "mèches"]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HairLength {
    Court,
    MiLong,
    Long,
}

impl Default for HairState {
    fn default() -> Self {
        Self {
            style: "queue de cheval haute".to_string(),
            length: HairLength::Long,
            color: Some("dark".to_string()),
            details: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAKEUP STATE — Maquillage
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MakeupState {
    pub intensity: MakeupIntensity,
    pub style: Option<String>, // "naturel", "soirée", "studio"
    pub details: Vec<String>,  // ["eye-liner", "rouge léger"]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MakeupIntensity {
    None,
    Light,
    Medium,
    Strong,
}

impl Default for MakeupState {
    fn default() -> Self {
        Self {
            intensity: MakeupIntensity::Light,
            style: Some("naturel".to_string()),
            details: vec!["rouge léger".to_string()],
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM STYLE — Styles Personnalisés
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomStyle {
    pub name: String,
    pub archetype: String,
    pub appearance_snapshot: AvatarAppearanceState,
    pub keywords: Vec<String>,
    pub created_at: String,
}

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE UPDATE REQUEST — Mise à Jour Partielle
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppearanceUpdateRequest {
    pub outfit: Option<OutfitState>,
    pub style: Option<StyleState>,
    pub accessories: Option<AccessoriesState>,
    pub hair: Option<HairState>,
    pub makeup: Option<MakeupState>,
    pub mode_preset: Option<String>,
}

impl AvatarAppearanceState {
    pub fn apply_update(&mut self, update: AppearanceUpdateRequest) {
        if let Some(outfit) = update.outfit {
            self.outfit = outfit;
        }
        if let Some(style) = update.style {
            self.style = style;
        }
        if let Some(accessories) = update.accessories {
            self.accessories = accessories;
        }
        if let Some(hair) = update.hair {
            self.hair = hair;
        }
        if let Some(makeup) = update.makeup {
            self.makeup = makeup;
        }
        if let Some(preset) = update.mode_preset {
            self.mode_preset = Some(preset);
        }
    }

    pub fn save_as_custom_style(&mut self, name: String, archetype: String, keywords: Vec<String>) {
        let custom_style = CustomStyle {
            name: name.clone(),
            archetype,
            appearance_snapshot: self.clone(),
            keywords,
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        // Supprimer ancien style avec même nom
        self.custom_styles.retain(|s| s.name != name);

        // Ajouter nouveau
        self.custom_styles.push(custom_style);
    }

    pub fn load_custom_style(&mut self, name: &str) -> Result<(), String> {
        if let Some(style) = self.custom_styles.iter().find(|s| s.name == name) {
            *self = style.appearance_snapshot.clone();
            Ok(())
        } else {
            Err(format!("Style personnalisé '{}' introuvable", name))
        }
    }

    pub fn describe(&self) -> String {
        format!(
            "Style: {} ({}). Tenue: {} + {}. Coiffure: {} ({}). Accessoires: {}.",
            self.style.theme,
            match self.style.formality {
                Formality::Casual => "décontracté",
                Formality::Smart => "smart",
                Formality::Formal => "formel",
            },
            self.outfit.top,
            self.outfit.bottom,
            self.hair.style,
            match self.hair.length {
                HairLength::Court => "court",
                HairLength::MiLong => "mi-long",
                HairLength::Long => "long",
            },
            if self.accessories.glasses.is_some() || !self.accessories.jewelry.is_empty() {
                "présents"
            } else {
                "absents"
            }
        )
    }
}
