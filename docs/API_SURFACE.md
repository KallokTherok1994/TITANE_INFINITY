# API SURFACE — TITANE∞ Stable

**Version**: 26.3.0  
**Date**: 2026-01-15  
**Status**: SEALED  

---

## Objectif

Ce document définit la **surface API stable** de TITANE∞ exposée via Tauri commands. Toute modification de cette surface requiert:

1. ✅ Approbation Kevin Thibault
2. ✅ Mise à jour CAPABILITIES_REGISTRY.md
3. ✅ Tests contractuels mis à jour
4. ✅ CI capabilities-drift PASS

---

## Principes

| Principe | Description |
|----------|-------------|
| **Minimal par défaut** | Toute command commence interdite (deny-by-default) |
| **Whitelist explicite** | `src-tauri/allowlist.whitelist.stable.json` fait autorité |
| **Backward compatibility** | Commands stables ne changent pas de signature |
| **Deprecation progressive** | 2 versions minimum + warnings avant suppression |

---

## Surface stable actuelle

**Total commands**: 53  
**Allowlist**: `src-tauri/allowlist.whitelist.stable.json`  
**Registry**: `docs/CAPABILITIES_REGISTRY.md`

### Catégories

| Catégorie | Count | Permissions | Critique | Notes |
|-----------|-------|-------------|----------|-------|
| **Runtime & Config** | 3 | memory, system | ✅ | Initialization, health |
| **Onboarding** | 3 | memory, filesystem | ⚠️ | User setup |
| **Helios** | 1 | memory | ✅ | Core state |
| **Memory & Persistence** | 4 | memory, filesystem | ✅ | Snapshots, state |
| **Timeline & Projects** | 6 | memory, filesystem | ⚠️ | User data |
| **Chat & AI** | 5 | network, memory | ⚠️ | Ollama, config |
| **File Management** | 4 | filesystem, memory | ⚠️ | Import, analysis |
| **Orchestration** | 2 | memory | ✅ | Cognitive state |
| **Singularity** | 14 | memory, filesystem | ✅ | Complex state |
| **Experience & Avatar** | 7 | memory | ⚠️ | UI state |
| **TTS** | 4 | network, audio | ⚠️ | Speech synthesis |

### Permissions utilisées

| Permission | Usage | Justification |
|------------|-------|---------------|
| `memory` | 53/53 | État mémoire core (local-first) |
| `filesystem` | 16/53 | Snapshots, config, imports |
| `network` | 5/53 | Ollama (local), AI providers (opt-in) |
| `system` | 2/53 | System info, health check |
| `audio` | 2/53 | TTS output |

**Aucune permission "dangereuse"**: pas de shell, pas de process, pas d'accès système étendu.

---

## Procédure d'ajout command stable

### 1. Design review

- [ ] Command vraiment nécessaire ? (éviter duplication)
- [ ] Signature minimale et stable ?
- [ ] Permissions minimales requises ?
- [ ] Impact backward compatibility ?

### 2. Implémentation

```rust
// src-tauri/src/commands/new_feature.rs

#[tauri::command]
pub async fn new_stable_command(
    arg: String,
    state: tauri::State<'_, AppState>,
) -> Result<Response, String> {
    // Implementation
}
```

### 3. Ajout allowlist

```json
// src-tauri/allowlist.whitelist.stable.json
{
  "app": {
    "security": {
      "capabilities": [{
        "allow": [
          // ... existing commands
          {
            "command": "new_stable_command",
            "description": "Brief description",
            "permissions": ["memory"]
          }
        ]
      }]
    }
  }
}
```

### 4. Client TypeScript

```typescript
// src/lib/tauriClient.ts

export async function newStableCommand(arg: string): Promise<Response> {
  return invoke<Response>('new_stable_command', { arg });
}
```

### 5. Tests contractuels

```typescript
// tests/contract/tauri.contract.test.ts

it('should expose new_stable_command', async () => {
  const result = await tauriClient.newStableCommand('test');
  expect(result).toBeDefined();
});
```

### 6. Documentation

