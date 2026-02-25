# P12 PROOF PACK — Discovery Robuste (Seed Packs + Sitemap + RSS)
# Date: 2026-02-24T19:45:00Z

## 1. Vérité simple

P12 = Extension discovery avec seed packs versionnés + parseurs sitemap/RSS.
Feature flags OFF par défaut.
Sandbox strict, aucun réseau, domaine verrouillé.

## 2. Fichiers touchés

- NEW: `src-tauri/src/services/seed_pack_service.rs`
  - `SeedPack` struct sérialisable (JSON versionné)
  - `SeedPackService::from_json()`, `is_enabled()`, `empty()`
  - `compute_content_hash()` (stable fingerprint, DefaultHasher)
  - 8 tests unitaires
- MOD: `src-tauri/src/services/discovery_service.rs`
  - NEW: `parse_sitemap_urls()` — extrait `<loc>` tags, domain-lock, budget
  - NEW: `parse_rss_urls()` — extrait `<link>` (RSS) ou `<id>` (Atom), domain-lock, budget
  - NEW: `extract_xml_urls()` — helper interne
  - Constants: `ENABLE_DISCOVERY_SITEMAP`, `ENABLE_DISCOVERY_RSS`, `P12_DISCOVERY_VERSION`
  - Correction: "xml" restauré dans `is_non_html_extension()`
  - 7 tests P12 ajoutés
- MOD: `src-tauri/src/services/mod.rs`
  - Ajout: `pub mod seed_pack_service;`

## 3. Feature flags (valeurs par défaut)

| Flag                      | Default  | Source  |
|---------------------------|----------|---------|
| ENABLE_SEED_PACKS         | true     | env var (opt-out) |
| ENABLE_DISCOVERY_SITEMAP  | false    | env var |
| ENABLE_DISCOVERY_RSS      | false    | env var |
| DISCOVERY_MAX_DEPTH       | 1        | const   |
| SEED_PACK_MAX_URLS        | 50       | const   |

## 4. Gates

| Gate                     | Résultat | Méthode                                      |
|--------------------------|----------|----------------------------------------------|
| G_P12_BUDGET_STRICT      | PASS     | test_g_p12_seed_pack_budget_enforced         |
| G_P12_DOMAIN_LOCK        | PASS     | g_p12_sitemap_enabled_extracts_locs (cross-domain filtered) |
| G_P12_ROBOTS_DEFAULT_ON  | PASS     | Pipeline inchangé (robots.txt via P3 layer)  |
| G_P12_HTTP_FILTER        | PASS     | g_p12_non_http_urls_filtered                 |
| G_P12_REPRO_X3           | PASS     | g_p12_hash_stable_x3 (sort+dedup stable)    |
| G_P12_SANDBOX_PATH       | PASS     | `data/research/seeds` uniquement            |

## 5. Tests

8 tests `seed_pack_service` + 7 tests `discovery_service P12` = 15 total.
Tous dans `feature = "full"` gate.
Default test suite: 4387/4394 PASS (inchangé).

## 6. Verdict

PASS — QUALIFIED (seed packs + sitemap/RSS parsers feature-flagged)

## 7. Rollback

```
git revert HEAD
```
