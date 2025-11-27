// Copyright © 2025 TITANE∞ — Appearance Commands v24.5
// License: Proprietary — TITANE OS
// Module: Tauri Commands for Appearance Management

use super::appearance_state::*;
use super::appearance_taxonomy_engine::*;
use std::sync::{Arc, Mutex};
use lazy_static::lazy_static;

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE — Appearance Engine & State
// ═══════════════════════════════════════════════════════════════════════════

lazy_static! {
    static ref APPEARANCE_ENGINE: Arc<Mutex<AppearanceTaxonomyEngine>> =
        Arc::new(Mutex::new(AppearanceTaxonomyEngine::new()));

    static ref APPEARANCE_STATE: Arc<Mutex<AvatarAppearanceState>> =
        Arc::new(Mutex::new(AvatarAppearanceState::default()));
}

pub fn get_appearance_engine() -> Arc<Mutex<AppearanceTaxonomyEngine>> {
    APPEARANCE_ENGINE.clone()
}

pub fn get_appearance_state() -> Arc<Mutex<AvatarAppearanceState>> {
    APPEARANCE_STATE.clone()
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 1: GET APPEARANCE STATE
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_get_appearance() -> Result<String, String> {
    let state = APPEARANCE_STATE.lock().map_err(|e| e.to_string())?;

    let json = serde_json::to_string(&*state)
        .map_err(|e| format!("Serialization error: {}", e))?;

    log::info!("📸 Appearance state retrieved");
    Ok(json)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 2: SET APPEARANCE STATE (Complete Override)
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_set_appearance(state_json: String) -> Result<String, String> {
    let new_state: AvatarAppearanceState = serde_json::from_str(&state_json)
        .map_err(|e| format!("Deserialization error: {}", e))?;

    let mut state = APPEARANCE_STATE.lock().map_err(|e| e.to_string())?;
    *state = new_state;

    let description = state.describe();
    log::info!("✅ Appearance set: {}", description);

    Ok(description)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 3: UPDATE APPEARANCE (Partial Update)
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_update_appearance(update_json: String) -> Result<String, String> {
    let update: AppearanceUpdateRequest = serde_json::from_str(&update_json)
        .map_err(|e| format!("Deserialization error: {}", e))?;

    let mut state = APPEARANCE_STATE.lock().map_err(|e| e.to_string())?;
    state.apply_update(update);

    let description = state.describe();
    log::info!("🔄 Appearance updated: {}", description);

    Ok(description)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 4: APPLY STYLE PRESET
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_apply_style_preset(style_name: String) -> Result<String, String> {
    let engine = APPEARANCE_ENGINE.lock().map_err(|e| e.to_string())?;
    let mut state = APPEARANCE_STATE.lock().map_err(|e| e.to_string())?;

    engine.apply_style_to_appearance(&style_name, &mut *state);

    let description = state.describe();
    log::info!("🎨 Style preset applied: {} → {}", style_name, description);

    Ok(description)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 5: PARSE STYLE COMMAND (NLP)
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_parse_style_command(command: String) -> Result<String, String> {
    let parser = StyleCommandParser::new();
    let current_state = APPEARANCE_STATE.lock().map_err(|e| e.to_string())?;

    let update_request = parser.parse(&command, &*current_state)?;

    let json = serde_json::to_string(&update_request)
        .map_err(|e| format!("Serialization error: {}", e))?;

    log::info!("🧠 Style command parsed: '{}'", command);
    Ok(json)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 6: SAVE CUSTOM STYLE
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_save_custom_style(name: String, archetype: String, keywords_json: String) -> Result<String, String> {
    let keywords: Vec<String> = serde_json::from_str(&keywords_json)
        .map_err(|e| format!("Deserialization error: {}", e))?;

    let mut state = APPEARANCE_STATE.lock().map_err(|e| e.to_string())?;
    state.save_as_custom_style(name.clone(), archetype, keywords);

    log::info!("💾 Custom style saved: {}", name);
    Ok(format!("Style '{}' enregistré avec succès", name))
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 7: LOAD CUSTOM STYLE
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_load_custom_style(name: String) -> Result<String, String> {
    let mut state = APPEARANCE_STATE.lock().map_err(|e| e.to_string())?;
    state.load_custom_style(&name)?;

    let description = state.describe();
    log::info!("📂 Custom style loaded: {} → {}", name, description);

    Ok(description)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 8: MERGE STYLES
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_merge_styles(style_names_json: String) -> Result<String, String> {
    let style_names: Vec<String> = serde_json::from_str(&style_names_json)
        .map_err(|e| format!("Deserialization error: {}", e))?;

    let engine = APPEARANCE_ENGINE.lock().map_err(|e| e.to_string())?;

    let style_refs: Vec<&str> = style_names.iter().map(|s| s.as_str()).collect();
    let merged = engine.merge_styles(style_refs);

    let json = serde_json::to_string(&merged)
        .map_err(|e| format!("Serialization error: {}", e))?;

    log::info!("🔀 Styles merged: {:?}", style_names);
    Ok(json)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 9: LIST AVAILABLE STYLES
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_list_styles() -> Result<String, String> {
    let engine = APPEARANCE_ENGINE.lock().map_err(|e| e.to_string())?;

    let style_names: Vec<String> = engine.styles.iter()
        .map(|s| s.name.clone())
        .collect();

    let json = serde_json::to_string(&style_names)
        .map_err(|e| format!("Serialization error: {}", e))?;

    Ok(json)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 10: ADD CUSTOM ARCHETYPE
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_add_archetype(name: String, keywords_json: String) -> Result<String, String> {
    let keywords: Vec<String> = serde_json::from_str(&keywords_json)
        .map_err(|e| format!("Deserialization error: {}", e))?;

    let mut engine = APPEARANCE_ENGINE.lock().map_err(|e| e.to_string())?;
    engine.add_archetype(name.clone(), keywords);

    log::info!("✨ Archetype added: {}", name);
    Ok(format!("Archétype '{}' ajouté avec succès", name))
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE COMMAND PARSER (Backend NLP)
// ═══════════════════════════════════════════════════════════════════════════

pub struct StyleCommandParser;

impl StyleCommandParser {
    pub fn new() -> Self {
        Self
    }

    pub fn parse(&self, command: &str, current: &AvatarAppearanceState) -> Result<AppearanceUpdateRequest, String> {
        let cmd_lower = command.to_lowercase();
        let mut update = AppearanceUpdateRequest {
            outfit: None,
            style: None,
            accessories: None,
            hair: None,
            makeup: None,
            mode_preset: None,
        };

        // Détection styles/presets
        if cmd_lower.contains("bureau") || cmd_lower.contains("professionnel") {
            update.mode_preset = Some("Bureau_Pro".to_string());
        } else if cmd_lower.contains("casual") || cmd_lower.contains("décontracté") {
            update.mode_preset = Some("Casual_Light".to_string());
        } else if cmd_lower.contains("sport") || cmd_lower.contains("athlétique") {
            update.mode_preset = Some("Sport_Dynamic".to_string());
        } else if cmd_lower.contains("montagne") || cmd_lower.contains("nordique") {
            update.mode_preset = Some("Montagne_Nordic".to_string());
        }

        // Détection vêtements
        if cmd_lower.contains("chemise") {
            let mut outfit = current.outfit.clone();
            outfit.top = "chemise".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("t-shirt") || cmd_lower.contains("tee-shirt") {
            let mut outfit = current.outfit.clone();
            outfit.top = "t-shirt".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("blouse") {
            let mut outfit = current.outfit.clone();
            outfit.top = "blouse".to_string();
            update.outfit = Some(outfit);
        }

        if cmd_lower.contains("pantalon") {
            let mut outfit = update.outfit.clone().unwrap_or_else(|| current.outfit.clone());
            outfit.bottom = "pantalon".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("jeans") {
            let mut outfit = update.outfit.clone().unwrap_or_else(|| current.outfit.clone());
            outfit.bottom = "jeans".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("jupe") {
            let mut outfit = update.outfit.clone().unwrap_or_else(|| current.outfit.clone());
            outfit.bottom = "jupe".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("leggings") {
            let mut outfit = update.outfit.clone().unwrap_or_else(|| current.outfit.clone());
            outfit.bottom = "leggings".to_string();
            update.outfit = Some(outfit);
        }

        // Détection coiffure
        if cmd_lower.contains("attache") && cmd_lower.contains("cheveux") {
            let mut hair = current.hair.clone();
            hair.style = "queue de cheval".to_string();
            update.hair = Some(hair);
        } else if cmd_lower.contains("détache") && cmd_lower.contains("cheveux") {
            let mut hair = current.hair.clone();
            hair.style = "détachés".to_string();
            update.hair = Some(hair);
        } else if cmd_lower.contains("chignon") {
            let mut hair = current.hair.clone();
            hair.style = "chignon".to_string();
            update.hair = Some(hair);
        }

        // Détection accessoires
        if cmd_lower.contains("lunettes") {
            let mut acc = current.accessories.clone();
            if cmd_lower.contains("enlève") || cmd_lower.contains("retire") {
                acc.glasses = None;
            } else {
                acc.glasses = Some("lunettes".to_string());
            }
            update.accessories = Some(acc);
        }

        Ok(update)
    }
}
