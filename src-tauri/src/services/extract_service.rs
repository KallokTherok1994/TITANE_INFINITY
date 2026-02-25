// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — EXTRACT SERVICE (Ring 3)
//   P4.0 QUALIFIED+++ — Deterministic HTML→text extractor
//   No external HTML parsing deps — pure Rust scan
//   Security: no JS execution, 5MB input cap
// ═══════════════════════════════════════════════════════════════

use sha2::{Digest, Sha256};

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/// Maximum HTML input size processed (5 MB). Larger inputs are truncated.
pub const MAX_HTML_BYTES: usize = 5 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────
// ERRORS
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub enum ExtractError {
    EmptyInput,
    DecodeFailed(String),
}

impl std::fmt::Display for ExtractError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ExtractError::EmptyInput => write!(f, "HTML input is empty"),
            ExtractError::DecodeFailed(s) => write!(f, "Decode failed: {}", s),
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// RESULT
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct ExtractResult {
    pub title: Option<String>,
    pub text: String,
    /// Hex-encoded SHA-256 of the normalized text
    pub text_hash: String,
    pub text_len: usize,
    pub lines: usize,
}

// ─────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────

pub struct ExtractService;

impl ExtractService {
    pub fn new() -> Self {
        ExtractService
    }

    /// Extract normalized text from HTML bytes.
    ///
    /// Deterministic: no time, no random, no external calls.
    /// Security: no JS execution, input capped at MAX_HTML_BYTES.
    pub fn extract(&self, html_bytes: &[u8]) -> Result<ExtractResult, ExtractError> {
        if html_bytes.is_empty() {
            return Err(ExtractError::EmptyInput);
        }

        // Cap input size to prevent DoS
        let bytes = if html_bytes.len() > MAX_HTML_BYTES {
            &html_bytes[..MAX_HTML_BYTES]
        } else {
            html_bytes
        };

        // Decode UTF-8 leniently (replace invalid sequences)
        let html = String::from_utf8_lossy(bytes);

        // Extract title (before any stripping)
        let title = extract_title(&html);

        // Pipeline (order matters):
        // 1. Remove block-level invisible elements (script, style, noscript)
        // 2. Replace structural closing tags with newlines
        // 3. Strip all remaining HTML tags
        // 4. Decode HTML entities
        // 5. Normalize whitespace

        let without_blocks = remove_invisible_blocks(&html);
        let with_breaks = inject_breaks(&without_blocks);
        let stripped = strip_tags(&with_breaks);
        let decoded = decode_entities(&stripped);
        let normalized = normalize_whitespace(&decoded);

        if normalized.is_empty() {
            return Err(ExtractError::EmptyInput);
        }

        let text_len = normalized.len();
        let lines = normalized.lines().count();
        let text_hash = sha256_hex(normalized.as_bytes());

        Ok(ExtractResult {
            title,
            text: normalized,
            text_hash,
            text_len,
            lines,
        })
    }
}

impl Default for ExtractService {
    fn default() -> Self {
        Self::new()
    }
}

// ─────────────────────────────────────────────────────────────────
// PIPELINE STEPS (all pure, deterministic)
// ─────────────────────────────────────────────────────────────────

