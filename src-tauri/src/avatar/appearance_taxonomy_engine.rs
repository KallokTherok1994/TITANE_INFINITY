// Copyright © 2025 TITANE∞ — Appearance Taxonomy Engine v24.5
// License: Proprietary — TITANE OS
// Module: Taxonomie Esthétique Fractale Infinie

use super::appearance_state::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE TAXONOMY ENGINE — Moteur de Taxonomie
// ═══════════════════════════════════════════════════════════════════════════

pub struct AppearanceTaxonomyEngine {
    pub archetypes: Vec<StyleArchetype>,
    pub styles: Vec<StyleDefinition>,
    pub modulators: Vec<StyleModulator>,
    pub combiners: Vec<StyleCombiner>,
    pub user_invented_styles: HashMap<String, StyleDefinition>,
}

impl Default for AppearanceTaxonomyEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl AppearanceTaxonomyEngine {
    pub fn new() -> Self {
        Self {
            archetypes: Self::init_base_archetypes(),
            styles: Self::init_base_styles(),
            modulators: Self::init_base_modulators(),
            combiners: vec![StyleCombiner::default()],
            user_invented_styles: HashMap::new(),
        }
    }

    // ───────────────────────────────────────────────────────────────────────
    // ARCHETYPES ESTHÉTIQUES (Couche 1)
    // ───────────────────────────────────────────────────────────────────────

    fn init_base_archetypes() -> Vec<StyleArchetype> {
        vec![
            StyleArchetype::new("Bureau", vec!["professionnel", "travail", "office"]),
            StyleArchetype::new("Créatif", vec!["art", "design", "créativité"]),
            StyleArchetype::new("Nature", vec!["montagne", "terre", "organique"]),
            StyleArchetype::new("Sport", vec!["athlétique", "dynamique", "performance"]),
            StyleArchetype::new("Leadership", vec!["conférence", "présentation", "pouvoir"]),
            StyleArchetype::new("Casual", vec!["décontracté", "relax", "confort"]),
            StyleArchetype::new("Minimaliste", vec!["épuré", "simple", "essentiel"]),
            StyleArchetype::new("Futuriste", vec!["cyber", "néon", "tech"]),
            StyleArchetype::new("Mystique", vec!["symbolique", "profonde", "ésotérique"]),
            StyleArchetype::new("Nomade", vec!["voyageuse", "libre", "mouvement"]),
            StyleArchetype::new("Studio", vec!["production", "média", "scène"]),
            StyleArchetype::new("Boho", vec!["bohème", "libre", "artistique"]),
            StyleArchetype::new("Nocturne", vec!["nuit", "sombre", "lunaire"]),
            StyleArchetype::new("Océan", vec!["aqua", "eau", "fluide"]),
            StyleArchetype::new("Mindfulness", vec!["yoga", "zen", "calme"]),
            StyleArchetype::new("Avant-garde", vec!["mode", "expérimental", "audacieux"]),
            StyleArchetype::new("Urbain", vec!["ville", "street", "moderne"]),
        ]
    }

    pub fn add_archetype(&mut self, name: String, keywords: Vec<String>) {
        let archetype = StyleArchetype {
            name: name.clone(),
            keywords,
        };
        if !self.archetypes.iter().any(|a| a.name == name) {
            self.archetypes.push(archetype);
            log::info!("✅ Nouvel archétype créé: {}", name);
        }
    }

    // ───────────────────────────────────────────────────────────────────────
    // STYLES DÉTAILLÉS (Couche 2)
    // ───────────────────────────────────────────────────────────────────────

    fn init_base_styles() -> Vec<StyleDefinition> {
        vec![
            StyleDefinition {
                name: "Bureau_Pro".to_string(),
                parent_archetype: "Bureau".to_string(),
                keywords: ["professionnel", "formel", "élégant"].iter().map(|s| s.to_string()).collect(),
                visual_tags: ["chemise", "pantalon", "blazer"].iter().map(|s| s.to_string()).collect(),
                default_palette: Some(ColorPalette::Neutral),
                default_outfit: Some(OutfitTemplate::OfficeFormal),
                default_hair: Some(HairTemplate::TiedUp),
                vibe: Some("confiant".to_string()),
            },
            StyleDefinition {
                name: "Casual_Light".to_string(),
                parent_archetype: "Casual".to_string(),
                keywords: ["décontracté", "léger", "confort"].iter().map(|s| s.to_string()).collect(),
                visual_tags: ["t-shirt", "jeans", "baskets"].iter().map(|s| s.to_string()).collect(),
                default_palette: Some(ColorPalette::Pastel),
                default_outfit: Some(OutfitTemplate::CasualLight),
                default_hair: Some(HairTemplate::Loose),
                vibe: Some("relax".to_string()),
            },
            StyleDefinition {
                name: "Sport_Dynamic".to_string(),
                parent_archetype: "Sport".to_string(),
                keywords: ["sportif", "athlétique", "actif"].iter().map(|s| s.to_string()).collect(),
                visual_tags: ["leggings", "top sport", "baskets"].iter().map(|s| s.to_string()).collect(),
                default_palette: Some(ColorPalette::Monochrome),
                default_outfit: Some(OutfitTemplate::SportActive),
                default_hair: Some(HairTemplate::Ponytail),
                vibe: Some("énergétique".to_string()),
            },
            StyleDefinition {
                name: "Montagne_Nordic".to_string(),
                parent_archetype: "Nature".to_string(),
                keywords: ["montagne", "nordique", "nature"].iter().map(|s| s.to_string()).collect(),
                visual_tags: ["laine", "bottes", "layering"].iter().map(|s| s.to_string()).collect(),
                default_palette: Some(ColorPalette::Earth),
                default_outfit: Some(OutfitTemplate::MountainNordic),
                default_hair: Some(HairTemplate::Braid),
                vibe: Some("enracinée".to_string()),
            },
        ]
    }

