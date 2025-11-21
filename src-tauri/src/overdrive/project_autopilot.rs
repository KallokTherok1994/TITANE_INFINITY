// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE PROJECT AUTOPILOT
// ═══════════════════════════════════════════════════════════════════════════
// Moteur de gestion intelligente de projets + autopilot nocturne
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub project_type: String,      // rust|node|python|mono|other
    pub status: String,             // active|paused|completed|archived
    pub priority: u8,               // 1-5
    pub created_at: u64,
    pub last_opened: u64,
    pub metadata: ProjectMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMetadata {
    pub tags: Vec<String>,
    pub description: String,
    pub dependencies: Vec<String>,
    pub total_files: usize,
    pub total_lines: usize,
    pub health_score: u8,          // 0-100
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub description: String,
    pub status: String,            // todo|in_progress|blocked|done
    pub priority: u8,              // 1-5
    pub estimated_hours: f32,
    pub dependencies: Vec<String>, // IDs autres tasks
    pub assigned_to: Option<String>,
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoPilotSuggestion {
    pub suggestion_type: String,   // optimize|refactor|test|doc|fix
    pub project_id: String,
    pub title: String,
    pub description: String,
    pub priority: u8,
    pub estimated_impact: f32,     // 0.0-1.0
    pub auto_executable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoPilotReport {
    pub execution_time: u64,
    pub projects_analyzed: usize,
    pub suggestions_generated: usize,
    pub actions_executed: usize,
    pub errors: Vec<String>,
}

pub struct ProjectAutoPilotState {
    projects: Arc<Mutex<HashMap<String, Project>>>,
    tasks: Arc<Mutex<Vec<Task>>>,
    suggestions: Arc<Mutex<Vec<AutoPilotSuggestion>>>,
    autopilot_enabled: Arc<Mutex<bool>>,
    autopilot_schedule: Arc<Mutex<String>>, // cron expression
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> ProjectAutoPilotState {
    ProjectAutoPilotState {
        projects: Arc::new(Mutex::new(HashMap::new())),
        tasks: Arc::new(Mutex::new(Vec::new())),
        suggestions: Arc::new(Mutex::new(Vec::new())),
        autopilot_enabled: Arc::new(Mutex::new(false)),
        autopilot_schedule: Arc::new(Mutex::new("0 3 * * *".to_string())), // 3h du matin
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION PROJETS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn project_add(
    name: String,
    path: String,
    project_type: String,
    state: State<ProjectAutoPilotState>,
) -> Result<Project, String> {
    let project_id = uuid::Uuid::new_v4().to_string();

    let project = Project {
        id: project_id.clone(),
        name: name.clone(),
        path: PathBuf::from(path),
        project_type: project_type.clone(),
        status: "active".to_string(),
        priority: 3,
        created_at: get_timestamp(),
        last_opened: get_timestamp(),
        metadata: ProjectMetadata {
            tags: vec![],
            description: String::new(),
            dependencies: vec![],
            total_files: 0,
            total_lines: 0,
            health_score: 100,
        },
    };

    let mut projects = state.projects.lock().unwrap();
    projects.insert(project_id.clone(), project.clone());

    println!("[PROJECT] Projet ajouté: {} [{}]", name, project_type);

    Ok(project)
}

#[tauri::command]
pub fn project_list(state: State<ProjectAutoPilotState>) -> Result<Vec<Project>, String> {
    let projects = state.projects.lock().unwrap();
    let mut list: Vec<Project> = projects.values().cloned().collect();

    // Trier par last_opened (plus récents en premier)
    list.sort_by(|a, b| b.last_opened.cmp(&a.last_opened));

    Ok(list)
}

#[tauri::command]
pub fn project_get(
    project_id: String,
    state: State<ProjectAutoPilotState>,
) -> Result<Project, String> {
    let projects = state.projects.lock().unwrap();
    projects
        .get(&project_id)
        .cloned()
        .ok_or("Projet introuvable".to_string())
}

#[tauri::command]
pub fn project_update(
    project: Project,
    state: State<ProjectAutoPilotState>,
) -> Result<Project, String> {
    let mut projects = state.projects.lock().unwrap();
    let id = project.id.clone();
    projects.insert(id.clone(), project.clone());
    Ok(project)
}

#[tauri::command]
pub fn project_delete(
    project_id: String,
    state: State<ProjectAutoPilotState>,
) -> Result<String, String> {
    let mut projects = state.projects.lock().unwrap();
    projects.remove(&project_id);

    // Supprimer tasks associées
    let mut tasks = state.tasks.lock().unwrap();
    tasks.retain(|t| t.project_id != project_id);

    Ok("Projet supprimé".to_string())
}

#[tauri::command]
pub fn project_analyze(
    project_id: String,
    state: State<ProjectAutoPilotState>,
) -> Result<ProjectMetadata, String> {
    let mut projects = state.projects.lock().unwrap();
    let project = projects
        .get_mut(&project_id)
        .ok_or("Projet introuvable")?;

    println!("[PROJECT] Analyse: {}", project.name);

    // TODO: Analyser le projet
    // - Compter fichiers
    // - Compter lignes
    // - Détecter dépendances
    // - Calculer santé (build ok, tests ok, etc.)

    let metadata = ProjectMetadata {
        tags: vec!["analyzed".to_string()],
        description: project.metadata.description.clone(),
        dependencies: detect_dependencies(&project.path),
        total_files: count_files(&project.path),
        total_lines: count_lines(&project.path),
        health_score: calculate_health(&project.path),
    };

    project.metadata = metadata.clone();

    Ok(metadata)
}

fn detect_dependencies(path: &PathBuf) -> Vec<String> {
    // TODO: Parser package.json, Cargo.toml, requirements.txt
    vec![]
}

fn count_files(path: &PathBuf) -> usize {
    // TODO: Compter récursivement
    0
}

fn count_lines(path: &PathBuf) -> usize {
    // TODO: Compter lignes de code
    0
}

fn calculate_health(path: &PathBuf) -> u8 {
    // TODO: Vérifier build, tests, linting
    85
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION TÂCHES
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn task_create(
    project_id: String,
    title: String,
    description: String,
    state: State<ProjectAutoPilotState>,
) -> Result<Task, String> {
    let task_id = uuid::Uuid::new_v4().to_string();

    let task = Task {
        id: task_id.clone(),
        project_id: project_id.clone(),
        title: title.clone(),
        description,
        status: "todo".to_string(),
        priority: 3,
        estimated_hours: 0.0,
        dependencies: vec![],
        assigned_to: None,
        created_at: get_timestamp(),
        completed_at: None,
    };

    let mut tasks = state.tasks.lock().unwrap();
    tasks.push(task.clone());

    println!("[PROJECT] Tâche créée: {} [{}]", title, project_id);

    Ok(task)
}

#[tauri::command]
pub fn task_list(
    project_id: Option<String>,
    state: State<ProjectAutoPilotState>,
) -> Result<Vec<Task>, String> {
    let tasks = state.tasks.lock().unwrap();

    let filtered: Vec<Task> = if let Some(pid) = project_id {
        tasks.iter()
            .filter(|t| t.project_id == pid)
            .cloned()
            .collect()
    } else {
        tasks.clone()
    };

    Ok(filtered)
}

#[tauri::command]
pub fn task_update_status(
    task_id: String,
    new_status: String,
    state: State<ProjectAutoPilotState>,
) -> Result<Task, String> {
    let mut tasks = state.tasks.lock().unwrap();
    let task = tasks
        .iter_mut()
        .find(|t| t.id == task_id)
        .ok_or("Tâche introuvable")?;

    task.status = new_status.clone();

    if new_status == "done" {
        task.completed_at = Some(get_timestamp());
    }

    Ok(task.clone())
}

#[tauri::command]
pub fn task_delete(task_id: String, state: State<ProjectAutoPilotState>) -> Result<String, String> {
    let mut tasks = state.tasks.lock().unwrap();
    tasks.retain(|t| t.id != task_id);
    Ok("Tâche supprimée".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTOPILOT
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn autopilot_run(state: State<ProjectAutoPilotState>) -> Result<AutoPilotReport, String> {
    let start = std::time::Instant::now();

    println!("[AUTOPILOT] Démarrage analyse complète...");

    let projects = state.projects.lock().unwrap();
    let projects_count = projects.len();

    let mut suggestions = Vec::new();
    let mut actions_executed = 0;
    let mut errors = Vec::new();

    // Analyser chaque projet
    for (_id, project) in projects.iter() {
        match analyze_project_for_suggestions(project) {
            Ok(mut sug) => suggestions.append(&mut sug),
            Err(e) => errors.push(format!("{}: {}", project.name, e)),
        }
    }

    // Exécuter suggestions auto-exécutables
    for suggestion in &suggestions {
        if suggestion.auto_executable {
            match execute_suggestion(suggestion) {
                Ok(_) => actions_executed += 1,
                Err(e) => errors.push(format!("Échec {}: {}", suggestion.title, e)),
            }
        }
    }

    // Stocker suggestions
    let mut state_suggestions = state.suggestions.lock().unwrap();
    *state_suggestions = suggestions.clone();

    let execution_time = start.elapsed().as_secs();

    println!(
        "[AUTOPILOT] Terminé en {}s - {} suggestions, {} actions",
        execution_time,
        suggestions.len(),
        actions_executed
    );

    Ok(AutoPilotReport {
        execution_time,
        projects_analyzed: projects_count,
        suggestions_generated: suggestions.len(),
        actions_executed,
        errors,
    })
}

fn analyze_project_for_suggestions(project: &Project) -> Result<Vec<AutoPilotSuggestion>, String> {
    let mut suggestions = Vec::new();

    // Suggestion: Optimisation si santé < 70
    if project.metadata.health_score < 70 {
        suggestions.push(AutoPilotSuggestion {
            suggestion_type: "optimize".to_string(),
            project_id: project.id.clone(),
            title: format!("Optimiser {}", project.name),
            description: "Santé du projet faible - corrections recommandées".to_string(),
            priority: 4,
            estimated_impact: 0.7,
            auto_executable: false,
        });
    }

    // Suggestion: Tests si fichiers > 100 et pas de tests
    if project.metadata.total_files > 100 {
        suggestions.push(AutoPilotSuggestion {
            suggestion_type: "test".to_string(),
            project_id: project.id.clone(),
            title: format!("Ajouter tests pour {}", project.name),
            description: "Projet large sans couverture tests".to_string(),
            priority: 3,
            estimated_impact: 0.5,
            auto_executable: false,
        });
    }

    Ok(suggestions)
}

fn execute_suggestion(suggestion: &AutoPilotSuggestion) -> Result<String, String> {
    println!("[AUTOPILOT] Exécution: {}", suggestion.title);

    // TODO: Implémenter exécution selon type
    match suggestion.suggestion_type.as_str() {
        "optimize" => {
            // Lancer auto-fix
            Ok("Optimisation lancée".to_string())
        }
        "refactor" => {
            // Suggérer refactoring
            Ok("Refactoring suggéré".to_string())
        }
        _ => Ok("Action non implémentée".to_string()),
    }
}

#[tauri::command]
pub fn autopilot_get_suggestions(
    state: State<ProjectAutoPilotState>,
) -> Result<Vec<AutoPilotSuggestion>, String> {
    let suggestions = state.suggestions.lock().unwrap();
    Ok(suggestions.clone())
}

#[tauri::command]
pub fn autopilot_enable(enabled: bool, state: State<ProjectAutoPilotState>) -> Result<String, String> {
    let mut autopilot_enabled = state.autopilot_enabled.lock().unwrap();
    *autopilot_enabled = enabled;

    println!("[AUTOPILOT] {}", if enabled { "Activé" } else { "Désactivé" });

    Ok(if enabled {
        "AutoPilot activé".to_string()
    } else {
        "AutoPilot désactivé".to_string()
    })
}

#[tauri::command]
pub fn autopilot_get_schedule(state: State<ProjectAutoPilotState>) -> Result<String, String> {
    let schedule = state.autopilot_schedule.lock().unwrap();
    Ok(schedule.clone())
}

#[tauri::command]
pub fn autopilot_set_schedule(
    cron: String,
    state: State<ProjectAutoPilotState>,
) -> Result<String, String> {
    let mut schedule = state.autopilot_schedule.lock().unwrap();
    *schedule = cron.clone();
    Ok(format!("Schedule mis à jour: {}", cron))
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
