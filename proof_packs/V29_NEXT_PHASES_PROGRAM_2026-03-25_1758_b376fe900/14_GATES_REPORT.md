# Rapport des gates

## Gates globaux

- `G_BOOT_TRUTH = PASS`  
  Preuve: bootstrap complet relance et consigne.

- `G_VERSION_SURFACES_ALIGNED = PASS`  
  Preuve: surfaces actives `28.88.0`.

- `G_PHASE_MATRIX_COMPLETE = PASS`  
  Preuve: `03_PHASE_MATRIX.md`.

## Phase A

- `G_I18N_FOUNDATION_MAPPED = PASS`  
  Preuve: loader + locales + Settings + switcher identifies.

- `G_I18N_CRITICAL_SURFACES_LOCALIZED = FAIL`  
  Preuve: seule la surface Settings est prouvee; le reste du produit reste majoritairement hardcode.

- `G_I18N_FALLBACK_TRUTH = PASS`  
  Preuve: test Settings fallback.

- `G_I18N_TESTS_RELEVANT_PASS = PASS`  
  Preuve: vitest PASS.

## Phase B

- `G_DOCS_SURFACES_MAPPED = PASS`  
  Preuve: corpus docs + aide clavier + absence de route `/docs`.

- `G_INTERACTIVE_DOCS_TRUTH = FAIL`  
  Preuve: aucune surface interactive runtime-aware.

- `G_DOCS_RUNTIME_ALIGNMENT = FAIL`  
  Preuve: documentation abondante, runtime interactif absent.

- `G_INTERACTIVE_DOCS_TESTS_PASS = BLOCKED`  
  Preuve: pas de surface de docs interactives a tester.

## Phase C

- `G_SYNC_SURFACES_MAPPED = PASS`  
  Preuve: CloudCenter + commandes cloud + moteur sync.

- `G_SYNC_AUTHORITY_SINGLE = PASS`  
  Preuve: la verite de mode auto passe maintenant par un blocage unique UI/backend.

- `G_AUTO_SYNC_TRUTH = PASS`  
  Preuve: option auto desactivee + backend refuse `auto`.

- `G_NO_FAKE_SYNC = PASS`  
  Preuve: libelles et sauvegarde honnetes.

- `G_AUTO_SYNC_TESTS_PASS = PASS`  
  Preuve: `CloudSyncTruth.test.tsx`.

## Phase D

- `G_ADVANCED_FEATURES_INVENTORY_COMPLETE = PASS`  
  Preuve: `07_ADVANCED_FEATURES_INVENTORY.md`.

- `G_ADVANCED_FEATURES_SCOPE_BUCKETS_VALID = PASS`  
  Preuve: `08_SCOPE_BUCKETS.md`.

- `G_ADVANCED_FEATURES_LOW_DRIFT = PASS`  
  Preuve: un seul lock faible derive traite sur `/knowledge`.

- `G_ADVANCED_FEATURES_TESTS_PASS = PASS`  
  Preuve: `KnowledgeFusionTruth.test.tsx`.

## Programme

- `G_NO_BROAD_REFACTOR = PASS`
- `G_ANTI_LIE_REINFORCED = PASS`
- `G_PROOF_PACK_COMPLETE = PASS`
- `G_ROLLBACK_READY = PASS`
- `G_V29_PREP_JUSTIFIED = FAIL`
- `G_V29_SEAL_READY = FAIL`
