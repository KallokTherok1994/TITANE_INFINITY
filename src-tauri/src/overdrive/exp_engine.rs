// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE EXP ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Système d'expérience, progression, niveaux et talent tree
// ═══════════════════════════════════════════════════════════════════════════

use crate::core::tapi_error::TAPIError;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpProfile {
    pub total_exp: u64,
    pub level: u32,
    pub exp_to_next_level: u64,
    pub categories: HashMap<String, CategoryExp>,
    pub talents: Vec<String>, // IDs des talents débloqués
    pub talent_points: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryExp {
    pub category: String,
    pub exp: u64,
    pub level: u32,
    pub contributions: u32, // Nombre d'actions
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpGain {
    pub amount: u64,
    pub category: String,
    pub source: String, // chat|voice|project|code
    pub description: String,
    pub timestamp: u64,
    pub multiplier: f32, // Bonus événementiel
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Talent {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub tier: u32,                 // 1-5
    pub cost: u32,                 // Points de talent
    pub requirements: Vec<String>, // IDs des talents prérequis
    pub unlocked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LevelUpEvent {
    pub old_level: u32,
    pub new_level: u32,
    pub talent_points_earned: u32,
    pub timestamp: u64,
}

pub struct ExpEngineState {
    profile: Arc<Mutex<ExpProfile>>,
    history: Arc<Mutex<Vec<ExpGain>>>,
    talents: Arc<Mutex<HashMap<String, Talent>>>,
    level_up_events: Arc<Mutex<Vec<LevelUpEvent>>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> ExpEngineState {
    let profile = ExpProfile {
        total_exp: 0,
        level: 1,
        exp_to_next_level: 100,
        categories: HashMap::new(),
        talents: Vec::new(),
        talent_points: 0,
    };

    let state = ExpEngineState {
        profile: Arc::new(Mutex::new(profile)),
        history: Arc::new(Mutex::new(Vec::new())),
        talents: Arc::new(Mutex::new(HashMap::new())),
        level_up_events: Arc::new(Mutex::new(Vec::new())),
    };

    // Initialiser les catégories
    initialize_categories(&state);

    // Charger le talent tree
    initialize_talents(&state);

    state
}

fn initialize_categories(state: &ExpEngineState) {
    let categories = vec!["chat_ia", "voice", "code", "projects", "system", "learning"];

    let mut profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] profile lock poisoned in initialize_categories, recovering");
            poisoned.into_inner()
        }
    };
    for category in categories {
        profile.categories.insert(
            category.to_string(),
            CategoryExp {
                category: category.to_string(),
                exp: 0,
                level: 1,
                contributions: 0,
            },
        );
    }
}

fn initialize_talents(state: &ExpEngineState) {
    let mut talents = match state.talents.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] talents lock poisoned in initialize_talents, recovering");
            poisoned.into_inner()
        }
    };

    // Tier 1 - Chat IA
    talents.insert(
        "chat_speed_1".to_string(),
        Talent {
            id: "chat_speed_1".to_string(),
            name: "Réponse Rapide".to_string(),
            description: "Réduit la latence de 10%".to_string(),
            category: "chat_ia".to_string(),
            tier: 1,
            cost: 1,
            requirements: vec![],
            unlocked: false,
        },
    );

    talents.insert(
        "chat_memory_1".to_string(),
        Talent {
            id: "chat_memory_1".to_string(),
            name: "Mémoire Étendue".to_string(),
            description: "+20% de contexte conversationnel".to_string(),
            category: "chat_ia".to_string(),
            tier: 1,
            cost: 1,
            requirements: vec![],
            unlocked: false,
        },
    );

    // Tier 2 - Voice
    talents.insert(
        "voice_quality_1".to_string(),
        Talent {
            id: "voice_quality_1".to_string(),
            name: "Voix Optimisée".to_string(),
            description: "Améliore qualité TTS de 15%".to_string(),
            category: "voice".to_string(),
            tier: 2,
            cost: 2,
            requirements: vec!["chat_speed_1".to_string()],
            unlocked: false,
        },
    );

    // Tier 3 - Projects
    talents.insert(
        "project_automation_1".to_string(),
        Talent {
            id: "project_automation_1".to_string(),
            name: "AutoPilot Avancé".to_string(),
            description: "Débloque suggestions automatiques".to_string(),
            category: "projects".to_string(),
            tier: 3,
            cost: 3,
            requirements: vec!["chat_memory_1".to_string()],
            unlocked: false,
        },
    );

    println!("[EXP] {} talents initialisés", talents.len());
}

