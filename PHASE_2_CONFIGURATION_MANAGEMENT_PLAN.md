# 🎯 PHASE 2 - CONFIGURATION MANAGEMENT UI - Plan d'Implémentation

**Date** : 6 Décembre 2025
**Auteur** : Claude Sonnet 4.5
**Version** : v19.5.2
**Status** : 📋 Planification Complète
**Durée Estimée** : 5-8 jours (MVP → Full)

---

## 📊 RÉSUMÉ EXÉCUTIF

La **Phase 2 (Configuration Management UI)** vise à créer une interface centralisée pour gérer toute la configuration de TITANE∞.

**État actuel** : 60-70% implémenté (fondations solides)
**Objectif** : 100% avec UI complète + hot-reload

**Approche** : MVP incrementiel
1. **Jours 1-2** : Configuration Hub basique (lecture seule)
2. **Jours 3-4** : Édition + sauvegarde (runtime config)
3. **Jours 5-6** : Hot-reload system
4. **Jours 7-8** : Profiles + validation avancée

---

## 🏗️ ARCHITECTURE ACTUELLE

### ✅ Ce qui existe déjà

#### Backend Rust (Tauri)
```
src-tauri/src/
├── runtime_config.rs         ✅ 100% (read-only)
├── chat_engine/config.rs     ✅ 100% (hardcoded)
├── design_center/
│   └── theme_manager.rs      ✅ 100% (full CRUD + persistence)
└── security/
    └── secrets_engine.rs     ✅ 100% (API keys encryption)
```

#### Frontend TypeScript
```
src/
├── config/
│   ├── featureFlags.ts              ✅ 100% (compile-time)
│   ├── selfHealing.config.ts        ✅ 100% (in-memory)
│   └── adminEngine.config.ts        ✅ 100% (in-memory)
├── features/design-center/
│   └── providers/UIThemeProvider.tsx ✅ 100% (full CRUD)
├── pages/
│   ├── Settings.tsx                 ⚠️ 40% (basic UI)
│   └── SecureSettings.tsx           ✅ 95% (API keys)
└── components/
    └── SettingsModal.tsx            ✅ 90% (AI mode)
```

#### Storage
```
data/
├── ui_theme.json            ✅ Full persistence
├── identity_matrix.json     ✅ Partial
├── personality.json         ✅ Partial
└── memory_*.json            ✅ Partial
```

---

## ❌ Ce qui manque (Phase 2)

### 1. **Configuration Hub UI** (0%)
- Dashboard centralisé
- Navigation par catégories
- Édition en temps réel
- Validation visuelle

### 2. **Hot-Reload System** (0%)
- File watchers backend
- Event emission
- Frontend listeners
- Auto-apply sans restart

### 3. **Runtime Config Modification** (0%)
- Extend RuntimeConfig
- set_runtime_config command
- Validation engine
- Rollback mechanism

### 4. **Config Profiles** (0%)
- Save/Load snapshots
- Predefined profiles
- Profile switching
- Comparison tool

### 5. **Config Audit Log** (0%)
- Change tracking
- History viewer
- Revert functionality

---

## 🎯 MVP (Minimum Viable Product) - Jours 1-5

### Jour 1-2 : Configuration Hub (Lecture Seule)

#### Objectif
Créer un dashboard qui affiche **toutes** les configurations existantes en lecture seule.

#### Fichiers à Créer

**1. Backend - Unified Config Snapshot**

`src-tauri/src/config/mod.rs` (nouveau module)
```rust
pub mod snapshot;

use serde::{Deserialize, Serialize};
use crate::runtime_config::RuntimeConfig;
use crate::chat_engine::config::ChatEngineConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigSnapshot {
    pub runtime: RuntimeConfig,
    pub chat_engine: ChatEngineConfig,
    pub timestamp: u64,
    pub version: String,
}

#[tauri::command]
pub async fn get_all_configs(
    state: State<'_, /* ... */>,
) -> Result<ConfigSnapshot, String> {
    // Collect all configs
    Ok(ConfigSnapshot {
        runtime: get_runtime_config(state).await?,
        chat_engine: ChatEngineConfig::default(), // TODO: load from file
        timestamp: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}
```

