# 02_SCOPE

## Ring impacté

- **Ring 4 (UI)** : Aucun changement (chaîne de calling existante non modifiée)
- **Ring 3 (Services)** : Création `src/services/ai/responsePolicy.ts` + patch `src/services/ai/chatEngine.ts`
- **Ring 2/1** : Non touché

## Périmètre

### Fichiers créés

- `src/services/ai/responsePolicy.ts` — Politique canonique v1.0.0
- `src/__tests__/responsePolicy.unit.test.ts` — Suite de tests (41 tests)

### Fichiers modifiés

- `src/services/ai/chatEngine.ts` — 6 insertions (import + 3 sites payload + 2 effets profil)

### Fichiers NON touchés

- `src/services/ai/chatModes.config.ts` — Inchangé (source de vérité des modes)
- `src/services/ai/orchestrator.ts` — Inchangé
- `src/core/prompts/` — Inchangé
- Tout le reste — Inchangé

## Chantiers réalisés

| Chantier | Description | Statut |
|---|---|---|
| A — DEFAULT DEPTH | Profil DEEP/ARCHITECT avec maxTokens 4000-6000 câblé | WIRED |
| B — DEFAULT LENGTH | Mode tokens appliqués via fallback chain | WIRED |
| C — IMPLICIT UNDERSTANDING | Inférence bornée 4 états | WIRED |
| D — MEMORY RELEVANCE | Memory policy par profil définie | DEFINED |
| E — PROVIDER ADAPTATION | PROVIDER_UNSUPPORTED_PARAMS + mapReasoningEffort | DEFINED |
| F — TRUTH LABELS | TruthStatus type + valeurs honnêtes par profil | DEFINED |
| G — MODULE CAPABILITY CERT | Tous profils marqués honnêtement | CERTIFIED |
