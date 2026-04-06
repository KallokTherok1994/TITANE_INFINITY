# TITANE∞ — Gates (FR)

**Version :** 28.0.0  
**Statut :** PROVEN  
**Date :** 2026-03-17

> Voir aussi : `docs/MAP_GATES.md`, `docs/MAP_TESTS_GATES.md`, `scripts/gates/`

---

## Gates obligatoires

Ces gates doivent passer après toute modification de code :

```bash
bash scripts/verify_instructions.sh          # PASS=20 FAIL=0 attendu
bash scripts/autoheal/detect_recurrence.sh   # G_AH_RECURRENCE_GUARD_PASS attendu
```

---

## Catalogue des gates

### Gate G1 — Pas d'offline sans raison

```bash
bash scripts/gates/g1-no-offline-without-reason.sh
```

**But :** Vérifier qu'aucun comportement offline non justifié n'est introduit.  
**Critère :** Exit 0  
**Note :** Utilise `grep -rn` (ripgrep avec fallback grep — corrigé AH-2026-03-14)

---

### Gate G2 — Conformité IPC

```bash
pnpm run guard:ipc-contract
bash scripts/guard/guard-ipc-only-tests.sh
```

**But :** Vérifier que les tests n'accèdent pas à des ressources réseau directement.  
**Critère :** Exit 0

---

### Gate G3 — Divergence legacy

```bash
bash scripts/gates/g3-legacy-divergence.sh
```

**But :** Détecter les divergences entre la codebase et les docs legacy.  
**Critère :** Exit 0

---

### Gate rc-network-surface

```bash
bash scripts/gates/rc-network-surface-gate.sh
```

**But :** Vérifier la surface réseau contrôlée.  
**Critère :** Exit 0

---

### Gate verify_instructions (global)

```bash
bash scripts/verify_instructions.sh
```

**But :** Vérifier 20 règles d'instructions Copilot.  
**Critère :** PASS=20, FAIL=0  
**Source :** `scripts/verify_instructions.sh`

---

### Gate detect_recurrence (AutoHeal)

```bash
bash scripts/autoheal/detect_recurrence.sh
```

**But :** Vérifier qu'aucune règle AutoHeal n'a été silencieusement reviolée.  
**Critère :** `G_AH_RECURRENCE_GUARD_PASS`  
**Exigence :** La dernière entrée du registre doit avoir `prevention_test` contenant `detect_recurrence`

---

### Gate tauri-only

```bash
pnpm run verify:tauri-only
bash scripts/verify/enforce-tauri-only.sh
```

**But :** Vérifier qu'aucun serveur web ou runtime non-Tauri n'est introduit.  
**Critère :** Exit 0

---

### Gate online-first

```bash
pnpm run verify:online-first
bash scripts/verify/enforce-online-first.sh
```

**But :** Vérifier la conformité à la doctrine online-first.  
**Critère :** Exit 0

---

### Gate tauri-configs

```bash
pnpm run verify:tauri-configs
bash scripts/verify/validate-tauri-configs.sh
```

**But :** Vérifier la cohérence des fichiers de configuration Tauri.  
**Critère :** Exit 0

---

### Gate prod-boot

```bash
pnpm run gate:prod-boot
node scripts/gates/vite-base-relative-gate.cjs
```

**But :** Vérifier que le build de prod peut démarrer.  
**Critère :** Exit 0

---

## Politique stop-the-line

Quand un gate échoue :

1. **ARRÊTER** — ne pas continuer
2. **NOMMER** l'échec clairement (FAIL + cause)
3. **CLASSER** : FAIL, BLOCKED, ou BLOCKED_APPROVAL
4. **CORRIGER** — changement minimal uniquement
5. **CAPTURER** dans AutoHeal
6. **RÉEXÉCUTER** les gates
7. **CONSIGNER** dans un proof pack si P0

**Aucune exception. Aucune narrative ne peut contourner un gate FAIL.**

---

*Documentation en anglais : [docs/governance/en/gates.md](../en/gates.md)*
