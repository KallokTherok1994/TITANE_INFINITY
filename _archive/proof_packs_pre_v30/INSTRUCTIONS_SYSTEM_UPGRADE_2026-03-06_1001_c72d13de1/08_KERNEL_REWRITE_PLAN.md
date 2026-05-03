# 08_KERNEL_REWRITE_PLAN

## Cible kernel court (10-12 regles)
1. constitutional priority
2. unique status vocabulary
3. 4-Ring
4. One Door Network
5. Tauri-only
6. IPC canonical + anti-silence + no lying fallback
7. minimal patch rule
8. proof before verdict
9. exact prod tokens
10. doctrine conflict => BLOCKED_DOCTRINE
11. one active execution authority / one E2E authority
12. rollback required

## Mapping ancien contenu -> destination
- section 0 (format sortie operatoire) -> keep kernel (condense)
- sections 1-2 (preambule + statuses) -> keep kernel (compact)
- sections 3-5 (invariants + one door) -> keep kernel
- sections 6-8 (flux + preuves + gates) -> split: principes kernel + details prompts + validators
- section AutoFix/AutoHeal -> kernel reference + validator canonical
- sections 9-10 (prod/version sync) -> keep kernel minimal + validators release
- section 11 (governance IDE) -> keep kernel concise
- sections 12-14 (anti-silence, invoke, tests x3) -> split: kernel principes + L2 details
- sections 15-17 (rollback, metadata, progression) -> kernel minimal + prompt templates
- sections 18-20 (mapping/mermaid/anti-drift) -> move vers docs map + `map_refresh.sh`
- sections 21-22 (seal + stop-the-line) -> keep kernel concise

## Sections candidates suppression (depuis kernel)
- details d execution commandes longues
- listes verbeuses de gates deja dans fichiers dedies
- redondances bilingues non canoniques

## Sections candidates validator
- status vocabulary checks
- couche priority checks
- anti-duplication doctrine checks
- kernel budget checks (max rules/lines)

## Sections candidates prompt-file
- audit complet instructions
- resolution contradictions
- build proof pack
- release readiness

## Estimation reduction charge cognitive
- taille kernel actuelle: elevee (22 sections)
- taille kernel cible: 10-12 regles
- reduction estimee contexte always-on: 55% a 70%
- reduction risque contradiction: MEDIUM->LOW apres mecanisation
