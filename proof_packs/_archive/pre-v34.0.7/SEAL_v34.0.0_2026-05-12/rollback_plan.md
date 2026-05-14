# Rollback Plan — SEAL v34.0.0

**Date**: 2026-05-12 | **Scope**: SEAL formel v34.0.0

---

## Trigger conditions

Rollback si post-SEAL v34.0.0 : régression critique, artifact corrompu, gate FAIL non résolu.

---

## Rollback code → v33.0.18

```bash
# Revert le bump MAJOR seulement (conserver les corrections AH-v87→v93)
git revert aab87f36a  # bump 33.0.18→34.0.0
git push origin MAIN
```

## Rollback système

```bash
# Reinstaller v33.0.18 depuis le DEB archivé
sudo dpkg -i release/titane-infinity_33.0.18_amd64.deb || \
  sudo apt-get install -f
dpkg -s titane-infinity | grep Version  # → 33.0.18
```

## Vérification post-rollback

```bash
bash scripts/autoheal/detect_recurrence.sh  # PASS
bash scripts/verify_instructions.sh         # PASS=52 FAIL=0
dpkg -s titane-infinity | grep Version      # 33.0.18
grep '"version"' package.json               # 33.0.18
```
