# V7_MASTER_FIX_PREFLIGHT

Date (UTC): 2026-02-08

## Commandes exécutées

```
date -u
git rev-parse --short HEAD
ls -la docs/reference/agentgpt-ui/ || true
ls -la docs/reference/ui-carto-v4/ || true
ls -la docs/reference/kevin-v5/ || true
```

## Sorties

```
dim. 08 févr. 2026 16:54:55 UTC
1d30441f
total 116
drwxrwxr-x 2 titane-os titane-os   4096 févr.  8 11:48 .
drwxrwxr-x 5 titane-os titane-os   4096 févr.  8 11:48 ..
-rw-r--r-- 1 titane-os titane-os 107973 févr.  8 11:47 ANALYSE-AGENTGPT.pdf
total 56
drwxrwxr-x 3 titane-os titane-os  4096 févr.  8 11:49 .
drwxrwxr-x 5 titane-os titane-os  4096 févr.  8 11:48 ..
drwxr-xr-x 8 titane-os titane-os  4096 févr.  8 11:38 TITANE_UI_CARTOGRAPHY_v4
-rw-r--r-- 1 titane-os titane-os 42616 févr.  7 12:47 TITANE_UI_CARTOGRAPHY_v4.zip
total 40
drwxrwxr-x 2 titane-os titane-os 4096 févr.  8 10:27 .
drwxrwxr-x 5 titane-os titane-os 4096 févr.  8 11:48 ..
-rw-rw-r-- 1 titane-os titane-os 6692 févr.  8 10:27 KEVIN_V5_IMPORT_CHECKLIST.md
-rw-rw-r-- 1 titane-os titane-os 9633 févr.  8 10:27 KEVIN_V5_IMPORT_EXAMPLE.md
-rw-rw-r-- 1 titane-os titane-os 8609 févr.  8 10:27 KEVIN_V5_IMPORT_SPEC.md
```

## Baseline check

- AgentGPT PDF: présent ✅
- v4 zip: présent ✅
- Kevin V5 baseline admissible: absent → Gate F BLOCKED_BASELINE_MISSING
