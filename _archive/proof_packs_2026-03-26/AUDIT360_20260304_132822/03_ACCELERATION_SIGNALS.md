# 03_ACCELERATION_SIGNALS — Signaux d'accélération et risques

**Session:** AUDIT360_20260304_132822  
**Horodatage UTC:** 2026-03-04T13:28:22Z

---

## Signaux positifs (accélérateurs)

| Signal                    | Description                                                           | Impact                     |
| ------------------------- | --------------------------------------------------------------------- | -------------------------- |
| ✅ Versions synchronisées | `27.2.0` aligné sur 4 fichiers                                        | Fiabilité PROD             |
| ✅ Certification v27.2.0  | `TITANE_INFINITY_RELEASE_20260224_211317_CERTIFIED`                   | Confiance release          |
| ✅ Fix RUSTSEC-2026-0002  | `lru 0.16` (était 0.12) — vulnérabilité corrigée                      | Sécurité                   |
| ✅ CSP stricte Tauri      | `default-src 'self' tauri: asset:` — aucun objet/frame                | Sécurité                   |
| ✅ Fix SEC-005            | Cache AI router restaure le vrai provider (fini le hardcoding Gemini) | Correction comportementale |
| ✅ Fix PERF-001           | Branche Gemini lit le statut internet depuis le cache (économie ~3s)  | Performance                |
| ✅ Fix BONUS-001          | Branche Ollama lit la disponibilité depuis le cache                   | Performance                |
| ✅ Fix BONUS-003          | `health_check()` Gemini attend correctement `c.is_available()`        | Exactitude                 |
| ✅ Fix PERF-003           | `AIProvider::UnifiedIA` variant ajoutée                               | Complétude                 |
| ✅ MAP files présents     | 6/6 fichiers MAP canoniques présents                                  | Gouvernance                |
| ✅ proof_packs massif     | Plus de 3000 manifestes SHA256 (programmes p21→p3975)                 | Traçabilité                |

---

## Risques identifiés (findings ouverts hérités)

| ID            | Priorité | Description                                                                | Ring impacté | Action requise                                |
| ------------- | -------- | -------------------------------------------------------------------------- | ------------ | --------------------------------------------- |
| IPC-004       | P1       | `SecureResponse.data` vs `content` — 100+ callsites                        | Ring 3/4     | Refactorisation progressive, sprint dédié     |
| RV-001        | P1       | `selfHealingEngine` en Ring 2 avec potentiel I/O                           | Ring 2       | Refactorisation Ring 2→Ring 3                 |
| RV-002        | P1       | Refactorisation Ring 2 nécessaire                                          | Ring 2       | Planifier sprint architecture                 |
| PERF-002      | P2       | `stream_response` faux chunking (providers retournent la réponse complète) | Ring 3/4     | Refactorisation `ProviderBridge` streaming    |
| IPC-CANON-001 | P2       | `generate_response` ne retourne pas `{ok,content,error}`                   | Ring 4       | Mise en conformité IPC — aucun impact runtime |

---

## Risques structurels observés

| Observation                                              | Risque                                               | Recommandation                               |
| -------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------- |
| Racine dépôt : ~80+ fichiers/artefacts de session à plat | Commits accidentels d'artefacts temporaires          | `.gitignore` renforcé ou dossier `_archive/` |
| `reqwest 0.11` (Rust)                                    | Version ancienne, 0.12 stable depuis 2024            | Évaluer migration dans un sprint dédié       |
| `recharts` épinglé à `3.6.0` sans `^`                    | Correctifs de sécurité non appliqués automatiquement | Surveiller advisories                        |
| `vitest` épinglé à `4.0.18`                              | Idem                                                 | Surveiller advisories                        |

---

## Signaux E2E

| État                  | Description                                                                     |
| --------------------- | ------------------------------------------------------------------------------- |
| `BLOCKED_E2E_RUNTIME` | Runtime Tauri non disponible en environnement CI sandbox                        |
| Wrapper E2E           | `scripts/e2e/tauri-wrapper.sh` présent — prêt pour exécution avec runtime Tauri |
| Tests unitaires       | Infrastructure vitest opérationnelle                                            |
| Tests architecture    | `pnpm test:architecture` disponible                                             |

---

## Résumé de santé globale

**Santé globale : QUALIFIÉE avec findings P1 différés.**

Les findings P1 (IPC-004, RV-001, RV-002) sont connus et documentés. Ils n'ont pas d'impact runtime mais représentent une dette de gouvernance à planifier.
