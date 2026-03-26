# TARGET_REPO_SHAPE
**TITANE∞ — Forme cible du repo: Core / Labs / Ops**
**Date**: 2026-03-26
**Phase**: PHASE 6 — CORE / LABS / OPS
**Approche**: Classification + conventions, pas migration massive

---

## Définitions

- **Core** = produit nécessaire au flux principal (chat, OMEGA, mémoire, providers)
- **Labs** = modules expérimentaux, partiels, premium ou non prouvés en production
- **Ops** = gouvernance, preuves, release, tooling, tests, industrialisation

---

## Classification — Dossiers racine src/

| Dossier src/ | Ring | Classification | Justification |
|--------------|------|---------------|---------------|
| `services/conversationEngine.ts` | R1 | **Core** | Moteur chat canonique |
| `services/ai/` | R1 | **Core** | OMEGA, providers, orchestrator, fallback |
| `services/chat/` | R1 | **Core** | chatMemorySingleDoor, mémoire context |
| `services/unified/` | R1 | **Core** | Memory OS frontend canonical |
| `services/chatMemoryCompactor.ts` | R1 | **Core** | Historique chat per-mode |
| `hooks/useChat.ts`, `useChatStreaming.ts`, `useChatMemory.ts` | R1 | **Core** | Hooks chat principaux |
| `features/chat/` | R1 | **Core** | Chat UI |
| `pages/TitanePage.tsx`, `ChatPage.tsx` | R1 | **Core** | Pages principales |
| `engines/` | R1 | **Core** | Moteurs cognitifs |
| `context/`, `contexts/` | R1 | **Core** | Providers état |
| `stores/` | R1 | **Core** | State management |
| `lib/` | R1 | **Core** | Utilitaires partagés |
| `hooks/` (général) | R2 | **Core** | Hooks réutilisables |
| `components/layout/` | R2 | **Core** | Shell UI |
| `features/memory/` | R2 | **Core** | Memory UI viewer |
| `features/governance-center/` | R2 | **Core** | Gouvernance |
| `features/admin/` | R2 | **Core** | Admin |
| `features/design-center/` | R2 | **Core** | Thèmes/UI |
| `features/system-center/` | R2 | **Core** | Diagnostics/DevTools |
| `features/progression/` | R2 | **Core** | XP/progression |
| `features/evolution/` | R2 | **Core** | Evolution IA |
| `pages/` (autres) | R2 | **Core** | Routes |
| `types/` | R2 | **Core** | Types TypeScript |
| `utils/` | R2 | **Core** | Utilitaires |
| `i18n/` | R2 | **Core** | Internationalisation |
| `security/` | R2 | **Core** | Sécurité |
| `core/` | R2 | **Core** | Noyau dur |
| `config/` | R2 | **Core** | Configuration |
| `constants/` | R2 | **Core** | Constantes |
| `services/monitoring/` | R2 | **Core** | Monitoring runtime |
| `services/selfHealing/` | R2 | **Core** | Auto-réparation |
| `services/memory/` | R3 | **Labs** (sauf MemoryBridge) | UnifiedMemoryService = file-based legacy, MemoryIntelligenceEngine = nouveau non prouvé |
| `features/vision/` | R3 | **Labs** | Vision ML, non prouvé runtime |
| `features/audio-center/` | R3 | **Labs** | Audio optionnel |
| `modules/avatar/` | R3 | **Labs** | 3D avatar, three.js |
| `services/voice/` | R3 | **Labs** | Voice optionnel |
| `services/tts/` | R3 | **Labs** | TTS optionnel |
| `services/audio/` | R3 | **Labs** | Audio processing |
| `quantum/` | R3 | **Labs** | Quantum rendering |
| `particles/` | R3 | **Labs** | Effets visuels |
| `visual-engine/` | R3 | **Labs** | Moteur visuel expérimental |
| `features/cognitive/` | R3 | **Labs** | Modules cognitifs expérimentaux |
| `features/transformation/` | R3 | **Labs** | Transformation roadmap |
| `services/evolution/` | R3 | **Labs** | Evolution config IA |
| `os/` | R3 | **Labs** | OS-level (non prouvé) |
| `effects/` | R3 | **Labs** | Effects CSS/JS |
| `design-system/` | R3 | **Labs** | Design system expérimental |
| `_deprecated/` | — | **Archive** | Code déprécié — DELETE_CANDIDATE avec audit |
| `dev/` | R4 | **Ops** | Dev utilities |
| `mocks/` | R4 | **Ops** | Mocks tests |
| `stories/` | R4 | **Ops** | Storybook |
| `test/`, `__tests__/`, `tests/`, `test-utils/` | R4 | **Ops** | Infrastructure tests |
| `assets/` | R4 | **Ops** | Assets statiques |
| `styles/` | R4 | **Ops** | Styles globaux |
| `themes/` | R2 | **Core** | Thèmes UI |