**2. Frontend - Configuration Hub Page**

`src/pages/ConfigurationHub.tsx` (nouvelle page)
```typescript
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Card, Tabs } from '@/ui';

interface ConfigSnapshot {
  runtime: RuntimeConfig;
  chat_engine: ChatEngineConfig;
  timestamp: number;
  version: string;
}

export const ConfigurationHub: React.FC = () => {
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const snapshot = await invoke<ConfigSnapshot>('get_all_configs');
      setConfig(snapshot);
    } catch (error) {
      console.error('[CONFIG] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>⚡ Chargement de la configuration...</div>;
  if (!config) return <div>❌ Erreur de chargement</div>;

  return (
    <div className="configuration-hub">
      <h1>🎯 Configuration Hub</h1>

      <Tabs>
        <Tabs.Tab label="System" icon="⚙️">
          <ConfigSection title="Runtime">
            <ConfigField
              label="Ollama URL"
              value={config.runtime.ollama_url}
              readOnly
            />
            <ConfigField
              label="Ollama Model"
              value={config.runtime.ollama_model}
              readOnly
            />
            <ConfigField
              label="Secrets Mode"
              value={config.runtime.secrets_mode}
              readOnly
            />
          </ConfigSection>
        </Tabs.Tab>

        <Tabs.Tab label="AI" icon="🤖">
          <ConfigSection title="Chat Engine">
            <ConfigField
              label="Response Timeout"
              value={`${config.chat_engine.response_timeout}s`}
              readOnly
            />
            <ConfigField
              label="Stream Chunk Size"
              value={config.chat_engine.stream_chunk_size}
              readOnly
            />
            <ConfigField
              label="Memory Context Tokens"
              value={config.chat_engine.memory_context_tokens}
              readOnly
            />
          </ConfigSection>
        </Tabs.Tab>

        <Tabs.Tab label="Performance" icon="⚡">
          {/* TODO: Performance configs */}
        </Tabs.Tab>
      </Tabs>

      <div className="config-actions">
        <button onClick={loadConfig}>🔄 Recharger</button>
      </div>
    </div>
  );
};
```

**3. Frontend - Configuration Components**

`src/components/config/ConfigSection.tsx`
```typescript
interface ConfigSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({ title, children }) => {
  return (
    <section className="config-section">
      <h3>{title}</h3>
      <div className="config-fields">
        {children}
      </div>
    </section>
  );
};
```

`src/components/config/ConfigField.tsx`
```typescript
interface ConfigFieldProps {
  label: string;
  value: string | number | boolean;
  readOnly?: boolean;
  type?: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  onChange?: (value: any) => void;
  helpText?: string;
}

export const ConfigField: React.FC<ConfigFieldProps> = ({
  label,
  value,
  readOnly = false,
  type = 'text',
  onChange,
  helpText,
}) => {
  return (
    <div className="config-field">
      <label>{label}</label>
      {type === 'text' && (
        <input
          type="text"
          value={value as string}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {type === 'boolean' && (
        <input
          type="checkbox"
          checked={value as boolean}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.checked)}
        />
      )}
      {helpText && <small>{helpText}</small>}
    </div>
  );
};
```

**4. Router Integration**

`src/App.tsx` - Ajouter la route
```typescript
<Route path="/configuration" element={
  <ErrorBoundary context="ConfigurationHub">
    <ConfigurationHub />
  </ErrorBoundary>
} />
```

**5. Sidebar Item**

`src/App.tsx` - sidebarItems
```typescript
{ id: '/configuration', label: 'Configuration', icon: '🎯', badge: 'PHASE2' },
```

---

### Jour 3-4 : Édition + Sauvegarde

#### Objectif
Permettre l'édition de RuntimeConfig et sauvegarder les modifications.

#### Fichiers à Modifier/Créer

**1. Backend - Extend RuntimeConfig**

