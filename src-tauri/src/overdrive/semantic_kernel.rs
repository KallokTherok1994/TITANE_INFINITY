// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE SEMANTIC KERNEL
// ═══════════════════════════════════════════════════════════════════════════
// Kernel sémantique pour compréhension avancée et génération contextuelle
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticSkill {
    pub name: String,
    pub description: String,
    pub prompt_template: String,
    pub input_variables: Vec<String>,
    pub examples: Vec<SkillExample>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillExample {
    pub input: HashMap<String, String>,
    pub output: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticRequest {
    pub skill_name: String,
    pub inputs: HashMap<String, String>,
    pub context: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticResponse {
    pub skill_name: String,
    pub output: String,
    pub confidence: f32,
    pub latency_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntentAnalysis {
    pub intent: String,
    pub confidence: f32,
    pub entities: HashMap<String, String>,
    pub suggested_skill: Option<String>,
}

pub struct SemanticKernelState {
    skills: RwLock<HashMap<String, SemanticSkill>>,
    intent_cache: RwLock<HashMap<String, IntentAnalysis>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> SemanticKernelState {
    let state = SemanticKernelState {
        skills: RwLock::new(HashMap::new()),
        intent_cache: RwLock::new(HashMap::new()),
    };

    // Charger skills par défaut (bloquer pour init synchrone)
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        load_default_skills(&state).await;
    });

    state
}

async fn load_default_skills(state: &SemanticKernelState) {
    let mut skills = state.skills.write().await;

    // Skill: Summarization
    skills.insert(
        "summarize".to_string(),
        SemanticSkill {
            name: "summarize".to_string(),
            description: "Résume un texte long en conservant les points clés".to_string(),
            prompt_template: "Résume le texte suivant de manière concise :\n\n{{$input}}\n\nRésumé:".to_string(),
            input_variables: vec!["input".to_string()],
            examples: vec![],
            enabled: true,
        },
    );

    // Skill: Code Generation
    skills.insert(
        "generate_code".to_string(),
        SemanticSkill {
            name: "generate_code".to_string(),
            description: "Génère du code à partir d'une description".to_string(),
            prompt_template: "Génère du code {{$language}} pour : {{$task}}\n\nCode:".to_string(),
            input_variables: vec!["language".to_string(), "task".to_string()],
            examples: vec![],
            enabled: true,
        },
    );

    // Skill: Sentiment Analysis
    skills.insert(
        "analyze_sentiment".to_string(),
        SemanticSkill {
            name: "analyze_sentiment".to_string(),
            description: "Analyse le sentiment d'un texte".to_string(),
            prompt_template: "Analyse le sentiment du texte suivant (positif/neutre/négatif) :\n\n{{$text}}\n\nSentiment:".to_string(),
            input_variables: vec!["text".to_string()],
            examples: vec![],
            enabled: true,
        },
    );

    // Skill: Translation
    skills.insert(
        "translate".to_string(),
        SemanticSkill {
            name: "translate".to_string(),
            description: "Traduit un texte d'une langue à une autre".to_string(),
            prompt_template: "Traduis le texte suivant de {{$from}} vers {{$to}} :\n\n{{$text}}\n\nTraduction:".to_string(),
            input_variables: vec!["from".to_string(), "to".to_string(), "text".to_string()],
            examples: vec![],
            enabled: true,
        },
    );

    // Skill: Intent Recognition
    skills.insert(
        "recognize_intent".to_string(),
        SemanticSkill {
            name: "recognize_intent".to_string(),
            description: "Identifie l'intention derrière une requête utilisateur".to_string(),
            prompt_template: "Identifie l'intention de l'utilisateur dans : {{$query}}\n\nIntention:".to_string(),
            input_variables: vec!["query".to_string()],
            examples: vec![],
            enabled: true,
        },
    );

    println!("[SEMANTIC] {} skills chargés", skills.len());
}

// ─────────────────────────────────────────────────────────────────────────────
// EXÉCUTION SKILLS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn semantic_execute_skill(
    request: SemanticRequest,
    state: State<'_, SemanticKernelState>,
) -> Result<SemanticResponse, String> {
    let start = std::time::Instant::now();

    println!("[SEMANTIC] Exécution skill: {}", request.skill_name);

    // Récupérer le skill
    let skill = {
        let skills = state.skills.read().await;
        skills
            .get(&request.skill_name)
            .ok_or("Skill introuvable")?
            .clone()
    };

    if !skill.enabled {
        return Err("Skill désactivé".to_string());
    }

    // Construire prompt
    let prompt = build_prompt(&skill, &request)?;

    // Exécuter via Chat Orchestrator (TODO: intégration)
    let output = execute_prompt(&prompt).await?;

    let latency_ms = start.elapsed().as_millis() as u64;

    Ok(SemanticResponse {
        skill_name: request.skill_name,
        output,
        confidence: 0.9,
        latency_ms,
    })
}

fn build_prompt(skill: &SemanticSkill, request: &SemanticRequest) -> Result<String, String> {
    let mut prompt = skill.prompt_template.clone();

    // Remplacer variables
    for var in &skill.input_variables {
        let value = request
            .inputs
            .get(var)
            .ok_or(format!("Variable manquante: {}", var))?;
        prompt = prompt.replace(&format!("{{{{${}}}}}",var), value);
    }

    // Ajouter contexte si présent
    if let Some(context) = &request.context {
        prompt = format!("Contexte: {}\n\n{}", context, prompt);
    }

    Ok(prompt)
}

async fn execute_prompt(prompt: &str) -> Result<String, String> {
    // TODO: Appeler Chat Orchestrator
    println!("[SEMANTIC] Prompt: {}", prompt);
    Ok("Réponse simulée du kernel".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSE D'INTENTION
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn semantic_analyze_intent(
    query: String,
    state: State<'_, SemanticKernelState>,
) -> Result<IntentAnalysis, String> {
    println!("[SEMANTIC] Analyse intention: '{}'", query);

    // Vérifier cache
    {
        let cache = state.intent_cache.read().await;
        if let Some(cached) = cache.get(&query) {
            return Ok(cached.clone());
        }
    }

    // Analyse via skill recognize_intent
    let mut inputs = HashMap::new();
    inputs.insert("query".to_string(), query.clone());

    let request = SemanticRequest {
        skill_name: "recognize_intent".to_string(),
        inputs,
        context: None,
    };

    let response = semantic_execute_skill(request, state.clone()).await?;

    // Parser résultat (TODO: parsing structuré)
    let analysis = IntentAnalysis {
        intent: response.output.clone(),
        confidence: response.confidence,
        entities: extract_entities(&query),
        suggested_skill: suggest_skill(&response.output, &state).await,
    };

    // Stocker en cache
    {
        let mut cache = state.intent_cache.write().await;
        cache.insert(query, analysis.clone());
    }

    Ok(analysis)
}

fn extract_entities(query: &str) -> HashMap<String, String> {
    // TODO: NER (Named Entity Recognition)
    let mut entities = HashMap::new();

    // Détection simple de patterns
    if query.contains("code") || query.contains("programme") {
        entities.insert("type".to_string(), "code".to_string());
    }
    if query.contains("traduis") {
        entities.insert("type".to_string(), "translation".to_string());
    }

    entities
}

async fn suggest_skill(intent: &str, state: &SemanticKernelState) -> Option<String> {
    let _skills = state.skills.read().await;

    // Mapping intent → skill
    let intent_lower = intent.to_lowercase();

    if intent_lower.contains("résumé") || intent_lower.contains("summarize") {
        return Some("summarize".to_string());
    }
    if intent_lower.contains("code") {
        return Some("generate_code".to_string());
    }
    if intent_lower.contains("sentiment") {
        return Some("analyze_sentiment".to_string());
    }
    if intent_lower.contains("tradui") {
        return Some("translate".to_string());
    }

    None
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION SKILLS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn semantic_list_skills(state: State<'_, SemanticKernelState>) -> Result<Vec<SemanticSkill>, String> {
    let skills = state.skills.read().await;
    Ok(skills.values().cloned().collect())
}

#[tauri::command]
pub async fn semantic_get_skill(
    skill_name: String,
    state: State<'_, SemanticKernelState>,
) -> Result<SemanticSkill, String> {
    let skills = state.skills.read().await;
    skills
        .get(&skill_name)
        .cloned()
        .ok_or("Skill introuvable".to_string())
}

#[tauri::command]
pub async fn semantic_add_skill(
    skill: SemanticSkill,
    state: State<'_, SemanticKernelState>,
) -> Result<String, String> {
    let mut skills = state.skills.write().await;
    let name = skill.name.clone();
    skills.insert(name.clone(), skill);
    println!("[SEMANTIC] Skill ajouté: {}", name);
    Ok(name)
}

#[tauri::command]
pub async fn semantic_remove_skill(
    skill_name: String,
    state: State<'_, SemanticKernelState>,
) -> Result<String, String> {
    let mut skills = state.skills.write().await;
    skills.remove(&skill_name);
    Ok("Skill supprimé".to_string())
}

#[tauri::command]
pub async fn semantic_toggle_skill(
    skill_name: String,
    enabled: bool,
    state: State<'_, SemanticKernelState>,
) -> Result<String, String> {
    let mut skills = state.skills.write().await;
    if let Some(skill) = skills.get_mut(&skill_name) {
        skill.enabled = enabled;
        Ok(format!("Skill {} {}", skill_name, if enabled { "activé" } else { "désactivé" }))
    } else {
        Err("Skill introuvable".to_string())
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAÎNAGE DE SKILLS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn semantic_chain_skills(
    skill_names: Vec<String>,
    initial_input: String,
    state: State<'_, SemanticKernelState>,
) -> Result<String, String> {
    println!("[SEMANTIC] Chaînage de {} skills", skill_names.len());

    let mut current_output = initial_input;

    for skill_name in skill_names {
        let mut inputs = HashMap::new();
        inputs.insert("input".to_string(), current_output.clone());

        let request = SemanticRequest {
            skill_name: skill_name.clone(),
            inputs,
            context: None,
        };

        let response = semantic_execute_skill(request, state.clone()).await?;
        current_output = response.output;

        println!("[SEMANTIC] {} → output: {}", skill_name, current_output);
    }

    Ok(current_output)
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE & OPTIMISATIONS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn semantic_clear_cache(state: State<'_, SemanticKernelState>) -> Result<usize, String> {
    let mut cache = state.intent_cache.write().await;
    let size = cache.len();
    cache.clear();
    Ok(size)
}

#[tauri::command]
pub async fn semantic_get_cache_size(state: State<'_, SemanticKernelState>) -> Result<usize, String> {
    let cache = state.intent_cache.read().await;
    Ok(cache.len())
}
