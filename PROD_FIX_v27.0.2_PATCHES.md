/\*\*

- TITANE∞ v27.0.2 - PROD FIX
- Ollama Auto-Launch + Config Defaults + DevTools Enable
-
- This patch fixes:
- ✓ Ollama auto-start in PROD DEB/AppImage
- ✓ Configuration defaults (currently undefined)
- ✓ DevTools enable via environment variable
- ✓ Configuration persistence
  \*/

// ════════════════════════════════════════════════════════════════
// PATCH 1: Default Ollama Configuration
// Location: src/services/ai/providers/ollama.ts (after imports)
// ════════════════════════════════════════════════════════════════

/\*\*

- DEFAULT OLLAMA CONFIGURATION
- These values are used when no configuration is found
  \*/
  export const DEFAULT_OLLAMA_CONFIG = {
  // Connection
  endpoint: 'http://127.0.0.1:11434',
  host: '127.0.0.1',
  port: 11434,

// Model & Parameters
model: 'gemma2:2b',
temperature: 0.7,
top_p: 0.9,
top_k: 40,
num_predict: 128,
repeat_penalty: 1.1,

// Timeouts & Retries
timeout_ms: 60000,
connect_timeout_ms: 5000,
retry_count: 3,
retry_delay_ms: 1000,

// Features
auto_start: true,
check_on_startup: true,
fallback_provider: 'titane-local',
stream_enabled: true,

// Context
context_window: 4096,
max_tokens: 512,
} as const;

export function getOllamaConfig() {
// 1. Try environment variables
const envModel = process.env.OLLAMA_MODEL?.trim();
const envEndpoint = process.env.OLLAMA_ENDPOINT?.trim();

if (envModel || envEndpoint) {
return {
...DEFAULT_OLLAMA_CONFIG,
...(envModel && { model: envModel }),
...(envEndpoint && { endpoint: envEndpoint }),
};
}

// 2. Try localStorage (persisted user config)
try {
const stored = localStorage.getItem('titane_ollama_config');
if (stored) {
const parsed = JSON.parse(stored);
return { ...DEFAULT_OLLAMA_CONFIG, ...parsed };
}
} catch (err) {
console.warn('[Ollama] Failed to load stored config:', err);
}

// 3. Try IndexedDB (persistent DB)
// TODO: Implement IndexedDB fallback for large configs

// 4. Return defaults
return { ...DEFAULT_OLLAMA_CONFIG };
}

export function setOllamaConfig(config: Partial<typeof DEFAULT_OLLAMA_CONFIG>) {
try {
const current = getOllamaConfig();
const updated = { ...current, ...config };
localStorage.setItem('titane_ollama_config', JSON.stringify(updated));
console.log('[Ollama] Configuration updated:', config);
return true;
} catch (err) {
console.error('[Ollama] Failed to save config:', err);
return false;
}
}

// ════════════════════════════════════════════════════════════════
// PATCH 2: Enhanced Ollama Health Check with Retry
// Location: src/services/ai/providers/ollama.ts (in health check function)
// ════════════════════════════════════════════════════════════════

async function checkOllamaHealthWithRetry(maxRetries = 3) {
const config = getOllamaConfig();
let lastError: Error | null = null;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
try {
const controller = new AbortController();
const timeout = setTimeout(
() => controller.abort(),
config.connect_timeout_ms
);

      const response = await fetch(
        `${config.endpoint}/api/tags`,
        {
          method: 'GET',
          signal: controller.signal,
          timeout: config.connect_timeout_ms,
        }
      );

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        console.log('[Ollama] Health check OK', { models: data.models?.length });
        return {
          available: true,
          endpoint: config.endpoint,
          models: data.models || [],
        };
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[Ollama] Health check attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      );

      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, config.retry_delay_ms * attempt)
        );
      }
    }

}

return {
available: false,
endpoint: config.endpoint,
error: lastError?.message || 'Connection failed',
};
}

// ════════════════════════════════════════════════════════════════
// PATCH 3: Governance Configuration Defaults
// Location: src/features/governance-center/types.ts (add new interface)
// ════════════════════════════════════════════════════════════════

export const DEFAULT_GOVERNANCE_CONFIG = {
// Ollama Policy
ollama: {
enabled: true,
auto_start: true,
endpoint: 'http://127.0.0.1:11434',
model: 'gemma2:2b',
max_concurrent_requests: 5,
max_context_tokens: 4096,
require_auth: false,
log_all_requests: true,
timeout_ms: 60000,
},

// Security Configuration
security: {
level: 'standard', // 'permissive' | 'standard' | 'strict'
audit_log: true,
require_auth_for_external_providers: true,
rate_limit_requests_per_minute: 60,
},

// DevTools Configuration
devtools: {
enabled: process.env.TITANE_DEVTOOLS === '1' || process.env.NODE_ENV === 'development',
hotkey: 'F12',
console_log_level: 'debug',
auto_open_on_error: true,
},

// Advanced
features: {
streaming: true,
memory_integration: true,
auto_healing: true,
},
} as const;

// ════════════════════════════════════════════════════════════════
// PATCH 4: DevTools Enable in PROD
// Location: src-tauri/src/main.rs (around line 795, in setup())
// ════════════════════════════════════════════════════════════════

