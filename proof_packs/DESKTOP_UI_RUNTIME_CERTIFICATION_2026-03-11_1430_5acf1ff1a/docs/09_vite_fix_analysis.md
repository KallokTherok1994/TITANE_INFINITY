# 09 — ANALYSE FIX VITE

## Cause technique (TDZ)
Vite code-splitting avec chunks circulaires:
- services-ai.js -> imports services-other.js (via AI providers)
- services-other.js -> imports services-ai.js (via shared constants)
- Resolution circulaire: un des const/let est accede en TDZ
- Position: line 2, col 2817 (minified bundle, peut varier)

## Fix applique dans 5acf1ff1a (vite.config.ts)
Ligne ~369: "avoidcycles inter-chunks services-ai/services-other/services-voice"
Ligne ~373: if (id.includes('/services/')) { return 'core-runtime'; }
- Tous les modules /src/services/ -> chunk unique 'core-runtime'
- Plus de separation services-ai / services-other / services-voice
- Cycles intra-chunk : non-problematiques (pas de split)

## Verification
La presence du commentaire "P1_BUILD_CHUNKS_FIX" et "anti-cycles hardening" confirme
que ce bug TDZ etait CONNU et a ete corrige dans le commit 5acf1ff1a.
