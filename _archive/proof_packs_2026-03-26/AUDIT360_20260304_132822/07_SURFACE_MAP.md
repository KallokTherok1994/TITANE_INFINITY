# 07_SURFACE_MAP — Cartographie complète des surfaces

**Session:** AUDIT360_20260304_173436 (continuation de AUDIT360_20260304_132822)
**Horodatage UTC:** 2026-03-04T17:34:36Z
**Version:** 27.2.0

---

## Domaine 1 — UI/Navigation

| Surface                                   | Chemin                               | Statut           |
| ----------------------------------------- | ------------------------------------ | ---------------- |
| App root + routing                        | `src/App.tsx`                        | STABLE           |
| TopNav / MobileNav                        | `src/components/layout/`             | STABLE           |
| AppShell                                  | `src/components/layout/AppShell.tsx` | STABLE           |
| Pages (88 routes déclarées)               | `src/pages/`                         | STABLE/DEV mixte |
| Onboarding                                | `src/components/Onboarding/`         | STABLE           |
| ErrorBoundary + AutoHealErrorBoundary     | `src/components/*.tsx`               | STABLE           |
| Toast notifications                       | `src/ui/components/Toast.tsx`        | STABLE           |
| PageLoadingFallback (lazyWithTimeout 20s) | `src/ui/components/`                 | STABLE           |
| Design System                             | `src/design-system/`                 | EXPERIMENTAL     |

**Commande de preuve :**

```bash
grep -c "path=" src/App.tsx
# => 88 routes
```

---

## Domaine 2 — Chat IA / Orchestrateur

| Surface                             | Chemin                                            | Statut           |
| ----------------------------------- | ------------------------------------------------- | ---------------- |
| ConversationSection (UI principale) | `src/components/sections/ConversationSection.tsx` | STABLE           |
| useConversationEngine               | `src/hooks/useConversationEngine.ts`              | STABLE           |
| ConversationManager                 | `src/services/ai/ConversationManager.ts`          | STABLE           |
| AI Router (multi-provider)          | `src/services/ai/`                                | STABLE           |
| Providers (10)                      | `src/services/ai/providers/`                      | DEV/STABLE mixte |
| HybridTTS                           | `src/services/audio/`                             | STABLE (local)   |
| ModeBuilder                         | `src/components/chat/`                            | STABLE           |
| Streaming transport                 | `src/services/ai/transports/`                     | STABLE           |
| Overdrive orchestrator              | `src-tauri/src/overdrive/`                        | STABLE           |

**Providers actifs :**

- `ollama.ts` (fallback local — STABLE)
- `gemini.ts` (cloud — clé API requise)
- `openai.ts` (cloud — clé API requise)
- `claude.ts` / `anthropic` (cloud — clé API requise)
- `copilot.ts` (cloud — clé API requise)
- `glm46v.ts` (cloud — clé API requise)
- `titaneLocal.ts` (local — STABLE)
- `tauriChat.ts` (bridge IPC)
- `fallback.ts` (offline generator — obligatoire selon constitution)

---

## Domaine 3 — Mémoire (STM/MTM/LTM)

| Surface                 | Chemin                                      | Statut       |
| ----------------------- | ------------------------------------------- | ------------ |
| Memory OS API           | `src-tauri/src/api/memory_api.rs`           | STABLE       |
| MemorySection UI        | `src/components/sections/MemorySection.tsx` | STABLE       |
| MemoryEvolutionCenter   | `src/components/MemoryEvolution/`           | STABLE       |
| Persistence / Snapshots | `src-tauri/src/persistence/`                | STABLE       |
| useChatMemoryCache      | `src/hooks/useChatMemoryCache.ts`           | STABLE       |
| RAG semantic recall     | `src-tauri/src/` (module knowledge)         | EXPERIMENTAL |
| Neural memory           | `src-tauri/src/neural_memory/`              | EXPERIMENTAL |