/// Extract content of <title>...</title> (first occurrence, case-insensitive).
fn extract_title(html: &str) -> Option<String> {
    let lower = html.to_lowercase();
    let start = lower.find("<title")?;
    // Find the closing '>' of the opening tag
    let tag_end = html[start..].find('>')? + start + 1;
    let end = lower.find("</title>")?;
    if end <= tag_end {
        return None;
    }
    let raw = &html[tag_end..end];
    let decoded = decode_entities(&strip_tags(raw));
    let trimmed = decoded.trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

/// Remove content of <script>, <style>, <noscript> blocks (case-insensitive).
/// Handles multi-line blocks deterministically via linear scan.
fn remove_invisible_blocks(html: &str) -> String {
    remove_block(
        &remove_block(&remove_block(html, "script"), "style"),
        "noscript",
    )
}

/// Remove all occurrences of `<tagname ...>...</tagname>` from `html`.
fn remove_block(html: &str, tag: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let open_pat = format!("<{}", tag);
    let close_pat = format!("</{}>", tag);
    let lower = html.to_lowercase();

    let mut pos = 0usize;
    while pos < html.len() {
        // Find next open tag (case-insensitive via lowercase mirror)
        if let Some(rel_open) = lower[pos..].find(open_pat.as_str()) {
            let abs_open = pos + rel_open;
            // Make sure the char after tag name is '>' or ' ' or '\t' or '\n' or '/'
            // to avoid matching e.g. <scriptx>
            let after_tag = abs_open + open_pat.len();
            let next_ch = lower.as_bytes().get(after_tag).copied().unwrap_or(b'>');
            if next_ch == b'>'
                || next_ch == b' '
                || next_ch == b'\t'
                || next_ch == b'\n'
                || next_ch == b'/'
            {
                // Append everything before the open tag
                result.push_str(&html[pos..abs_open]);
                // Find matching close tag
                if let Some(rel_close) = lower[abs_open..].find(close_pat.as_str()) {
                    let abs_close = abs_open + rel_close + close_pat.len();
                    // Skip the entire block
                    pos = abs_close;
                } else {
                    // No closing tag: skip to end
                    pos = html.len();
                }
            } else {
                // Not a real tag match: advance past this '<'
                result.push_str(&html[pos..abs_open + 1]);
                pos = abs_open + 1;
            }
        } else {
            // No more open tags: append remainder
            result.push_str(&html[pos..]);
            break;
        }
    }
    result
}

/// Replace structural closing/self-closing tags with newline markers.
/// </p>, </li>, </div>, </h1>–</h6>, </tr>, </br>, <br>, <br/>
fn inject_breaks(html: &str) -> String {
    let mut out = String::with_capacity(html.len());
    let lower = html.to_lowercase();
    let bytes = html.as_bytes();
    let mut i = 0usize;

    while i < html.len() {
        if bytes[i] == b'<' {
            // Try to match break-inducing tags
            let slice = &lower[i..];
            let tag_end = slice.find('>').unwrap_or(slice.len());
            let inner = &slice[..=tag_end.min(slice.len() - 1)];

            let is_break_tag = inner.starts_with("</p>")
                || inner.starts_with("</li>")
                || inner.starts_with("</div>")
                || inner.starts_with("</tr>")
                || inner.starts_with("</h1>")
                || inner.starts_with("</h2>")
                || inner.starts_with("</h3>")
                || inner.starts_with("</h4>")
                || inner.starts_with("</h5>")
                || inner.starts_with("</h6>")
                || inner.starts_with("</section>")
                || inner.starts_with("</article>")
                || inner.starts_with("<br>")
                || inner.starts_with("<br/>")
                || inner.starts_with("<br />");

            if is_break_tag {
                out.push('\n');
                // Advance past the whole tag
                let tag_len = tag_end + 1;
                i += tag_len.min(html.len() - i);
            } else {
                out.push('<');
                i += 1;
            }
        } else {
            out.push(bytes[i] as char);
            i += 1;
        }
    }
    out
}

/// Strip all remaining HTML tags (anything between < and >).
fn strip_tags(html: &str) -> String {
    let mut out = String::with_capacity(html.len());
    let mut in_tag = false;
    for ch in html.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => out.push(ch),
            _ => {}
        }
    }
    out
}

/// Decode common HTML entities deterministically.
fn decode_entities(text: &str) -> String {
    // Named entities (order: longest first to avoid partial matches)
    const NAMED: &[(&str, &str)] = &[
        ("&amp;", "&"),
        ("&lt;", "<"),
        ("&gt;", ">"),
        ("&quot;", "\""),
        ("&apos;", "'"),
        ("&#39;", "'"),
        ("&nbsp;", " "),
        ("&mdash;", "—"),
        ("&ndash;", "–"),
        ("&laquo;", "«"),
        ("&raquo;", "»"),
        ("&copy;", "©"),
        ("&reg;", "®"),
        ("&trade;", "™"),
        ("&hellip;", "…"),
        ("&euro;", "€"),
    ];

    let mut s = text.to_string();
    for (entity, replacement) in NAMED {
        s = s.replace(entity, replacement);
    }

    // Numeric decimal entities: &#NNN;
    s = decode_numeric_entities(&s);

    s
}

