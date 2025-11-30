<!--
  TITANE_INFINITY v16.2.3 — Proprietary License
  © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
  See LICENSE.md for full legal terms (FR/EN).
-->

# 🔁 TITANE_INFINITY v16.2.3 — RELEASE NOTES

**Release Date**: November 29, 2025  
**Status**: ✅ Production-Ready  
**License**: Proprietary (FR/EN)  
**Tag**: `v16.2.3`

---
## 🎯 Focus de cette release
Stabilisation robuste des invocations Tauri + métriques déterministes + durcissement sécurité (allowlist commandes) avant itérations performance ultérieures.

---
## 🔐 Sécurité & Durcissement
- Suppression du wildcard Tauri (`command: *`) → allowlist explicite synchronisée côté frontend/backend.
- `secureInvoke`: validations (whitelist, injection, taille payload, anti-loop) + sanitation réponse.
- Environnement de test: fallback traité comme erreur pour activer retries et métriques d'échec (déterminisme).
- Retry policy raffinée: défaut noRetry pour batch/sequence; détection non-retriable (validation/permissions/4xx patterns).
- Protection streaming: structure stable pour chunk assembly (Ollama).

---
## 📊 Métriques & Observabilité
- Compteurs `failedCalls`, `totalMetrics`, `totalRetries` désormais stables après instrumentation fallback-as-error.
- `MetricsCache`: invalidations sur changement de longueur + invalidations test-side pour réduire flakiness.
- Intégration de logs de debug test-only (non activés en production) dans `ServiceMetrics.endMetric`.

---
## 🧪 Tests & Qualité
| Type | Résultat |
|------|----------|
| Unit + Integration + E2E JS/TS | 683 / 683 ✅ |
| Rust (cargo check) | ✅ |
| Clippy | 3 warnings non-critiques |
| TypeScript (`tsc --noEmit`) | 0 erreurs |

Warnings restants (délibérément différés):
- Boucle transformable en `while let` (stream parsing)  
- Fonction à 8 paramètres (future refactor struct de contexte)  
- `needless_return` mineur (secure_commands)

---
## 🚀 Build & Runtime
| Build | Statut |
|-------|--------|
| Vite (frontend) | ✅ |
| Tauri (desktop) | ✅ |
| Cargo (Rust backend) | ✅ |

Invocations: retries loggés (succès sur 2/3 ou échec final avec `RetryError`). Compression mémoire activée à 31 messages (compaction conservant 20 récents).

---
## 🔧 Changements Techniques Clés
- `src/lib/security.ts`: ajout option `treatFallbackAsError`; mode test use direct mocked invoke.
- `src/lib/serviceInvoker.ts`: passage systématique de `treatFallbackAsError: true`.
- `src/utils/tauriProtector.ts`: propagation directe des erreurs en test.
- `src/lib/serviceMetrics.ts`: debug logs test-only.
- Clippy améliorations: `unwrap_or_default`, `#[derive(Default)]`, suppression `&*` explicite, correction doc comment module santé.
- Version bump: `package.json` + `Cargo.toml` → `16.2.3`.

---
## 🧩 Backlog / Prochaines étapes
| Priorité | Tâche | Impact |
|----------|-------|--------|
| Haute | Refactor parsing loop → `while let` | Lisibilité + micro perf |
| Haute | Réduire params `handle_ollama_line` (struct) | Maintenabilité |
| Moyenne | CSP audit (éliminer `unsafe-eval` si présent) | Surface d'attaque réduite |
| Moyenne | Unwrap/expect review sur chemins réseau | Robustesse erreurs |
| Basse | Bench percentile latence (CI job) | Observabilité fine |

---
## 🛡️ Validation Sécurité (Synthèse)
- Aucun appel hors whitelist dans couche invoke.
- Anti-loop: limite 10 appels/s par commande testée (logs activés en test).
- Injection patterns: blocage `<script>`, `eval(`, `__proto__`, path traversal `../`.
- Fallback différencié: production → réponse contrôlée; tests → erreur pour fiabilité métriques.

---
## 📦 Diff Résumé (Conceptuel)
- Code modifié: service invocation, sécurité, métriques, quelques modules Rust utilitaires.
- Ajouts: rapport production readiness + release notes.

---
## ✅ Conclusion
La version `v16.2.3` est prête pour production: sécurité consolidée, métriques fiables, builds stables, tests exhaustifs verts. Les améliorations restantes sont évolutives et non bloquantes.

**Tag**: `v16.2.3` publié.  
**Recommandation**: Enchaîner avec sprint Refactor Streaming + Audit CSP.

— Fin des Release Notes —