// ─────────────────────────────────────────────────────────────────────────────
// GAIN D'EXPÉRIENCE
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn exp_add(
    amount: u64,
    category: String,
    source: String,
    description: String,
    state: State<ExpEngineState>,
) -> Result<ExpProfile, TAPIError> {
    let gain = ExpGain {
        amount,
        category: category.clone(),
        source,
        description: description.clone(),
        timestamp: get_timestamp(),
        multiplier: 1.0,
    };

    println!("[EXP] +{} XP [{}] - {}", amount, category, description);

    // Ajouter à l'historique
    {
        let mut history = match state.history.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                eprintln!("[EXP] history lock poisoned in exp_add_exp, recovering");
                poisoned.into_inner()
            }
        };
        history.push(gain.clone());

        // Limiter historique à 1000 entrées
        let history_len = history.len();
        if history_len > 1000 {
            history.drain(0..(history_len - 1000));
        }
    }

    // Mettre à jour profil
    let mut profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] profile lock poisoned in exp_add_exp, recovering");
            poisoned.into_inner()
        }
    };
    let old_level = profile.level;
    profile.total_exp += amount;

    // Mettre à jour catégorie
    if let Some(cat) = profile.categories.get_mut(&category) {
        cat.exp += amount;
        cat.contributions += 1;
        cat.level = calculate_level(cat.exp);
    }

    // Vérifier level up
    while profile.total_exp >= profile.exp_to_next_level {
        profile.level += 1;
        profile.talent_points += 1;
        profile.exp_to_next_level = calculate_exp_for_next_level(profile.level);

        let event = LevelUpEvent {
            old_level,
            new_level: profile.level,
            talent_points_earned: 1,
            timestamp: get_timestamp(),
        };

        let mut events = match state.level_up_events.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                eprintln!("[EXP] level_up_events lock poisoned, recovering");
                poisoned.into_inner()
            }
        };
        events.push(event);

        println!(
            "[EXP] 🎉 LEVEL UP! {} → {} | +1 Talent Point",
            old_level, profile.level
        );
    }

    Ok(profile.clone())
}

#[tauri::command]
pub fn exp_add_batch(
    gains: Vec<(u64, String, String, String)>,
    state: State<ExpEngineState>,
) -> Result<ExpProfile, TAPIError> {
    let mut profile_result = None;

    for (amount, category, source, description) in gains {
        profile_result = Some(exp_add(
            amount,
            category,
            source,
            description,
            state.clone(),
        )?);
    }

    profile_result.ok_or_else(|| TAPIError::validation("Aucun gain d'expérience"))
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTÈME DE NIVEAUX
// ─────────────────────────────────────────────────────────────────────────────

fn calculate_level(exp: u64) -> u32 {
    // Formule exponentielle : level = floor(sqrt(exp / 100))
    let level = ((exp as f64 / 100.0).sqrt()).floor() as u32;
    level.max(1)
}

fn calculate_exp_for_next_level(current_level: u32) -> u64 {
    // Formule inverse : exp = 100 * (level + 1)²
    100 * ((current_level + 1) as u64).pow(2)
}

#[tauri::command]
pub fn exp_get_profile(state: State<ExpEngineState>) -> Result<ExpProfile, TAPIError> {
    let profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] profile lock poisoned in exp_get_profile, recovering");
            poisoned.into_inner()
        }
    };
    Ok(profile.clone())
}

#[tauri::command]
pub fn exp_get_level_up_history(
    limit: usize,
    state: State<ExpEngineState>,
) -> Result<Vec<LevelUpEvent>, TAPIError> {
    let events = match state.level_up_events.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!(
                "[EXP] level_up_events lock poisoned in exp_get_level_up_history, recovering"
            );
            poisoned.into_inner()
        }
    };
    let start = if events.len() > limit {
        events.len() - limit
    } else {
        0
    };
    Ok(events[start..].to_vec())
}

// ─────────────────────────────────────────────────────────────────────────────
// TALENT TREE
// ─────────────────────────────────────────────────────────────────────────────

