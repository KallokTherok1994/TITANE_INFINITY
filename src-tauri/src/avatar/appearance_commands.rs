// Copyright © 2025 TITANE∞ — Appearance Commands v24.5
// License: Proprietary — TITANE OS
// Module: Tauri Commands for Appearance Management

use super::appearance_state::*;
use super::appearance_taxonomy_engine::*;
use lazy_static::lazy_static;
use std::sync::{Arc, Mutex};

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

    let json = serde_json::to_string(&*state).map_err(|e| format!("Serialization error: {}", e))?;

    log::info!("📸 Appearance state retrieved");
    Ok(json)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 2: SET APPEARANCE STATE (Complete Override)
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_set_appearance(state_json: String) -> Result<String, String> {
    let new_state: AvatarAppearanceState =
        serde_json::from_str(&state_json).map_err(|e| format!("Deserialization error: {}", e))?;

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
    let update: AppearanceUpdateRequest =
        serde_json::from_str(&update_json).map_err(|e| format!("Deserialization error: {}", e))?;

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

    engine.apply_style_to_appearance(&style_name, &mut state);

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

    let update_request = parser.parse(&command, &current_state)?;

    let json = serde_json::to_string(&update_request)
        .map_err(|e| format!("Serialization error: {}", e))?;

    log::info!("🧠 Style command parsed: '{}'", command);
    Ok(json)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 6: SAVE CUSTOM STYLE
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_save_custom_style(
    name: String,
    archetype: String,
    keywords_json: String,
) -> Result<String, String> {
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

    let json = serde_json::to_string(&merged).map_err(|e| format!("Serialization error: {}", e))?;

    log::info!("🔀 Styles merged: {:?}", style_names);
    Ok(json)
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 9: LIST AVAILABLE STYLES
// ═══════════════════════════════════════════════════════════════════════════

#[tauri::command]
pub fn avatar_list_styles() -> Result<String, String> {
    let engine = APPEARANCE_ENGINE.lock().map_err(|e| e.to_string())?;

    let style_names: Vec<String> = engine.styles.iter().map(|s| s.name.clone()).collect();

    let json =
        serde_json::to_string(&style_names).map_err(|e| format!("Serialization error: {}", e))?;

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

impl Default for StyleCommandParser {
    fn default() -> Self {
        Self::new()
    }
}

impl StyleCommandParser {
    pub fn new() -> Self {
        Self
    }

    pub fn parse(
        &self,
        command: &str,
        current: &AvatarAppearanceState,
    ) -> Result<AppearanceUpdateRequest, String> {
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
            let mut outfit = update
                .outfit
                .clone()
                .unwrap_or_else(|| current.outfit.clone());
            outfit.bottom = "pantalon".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("jeans") {
            let mut outfit = update
                .outfit
                .clone()
                .unwrap_or_else(|| current.outfit.clone());
            outfit.bottom = "jeans".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("jupe") {
            let mut outfit = update
                .outfit
                .clone()
                .unwrap_or_else(|| current.outfit.clone());
            outfit.bottom = "jupe".to_string();
            update.outfit = Some(outfit);
        } else if cmd_lower.contains("leggings") {
            let mut outfit = update
                .outfit
                .clone()
                .unwrap_or_else(|| current.outfit.clone());
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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // StyleCommandParser Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_style_command_parser_new() {
        let parser = StyleCommandParser::new();
        let _ = parser;
    }

    #[test]
    fn test_style_command_parser_default() {
        let parser = StyleCommandParser::default();
        let _ = parser;
    }

    #[test]
    fn test_parse_bureau_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Je veux un look bureau", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Bureau_Pro".to_string()));
    }

    #[test]
    fn test_parse_professionnel_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Style professionnel", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Bureau_Pro".to_string()));
    }

    #[test]
    fn test_parse_casual_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Je préfère casual", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Casual_Light".to_string()));
    }

    #[test]
    fn test_parse_decontracte_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Look décontracté", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Casual_Light".to_string()));
    }

    #[test]
    fn test_parse_sport_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Tenue de sport", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Sport_Dynamic".to_string()));
    }

    #[test]
    fn test_parse_athletique_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Style athlétique", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Sport_Dynamic".to_string()));
    }

    #[test]
    fn test_parse_montagne_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Look montagne", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Montagne_Nordic".to_string()));
    }

    #[test]
    fn test_parse_nordique_preset() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Style nordique", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Montagne_Nordic".to_string()));
    }

    #[test]
    fn test_parse_chemise_top() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Mets une chemise", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().top, "chemise");
    }

    #[test]
    fn test_parse_tshirt_top() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Je veux un t-shirt", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().top, "t-shirt");
    }

    #[test]
    fn test_parse_blouse_top() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Une blouse", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().top, "blouse");
    }

    #[test]
    fn test_parse_pantalon_bottom() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Mets un pantalon", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().bottom, "pantalon");
    }

    #[test]
    fn test_parse_jeans_bottom() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Des jeans", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().bottom, "jeans");
    }

    #[test]
    fn test_parse_jupe_bottom() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Une jupe", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().bottom, "jupe");
    }

    #[test]
    fn test_parse_leggings_bottom() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Des leggings", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().bottom, "leggings");
    }

    #[test]
    fn test_parse_attache_cheveux() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Attache les cheveux", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.hair.is_some());
        assert_eq!(update.hair.unwrap().style, "queue de cheval");
    }

    #[test]
    fn test_parse_detache_cheveux() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Détache les cheveux", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.hair.is_some());
        assert_eq!(update.hair.unwrap().style, "détachés");
    }

    #[test]
    fn test_parse_chignon() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Fais un chignon", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.hair.is_some());
        assert_eq!(update.hair.unwrap().style, "chignon");
    }

    #[test]
    fn test_parse_add_lunettes() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Mets des lunettes", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.accessories.is_some());
        assert_eq!(
            update.accessories.unwrap().glasses,
            Some("lunettes".to_string())
        );
    }

    #[test]
    fn test_parse_remove_lunettes() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Enlève les lunettes", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.accessories.is_some());
        assert!(update.accessories.unwrap().glasses.is_none());
    }

    #[test]
    fn test_parse_retire_lunettes() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Retire les lunettes", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.accessories.is_some());
        assert!(update.accessories.unwrap().glasses.is_none());
    }

    #[test]
    fn test_parse_no_match() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Hello world", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert!(update.mode_preset.is_none());
        assert!(update.outfit.is_none());
        assert!(update.hair.is_none());
        assert!(update.accessories.is_none());
    }

    #[test]
    fn test_parse_combined_command() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("Look bureau avec une chemise", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Bureau_Pro".to_string()));
        assert!(update.outfit.is_some());
        assert_eq!(update.outfit.unwrap().top, "chemise");
    }

    #[test]
    fn test_parse_case_insensitive() {
        let parser = StyleCommandParser::new();
        let state = AvatarAppearanceState::default();
        let result = parser.parse("BUREAU PROFESSIONNEL", &state);
        assert!(result.is_ok());
        let update = result.unwrap();
        assert_eq!(update.mode_preset, Some("Bureau_Pro".to_string()));
    }

    // ─────────────────────────────────────────────────────────────
    // Global State Accessor Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_get_appearance_engine_returns_arc() {
        let engine = get_appearance_engine();
        let _guard = engine.lock().unwrap();
    }

    #[test]
    fn test_get_appearance_state_returns_arc() {
        let state = get_appearance_state();
        let _guard = state.lock().unwrap();
    }

    #[test]
    fn test_appearance_engine_has_styles() {
        let engine = get_appearance_engine();
        let guard = engine.lock().unwrap();
        assert!(!guard.styles.is_empty());
    }
}
