# TITANE∞ UI/UX REWORK vΩ — AUDIT REPORT
**Date:** 2026-02-01  
**Status:** PHASE A COMPLET — AUDIT INITIAL  
**Registry:** UI_AUDIT_START  

---

## A) CARTOGRAPHIE ARCHITECTURE ACTUELLE

### A1. **AppShell / Layout Principal**

#### **Composants identifiés:**

1. **`src/components/layout/AppShell.tsx`** (PRINCIPAL)
   - Layout flex 3-colonnes : `header` + `sidebar` + `main` + `footer`
   - Sidebar animée avec Framer Motion
   - Width: 280px (expanded) / 64px (collapsed)
   - Props: `sidebarCollapsed` (boolean)
   - **Impact:** 🔴 CRITIQUE — Utilisé par App.tsx + AppShellWithDevTools

2. **`src/layouts/AppLayout.tsx`** (LEGACY)
   - Layout similaire mais CSS custom (non Tailwind)
   - Sidebar width: 280px
   - **Impact:** 🟠 MOYEN — Potentiellement utilisé par composants legacy

3. **`src/ui/AppLayout.tsx`** (UI MODULE)
   - Layout avec `Menu` component intégré
   - Gère collapse local : `isSidebarCollapsed` (useState)
   - **Impact:** 🟡 FAIBLE — Module UI spécifique

#### **État global sidebar:**
- **Singularity State:** `context.sidebarCollapsed` (boolean)
  - Fichier: `src/core/state/SingularityState.ts`
  - Actions: `setSidebarCollapsed()`, `toggleSidebar()`
  - Selectors: `useSingularitySidebarCollapsed()`

#### **Styles identifiés:**
- `src/ui/styles/AppLayout.css` — Classes `.app-sidebar`, `.app-sidebar.collapsed`
- `src/layouts/AppLayout.css` — Classes `.layout__sidebar`
- `src/components/layout/AppShell.tsx` — Tailwind inline + Framer Motion

### A2. **Sidebar Navigation**

#### **Composants:**

1. **`src/components/layout/Sidebar.tsx`**
   - Props: `items`, `collapsed`, `onItemClick`
   - Rendu: motion.button pour navigation (WCAG 2.2 compliant)
   - Width responsive: mobile (100%), tablet (240px), desktop (260-300px)
   - **Impact:** 🔴 CRITIQUE

2. **`src/ui/Menu.tsx`** (CONTENT)
   - Contenu affiché dans sidebar
   - 7 sections définies : TITANE, TIME, STATS, ADMIN, DEV, FUSION, OPTIMIZE
   - État local : `menuSections` (localStorage + migration v25.4.2)
   - **Impact:** 🔴 CRITIQUE — Navigation principale

#### **CSS associé:**
- Classes `.app-sidebar`, `.menu-*`, `.cp-sidebar-*` (Control Panel)

### A3. **TopNav / Header**

#### **État actuel:**
- **Header existe dans AppShell** mais **peu utilisé**
- Pas de composant dédié "TopNav" distinct
- Navigation actuelle = **100% sidebar latérale**

#### **Implication:**
- Il faut **créer un nouveau TopNav** en fusionnant les entrées de Menu
- Supprimer complètement la sidebar après migration

### A4. **Page TITANE**

#### **Fichier:** `src/pages/TitanePage.tsx` (2071 lignes)

**Structure actuelle:**
```tsx
<Container>
  <Stack>
    {/* 🔴 HEADER MASSIF (à réduire) */}
    <Header>
      <TitaneLogo />
      <Title />
      <Actions /> {/* trop d'actions visibles */}
    </Header>

    {/* 🟡 ONGLETS (8 sections, à optimiser) */}
    <TabNavigation>
      - Conversation
      - Vision
      - Overview
      - Identity
      - Memory Map
      - Memory Evolution
      - Progression
      - Transformation
    </TabNavigation>

    {/* 🟢 CONTENU PAR ONGLET */}
    <TabPanels>
      {/* Lazy-loaded components */}
    </TabPanels>
  </Stack>
</Container>
```

