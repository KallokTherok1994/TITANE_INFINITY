# UI NAVIGATION CONSTITUTION v1.0.0
**TITANE∞ — Loi Fondamentale d'Architecture UI/Navigation**

**Status:** LOCKED — Non modifiable sans PR + justification + tests + rollback  
**Scope:** Global UI Architecture  
**Authority:** UI Architecture Team + Kevin Thibault  
**Enforcement:** Automated gates + manual PR review  

---

## 📜 ARTICLE 1 — SINGLE GLOBAL TOPNAV

### 1.1 Règle Absolue
**Il ne peut exister qu'UNE SEULE TopNav globale à l'écran.**

### 1.2 Implémentation
- La TopNav globale est rendue par `AppShell`
- Elle contient les liens de navigation inter-pages (TITANE, TIME, STATS, ADMIN, DEV)
- Elle est sticky/fixed en haut de l'écran

### 1.3 Interdictions
❌ INTERDIT d'ajouter une seconde navbar globale  
❌ INTERDIT de créer un header sticky concurrent  
❌ INTERDIT de dupliquer les styles TopNav ailleurs  
❌ INTERDIT de créer une "sous-navbar" visuellement équivalente  

### 1.4 Violations & Sanctions
- Toute PR introduisant une double navbar est **automatiquement rejetée**
- Le gate `GATE_UI_NAV_SINGLE` bloque le merge
- Exception possible uniquement avec justification écrite + rollback plan

---

## 📜 ARTICLE 2 — LOCAL TABS ARE NOT NAVBARS

### 2.1 Règle de Classification
Les tabs/onglets internes à une page sont de **navigation locale**, **jamais globale**.

### 2.2 Apparence Obligatoire
Les tabs locaux DOIVENT être visuellement **secondaires** :

✅ **AUTORISÉ (Tabs locaux):**
- Background transparent ou subtil
- Padding réduit (0.5rem max)
- Font-size ≤ 0.875rem (14px)
- Border minimal ou absent
- Pas de backdrop-filter
- Pas de shadow épaisse
- Pas de gradient
- Position relative (NON sticky sauf exception documentée)

❌ **INTERDIT (Ressemble à TopNav):**
- Background plein/opaque comme TopNav
- Height > 64px
- Font-size > 1rem
- Border épaisse (> 2px)
- Backdrop-filter blur
- Shadow lourde (> 4px)
- Gradient multicolore
- Position sticky qui crée un empilement

### 2.3 Placement
Les tabs locaux doivent être intégrés **dans** la section/card du module, pas au-dessus.

---

## 📜 ARTICLE 3 — STICKY EXCLUSIVITY

### 3.1 Règle de Hiérarchie Sticky
**Si TopNav est sticky, aucun autre header ne peut être sticky au même niveau.**

### 3.2 Exceptions Documentées
Une exception est possible SI ET SEULEMENT SI :
1. Justification technique écrite (pourquoi absolument nécessaire)
2. Test de non-régression ajouté
3. Entry dans `ui-events.jsonl` avec `risk_level: high`
4. Rollback plan documenté
5. z-index coordonné (TopNav > secondary sticky)

### 3.3 Coordination z-index
- TopNav : `z-index: 1000`
- Tabs locaux : `z-index: auto` (relatif, pas de stacking context)
- Exception sticky secondary : `z-index: 900` (si approuvée)

---

## 📜 ARTICLE 4 — NO DUPLICATE NAVIGATION ZONES

### 4.1 Principe de Singularité
**Chaque région de navigation a un rôle unique et non redondant.**

### 4.2 Classification des Régions

| Région | Role | Placement | Sticky | Quantité Max |
|--------|------|-----------|--------|--------------|
| **TopNav** | Navigation globale inter-pages | Top AppShell | Oui | 1 |
| **Local Tabs** | Navigation intra-page (sections) | Dans content | Non (défaut) | 1 par page |
| **Toolstrip** | Actions/outils contextuels | Dans card/section | Non | N |
| **Overlay** | Modale/drawer temporaire | Z-index élevé | Variable | N |

### 4.3 Interdictions
❌ Deux zones classées `topnav`  
❌ Tabs locaux styled comme `topnav`  
❌ Toolstrip avec navigation inter-pages  
❌ Overlay permanent (devient topnav/tabs)  

---

## 📜 ARTICLE 5 — ENFORCEMENT & GATES

### 5.1 Gates Automatiques Obligatoires

#### GATE_UI_NAV_SINGLE
- **Trigger:** Modification de composants UI layout
- **Check:** Compte le nombre de `<TopNav>` rendus
- **Action:** Bloque si count > 1

#### GATE_UI_NAV_STYLE_COMPLIANCE
- **Trigger:** Modification CSS/styles navigation
- **Check:** Vérifie que tabs locaux n'ont pas de styles TopNav
- **Action:** Warning si détection de propriétés interdites

