use std::collections::HashMap;

pub fn get_csp_headers() -> HashMap<String, String> {
    let mut headers = HashMap::new();

    headers.insert(
        "Content-Security-Policy".to_string(),
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self' http: https: ws: wss:",
            "frame-ancestors 'none'",
        ]
        .join("; "),
    );

    headers.insert("X-Content-Type-Options".to_string(), "nosniff".to_string());

    headers.insert("X-Frame-Options".to_string(), "DENY".to_string());

    headers.insert("X-XSS-Protection".to_string(), "1; mode=block".to_string());

    headers.insert(
        "Referrer-Policy".to_string(),
        "strict-origin-when-cross-origin".to_string(),
    );

    headers
}

#[cfg(test)]
mod tests {
    use super::get_csp_headers;

    #[test]
    fn remote_gateway_csp_allows_user_selected_gateway_urls() {
        let headers = get_csp_headers();
        let csp = headers
            .get("Content-Security-Policy")
            .expect("CSP header should be present");

        assert!(csp.contains("connect-src 'self' http: https: ws: wss:"));
    }
}
