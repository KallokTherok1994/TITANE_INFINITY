// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — Static File Service (Ring 0)
//   Serves the remote-mode frontend build (dist/remote/)
// ═══════════════════════════════════════════════════════════════

use axum::{routing::get_service, Router};
use tower_http::services::{ServeDir, ServeFile};

/// Build a router that serves the static remote frontend.
/// Path: dist/remote/ (relative to the Tauri app bundle or workspace root)
/// Falls back to dist/remote/index.html for SPA client-side routing.
pub fn static_router(dist_remote_path: &str) -> Router {
    let index_html = format!("{}/index.html", dist_remote_path);
    let serve = ServeDir::new(dist_remote_path)
        .not_found_service(ServeFile::new(index_html));

    Router::new().nest_service("/", get_service(serve))
}
