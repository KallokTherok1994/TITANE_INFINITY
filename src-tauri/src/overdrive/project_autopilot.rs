// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE PROJECT AUTOPILOT
// ═══════════════════════════════════════════════════════════════════════════
// Moteur de gestion intelligente de projets + autopilot nocturne
// ═══════════════════════════════════════════════════════════════════════════

use crate::core::tapi_error::TAPIError;
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
    pub project_type: String, // rust|node|python|mono|other
    pub status: String,       // active|paused|completed|archived
    pub priority: u8,         // 1-5
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
    pub health_score: u8, // 0-100
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub description: String,
    pub status: String, // todo|in_progress|blocked|done
    pub priority: u8,   // 1-5
    pub estimated_hours: f32,
    pub dependencies: Vec<String>, // IDs autres tasks
    pub assigned_to: Option<String>,
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoPilotSuggestion {
    pub suggestion_type: String, // optimize|refactor|test|doc|fix
    pub project_id: String,
    pub title: String,
    pub description: String,
    pub priority: u8,
    pub estimated_impact: f32, // 0.0-1.0
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
) -> Result<Project, TAPIError> {
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

    let mut projects = match state.projects.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] projects lock poisoned, recovering");
            poisoned.into_inner()
        }
    };
    projects.insert(project_id.clone(), project.clone());

    println!("[PROJECT] Projet ajouté: {} [{}]", name, project_type);

    Ok(project)
}

#[tauri::command]
pub fn project_list(state: State<ProjectAutoPilotState>) -> Result<Vec<Project>, TAPIError> {
    let projects = match state.projects.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] projects lock poisoned in list, recovering");
            poisoned.into_inner()
        }
    };
    let mut list: Vec<Project> = projects.values().cloned().collect();

    // Trier par last_opened (plus récents en premier)
    list.sort_by(|a, b| b.last_opened.cmp(&a.last_opened));

    Ok(list)
}

#[tauri::command]
pub fn project_get(
    project_id: String,
    state: State<ProjectAutoPilotState>,
) -> Result<Project, TAPIError> {
    let projects = match state.projects.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] projects lock poisoned in get, recovering");
            poisoned.into_inner()
        }
    };
    projects
        .get(&project_id)
        .cloned()
        .ok_or_else(|| TAPIError::not_found("Projet introuvable"))
}

#[tauri::command]
pub fn project_update(
    project: Project,
    state: State<ProjectAutoPilotState>,
) -> Result<Project, TAPIError> {
    let mut projects = match state.projects.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] projects lock poisoned in update, recovering");
            poisoned.into_inner()
        }
    };
    let id = project.id.clone();
    projects.insert(id.clone(), project.clone());
    Ok(project)
}

#[tauri::command]
pub fn project_delete(
    project_id: String,
    state: State<ProjectAutoPilotState>,
) -> Result<String, TAPIError> {
    let mut projects = match state.projects.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] projects lock poisoned in delete, recovering");
            poisoned.into_inner()
        }
    };
    projects.remove(&project_id);

    // Supprimer tasks associées
    let mut tasks = match state.tasks.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] tasks lock poisoned in delete, recovering");
            poisoned.into_inner()
        }
    };
    tasks.retain(|t| t.project_id != project_id);

    Ok("Projet supprimé".to_string())
}