**Problèmes identifiés:**
1. **Header trop haut** : Logo + titre + actions + sous-titre
2. **8 onglets** (trop pour une ligne, risque d'overflow mobile)
3. **Actions secondaires non regroupées**
4. **Hiérarchie visuelle peu claire**

### A5. **Chat / Messages**

#### **Composants identifiés:**

1. **`src/components/chat/MessageList.tsx`** (PRINCIPAL)
   - Gère rendu messages avec auto-recovery (Omega)
   - ErrorBoundary intégré : `useOmegaErrorBoundary()`
   - Props: `messages`, `isLoading`, `error`
   - **Problème identifié:** 🔴 **Permet `content` vide pour assistant streaming**
   - **Action requise:** Implémenter fallback explicite

2. **`src/components/chat/MessageListOptimized.tsx`** (VARIANT)
   - Version optimisée pour 100+ messages
   - **Même problème:** Pas de fallback UI pour contenu vide

#### **États UI actuels:**
- `isLoading` (boolean)
- `error` (string | null)
- Messages rendus même si `content === ""`

#### **États UI manquants (CRITIQUE):**
- ❌ `idle` state explicite
- ❌ `offline` state (backend down)
- ❌ `empty` state (réponse vide détectée)
- ❌ Fallback UI avec trace_id + CTA Retry

### A6. **Overlays / Widgets**

#### **Widgets flottants identifiés:**
- `ChatBubble` (lazy-loaded)
- `AuraControlPanel` (lazy-loaded)
- `QuantumParticles` (lazy-loaded)
- `CognitiveLayoutControl` (lazy-loaded)

**État:** Pas d'impact direct sur refonte sidebar/TopNav.

---

## B) DÉPENDANCES CROISÉES IDENTIFIÉES

### B1. **App.tsx → AppShell → Sidebar**
- `App.tsx` passe `sidebar={<Sidebar items={...} />}` à `AppShell`
- AppShell gère animation + width selon `sidebarCollapsed`
- **Impact suppression:** 🔴 MAJEUR — Refactor complet App.tsx requis

### B2. **Singularity State**
- État global `sidebarCollapsed` utilisé par :
  - `App.tsx` (lecture via selector)
  - `AppLayout.tsx` (local state parallèle, conflit possible)
  - `Sidebar.tsx` (prop externe)
- **Action:** Retirer l'état sidebar de Singularity State après suppression

### B3. **Styles CSS**
- Classes `.app-sidebar*` dans 3 fichiers CSS distincts
- **Action:** Retirer toutes classes sidebar après migration

### B4. **Menu.tsx**
- Contenu de navigation actuellement rendu dans sidebar
- **Action:** Extraire les 7 entrées et créer TopNav
- **Regroupement requis:** Max 5 entrées visibles, reste dans "Plus"

---

## C) RISQUES IDENTIFIÉS

### C1. **Risques Structurels**

| Risque | Sévérité | Mitigation |
|--------|----------|------------|
| Rupture layout App.tsx si sidebar retirée sans TopNav | 🔴 CRITIQUE | Créer TopNav AVANT suppression sidebar |
| État `sidebarCollapsed` orphelin dans Singularity | 🟠 MOYEN | Retirer du state + migration localStorage |
| CSS sidebar résiduels causent bugs visuels | 🟡 FAIBLE | Audit CSS complet post-suppression |
| Routes Menu cassées si navigation mal migrée | 🔴 CRITIQUE | Tests navigation complets |

### C2. **Risques UX**

| Risque | Sévérité | Mitigation |
|--------|----------|------------|
| Utilisateurs perdus sans sidebar familière | 🟠 MOYEN | TopNav clair + breadcrumb optionnel |
| Fonctionnalités masquées dans "Plus" | 🟡 FAIBLE | Ordre intelligent des 5 entrées principales |
| Chat silencieux après refonte | 🔴 CRITIQUE | Contrat anti-silence absolu |

### C3. **Risques Chat (CRITIQUE)**

| Risque | Sévérité | Mitigation |
|--------|----------|------------|
| Bulles vides rendues sans détection | 🔴 CRITIQUE | Fallback Always Respond obligatoire |
| Pas de trace_id exposé sur erreur | 🟠 MOYEN | Ajouter diagnostic copiable |
| Backend down → crash UI | 🔴 CRITIQUE | Mode dégradé local-first |

---

## D) PLAN DE ROLLBACK

### D1. **Checkpoints Git**
- **Checkpoint A:** Avant début refactor (tag `ui-vΩ-pre-refactor`)
- **Checkpoint B:** Après création TopNav, avant suppression sidebar
- **Checkpoint C:** Après suppression sidebar
- **Checkpoint D:** Après refonte chat anti-silence

### D2. **Rollback Rapide**
```bash
# Si bug critique détecté
git checkout ui-vΩ-pre-refactor
pnpm run dev
```

### D3. **Tests Régression Obligatoires**
- [ ] Navigation complète (toutes routes)
- [ ] Chat fonctionne (send + receive)
- [ ] Layout stable (pas de scrolls cassés)
- [ ] Mobile/tablet responsive OK
- [ ] Aucune console error critique

---

## E) ESTIMATIONS

### E1. **Complexité par phase**

| Phase | Complexité | Temps estimé | Risque |
|-------|-----------|--------------|--------|
| B) Suppression sidebar + nouveau AppShell | 🔴 Élevée | 90min | Élevé |
| C) TopNav simplifié | 🟡 Moyenne | 60min | Moyen |
| D) Refonte page TITANE | 🟠 Moyenne-Haute | 120min | Moyen |
| E) Chat anti-silence | 🔴 Élevée | 90min | Critique |
| F-H) Qualité + accessibilité | 🟡 Moyenne | 60min | Faible |

