# 04_REFERENCE_TRUTH.md — Vérification des références

## Fichiers déplacés — recherche de références

### RELEASE_v28.6.0–v28.80.0_SEALED.txt

```bash
grep -r "RELEASE_v28\." README.md docs/ CHANGELOG.md scripts/ 2>/dev/null
```

**Résultat**:
- README.md: références à `RELEASE_v28.82.0_SEALED.txt` (courante) et `RELEASE_v28.5.0_SEALED.txt` (redeploy proof) uniquement
- docs/README.md: référence à `RELEASE_v28.82.0_SEALED.txt` uniquement  
- CHANGELOG.md: références aux `docs/90_release/PRODUCTION_RELEASE_v28.*.md` uniquement (pas aux fichiers racine)
- scripts/: aucune référence aux fichiers RELEASE racine individuels
- **Aucune référence trouvée aux versions v28.6.0–v28.80.0**

### RELEASE_ARTIFACTS_CHECKSUMS_28.6.0–28.80.0.txt

```bash
grep -r "RELEASE_ARTIFACTS_CHECKSUMS" README.md docs/ scripts/ 2>/dev/null
```

**Résultat**:
- `scripts/generate-release-checksums.sh` génère ces fichiers (OUTPUT variable) mais ne les référence pas par nom fixe
- Aucune référence directe aux versions v28.6.0–v28.80.0

### nohup.out

```bash
grep -r "nohup.out" README.md docs/ scripts/ 2>/dev/null
```

**Résultat**: Aucune référence. Contenu: 3 lignes démarrage vite (114 bytes). **Suppression prouvée safe**.

## Fichiers conservés — justification références

| Fichier conservé | Référence trouvée |
|-----------------|------------------|
| RELEASE_v28.5.0_SEALED.txt | README.md: `Proof: RELEASE_v28.5.0_SEALED.txt` |
| RELEASE_v28.82.0_SEALED.txt | README.md, docs/README.md, `cat RELEASE_v28.82.0_SEALED.txt` |
| RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt | scripts/autoheal/autoheal_rules.jsonl AH-2026-03-21-BUILD-UNBLOCK |
| build_log.txt | scripts/advanced-diagnostic.sh: `${PROJECT_ROOT}/build_log.txt` |