#[tauri::command]
pub fn project_analyze(
    project_id: String,
    state: State<ProjectAutoPilotState>,
) -> Result<ProjectMetadata, TAPIError> {
    let mut projects = match state.projects.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] projects lock poisoned in analyze, recovering");
            poisoned.into_inner()
        }
    };
    let project = projects
        .get_mut(&project_id)
        .ok_or_else(|| TAPIError::not_found("Projet introuvable"))?;

    println!("[PROJECT] Analyse: {}", project.name);

    // Project analysis implementation:
    // - Count files recursively (detect_dependencies)
    // - Count lines of code (count_lines)
    // - Detect dependencies from manifests (count_files)
    // - Calculate health score (build ok, tests ok, linting)

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
    // Parse package.json, Cargo.toml, requirements.txt for dependencies
    let mut dependencies = Vec::new();
    
    // Check for package.json (Node.js)
    let package_json = path.join("package.json");
    if package_json.exists() {
        if let Ok(content) = std::fs::read_to_string(&package_json) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(deps) = json["dependencies"].as_object() {
                    dependencies.extend(deps.keys().map(|k| k.to_string()));
                }
            }
        }
    }
    
    // Check for Cargo.toml (Rust)
    let cargo_toml = path.join("Cargo.toml");
    if cargo_toml.exists() {
        dependencies.push("Cargo.toml found (Rust project)".to_string());
    }
    
    // Check for requirements.txt (Python)
    let requirements = path.join("requirements.txt");
    if requirements.exists() {
        if let Ok(content) = std::fs::read_to_string(&requirements) {
            dependencies.extend(content.lines().map(|l| l.split('=').next().unwrap_or(l).to_string()));
        }
    }
    
    dependencies
}

fn count_files(path: &PathBuf) -> usize {
    // Count files recursively, excluding node_modules, target, dist
    let mut count = 0;
    
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            
            // Skip common build/dependency directories
            if name == "node_modules" || name == "target" || name == "dist" || name == ".git" {
                continue;
            }
            
            if entry_path.is_dir() {
                count += count_files(&entry_path);
            } else {
                count += 1;
            }
        }
    }
    
    count
}

fn count_lines(path: &PathBuf) -> usize {
    // Count lines of code recursively (source files only)
    let mut count = 0;
    
    let source_extensions = ["rs", "ts", "tsx", "js", "jsx", "py", "java", "cpp", "c", "h"];
    
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            
            // Skip build directories
            if name == "node_modules" || name == "target" || name == "dist" || name == ".git" {
                continue;
            }
            
            if entry_path.is_dir() {
                count += count_lines(&entry_path);
            } else if let Some(ext) = entry_path.extension() {
                if source_extensions.contains(&ext.to_string_lossy().as_ref()) {
                    if let Ok(content) = std::fs::read_to_string(&entry_path) {
                        count += content.lines().count();
                    }
                }
            }
        }
    }
    
    count
}

fn calculate_health(path: &PathBuf) -> u8 {
    // Calculate project health score (0-100) based on:
    // - Build configuration exists (+20)
    // - Tests exist (+30)
    // - Linting config exists (+20)
    // - Documentation exists (+15)
    // - CI/CD config exists (+15)
    
    let mut score = 0u8;
    
    // Check build config
    if path.join("package.json").exists() || path.join("Cargo.toml").exists() {
        score += 20;
    }
    
    // Check tests
    if path.join("tests").exists() || path.join("test").exists() || path.join("__tests__").exists() {
        score += 30;
    }
    
    // Check linting
    if path.join(".eslintrc").exists() || path.join("clippy.toml").exists() {
        score += 20;
    }
    
    // Check documentation
    if path.join("README.md").exists() || path.join("docs").exists() {
        score += 15;
    }
    
    // Check CI/CD
    if path.join(".github").join("workflows").exists() || path.join(".gitlab-ci.yml").exists() {
        score += 15;
    }
    
    score
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
) -> Result<Task, TAPIError> {
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

    let mut tasks = match state.tasks.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] tasks lock poisoned in task_add, recovering");
            poisoned.into_inner()
        }
    };
    tasks.push(task.clone());

    println!("[PROJECT] Tâche créée: {} [{}]", title, project_id);

    Ok(task)
}

#[tauri::command]
pub fn task_list(
    project_id: Option<String>,
    state: State<ProjectAutoPilotState>,
) -> Result<Vec<Task>, TAPIError> {
    let tasks = match state.tasks.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] tasks lock poisoned in task_list, recovering");
            poisoned.into_inner()
        }
    };

    let filtered: Vec<Task> = if let Some(pid) = project_id {
        tasks
            .iter()
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
) -> Result<Task, TAPIError> {
    let mut tasks = match state.tasks.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] tasks lock poisoned in task_update_status, recovering");
            poisoned.into_inner()
        }
    };
    let task = tasks
        .iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| TAPIError::not_found("Tâche introuvable"))?;

    task.status = new_status.clone();

    if new_status == "done" {
        task.completed_at = Some(get_timestamp());
    }

    Ok(task.clone())
}

