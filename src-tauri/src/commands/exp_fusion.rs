// 🎮 Tauri Commands — EXP Fusion Engine
// Exposition du système EXP au frontend React

use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use tauri::State;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalExpState {
    pub total_exp: u64,
    pub level: u32,
    pub exp_to_next_level: u64,
    pub exp_current_level: u64,
    pub level_progress: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryState {
    pub category: String,
    pub icon: String,
    pub color: String,
    pub total_exp: u64,
    pub level: u32,
    pub exp_to_next_level: u64,
    pub exp_current_level: u64,
    pub progress: f32,
    pub knowledge_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectState {
    pub name: String,
    pub icon: String,
    pub total_exp: u64,
    pub level: u32,
    pub exp_to_next_level: u64,
    pub exp_current_level: u64,
    pub progress: f32,
    pub categories: HashMap<String, u64>,
    pub knowledge_count: u32,
    pub created_at: String,
    pub last_updated: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectStats {
    pub total_projects: u32,
    pub total_exp: u64,
    pub avg_level: f32,
    pub most_active: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TalentTreeState {
    pub branches: HashMap<String, serde_json::Value>,
    pub total_unlocked: u32,
    pub total_talents: u32,
    pub global_effects: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEntry {
    pub timestamp: u64,
    pub exp_gained: u64,
    pub category: String,
    pub project: Option<String>,
    pub description: String,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineStats {
    pub days: u32,
    pub total_exp: u64,
    pub event_count: usize,
    pub avg_exp: u64,
    pub peak_exp: u64,
    pub active_categories: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpEvent {
    pub timestamp: u64,
    pub amount: u64,
    pub category: String,
    pub project: Option<String>,
    pub description: String,
    pub source: String,
}

#[derive(Debug, Clone)]
struct CategoryMeta {
    icon: &'static str,
    color: &'static str,
}

fn category_meta(category: &str) -> CategoryMeta {
    match category {
        "Cognition" => CategoryMeta {
            icon: "🧠",
            color: "#93b399",
        },
        "Architecture" => CategoryMeta {
            icon: "🏗️",
            color: "#727b81",
        },
        "Frontend" => CategoryMeta {
            icon: "⚛️",
            color: "#8aa4c7",
        },
        "Backend" => CategoryMeta {
            icon: "🦀",
            color: "#c7926b",
        },
        "Audio" => CategoryMeta {
            icon: "🎙️",
            color: "#b392c7",
        },
        _ => CategoryMeta {
            icon: "✨",
            color: "#727b81",
        },
    }
}

#[derive(Debug, Clone)]
struct ExpFusionEngine {
    total_exp: u64,
    category_exp: HashMap<String, u64>,
    category_knowledge: HashMap<String, u32>,
    projects: HashMap<String, ProjectStateInternal>,
    timeline: Vec<TimelineEntry>,
}

#[derive(Debug, Clone)]
struct ProjectStateInternal {
    icon: String,
    total_exp: u64,
    categories: HashMap<String, u64>,
    knowledge_count: u32,
    created_at: String,
    last_updated: String,
}

impl ExpFusionEngine {
    fn new() -> Self {
        let now = Utc::now().to_rfc3339();
        let mut projects = HashMap::new();
        projects.insert(
            "TITANE∞ Core".to_string(),
            ProjectStateInternal {
                icon: "🧩".to_string(),
                total_exp: 250,
                categories: HashMap::from([
                    ("Architecture".to_string(), 120),
                    ("Backend".to_string(), 130),
                ]),
                knowledge_count: 3,
                created_at: now.clone(),
                last_updated: now.clone(),
            },
        );
        projects.insert(
            "UI/UX".to_string(),
            ProjectStateInternal {
                icon: "🎨".to_string(),
                total_exp: 140,
                categories: HashMap::from([("Frontend".to_string(), 140)]),
                knowledge_count: 2,
                created_at: now.clone(),
                last_updated: now.clone(),
            },
        );

        Self {
            total_exp: 390,
            category_exp: HashMap::from([
                ("Architecture".to_string(), 120),
                ("Backend".to_string(), 130),
                ("Frontend".to_string(), 140),
            ]),
            category_knowledge: HashMap::from([
                ("Architecture".to_string(), 1),
                ("Backend".to_string(), 2),
                ("Frontend".to_string(), 2),
            ]),
            projects,
            timeline: Vec::new(),
        }
    }

    fn level_from_exp(total_exp: u64) -> u32 {
        (total_exp / 500) as u32 + 1
    }

    fn progress_for_exp(total_exp: u64) -> (u32, u64, u64, f32) {
        let level = Self::level_from_exp(total_exp);
        let current_level_start = (level as u64 - 1) * 500;
        let exp_to_next_level = 500u64;
        let exp_current_level = total_exp.saturating_sub(current_level_start);
        let level_progress = (exp_current_level as f32 / exp_to_next_level as f32).clamp(0.0, 1.0);
        (level, exp_to_next_level, exp_current_level, level_progress)
    }

    fn get_global_state(&self) -> GlobalExpState {
        let (level, exp_to_next_level, exp_current_level, level_progress) =
            Self::progress_for_exp(self.total_exp);
        GlobalExpState {
            total_exp: self.total_exp,
            level,
            exp_to_next_level,
            exp_current_level,
            level_progress,
        }
    }

    fn get_categories(&self) -> Vec<CategoryState> {
        let mut out = Vec::new();
        for (category, total_exp) in self.category_exp.iter() {
            let meta = category_meta(category);
            let (level, exp_to_next_level, exp_current_level, progress) =
                Self::progress_for_exp(*total_exp);
            let knowledge_count = *self.category_knowledge.get(category).unwrap_or(&0);
            out.push(CategoryState {
                category: category.clone(),
                icon: meta.icon.to_string(),
                color: meta.color.to_string(),
                total_exp: *total_exp,
                level,
                exp_to_next_level,
                exp_current_level,
                progress,
                knowledge_count,
            });
        }
        out.sort_by(|a, b| b.total_exp.cmp(&a.total_exp));
        out
    }

    fn get_projects(&self) -> Vec<ProjectState> {
        let mut out = Vec::new();
        for (name, proj) in self.projects.iter() {
            let (level, exp_to_next_level, exp_current_level, progress) =
                Self::progress_for_exp(proj.total_exp);
            out.push(ProjectState {
                name: name.clone(),
                icon: proj.icon.clone(),
                total_exp: proj.total_exp,
                level,
                exp_to_next_level,
                exp_current_level,
                progress,
                categories: proj.categories.clone(),
                knowledge_count: proj.knowledge_count,
                created_at: proj.created_at.clone(),
                last_updated: proj.last_updated.clone(),
            });
        }
        out.sort_by(|a, b| b.total_exp.cmp(&a.total_exp));
        out
    }

    fn get_talents(&self) -> TalentTreeState {
        TalentTreeState {
            branches: HashMap::new(),
            total_unlocked: 0,
            total_talents: 0,
            global_effects: Vec::new(),
        }
    }

    fn get_timeline(&self, days: u32) -> Vec<TimelineEntry> {
        let cutoff = Utc::now()
            .timestamp()
            .saturating_sub((days as i64) * 24 * 60 * 60) as u64;
        self.timeline
            .iter()
            .filter(|e| e.timestamp >= cutoff)
            .cloned()
            .collect()
    }

    fn gain_exp(
        &mut self,
        amount: u64,
        source: &str,
        category: &str,
        project: Option<&str>,
        description: &str,
    ) -> ExpEvent {
        let timestamp = Utc::now().timestamp() as u64;
        self.total_exp = self.total_exp.saturating_add(amount);

        *self.category_exp.entry(category.to_string()).or_insert(0) += amount;

        if source == "Knowledge" {
            *self
                .category_knowledge
                .entry(category.to_string())
                .or_insert(0) += 1;
        }

        let project_name = project.unwrap_or("General");
        let now = Utc::now().to_rfc3339();
        let proj = self.projects.entry(project_name.to_string()).or_insert_with(|| {
            ProjectStateInternal {
                icon: "📌".to_string(),
                total_exp: 0,
                categories: HashMap::new(),
                knowledge_count: 0,
                created_at: now.clone(),
                last_updated: now.clone(),
            }
        });
        proj.total_exp = proj.total_exp.saturating_add(amount);
        *proj.categories.entry(category.to_string()).or_insert(0) += amount;
        if source == "Knowledge" {
            proj.knowledge_count += 1;
        }
        proj.last_updated = now;

        let timeline_entry = TimelineEntry {
            timestamp,
            exp_gained: amount,
            category: category.to_string(),
            project: project.map(|p| p.to_string()),
            description: description.to_string(),
            source: source.to_string(),
        };
        self.timeline.push(timeline_entry);

        ExpEvent {
            timestamp,
            amount,
            category: category.to_string(),
            project: project.map(|p| p.to_string()),
            description: description.to_string(),
            source: source.to_string(),
        }
    }

    fn project_stats(&self) -> ProjectStats {
        let projects = self.get_projects();
        let total_projects = projects.len() as u32;
        let total_exp: u64 = projects.iter().map(|p| p.total_exp).sum();
        let avg_level = if total_projects > 0 {
            projects.iter().map(|p| p.level as u32).sum::<u32>() as f32 / total_projects as f32
        } else {
            0.0
        };
        let most_active = projects.first().map(|p| p.name.clone());
        ProjectStats {
            total_projects,
            total_exp,
            avg_level,
            most_active,
        }
    }
}

/// État global partagé
pub struct ExpFusionState {
    engine: RwLock<ExpFusionEngine>,
}

impl ExpFusionState {
    pub fn new() -> Self {
        Self {
            engine: RwLock::new(ExpFusionEngine::new()),
        }
    }
}

/// Obtenir état global XP
#[tauri::command]
pub async fn exp_get_global_state(state: State<'_, ExpFusionState>) -> Result<GlobalExpState, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_global_state())
}

/// Obtenir toutes les catégories
#[tauri::command]
pub async fn exp_get_categories(state: State<'_, ExpFusionState>) -> Result<Vec<CategoryState>, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_categories())
}

/// Obtenir tous les projets
#[tauri::command]
pub async fn exp_get_projects(state: State<'_, ExpFusionState>) -> Result<Vec<ProjectState>, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_projects())
}

/// Obtenir statistiques projets
#[tauri::command]
pub async fn exp_get_project_stats(state: State<'_, ExpFusionState>) -> Result<ProjectStats, String> {
    let engine = state.engine.read().await;
    Ok(engine.project_stats())
}

/// Obtenir arbre de talents
#[tauri::command]
pub async fn exp_get_talents(state: State<'_, ExpFusionState>) -> Result<TalentTreeState, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_talents())
}

/// Obtenir timeline (N derniers jours)
#[tauri::command]
pub async fn exp_get_timeline(state: State<'_, ExpFusionState>, days: u32) -> Result<Vec<TimelineEntry>, String> {
    let engine = state.engine.read().await;
    Ok(engine.get_timeline(days))
}

/// Obtenir statistiques timeline
#[tauri::command]
pub async fn exp_get_timeline_stats(state: State<'_, ExpFusionState>, days: u32) -> Result<TimelineStats, String> {
    let engine = state.engine.read().await;
    let timeline = engine.get_timeline(days);

    let total_exp: u64 = timeline.iter().map(|e| e.exp_gained).sum();
    let event_count = timeline.len();
    let peak_exp = timeline.iter().map(|e| e.exp_gained).max().unwrap_or(0);
    let active_categories = timeline
        .iter()
        .map(|e| e.category.clone())
        .collect::<HashSet<_>>()
        .len();

    Ok(TimelineStats {
        days,
        total_exp,
        event_count,
        avg_exp: if event_count > 0 {
            total_exp / event_count as u64
        } else {
            0
        },
        peak_exp,
        active_categories,
    })
}

/// Ajouter connaissance (déclenche XP)
#[tauri::command]
pub async fn exp_add_knowledge(
    state: State<'_, ExpFusionState>,
    data: String,
    category: String,
    project: Option<String>,
    description: String,
) -> Result<ExpEvent, String> {
    let mut engine = state.engine.write().await;

    // Calculer XP basé sur la taille/complexité
    let base_exp = (data.len() / 100).clamp(1, 100) as u64;
    Ok(engine.gain_exp(
        base_exp,
        "Knowledge",
        &category,
        project.as_deref(),
        &description,
    ))
}
