# Audit phase A - I18N

## Etat trouve

- `src/i18n/i18nLazyLoader.ts` charge `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
- `fallbackLng` est `fr`.
- Detection: `localStorage`, puis `navigator`.
- Les fichiers `src/i18n/locales/en.json` et `src/i18n/locales/fr.json` ont parite des cles sur la surface verifiee.
- L'adoption reelle est faible: Settings est la seule surface active clairement branchee.

## Lock reel

`A-L1-I18N-SETTINGS-TRUTH`

- Surface: `src/components/LanguageSwitcher.tsx`
- Cause: label accesibilite hardcode en anglais, et ancien test i18n base sur mock de cles.
- Risque: UI declaree localisee sans preuve reelle de traduction/fallback/persistence.

## Correctif minimal

- `aria-label` du switcher relie a `t('settings.language')`.
- Test Settings remplace par une preuve reelle:
  - rendu francais
  - switch vers anglais
  - persistence locale
  - fallback vers francais

## Statut phase A

- Verdict phase A: `PARTIAL`
- Cause: la surface Settings est maintenant prouvee, mais la localisation du produit reste tres incomplete.
