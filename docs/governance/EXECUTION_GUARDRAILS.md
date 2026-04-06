# EXECUTION_GUARDRAILS
**Date**: 2026-03-26 | **Scope**: Développement TITANE∞ post-optimisation

Garde-fous sobres contre la redérive. À consulter avant toute session de modification.

---

## RÈGLE CENTRALE

> **Ne pas rouvrir le noyau chat/mémoire sans contradiction prouvée.**
> Consolider > refactorer. Vérifier > supposer. Patch minimal > nouvelle architecture.

---

## 1. CHECKLIST BOOTSTRAP (avant toute modification)

```bash
git status --short        # arbre propre?
git branch --show-current # bonne branche?
git rev-parse --short HEAD # SHA de référence
git log -3 --oneline      # dernier état connu
```

- [ ] Arbre git propre ou sauvegardé (`git stash` si besoin)
- [ ] Je suis sur la bonne branche (MAIN ou branche dédiée)
- [ ] Je connais le SHA de départ pour rollback
- [ ] J'ai lu les docs d'autorité pertinents avant de toucher un composant

---

## 2. CHECKLIST COMMIT (une intention par commit)

- [ ] L'intention de ce commit est clairement nommée en 1 phrase
- [ ] Ce commit ne mélange pas: docs + code + tests + config
- [ ] J'ai une preuve avant et une preuve après (commande + output)
- [ ] Je connais le rollback exact: `git revert <sha>`
- [ ] Le message de commit suit: `type(scope): intention courte`

**Types valides**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 3. CHECKLIST PROOF (avant tout verdict)

Pour un verdict **STABLE**:
- [ ] `pnpm run check` PASS (tsc)
- [ ] `pnpm run lint` PASS
- [ ] `pnpm test` PASS (≥ baseline connue)
- [ ] `pnpm run build` PASS
- [ ] `cargo check` PASS

Pour un verdict **SEALED** (conditions supplémentaires):
- [ ] `pnpm run test:e2e` PASS (playwright)
- [ ] desktop E2E (wdio+tauri-driver) PASS — actuellement BLOCKED_ENV
- [ ] `pnpm run verify` PASS (CI complet)

---

## 4. SCOPE RINGS (ne pas excéder sans justification)

| Ring | Périmètre | Risque |
|------|-----------|--------|
| R1 | Noyau: conversationEngine, chatMemorySingleDoor, unified_memory_v2 (Rust), omegaModeClassifier | P0 — toucher SEULEMENT si contradiction prouvée |
| R2 | Services: aiOrchestrator, providers, UnifiedMemory.ts, XP_ENGINE | P1 — patch minimal |
| R3 | UI/Labs: pages, features, hooks, composants | P2 — changements normaux |
| R4 | Ops: docs, scripts, governance, config, tooling | P3 — libre mais documenté |

---

## 5. VOCABULAIRE CANONIQUE DES STATUTS

*(source: `governance/statuses.yaml`)*

| Statut | Signification |
|--------|--------------|
| `UNKNOWN` | Non prouvé — ne pas promouvoir |
| `QUALIFIED` | Assez de preuves pour avancer, pas encore STABLE |
| `PASS` | Preuve obtenue pour le scope exact |
| `FAIL` | Échec constaté |
| `BLOCKED` | Impossible maintenant |
| `BLOCKED_ENV` | Environnement bloque la preuve |
| `STABLE` | Cohérent avec preuves solides (local) |
| `SEALED` | Complet + gates desktop PASS + rollback clair |

---

## 6. ÉLÉMENTS P0 — NE JAMAIS TOUCHER SANS RAISON GRAVE

*(source: `docs/architecture/MOVE_PLAN.md` — section MOVES BLOQUÉS)*

- `src/services/conversationEngine.ts` — chaîne chat canonique
- `src/services/chat/chatMemorySingleDoor.ts` — porte unique mémoire chat
- `src/services/unified/` — Memory OS canonical
- `src-tauri/src/unified_memory_v2/` — backend mémoire autoritaire
- `src/services/ai/omegaModeClassifier.ts` — OMEGA pipeline

**Règle**: toute modification P0 nécessite une contradiction prouvée + branch dédiée + tsc PASS + vitest PASS avant merge.

---

## 7. RÈGLES ANTI-REDÉRIVE

1. **Pas de refactor cosmétique** sans bug identifié ou contradiction prouvée
2. **Pas de nouvelle couche d'abstraction** pour une utilisation unique
3. **Pas de suppression** sans grep exhaustif + vitest PASS après
4. **Pas de verdict STABLE/SEALED** sans gates correspondantes
5. **Pas de migration structurelle** sans baseline tests 100%
6. **Pas de mélange docs/runtime/tests** — si divergence: traiter comme un bug
7. **Docs = vérité au moment d'écriture** — recalibrer si le code diverge

---

## 8. STOPLINES AUTOMATIQUES

Geler les mutations et sortir le verdict approprié si:
- `pnpm check` commence à échouer
- vitest descend sous le baseline connu
- `pnpm build` échoue
- On commence à toucher R1 sans contradiction claire
- Les docs et le runtime divergent davantage après un patch
- Une automation est ajoutée pour masquer un flou structurel

---

## RÉFÉRENCES

- [CONSOLIDATED_AUTHORITY_STATE.md](CONSOLIDATED_AUTHORITY_STATE.md) — carte des autorités
- [VALIDATION_CERTIFICATION_BASELINE.md](VALIDATION_CERTIFICATION_BASELINE.md) — hiérarchie des preuves
- [MOVE_PLAN.md](MOVE_PLAN.md) — éléments P0 + moves différés
- [governance/statuses.yaml](../../governance/statuses.yaml) — vocabulaire canonique
- [governance/layer_priority.yaml](../../governance/layer_priority.yaml) — priorités de couche
