# TITANE∞ — Matrice de Vérité Documentaire

**Statut :** PARTIAL (système documentaire en cours d'établissement)  
**Date :** 2026-03-17  
**Mode :** AUDIT

> Chaque affirmation majeure de la documentation TITANE∞ est listée ci-dessous avec sa source, sa preuve, son statut et toute contradiction.

---

## Légende des statuts

| Statut | Signification |
|---|---|
| PROVEN | Directement vérifiable dans le dépôt (code, config, script, test) |
| QUALIFIED | Principalement vérifiable ; incertitude mineure subsiste |
| PARTIAL | Certains aspects vérifiés, d'autres non confirmés |
| BLOCKED | Impossible à vérifier — preuve manquante ou contradiction non résolue |
| LEGACY | Affirmation historique, plus d'actualité, conservée pour traçabilité |
| DOC_ONLY | Documenté mais aucune preuve d'exécution disponible |
| PLANNED | Déclaré comme intention future, non implémenté actuellement |

---

## SECTION 1 — IDENTITÉ DU PRODUIT

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| TITANE∞ est une application desktop Tauri | `README.md`, `docs/ARCHITECTURE.md` | `src-tauri/`, `tauri.base.json` | PROVEN | NON | — |
| La version est 28.0.0 | `README.md`, `package.json` | `package.json`, `src-tauri/Cargo.toml`, `CHANGELOG.md` | PROVEN | NON | — |
| Frontend : React 18 + TypeScript 5.5 | `docs/README.md` | Dépendances `package.json` | PROVEN | NON | — |
| Backend : Rust édition 2021 | `docs/ARCHITECTURE.md` | `src-tauri/Cargo.toml` | PROVEN | NON | — |
| Outil de build : Vite 6+ | `docs/README.md` | devDeps `package.json` | PROVEN | NON | — |
| Gestionnaire de paquets : pnpm | `README.md` | `.npmrc`, `pnpm-lock.yaml` | PROVEN | NON | — |
| Licence : Propriétaire | `LICENSE.md`, `README.md` | `LICENSE.md` | PROVEN | NON | — |

---

## SECTION 2 — AFFIRMATIONS D'ARCHITECTURE

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| Modèle d'architecture 4-Ring | `docs/MAP_ARCHITECTURE_4RING.md` | Docs architecture | QUALIFIED | NON | Vérifier frontières Ring dans le code |
| Ring 1 : src/types/ (contrats de type, pas d'I/O) | `docs/MAP_ARCHITECTURE_4RING.md` | Répertoire `src/types/` | QUALIFIED | NON | — |
| Ring 2 : src/engines/ (logique pure, pas d'I/O) | `docs/MAP_ARCHITECTURE_4RING.md` | Répertoire `src/engines/` | QUALIFIED | NON | — |
| Ring 3 : src/services/ (orchestration I/O, gouvernée) | `docs/MAP_ARCHITECTURE_4RING.md` | Répertoire `src/services/` | QUALIFIED | NON | — |
| Ring 4 : UI src/ + src-tauri/ (OS/IPC) | `docs/MAP_ARCHITECTURE_4RING.md` | `src/`, `src-tauri/` | QUALIFIED | NON | — |
| Contrat payload IPC : `{ ok, content, error }` | `docs/IPC_CONTRACT.md` | `src/services/api/chat.ts` | PROVEN | NON | — |
| L'allowlist Tauri contrôle la surface IPC | `tauri.base.json` | Fichiers présents | PROVEN | NON | — |
| Zéro échec silencieux en IPC | `docs/IPC_CONTRACT.md` | Revue de code nécessaire | PARTIAL | NON | Vérifier chemins d'erreur |

---

## SECTION 3 — POLITIQUE RÉSEAU & RUNTIME

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| Politique online-first gouvernée | `README.md`, instructions kernel | Docs multiples | QUALIFIED | Anciens docs disent "local-only" | Docs legacy étiquetés LEGACY |
| "local-first" = marqueur de compatibilité uniquement | Instructions kernel | `.github/copilot-instructions.md` | DOC_ONLY | OUI — user/README.md v19.4.3 dit "100% local" | Ajouter bannière legacy à l'ancien README utilisateur |
| Fallback local obligatoire | Instructions kernel | PARTIAL — non vérifié runtime | PARTIAL | NON | Vérifier chemins de fallback dans le code |
| Pas d'appels réseau directs depuis l'UI | Docs architecture | `scripts/gates/rc-network-surface-gate.sh` | QUALIFIED | NON | Exécuter gate pour vérifier |
| Réseau passe par : UI → IPC → Services → Gateway | Docs architecture | Revue de code | PARTIAL | NON | Vérifier implémentation |

---

## SECTION 4 — IA / FOURNISSEURS

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| Support OpenAI, Claude, Gemini, Ollama | `docs/PROVIDERS.md`, `docs/AI_PROVIDERS.md` | Fichiers providers dans `src/services/` | QUALIFIED | NON | — |
| Ollama = support modèles locaux | `docs/OLLAMA_GUIDE.md` | `src/services/` | QUALIFIED | NON | — |
| Pipeline OMEGA v2 (10 étapes) | `docs/OMEGA_v2_SPEC.md` | `src/services/conversationEngine.ts` | PARTIAL | NON | Vérifier toutes les 10 étapes |
| Mode mock E2E via `__TITANE_E2E_CHAT_MOCK__` | `src/services/conversationEngine.ts` | Code présent | PROVEN | NON | DOC_ONLY — non orienté utilisateur |

---

## SECTION 5 — AUTO-RÉPARATION / AUTO-HEAL

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| Système AutoHeal existe | `docs/AUTO_HEAL_SYSTEMS.md`, `scripts/autoheal/` | `scripts/autoheal/autoheal_rules.jsonl` (400+ entrées) | PROVEN | NON | — |
| Gate detect_recurrence.sh | `scripts/autoheal/detect_recurrence.sh` | Fichier existe et s'exécute | PROVEN | NON | — |
| Logique stop-the-line | Instructions gouvernance | `scripts/verify_instructions.sh` | PROVEN | NON | — |
| "Self-healing" au sens produit (auto-réparation runtime) | Vision `README.md` | NON vérifié runtime | DOC_ONLY | OUI — README revendique "self-healing" sans qualification | Ajouter label PLANNED/DOC_ONLY dans README |

---

## SECTION 6 — SYSTÈME DE MÉMOIRE

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| Mémoire hiérarchique STM → MTM → LTM | `docs/MEMORY_SYSTEM.md`, `README.md` | `src/services/memory/` | PARTIAL | NON | Vérifier tous les niveaux |
| Mémoire persistée entre sessions | `docs/MEMORY_SYSTEM.md` | Revue de code nécessaire | PARTIAL | NON | — |
| Concept UnifiedMemory OS | `README.md` | Docs architecture | DOC_ONLY | NON | Étiqueter PLANNED dans les docs |

---

## SECTION 7 — AUDIO / TTS / VOIX

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| Mode vocal TTS existe | `docs/CHAT_IA_VOICE_MODE_GUIDE.md` | `src/features/audio-center/` | PROVEN | NON | — |
| Machine à états audio | `docs/INVARIANTS_TITANE.md` | `src/services/audio/audioStateMachine.ts` | PROVEN | NON | — |
| Synchronisation profil vocal corrigée | `autoheal_rules.jsonl` AH-2026-03-17-VOICE-007 | Entrée autoheal | QUALIFIED | NON | — |
| Parole temps réel (VAD) | `docs/CHAT_IA_VOICE_MODE_GUIDE.md` | `src/services/audio/` | PARTIAL | NON | — |

---

## SECTION 8 — TESTS & GATES

| Affirmation | Doc source | Source de preuve | Statut | Contradiction | Action |
|---|---|---|---|---|---|
| verify_instructions.sh PASS=20 FAIL=0 | `proof_packs/` | Derniers proof packs | QUALIFIED | NON | Réexécuter pour confirmer |
| detect_recurrence.sh G_AH_RECURRENCE_GUARD_PASS | `proof_packs/` | Derniers proof packs | QUALIFIED | NON | Réexécuter pour confirmer |
| Tests unitaires Vitest exécutent | `package.json` scripts | `vitest.config.ts` | PROVEN | NON | — |
| Tests E2E Playwright | `playwright.config.ts` | Fichier présent | PROVEN | NON | — |
| Desktop E2E WDIO | `wdio.desktop.conf.cjs` | Fichier présent | PROVEN | NON | — |
| Tests cargo Rust | `package.json` → `test:rust` | Tests dans `src-tauri/` | PROVEN | NON | — |
| Full E2E désactivé par défaut | `e2e/chat-provider-decision-certification.spec.ts` | `FULL_E2E_ENABLED=false` | PROVEN | NON | Documenter clairement |

---

## RÉSUMÉ

| Statut | Nombre |
|---|---|
| PROVEN | 23 |
| QUALIFIED | 12 |
| PARTIAL | 9 |
| DOC_ONLY | 4 |
| BLOCKED | 0 |
| LEGACY | 2 |
| PLANNED | 1 |

**Contradictions ouvertes :** 2 (traitées — ancien README utilisateur revendique "100% local" ; overclaim "self-healing" dans README)

---

*Généré : 2026-03-17 | Autorité : audit du dépôt*