#### GATE_UI_INDEX
- **Trigger:** Modification de fichiers UI
- **Check:** Vérifie présence d'entry dans `ui-events.jsonl`
- **Action:** Bloque si aucune entry ou entry incomplète

### 5.2 Tests Anti-Régression Obligatoires
Voir `ARTICLE 6`

### 5.3 Rollback Obligatoire
Toute modification UI DOIT inclure un rollback plan dans l'entry registre.

---

## 📜 ARTICLE 6 — TESTS ANTI-RÉGRESSION

### 6.1 Tests Obligatoires par PR UI

#### Test 1: Single TopNav
```typescript
describe('UI Navigation — Single TopNav', () => {
  it('renders exactly one TopNav component', () => {
    render(<App />);
    const topNavs = screen.getAllByRole('navigation', { name: /principale/i });
    expect(topNavs).toHaveLength(1);
  });
});
```

#### Test 2: No Navbar-Styled Tabs
```typescript
describe('UI Navigation — Tabs Not NavbarLike', () => {
  it('local tabs do not have TopNav styles', () => {
    render(<TitanePage />);
    const tabs = screen.getByRole('tablist');
    const styles = window.getComputedStyle(tabs);
    expect(styles.backdropFilter).toBe('none');
    expect(parseInt(styles.boxShadow)).toBeLessThan(5);
  });
});
```

#### Test 3: Scroll No Double Header
```typescript
describe('UI Navigation — Scroll Behavior', () => {
  it('scrolling does not reveal double sticky headers', async () => {
    render(<TitanePage />);
    window.scrollTo(0, 500);
    const stickyElements = document.querySelectorAll('[style*="sticky"]');
    expect(stickyElements.length).toBeLessThanOrEqual(1);
  });
});
```

### 6.2 Critères d'Acceptation
- ✅ Tous les tests passent
- ✅ Aucune régression visuelle (screenshot diff < 5%)
- ✅ Performance non dégradée (FCP < +10ms)

---

## 📜 ARTICLE 7 — AMENDMENT PROCESS

### 7.1 Modification de cette Constitution
Cette constitution peut être amendée SI ET SEULEMENT SI :

1. **Justification Écrite** 
   - Document expliquant pourquoi l'amendement est nécessaire
   - Impact analysis (qui est affecté, risques)

2. **Consensus Team**
   - Approbation de Kevin Thibault (mandatory)
   - Review par UI Architecture Team

3. **Tests Renforcés**
   - Nouveaux tests couvrant l'amendement
   - Validation sur toutes les pages existantes

4. **Registre UI**
   - Entry `change_type: constitution-amendment`
   - `risk_level: high`
   - Rollback plan détaillé

5. **Version Bump**
   - Constitution versionnée (v1.0.0 → v2.0.0)

### 7.2 Propositions d'Amendement
Les amendements proposés doivent être soumis via PR avec tag `ui-constitution-amendment`.

---

## 📜 ARTICLE 8 — VIOLATIONS & REMEDIATION

### 8.1 Niveaux de Violation

| Niveau | Description | Action |
|--------|-------------|--------|
| **CRITICAL** | Double TopNav en production | Rollback immédiat + post-mortem |
| **HIGH** | Tabs navbar-styled | Fix dans 48h + entry registre |
| **MEDIUM** | Sticky non coordonné | Fix dans 1 semaine |
| **LOW** | Style mineurs non conformes | Fix opportuniste |

### 8.2 Détection
- Gates automatiques (CI/CD)
- Tests anti-régression (pre-merge)
- Review manuelle PR
- Monitoring production (optional)

### 8.3 Remediation Steps
1. Identifier la violation (gate/test/review)
2. Créer issue avec tag `ui-violation`
3. Fix + tests
4. Entry registre avec `change_type: remediation`
5. Validation + merge

---

## 📜 APPENDICE A — GLOSSARY

### TopNav
La barre de navigation globale horizontale en haut de l'écran, contenant les liens inter-pages.

### Local Tabs
Onglets de navigation intra-page, limités au scope d'un module/feature.

### Navbar-like
Styles visuellement équivalents à la TopNav (background plein, shadow, blur, sticky).

### Sticky
Position CSS `position: sticky` qui fixe un élément lors du scroll.

### Navigation Zone
Région de l'UI dédiée à la navigation (globale ou locale).

---

## 📜 APPENDICE B — DECISION LOG

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-02-02 | Constitution v1.0.0 created | Fix double navbar + prevent regression | ACTIVE |

---

## 📜 METADATA

- **Version:** 1.0.0
- **Created:** 2026-02-02
- **Status:** LOCKED
- **Authority:** UI Architecture Team + Kevin Thibault
- **Next Review:** 2026-05-02 (3 months)

---

**END OF CONSTITUTION — DO NOT MODIFY WITHOUT AMENDMENT PROCESS**
