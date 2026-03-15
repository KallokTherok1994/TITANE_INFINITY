# REGISTRE DES CORRECTIONS APPLIQUÉES

## Résultat : AUCUNE correction appliquée

Cet audit est en lecture seule. Aucun patch n'a été appliqué.

---

## Justifications par défaut

### D01 (send_message stub)
- Cause racine : certaine (FIXME explicite dans code)
- Blast radius : LARGE — implique architecture provider dispatch complète
- Plusieurs options : supprimer / rediriger vers conversation_generate / implémenter
- Décision : **PAS DE PATCH** — blast radius trop large pour patch minimal

### D02 (ChatPage vide)
- Cause racine : certaine (commentaire source)
- Blast radius : MOYEN — nécessite composant ChatWindow complet + gestion store messages
- Décision : **PAS DE PATCH** — composant entier manquant, pas un correctif ponctuel

### D03/D04 (body/energie statiques)
- Cause racine : certaine (valeurs hardcodées, estimationCount=0 prouvé)
- Remède ambigü : plusieurs solutions possibles
  Option A : masquer l'UI si estimationCount === 0 (minimal)
  Option B : ajouter disclaimer "en développement"
  Option C : intégrer MediaPipe WASM (architectural)
  Option D : intégrer ONNX avec feature flag
- Blast radius variable : A=minimal, C/D=architectural
- Règle applicable : "energy/body meaning is semantically ambiguous" → autofix interdit
- Décision : **PAS DE PATCH AUTOMATIQUE** — choix de remédiation est une décision produit

### D05 (multimodal commenté)
- Module volontairement désactivé avec commentaire "TEMPORARILY COMMENTED"
- C'est un choix délibéré, pas un bug
- Décision : **PAS DE PATCH** — changement volontaire

### D06 (caméra bypass Tauri)
- Déviation architecturale documentée, acceptable dans Tauri v2
- Décision : **PAS DE PATCH** — comportement voulu

---

## Règles de gouvernance appliquées

- "Only patch after defect proof" → ✅ respecté
- "Autofix forbidden if: energy/body meaning is semantically ambiguous" → D03/D04 non patchés
- "Autofix forbidden if: large refactor would be required" → D01/D02 non patchés
- "Autofix forbidden if: hardware proof absent" → D03/D04/D06 non patchés
- "Blast radius small" → seul D04 aurait pu recevoir un patch minimal (conditionner affichage)
  mais la décision produit sur la signification des jauges reste ambiguë

## Actions recommandées (non appliquées — pour décision Kevin Thibault)

1. **[30 min] Conditionner les jauges corps/énergie** :
   Fichier : src/pages/CameraPage.tsx
   Patch : entourer la section jauges d'une condition
   `{affectEstimation.estimationCount > 0 ? <JaugesSection /> : <DisclaimerDeveloppement />}`

2. **[1h] Supprimer send_message du invoke_handler** ou ajouter `Err(TitaneError::NotImplemented)`

3. **[2-4h] Monter ChatWindow dans ChatPage.tsx**
