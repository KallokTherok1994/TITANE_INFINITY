# TITANE — Vie

## 1) Statut (preuves)
- Le module **Vie** est visible dans l’en‑tête TITANE sous forme de pill.
- Aucune capture fournie ne montre l’écran interne du module (contenu non observé).

## 2) Rôle (modèle fonctionnel recommandé)
**Vie** devrait servir de couche “incarnée” : état humain, routines, contraintes, besoins, énergie. C’est la base pour une IA durable (ton, charge, cadence) et pour le Cognitive Layout.

### Objets probables
- `DailyState` : énergie, humeur, stress, focus, fatigue.
- `Routines` : matin/soir, hygiène mentale, revue journalière.
- `Constraints` : temps disponible, deadlines, logistique.
- `BodySignals` (optionnel) : sommeil, cardio, EEG, etc.

### Actions attendues
- Saisies rapides (sliders / toggles) + notes courtes.
- Historique journalier/hebdo.
- “Reset/Start day” et “Close day”.
- Export local (JSON) + snapshot vers registre (INDEX ULTIME vΩ).

## 3) UI attendue (structure)
- **Header module** : date, statut du jour, mode actif.
- **Cards** : Énergie, Focus, Stress, Sommeil, Priorités.
- **Timeline** : événements marquants.
- **Actions** : `Enregistrer`, `Annuler`, `Reset`, `Exporter`.

## 4) Intégrations (recommandées)
- **Chat** : prise en compte du `DailyState` pour le style et la densité.
- **TIME** : création de blocs focus/rituels.
- **STATS** : corrélation “qualité de session” vs état.

## 5) Risques / blocages potentiels
- Données sensibles : stocker **local‑first** + chiffrement si possible.
- Sur‑complexité : privilégier 6–8 champs max + notes.
- Absence de “preuve” : ajouter un marker `VIE_LOADED` + compteur `events_today`.

## 6) Checklist de complétion
- [ ] Écran minimal fonctionnel (saisie + persist local)
- [ ] Historique + filtre (7/30/90 jours)
- [ ] Export JSON + snapshot registry
- [ ] Tests UI (rendu + persistance)
- [ ] Zéro silence : erreurs visibles + toasts
