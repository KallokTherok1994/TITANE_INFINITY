# TITANE_INFINITY — Instructions Globales

**Version:** 24.3.0  
**Conformité:** 98/100 🎯  
**Dernière mise à jour:** 2025-12-15

---

## Vision

Assistant IA local-first, privacy-first, cognitif révolutionnaire.

---

## Stack Technique

### Frontend

- **React 18.3.1** + **Vite 6.0.5** + **TypeScript 5.7.3**
- **Zustand 5.0.2** (state management)
- **Vitest 4.0.13** (testing) — **NO JEST**
- **Playwright 1.56.1** (E2E)

### Backend

- **Tauri v2.2.0** + **Rust 1.83** (async)
- **Tokio** async runtime
- **Serde** serialization

### Testing

- **Vitest:** Unit/integration
- **Playwright:** E2E (3 scenarios OMEGA v2)
- **cargo test:** Rust tests
- **Architecture tests:** Automated ring isolation

---

## Architecture 4-Ring Model (v24.3.0)

**RÈGLE FONDAMENTALE:** Les anneaux intérieurs ne peuvent JAMAIS importer les anneaux extérieurs.

### Ring 1: Core (Fondations Pures)

**Localisation:** src/types/, src/constants/  
**Responsabilité:** Types, interfaces, constantes universelles  
**Imports autorisés:** ZÉRO (auto-suffisant)  
**Exemples:**

- src/types/voice.ts — EmotionalState, ThinkingState, MentalColor
- src/types/memoryEngine.ts — MemoryMetadata, ConversationMode

**Règle d or:** Si ça import quelque chose, ce n est PAS du Core.

---

### Ring 2: Engines (Logique Métier Pure)

**Localisation:** src/engines/\*/  
**Responsabilité:** Algorithmes, transformations, logique métier SANS I/O  
**Imports autorisés:** Ring 1 (Core) uniquement  
**Interdictions:** Services, OS, API externes, localStorage, Tauri commands

**9 Moteurs:**

1. **Orchestrator** — Coordination globale
2. **StyleEngine** — Thèmes et apparence
3. **CoherenceEngine** — Cohérence contextuelle
4. **ReflectionEngine** — Analyse réflexive
5. **EmotionEngine** — États émotionnels
6. **UnifiedMemory** — Mémoire persistante
7. **BehaviorEngine** — Patterns comportementaux
8. **AdaptationEngine** — Adaptation contextuelle
9. **SystemHealth** — Monitoring santé système

**Architecture DÉFINITIVE — Ne PAS modifier sans validation.**

---

### Ring 3: Services (Orchestration I/O)

**Localisation:** src/services/\*/  
**Responsabilité:** Abstractions I/O, appels Tauri, API externes, localStorage  
**Imports autorisés:** Ring 1 (Core) + Ring 2 (Engines)

**Services Wrappers:**

- src/services/agenda/agendaService.ts — CRUD événements (Tauri)
- src/services/cognitive/cognitiveLayoutService.ts — État Helios/Nexus
- src/lib/security.ts — secureInvoke wrapper

**Règle:** Tout I/O DOIT passer par un service, jamais directement dans un engine.

---

### Ring 4: OS/UI (Frontière Système)

**Localisation:** src-tauri/src/, React components  
**Responsabilité:** UI React, Tauri backend, système d exploitation  
**Imports autorisés:** TOUS les rings (accès total)

**Exceptions documentées:**

- cognitiveLayoutIntegrations.ts — Pont nécessaire Engines↔Services
- tauriBridge.ts — Interface système critique

---

## OMEGA Pipeline v2 (BREAKING CHANGE)

**AVANT (v1 — DEPRECATED):**
Utiliser chat_send_message

**APRÈS (v2 — REQUIS):**
Utiliser conversation_generate avec conversationId MANDATORY

**Guide complet:** docs/guides/MIGRATION_OMEGA_V2.md

---

## Conventions de Code

### Rust

- async/await pour tout I/O
- Result<T, E> pour error handling
- **ZERO unwrap()** — Utiliser expect("message")
- Tests unitaires (#[cfg(test)])
- Documentation (/// pour public API)

### TypeScript

- **Strict mode** activé (tsconfig.json)
- Types explicites
- **ZERO any** en production
- try/catch pour async/await
- Composants purs

---

## Communication IPC

Uniquement via Tauri IPC avec secureInvoke wrapper.

---

## Gestion des Scripts

**Organisation obligatoire (170 scripts):**
scripts/
├── build/ # 5 scripts
├── deploy/ # 5 scripts
├── dev/ # 5 scripts
├── diagnostic/ # 5 scripts
├── fix/ # 7 scripts
├── install/ # 8 scripts
├── launch/ # 6 scripts
├── maintenance/ # 6 scripts
├── setup/ # 10 scripts
├── test/ # 38 scripts
└── verify/ # 10 scripts

**Règle:** ZÉRO script à la racine du projet.

---

## Politique /legacy/

**Critères:** Code obsolète, API dépréciées, types any temporaires
**Processus:** Marquer @deprecated → Alternative moderne → Déplacer /legacy/ → Supprimer après 6 mois

---

## Tests

### Commandes

- npm run test # Vitest unit tests
- npm run test:e2e # Playwright E2E
- npm run test:architecture # Architecture validation
- npm run test:rust # Cargo tests
- npm run verify # ALL tests + lint + check

### Couverture Minimale

- Unit tests: 80% des engines
- Integration: 60% des services
- E2E: 3 scenarios critiques (OMEGA v2)
- Architecture: 100% (automatisé)

---

## Commits Conventionnels

Format:
<type>(<scope>): <description>

- Point 1
- Point 2

Breaking Changes: <si applicable>
Task: <ID optionnel>

Types: feat, fix, docs, refactor, test, chore, perf, build
Scopes: architecture, omega, engines, services, ui, backend

---

## Conformité Actuelle (v24.3.0)

| Métrique      | Score      | Status |
| ------------- | ---------- | ------ |
| **Overall**   | **98/100** | ✅     |
| Structure     | 98/100     | ✅     |
| Testing       | 95/100     | ✅     |
| Architecture  | 98/100     | ✅     |
| Documentation | 95/100     | ✅     |
| Code Quality  | 97/100     | ✅     |

**Progression:** v24.2.0 (78/100) → v24.3.0 (98/100) = **+20 points** 🎯

---

## Règles d Or

1. ✅ **Architecture 4-Ring** — Respecter strictement la hiérarchie
2. ✅ **ZERO unwrap()** — Rust error handling explicite
3. ✅ **ZERO any** — TypeScript type safety maximale
4. ✅ **Tests automatisés** — Architecture + E2E + unit
5. ✅ **Documentation** — Tout changement architectural documenté
6. ✅ **OMEGA v2** — conversation_generate obligatoire
7. ✅ **Scripts organisés** — 0 script à la racine
8. ✅ **/legacy/** — Politique de dépréciation stricte

---

**Dernière révision:** 2025-12-15  
**Version:** 24.3.0 — Architecture Overhaul Complete 🎯
