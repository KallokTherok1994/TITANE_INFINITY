# 05_TESTS_TO_MODULES_MAP — Mapping Tests ↔ Modules

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z

---

## Méthodologie

Extraction par grep des imports et références de chemins dans les tests.

---

## Mapping Principal

| Suite de Tests                                              | Modules Touchés                                                                                                                                                                           | Méthode                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/__tests__/architecture/engine-isolation.test.ts`       | `src/engines/**` (tous)                                                                                                                                                                   | Scan filesystem, détecte imports `@/services`, `@/lib`, `@tauri-apps` |
| `tests/contract/tauri-ipc-contract.test.ts`                 | `src/lib/ipcContract.ts`, `src/lib/tauriCommands.ts`, `src-tauri/src/commands/**`                                                                                                         | Imports directs + scan Rust                                           |
| `tests/contract/tauri.contract.test.ts`                     | IPC layer                                                                                                                                                                                 | Imports                                                               |
| `src/services/selfHealing/__tests__/selfHealing.test.ts`    | `src/services/selfHealing/selfHealingObserver.ts`, `selfHealingAnalyzer.ts`, `selfHealingPlaybookEngine.ts`, `selfHealingExecutor.ts`, `selfHealingSyncLayer.ts`, `selfHealing.config.ts` | Dynamic imports                                                       |
| `src/services/unified/__tests__/UnifiedMemory.unit.test.ts` | `src/services/unified/` (UnifiedMemory, SQLiteVectorStore, LocalEmbeddingGenerator)                                                                                                       | Direct imports                                                        |
| `src/lib/security/__tests__/policyFirewallV2.test.ts`       | `src/lib/security.ts`, PolicyFirewall                                                                                                                                                     | Direct imports                                                        |
| `src/__tests__/chatEngine.test.ts`                          | `src/engines/conversation/` (ChatEngine)                                                                                                                                                  | Direct imports                                                        |
| `tests/chat/chat.test.ts`                                   | Chat pipeline services                                                                                                                                                                    | Direct imports                                                        |
| `tests/security/advanced-security.test.ts`                  | Security layer                                                                                                                                                                            | Direct imports                                                        |
| `tests/integration/full-pipeline.test.ts`                   | Services pipeline (orchestration)                                                                                                                                                         | Imports                                                               |
| `tests/unit/cognitive/CognitiveOptimizationEngine.test.ts`  | `src/engines/cognitive/`                                                                                                                                                                  | Direct imports                                                        |
| `tests/unit/fusion/SingularityFusionEngine.test.ts`         | Singularity fusion engine                                                                                                                                                                 | Direct imports                                                        |
| `tests/phase3/gate-p3.test.ts` à `phase6/`                  | CI gates scripts                                                                                                                                                                          | FS scan                                                               |
| `tests/performance/benchmarks.test.ts`                      | Memory + pipeline services                                                                                                                                                                | Imports                                                               |

---

## Commande de Scan Import (statique)

```bash
$ grep -rn "from '../../src/lib/ipcContract'" tests/contract/
tests/contract/tauri-ipc-contract.test.ts:9: from '../../src/lib/ipcContract'
tests/contract/tauri-ipc-contract.test.ts:10: from '../../src/lib/tauriCommands'

$ grep -rn "await import(" src/services/selfHealing/__tests__/selfHealing.test.ts | head -10
line 21: await import('../selfHealingObserver')
line 130: await import('../selfHealingAnalyzer')
line 377: await import('../selfHealingPlaybookEngine')
line 610: await import('../selfHealingExecutor')
line 761: await import('../selfHealingSyncLayer')
line 886: await import('../selfHealing.config')
```

---

## Tests sans Module Couvert

| Suite                     | Lacune                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ring 2 Rust engines       | **Aucun test direct** sur `src-tauri/src/engines/unified_memory/{summarizer,embeddings}.rs` — la violation HTTP n'est pas couverte par les tests |
| TauriBridge/StateBridge   | Pas de test direct sur le contrat IPC des bridges low-level                                                                                      |
| window.fetch monkey-patch | `selfHealing.test.ts` teste les modules selfHealing mais la vérification du monkey-patch n'est pas claire                                        |

---

## Tests Critiques → FAIL Potentiel (si exécutés)

| Test                           | Module FAIL Associé                   | Impact                                                                        |
| ------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------- |
| `engine-isolation.test.ts`     | Ring 2 TS (src/engines/)              | Peut PASS car exception `tauriBridge.ts` est whitelistée                      |
| `tauri-ipc-contract.test.ts`   | TauriBridge/StateBridge invoke direct | Peut détecter des `invoke()` non enregistrés dans TAURI_COMMANDS              |
| Rust `unified_memory_tests.rs` | `engines/unified_memory/`             | **Masque la violation HTTP**: les tests testent la logique, pas la gov réseau |
