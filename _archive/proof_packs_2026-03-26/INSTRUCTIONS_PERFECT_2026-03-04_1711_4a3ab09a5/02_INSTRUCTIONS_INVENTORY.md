# 02_INSTRUCTIONS_INVENTORY

## Inventaire total (canon + satellites)

| Fichier | Type | applyTo | Rings impactés (doc) | Règles clés | Gates mentionnées | Ambiguïtés | Conflits/Duplications |
|---|---|---|---|---|---|---|---|
| `.github/copilot-instructions.md` | repo-wide constitution | N/A | Gouvernance globale (R1 doc meta) | PASS/FAIL/BLOCKED/DONE/SEALED, stop-the-line, preuves obligatoires | `G_MAP_*`, `G_AH_RULE_CAPTURED_FOR_EACH_FIX` | Usage simultané de marqueur Local-first et doctrine online-first | Duplique partiellement règles présentes dans `titane.instructions.md` |
| `.github/instructions/titane.instructions.md` | path-specific constitution projet | Header comment (src/src-tauri/tests/scripts) | R1-R4 (politiques) | doc-only policy, stopline, doctrine conflict resolution, verify-or-rollback | Gate table DEV/E2E/PROD | Scope inclut scripts; possible overlap avec repo-wide | Duplique stopline/gates avec repo-wide |
| `.github/instructions/tests-e2e.instructions.md` | path-specific | `e2e/**, scripts/e2e/**, wdio*.conf*` | Ring 4 E2E | exports requis, anti-flaky, wrapper obligatoire, capture AH | missing exports => FAIL | Référence actuelle AH vers `registry/*` (à normaliser) | Recoupe partiellement règles E2E de `titane.instructions.md` |
| `.github/instructions/frontend.instructions.md` | path-specific | `src/**` | Ring 4 UI | zero silence, testid stable, no implicit network | `test:e2e`, `verify:registry` | mention legacy local-first | Potentiel conflit doctrine online-first |
| `.github/instructions/tauri.instructions.md` | path-specific | `src-tauri/**, tauri*.json, runtime/**` | Ring 4 OS/UI | Tauri-only, IPC strict, allowlist stable | `verify:tauri-only`, `verify:tauri-configs` | mention legacy local-first | Potentiel conflit doctrine online-first |
| `.github/instructions/docs-registry.instructions.md` | path-specific docs | `docs/**, reports/**` | R1 doc | append-only, no destructive rewrite | stopline missing proof files | parle de `reports/**` mais mentionne proof packs | légère ambiguïté reports vs proof_packs |
| `.github/copilot-setup-checklist.md` | checklist | N/A | R1 process | setup/session checklists | checks PASS before accept | cible ancienne AH (`registry/*`) | doit aligner avec système AutoHeal demandé |
| `.github/copilot-workflow.mermaid` | mermaid workflow | N/A | R1 process | Validate/Fix/Capture/Test | implicite | pipeline incomplet vs besoin Bootstrap→Inventory→... | doit être aligné à la constitution |
| `.github/copilot-agents.md` | doc roster | N/A | R1 documentation | rôles agents, federation doc | N/A | non-gouvernant | hors périmètre constitutionnel strict |

## Fichiers exigés par la demande utilisateur (présence)

- `.github/copilot-instructions.md` ✅
- `.github/copilot-setup-checklist.md` ✅
- `.github/copilot-workflow.mermaid` ✅
- `.github/instructions/tests-e2e.instructions.md` ✅
- `.github/instructions/titane.instructions.md` ✅

## UNKNOWN

- Aucun fichier cible manquant.
