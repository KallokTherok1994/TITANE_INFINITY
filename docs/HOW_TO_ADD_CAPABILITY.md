# HOW TO: Add a New Capability

**PHASE 6 Évolution Consciente — Guide pratique développeur**

Version: 1.0.0  
Date: 2026-01-15  
Status: GUIDE (PHASE 6)

---

## Objectif

Guide **rapide et actionnable** pour ajouter une nouvelle capability au système TITANE∞ en suivant le lifecycle PHASE 6.

**Flow complet** : EXPERIMENTAL → QUALIFIED → STABLE (avec gates automatisés).

---

## Prérequis

- ✅ PHASE 0-5 opérationnels (gates PASS)  
- ✅ Workspace de développement configuré
- ✅ Compréhension du protocol : `docs/CAPABILITY_QUALIFICATION_PROTOCOL.md`
- ✅ Template disponible : `docs/capabilities/_TEMPLATE.md`

---

## Step 1: EXPERIMENTAL (Dev-only)

### 1.1 Planification

**Avant de coder**, répondre à ces questions :

1. **Quel besoin métier** cette capability résout-elle ? (1 phrase)
2. **Quelle surface minimale** expose-t-elle ? (commands, permissions, endpoints)
3. **Quels risques** introduit-elle ? (sécurité, privacy, UX, supply-chain)
4. **Mode dégradé** : que se passe-t-il si elle échoue ? (local-first obligatoire)

### 1.2 Implémentation

```bash
# 1. Créer la command Tauri
# Dans src-tauri/src/commands/
touch src-tauri/src/commands/ma_capability.rs

# 2. Créer la documentation
cp docs/capabilities/_TEMPLATE.md docs/capabilities/ma-capability.md

# 3. Tests unitaires de base
touch tests/unit/ma-capability.test.ts
```

### 1.3 Configuration EXPERIMENTAL

```rust
// src-tauri/src/commands/ma_capability.rs
#[tauri::command]
pub async fn ma_capability_action(param: String) -> Result<String, String> {
    // EXPERIMENTAL: API peut changer
    // Ne pas ajouter à allowlist.whitelist.stable.json
    Ok(format!("Résultat: {}", param))
}
```

```markdown
<!-- docs/capabilities/ma-capability.md -->
## 2. Statut

**Statut actuel**: EXPERIMENTAL  
**Ajouté**: v26.3.0  
**Dernière révision**: 2026-01-15

**Statut EXPERIMENTAL** : Dev workspace uniquement, API instable autorisée.
```

**✅ EXPERIMENTAL prêt** : capability fonctionnelle en dev, tests unitaires OK.

---

## Step 2: Promotion QUALIFIED

### 2.1 Figer l'API

```rust
// src-tauri/src/commands/ma_capability.rs
// API FIGÉE - plus de changements breaking autorisés

#[derive(serde::Serialize, serde::Deserialize)]
pub struct MaCapabilityInput {
    pub param: String,
    pub options: Option<MaCapabilityOptions>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct MaCapabilityOutput {
    pub result: String,
    pub metadata: MaCapabilityMeta,
}

#[tauri::command]
pub async fn ma_capability_action(input: MaCapabilityInput) -> Result<MaCapabilityOutput, String> {
    // API stable, pas de changements breaking
    Ok(MaCapabilityOutput {
        result: format!("Résultat: {}", input.param),
        metadata: MaCapabilityMeta::default(),
    })
}
```

### 2.2 Tests contractuels (90%+ coverage)

```typescript
// tests/contract/tauri.contract.test.ts
describe('MaCapability Contract Tests', () => {
  test('ma_capability_action - success case', async () => {
    const input = { param: "test" };
    const result = await invoke('ma_capability_action', { input });
    
    expect(result).toHaveProperty('result');
    expect(result).toHaveProperty('metadata');
    expect(result.result).toBe('Résultat: test');
  });

  test('ma_capability_action - error case', async () => {
    const input = { param: "" }; // Invalid input
    await expect(invoke('ma_capability_action', { input }))
      .rejects.toThrow();
  });

  test('ma_capability_action - edge cases', async () => {
    // Test 10+ edge cases for 90% coverage
    // ...
  });
});
```

### 2.3 Documentation complète

Remplir **toutes les sections** du template `docs/capabilities/ma-capability.md` :

```markdown
## 2. Statut

**Statut actuel**: QUALIFIED  
**Qualifié**: v26.3.0  
**Dernière révision**: 2026-01-15

API figée, tests 90%+, prêt pour production.

## 10. Promotion Checklist

- [x] Justification technique et besoin métier documentés
- [x] Surface d'exposition minimale justifiée  
- [x] Validation inputs/outputs avec contrats
- [x] Tests automatisés 90%+ coverage
- [x] Gates CI configurés et PASS
- [x] Observabilité et logs configurés
- [x] Procédure rollback testée
- [x] Mode dégradé local-first opérationnel
- [x] Documentation utilisateur complète
- [x] Review technique approuvée
- [x] Validation sécurité et privacy impact
```

### 2.4 Review technique