    pub fn register_user_style(&mut self, style: StyleDefinition) {
        log::info!("📝 Style personnalisé enregistré: {}", style.name);
        self.user_invented_styles.insert(style.name.clone(), style.clone());
        self.styles.push(style);
    }

    // ───────────────────────────────────────────────────────────────────────
    // MODULATORS (Couche 3)
    // ───────────────────────────────────────────────────────────────────────

    fn init_base_modulators() -> Vec<StyleModulator> {
        vec![
            StyleModulator {
                name: "Palette_Pastel".to_string(),
                category: ModulatorCategory::Color,
                effect: {
                    let mut map = HashMap::new();
                    map.insert("color_palette".to_string(), "pastel".to_string());
                    map
                },
            },
            StyleModulator {
                name: "Vibe_Solaire".to_string(),
                category: ModulatorCategory::Vibe,
                effect: {
                    let mut map = HashMap::new();
                    map.insert("vibe".to_string(), "solaire".to_string());
                    map.insert("energy".to_string(), "énergétique".to_string());
                    map
                },
            },
            StyleModulator {
                name: "Vibe_Lunaire".to_string(),
                category: ModulatorCategory::Vibe,
                effect: {
                    let mut map = HashMap::new();
                    map.insert("vibe".to_string(), "lunaire".to_string());
                    map.insert("energy".to_string(), "calme".to_string());
                    map
                },
            },
            StyleModulator {
                name: "Texture_Laine".to_string(),
                category: ModulatorCategory::Texture,
                effect: {
                    let mut map = HashMap::new();
                    map.insert("material".to_string(), "laine".to_string());
                    map
                },
            },
            StyleModulator {
                name: "Texture_Tech".to_string(),
                category: ModulatorCategory::Texture,
                effect: {
                    let mut map = HashMap::new();
                    map.insert("material".to_string(), "tech-fabric".to_string());
                    map
                },
            },
            StyleModulator {
                name: "Epoch_Futur".to_string(),
                category: ModulatorCategory::Epoch,
                effect: {
                    let mut map = HashMap::new();
                    map.insert("epoch".to_string(), "futur".to_string());
                    map
                },
            },
        ]
    }

    pub fn apply_modulator(&self, style: &mut StyleState, modulator_name: &str) {
        if let Some(mod_def) = self.modulators.iter().find(|m| m.name == modulator_name) {
            for (key, value) in &mod_def.effect {
                match key.as_str() {
                    "color_palette" => style.color_palette = value.clone(),
                    "vibe" => style.vibe = Some(value.clone()),
                    "energy" => style.energy = Some(value.clone()),
                    "epoch" => style.epoch = Some(value.clone()),
                    _ => {}
                }
            }
            log::info!("🎨 Modulator appliqué: {}", modulator_name);
        }
    }

    // ───────────────────────────────────────────────────────────────────────
    // FUSION DE STYLES (Couche 4)
    // ───────────────────────────────────────────────────────────────────────

    pub fn merge_styles(&self, style_names: Vec<&str>) -> StyleDefinition {
        let mut merged = StyleDefinition {
            name: format!("Fusion_{}", style_names.join("_")),
            parent_archetype: "Custom".to_string(),
            keywords: Vec::new(),
            visual_tags: Vec::new(),
            default_palette: None,
            default_outfit: None,
            default_hair: None,
            vibe: None,
        };

        for style_name in style_names {
            if let Some(style) = self.styles.iter().find(|s| s.name == style_name) {
                merged.keywords.extend(style.keywords.clone());
                merged.visual_tags.extend(style.visual_tags.clone());

                // Fusion palette (priorité dernière)
                if style.default_palette.is_some() {
                    merged.default_palette = style.default_palette.clone();
                }

                // Fusion vibe (concat)
                if let Some(vibe) = &style.vibe {
                    merged.vibe = Some(format!("{}-{}", merged.vibe.unwrap_or_default(), vibe));
                }
            }
        }

        log::info!("🔀 Fusion de styles créée: {}", merged.name);
        merged
    }

