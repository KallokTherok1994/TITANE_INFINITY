# Rollback Plan — v33.0.18 → v33.0.17

**Date**: 2026-05-12 | **Scope**: SEAL v33.0.18

---

## Trigger conditions

Rollback vers v33.0.17 si :
- Régression critique découverte post-seal sur AH-v87/v88/v89/v90
- Corruption d'artifact (sha256 mismatch)
- Défaillance système install post-dpkg

---

## Rollback Git (code)

```bash
# Rollback au commit juste avant AH-v87
git log --oneline | grep "v33.0.17"
git revert --no-commit 80bb2102a bc3946127 c9966c652 a4ba6616b a3f689f95 7898489a3
git commit -m "revert: rollback v33.0.18 AH-v87→v91 → v33.0.17"
git push origin MAIN
```

---

## Rollback système (binaire)

```bash
# Installer la version DEB précédente (33.0.17)
sudo dpkg -i deployment/latest/titane-infinity_33.0.17_amd64.deb
# Vérifier
dpkg -s titane-infinity | grep Version  # → 33.0.17
```

---

## Rollback deployment/latest

```bash
# Restaurer les artifacts v33.0.17
git checkout 319b911f4 -- deployment/latest/
```

---

## Vérification post-rollback

```bash
bash scripts/autoheal/detect_recurrence.sh  # PASS requis
bash scripts/verify_instructions.sh         # PASS=52 FAIL=0 requis
dpkg -s titane-infinity | grep Version      # 33.0.17
```
