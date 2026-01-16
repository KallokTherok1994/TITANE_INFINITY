# 🧩 Capacité: [NOM_CAPACITE]

**Template ID**: CAP_TEMPLATE_v1  
**Date création**: YYYY-MM-DD  
**Auteur**: [VOTRE_NOM]  
**Statut**: `[EXPERIMENTAL|QUALIFIED|STABLE|DEPRECATED]`  
**Couche cible**: `[Dev|Stable]`

---

## 1. Nom & But

**Nom officiel**: `[nom_technique]`  
**But (1 phrase)**: [Décrivez en une phrase claire ce que cette capacité apporte]

---

## 2. Statut actuel

| Statut | Date | Commit | Notes |
|--------|------|--------|-------|
| EXPERIMENTAL | YYYY-MM-DD | [hash] | Capacité en développement, API peut changer |
| QUALIFIED | - | - | Tests complets, API figée, non-prod |
| STABLE | - | - | Production-ready, backward compat garantie |
| DEPRECATED | - | - | Marquée obsolète, sera retirée |

---

## 3. Couche

- [ ] **Dev uniquement** (runtime/dev/, whitelist dev, non exposé en Stable)
- [ ] **Stable** (runtime/stable/, whitelist stable, production-ready)

---

## 4. Surface exposée

### 4.1 Commands Tauri

Liste des commandes Tauri ajoutées ou modifiées :

| Command | Permissions | Inputs | Outputs | Notes |
|---------|-------------|--------|---------|-------|
| `command_name` | `memory:read`, `fs:read` | `{path: string}` | `Result<T, E>` | Description courte |

### 4.2 Permissions

Permissions requises (allowlist Tauri) :

```json
{
  "memory": ["read", "write"],
  "fs": {
    "scope": ["$APPDATA/memory/**"]
  }
}
```

### 4.3 Endpoints réseau

- [ ] Aucun endpoint réseau
- [ ] Endpoints (lister):
  - `https://api.example.com/endpoint` (usage, fallback local)

### 4.4 Accès filesystem/process

- [ ] Aucun accès FS/process
- [ ] Accès FS (lister chemins canoniques + allowlist)
- [ ] Accès process (lister + justification)

---

## 5. Risques

### 5.1 Sécurité

| Risque | Sévérité | Mitigation | Résiduel |
|--------|----------|------------|----------|
| Path traversal | HIGH | Canonicalize + allowlist strict | LOW |
| Injection | MEDIUM | Input validation + sanitization | LOW |

### 5.2 Privacy

- [ ] Aucune donnée personnelle
- [ ] Données personnelles traitées (lister + consentement + chiffrement)

### 5.3 Supply-chain

- [ ] Aucune dépendance externe
- [ ] Dépendances (lister + audit + verrouillage versions)

### 5.4 UX

- [ ] Pas d'impact UX
- [ ] Impact UX (décrire + fallback si échec)

---

## 6. Critères d'acceptation

### 6.1 Tests

- [ ] **Unit tests** : `tests/unit/[module].test.ts` (couverture ≥ 80%)
- [ ] **Contract tests** : `tests/contract/tauri.contract.test.ts` (TS ↔ Tauri)
- [ ] **Integration tests** : `tests/integration/[feature].test.ts`
- [ ] **Smoke tests** : `scripts/smoke/smoke_[feature].sh` (keepalive + ERROR scan)

### 6.2 Gates CI

- [ ] **constitution-audit** : PASS (no secrets, no drift)
- [ ] **capability-qualification** : PASS (checks spécifiques capacité)
- [ ] **stable-build** : PASS (build reproductible)
- [ ] **tests-all** : PASS (100% tests passent)

### 6.3 Documentation

- [ ] **Fiche capacité** : `docs/capabilities/[nom].md` (ce fichier)
- [ ] **CAPABILITIES_REGISTRY** : Mise à jour (statut + métadonnées)
- [ ] **API_SURFACE** : Mise à jour (commandes + permissions)
- [ ] **Release notes** : Entrée dans CHANGELOG.md

---

## 7. Plan de rollback

### 7.1 Avant STABLE

Si échec en EXPERIMENTAL ou QUALIFIED :
- [ ] Retirer de allowlist dev
- [ ] Retirer tests échouant
- [ ] Documenter échec dans fiche capacité

### 7.2 Après STABLE

