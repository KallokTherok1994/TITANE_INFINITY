# 🎯 PROTOCOLE DE QUALIFICATION DES CAPACITÉS

**Document ID**: CAPABILITY_QUALIFICATION_PROTOCOL_v1  
**Date**: 2026-01-15  
**Autorité**: PHASE 6 — Évolution Consciente & Qualification  
**Statut**: **SCELLÉ** (modifications via gouvernance uniquement)

---

## Table des matières

1. [Objectif & Principes](#objectif--principes)
2. [Cycle de vie d'une capacité](#cycle-de-vie-dune-capacité)
3. [Checklist de qualification (obligatoire)](#checklist-de-qualification-obligatoire)
4. [Promotion vers STABLE](#promotion-vers-stable)
5. [Dépréciation & Retrait](#dépréciation--retrait)
6. [Exceptions & Escalade](#exceptions--escalade)

---

## Objectif & Principes

### Objectif

Permettre l'évolution rapide de TITANE∞ **sans dérive**, en garantissant que toute nouvelle capacité :
- Est justifiée (pourquoi)
- Est minimale (surface réduite)
- Est prouvée (tests + CI)
- Est réversible (rollback documenté)
- Fonctionne local-first (mode dégradé)

### Principes absolus

1. **Preuve > Intuition** : Aucune capacité en STABLE sans tests + gates CI PASS
2. **Surface minimale** : Chaque permission/command/endpoint doit être justifiée
3. **Local-first** : Toute capacité doit avoir un mode dégradé sans cloud
4. **Réversibilité** : Plan de rollback obligatoire avant STABLE
5. **No Expansion non qualifiée** : Aucune capacité ne peut contourner ce protocole

---

## Cycle de vie d'une capacité

```
┌─────────────────┐
│  EXPERIMENTAL   │  Dev uniquement, API peut changer, non-prod
└────────┬────────┘
         │ Tests + docs complets
         ▼
┌─────────────────┐
│   QUALIFIED     │  API figée, tests PASS, non-prod, prêt pour validation
└────────┬────────┘
         │ Promotion (checklist complète + CI PASS)
         ▼
┌─────────────────┐
│     STABLE      │  Production-ready, backward compat garantie
└────────┬────────┘
         │ Bug critique ou obsolète
         ▼
┌─────────────────┐
│   DEPRECATED    │  Marquée obsolète, warnings runtime, retrait prévu
└────────┬────────┘
         │ 2 versions minimum (6 mois)
         ▼
┌─────────────────┐
│    REMOVED      │  Retirée du code
└─────────────────┘
```

### Statuts détaillés

| Statut | Couche | Tests | CI Gates | Backward Compat | Notes |
|--------|--------|-------|----------|-----------------|-------|
| **EXPERIMENTAL** | Dev uniquement | Optionnels | Non bloquants | Non garanti | API peut changer librement |
| **QUALIFIED** | Dev ou Stable (non-prod) | Obligatoires (≥80% cov) | Bloquants | Garanti | API figée, prêt pour prod |
| **STABLE** | Stable (prod) | Obligatoires (100%) | Bloquants | Garanti | Production-ready |
| **DEPRECATED** | Stable (prod) | Maintenus | Bloquants | Garanti | Warnings runtime, retrait prévu |
| **REMOVED** | - | - | - | - | Retiré du code |

---

## Checklist de qualification (obligatoire)

Toute capacité doit remplir cette checklist **avant** promotion vers QUALIFIED ou STABLE.

### 📋 Checklist complète

#### 1. Justification

- [ ] **Pourquoi** : Besoin métier clair (1 phrase)
- [ ] **Alternative** : Avons-nous évalué les alternatives ? (ex: utiliser une capacité existante)
- [ ] **Périmètre** : Qu'est-ce que ça **ne fait PAS** ? (évite feature creep)

#### 2. Surface minimisée

- [ ] **Commands** : Liste exhaustive (voir fiche capacité section 4.1)
- [ ] **Permissions** : Allowlist strict (canonicalize si FS)
- [ ] **Endpoints réseau** : Liste exhaustive + fallback local (si cloud)
- [ ] **Accès FS/process** : Justification + allowlist paths

#### 3. Inputs validés

- [ ] **Validation** : Tous les inputs validés (types + format + range)
- [ ] **Sanitization** : Paths canonicalisés, chaînes échappées
- [ ] **Allowlist** : Chemins FS dans allowlist explicite (pas de wildcard dangereux)
- [ ] **Rate limiting** : Si appels fréquents (évite DoS local)

#### 4. Tests

- [ ] **Unit tests** : Couverture ≥ 80% (logique métier)
- [ ] **Contract tests** : TS ↔ Tauri validé (`tests/contract/tauri.contract.test.ts`)
- [ ] **Integration tests** : Scénarios bout-en-bout (si multi-modules)
- [ ] **Smoke tests** : Script `scripts/smoke/smoke_[feature].sh` (keepalive + ERROR scan)

#### 5. Gates CI

- [ ] **constitution-audit** : PASS (no secrets, no drift)
- [ ] **capability-qualification** : PASS (checks spécifiques capacité)
- [ ] **stable-build** : PASS (build reproductible)
- [ ] **tests-all** : PASS (100% tests passent)

#### 6. Observabilité

- [ ] **Logs** : Format standardisé (voir `runtime/LOGGING_STANDARD.md`)
- [ ] **Logs safe** : Aucun secret/PII dans logs (sanitize avant log)
- [ ] **Health check** : Ajouté si capacité critique (voir `scripts/health/health_check.sh`)

#### 7. Rollback documenté

- [ ] **Rollback EXPERIMENTAL** : Procédure retrait dev (fiche capacité section 7.1)
- [ ] **Rollback STABLE** : Procédure downgrade production (fiche capacité section 7.2)
- [ ] **Feature flag** : Mécanisme désactivation rapide (si applicable)

#### 8. Mode dégradé local-first

- [ ] **Fonctionne offline** : Aucune dépendance cloud au démarrage
- [ ] **Fallback local** : Cache/default si service externe indisponible
- [ ] **Consentement** : Si cloud requis, consentement explicite utilisateur

#### 9. Documentation

- [ ] **Fiche capacité** : `docs/capabilities/[nom].md` (complète à 100%)
- [ ] **CAPABILITIES_REGISTRY** : Entrée mise à jour (statut + métadonnées)
- [ ] **API_SURFACE** : Commandes + permissions documentées
- [ ] **Changelog** : Entrée dans `CHANGELOG.md` (pour prochaine release)

#### 10. Code review

- [ ] **Review 1+** : Au moins 1 reviewer approuve
- [ ] **Security review** : Si HIGH risk ou permissions sensibles

#### 11. Validation finale

- [ ] **Script CI promotion** : `scripts/ci/check-promotion-stable.sh` PASS
- [ ] **Smoke test PASS** : AppImage + DEB (si capacité en Stable)

---

## Promotion vers STABLE

### Processus

Une capacité **QUALIFIED** peut être promue **STABLE** si :

1. **Checklist 100% complète** (section 3)
2. **CI gates 100% PASS** (constitution-audit + capability-qualification + stable-build + tests-all)
3. **Fiche capacité scellée** (pas de section TODO/TBD)
4. **Code review approuvé** (1+ reviewer)
5. **Smoke test PASS** (AppImage 90s + DEB 180s)

### Commandes

```bash
# 1. Vérifier checklist
bash scripts/ci/check-promotion-stable.sh docs/capabilities/[nom].md

# 2. Si PASS, mettre à jour statut
sed -i 's/QUALIFIED/STABLE/' docs/capabilities/[nom].md
sed -i 's/status: qualified/status: stable/' docs/CAPABILITIES_REGISTRY.md

# 3. Mise à jour API_SURFACE.md
# (ajouter commandes + permissions dans section stable)

# 4. Commit
git add docs/capabilities/[nom].md docs/CAPABILITIES_REGISTRY.md docs/API_SURFACE.md
git commit -m "feat(capability): Promote [nom] to STABLE"

# 5. CI validation
# Push → CI va bloquer si checklist non complète

# 6. Merge → Release
# Inclure dans prochaine version stable (CHANGELOG.md)
```

### Gates bloquants

**TOUTE promotion STABLE doit passer ces gates CI (bloquants)** :

1. `constitution-audit.yml` : No secrets, no drift, allowlist cohérent
2. `capability-qualification.yml` : Checklist promotion PASS
3. `stable-build.yml` : Build reproductible PASS
4. `tests-all.yml` : 100% tests PASS

Si 1 gate FAIL → **MERGE BLOQUÉ** automatiquement.

---

## Dépréciation & Retrait

### Processus de dépréciation

Si une capacité doit être retirée (bug critique, obsolescence, remplacement) :

1. **Version N : Marquer DEPRECATED**
   - Statut → `DEPRECATED` dans fiche capacité + registry
   - Ajouter warning runtime (logs + UI si applicable)
   - Documenter raison + alternative (si existe)
   - Commit : `deprecate(capability): Mark [nom] as DEPRECATED (reason: [raison])`

2. **Version N+1 : Maintenir warnings**
   - Capacité toujours fonctionnelle
   - Warnings persistants dans logs
   - Documentation mise à jour (guide migration si alternative)

3. **Version N+2 (minimum 6 mois) : Retrait**
   - Statut → `REMOVED`
   - Retirer code de stable allowlist
   - Retirer tests associés
   - Archiver fiche capacité (move vers `docs/capabilities/_ARCHIVED/`)
   - Commit : `remove(capability): Remove [nom] (deprecated since v[N], 6 months ago)`

### Délais minimum

- **DEPRECATED → REMOVED** : 2 versions minimum **ET** 6 mois minimum
- **Exceptions** : Bug critique sécurité → retrait immédiat autorisé (hotfix)

### Rollback si bug critique

Si bug critique en production sur capacité STABLE :

1. **Hotfix immédiat** (si feature flag existe) :
   ```bash
   # Désactiver capacité
   sed -i 's/"capability_enabled": true/"capability_enabled": false/' config.json
   bash runtime/stable/build.sh
   git tag -a v26.3.1-hotfix -m "Disable [nom] (critical bug: [issue])"
   git push origin v26.3.1-hotfix
   ```

2. **Rollback version** (si pas de feature flag) :
   ```bash
   # Downgrade vers version précédente stable
   git checkout v26.3.0  # Version stable précédente
   bash runtime/stable/build.sh
   # Publier hotfix
   ```

3. **Post-mortem** :
   - Documenter incident dans fiche capacité
   - Analyser cause racine
   - Décider : fix + re-promotion ou dépréciation définitive

---

## Exceptions & Escalade

### Cas exceptionnels

**Principe** : Ce protocole est **strict par défaut**, mais des exceptions peuvent être justifiées.

#### Exception autorisée si :

1. **Bug critique sécurité** : Retrait immédiat autorisé sans délai 6 mois
2. **Expérimentation R&D** : Capacité EXPERIMENTAL peut contourner certains checks (mais reste en Dev uniquement)
3. **Capacité système critique** : Si capacité affecte santé système (ex: health check), validation accélérée possible

#### Procédure d'exception

1. **Demande formelle** : Créer issue GitHub `[EXCEPTION] [nom_capacité]: [raison]`
2. **Justification** : Documenter pourquoi protocole standard impossible
3. **Approbation** : 2+ reviewers approuvent
4. **Traçabilité** : Documenter exception dans fiche capacité (section "Historique")
5. **Révision** : Re-évaluer protocole si exceptions fréquentes (améliorer protocole)

### Escalade

Si désaccord sur qualification :

1. **Reviewer 1** : Refuse promotion (checklist incomplète)
2. **Auteur** : Conteste (justification technique)
3. **Escalade** : Créer issue `[ESCALADE] [nom_capacité]` + discussion
4. **Décision finale** : Mainteneur principal (Kevin Thibault) ou vote équipe

---

## Validation du protocole

### Auto-vérification

Ce protocole lui-même suit les principes de qualification :

- [x] **Justification** : Éviter dérive capacités, maintenir qualité production
- [x] **Surface minimale** : 1 fichier doc, pas de code
- [x] **Preuve** : CI capability-qualification.yml valide conformité
- [x] **Réversibilité** : Protocole versionné, modifications via git
- [x] **Local-first** : Protocole git-based, pas de cloud requis

### Maintenance

Ce protocole est **scellé** (v1). Toute modification doit :

1. Suivre gouvernance (issue + review + approbation)
2. Être versionnée (`_v2`, `_v3`, etc.)
3. Migrer capacités existantes si changement breaking

---

**Fin du protocole de qualification**

*Document PHASE 6 — v1 scellé (2026-01-15)*  
*Modifications via gouvernance uniquement.*
