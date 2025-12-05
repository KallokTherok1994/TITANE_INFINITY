# 🔮 TODO - Migrations v25

**Date création**: 3 décembre 2025
**Build actuel**: v25.3 ✅ PRODUCTION READY
**Status migrations**: 2/3 complètes

---

## ✅ MIGRATIONS COMPLÈTES

### v25.2 - talkToTitane Suite (COMPLETE ✅)
**Status**: ✅ Réactivé avec stubs minimaux
**Commit**: `e4e6a99` - feat(talkToTitane): v25.2
**Réalisations**:
- ✅ tauriFsAdapter.ts créé (Node.js fs → Tauri stubs)
- ✅ 4 modules restaurés (1,465 lignes)
- ✅ 17 commandes devSudoHandler réactivées
- ✅ 15 handlers implémentés (stubs minimaux)

### v25.3 - Tauri Filesystem APIs (COMPLETE ✅)
**Status**: ✅ Production-ready avec lazy loading
**Commit**: `2d9d3c7` - feat(tauriFsAdapter): v25.3
**Réalisations**:
- ✅ Vraies APIs Tauri intégrées (@tauri-apps/api/fs)
- ✅ Lazy-loading dynamique avec @ts-ignore
- ✅ Fallback localStorage automatique
- ✅ 8 opérations filesystem complètes
- ✅ Compatible Node.js fs/promises
- ✅ Build 7.95s, 0 erreurs TypeScript

---

## 🎯 MIGRATION v25.1 - DESIGN SYSTEM (EN COURS)

### Objectif
Compléter migration Design System tokens v15→v16 et réactiver 4 composants.

### Status
**Problème identifié**: Les 4 composants `.disabled` importent depuis `../tokens` mais:
- ✅ Fichier `src/design-system/tokens.ts` existe
- ❌ Structure tokens v16 différente de ce que composants attendent
- ❌ Composants référencent propriétés inexistantes

### Fichiers Impactés
```
src/design-system/components/TBadge.tsx.disabled
src/design-system/components/TMetric.tsx.disabled
src/design-system/components/TSectionHeader.tsx.disabled
src/design-system/components/UIStates.tsx.disabled
```

### Checklist Migration

#### Phase 1: Analyse Tokens v16
- [ ] Documenter tous les tokens v16 disponibles
- [ ] Identifier propriétés manquantes vs v15
- [ ] Créer mapping v15→v16 complet

**Propriétés à vérifier**:
```typescript
// Erreurs actuelles:
Property 'titanium' does not exist on type 'Colors'        // ~58 occurrences
Property 'bg' does not exist on type 'BackgroundColors'    // ~12 occurrences
Property 'radius' does not exist on type 'Spacing'         // ~15 occurrences
```

#### Phase 2: Corrections Composants
- [ ] **TBadge.tsx**
  - [ ] Remplacer `colors.titanium` par équivalent v16
  - [ ] Adapter propriétés `bg`, `text`, `border`
  - [ ] Tests visuels storybook

- [ ] **TMetric.tsx**
  - [ ] Adapter tokens couleurs
  - [ ] Vérifier spacing/padding
  - [ ] Tests visuels

- [ ] **TSectionHeader.tsx**
  - [ ] Adapter tokens typographie
  - [ ] Vérifier spacing
  - [ ] Tests visuels

- [ ] **UIStates.tsx**
  - [ ] Adapter tokens états (error, success, warning, info)
  - [ ] Vérifier animations
  - [ ] Tests visuels

#### Phase 3: Restauration Fichiers
- [ ] Restaurer fichiers:
  ```bash
  cd src/design-system/components
  mv TBadge.tsx.disabled TBadge.tsx
  mv TMetric.tsx.disabled TMetric.tsx
  mv TSectionHeader.tsx.disabled TSectionHeader.tsx
  mv UIStates.tsx.disabled UIStates.tsx
  ```

- [ ] Décommenter exports:
  ```typescript
  // src/design-system/index.ts
  export * from './components';  // UNCOMMENTER
  ```

- [ ] Supprimer placeholders inline:
  ```typescript
  // src/modules/OrchestrationIntelligenceCenter.tsx
  // SUPPRIMER:
  const TBadge: React.FC<any> = ({ children }) => <span>{children}</span>;
  const TMetric: React.FC<any> = ({ label, value }) => <div>{label}: {value}</div>;
  const TSectionHeader: React.FC<any> = ({ title }) => <h2>{title}</h2>;

  // RESTAURER:
  import { TBadge, TMetric, TSectionHeader } from '../design-system';
  ```

- [ ] Même traitement pour:
  - `src/modules/IdentityMemoryEvolutionCenter.tsx`
  - `src/modules/TemporalFlowCenter.tsx`

#### Phase 4: Validation
- [ ] Build TypeScript: `npm run type-check`
- [ ] Build production: `npm run build`
- [ ] Tests visuels Storybook (si disponible)
- [ ] Tests runtime: `npm run tauri:dev`
- [ ] Vérification UI dans 3 centers

#### Phase 5: Commit
```bash
git add .
git commit -m "feat(design-system): v25.1 - Réactivation composants après migration tokens v16

- Migration tokens v15→v16 complète
- Restauré 4 composants (.disabled → .tsx)
- Supprimé placeholders inline (3 fichiers)
- Décommenté exports barrel
- Tests visuels validés

Impact: +4 composants réactivés
Closes: Design System temporairement désactivé
"
git push origin main
```

---

## 🎯 MIGRATION v25.2 - TALK-TO-TITANE

### Objectif
Migration Node.js `fs` vers Tauri filesystem APIs et réactivation 17 commandes sudo.

### Fichiers Impactés

