# 16_VERSIONS_SYNC_REPORT — Rapport Synchronisation Versions
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Commande

```bash
grep '"version"' package.json
grep "^version" src-tauri/Cargo.toml
python3 -c "import json; d=json.load(open('src-tauri/tauri.conf.json')); print(d['version'])"
python3 -c "import json; d=json.load(open('deployment/latest/MANIFEST.json')); print(d['version'])"
```

## Résultats

| Fichier | Version | Status |
|---------|---------|--------|
| `package.json` | 27.2.0 | ✅ |
| `src-tauri/Cargo.toml` | 27.2.0 | ✅ |
| `src-tauri/tauri.conf.json` | 27.2.0 | ✅ |
| `deployment/latest/MANIFEST.json` | 27.2.0 | ✅ |

**Status: ✅ PASS — G_VERSION_SYNC**

---

## Fichiers Additionnels

| Fichier | Vérification | Status |
|---------|-------------|--------|
| `runtime/dev/tauri.conf.json` | Non audité (dev config) | NON PROUVÉ |
| `runtime/stable/tauri.conf.json` | Non audité (stable config) | NON PROUVÉ |
| `deployment/latest/SHA256SUMS_v27.2.0.txt` | LFS binaires — non vérifiable sans pnpm | NON PROUVÉ |
| `deployment/v27.4.1/` | 27.4.1 — version LTS-NEXT différente | NOTE: pas mismatch (autre branche) |

---

## Conclusion

**VERDICT VERSIONS: PASS** — Les 4 fichiers de référence sont alignés sur 27.2.0.

Fichiers runtime et SHA256SUMS non vérifiés mais non bloquants pour l'audit actuel (pas de build PROD planifié).
