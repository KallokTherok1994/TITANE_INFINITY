# TITANE∞ — Observabilité et Debug (FR)

**Version :** 28.0.0  
**Statut :** QUALIFIED  
**Date :** 2026-03-17

> Voir aussi : `docs/RUNTIME_OBSERVABILITY.md`, `docs/DEVTOOLS_OVERVIEW.md`

---

## Logs applicatifs

### En mode développement

```bash
# Les logs Tauri s'affichent dans le terminal où pnpm run dev est lancé
pnpm run dev 2>&1 | tee /tmp/titane-dev.log
```

### Dans l'interface (DevTools)

Le panneau DevTools intégré donne accès aux :
- Logs en temps réel (Watchdog)
- Métriques système (Helios)
- Graphe de dépendances (Nexus)
- Dashboard de performance (Monitoring)

---

## Registre AutoHeal

Le registre AutoHeal est la mémoire des correctifs appliqués :

```bash
# Lire les dernières entrées
tail -5 scripts/autoheal/autoheal_rules.jsonl | python3 -c "
import sys, json
for line in sys.stdin:
    e = json.loads(line)
    print(e['id'], '-', e.get('symptom', 'N/A')[:60])
"

# Vérifier les récurrences
bash scripts/autoheal/detect_recurrence.sh
```

---

## Proof packs

Les proof packs sont stockés dans `proof_packs/` :

```bash
# Voir les derniers proof packs
ls -lt proof_packs/ | head -10

# Lire le verdict d'un proof pack
cat proof_packs/[NOM_SESSION]/VERDICT.md
```

---

## Registre d'événements

```bash
# Voir les événements récents
cat registry/ui-events.jsonl | tail -20 | python3 -m json.tool
```

---

## Diagnostics rapides

```bash
# Vérifier les gates
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# Vérifier la surface IPC
pnpm run guard:ipc-contract

# Vérifier la conformité Tauri
pnpm run verify:tauri-only
pnpm run verify:tauri-configs

# Status du stop-the-line
pnpm run stopline:latest
```

---

## Investiguer un échec de CI

```bash
# 1. Lire les logs CI via GitHub Actions (page Actions du dépôt)
# 2. Identifier l'étape qui échoue
# 3. Reproduire localement :

pnpm run lint
pnpm run format:check
pnpm run check
pnpm run test
```

---

## Rapports automatiques

Les rapports de run sont dans `reports/` :

```bash
ls reports/ | head -20
```

---

*Documentation en anglais : [docs/dev/en/observability-and-debug.md](../en/observability-and-debug.md)*
