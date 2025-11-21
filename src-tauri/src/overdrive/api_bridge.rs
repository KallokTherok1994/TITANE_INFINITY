// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE API BRIDGE
// ═══════════════════════════════════════════════════════════════════════════
// Pont unified pour APIs externes: Gemini, Ollama, GitHub, etc.
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiConfig {
    pub name: String,
    pub base_url: String,
    pub api_key: Option<String>,
    pub headers: HashMap<String, String>,
    pub timeout_ms: u64,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiRequest {
    pub api_name: String,
    pub endpoint: String,
    pub method: String,            // GET|POST|PUT|DELETE
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
    pub query_params: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse {
    pub status: u16,
    pub body: String,
    pub headers: HashMap<String, String>,
    pub latency_ms: u64,
    pub success: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiStats {
    pub api_name: String,
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub average_latency_ms: u64,
    pub last_request_at: Option<u64>,
}

pub struct ApiBridgeState {
    configs: Arc<Mutex<HashMap<String, ApiConfig>>>,
    stats: Arc<Mutex<HashMap<String, ApiStats>>>,
    cache: Arc<Mutex<HashMap<String, (String, u64)>>>, // (response, timestamp)
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> ApiBridgeState {
    let state = ApiBridgeState {
        configs: Arc::new(Mutex::new(HashMap::new())),
        stats: Arc::new(Mutex::new(HashMap::new())),
        cache: Arc::new(Mutex::new(HashMap::new())),
    };

    // Configurer APIs par défaut
    initialize_default_apis(&state);

    state
}

fn initialize_default_apis(state: &ApiBridgeState) {
    let mut configs = state.configs.lock().unwrap();

    // Gemini API
    configs.insert(
        "gemini".to_string(),
        ApiConfig {
            name: "gemini".to_string(),
            base_url: "https://generativelanguage.googleapis.com/v1beta".to_string(),
            api_key: None, // À configurer
            headers: HashMap::new(),
            timeout_ms: 30000,
            enabled: false,
        },
    );

    // Ollama Local
    configs.insert(
        "ollama".to_string(),
        ApiConfig {
            name: "ollama".to_string(),
            base_url: "http://localhost:11434".to_string(),
            api_key: None,
            headers: HashMap::new(),
            timeout_ms: 60000,
            enabled: true,
        },
    );

    // GitHub API
    configs.insert(
        "github".to_string(),
        ApiConfig {
            name: "github".to_string(),
            base_url: "https://api.github.com".to_string(),
            api_key: None,
            headers: {
                let mut h = HashMap::new();
                h.insert("Accept".to_string(), "application/vnd.github+json".to_string());
                h
            },
            timeout_ms: 10000,
            enabled: false,
        },
    );

    println!("[API_BRIDGE] {} APIs configurées", configs.len());
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUÊTES HTTP
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn api_request(
    request: ApiRequest,
    state: State<'_, ApiBridgeState>,
) -> Result<ApiResponse, String> {
    let start = std::time::Instant::now();

    println!("[API_BRIDGE] {} {} /{}", request.method, request.api_name, request.endpoint);

    // Récupérer config API
    let config = {
        let configs = state.configs.lock().unwrap();
        configs
            .get(&request.api_name)
            .cloned()
            .ok_or(format!("API {} non configurée", request.api_name))?
    };

    if !config.enabled {
        return Err(format!("API {} désactivée", request.api_name));
    }

    // Construire URL
    let url = format!("{}/{}", config.base_url, request.endpoint);

    // Vérifier cache (GET seulement)
    if request.method == "GET" {
        if let Some(cached) = check_cache(&state, &url) {
            println!("[API_BRIDGE] Cache hit: {}", url);
            return Ok(ApiResponse {
                status: 200,
                body: cached,
                headers: HashMap::new(),
                latency_ms: 0,
                success: true,
            });
        }
    }

    // Effectuer requête
    let response = execute_http_request(&url, &request, &config).await?;

    let latency_ms = start.elapsed().as_millis() as u64;

    // Mettre à jour stats
    update_stats(&state, &request.api_name, response.success, latency_ms);

    // Mettre en cache si GET et succès
    if request.method == "GET" && response.success {
        set_cache(&state, &url, &response.body);
    }

    Ok(ApiResponse {
        latency_ms,
        ..response
    })
}

async fn execute_http_request(
    url: &str,
    request: &ApiRequest,
    config: &ApiConfig,
) -> Result<ApiResponse, String> {
    // TODO: Implémenter reqwest HTTP client
    // let client = reqwest::Client::new();
    // let mut req = match request.method.as_str() {
    //     "GET" => client.get(url),
    //     "POST" => client.post(url),
    //     "PUT" => client.put(url),
    //     "DELETE" => client.delete(url),
    //     _ => return Err("Méthode HTTP non supportée".to_string()),
    // };
    //
    // // Ajouter headers
    // if let Some(api_key) = &config.api_key {
    //     req = req.header("Authorization", format!("Bearer {}", api_key));
    // }
    // for (k, v) in &config.headers {
    //     req = req.header(k, v);
    // }
    //
    // // Body
    // if let Some(body) = &request.body {
    //     req = req.body(body.clone());
    // }
    //
    // // Query params
    // if let Some(params) = &request.query_params {
    //     req = req.query(params);
    // }
    //
    // // Timeout
    // req = req.timeout(std::time::Duration::from_millis(config.timeout_ms));
    //
    // // Exécuter
    // let response = req.send().await.map_err(|e| e.to_string())?;
    // let status = response.status().as_u16();
    // let body = response.text().await.map_err(|e| e.to_string())?;

    // Simulation pour l'instant
    println!("[API_BRIDGE] Requête simulée vers: {}", url);

    Ok(ApiResponse {
        status: 200,
        body: "{\"simulation\": true}".to_string(),
        headers: HashMap::new(),
        latency_ms: 0,
        success: true,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn api_get_configs(state: State<ApiBridgeState>) -> Result<Vec<ApiConfig>, String> {
    let configs = state.configs.lock().unwrap();
    Ok(configs.values().cloned().collect())
}

#[tauri::command]
pub fn api_update_config(
    config: ApiConfig,
    state: State<ApiBridgeState>,
) -> Result<String, String> {
    let mut configs = state.configs.lock().unwrap();
    let name = config.name.clone();
    configs.insert(name.clone(), config);
    println!("[API_BRIDGE] Config mise à jour: {}", name);
    Ok(name)
}

#[tauri::command]
pub fn api_set_key(
    api_name: String,
    api_key: String,
    state: State<ApiBridgeState>,
) -> Result<String, String> {
    let mut configs = state.configs.lock().unwrap();
    if let Some(config) = configs.get_mut(&api_name) {
        config.api_key = Some(api_key);
        config.enabled = true;
        println!("[API_BRIDGE] API key configurée: {}", api_name);
        Ok("API key configurée".to_string())
    } else {
        Err("API introuvable".to_string())
    }
}

#[tauri::command]
pub fn api_enable(
    api_name: String,
    enabled: bool,
    state: State<ApiBridgeState>,
) -> Result<String, String> {
    let mut configs = state.configs.lock().unwrap();
    if let Some(config) = configs.get_mut(&api_name) {
        config.enabled = enabled;
        Ok(format!(
            "API {} {}",
            api_name,
            if enabled { "activée" } else { "désactivée" }
        ))
    } else {
        Err("API introuvable".to_string())
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn api_get_stats(state: State<ApiBridgeState>) -> Result<Vec<ApiStats>, String> {
    let stats = state.stats.lock().unwrap();
    Ok(stats.values().cloned().collect())
}

fn update_stats(state: &ApiBridgeState, api_name: &str, success: bool, latency_ms: u64) {
    let mut stats = state.stats.lock().unwrap();

    let stat = stats.entry(api_name.to_string()).or_insert(ApiStats {
        api_name: api_name.to_string(),
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        average_latency_ms: 0,
        last_request_at: None,
    });

    stat.total_requests += 1;
    if success {
        stat.successful_requests += 1;
    } else {
        stat.failed_requests += 1;
    }

    // Moyenne mobile
    stat.average_latency_ms =
        (stat.average_latency_ms * (stat.total_requests - 1) + latency_ms) / stat.total_requests;

    stat.last_request_at = Some(get_timestamp());
}

#[tauri::command]
pub fn api_reset_stats(state: State<ApiBridgeState>) -> Result<String, String> {
    let mut stats = state.stats.lock().unwrap();
    stats.clear();
    Ok("Statistiques réinitialisées".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────────────────────────────────────

fn check_cache(state: &ApiBridgeState, url: &str) -> Option<String> {
    let cache = state.cache.lock().unwrap();
    if let Some((response, timestamp)) = cache.get(url) {
        let age = get_timestamp() - timestamp;
        if age < 300 {
            // 5 minutes
            return Some(response.clone());
        }
    }
    None
}

fn set_cache(state: &ApiBridgeState, url: &str, response: &str) {
    let mut cache = state.cache.lock().unwrap();
    cache.insert(url.to_string(), (response.to_string(), get_timestamp()));

    // Limiter taille cache à 100 entrées
    if cache.len() > 100 {
        // Supprimer les plus vieux
        let oldest_key = cache
            .iter()
            .min_by_key(|(_, (_, ts))| ts)
            .map(|(k, _)| k.clone());
        if let Some(key) = oldest_key {
            cache.remove(&key);
        }
    }
}

#[tauri::command]
pub fn api_clear_cache(state: State<ApiBridgeState>) -> Result<usize, String> {
    let mut cache = state.cache.lock().unwrap();
    let size = cache.len();
    cache.clear();
    Ok(size)
}

#[tauri::command]
pub fn api_get_cache_size(state: State<ApiBridgeState>) -> Result<usize, String> {
    let cache = state.cache.lock().unwrap();
    Ok(cache.len())
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS SPÉCIFIQUES
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn api_gemini_generate(
    prompt: String,
    state: State<'_, ApiBridgeState>,
) -> Result<String, String> {
    let request = ApiRequest {
        api_name: "gemini".to_string(),
        endpoint: "models/gemini-2.0-flash-exp:generateContent".to_string(),
        method: "POST".to_string(),
        headers: None,
        body: Some(format!(
            r#"{{"contents":[{{"role":"user","parts":[{{"text":"{}"}}]}}]}}"#,
            prompt.replace("\"", "\\\"")
        )),
        query_params: None,
    };

    let response = api_request(request, state).await?;

    if response.success {
        // TODO: Parser réponse Gemini
        Ok(response.body)
    } else {
        Err(format!("Gemini error: status {}", response.status))
    }
}

#[tauri::command]
pub async fn api_ollama_generate(
    model: String,
    prompt: String,
    state: State<'_, ApiBridgeState>,
) -> Result<String, String> {
    let request = ApiRequest {
        api_name: "ollama".to_string(),
        endpoint: "api/generate".to_string(),
        method: "POST".to_string(),
        headers: None,
        body: Some(format!(
            r#"{{"model":"{}","prompt":"{}","stream":false}}"#,
            model,
            prompt.replace("\"", "\\\"")
        )),
        query_params: None,
    };

    let response = api_request(request, state).await?;

    if response.success {
        // TODO: Parser réponse Ollama
        Ok(response.body)
    } else {
        Err(format!("Ollama error: status {}", response.status))
    }
}

#[tauri::command]
pub async fn api_test_connection(
    api_name: String,
    state: State<'_, ApiBridgeState>,
) -> Result<bool, String> {
    println!("[API_BRIDGE] Test connexion: {}", api_name);

    // TODO: Implémenter ping spécifique par API
    // - Gemini: HEAD request
    // - Ollama: GET /api/tags
    // - GitHub: GET /

    let request = ApiRequest {
        api_name: api_name.clone(),
        endpoint: "".to_string(),
        method: "GET".to_string(),
        headers: None,
        body: None,
        query_params: None,
    };

    match api_request(request, state).await {
        Ok(response) => Ok(response.success && response.status < 400),
        Err(_) => Ok(false),
    }
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
