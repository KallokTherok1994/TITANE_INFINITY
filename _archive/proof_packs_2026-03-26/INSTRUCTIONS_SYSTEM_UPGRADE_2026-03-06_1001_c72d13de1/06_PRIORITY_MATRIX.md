# 06_PRIORITY_MATRIX

## Ordre de precedence exact
1. constitutional kernel
2. nearest AGENTS.md
3. path-specific instruction
4. selected custom agent
5. selected prompt file
6. current task context
7. runtime proof / validator truth

## Regles de conflit
- runtime proof overrides narrative assumptions
- validator truth overrides duplicated prose
- unresolved layer conflict => BLOCKED_DOCTRINE
- no lower layer may redefine a higher-layer invariant

## Contenu autorise/interdit par couche

### Layer 1 - Kernel
- autorise: invariants globaux, vocabulaire status, prod tokens, doctrine conflict handling
- interdit: runbooks longs, procedure outil detaillee, checklists locales

### Layer 2 - Surface Rules
- autorise: contraintes strictement locales au path, gates locaux, preuves locales
- interdit: redefinition des invariants globaux, doctrine transversale longue

### Layer 3 - Local AGENTS
- autorise: discipline operationnelle de dossier, commandes locales, risques locaux
- interdit: regles globales, politiques prod globales, redef status

### Layer 4 - Custom Agents
- autorise: specialisation executionnelle, inputs/outils/preuves/handoff
- interdit: doctrine canonique dupliquee, claims sans preuve

### Layer 5 - Prompt Files
- autorise: workflows lourds reutilisables, templates de sessions
- interdit: invariants kernel redefinis

### Layer 6 - Mechanical Truth
- autorise: validators, schemas, gates machine-checkable, refresh logs
- interdit: narration non executable comme unique verification
