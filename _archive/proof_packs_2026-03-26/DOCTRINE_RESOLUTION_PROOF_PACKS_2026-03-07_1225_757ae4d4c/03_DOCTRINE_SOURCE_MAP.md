# 03_DOCTRINE_SOURCE_MAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `doctrine mapping only`

C) RISK: `P1`

D) PLAN (<=7):
1. Enumerate direct sources.
2. Enumerate indirect sources.
3. Capture excerpts and implication per source.
4. Assign initial confidence.

E) PROOFS:
- Master scans:
  - `raw/source_scan_focused_rg.txt`
  - `raw/source_scan_rg.txt`

Source table:

| Source | Extrait pertinent | Portee | Implication proof_packs | Confiance initiale |
|---|---|---|---|---|
| `.github/copilot-instructions.md` | "Each governed session must produce evidence in proof_packs and reports." | Constitution kernel | preuve obligatoire en `proof_packs`, pas de contrainte explicite de tracking git | Haute |
| `.github/instructions/docs-registry.instructions.md` | "Append-only", "do not delete proof packs", "VERDICT.md and ROLLBACK.md" | Gouvernance docs/reports/proof_packs | conservation append-only, no-delete, structure obligatoire des packs | Haute |
| `scripts/certification/lib_cert.sh` | "proof packs are expected untracked" | Script gate de certification | tolere explicitement untracked pour precheck clean tracked | Haute |
| `scripts/certification/lib_cert.sh` | `VERDICT.md` + `ROLLBACK.md` generated/required | Script de scellement | enforce format and sealing, pas de contrainte TRACK_ALL | Haute |
| `scripts/certification/run-p10-desktop-cert.sh` | "Remove proof pack (if not committed)" | Script cert P10 | confirme mode non-commite possible | Moyenne |
| `scripts/certification/run-p10-desktop-cert.sh` | "Add proof pack" (`deployment/latest/certification/phase10/`) | Script cert P10 | commit explicite mais sur chemin cert P10, pas canon global `proof_packs/` | Moyenne |
| `.gitignore` | aucune regle `proof_packs/` | Hygiene repo | rend visibles les untracked dans `git status`, mais pas une loi de tracking | Moyenne |
| `package.json` + `scripts/verify/registry-*.js` | `verify:registry` chain; aucun marker proof_pack direct | Validators registry | validators registry ne gouvernent pas directement tracking des `proof_packs` | Moyenne |
| Historique git (`git ls-files proof_packs/*`) | `tracked=41` | Pratique historique | existence d'un mode TRACK_ALL partiel/historique | Moyenne |
| Etat workspace actuel (`git status --short`) | `untracked_status=6` | Pratique runtime courante | existence d'un mode KEEP_UNTRACKED local | Moyenne |

F) ROLLBACK:
- Mapping read-only; no system mutation.