```bash
# Créer PR pour review
git checkout -b feature/capability-ma-capability
git add docs/capabilities/ma-capability.md src-tauri/src/commands/ma_capability.rs tests/contract/tauri.contract.test.ts
git commit -m "feat(capability): add ma-capability (QUALIFIED)

- API figée avec inputs/outputs typés
- Tests contractuels 90%+ coverage
- Documentation complète (11 sections)
- Mode dégradé local-first
- Prêt pour promotion STABLE"

git push origin feature/capability-ma-capability
```

**✅ QUALIFIED prêt** : API figée, tests complets, review approuvée.

---

## Step 3: Promotion STABLE (Gate automatisé)

### 3.1 Validation gate automatique

```bash
# Exécuter le gate de promotion
./scripts/ci/check-promotion-stable.sh docs/capabilities/ma-capability.md
```

**Output attendu** :
```
[GATE-PROMOTION] Starting QUALIFIED → STABLE promotion validation for: ma-capability
==================================
[OK] Capability file exists and status is QUALIFIED
[OK] ✓ justification technique et besoin métier documentés
[OK] ✓ surface d'exposition minimale justifiée
[OK] ✓ validation inputs/outputs avec contrats
[OK] ✓ tests automatisés 90%+ coverage
[OK] ✓ gates CI configurés et PASS
[OK] ✓ observabilité et logs configurés
[OK] ✓ procédure rollback testée
[OK] ✓ mode dégradé local-first opérationnel
[OK] ✓ documentation utilisateur complète
[OK] ✓ review technique approuvée
[OK] ✓ validation sécurité et privacy impact
[OK] All 11 checklist items completed
[OK] Test files found: 1 files
[OK] Capability covered by capability-qualification workflow
[OK] All required documentation sections present
[OK] Capability found in registry
[OK] No secrets detected in capability documentation
==================================
✅ PROMOTION APPROVED: ma-capability can be promoted to STABLE
```

### 3.2 Si gate PASS : Promotion automatique

```bash
# 1. Mettre à jour le statut
sed -i 's/Statut actuel**: QUALIFIED/Statut actuel**: STABLE/' docs/capabilities/ma-capability.md
echo "**Stable**: v26.3.0" >> docs/capabilities/ma-capability.md

# 2. Ajouter à allowlist stable
# Éditer src-tauri/allowlist.whitelist.stable.json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      }
    }
  },
  "plugins": {
    "ma-capability": {
      "ma_capability_action": true
    }
  }
}

# 3. Mettre à jour registry
# Éditer docs/CAPABILITIES_REGISTRY.md - section Couche STABLE
| `ma_capability_action` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/capabilities/ma-capability.md | v26.3.0 | v26.3.0 | Ma nouvelle capability |

# 4. Commit de promotion
git add -A
git commit -m "feat(capability): promote ma-capability → STABLE

- Promotion QUALIFIED → STABLE (gate PASS)
- Ajout allowlist.whitelist.stable.json
- Mise à jour CAPABILITIES_REGISTRY.md
- Status documentation: STABLE v26.3.0"
```

**✅ STABLE atteint** : Capability en production, rétrocompatibilité requise.

---

## Step 4: CI Validation

Le workflow `.github/workflows/capability-qualification.yml` valide automatiquement :

1. **capability-drift-check** : Registry aligné
2. **capability-promotion-check** : Checklist complète
3. **capability-tests** : Tests contractuels PASS
4. **stable-build-validation** : Build stable OK avec nouvelle capability
5. **constitution-audit** : Pas de secrets, conformité

**Si une étape échoue** : Promotion bloquée jusqu'à résolution.

---

## Troubleshooting

### ❌ Gate échoue : "Missing checklist item"

**Solution** : Compléter la checklist dans `docs/capabilities/ma-capability.md`

```markdown
## 10. Promotion Checklist

- [ ] item manquant ← FIXER
```

### ❌ Tests < 90% coverage

**Solution** : Ajouter tests edge cases

```typescript
test('ma_capability_action - all edge cases', () => {
  // Tester toutes les branches du code
  // Inputs invalides, erreurs réseau, timeouts, etc.
});
```

### ❌ "No CI gates found"

**Solution** : Ajouter tests contractuels référençant la capability

```typescript
// tests/contract/tauri.contract.test.ts
describe('ma-capability', () => {
  test('contract validation', () => {
    // Tests ici
  });
});
```

### ❌ "Capability not found in registry"

**Solution** : Ajouter entrée dans `docs/CAPABILITIES_REGISTRY.md`

---

## Checklist finale

Avant commit STABLE :

- [ ] Gate promotion PASS (`./scripts/ci/check-promotion-stable.sh`)
- [ ] Tests contractuels 90%+ coverage
- [ ] Documentation 11 sections complètes
- [ ] Allowlist stable mis à jour
- [ ] Registry mis à jour
- [ ] Pas de secrets dans docs
- [ ] Mode dégradé testé
- [ ] Review technique approuvée

**GO/NO-GO** : Tous les items cochés = Promotion STABLE autorisée.

---

## Exemple complet

Voir capability de référence : `docs/capabilities/_TEMPLATE.md`

**Temps estimé** :
- EXPERIMENTAL : 1-2 jours
- QUALIFIED : 2-3 jours (tests + docs)
- STABLE : 1 jour (gate + integration)

**Total** : 4-6 jours pour une capability complète EXPERIMENTAL → STABLE.

---

*Ce guide est vivant et s'améliore avec retour d'expérience équipe.*