// REPLACE THIS SECTION:
/_
// Auto-open DevTools in dev mode #[cfg(debug_assertions)]
{
main_window.open_devtools();
log::info!("🛠️ DevTools opened automatically (dev mode)");
}
_/

// WITH THIS:
/\*
// Auto-open DevTools (dev mode or TITANE_DEVTOOLS env var)
let devtools_enabled = cfg!(debug_assertions)
|| std::env::var("TITANE_DEVTOOLS")
.ok()
.is_some_and(|v| v == "1");

                        if devtools_enabled {
                            if let Err(err) = main_window.open_devtools() {
                                log::warn!("Failed to open DevTools: {}", err);
                            } else {
                                log::info!("🛠️ DevTools opened ({})",
                                    if cfg!(debug_assertions) { "dev mode" } else { "TITANE_DEVTOOLS=1" }
                                );
                            }
                        }

\*/

// ════════════════════════════════════════════════════════════════
// PATCH 5: Improved Ollama Auto-Start (main.rs)
// Location: src-tauri/src/main.rs (around line 625, OLLAMA BUNDLED AUTO-START)
// ════════════════════════════════════════════════════════════════

// REPLACE the entire OLLAMA BUNDLED AUTO-START section with:
/\*
// OLLAMA BUNDLED AUTO-START (AppImage/DEB/macOS)
// Attempts to start Ollama with exponential backoff and multiple fallback methods
// ─────────────────────────────────────────────────────────────
let app_handle = app.handle().clone();
tauri::async_runtime::spawn(async move {
log::info!("[Ollama] Startup routine initiated");

                // 1. Check if Ollama already running on localhost:11434
                if let Ok(status) = titane_infinity::ai::ollama::ai_check_ollama_status().await {
                    if status.available {
                        log::info!("[Ollama] ✅ Endpoint already available at {}", status.endpoint);
                        return;
                    }
                }

                log::info!("[Ollama] Ollama not running. Attempting to start...");

                // 2. Try bundled binary (for AppImage/custom builds)
                if let Ok(paths) = app_handle.path().resource_dir() {
                    let bundled_paths = [
                        paths.join("resources/ollama/ollama"),
                        paths.join("ollama/ollama"),
                        paths.join("bin/ollama"),
                    ];

                    for ollama_path in &bundled_paths {
                        if ollama_path.exists() {
                            log::info!("[Ollama] Found bundled binary at: {:?}", ollama_path);
                            match ProcessCommand::new(ollama_path)
                                .arg("serve")
                                .env("OLLAMA_HOST", "127.0.0.1:11434")
                                .stdout(Stdio::null())
                                .stderr(Stdio::null())
                                .spawn()
                            {
                                Ok(_) => {
                                    log::info!("[Ollama] ✅ Bundled server started from {:?}", ollama_path);
                                    return;
                                }
                                Err(err) => {
                                    log::warn!("[Ollama] Failed to start from {:?}: {}", ollama_path, err);
                                }
                            }
                        }
                    }
                }

                // 3. Try system `ollama` command
                log::info!("[Ollama] Trying system ollama command...");
                match ProcessCommand::new("ollama")
                    .arg("serve")
                    .env("OLLAMA_HOST", "127.0.0.1:11434")
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn()
                {
                    Ok(_) => {
                        log::info!("[Ollama] ✅ System ollama started successfully");
                        return;
                    }
                    Err(err) => {
                        log::warn!("[Ollama] System ollama failed: {}", err);
                    }
                }

                // 4. Final warning if all attempts failed
                log::warn!("[Ollama] ⚠️ Could not auto-start Ollama");
                log::warn!("[Ollama] Fallback: Users must start manually:");
                log::warn!("[Ollama]   macOS:  brew install ollama && ollama serve");
                log::warn!("[Ollama]   Linux:  sudo systemctl start ollama");
                log::warn!("[Ollama]   Docker: docker run -d -p 11434:11434 ollama/ollama");
            });

\*/

// ════════════════════════════════════════════════════════════════
// USAGE IN APPLICATION
// ════════════════════════════════════════════════════════════════

/\*
// In Configuration Hub / Admin Panel:

const config = getOllamaConfig();
console.log('Current Ollama endpoint:', config.endpoint);
console.log('Current model:', config.model);

// Update configuration
setOllamaConfig({ model: 'llama2:latest' });

// Enable DevTools in PROD
process.env.TITANE_DEVTOOLS = '1';
\*/

// ════════════════════════════════════════════════════════════════
// ENVIRONMENT VARIABLES FOR PROD
// ════════════════════════════════════════════════════════════════

/\*
DEB Installation (.deb -> /etc/environment or .desktop file):
OLLAMA_HOST=127.0.0.1:11434
OLLAMA_MODEL=gemma2:2b
TITANE_DEVTOOLS=1

AppImage (via wrapper script):
export OLLAMA_HOST="127.0.0.1:11434"
export OLLAMA_MODEL="gemma2:2b"
export TITANE_DEVTOOLS=1

systemd Service (titane-infinity.service):
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="TITANE_DEVTOOLS=1"
\*/