- [ ] Mettre à jour CAPABILITIES_REGISTRY.md (table + metadata)
- [ ] Mettre à jour ce fichier (API_SURFACE.md) section catégories
- [ ] Documenter usage dans docs spécifique si nécessaire

### 7. Validation

```bash
# CI drift check doit PASS
bash scripts/ci/check-capabilities-drift.sh

# Tests contractuels PASS
pnpm test -- tests/contract/tauri.contract.test.ts

# Build stable PASS
bash runtime/stable/build.sh
```

---

## Procédure de dépréciation

### Étape 1: Mark @deprecated (version N)

```rust
#[deprecated(since = "26.3.0", note = "Use new_replacement_command instead")]
#[tauri::command]
pub async fn old_command() -> Result<(), String> {
    log::warn!("old_command is deprecated, use new_replacement_command");
    // Keep implementation for backward compatibility
}
```

```typescript
// src/lib/tauriClient.ts

/** @deprecated Use newReplacementCommand instead */
export async function oldCommand(): Promise<void> {
  console.warn('oldCommand is deprecated');
  return invoke('old_command');
}
```

### Étape 2: Runtime warnings (version N+1)

- Logs WARN à chaque appel
- Notice dans UI si applicable
- Documentation mise à jour (CHANGELOG.md)

### Étape 3: Removal (version N+2 minimum, 6 mois)

- Retirer de allowlist stable
- Supprimer implémentation Rust
- Supprimer wrapper TS
- Mettre à jour CAPABILITIES_REGISTRY.md
- Bumper version majeure si breaking change

---

## Surface minimale garantie

Ces commands sont **garanties stables** jusqu'à TITANE∞ v30.0.0 minimum :

| Command | Since | Guarantee |
|---------|-------|-----------|
| `get_runtime_config` | v26.0.0 | ✅ Long-term |
| `get_helios_state` | v26.2.0 | ✅ Long-term |
| `memory_get_state` | v26.0.0 | ✅ Long-term |
| `write_snapshot` | v26.0.0 | ✅ Long-term |
| `read_snapshot` | v26.0.0 | ✅ Long-term |

**Migration path**: Si une de ces commands doit changer, un wrapper de compatibilité sera maintenu pendant 12 mois minimum.

---

## Guards CI

### capabilities-drift check

**Script**: `scripts/ci/check-capabilities-drift.sh`  
**Workflow**: `.github/workflows/constitution-audit.yml` (ou équivalent)

**Vérifie**:
- ✅ Command stable → registry entry
- ✅ Command stable → tests contractuels référencés
- ✅ Command stable → doc référencée
- ⚠️ Command registry mais PAS stable → dev-only OK

**Action si FAIL**: Bloquer merge/deploy jusqu'à correction.

### secret-scan

**Workflow**: `.github/workflows/secret-scan-gitleaks.yml`

**Vérifie**: Aucun secret versionné (API keys, tokens, passwords).

### stable-build

**Script**: `runtime/stable/build.sh`  
**Workflow**: `.github/workflows/stable-build.yml` (si présent)

**Vérifie**: Build stable reproductible, allowlist respectée, artefacts propres.

---

## Références

- **Allowlist stable**: `src-tauri/allowlist.whitelist.stable.json`
- **Registry capacités**: `docs/CAPABILITIES_REGISTRY.md`
- **Tests contractuels**: `tests/contract/tauri.contract.test.ts`
- **Client TypeScript**: `src/lib/tauriClient.ts`
- **Commands Rust**: `src-tauri/src/commands/`

---

## Versioning

**Semantic versioning strict**:
- **MAJOR**: Breaking change surface API (command supprimée, signature changée)
- **MINOR**: Nouvelle command ajoutée (backward compatible)
- **PATCH**: Bug fix sans impact surface

**Version actuelle**: 26.3.0  
**Prochaine minor**: 26.4.0 (ajout commands stables)  
**Prochaine major**: 27.0.0 (breaking changes allowlist)

---

**SEALED**: PHASE_5 (2026-01-15)  
**Mainteneur**: Kevin Thibault (TITANE∞)  
**Révision**: À chaque modification allowlist stable