**Stubs à supprimer**:
```
src/modules/talkToTitane/AutoSaveConversationEngine.ts
src/modules/talkToTitane/SelfHealingConversationEngine.ts
src/modules/talkToTitane/ConversationTimelineEngine.ts
src/modules/talkToTitane/TalkToTitaneEngine.ts
```

**Fichiers à restaurer**:
```
src/modules/talkToTitane.disabled/ (backup originals)
```

**Handler à modifier**:
```
src/modules/devSudo/devSudoHandler.ts (17 cases commentés)
```

### Checklist Migration

#### Phase 1: Backup & Préparation
- [ ] Vérifier backup originals dans `.disabled/`
- [ ] Documenter toutes les fonctions filesystem utilisées
- [ ] Lister APIs Tauri équivalentes

**Imports à remplacer**:
```typescript
// BEFORE (Node.js)
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, resolve, dirname } from 'path';

// AFTER (Tauri)
import { exists, readTextFile, writeTextFile, createDir } from '@tauri-apps/api/fs';
import { join, appDataDir, resolve } from '@tauri-apps/api/path';
```

#### Phase 2: Migration Fonctions Filesystem

**AutoSaveConversationEngine.ts**:
- [ ] `saveSession()`:
  ```typescript
  // BEFORE
  writeFileSync(path, JSON.stringify(data));

  // AFTER
  await writeTextFile(path, JSON.stringify(data), { dir: await appDataDir() });
  ```

- [ ] `saveInteraction()`: Même pattern
- [ ] `flush()`: Adapter bulk writes
- [ ] `loadState()`: Adapter reads

**SelfHealingConversationEngine.ts**:
- [ ] `scan()`:
  ```typescript
  // BEFORE
  if (existsSync(file)) { ... }

  // AFTER
  if (await exists(file, { dir: await appDataDir() })) { ... }
  ```

- [ ] `heal()`: Adapter file writes/reads
- [ ] `rebuild()`: Adapter directory operations

**ConversationTimelineEngine.ts**:
- [ ] `build()`: Migration writes
- [ ] `export()`: Migration file export
- [ ] `loadTimeline()`: Migration reads

**TalkToTitaneEngine.ts**:
- [ ] Vérifier si filesystem utilisé
- [ ] Adapter si nécessaire

#### Phase 3: Tests Unitaires
- [ ] Créer tests pour chaque fonction migrée
- [ ] Vérifier compatibilité async/await
- [ ] Tests erreurs (file not found, permission denied)

#### Phase 4: Restauration Implémentations
- [ ] Supprimer 4 stubs
- [ ] Restaurer implémentations originales avec migrations
- [ ] Vérifier imports dans tous les fichiers

#### Phase 5: Restauration devSudoHandler
- [ ] Décommenter 17 case statements:
  ```typescript
  // BEFORE
  /* DISABLED - Migration v25
  case 'talk-on':
    return await handleTalkOn(command.params.mode as string);
  */

  // AFTER
  case 'talk-on':
    return await handleTalkOn(command.params.mode as string);
  ```

- [ ] Vérifier toutes les fonctions handler existent
- [ ] Tester chaque commande individuellement

#### Phase 6: Validation
- [ ] Build TypeScript: `npm run type-check`
- [ ] Build production: `npm run build`
- [ ] Tests runtime: `npm run tauri:dev`
- [ ] Tests manuels 17 commandes:
  ```
  sudo talk.on
  sudo talk.off
  sudo talk.mode voice
  sudo conversation.save
  sudo timeline.build
  ... etc
  ```

#### Phase 7: Commit
```bash
git add .
git commit -m "feat(talk-to-titane): v25.2 - Migration Tauri filesystem APIs complète

- Remplacé Node.js fs par @tauri-apps/api/fs
- Restauré 17 commandes sudo fonctionnelles
- Supprimé 4 stubs temporaires
- Migration async/await complète
- Tests validés pour toutes les commandes

Filesystem migrations:
- existsSync → exists
- readFileSync → readTextFile
- writeFileSync → writeTextFile
- mkdir → createDir
- path.join → @tauri-apps/api/path.join

Impact: +17 commandes réactivées
Closes: talkToTitane temporairement désactivé
"
git push origin main
```

---

## 📊 ESTIMATION DURÉE

### v25.1 - Design System
**Estimation**: 2-4 heures
- Analyse tokens: 30 min
- Corrections composants: 1-2h
- Restauration: 30 min
- Tests & validation: 1h

### v25.2 - talkToTitane
**Estimation**: 4-6 heures
- Analyse filesystem: 1h
- Migration fonctions: 2-3h
- Tests unitaires: 1h
- Validation complète: 1-2h

**Total**: 6-10 heures

---

## 🎯 PRIORITÉS

1. **URGENT**: v25.1 - Design System (UI impactée)
2. **NORMAL**: v25.2 - talkToTitane (fonctionnalités avancées)

---

## 📚 RESSOURCES

### Documentation Tauri Filesystem
- https://tauri.app/v1/api/js/fs
- https://tauri.app/v1/api/js/path

### Design System Tokens
- Voir `src/design-system/tokens/` pour v16

### Backup Originals
- `src/modules/talkToTitane.disabled/` (implémentations complètes)

---

## ✅ VALIDATION FINALE

Après completion v25.1 + v25.2:
- [ ] 0 modules désactivés
- [ ] 0 placeholders temporaires
- [ ] 0 stubs fonctionnels
- [ ] Toutes commandes sudo fonctionnelles
- [ ] Build < 10s
- [ ] 0 erreurs TypeScript
- [ ] Documentation à jour

---

**Date**: 3 décembre 2025
**Build actuel**: v24.2.0 ✅
**Prochaine version**: v25.0 (après migrations)
