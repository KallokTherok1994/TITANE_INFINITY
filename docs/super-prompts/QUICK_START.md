# ⚡ Quick Start — Super Prompts TITANE∞

Guide de démarrage rapide pour utiliser les Super Prompts avec GitHub Copilot Chat.

---

## 🎯 Workflow en 5 étapes

### 1. **Préparation** (5 min)

```bash
# Position actuelle
git status
git branch

# Créer une branche de travail (recommandé)
git checkout -b chirurgie-frontend-final-form

# Backup de sécurité (optionnel)
git stash push -u -m "backup avant super prompt #1"
```

### 2. **Ouvrir Copilot Chat** (VS Code)

- **Raccourci** : `Ctrl+Alt+I` (Linux/Windows) ou `Cmd+Alt+I` (Mac)
- **Ou** : Clic sur l'icône Copilot dans la sidebar gauche
- **Ou** : Menu `View > Open View... > GitHub Copilot Chat`

### 3. **Lancer le Super Prompt**

1. Ouvrir le fichier du super prompt (ex: `docs/super-prompts/frontend/SUPER_PROMPT_01_FRONTEND_FINAL_FORM.md`)
2. Copier TOUT le contenu de la section « Super Prompt (Copier-coller dans Copilot Chat) »
3. Coller dans Copilot Chat
4. ✅ Envoyer (Enter)

### 4. **Supervision & Interaction**

Copilot va :

- 🔍 Analyser le workspace
- 📝 Générer du code
- 💬 Poser des questions si ambiguïté
- 📊 Produire un rapport de diagnostic

**Votre rôle** :

- ✅ Valider les suggestions pertinentes
- ❌ Rejeter ce qui ne correspond pas
- 💬 Clarifier si Copilot demande des précisions
- 🔄 Itérer si nécessaire

### 5. **Validation & Commit**

```bash
# Vérifier les fichiers modifiés
git status

# Lire les diffs importants
git diff src/design-system/css-vars.css
git diff tailwind.config.ts

# Tester la compilation
pnpm run build
# OU
pnpm build

# Tester le lint
pnpm run lint

# Si tout OK : commit
git add .
git commit -m "feat(frontend): Apply Super Prompt #1 - Frontend Final Form

- Add Design System (css-vars.css + tokens.ts)
- Update Tailwind config with Titane palette
- Create base layout components (AppShell, Sidebar, TopBar)
- Implement responsive mobile-first design
- Generate frontend diagnostic report

Co-authored-by: GitHub Copilot <noreply@github.com>"
```

---

## 🎨 Super Prompt #1 : Frontend Final Form

**Objectif** : Finaliser l'UI/UX de TITANE∞ (Design System + Layout + Responsive)

### Ce qui sera généré

| Fichier | Description |
|---------|-------------|
| `docs/frontend/FRONTEND_DIAGNOSTIC_TITANE.md` | Rapport d'analyse du frontend actuel |
| `src/design-system/css-vars.css` | Variables CSS globales (palette Titane) |
| `src/design-system/tokens.ts` | Tokens TypeScript (source de vérité) |
| `tailwind.config.ts` | Config Tailwind avec tokens |
| `src/components/layout/AppShell.tsx` | Shell principal de l'app |
| `src/components/layout/Sidebar.tsx` | Sidebar avec navigation |
| `src/components/layout/TopBar.tsx` | Top bar avec indicateurs |
| `src/components/layout/MainChat.tsx` | Zone de chat principale |
| `src/components/layout/DevToolsDock.tsx` | Panel DevTools responsive |
| `src/components/layout/MobileNav.tsx` | Navigation mobile bottom |

### Temps estimé

- ⏱️ **Analyse Copilot** : 2-5 min
- ⏱️ **Génération code** : 10-20 min (selon taille du codebase)
- ⏱️ **Review + Ajustements** : 15-30 min
- ⏱️ **Tests + Commit** : 10 min

**Total** : ~40 min - 1h15

---

## 💡 Tips & Bonnes Pratiques

### ✅ DO

- **Lire le diagnostic** : toujours lire `FRONTEND_DIAGNOSTIC_TITANE.md` avant d'appliquer les modifs
- **Tester progressivement** : appliquer les suggestions par lot, tester entre chaque
- **Garder le contexte** : ne pas fermer Copilot Chat tant que le super prompt n'est pas fini
- **Commiter régulièrement** : commit après chaque grande étape validée
- **Documenter les écarts** : si vous modifiez une suggestion Copilot, noter pourquoi

### ❌ DON'T

- **Ne pas tout accepter en aveugle** : reviewer le code généré
- **Ne pas mélanger les super prompts** : un à la fois
- **Ne pas skipper les tests** : toujours build + lint après application
- **Ne pas commit sans review** : lire au moins les diffs des fichiers critiques
- **Ne pas oublier le backup** : stash ou branche avant de commencer

---

## 🐛 Troubleshooting Rapide

### Copilot ne répond pas / timeout

```bash
# Relancer VS Code
# OU redémarrer l'extension Copilot
Ctrl+Shift+P → "Developer: Reload Window"
```

### Le code généré ne compile pas

1. Vérifier les imports manquants
2. Vérifier les chemins relatifs
3. Relancer `pnpm install` si nouvelles dépendances
4. Demander à Copilot de corriger (copier l'erreur dans le chat)

### La palette Titane n'apparaît pas

1. Vérifier que `css-vars.css` est importé dans `main.tsx` ou `App.tsx`
2. Vérifier que Tailwind pointe bien vers les CSS vars
3. Vérifier le build Tailwind (purge, etc.)

### Conflits Git après application

```bash
# Annuler les modifications si trop de conflits
git reset --hard HEAD
git stash pop  # récupérer le backup

# Puis relancer le super prompt avec plus de précisions
```

---

## 📊 Checklist de Validation

Après application du Super Prompt #1 :

- [ ] Le fichier `docs/frontend/FRONTEND_DIAGNOSTIC_TITANE.md` existe
- [ ] Le dossier `src/design-system/` existe avec `css-vars.css` et `tokens.ts`
- [ ] `tailwind.config.ts` contient la palette Titane
- [ ] Les composants layout compilent sans erreur TypeScript
- [ ] `pnpm run build` passe
- [ ] `pnpm run lint` ne révèle pas d'erreurs critiques
- [ ] L'app se lance en mode dev (`pnpm run dev`)
- [ ] Le dark mode s'affiche correctement
- [ ] Les couleurs Titane Métallique + Violet sont visibles
- [ ] Le responsive mobile fonctionne (tester en dev tools)

---

## 🔗 Liens Utiles

- [Super Prompts Index](./README.md)
- [Super Prompt #1 Détails](./frontend/SUPER_PROMPT_01_FRONTEND_FINAL_FORM.md)
- [Design System TITANE](../DESIGN_SYSTEM_TITANE.md)
- [Architecture TITANE∞](../ARCHITECTURE.md)

---

## 🆘 Support

En cas de problème :

1. **Relire la documentation** du super prompt
2. **Consulter le troubleshooting** ci-dessus
3. **Analyser les logs** Copilot (Output panel VS Code)
4. **Demander à Copilot** de corriger (lui donner l'erreur exacte)
5. **Rollback** si nécessaire (`git reset --hard`)

---

**Prochaine étape** : Une fois le Super Prompt #1 validé et commité, passer au **Super Prompt #2 - Rust Backend Cleanup** (à venir).

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
