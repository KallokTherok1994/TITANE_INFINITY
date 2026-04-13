# TITANE∞ — Workflows (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Workflow docs uniquement (PATH_SIMPLE)

Pour les modifications de documentation uniquement :

```bash
# 1. Créer une branche
git checkout -b docs/my-change

# 2. Modifier les fichiers docs
# (uniquement .md, pas de code runtime)

# 3. Vérifier (docs uniquement — pas de test runtime requis)
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# 4. Commiter
git add docs/
git commit -m "docs: description du changement"

# 5. Push et ouvrir une PR
```

---

## Workflow développeur standard

```bash
# 1. Créer une branche depuis MAIN
git checkout MAIN
git pull
git checkout -b feat/my-feature

# 2. Développer
pnpm run dev

# 3. Vérifier en continu
pnpm run check          # TypeScript
pnpm run lint           # ESLint
pnpm run format:check   # Prettier
pnpm run test           # Vitest

# 4. Avant commit — vérification complète
pnpm run verify
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# 5. Commiter
git add -p  # Revue sélective des changements
git commit -m "feat: description"

# 6. Push
git push origin feat/my-feature
```

---

## Workflow bugfix

```bash
# 1. Identifier le bug — documenter clairement le symptôme

# 2. Créer une branche
git checkout -b fix/bug-description

# 3. Corriger — changement minimal

# 4. Capturer dans AutoHeal (OBLIGATOIRE)
# Ajouter une entrée dans scripts/autoheal/autoheal_rules.jsonl
# Format : voir entrées existantes dans le fichier

# 5. Vérifier
pnpm run test
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh

# 6. Commiter
git commit -m "fix: description du correctif"
```

---

## Workflow de validation

```bash
# Vérification complète avant PR
pnpm run verify:final100

# Gates individuels
pnpm run verify:tauri-only
pnpm run verify:online-first
pnpm run verify:tauri-configs
pnpm run verify:instructions
bash scripts/gates/g1-no-offline-without-reason.sh
bash scripts/gates/g3-legacy-divergence.sh
bash scripts/autoheal/detect_recurrence.sh
```

---

## Workflow release

> Builds production à la demande — aucun token gate requis (Rule 11).
> Utiliser la commande `BUILD ALL` pour la séquence complète (Rule 14).

Sans autorisation explicite : **STOP-THE-LINE**

---

## Workflow rollback

```bash
# Rollback d'un fichier spécifique
git restore -- chemin/vers/fichier.ts

# Rollback de tous les docs
git restore -- docs/

# Rollback complet depuis un commit connu
git revert HEAD --no-commit
git commit -m "revert: description"
```

---

*Documentation en anglais : [docs/dev/en/workflows.md](../en/workflows.md)*