/// Decode &#NNN; and &#xHHH; numeric HTML entities.
fn decode_numeric_entities(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        if chars[i] == '&' && i + 2 < len && chars[i + 1] == '#' {
            // Try to parse numeric entity
            let hex = i + 2 < len && (chars[i + 2] == 'x' || chars[i + 2] == 'X');
            let start = if hex { i + 3 } else { i + 2 };
            let mut j = start;
            while j < len && chars[j] != ';' && j - start < 8 {
                j += 1;
            }
            if j < len && chars[j] == ';' {
                let num_str: String = chars[start..j].iter().collect();
                let code_point = if hex {
                    u32::from_str_radix(&num_str, 16).ok()
                } else {
                    num_str.parse::<u32>().ok()
                };
                if let Some(cp) = code_point.and_then(char::from_u32) {
                    result.push(cp);
                    i = j + 1;
                    continue;
                }
            }
        }
        result.push(chars[i]);
        i += 1;
    }
    result
}

/// Normalize whitespace:
/// - Replace \t and \r with space
/// - Collapse multiple spaces into one
/// - Trim each line
/// - Collapse more than 2 consecutive blank lines to 2
/// - Trim leading/trailing whitespace
fn normalize_whitespace(text: &str) -> String {
    // Replace \r and \t
    let s = text.replace('\r', "\n").replace('\t', " ");

    // Process line by line
    let mut lines: Vec<String> = s
        .lines()
        .map(|l| {
            // Collapse runs of spaces within the line
            collapse_spaces(l.trim())
        })
        .collect();

    // Collapse >2 consecutive blank lines
    let mut result_lines: Vec<String> = Vec::with_capacity(lines.len());
    let mut blank_run = 0usize;
    for line in lines.drain(..) {
        if line.is_empty() {
            blank_run += 1;
            if blank_run <= 2 {
                result_lines.push(String::new());
            }
        } else {
            blank_run = 0;
            result_lines.push(line);
        }
    }

    // Trim leading and trailing blank lines
    let start = result_lines.iter().position(|l| !l.is_empty()).unwrap_or(0);
    let end = result_lines
        .iter()
        .rposition(|l| !l.is_empty())
        .map(|i| i + 1)
        .unwrap_or(0);
    let result_lines = &result_lines[start..end];

    result_lines.join("\n")
}

fn collapse_spaces(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut last_space = false;
    for ch in s.chars() {
        if ch == ' ' {
            if !last_space {
                out.push(' ');
            }
            last_space = true;
        } else {
            out.push(ch);
            last_space = false;
        }
    }
    out
}

// ─────────────────────────────────────────────────────────────────
// HASH HELPER
// ─────────────────────────────────────────────────────────────────

