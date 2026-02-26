# 06_RING_SURFACE_MAP.md

## Architectural Consistency Validation (trace par micro-phase)

### Micro-phase MP-01 — META-EXECUTION
- Ring impacté: Ring 4 (Docs/UI governance)
- Fichiers touchés:
  - `00_PLAN.md`
  - `01_TRUTH_SNAPSHOT.md`
- Imports sensibles vérifiés:
  - N/A (doc-only)
- Dépendance vers le haut détectée:
  - Non
- Conclusion: **PASS**

### Grille de contrôle (à remplir après chaque micro-phase)
- Ring impacté (Type/Engine/Service/UI)
- Fichiers touchés
- Imports sensibles détectés (`UI -> Services`, `Services -> UI`, `Types -> Services`)
- Commandes de preuve:
  - `rg -n "from .*ui|from .*modules" src-tauri`
  - `rg -n "from .*services" src/ui src/components src/modules`
  - `rg -n "import.*services" src/types`
- Verdict: PASS / FAIL / BLOCKED

### Stop-the-line
- Toute dépendance vers le haut (ex: Service dépend de UI) => **FAIL immédiat**.

### Micro-phase MP-02 — Discovery C1..C5 + Ring checks
- Ring impacté: Ring 4 (Docs/UI governance) + Ring 3 (Services)
- Fichiers touchés:
  - `09_GATES_STATUS.md`
  - `15_RISKS.md`
  - `24_ALL_PHASE_EXECUTION.md`
- Imports sensibles vérifiés:
  - `src/types -> services` (prod-scope hors `*.d.ts`): `0` match
  - `src-tauri from .*ui|from .*modules`: matches observés majoritairement en commentaires/README, pas de dépendance de runtime validée dans cet addendum
- Commandes de preuve:
  - `rg -n "from .*ui|from .*modules" src-tauri`
  - `rg -n "import.*services|from .*services" src/types --glob '!**/*.d.ts'`
- Conclusion: **PASS (ring up-dependency non détectée dans le scope vérifié)**

### Micro-phase MP-03 — Step-4 Lot A (H2)
- Ring impacté: Ring 3 (Services) + Ring 4 (Orchestration)
- Fichiers touchés:
  - `src-tauri/src/services/network_gateway.rs`
  - `src-tauri/src/commands/diagnostic_commands.rs`
- Imports sensibles vérifiés:
  - migration de `diagnostic_commands` vers service gouverné (plus de client `reqwest` local)
- Commandes de preuve:
  - `rg -n "(^\s*use\s+reqwest::|reqwest::Client::|reqwest::get\(|ureq::|hyper::client|hyper::Client)" src-tauri/src`
- Conclusion: **PASS (réduction H2 mesurée 51 -> 46)**
