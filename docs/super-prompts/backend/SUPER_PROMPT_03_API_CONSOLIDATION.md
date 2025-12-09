# 🔥 SUPER PROMPT #3 — TITANE∞ API LAYER CONSOLIDATION

**Consolidation + Standardisation + Sécurisation de la couche API**

---

## 📋 Métadonnées

- **Priorité** : 🔶 P1 (Haute)
- **Complexité** : ⭐⭐⭐ (Moyenne)
- **Durée estimée** : 1-3h
- **Dépendances** : Super Prompt #2 (Rust Backend Cleanup)
- **Output** : API unifiée + Validation + Rate limiting + Documentation OpenAPI
- **Outils** : GitHub Copilot Chat + VS Code

---

## 🎯 Objectif

Consolider et **standardiser la couche API** de TITANE∞ pour qu'elle soit :

- ✅ Unifiée (format de réponse cohérent)
- ✅ Validée (tous les inputs validés)
- ✅ Sécurisée (rate limiting, sanitization)
- ✅ Documentée (OpenAPI/Swagger)
- ✅ Versionnée (API v1, v2...)
- ✅ Performante (caching, batch requests)

---

## 🚀 Super Prompt (Copier-coller dans Copilot Chat)

````markdown
@workspace

Tu es mon copilote expert API/Architecture senior sur le projet **TITANE_INFINITY**.

Ton rôle : **consolider et STANDARDISER la couche API** pour qu'elle soit :
- unifiée (format de réponse cohérent),
- validée (tous les inputs),
- sécurisée (rate limiting, sanitization),
- documentée (OpenAPI/Swagger),
- versionnée,
- performante.

Tu dois travailler SUR le code existant (Tauri commands + éventuelles API HTTP) et produire du **code réel**, prêt à être commité.

---

## 1. CONTEXTE PROJET (À ANALYSER EN PREMIER)

Parcours le workspace et établis une vision claire de :

1. **Architecture API actuelle** :
   - Tauri commands (invoke depuis frontend)
   - Éventuelles API REST/HTTP
   - WebSocket pour streaming
   - Formats de réponse actuels

2. **Endpoints détectés** :
   - Chat (send_message, get_history, etc.)
   - DevTools (get_metrics, get_logs, etc.)
   - Settings (update_config, get_config, etc.)
   - System (kernel_status, memory_info, etc.)

3. **Problèmes connus** :
   - Formats de réponse hétérogènes
   - Pas de validation systématique des inputs
   - Pas de rate limiting
   - Documentation API absente ou dispersée
   - Gestion d'erreurs non standardisée

📌 **Objectif de cette section** :
Générer un **rapport de diagnostic** dans un fichier :

- `docs/api/API_DIAGNOSTIC_TITANE.md`

Contenu attendu :
- Liste de tous les endpoints/commands détectés
- Formats de réponse actuels (exemples)
- Problèmes identifiés (sécurité, cohérence, doc)

---

## 2. ARCHITECTURE CIBLE API TITANE∞

### 2.1. Format de réponse unifié

Tous les endpoints doivent retourner ce format :

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-09T15:30:00Z",
  "version": "v1"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  },
  "timestamp": "2025-12-09T15:30:00Z",
  "version": "v1"
}
```

### 2.2. Structure des commandes Tauri

```rust
// src-tauri/src/api/mod.rs
pub mod chat;
pub mod devtools;
pub mod settings;
pub mod system;

// Format de réponse unifié
#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<ApiError>,
    pub timestamp: String,
    pub version: String,
}

#[derive(Serialize)]
pub struct ApiError {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}
```

---

## 3. VALIDATION DES INPUTS

### 3.1. Utiliser `validator` crate

```rust
use validator::{Validate, ValidationError};

#[derive(Debug, Validate, Deserialize)]
pub struct SendMessageRequest {
    #[validate(length(min = 1, max = 5000))]
    pub content: String,

    #[validate(custom = "validate_context")]
    pub context: Option<String>,

    #[validate(range(min = 0.0, max = 2.0))]
    pub temperature: Option<f32>,
}

fn validate_context(context: &str) -> Result<(), ValidationError> {
    if context.len() > 10000 {
        return Err(ValidationError::new("context_too_long"));
    }
    Ok(())
}
```

### 3.2. Middleware de validation

```rust
pub fn validate_request<T: Validate>(req: &T) -> Result<(), ApiError> {
    req.validate().map_err(|e| ApiError {
        code: "VALIDATION_ERROR".to_string(),
        message: "Invalid request".to_string(),
        details: Some(serde_json::to_value(e).unwrap()),
    })
}
```

---

## 4. RATE LIMITING

### 4.1. Implémenter un rate limiter simple

```rust
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::{Duration, Instant};