`src-tauri/src/runtime_config.rs` - Ajouter commande save
```rust
#[tauri::command]
pub async fn update_runtime_config(
    new_config: RuntimeConfig,
    state: State<'_, Mutex<RuntimeConfigState>>,
) -> Result<(), String> {
    // Validate config
    if new_config.ollama_url.is_empty() {
        return Err("Ollama URL cannot be empty".to_string());
    }

    // Save to file
    let config_path = /* ... */;
    let json = serde_json::to_string_pretty(&new_config)
        .map_err(|e| e.to_string())?;
    fs::write(config_path, json)
        .map_err(|e| e.to_string())?;

    // Update in-memory state
    let mut state = state.lock().unwrap();
    state.current = new_config;

    Ok(())
}
```

**2. Backend - Persistence Layer**

`src-tauri/src/config/persistence.rs` (nouveau)
```rust
use std::path::PathBuf;
use std::fs;
use serde::{Serialize, Deserialize};

pub fn save_config<T: Serialize>(
    filename: &str,
    config: &T,
) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let path = config_dir.join(filename);

    let json = serde_json::to_string_pretty(config)
        .map_err(|e| e.to_string())?;

    fs::write(path, json)
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn load_config<T: for<'de> Deserialize<'de>>(
    filename: &str,
) -> Result<T, String> {
    let config_dir = get_config_dir()?;
    let path = config_dir.join(filename);

    if !path.exists() {
        return Err(format!("Config file not found: {}", filename));
    }

    let content = fs::read_to_string(path)
        .map_err(|e| e.to_string())?;

    serde_json::from_str(&content)
        .map_err(|e| e.to_string())
}

fn get_config_dir() -> Result<PathBuf, String> {
    let app_data = std::env::var("APPDATA")
        .or_else(|_| std::env::var("HOME"))
        .map_err(|_| "Cannot find config directory".to_string())?;

    let config_dir = PathBuf::from(app_data)
        .join(".config")
        .join("TITANE")
        .join("config");

    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)
            .map_err(|e| e.to_string())?;
    }

    Ok(config_dir)
}
```

**3. Frontend - Config Provider**

