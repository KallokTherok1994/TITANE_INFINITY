# Overlays, Debug & Observabilité UI

## 1) Éléments observés dans les captures
- **Boot Beacon** (bas droite) : encart compact affichant des marqueurs `stage`, `started`, `rootChildren`, `href`, `keys`.
- **ErrorBoundary** global : bandeau en haut avec message « Une erreur inattendue s’est produite... » + section “Détails techniques” + stacktrace + bouton **Réessayer**.
- **Console Monitor** (bas droite) : widget de monitoring console (présence visible dans une capture).
- **Predictive AI** (badge/bouton flottant) dans certaines vues.

## 2) Contrat recommandé (zéro silence)
Tout overlay doit exposer :
- `what` : nom court de l’erreur / événement
- `where` : route + composant
- `why` : cause (si connue) ou hypothèse
- `next` : action proposée (retry, open logs, export snapshot)

## 3) Check‑list de robustesse
- Aucun overlay ne doit **bloquer** la navigation sans fournir au moins : retry + open logs.
- En production, pas de stacktrace brute par défaut : mode “diagnostic” activable.
- `Boot Beacon` doit être désactivable mais **persistant** en mode dev.

## 4) Erreurs observées (à corréler)
- `undefined is not an object (evaluating 't.meta.metrics.level')`
- `undefined is not an object (evaluating 'f.quantum_coherence')`

Hypothèse : des objets de métriques “health” ne sont pas initialisés ou changent de schéma.
