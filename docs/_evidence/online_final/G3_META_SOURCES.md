# G3 META SOURCES — ONLINE-FINAL

## Single Source of Truth pour mode/provider_used/network_used/reason_code

### Backend (Rust) — Source Primaire

**Fichier canonique** : `src-tauri/src/conversation_engine/meta_accumulator.rs`

Fonctions productrices de meta :
| Fonction | Rôle | Ligne |
|----------|------|-------|
| `build_success_meta(provider_used, latency_ms)` | Meta pour réponse réussie | ~80 |
| `build_offline_meta(reason_code, policy)` | Meta pour fallback offline | ~105 |
| `build_timeout_meta(network_available)` | Meta pour timeout | ~140 |
| `build_decision_meta(...)` | Fonction de bas niveau | ~58 |
| `mode_from(provider_class, provider_id, reason_code)` | Dérive le mode | ~27 |

**Dataflow backend** :
```
conversation_generate (commands.rs)
  → ConversationEngineState::process_message (mod.rs)
    → AI provider (Gemini/Ollama/Local)
      → build_success_meta() | build_offline_meta() | build_timeout_meta()
        → ProviderDecisionMeta { mode, provider_used, network_used, reason_code }
          → JSON IPC → Frontend
```

### Frontend (TypeScript) — Consommateur + Guard

**Fichier** : `src/services/conversationEngine.ts`
- `normalizeProviderMeta(raw)` : désérialise le meta du backend
- Patch P0 appliqué : policy-blocked path utilise `mode: 'LOCAL'` (non 'REMOTE')

**Fichier** : `src/types/providerDecisionMeta.ts` (Ring 1 guard)
- `validateProviderDecisionMeta(meta)` : valide les invariants
- `clampProviderDecisionMeta(meta)` : corrige les violations avec log

**Fichier** : `src/hooks/useConversationEngine.ts`
- Guard frontend `NO_LYING_VIOLATION_FRONTEND` sur REMOTE+!network_used

## P0 Violations Identifiées et Corrigées

### V3 — commands.rs:101 (Rust backend — NOUVEAU)
**Problème** : Backend gate retourne `"mode": "REMOTE"` avec `"network_used": false`
**Correction** : `"mode": "LOCAL"` (provider bloqué = local_only, pas remote)
**Fichier** : `src-tauri/src/conversation_engine/commands.rs`

### V1/V2 — conversationEngine.ts (TypeScript frontend — DÉJÀ CORRIGÉ)
**Corrigé** dans session précédente (online_first_vΩ).

## Invariants imposés (impossibles à violer)

1. `mode === "REMOTE" ⟹ network_used === true` ✅
2. `provider_used === "local_only" ⟹ mode !== "REMOTE"` ✅
3. `network_used === false ⟹ mode !== "REMOTE"` (découle de 1) ✅
4. Fallback toujours avec `reason_code` stable ✅

## Gate G3: PASS (après fix commands.rs)
