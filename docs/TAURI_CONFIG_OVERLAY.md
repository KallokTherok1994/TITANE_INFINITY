# 🔧 TITANE∞ Tauri Configuration System

TITANE∞ utilise un **système d'overlay** pour gérer les configurations Tauri, éliminant la redondance entre les environnements Dev et Stable.

---

## 📂 Architecture

```
TITANE_INFINITY/
├── tauri.base.json              # Configuration BASE (partagée)
├── runtime/
│   ├── dev/
│   │   └── tauri.conf.json      # Overrides DEV (extend base)
│   └── stable/
│       └── tauri.conf.json      # Overrides STABLE (extend base)
└── src-tauri/
    └── tauri.conf.json          # Config principale (référence base)
```

---

## 🎯 Principes

### 1. **tauri.base.json** (Source de vérité)

Contient TOUTES les configurations partagées:
- ✅ **Security**: CSP, assetProtocol, capabilities
- ✅ **Permissions**: Allowlist complète (commands autorisées)
- ✅ **Bundle icons**: Chemins icônes
- ✅ **Tray icon**: Configuration système tray

**Ne PAS définir**:
- ❌ `productName` (varie selon runtime)
- ❌ `identifier` (doit être unique par runtime)
- ❌ `build` (commandes spécifiques dev/stable)
- ❌ `app.windows` (taille/devtools varient)

### 2. **runtime/dev/tauri.conf.json** (Dev overrides)

Extend `tauri.base.json` avec:
- `productName`: "Titan-Dev"
- `identifier`: "com.titane.infinity.dev"
- `version`: "26.2.0-dev" (suffix `-dev` obligatoire)
- `bundle.active`: `false` (pas de packaging en dev)
- `app.windows[0].devtools`: `true` (debug actif)
- `app.windows[1]`: Dev Monitor window (optionnel)

### 3. **runtime/stable/tauri.conf.json** (Stable overrides)

Extend `tauri.base.json` avec:
- `productName`: "Titan-Stable"
- `identifier`: "com.titane.infinity.stable"
- `version`: "26.2.0" (SANS suffix `-dev`)
- `bundle.active`: `true` (packaging production)
- `bundle.targets`: `["appimage", "deb"]` (formats Linux)
- `app.windows[0].devtools`: `false` (pas de debug en prod)

---

## 🔐 Permissions (Allowlist)

Toutes les permissions sont centralisées dans **tauri.base.json** → `app.security.capabilities[0].allow`.

### Commands autorisées (OMEGA v2):

```json
{
  "allow": [
    { "command": "get_runtime_config" },
    { "command": "singularity_get_full_state" },
    { "command": "chat_stream_message" },
    { "command": "fullbody_update_expression" },
    { "command": "tts_speak_parler" },
    // ...
    {
      "comment": "⚠️ DEPRECATED: chat_send_message - Use ConversationManager instead (OMEGA v2)",
      "command": "chat_send_message"
    }
  ]
}
```

### ⚠️ Legacy Commands

`chat_send_message` est **@deprecated** (v24.4.0) mais reste dans l'allowlist pour compatibilité rétroactive. **Utilisez ConversationManager** pour tout nouveau code.

**Retrait prévu**: v25.0.0 (Juin 2025)

---

## 🧪 Validation

### Script de validation automatique

```bash
npm run verify:tauri-configs
# OU
./scripts/verify/validate-tauri-configs.sh
```

**Vérifie**:
- ✅ Existence des 3 fichiers (base, dev, stable)
- ✅ Syntaxe JSON valide
- ✅ Identifiers uniques (dev ≠ stable)
- ✅ DevTools config (dev: true, stable: false)
- ✅ Bundle config (dev: false, stable: true)
- ✅ Versions cohérentes (dev avec `-dev` suffix)

---

## 🔄 Workflow de Modification

### Modifier une permission partagée

1. **Éditer uniquement `tauri.base.json`**
2. Ajouter command dans `app.security.capabilities[0].allow`:
   ```json
   { "command": "new_command_name" }
   ```
3. Valider:
   ```bash
   npm run verify:tauri-configs
   ```

### Modifier une config spécifique Dev/Stable

1. **Éditer `runtime/dev/tauri.conf.json` OU `runtime/stable/tauri.conf.json`**
2. Ajouter override (ne PAS dupliquer ce qui est dans base)
3. Valider:
   ```bash
   npm run verify:tauri-configs
   ```

### Ajouter une nouvelle window

Si partagée Dev+Stable:
- Ajouter dans `tauri.base.json` → `app.windows[]`

Si spécifique:
- Ajouter dans `runtime/{dev|stable}/tauri.conf.json` → `app.windows[]`

---

## 📊 Comparaison Avant/Après

### ❌ AVANT (redondance)

- `src-tauri/tauri.conf.json`: 1027 lignes
- `runtime/dev/tauri.conf.json`: 68 lignes (duplication CSP, permissions)
- `runtime/stable/tauri.conf.json`: 53 lignes (duplication CSP, permissions)
- **Total redondance**: ~500 lignes dupliquées

### ✅ APRÈS (overlay system)

- `tauri.base.json`: 120 lignes (config partagée)
- `runtime/dev/tauri.conf.json`: 30 lignes (overrides only)
- `runtime/stable/tauri.conf.json`: 25 lignes (overrides only)
- **Total**: 175 lignes (-80% redondance)

---

## 🚀 Déploiement

### Build Dev

```bash
npm run dev
# Utilise runtime/dev/tauri.conf.json + tauri.base.json
```

### Build Stable

```bash
npm run build:production
# Utilise runtime/stable/tauri.conf.json + tauri.base.json
```

---

## 🔗 Ressources

- **Tauri Config Schema**: https://schema.tauri.app/config/2.0
- **TITANE∞ Architecture**: [ARCHITECTURE.md](../ARCHITECTURE.md)
- **OMEGA v2 Spec**: [docs/OMEGA_v2_SPEC.md](../docs/OMEGA_v2_SPEC.md)

---

**Système d'overlay actif depuis v24.4.0 — Réduction 80% redondance configs** 🎉
