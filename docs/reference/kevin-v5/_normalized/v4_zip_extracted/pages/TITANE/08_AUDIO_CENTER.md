# TITANE — Centre Audio

## But
Configurer la synthèse vocale / voix, et diagnostiquer le pipeline audio.

## UI observée
- Onglets supérieurs (centres) : System / Configuration / Audio & Voix / Design / Governance
- Sous-onglets : Principal / Paramètres / Diagnostic / Avancé

### Sélection de voix
- Listes déroulantes ou listes par catégorie :
  - “Vos Femmes”
  - Voix spécifiques (ex. LPMC (Femme))
- Boutons :
  - “Tester la voix”
  - “Appliquer” (attendu) / “Test”

### Paramètres
- Sliders : vitesse / pitch / volume (hypothèse)
- Toggle : “Emotions activées”

## Erreurs potentielles
- Voix non disponible → doit fallback.
- Pas de device audio → afficher message + test.

## Recommandations
- Bouton “Diagnostiquer” : latence, device, permissions, sample rate.
- Log de playback local-first (fichier).