Si bug critique en production :
- [ ] **Hotfix immédiat** : Désactiver command via feature flag (si supporté)
- [ ] **Rollback version** : Downgrade vers version stable précédente (voir docs/RELEASE.md)
- [ ] **Deprecation** : Si correction impossible, marquer DEPRECATED (2 versions minimum)

### 7.3 Rollback procedure

```bash
# 1. Désactiver capacité (si feature flag)
# sed -i 's/"capability_name": true/"capability_name": false/' src-tauri/Cargo.toml

# 2. Rebuild stable sans capacité
# bash runtime/stable/build.sh

# 3. Smoke test
# bash scripts/smoke/smoke_stable_appimage.sh

# 4. Tag version hotfix
# git tag -a v26.3.1-hotfix -m "Disable [capability] due to [issue]"
# git push origin v26.3.1-hotfix
```

---

## 8. Preuves

### 8.1 Commits

| Phase | Commit | Date | Description |
|-------|--------|------|-------------|
| EXPERIMENTAL | [hash] | YYYY-MM-DD | Implémentation initiale |
| QUALIFIED | [hash] | YYYY-MM-DD | Tests + docs complets |
| STABLE | [hash] | YYYY-MM-DD | Promotion stable |

### 8.2 Tests

- **Unit tests** : [lien vers fichier test]
- **Contract tests** : [lien vers assertion]
- **Smoke tests** : [lien vers script]
- **CI runs** : [lien GitHub Actions run PASS]

### 8.3 Validation

- [ ] **Code review** : Approuvé par [REVIEWER]
- [ ] **Security review** : Approuvé par [SECURITY_LEAD]
- [ ] **Smoke test PASS** : [lien vers log]
- [ ] **Constitution audit PASS** : [lien CI run]

---

## 9. Observabilité

### 9.1 Logs

Format logs (voir runtime/LOGGING_STANDARD.md) :

```rust
info!(
    target: "capability::[nom]",
    operation = "operation_name",
    path = ?sanitized_path,
    "Operation completed successfully"
);
```

### 9.2 Métriques

- [ ] Aucune métrique
- [ ] Métriques collectées (lister + privacy-safe) :
  - Nombre d'appels command (anonyme, local uniquement)
  - Temps exécution moyen (local uniquement)

### 9.3 Health check

- [ ] Aucun health check
- [ ] Health check ajouté : `scripts/health/health_check.sh` (section [nom_capacite])

---

## 10. Mode dégradé local-first

**Principe** : Toute capacité doit fonctionner sans cloud au démarrage.

### 10.1 Fonctionnement local

- [ ] **100% local** : Aucun appel réseau requis
- [ ] **Fallback local** : Fonctionne offline avec cache/default

### 10.2 Dépendances cloud (si applicable)

- [ ] Aucune dépendance cloud
- [ ] Dépendances cloud (justifier + fallback) :
  - Service: [nom_service]
  - Usage: [cas_usage]
  - Fallback: [mode_degrade_local]
  - Consentement: [ ] Requis [ ] Optionnel

---

## 11. Promotion à STABLE (checklist)

Cette capacité ne peut passer à **STABLE** que si :

- [ ] **Fiche capacité complétée** (ce fichier, 100% sections remplies)
- [ ] **CAPABILITIES_REGISTRY mis à jour** (statut STABLE + métadonnées)
- [ ] **API_SURFACE mis à jour** (commandes + permissions documentées)
- [ ] **Tests contractuels PASS** (TS ↔ Tauri validé)
- [ ] **Smoke tests PASS** (keepalive + no ERROR)
- [ ] **Gates CI PASS** : constitution-audit + capability-qualification + stable-build + tests-all
- [ ] **Rollback documenté** (section 7 complète)
- [ ] **Observabilité OK** (logs + health check si nécessaire)
- [ ] **Mode dégradé local** (fonctionne offline)
- [ ] **Code review approuvé** (1+ reviewer)
- [ ] **Security review approuvé** (si HIGH risk)

**Validation finale** : Un script CI (`scripts/ci/check-promotion-stable.sh`) vérifie automatiquement cette checklist avant merge.

---

## Historique

| Date | Événement | Auteur |
|------|-----------|--------|
| YYYY-MM-DD | Création fiche EXPERIMENTAL | [NOM] |
| YYYY-MM-DD | Promotion QUALIFIED | [NOM] |
| YYYY-MM-DD | Promotion STABLE | [NOM] |

---

**Fin du template**

*Ce template fait partie du système de qualification PHASE 6 (v1 — scellé).*  
*Toute modification de ce template doit suivre le protocole de gouvernance.*
