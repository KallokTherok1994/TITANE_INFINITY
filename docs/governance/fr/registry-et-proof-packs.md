# TITANE∞ — Registre et Proof Packs (FR)

**Version :** 28.0.0  
**Statut :** QUALIFIED  
**Date :** 2026-03-17

---

## Registre d'événements

**Répertoire :** `registry/`

Le registre d'événements enregistre les événements applicatifs importants.

```bash
# Journaliser un événement
pnpm run registry:log

# Créer un snapshot
pnpm run registry:snapshot

# Voir le dashboard
pnpm run registry:dashboard
```

**Statut append-only :** PARTIAL — la politique append-only est déclarée mais non entièrement enforced par l'outillage.

---

## Registre AutoHeal

**Fichier :** `scripts/autoheal/autoheal_rules.jsonl`

Registre JSON lines de tous les correctifs appliqués. Append-only par convention.

**Format d'entrée :**
```json
{
  "id": "AH-YYYY-MM-DD-[DESCRIPTION]",
  "date": "YYYY-MM-DD",
  "scope": "fichiers impactés",
  "symptom": "description du symptôme",
  "root_cause": "cause racine identifiée",
  "fix": "description du correctif",
  "prevention_test": "commande contenant detect_recurrence",
  "commands": ["liste des commandes de vérification"],
  "files_changed": ["liste des fichiers modifiés"],
  "rollback": "commande git restore exacte"
}
```

**Exigence critique :** `prevention_test` doit contenir la sous-chaîne `detect_recurrence`.

---

## Proof Packs

**Répertoire :** `proof_packs/`

Un proof pack est un répertoire de preuves pour une session gouvernée.

### Structure minimale

```
proof_packs/[SESSION_NAME]_[DATE]/
├── VERDICT.md      # Verdict final de la session
└── ROLLBACK.md     # Commandes de rollback exactes
```

### Structure complète (P0)

```
proof_packs/[SESSION_NAME]_[DATE]/
├── VERDICT.md
├── ROLLBACK.md
├── GATE_REPORT.md      # Résultats des gates
├── [artefacts...]      # Logs, exports, métriques
```

### Quand créer un proof pack

| Situation | Proof pack requis |
|---|---|
| Correctif P0 (bug critique) | OUI |
| Modification surface IPC | OUI |
| Modification capabilities Tauri | OUI |
| Release ou pre-release | OUI |
| Session de gouvernance majeure | OUI |
| Correctif P2 mineur | NON (entrée AutoHeal suffit) |
| Modification docs uniquement | NON (sauf session DOCS canon) |

---

## Vérification des proof packs

```bash
# Lister les derniers proof packs
ls -lt proof_packs/ | head -10

# Lire le verdict
cat proof_packs/[SESSION]/VERDICT.md

# Vérifier l'intégrité du registre
pnpm run verify:registry:integrity
```

---

*Documentation en anglais : [docs/governance/en/registry-and-proof-packs.md](../en/registry-and-proof-packs.md)*
