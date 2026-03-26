# Inventaire phase D - Advanced Features

## Candidats ancres dans le repo

| Feature | Ancre repo | Presence code | Presence runtime | Risque | Appartenance V29 |
| --- | --- | --- | --- | --- | --- |
| Knowledge Fusion | `/knowledge`, `src/ui/pages/KnowledgeFusionPage.tsx` | Oui | Oui, route active | Faible a moyen | B |
| Research Page | `/research`, `src/pages/ResearchPage.tsx` | Oui | Oui, route active | Moyen | B |
| Cloud Center | `/cloud`, `src/pages/CloudCenter/` | Oui | Oui | Moyen | A deja traite en phase C |
| Orchestration Center | `/orchestration-center`, `/orchestration-intelligence` | Oui | Oui | Eleve | C |
| Singularity route | `/singularity` + hooks et panels | Oui | Oui | Eleve | C |
| Twins / Symbiose | `TwinEvolutionPanel`, route TITANE | Oui | Oui | Moyen a eleve | C |

## Lock phase D execute

`D-L1-KNOWLEDGE-MANUAL-PICKER-TRUTH`

- Cause: `/knowledge` affichait une action de selection de document alors que le flux reel utilisait `prompt()`.
- Fix: relabel manuel + note `PARTIAL`.

## Statut phase D

- Verdict phase D: `PARTIAL`
- Sous-verdict: `ADVANCED_FEATURES_PARTIAL`