fn sha256_hex(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher
        .finalize()
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect()
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn svc() -> ExtractService {
        ExtractService::new()
    }

    // ── G_EXTRACT_REMOVES_SCRIPT_STYLE ────────────────────────────

    #[test]
    fn g_extract_removes_script() {
        let html = b"<html><head><script>var x = 1; alert('xss');</script></head><body>Hello</body></html>";
        let r = svc().extract(html).unwrap();
        assert!(!r.text.contains("var x"), "script content must be removed");
        assert!(!r.text.contains("alert"), "script content must be removed");
        assert!(r.text.contains("Hello"));
    }

    #[test]
    fn g_extract_removes_style() {
        let html =
            b"<html><head><style>.foo { color: red; }</style></head><body>Text</body></html>";
        let r = svc().extract(html).unwrap();
        assert!(!r.text.contains("color"), "style content must be removed");
        assert!(r.text.contains("Text"));
    }

    #[test]
    fn g_extract_removes_noscript() {
        let html = b"<html><body><noscript>Enable JS</noscript>Real text</body></html>";
        let r = svc().extract(html).unwrap();
        assert!(
            !r.text.contains("Enable JS"),
            "noscript content must be removed"
        );
        assert!(r.text.contains("Real text"));
    }

    // ── G_EXTRACT_ENTITY_DECODE ───────────────────────────────────

    #[test]
    fn g_extract_entity_amp() {
        let html = b"<p>Cats &amp; Dogs</p>";
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Cats & Dogs"), "got: {}", r.text);
    }

    #[test]
    fn g_extract_entity_lt_gt() {
        let html = b"<p>1 &lt; 2 &gt; 0</p>";
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("1 < 2 > 0"), "got: {}", r.text);
    }

    #[test]
    fn g_extract_entity_quot() {
        let html = b"<p>&quot;Hello&quot;</p>";
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("\"Hello\""), "got: {}", r.text);
    }

    #[test]
    fn g_extract_entity_nbsp() {
        let html = b"<p>Hello&nbsp;World</p>";
        let r = svc().extract(html).unwrap();
        // &nbsp; → space (then collapsed)
        assert!(r.text.contains("Hello World"), "got: {}", r.text);
    }

    #[test]
    fn g_extract_entity_numeric_decimal() {
        let html = b"<p>&#65;&#66;&#67;</p>"; // ABC
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("ABC"), "got: {}", r.text);
    }

    #[test]
    fn g_extract_entity_numeric_hex() {
        let html = b"<p>&#x41;&#x42;&#x43;</p>"; // ABC
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("ABC"), "got: {}", r.text);
    }

    // ── G_EXTRACT_WHITESPACE_NORMALIZED ──────────────────────────

    #[test]
    fn g_extract_whitespace_no_excessive_blanks() {
        let html = b"<p>A</p>\n\n\n\n\n\n<p>B</p>";
        let r = svc().extract(html).unwrap();
        // Max 2 consecutive blank lines
        let mut blank_run = 0usize;
        let mut max_blank = 0usize;
        for line in r.text.lines() {
            if line.trim().is_empty() {
                blank_run += 1;
                max_blank = max_blank.max(blank_run);
            } else {
                blank_run = 0;
            }
        }
        assert!(max_blank <= 2, "too many consecutive blanks: {}", max_blank);
    }

    #[test]
    fn g_extract_whitespace_tabs_collapsed() {
        let html = b"<p>Hello\t\t\tWorld</p>";
        let r = svc().extract(html).unwrap();
        assert!(!r.text.contains('\t'), "tabs must be removed");
        assert!(r.text.contains("Hello World") || r.text.contains("Hello World"));
    }

    // ── G_EXTRACT_DETERMINISTIC_X3 ────────────────────────────────

    #[test]
    fn g_extract_deterministic_x3() {
        let html =
            b"<html><head><title>Test</title></head><body><p>Hello <b>World</b></p></body></html>";
        let r1 = svc().extract(html).unwrap();
        let r2 = svc().extract(html).unwrap();
        let r3 = svc().extract(html).unwrap();
        assert_eq!(r1.text_hash, r2.text_hash, "run1 != run2");
        assert_eq!(r2.text_hash, r3.text_hash, "run2 != run3");
        assert_eq!(r1.text, r2.text);
        assert_eq!(r2.text, r3.text);
    }

    // ── TITLE EXTRACTION ─────────────────────────────────────────

    #[test]
    fn g_extract_title() {
        let html = b"<html><head><title>My Page Title</title></head><body>Content</body></html>";
        let r = svc().extract(html).unwrap();
        assert_eq!(r.title, Some("My Page Title".to_string()));
    }

    #[test]
    fn g_extract_title_none_when_missing() {
        let html = b"<html><body>No title here</body></html>";
        let r = svc().extract(html).unwrap();
        assert!(r.title.is_none() || r.title.as_deref().unwrap_or("").is_empty());
    }

    // ── EMPTY INPUT ───────────────────────────────────────────────

    #[test]
    fn g_extract_empty_input_err() {
        let result = svc().extract(b"");
        assert!(result.is_err());
        matches!(result.unwrap_err(), ExtractError::EmptyInput);
    }

    // ── CAP SIZE ─────────────────────────────────────────────────

    #[test]
    fn g_extract_cap_size() {
        let big = vec![b'A'; MAX_HTML_BYTES + 100];
        // Should not panic and should process only up to cap
        let r = svc().extract(&big);
        // Either ok or empty-input
        if let Ok(res) = r {
            assert!(res.text_len <= MAX_HTML_BYTES);
        }
    }

    // ── HEADING BREAKS ───────────────────────────────────────────

    #[test]
    fn g_extract_heading_on_own_line() {
        let html = b"<h1>Title</h1><p>Para</p>";
        let r = svc().extract(html).unwrap();
        // Title and Para should be on separate lines
        let lines: Vec<&str> = r.text.lines().filter(|l| !l.trim().is_empty()).collect();
        assert!(
            lines.len() >= 2,
            "expected multiple lines, got: {:?}",
            lines
        );
    }

    // ── LIST ITEMS ────────────────────────────────────────────────

    #[test]
    fn g_extract_list_items_separated() {
        let html = b"<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>";
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Item 1"), "got: {}", r.text);
        assert!(r.text.contains("Item 2"), "got: {}", r.text);
        assert!(r.text.contains("Item 3"), "got: {}", r.text);
    }

    // ── TEXT_HASH PRESENT ─────────────────────────────────────────

    #[test]
    fn g_text_hash_is_64_hex_chars() {
        let html = b"<p>Hello World</p>";
        let r = svc().extract(html).unwrap();
        assert_eq!(r.text_hash.len(), 64, "sha256 hex must be 64 chars");
        assert!(
            r.text_hash.chars().all(|c| c.is_ascii_hexdigit()),
            "text_hash must be hex"
        );
    }

    // ── FIXTURE-BASED REGRESSION TESTS ───────────────────────────

    #[test]
    fn g_fixture_simple_paragraph() {
        let html = include_bytes!("../../tests/fixtures/html/01_simple_paragraph.html");
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Hello World"), "got: {}", r.text);
        assert_eq!(r.text_hash.len(), 64);
    }

    #[test]
    fn g_fixture_list() {
        let html = include_bytes!("../../tests/fixtures/html/02_list.html");
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Apple"), "got: {}", r.text);
        assert!(r.text.contains("Banana"), "got: {}", r.text);
    }

    #[test]
    fn g_fixture_headings() {
        let html = include_bytes!("../../tests/fixtures/html/03_headings.html");
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Introduction"), "got: {}", r.text);
        assert!(r.text.contains("Conclusion"), "got: {}", r.text);
    }

    #[test]
    fn g_fixture_script_style_removed() {
        let html = include_bytes!("../../tests/fixtures/html/04_script_style.html");
        let r = svc().extract(html).unwrap();
        assert!(!r.text.contains("var "), "var residual found: {}", r.text);
        assert!(!r.text.contains("color:"), "css residual found: {}", r.text);
        assert!(r.text.contains("Visible Content"), "got: {}", r.text);
    }

    #[test]
    fn g_fixture_entities() {
        let html = include_bytes!("../../tests/fixtures/html/05_entities.html");
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Cats & Dogs"), "got: {}", r.text);
        assert!(r.text.contains("1 < 2"), "got: {}", r.text);
    }

    #[test]
    fn g_fixture_weird_whitespace() {
        let html = include_bytes!("../../tests/fixtures/html/06_weird_whitespace.html");
        let r = svc().extract(html).unwrap();
        assert!(!r.text.contains('\t'), "tabs found");
        let max_blanks = r
            .text
            .lines()
            .collect::<Vec<_>>()
            .windows(3)
            .filter(|w| w.iter().all(|l| l.trim().is_empty()))
            .count();
        assert_eq!(max_blanks, 0, "too many blank lines");
    }

    #[test]
    fn g_fixture_nested_tags() {
        let html = include_bytes!("../../tests/fixtures/html/07_nested_tags.html");
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Nested"), "got: {}", r.text);
    }

    #[test]
    fn g_fixture_title_extraction() {
        let html = include_bytes!("../../tests/fixtures/html/08_title.html");
        let r = svc().extract(html).unwrap();
        assert_eq!(r.title, Some("Page Title Test".to_string()));
    }

    #[test]
    fn g_fixture_br_tags() {
        let html = include_bytes!("../../tests/fixtures/html/09_br_tags.html");
        let r = svc().extract(html).unwrap();
        assert!(r.text.contains("Line 1"), "got: {}", r.text);
        assert!(r.text.contains("Line 2"), "got: {}", r.text);
    }

    #[test]
    fn g_fixture_larger_html() {
        let html = include_bytes!("../../tests/fixtures/html/10_larger.html");
        let r = svc().extract(html).unwrap();
        assert!(r.text_len > 0);
        assert!(r.text.contains("TITANE"), "got: {}", r.text);
    }
}