`src/providers/ConfigProvider.tsx` (nouveau)
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ConfigContextType {
  config: ConfigSnapshot | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;

  reload: () => Promise<void>;
  updateField: (domain: string, key: string, value: any) => void;
  save: () => Promise<void>;
  reset: () => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [originalConfig, setOriginalConfig] = useState<ConfigSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await invoke<ConfigSnapshot>('get_all_configs');
      setConfig(snapshot);
      setOriginalConfig(snapshot);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (domain: string, key: string, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [domain]: {
        ...config[domain],
        [key]: value,
      },
    });
  };

  const save = async () => {
    if (!config) return;
    try {
      await invoke('update_runtime_config', { newConfig: config.runtime });
      // TODO: save other domains
      await reload(); // Reload to confirm changes
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  const reset = () => {
    setConfig(originalConfig);
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <ConfigContext.Provider value={{
      config,
      loading,
      error,
      isDirty,
      reload,
      updateField,
      save,
      reset,
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
```

**4. Frontend - Update ConfigurationHub**

`src/pages/ConfigurationHub.tsx` - Ajouter édition
```typescript
export const ConfigurationHub: React.FC = () => {
  const { config, loading, isDirty, updateField, save, reset } = useConfig();

  const handleSave = async () => {
    try {
      await save();
      showToast('✅ Configuration sauvegardée');
    } catch (error) {
      showToast('❌ Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="configuration-hub">
      {/* ... */}

      <ConfigField
        label="Ollama URL"
        value={config.runtime.ollama_url}
        onChange={(value) => updateField('runtime', 'ollama_url', value)}
        helpText="URL du serveur Ollama local"
      />

      {/* ... */}

      <div className="config-actions">
        <button onClick={handleSave} disabled={!isDirty}>
          💾 Sauvegarder
        </button>
        <button onClick={reset} disabled={!isDirty}>
          ↩️ Annuler
        </button>
        <button onClick={reload}>
          🔄 Recharger
        </button>
      </div>
    </div>
  );
};
```

---

### Jour 5-6 : Hot-Reload System

#### Objectif
Détecter les changements de fichiers config et recharger automatiquement.

#### Dépendances Rust

`src-tauri/Cargo.toml`
```toml
[dependencies]
notify = "6.1"
```

#### Fichiers à Créer

**1. Backend - File Watcher**

`src-tauri/src/config/watcher.rs` (nouveau)
```rust
use notify::{Watcher, RecursiveMode, Event, EventKind};
use notify::event::ModifyKind;
use tauri::{AppHandle, Manager};
use std::path::Path;
use std::sync::mpsc::channel;
use std::time::Duration;

pub fn start_config_watcher(app: AppHandle) {
    std::thread::spawn(move || {
        let (tx, rx) = channel();

        let mut watcher = notify::recommended_watcher(move |res: Result<Event, _>| {
            if let Ok(event) = res {
                tx.send(event).unwrap();
            }
        }).expect("Failed to create file watcher");

        let config_dir = get_config_dir().expect("Cannot find config dir");
        watcher.watch(&config_dir, RecursiveMode::Recursive)
            .expect("Failed to watch config directory");

        println!("🔍 [CONFIG-WATCHER] Watching directory: {:?}", config_dir);

        loop {
            match rx.recv_timeout(Duration::from_millis(100)) {
                Ok(event) => {
                    if let EventKind::Modify(ModifyKind::Data(_)) = event.kind {
                        println!("📝 [CONFIG-WATCHER] File changed, reloading...");

                        // Wait a bit for file write to complete
                        std::thread::sleep(Duration::from_millis(100));

                        // Reload config
                        match load_all_configs() {
                            Ok(snapshot) => {
                                // Emit event to frontend
                                app.emit_all("config-changed", snapshot)
                                    .expect("Failed to emit config-changed event");
                                println!("✅ [CONFIG-WATCHER] Config reloaded and emitted");
                            }
                            Err(e) => {
                                eprintln!("❌ [CONFIG-WATCHER] Failed to reload: {}", e);
                            }
                        }
                    }
                }
                Err(std::sync::mpsc::RecvTimeoutError::Timeout) => continue,
                Err(e) => {
                    eprintln!("❌ [CONFIG-WATCHER] Error: {}", e);
                    break;
                }
            }
        }
    });
}
```

**2. Backend - Main Integration**

`src-tauri/src/main.rs` - Ajouter après builder
```rust
mod config;

// After app.run()
builder.setup(|app| {
    // Start config file watcher
    config::watcher::start_config_watcher(app.handle());

    Ok(())
})
```

**3. Frontend - Event Listener**

`src/providers/ConfigProvider.tsx` - Ajouter listener
```typescript
import { listen } from '@tauri-apps/api/event';

useEffect(() => {
  const setupListener = async () => {
    const unlisten = await listen<ConfigSnapshot>('config-changed', (event) => {
      console.log('🔄 [CONFIG] Configuration changed, reloading...');
      setConfig(event.payload);
      setOriginalConfig(event.payload);
      showToast('⚡ Configuration rechargée automatiquement');
    });

    return unlisten;
  };

  let unlisten: (() => void) | null = null;
  setupListener().then((fn) => { unlisten = fn; });

  return () => {
    if (unlisten) unlisten();
  };
}, []);
```

---

### Jour 7-8 : Config Profiles + Validation

#### Objectif
Ajouter profiles prédéfinis et validation avancée.

#### Fichiers à Créer

**1. Backend - Config Profiles**

`src-tauri/src/config/profiles.rs` (nouveau)
```rust
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigProfile {
    pub name: String,
    pub description: String,
    pub configs: ConfigSnapshot,
    pub created_at: u64,
}

#[tauri::command]
pub async fn list_config_profiles() -> Result<Vec<ConfigProfile>, String> {
    let profiles_dir = get_config_dir()?.join("profiles");
    let mut profiles = Vec::new();

    for entry in fs::read_dir(profiles_dir).map_err(|e| e.to_string())? {
        let path = entry.map_err(|e| e.to_string())?.path();
        if path.extension() == Some("json".as_ref()) {
            let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
            let profile: ConfigProfile = serde_json::from_str(&content)
                .map_err(|e| e.to_string())?;
            profiles.push(profile);
        }
    }

    Ok(profiles)
}

#[tauri::command]
pub async fn load_profile(name: String) -> Result<ConfigSnapshot, String> {
    let path = get_config_dir()?
        .join("profiles")
        .join(format!("{}.json", name));

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let profile: ConfigProfile = serde_json::from_str(&content)
        .map_err(|e| e.to_string())?;

    Ok(profile.configs)
}

#[tauri::command]
pub async fn save_profile(
    name: String,
    description: String,
    configs: ConfigSnapshot,
) -> Result<(), String> {
    let profile = ConfigProfile {
        name: name.clone(),
        description,
        configs,
        created_at: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };

    let profiles_dir = get_config_dir()?.join("profiles");
    fs::create_dir_all(&profiles_dir).map_err(|e| e.to_string())?;

    let path = profiles_dir.join(format!("{}.json", name));
    let json = serde_json::to_string_pretty(&profile)
        .map_err(|e| e.to_string())?;

    fs::write(path, json).map_err(|e| e.to_string())?;

    Ok(())
}
```

**2. Frontend - Profiles UI**

`src/components/config/ConfigProfiles.tsx` (nouveau)
```typescript
export const ConfigProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<ConfigProfile[]>([]);
  const { config, save } = useConfig();

  const loadProfiles = async () => {
    const list = await invoke<ConfigProfile[]>('list_config_profiles');
    setProfiles(list);
  };

  const applyProfile = async (name: string) => {
    const snapshot = await invoke<ConfigSnapshot>('load_profile', { name });
    // Apply to current config
    await save(); // TODO: apply snapshot
    showToast(`✅ Profile "${name}" applied`);
  };

  const saveAsProfile = async () => {
    const name = prompt('Profile name:');
    const description = prompt('Description:');
    if (!name) return;

    await invoke('save_profile', {
      name,
      description,
      configs: config,
    });

    await loadProfiles();
    showToast('✅ Profile saved');
  };

  return (
    <div className="config-profiles">
      <h3>📁 Configuration Profiles</h3>

      <div className="profile-list">
        {profiles.map((profile) => (
          <div key={profile.name} className="profile-item">
            <strong>{profile.name}</strong>
            <p>{profile.description}</p>
            <button onClick={() => applyProfile(profile.name)}>
              Load
            </button>
          </div>
        ))}
      </div>

      <button onClick={saveAsProfile}>
        💾 Save Current as Profile
      </button>
    </div>
  );
};
```

---

## 🎨 UI/UX DESIGN

### Configuration Hub Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Configuration Hub                          v19.5.2   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [⚙️ System] [🤖 AI] [⚡ Performance] [🛡️ Security] [🎨 UI]│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ System Configuration                                │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │                                                     │ │
│ │ Runtime Settings                                    │ │
│ │ ├─ Ollama URL:    [http://localhost:11434  ] 🔄    │ │
│ │ ├─ Ollama Model:  [qwen2.5:latest          ] 🔄    │ │
│ │ ├─ Data Path:     [./data                  ] 📁    │ │
│ │ └─ Secrets Mode:  [Encrypted ▼] [ephemeral|encrypted]│
│ │                                                     │ │
│ │ Paths                                               │ │
│ │ ├─ Memory Path:   [./data/memory           ] 📁    │ │
│ │ └─ Logs Path:     [./logs                  ] 📁    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📁 Configuration Profiles                           │ │
│ │ ────────────────────────────────────────────────────│ │
│ │ • Production      [Load] [Delete]                   │ │
│ │ • Development     [Load] [Delete]                   │ │
│ │ • Low Resource    [Load] [Delete]                   │ │
│ │                                                     │ │
│ │ [💾 Save as New Profile...]                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ⚠️  Unsaved changes                                     │
│                                                          │
│ [💾 Save Changes] [↩️ Reset] [🔄 Reload] [📥 Export]    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST IMPLÉMENTATION

### Jour 1-2 : Configuration Hub (Lecture Seule) ✅
- [ ] Backend: `config/mod.rs` + `get_all_configs` command
- [ ] Frontend: `ConfigurationHub.tsx` page
- [ ] Components: `ConfigSection`, `ConfigField`
- [ ] Router: Add `/configuration` route
- [ ] Sidebar: Add Configuration item
- [ ] Test: Load and display all configs

### Jour 3-4 : Édition + Sauvegarde ✅
- [ ] Backend: `update_runtime_config` command
- [ ] Backend: `config/persistence.rs` module
- [ ] Frontend: `ConfigProvider.tsx` with Context
- [ ] Frontend: Update ConfigField for editing
- [ ] Frontend: Add Save/Reset buttons
- [ ] Test: Edit and save runtime config

### Jour 5-6 : Hot-Reload System ✅
- [ ] Backend: Add `notify` dependency
- [ ] Backend: `config/watcher.rs` file watcher
- [ ] Backend: Integrate watcher in `main.rs`
- [ ] Frontend: Event listener in ConfigProvider
- [ ] Frontend: Auto-reload notification
- [ ] Test: Edit config file externally, verify auto-reload

### Jour 7-8 : Profiles + Validation ✅
- [ ] Backend: `config/profiles.rs` module
- [ ] Backend: Commands (list/load/save profiles)
- [ ] Frontend: `ConfigProfiles.tsx` component
- [ ] Frontend: Profile switcher UI
- [ ] Predefined profiles (production, dev, low-resource)
- [ ] Test: Save, load, and switch profiles

---

## 🧪 TESTS À CRÉER

### E2E Tests

`e2e/configuration.test.ts`
```typescript
test.describe('Configuration Management', () => {
  test('should display all configs', async ({ page }) => {
    await page.goto('/configuration');
    await expect(page.locator('h1')).toContainText('Configuration Hub');
    await expect(page.locator('[data-testid="config-runtime"]')).toBeVisible();
  });

  test('should edit and save config', async ({ page }) => {
    await page.goto('/configuration');
    await page.fill('[name="ollama_url"]', 'http://localhost:11435');
    await page.click('button:has-text("Sauvegarder")');
    await expect(page.locator('.toast')).toContainText('sauvegardée');
  });

  test('should hot-reload on external change', async ({ page }) => {
    // TODO: Modify config file externally
    // Verify UI updates automatically
  });

  test('should load profile', async ({ page }) => {
    await page.goto('/configuration');
    await page.click('button:has-text("Production")');
    await page.click('button:has-text("Load")');
    await expect(page.locator('.toast')).toContainText('applied');
  });
});
```

---

## 📊 MÉTRIQUES DE SUCCÈS

| Métrique | Cible |
|----------|-------|
| Configs éditables | 100% (runtime, chat, theme, etc.) |
| Hot-reload latency | < 500ms |
| Save latency | < 200ms |
| UI responsive | 60fps pendant édition |
| Profile switch time | < 1s |
| Config file size | < 50KB |
| E2E tests | 15+ scenarios |

---

## 🚀 LIVRAISON

### MVP (Jour 5)
- ✅ Configuration Hub UI (lecture + édition)
- ✅ Runtime config save/load
- ✅ Hot-reload system
- ✅ Basic validation

### Full (Jour 8)
- ✅ All configs editable
- ✅ Config profiles (save/load/switch)
- ✅ Advanced validation (Zod schemas)
- ✅ Audit log (optional)
- ✅ Export/Import (JSON)

---

**Auteur** : Claude Sonnet 4.5
**Date** : 6 Décembre 2025
**Version** : v19.5.2
**Status** : ✅ Plan Complet - Prêt à Implémenter

**Note finale** : Ce plan est conçu pour être implémenté de manière incrémentale avec des livrables testables à chaque étape. Le MVP Jour 5 apporte déjà une valeur significative avec édition + hot-reload. 🎯
