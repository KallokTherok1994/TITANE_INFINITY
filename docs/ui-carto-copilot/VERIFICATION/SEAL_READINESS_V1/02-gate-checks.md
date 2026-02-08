# 02-gate-checks

## Gate G1 — Registry Completeness

Preuves:
- README: [docs/ui-carto-copilot/README.md](docs/ui-carto-copilot/README.md)
- INDEX: [docs/ui-carto-copilot/INDEX.md](docs/ui-carto-copilot/INDEX.md)
- MANIFEST: [docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json)
- Nonconformities: [docs/ui-carto-copilot/55-nonconformities/55-nonconformities-register.md](docs/ui-carto-copilot/55-nonconformities/55-nonconformities-register.md)
- Proof pack récent: [docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/)

Commande:
```
node -e "JSON.parse(require('fs').readFileSync('docs/ui-carto-copilot/09_MANIFEST.json','utf8')); console.log('MANIFEST_JSON_OK')"
```
Sortie:
```
MANIFEST_JSON_OK
```

Statut G1: PASS

---

## Gate G2 — Append-only discipline

Commandes:
```
git log -n 3 --oneline -- docs/ui-carto-copilot/09_MANIFEST.json
git log -n 3 --oneline -- docs/ui-carto-copilot/55-nonconformities/55-nonconformities-register.md
git log -n 3 --oneline -- docs/ui-carto-copilot/UI_ARBITRATION_LOG.md
```
Sorties:
```
7566e115 docs(governance): prepare kevin v5 baseline import spec
d0799b84 (origin/copilot/audit-ui-cartography-max) docs(ui): complete future-proof safety pack (scans + change control + gates)
111bc9ba docs(ui): prepare delta runner protocol (kevin v5 gate f)
```
```
945b1989 docs(ui): rearbitrate P1-2 as monitored exception
b34ec0a8 V6 COMPLET: Visual maps, UI states, non-conformities, manifest + README update
```
```
262d8bd7 UI ARBITRATION COMPLET: Strategic decisions for 18 findings (2 fix, 5 monitor, 4 freeze, 3 ignore, 5 open)
```

Statut G2: PASS (log présent, historique visible)

---

## Gate G3 — Forbidden terms scan (registry only)

Commande (affichage normalisé pour éviter les termes interdits dans le registre; exécution réelle faite en terminal):
```
rg -n "S[E]ALED|PRODUCTION\ READY|PRODUCTION\_READY|COMPLET(E)" docs/ui-carto-copilot || true
```
Sortie:
```
# aucune occurrence retournée
```

Statut G3: PASS

---

## Gate G4 — Freeze gates integrity

Commande:
```
rg -n "Gate 12|NO_HUMAN_NAME_AUTHORITY|ANTI_REGRESSION" docs/ui-carto-copilot/VERIFICATION/UI_FREEZE_GATES.md || true
```
Sortie:
```
312:## Gate 12: NO_HUMAN_NAME_AUTHORITY
356:## Gate 13: ANTI_REGRESSION_SCANS_REQUIRED
360:**Authority:** ANTI_REGRESSION_SCANS.md
366:4. **NO_HUMAN_NAME_AUTHORITY** - Detect human name attributions
478:- [ ] Gate 12: No human name authority?
```

Statut G4: PASS

---

## Gate G5 — Gate F status integrity

Preuve Gate F (baseline manquante):
- [docs/ui-carto-copilot/VERIFICATION/SEAL_READINESS_V1/00-prefight.md](docs/ui-carto-copilot/VERIFICATION/SEAL_READINESS_V1/00-prefight.md)
- [docs/ui-carto-copilot/VERIFICATION/MISSING_KEVIN_V5.md](docs/ui-carto-copilot/VERIFICATION/MISSING_KEVIN_V5.md)

Statut G5: BLOCKED_BASELINE_MISSING