    // ───────────────────────────────────────────────────────────────────────
    // APPLICATION À L'ÉTAT D'APPARENCE
    // ───────────────────────────────────────────────────────────────────────

    pub fn apply_style_to_appearance(&self, style_name: &str, appearance: &mut AvatarAppearanceState) {
        if let Some(style) = self.styles.iter().find(|s| s.name == style_name) {
            // Appliquer palette
            if let Some(palette) = &style.default_palette {
                appearance.style.color_palette = format!("{:?}", palette).to_lowercase();
            }

            // Appliquer outfit
            if let Some(outfit_template) = &style.default_outfit {
                Self::apply_outfit_template(outfit_template, &mut appearance.outfit);
            }

            // Appliquer coiffure
            if let Some(hair_template) = &style.default_hair {
                Self::apply_hair_template(hair_template, &mut appearance.hair);
            }

            // Appliquer vibe
            if let Some(vibe) = &style.vibe {
                appearance.style.vibe = Some(vibe.clone());
            }

            appearance.style.theme = style.parent_archetype.clone();

            log::info!("✅ Style appliqué: {} → {}", style_name, appearance.describe());
        }
    }

    fn apply_outfit_template(template: &OutfitTemplate, outfit: &mut OutfitState) {
        match template {
            OutfitTemplate::OfficeFormal => {
                outfit.top = "chemise blanche".to_string();
                outfit.bottom = "pantalon noir".to_string();
                outfit.shoes = "escarpins".to_string();
                outfit.outerwear = Some("blazer foncé".to_string());
            },
            OutfitTemplate::CasualLight => {
                outfit.top = "t-shirt blanc".to_string();
                outfit.bottom = "jeans bleu".to_string();
                outfit.shoes = "baskets blanches".to_string();
                outfit.outerwear = None;
            },
            OutfitTemplate::SportActive => {
                outfit.top = "top sport noir".to_string();
                outfit.bottom = "leggings noirs".to_string();
                outfit.shoes = "baskets running".to_string();
                outfit.outerwear = None;
            },
            OutfitTemplate::MountainNordic => {
                outfit.top = "pull laine".to_string();
                outfit.bottom = "pantalon outdoor".to_string();
                outfit.shoes = "bottes montagne".to_string();
                outfit.outerwear = Some("veste technique".to_string());
            },
        }
    }

    fn apply_hair_template(template: &HairTemplate, hair: &mut HairState) {
        match template {
            HairTemplate::TiedUp => {
                hair.style = "queue de cheval haute".to_string();
            },
            HairTemplate::Loose => {
                hair.style = "détachés".to_string();
            },
            HairTemplate::Ponytail => {
                hair.style = "queue de cheval".to_string();
            },
            HairTemplate::Braid => {
                hair.style = "tressés".to_string();
            },
            HairTemplate::Bun => {
                hair.style = "chignon".to_string();
            },
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURES DÉFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone)]
pub struct StyleArchetype {
    pub name: String,
    pub keywords: Vec<String>,
}

impl StyleArchetype {
    fn new(name: &str, keywords: Vec<&str>) -> Self {
        Self {
            name: name.to_string(),
            keywords: keywords.iter().map(|s| s.to_string()).collect(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleDefinition {
    pub name: String,
    pub parent_archetype: String,
    pub keywords: Vec<String>,
    pub visual_tags: Vec<String>,
    pub default_palette: Option<ColorPalette>,
    pub default_outfit: Option<OutfitTemplate>,
    pub default_hair: Option<HairTemplate>,
    pub vibe: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ColorPalette {
    Neutral,
    Pastel,
    Earth,
    Monochrome,
    Saturated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OutfitTemplate {
    OfficeFormal,
    CasualLight,
    SportActive,
    MountainNordic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HairTemplate {
    TiedUp,
    Loose,
    Ponytail,
    Braid,
    Bun,
}

#[derive(Debug, Clone)]
pub struct StyleModulator {
    pub name: String,
    pub category: ModulatorCategory,
    pub effect: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub enum ModulatorCategory {
    Color,
    Texture,
    Vibe,
    Intensity,
    Epoch,
    Energy,
}

#[derive(Debug, Clone)]
pub struct StyleCombiner {
    pub merge_rules: Vec<MergeRule>,
}

impl Default for StyleCombiner {
    fn default() -> Self {
        Self {
            merge_rules: vec![
                MergeRule::PreferLast,
                MergeRule::ConcatKeywords,
            ],
        }
    }
}

#[derive(Debug, Clone)]
pub enum MergeRule {
    PreferLast,
    ConcatKeywords,
    BlendPalettes,
}
