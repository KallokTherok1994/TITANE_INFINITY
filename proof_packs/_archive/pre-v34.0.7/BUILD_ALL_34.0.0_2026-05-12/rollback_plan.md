# Rollback Plan — v34.0.0 → v33.0.18

**Date**: 2026-05-12 | **Scope**: BUILD ALL v34.0.0

---

## Trigger conditions

Rollback vers v33.0.18 si :
- Régression critique découverte dans v34.0.0 post-build
- Corruption d'artifact (sha256 mismatch)
- Défaillance système install post-dpkg

---

## Rollback Git (code)

```bash
# Rollback version bump seulement (conserver les corrections AH-v87→v92)
git revert aab87f36a  # commit chore(version): bump 33.0.18 → 34.0.0
git push origin MAIN
```

---

## Rollback système (binaire)

```bash
# Réinstaller la version DEB 33.0.18
sudo dpkg -i deployment/latest/titane-infinity_33.0.18_amd64.deb
# Vérifier
dpkg -s titane-infinity | grep Version  # → 33.0.18
```

---

## Rollback deployment/latest

```bash
# Restaurer les artifacts v33.0.18 depuis le commit seal
git checkout edb00d0a4 -- deployment/latest/
```

---

## Vérification post-rollback

```bash
bash scripts/autoheal/detect_recurrence.sh  # PASS requis
bash scripts/verify_instructions.sh         # PASS=52 FAIL=0 requis
dpkg -s titane-infinity | grep Version      # 33.0.18
grep '"version"' package.json               # 33.0.18
```