pub struct RateLimiter {
    requests: Arc<Mutex<HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            max_requests,
            window,
        }
    }

    pub async fn check(&self, key: &str) -> bool {
        let mut requests = self.requests.lock().await;
        let now = Instant::now();

        let user_requests = requests.entry(key.to_string()).or_insert_with(Vec::new);
        user_requests.retain(|&time| now.duration_since(time) < self.window);

        if user_requests.len() < self.max_requests {
            user_requests.push(now);
            true
        } else {
            false
        }
    }
}
```

### 4.2. Appliquer le rate limiting

```rust
#[tauri::command]
pub async fn send_message(
    state: tauri::State<'_, AppState>,
    request: SendMessageRequest,
) -> Result<ApiResponse<MessageResponse>, ApiError> {
    // Rate limiting
    if !state.rate_limiter.check("default_user").await {
        return Err(ApiError {
            code: "RATE_LIMIT_EXCEEDED".to_string(),
            message: "Too many requests".to_string(),
            details: None,
        });
    }

    // Validation
    validate_request(&request)?;

    // Processing
    // ...
}
```

---

## 5. SANITIZATION & SÉCURITÉ

### 5.1. Sanitizer les inputs textuels

```rust
use ammonia::clean;

pub fn sanitize_html(input: &str) -> String {
    clean(input)
}

pub fn sanitize_message(msg: &str) -> Result<String, ApiError> {
    // Supprimer les caractères de contrôle
    let sanitized: String = msg.chars()
        .filter(|c| !c.is_control() || *c == '\n' || *c == '\t')
        .collect();

    // Limiter la longueur
    if sanitized.len() > 10000 {
        return Err(ApiError {
            code: "INPUT_TOO_LONG".to_string(),
            message: "Message exceeds maximum length".to_string(),
            details: None,
        });
    }

    Ok(sanitized)
}
```

### 5.2. Prévenir les injections

- Utiliser des requêtes préparées pour toute DB
- Ne jamais exécuter de code dynamique
- Valider tous les chemins de fichiers (no path traversal)
- Échapper les caractères spéciaux dans les logs

---

## 6. VERSIONING API

### 6.1. Structure versionnée

```rust
// src-tauri/src/api/v1/mod.rs
pub mod chat;
pub mod devtools;
pub mod settings;
pub mod system;

// src-tauri/src/api/v2/mod.rs (future)
// ...
```

### 6.2. Router selon la version

```rust
#[tauri::command]
pub async fn api_call(
    version: String,
    endpoint: String,
    payload: serde_json::Value,
) -> Result<ApiResponse<serde_json::Value>, ApiError> {
    match version.as_str() {
        "v1" => v1::handle_request(endpoint, payload).await,
        "v2" => v2::handle_request(endpoint, payload).await,
        _ => Err(ApiError {
            code: "UNSUPPORTED_VERSION".to_string(),
            message: format!("API version {} not supported", version),
            details: None,
        }),
    }
}
```

---

## 7. DOCUMENTATION OPENAPI

### 7.1. Générer un spec OpenAPI 3.0

Fichier : `docs/api/openapi.yaml`

```yaml
openapi: 3.0.0
info:
  title: TITANE∞ API
  version: 1.0.0
  description: API pour TITANE_INFINITY cognitive platform

servers:
  - url: tauri://localhost
    description: Tauri local

paths:
  /api/v1/chat/send_message:
    post:
      summary: Envoyer un message au chat
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SendMessageRequest'
      responses:
        '200':
          description: Message envoyé avec succès
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
        '400':
          description: Requête invalide
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

components:
  schemas:
    SendMessageRequest:
      type: object
      required:
        - content
      properties:
        content:
          type: string
          minLength: 1
          maxLength: 5000
        context:
          type: string
          maxLength: 10000
        temperature:
          type: number
          minimum: 0.0
          maximum: 2.0

    MessageResponse:
      type: object
      properties:
        id:
          type: string
        content:
          type: string
        timestamp:
          type: string
          format: date-time

    ApiError:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
```

### 7.2. Générer la doc HTML

```bash
# Installer redoc-cli
npm install -g redoc-cli

# Générer la doc
redoc-cli bundle docs/api/openapi.yaml -o docs/api/index.html
```

---

## 8. CACHING & PERFORMANCE

### 8.1. Cache simple en mémoire

```rust
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::{Duration, Instant};

pub struct SimpleCache<T> {
    data: Arc<RwLock<HashMap<String, (T, Instant)>>>,
    ttl: Duration,
}

impl<T: Clone> SimpleCache<T> {
    pub fn new(ttl: Duration) -> Self {
        Self {
            data: Arc::new(RwLock::new(HashMap::new())),
            ttl,
        }
    }