// DISABLED: Conflit avec commands::exp_fusion::exp_get_talents
/*
#[tauri::command]
pub fn exp_get_talents(state: State<ExpEngineState>) -> Result<Vec<Talent>, String> {
    let talents = match state.talents.lock() {
        Ok(guard) => guard,
        Err(poisoned) => { eprintln!("[EXP] talents lock poisoned"); poisoned.into_inner() }
    };
    let profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => { eprintln!("[EXP] profile lock poisoned"); poisoned.into_inner() }
    };

    let mut result: Vec<Talent> = talents.values().cloned().collect();

    // Marquer talents débloqués
    for talent in &mut result {
        talent.unlocked = profile.talents.contains(&talent.id);
    }

    // Trier par tier puis nom
    result.sort_by(|a, b| {
        a.tier.cmp(&b.tier).then_with(|| a.name.cmp(&b.name))
    });

    Ok(result)
}
*/
#[tauri::command]
pub fn exp_unlock_talent(
    talent_id: String,
    state: State<ExpEngineState>,
) -> Result<ExpProfile, TAPIError> {
    let mut profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] profile lock poisoned in exp_unlock_talent, recovering");
            poisoned.into_inner()
        }
    };
    let talents = match state.talents.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] talents lock poisoned in exp_unlock_talent, recovering");
            poisoned.into_inner()
        }
    };

    let talent = talents
        .get(&talent_id)
        .ok_or_else(|| TAPIError::not_found("Talent introuvable"))?
        .clone();

    // Vérifier si déjà débloqué
    if profile.talents.contains(&talent_id) {
        return Err(TAPIError::validation("Talent déjà débloqué"));
    }

    // Vérifier points de talent
    if profile.talent_points < talent.cost {
        return Err(TAPIError::validation(format!(
            "Points insuffisants: {} requis, {} disponibles",
            talent.cost, profile.talent_points
        )));
    }

    // Vérifier prérequis
    for req_id in &talent.requirements {
        if !profile.talents.contains(req_id) {
            return Err(TAPIError::validation(format!(
                "Prérequis manquant: {}",
                req_id
            )));
        }
    }

    // Débloquer
    profile.talents.push(talent_id.clone());
    profile.talent_points -= talent.cost;

    println!(
        "[EXP] Talent débloqué: {} (-{} points)",
        talent.name, talent.cost
    );

    Ok(profile.clone())
}

#[tauri::command]
pub fn exp_reset_talents(state: State<ExpEngineState>) -> Result<ExpProfile, TAPIError> {
    let mut profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] profile lock poisoned in exp_reset_talents, recovering");
            poisoned.into_inner()
        }
    };
    let talents_unlocked = profile.talents.len() as u32;

    profile.talents.clear();
    profile.talent_points += talents_unlocked;

    println!(
        "[EXP] Talents réinitialisés - +{} points récupérés",
        talents_unlocked
    );

    Ok(profile.clone())
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIQUE & STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn exp_get_history(
    category: Option<String>,
    limit: usize,
    state: State<ExpEngineState>,
) -> Result<Vec<ExpGain>, TAPIError> {
    let history = match state.history.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] history lock poisoned in exp_get_history, recovering");
            poisoned.into_inner()
        }
    };

    let filtered: Vec<ExpGain> = if let Some(cat) = category {
        history
            .iter()
            .filter(|g| g.category == cat)
            .cloned()
            .collect()
    } else {
        history.clone()
    };

    let start = if filtered.len() > limit {
        filtered.len() - limit
    } else {
        0
    };

    Ok(filtered[start..].to_vec())
}

#[tauri::command]
pub fn exp_get_category_stats(
    category: String,
    state: State<ExpEngineState>,
) -> Result<CategoryExp, TAPIError> {
    let profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] profile lock poisoned in exp_get_category_stats, recovering");
            poisoned.into_inner()
        }
    };
    profile
        .categories
        .get(&category)
        .cloned()
        .ok_or_else(|| TAPIError::not_found("Catégorie introuvable"))
}

#[tauri::command]
pub fn exp_get_total_contributions(state: State<ExpEngineState>) -> Result<u32, TAPIError> {
    let profile = match state.profile.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[EXP] profile lock poisoned in exp_get_total_contributions, recovering");
            poisoned.into_inner()
        }
    };
    let total: u32 = profile.categories.values().map(|c| c.contributions).sum();
    Ok(total)
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADERBOARD (Futur)
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaderboardEntry {
    pub username: String,
    pub level: u32,
    pub total_exp: u64,
    pub rank: u32,
}

#[tauri::command]
pub fn exp_get_leaderboard(
    _limit: usize,
    _state: State<ExpEngineState>,
) -> Result<Vec<LeaderboardEntry>, TAPIError> {
    // TODO: Implémenter système multi-utilisateurs
    Ok(vec![])
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS (Futur)
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Achievement {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub unlocked: bool,
    pub progress: f32, // 0.0-1.0
}

#[tauri::command]
pub fn exp_get_achievements(_state: State<ExpEngineState>) -> Result<Vec<Achievement>, TAPIError> {
    // TODO: Implémenter système d'achievements
    Ok(vec![])
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_else(|_| std::time::Duration::from_secs(0))
        .as_secs()
}
