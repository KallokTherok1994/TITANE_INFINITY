# GATES REPORT

## Gates Activées

| Gate | Requise | Exécutée | Preuve | Verdict | Commentaire |
|---|---|---|---|---|---|
| **G_BOOT_TRUTH** | ✅ | ✅ statique | main.tsx + boot-diagnostics.ts + tauri-init-fix.ts présents | **PASS (statique)** | Boot markers code confirmé |
| **G_RING_INTEGRITY** | ✅ | ✅ statique | Ring 2 frontend: zero fetch direct. Cloud APIs via IPC Rust | **PASS (statique)** | One Door respecté |
| **G_FRONTEND_NO_WEB** | ✅ | ✅ scan | Aucun fetch/axios/XHR direct dans src/ (hors localhost + static SVG) | **PASS (statique)** | ✅ |
| **G_NETWORK_ONE_DOOR** | ✅ | ✅ statique | Cloud APIs: UI → IPC → Rust → HTTP → External | **PASS (statique)** | PermissionGuard + RateLimiter |
| **G_NO_LYING_FALLBACK** | ✅ | ✅ | engine_get_evolution_state → STUB retourne état fictif | **FAIL** | Stub UI mensonge actif (UI-001) |
| **G_PROVIDER_META_TRUTH** | ✅ | ✅ | chat_get_providers_status IPC réel. Providers cloud = key-gated explicite | **PARTIAL** | Providers non disponibles peuvent apparaître sélectionnables |
| **G_COMMAND_TRUTH** | ✅ | ✅ | 8 stubs catalogués. send_message = Err(). Modules désactivés listés | **PARTIAL** | Stubs présents mais documentés |
| **G_ROUTER_REALITY** | ✅ | ✅ | AIOrchestrator = stats-based cascade. RouterEngine.classify = partial | **PARTIAL_ROUTER** | Pas de routage sémantique prouvé |
| **G_LOCAL_MEMORY_TRUTH** | ✅ | ✅ | SQLite + MemoryEngine dans pipeline. LTM off default | **PARTIAL** | Code complet, runtime UNKNOWN |
| **G_STM_MTM_LTM_REALITY** | ✅ | ✅ | Structures Rust présentes. Consolidation code. LTM désactivée | **PARTIAL_MULTI_TIER** | Promotion runtime non prouvée |
| **G_AUTOHEAL_BOUNDED** | ✅ | ✅ | 20+ règles explicites. pick_fallback_model documenté | **PASS** | Autoheal ne masque pas la réalité |
| **G_E2E_RUNNER_AUTHORITY** | ✅ | ⚠️ | e2e test fichier unstaged. WDIO config présent | **PARTIAL** | Non exécuté dans cet audit |
| **G_E2E_NO_REAL_WRITES** | ✅ | ⚠️ | E2E mock conv ID utilisé (e2e-conv-N). Isolation E2E documentée | **PARTIAL** | Pattern e2e-conv présent dans code |
| **G_TESTS_X3** | ✅ | ❌ | Aucune exécution runtime | **UNKNOWN** | Tests non lancés |
| **G_BUILD_X3** | ✅ | ❌ | Aucun build exécuté | **UNKNOWN** | Dernière preuve: commit 32b2273f4 |
| **G_VERSION_SYNC** | ✅ | ✅ | main.rs: v26.4.0 ≠ git tag: v28.0.0 | **FAIL** | Décalage version header |

## Synthèse Gates

| Verdict | Gates |
|---|---|
| ✅ PASS | G_BOOT_TRUTH, G_RING_INTEGRITY, G_FRONTEND_NO_WEB, G_NETWORK_ONE_DOOR, G_AUTOHEAL_BOUNDED |
| ❌ FAIL | G_NO_LYING_FALLBACK (evolution stub), G_VERSION_SYNC |
| ⚠️ PARTIAL | G_PROVIDER_META_TRUTH, G_COMMAND_TRUTH, G_ROUTER_REALITY, G_LOCAL_MEMORY_TRUTH, G_STM_MTM_LTM_REALITY, G_E2E_RUNNER_AUTHORITY, G_E2E_NO_REAL_WRITES |
| ❓ UNKNOWN | G_TESTS_X3, G_BUILD_X3 |

## Actions Requises pour PASS Complet

1. **G_NO_LYING_FALLBACK**: Labelliser `engine_get_evolution_state` comme STUB dans l'UI ou désactiver le panel
2. **G_VERSION_SYNC**: Mettre à jour le header `main.rs` de v26.4.0 → v28.0.0
3. **G_TESTS_X3**: Exécuter `cargo test --features full` ×3 avec zéro failure
4. **G_BUILD_X3**: Exécuter `cargo check --features full` ×3 clean
5. **G_E2E_RUNNER_AUTHORITY**: Committer e2e test unstaged avant release
