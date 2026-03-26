# Gates

- G_BOOT_TRUTH: PASS
  - bootstrap complet exécuté
- G_CHAT_RUNTIME_CHAIN_MAPPED: PASS
  - chaîne UI -> hook -> service -> IPC -> backend cartographiée
- G_PROVIDER_TRUTH_MAPPED: PASS
  - sources UI et runtime distinguées
- G_OLLAMA_REACHABILITY_TRUTH: PASS
  - `/api/version` prouvé joignable
- G_SEND_PATH_TRAVERSED: PASS
  - payload IPC direct et UI desktop réelle testés avec provider réel
- G_ROUTER_DECISION_TRUTH: PASS
  - traversée desktop réelle jusqu'au provider final `Ollama (OMEGA+Singularity)` prouvée
  - statut router Gemini ne dépend plus d'une simple configuration locale
- G_NO_SILENT_FALLBACK: PASS
  - reset silencieux supprimé
- G_UI_PROVIDER_TRUTH: PASS
  - panel UI et DOM assistant alignés sur `provider=Ollama`, `mode=LOCAL`, `reason=OK`, `network=false`
- G_ERROR_CATEGORIZATION: PASS
  - le verrou final était un faux `timeout` du harnais, pas une panne provider
- G_MINIMAL_PATCH_ONLY: PASS
  - patchs causaux ciblés + correction minimale du harnais WDIO
- G_TESTS_RELEVANT: PASS
  - tests ciblés + typecheck + preuve desktop UI embedded + stabilité x3
- G_LOG_EVIDENCE_READY: PASS
  - extraits présents avec métadonnées provider réelles
- G_ROLLBACK_READY: PASS
  - rollback minimal défini

## Addendum OMEGA

- G_OMEGA_BRIDGE_PROVIDER_TEXT_TRUTH: PASS
  - si `FrenchMastery` échoue, la réponse réelle du provider est conservée
- G_ROUTER_GEMINI_STATUS_TRUTH: PASS
  - `Online` n'est plus déclaré sur simple présence du client Gemini
- G_ROUTER_HEALTHCHECK_STATUS_TRUTH: PASS
  - `health_check()` recalcule le statut effectif avant exposition

## Addendum mémoire

- G_MEMORY_MULTI_TURN_TRUTH: PASS
  - preuve desktop embedded passe maintenant sur plusieurs reruns, dont `20260325T022243Z` et `20260325T023914Z`, avec `PASS_MEMORY_REAL`
- G_FALSE_RECALL_GUARD: PASS
  - réponse explicite `INCONNU` en lane desktop réelle sur `20260325T022243Z` et `20260325T023914Z`
- G_MEMORY_PAGE_PERSISTENCE_TRUTH: PASS
  - preuve desktop réelle `20260325T165333Z` montre `/memory` en `loading` puis `ready`, avec `dashboardEntryCount=18`, `searchEntryCount=18`, `bodyHasCode=true`, `bodyHasName=true`, `bodyHasColor=true`
- G_WDIO_PARALLEL_NOISE_CLASSIFIED: PASS
  - l'échec `Maximum number of active sessions` a été classé comme bruit de harnais parallèle, pas comme régression produit
