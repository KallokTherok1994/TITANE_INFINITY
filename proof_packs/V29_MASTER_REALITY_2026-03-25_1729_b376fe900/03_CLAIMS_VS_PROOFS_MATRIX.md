# 03_CLAIMS_VS_PROOFS_MATRIX

## Matrice

| Domaine | Old prompts / memoire | Docs | Repo / scripts / tests | Runtime / build / preuves | Classification |
|---|---|---|---|---|---|
| Release sealing | plusieurs surfaces parlent de release "sealed" | release files + docs/_evidence presentes | scripts de verification presents, release notes presentes | build/release historiques prouves, mais seal complet non reconfirme ici | PARTIAL |
| Desktop runtime truth | revendique large maturite runtime | packs de preuve desktop presents | E2E desktop et wrappers presents | chat/memory ont des preuves runtime reelles; d'autres lanes restent bloquees | PARTIAL |
| E2E desktop truth | souvent revendique comme pret | packs E2E nombreux | tests desktop existent | certaines lanes reelles passent, TOTAL_DEV reste bloque en environnement headless | PARTIAL |
| Memory truth | memoire deployee et "reelle" souvent revendiquee | plusieurs packs le disent | code/tests memoire nombreux | `CHAT_IA_RUNTIME_REPAIR` prouve la lane memoire desktop reelle | PROVEN_RUNTIME |
| Provider truth | multi-provider souvent revendique | docs nombreuses | chaines provider et verifs presentes | provider chat re-certifie en runtime, mais pas toutes lanes/fournisseurs | PARTIAL |
| Artifact / document system | fort discours de certification | `docs/_evidence` massif | surface documentaire tres riche | au moins un pack recent (`MOCK_AUDIT_FINAL_2026-03-25_1140`) est incomplet mais sur-claim | PARTIAL |
| Image / avatar asset pipeline | revendiquee dans l'audit mocks | doc du 25 mars l'annonce | commandes backend creees selon le resume, placeholders encore cites | pas de preuve runtime executee ici | PARTIAL |
| TWINS / TITANE fusion | revendiquee comme injectee | pack TWINS present | tests TWINS existent | le propre verdict TWINS dit "effect unproven" et desktop bloque | PARTIAL |
| TOTAL_DEV / DEV authority | revendique "pass upgrade" | pack TOTAL_DEV present | chaines statiques et commandes existent | verdict officiel de la lane: `BLOCKED_HEADLESS_E2E_ENVIRONMENT` | BLOCKED |
| Supply-chain / signing / SBOM / updater | parfois implicite dans surfaces release | docs release existent | workflows/checksums presents | propre preuve release dit SBOM absent, signing CI-only, provenance absente | BLOCKED |
| Roadmap phases 6->13 | souvent presentees comme executees dans la narration | nombreuses docs historiques | commentaires et artefacts disperses | pas de preuve canonique compacte et recente pour la tranche entiere | DOC_ONLY |
| Roadmap phases 14->20 | presentes dans memoire et vieux prompts | docs/archive abondants | repo contient des restes heterogenes | execution tranche complete non prouvee | CLAIMED_ONLY |
| Roadmap phases 21->27 | plusieurs parties semblent implementees | docs nombreuses | code et commandes reelles existent sur certains sujets | certaines sous-lanes sont prouvees, pas la tranche complete | PARTIAL |
| Auto-heal A->H | fort langage de completion | docs et rapports nombreux | moteur / hooks / tests presents | pas de recertification runtime complete de la tranche ici | PARTIAL |
| I->Q / control / labs / redteam | langage de programme large | docs et comments disperses | faible ancrage canonique comme lane executable unique | pas de preuve runtime/build tranchee | CLAIMED_ONLY |

## Observation cle

La documentation et les roadmaps racontent beaucoup plus que ce que la preuve runtime canonique garantit aujourd'hui. Le repo contient du reel, mais aussi un stock important de narratif historique, d'archives et de surfaces non recertifiees.