**Commandes IPC mémoire actives :** `memory_os_store`, `memory_recall_keyword`, `memory_recall_semantic`, `memory_stats`, `memory_consolidate`, `write_snapshot`, `read_snapshot`, `titan_force_snapshot`, `titan_recover_state`

---

## Domaine 4 — IPC / Backend

| Surface                         | Chemin                           | Statut |
| ------------------------------- | -------------------------------- | ------ |
| tauriClient (gateway canonique) | `src/lib/tauriClient.ts`         | STABLE |
| secureInvoke + ALLOWED_COMMANDS | `src/lib/security.ts`            | STABLE |
| safeInvoke wrapper              | `src/utils/invoke.ts`            | STABLE |
| tauriProtector (validation)     | `src/utils/tauriProtector.ts`    | STABLE |
| IPC error classification        | `src/lib/errorClassification.ts` | STABLE |
| TauriBridge (os/bridge)         | `src/os/bridge/TauriBridge.ts`   | STABLE |
| StateBridge                     | `src/os/bridge/StateBridge.ts`   | STABLE |

**Total commandes Tauri exposées :**

```bash
grep -rn "#[tauri::command]" src-tauri/src/ --include="*.rs" | wc -l
# => 1261 annotations (incluant les sous-modules)
```

---

## Domaine 5 — Moteurs (Ring 2)

| Surface                     | Chemin                                                 | Statut                  |
| --------------------------- | ------------------------------------------------------ | ----------------------- |
| Engines Ring 2 (26 modules) | `src/engines/`                                         | QUALIFIED               |
| selfHealingEngine           | `src/engines/selfHealing/selfHealingEngine.ts`         | ⚠️ RING VIOLATION (I/O) |
| cognitiveLayoutIntegrations | `src/engines/cognitive/cognitiveLayoutIntegrations.ts` | ⚠️ RING VIOLATION (I/O) |
| singularityEngine           | `src/core/engines/SINGULARITY_ENGINE.ts`               | STABLE                  |
| autoRcaEngine               | `src/engines/selfHealing/autoRcaEngine.ts`             | QUALIFIED               |

**Ring 2 I/O violations confirmées (RV-001, RV-002) :**

```bash
grep -n "safeInvoke\|tauriClient\|queryOllama" src/engines/selfHealing/selfHealingEngine.ts
# => safeInvoke (ligne 12), queryOllama (implicite via utils)
grep -n "tauriClient" src/engines/cognitive/cognitiveLayoutIntegrations.ts
# => tauriClient (ligne 9)
```

---

## Domaine 6 — Sécurité

| Surface                               | Chemin                                     | Statut    |
| ------------------------------------- | ------------------------------------------ | --------- |
| CSP Tauri stricte                     | `src-tauri/tauri.conf.json`                | STABLE    |
| argon2 / aes-gcm / ed25519 / zeroize  | `src-tauri/Cargo.toml`                     | STABLE    |
| LRU cache (RUSTSEC-2026-0002 corrigé) | `src-tauri/Cargo.toml` — `lru 0.16`        | CORRIGÉ   |
| DB service Mutex unwrap               | `src-tauri/src/services/db_service.rs`     | ⚠️ MINEUR |
| Network policy guard                  | `src-tauri/src/services/network_policy.rs` | STABLE    |

---

## Domaine 7 — Infrastructure de test

| Surface               | Chemin                              | Statut          |
| --------------------- | ----------------------------------- | --------------- |
| Vitest (242 fichiers) | `src/__tests__/`, `tests/`          | STABLE          |
| Playwright E2E        | `e2e/`, `playwright.config.ts`      | BLOCKED_RUNTIME |
| Wrapper E2E           | `scripts/e2e/tauri-wrapper.sh`      | PRÊT            |
| Tests Rust            | `src-tauri/tests/`                  | STABLE          |
| Gates scripts         | `scripts/gates/`, `scripts/verify/` | STABLE          |
| CI workflows          | `.github/workflows/` — 43 fichiers  | STABLE          |