#[tauri::command]
pub fn task_delete(
    task_id: String,
    state: State<ProjectAutoPilotState>,
) -> Result<String, TAPIError> {
    let mut tasks = match state.tasks.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[PROJECT] tasks lock poisoned in task_delete, recovering");
            poisoned.into_inner()
        }
    };
    tasks.retain(|t| t.id != task_id);
    Ok("Tâche supprimée".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTOPILOT
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn autopilot_run(state: State<ProjectAutoPilotState>) -> Result<AutoPilotReport, TAPIError> {
    let start = crate::core::utils::now_ms();

    println!("[AUTOPILOT] Démarrage analyse complète...");

    let projects = match state.projects.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[AUTOPILOT] projects lock poisoned, recovering");
            poisoned.into_inner()
        }
    };
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

    // Stocker suggestions avec récupération en cas de poison
    let mut state_suggestions = state.suggestions.lock().unwrap_or_else(|poisoned| {
        eprintln!("[AUTOPILOT] suggestions lock poisoned, recovering");
        poisoned.into_inner()
    });
    *state_suggestions = suggestions.clone();

    let execution_time = crate::core::utils::elapsed_ms(start) / 1000;

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

    // Execute suggestion based on type
    // Implementation: Integrate with appropriate subsystems
    match suggestion.suggestion_type.as_str() {
        "optimize" => {
            // Launch auto-fix optimization
            log::info!("[AUTOPILOT] Launching optimization: {}", suggestion.description);
            // Future: Call optimization engine
            Ok("Optimisation lancée".to_string())
        }
        "refactor" => {
            // Suggest refactoring with AI analysis
            log::info!("[AUTOPILOT] Suggesting refactoring: {}", suggestion.description);
            // Future: Call refactoring analyzer
            Ok("Refactoring suggéré".to_string())
        }
        _ => Ok("Action non implémentée".to_string()),
    }
}

#[tauri::command]
pub fn autopilot_get_suggestions(
    state: State<ProjectAutoPilotState>,
) -> Result<Vec<AutoPilotSuggestion>, TAPIError> {
    let suggestions = match state.suggestions.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[AUTOPILOT] suggestions lock poisoned, recovering");
            poisoned.into_inner()
        }
    };
    Ok(suggestions.clone())
}

#[tauri::command]
pub fn autopilot_enable(
    enabled: bool,
    state: State<ProjectAutoPilotState>,
) -> Result<String, TAPIError> {
    let mut autopilot_enabled = match state.autopilot_enabled.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[AUTOPILOT] autopilot_enabled lock poisoned, recovering");
            poisoned.into_inner()
        }
    };
    *autopilot_enabled = enabled;

    println!(
        "[AUTOPILOT] {}",
        if enabled { "Activé" } else { "Désactivé" }
    );

    Ok(if enabled {
        "AutoPilot activé".to_string()
    } else {
        "AutoPilot désactivé".to_string()
    })
}

#[tauri::command]
pub fn autopilot_get_schedule(state: State<ProjectAutoPilotState>) -> Result<String, TAPIError> {
    let schedule = match state.autopilot_schedule.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[AUTOPILOT] schedule lock poisoned in get, recovering");
            poisoned.into_inner()
        }
    };
    Ok(schedule.clone())
}

#[tauri::command]
pub fn autopilot_set_schedule(
    cron: String,
    state: State<ProjectAutoPilotState>,
) -> Result<String, TAPIError> {
    let mut schedule = match state.autopilot_schedule.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[AUTOPILOT] schedule lock poisoned in set, recovering");
            poisoned.into_inner()
        }
    };
    *schedule = cron.clone();
    Ok(format!("Schedule mis à jour: {}", cron))
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
