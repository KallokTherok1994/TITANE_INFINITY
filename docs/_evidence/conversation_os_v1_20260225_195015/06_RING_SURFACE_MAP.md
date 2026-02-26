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