---

## Classification — Dossiers racine repo

| Dossier | Classification | Justification |
|---------|---------------|---------------|
| `src/` | Core | Code produit frontend |
| `src-tauri/` | Core | Code produit backend Rust |
| `public/` | Core | Assets prod |
| `e2e/` | Ops | Tests E2E |
| `tests/` | Ops | Tests unitaires/intégration |
| `scripts/` | Ops | Tooling automation |
| `config/` | Ops | Config runtime |
| `.github/` | Ops | CI/CD |
| `docs/` | Ops | Documentation |
| `proof_packs/` | Ops | Preuves de release |
| `governance/` | Ops | Gouvernance |
| `registry/` | Ops | Registre événements |
| `reports/` | Ops | Rapports générés |
| `evals/` | Ops | Évaluations IA |
| `orchestration/` | Labs | Orchestration expérimentale |
| `memory/` (root) | Labs | Mémoire JSON runtime |
| `data/` | Ops | Données statiques |
| `legacy/` | Archive | Code legacy |
| `_archive/` | Archive | Archive |
| `deployment/` | Ops | Configs déploiement |
| `dashboard/` | Labs | Dashboard runtime |
| `actions-runner/` | Ops | GitHub Actions runner |
| `installer/`, `installer_gui/` | Ops | Installeur |
| `dist/`, `dist_stub/` | Generated | Build output (gitignore idéal) |
| `logs/` | Generated | Logs runtime |
| `artifacts/` | Generated | Artefacts build |

---

## Forme cible actuelle vs idéale

### Actuel (état prouvé)
```
src/
├── [Core] services/ features/ engines/ hooks/ pages/ stores/ core/ lib/
├── [Labs] features/vision/ modules/avatar/ quantum/ particles/ os/ effects/
├── [Ops]  __tests__/ test/ stories/ mocks/ dev/
└── [Archive] _deprecated/
```

### Cible réaliste (sans migration massive)
```
src/
├── [Core]  — inchangé
├── [Labs]  — marquage @labs dans headers (convention), pas de move physique
├── [Ops]   — inchangé
└── [Archive] _deprecated/ — audit + suppression progressive
```

**Décision**: pas de move physique de dossiers à cette phase.
Les Labs sont identifiés par convention (header `// @labs` ou doc `LABS.md` dans le dossier).
Les moves physiques attendent une baseline stable et un test de régression complet.

---

## Conventions immédiates sans move

1. Ajouter `LABS.md` dans `src/features/vision/` — marque le scope Labs
2. Ajouter `LABS.md` dans `src/modules/avatar/` — marque le scope Labs
3. Ajouter `LABS.md` dans `src/services/memory/` — indique legacy + nouveau non committé
4. Ajouter commentaire `// LEGACY: use services/unified/ instead` dans `services/memory/UnifiedMemoryService.ts`

---

## Verdict

```
PHASE 6: QUALIFIED
- Forme cible documentée
- Classification Core/Labs/Ops exhaustive
- Moves lourds différés (risque > P1 sans régression complète)
- Moves sûrs: marquage convention (LABS.md, commentaires legacy)
- Prochaine action: PHASE 7 — PROMOTION STRICTE
```