    pub async fn get(&self, key: &str) -> Option<T> {
        let cache = self.data.read().await;
        cache.get(key).and_then(|(value, timestamp)| {
            if timestamp.elapsed() < self.ttl {
                Some(value.clone())
            } else {
                None
            }
        })
    }

    pub async fn set(&self, key: String, value: T) {
        let mut cache = self.data.write().await;
        cache.insert(key, (value, Instant::now()));
    }
}
```

### 8.2. Utiliser le cache

```rust
#[tauri::command]
pub async fn get_system_info(
    state: tauri::State<'_, AppState>,
) -> Result<ApiResponse<SystemInfo>, ApiError> {
    // Check cache
    if let Some(cached) = state.cache.get("system_info").await {
        return Ok(ApiResponse::success(cached));
    }

    // Compute
    let info = compute_system_info().await?;

    // Cache result
    state.cache.set("system_info".to_string(), info.clone()).await;

    Ok(ApiResponse::success(info))
}
```

---

## 9. BATCH REQUESTS (Optionnel)

### 9.1. Supporter les requêtes groupées

```rust
#[derive(Deserialize)]
pub struct BatchRequest {
    pub requests: Vec<SingleRequest>,
}

#[derive(Deserialize)]
pub struct SingleRequest {
    pub id: String,
    pub endpoint: String,
    pub payload: serde_json::Value,
}

#[tauri::command]
pub async fn batch_api_call(
    state: tauri::State<'_, AppState>,
    batch: BatchRequest,
) -> Result<Vec<ApiResponse<serde_json::Value>>, ApiError> {
    let mut responses = Vec::new();

    for req in batch.requests {
        let response = handle_single_request(&state, req.endpoint, req.payload).await;
        responses.push(response);
    }

    Ok(responses)
}
```

---

## 10. RÈGLES GÉNÉRALES DE TRAVAIL

* Tu travailles **endpoint par endpoint**, en expliquant brièvement les modifications.
* Tu uniformises **tous les formats de réponse** pour correspondre à `ApiResponse<T>`.
* Tu ajoutes **validation sur tous les inputs**.
* Tu documentes **chaque endpoint dans openapi.yaml**.
* Tu t'assures que **cargo check** et **cargo test** passent.

---

## 11. OUTPUT ATTENDU (DANS CETTE SESSION)

1. Le fichier :
   * `docs/api/API_DIAGNOSTIC_TITANE.md`

2. Structure API unifiée :
   * `src-tauri/src/api/mod.rs` (format ApiResponse)
   * `src-tauri/src/api/v1/` (endpoints organisés)

3. Modules de sécurité :
   * Rate limiter
   * Input validator
   * Sanitizer

4. Documentation :
   * `docs/api/openapi.yaml` (spec complète)
   * `docs/api/index.html` (doc HTML générée)

5. Tests :
   * Tests unitaires pour validation
   * Tests d'intégration pour endpoints critiques

6. Rapport final :
   * Liste des endpoints standardisés
   * Stratégie de versioning
   * Métriques de performance (avec/sans cache)

Tu peux proposer des ajustements, mais tu dois **toujours livrer du code immédiatement exploitable**.

Commence maintenant par :

1. Lire la structure API existante
2. Générer `API_DIAGNOSTIC_TITANE.md`
3. Ensuite enchaîner sur la standardisation puis la documentation.
````

---

## ✅ Checklist Post-Application

Après avoir appliqué ce super prompt avec Copilot :

- [ ] Le fichier `docs/api/API_DIAGNOSTIC_TITANE.md` existe
- [ ] Format `ApiResponse<T>` unifié implémenté
- [ ] Tous les endpoints retournent le format standardisé
- [ ] Validation des inputs sur tous les endpoints
- [ ] Rate limiting implémenté
- [ ] Sanitization des inputs textuels
- [ ] `docs/api/openapi.yaml` existe et est complet
- [ ] `cargo check` passe ✅
- [ ] `cargo test` passe ✅
- [ ] Documentation HTML générée (`docs/api/index.html`)

---

## 🔄 Itérations possibles

1. **Itération 1** : Diagnostic + Format unifié
2. **Itération 2** : Validation + Rate limiting
3. **Itération 3** : Documentation OpenAPI
4. **Itération 4** : Caching + Performance

---

## 📚 Ressources liées

- [OpenAPI 3.0 Spec](https://swagger.io/specification/)
- [validator crate](https://docs.rs/validator/)
- [Rate Limiting Patterns](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

## 🐛 Troubleshooting

### Les formats de réponse sont trop différents

➡️ Créer des adaptateurs pour les anciens formats, migrer progressivement

### Le rate limiting est trop strict

➡️ Ajuster les paramètres (max_requests, window) selon l'usage réel

### La doc OpenAPI est incomplète

➡️ Utiliser un outil comme `utoipa` pour générer automatiquement depuis le code Rust

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
**Auteur** : TITANE∞ Core Team