**Total:** ~7h de développement concentré

### E2. **Fichiers à modifier (estimation)**
- **Création:** ~10 fichiers (TopNav, fallbacks, tests)
- **Modification:** ~15 fichiers (App.tsx, TitanePage.tsx, MessageList.tsx, etc.)
- **Suppression:** ~5 fichiers (sidebar legacy, CSS)
- **Tests:** ~8 fichiers de tests

---

## F) REGISTRY EVENTS GÉNÉRÉS

```typescript
{
  "event": "UI_AUDIT_START",
  "timestamp": "2026-02-01T...",
  "version": "vΩ",
  "scope": "full-ui-rework",
  "components_impacted": [
    "AppShell",
    "Sidebar",
    "Menu",
    "TitanePage",
    "MessageList",
    "App.tsx"
  ],
  "risks_identified": 6,
  "critical_risks": 3,
  "estimated_files_modified": 30,
  "estimated_duration_hours": 7,
  "rollback_plan": "git checkpoints + tags",
  "approval_required": true
}
```

---

## G) VALIDATION HUMAINE REQUISE AVANT PHASE B

**⚠️ CHECKPOINT OBLIGATOIRE**

Avant de procéder à la Phase B (suppression sidebar), Kevin Thibault doit :

1. ✅ **Approuver ce rapport d'audit**
2. ✅ **Confirmer le scope** (si modifications nécessaires)
3. ✅ **Valider l'ordre d'exécution**
4. ✅ **Donner le GO explicite** pour Phase B

**Commande de validation:**
```
GO PHASE B — UI VΩ APPROVED
```

---

## H) PROCHAINES ÉTAPES (APRÈS APPROBATION)

1. Créer branch `feature/ui-vΩ`
2. Tag checkpoint `ui-vΩ-pre-refactor`
3. Exécuter Phase B (suppression sidebar + AppShell)
4. Tests smoke continus après chaque phase
5. Registry events après chaque milestone

---

**Rapport généré par:** GitHub Copilot  
**Date:** 2026-02-01  
**Status:** AUDIT COMPLET — EN ATTENTE APPROBATION HUMAINE
