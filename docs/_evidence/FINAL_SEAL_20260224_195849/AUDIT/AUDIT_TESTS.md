# AUDIT_TESTS

## Test Suites
| Suite                    | Count  | Status |
|--------------------------|--------|--------|
| All lib unit tests (P1-P13) | 4387 | PASS   |
| Ignored (already P8)        | 7    | KNOWN  |
| Failed                      | 0    | -      |

## P10 Gate Tests (new)
- test_null_provider_returns_none
- test_is_enabled_default_false
- test_local_llm_mode_default_none
- test_strict_evidence_default_true
- test_provider_name_null
- test_generate_with_llm_hook_empty_passages
- test_generate_with_llm_hook_returns_extractive
- test_generate_with_llm_hook_strategy_marker

## P12 Gate Tests (new)
- test_seed_pack_basic_load
- test_seed_pack_url_count_cap
- test_seed_pack_hash_stable
- test_seed_pack_http_only_filter
- test_parse_sitemap_urls_basic
- test_parse_sitemap_urls_empty
- test_parse_rss_urls_basic
- test_parse_rss_urls_empty
- test_sitemap_budget_cap

## P13 Gate Tests (new)
- test_locator_text_basic
- test_locator_text_zero_paragraph
- test_locator_text_large_char
- test_make_locator_text_none_on_no_passage
- test_locator_text_format_stable
- test_no_long_quotes_in_excerpt

## Ignored Tests (7 — pre-existing P8)
All 7 are integration-level tests requiring live network or full Tauri runtime.
Classified as ENV_DEFECT (runner limitation), not CODE_DEFECT.
VERDICT: ACCEPTABLE — unit coverage complete
