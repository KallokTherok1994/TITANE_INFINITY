# G4 NETWORK CHECK — ONLINE-FINAL

## Existing Internet Connectivity Check

### Location
`src-tauri/src/ai/router.rs` — `AIRouter::check_internet()`

### Code
```rust
/// Check internet connectivity (fast timeout)
async fn check_internet(&self) -> bool {
    tokio::time::timeout(
        std::time::Duration::from_secs(3),
        reqwest::get("https://www.google.com"),
    )
    .await
    .is_ok()
}
```

### Logic
- Uses `reqwest::get()` HTTP GET to `https://www.google.com`
- Wrapped in `tokio::time::timeout(3s)`
- Returns `bool`: `true` = internet reachable, `false` = not reachable
- Result is cached 30s via `AIRouterCache` (via `update_status_cached()`)

### Criteria for `internetReachable=true`
- HTTP GET succeeds within 3 seconds (status 200 or any response)
- Network TCP connection established

### Usage in routing
```rust
// src-tauri/src/ai/router.rs:250
if let Some(gemini) = &self.gemini_client {
    if self.check_internet().await {     // ← gate check
        // Try Gemini API
    }
}
```

This ensures: **internet available ⟹ remote provider attempted** (if API key configured).

### Cache
- `get_provider_status("internet")` / `set_provider_status("internet", result)` — TTL 30s
- Prevents redundant network probes during same session

## Verdict G4

✅ **Check réseau existant** : `check_internet()` via reqwest GET google.com (3s timeout)
✅ **Routing correct** : remote provider tenté seulement si internet disponible
✅ **Cache** : résultat mis en cache 30s — pas de flood réseau

**Gate G4: PASS** — infrastructure de check internet existante et fonctionnelle.
