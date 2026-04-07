// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — INDEX SERVICE (Ring 3)
//   P5.0 QUALIFIED++++ — Tantivy lexical index (BM25)
//   Sandbox strict: data/research/index/ only
//   Security: no network, no JS, sandboxed writes only
// ═══════════════════════════════════════════════════════════════

use std::path::{Path, PathBuf};
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::{Field, Schema, SchemaBuilder, Value, FAST, INDEXED, STORED, STRING, TEXT};
use tantivy::{Index, IndexReader, IndexWriter, ReloadPolicy, TantivyDocument};

use crate::types::research::RetrievedPassage;

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/// Maximum results returned per query
const DEFAULT_TOP_K: usize = 5;
/// Max heap size for Tantivy writer (16 MB — minimal footprint)
const WRITER_HEAP_BYTES: usize = 16_000_000;
/// Maximum body text length indexed (1 MB) — prevents index bloat on large docs
const MAX_BODY_INDEX_BYTES: usize = 1_024 * 1_024;

// ─────────────────────────────────────────────────────────────────
// ERRORS
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub enum IndexError {
    Init(String),
    Write(String),
    Read(String),
    SandboxViolation(String),
}

impl std::fmt::Display for IndexError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IndexError::Init(s) => write!(f, "IndexError::Init: {}", s),
            IndexError::Write(s) => write!(f, "IndexError::Write: {}", s),
            IndexError::Read(s) => write!(f, "IndexError::Read: {}", s),
            IndexError::SandboxViolation(s) => {
                write!(f, "IndexError::SandboxViolation: {}", s)
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// RESULT TYPES
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct IndexHit {
    pub url: String,
    pub title: String,
    /// Full stored body (capped at 1MB at write time) — used for passage retrieval
    pub body: String,
    pub snippet: String,
    pub text_hash: String,
    pub score: f32,
}

#[derive(Debug, Clone)]
pub enum IndexWriteResult {
    Written,
    SkippedDuplicate,
}

// ─────────────────────────────────────────────────────────────────
// SCHEMA FIELDS (stored as struct for ergonomics)
// ─────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct IndexFields {
    url: Field,
    title: Field,
    body: Field,
    domain: Field,
    fetched_at: Field,
    text_hash: Field,
}

// ─────────────────────────────────────────────────────────────────
// INDEX SERVICE
// ─────────────────────────────────────────────────────────────────

pub struct IndexService {
    index: Index,
    fields: IndexFields,
    index_path: PathBuf,
}

impl IndexService {
    /// Open or create the Tantivy index at `sandbox_root/index/`.
    /// Sandbox is enforced: path must be under sandbox_root.
    pub fn init_or_open(sandbox_root: &Path) -> Result<Self, IndexError> {
        let index_path = sandbox_root.join("index");

        // Sandbox guard: index_path must be under sandbox_root
        let canonical_root = sandbox_root
            .canonicalize()
            .unwrap_or_else(|_| sandbox_root.to_path_buf());
        // We create dir first so canonicalize works
        std::fs::create_dir_all(&index_path)
            .map_err(|e| IndexError::Init(format!("cannot create index dir: {}", e)))?;
        let canonical_index = index_path
            .canonicalize()
            .unwrap_or_else(|_| index_path.clone());
        if !canonical_index.starts_with(&canonical_root) {
            return Err(IndexError::SandboxViolation(format!(
                "Index path '{}' is outside sandbox '{}'",
                canonical_index.display(),
                canonical_root.display()
            )));
        }

        let (schema, fields) = build_schema();

        let index = if index_is_empty(&index_path) {
            Index::create_in_dir(&index_path, schema)
                .map_err(|e| IndexError::Init(format!("create index: {}", e)))?
        } else {
            Index::open_in_dir(&index_path)
                .map_err(|e| IndexError::Init(format!("open index: {}", e)))?
        };

        Ok(IndexService {
            index,
            fields,
            index_path,
        })
    }

    /// Check if a document with the given text_hash already exists.
    pub fn document_exists_by_hash(&self, text_hash: &str) -> bool {
        let Ok(reader) = self.make_reader() else {
            return false;
        };
        let searcher = reader.searcher();
        let term = tantivy::Term::from_field_text(self.fields.text_hash, text_hash);
        let query = tantivy::query::TermQuery::new(term, tantivy::schema::IndexRecordOption::Basic);
        matches!(
            searcher.search(&query, &TopDocs::with_limit(1).order_by_score()),
            Ok(ref hits) if !hits.is_empty()
        )
    }

    /// Index a document. Returns `SkippedDuplicate` if text_hash already exists.
    pub fn index_document(
        &self,
        url: &str,
        title: &str,
        body: &str,
        domain: &str,
        fetched_at_ms: i64,
        text_hash: &str,
    ) -> Result<IndexWriteResult, IndexError> {
        // Dedup check
        if self.document_exists_by_hash(text_hash) {
            return Ok(IndexWriteResult::SkippedDuplicate);
        }

        // Cap body to MAX_BODY_INDEX_BYTES to prevent index bloat
        let body_capped = if body.len() > MAX_BODY_INDEX_BYTES {
            // Clip to valid char boundary
            let mut end = MAX_BODY_INDEX_BYTES;
            while !body.is_char_boundary(end) {
                end -= 1;
            }
            &body[..end]
        } else {
            body
        };

        let mut writer = self.make_writer()?;

        // Delete existing doc for the same URL (upsert by url)
        let url_term = tantivy::Term::from_field_text(self.fields.url, url);
        writer.delete_term(url_term);

        let mut doc = TantivyDocument::default();
        doc.add_text(self.fields.url, url);
        doc.add_text(self.fields.title, title);
        doc.add_text(self.fields.body, body_capped);
        doc.add_text(self.fields.domain, domain);
        // fetched_at_ms: pass 0 or real timestamp (callers should pass actual ts when available)
        doc.add_i64(self.fields.fetched_at, fetched_at_ms);
        doc.add_text(self.fields.text_hash, text_hash);

        writer
            .add_document(doc)
            .map_err(|e| IndexError::Write(format!("add_document: {}", e)))?;
        writer
            .commit()
            .map_err(|e| IndexError::Write(format!("commit: {}", e)))?;

        Ok(IndexWriteResult::Written)
    }

    /// Search the index with a free-text query.
    pub fn search(
        &self,
        query_str: &str,
        top_k: Option<usize>,
    ) -> Result<Vec<IndexHit>, IndexError> {
        let k = top_k.unwrap_or(DEFAULT_TOP_K).max(1);
        let reader = self.make_reader()?;
        let searcher = reader.searcher();

        let query_parser =
            QueryParser::for_index(&self.index, vec![self.fields.title, self.fields.body]);
        let query = query_parser
            .parse_query(query_str)
            .map_err(|e| IndexError::Read(format!("parse_query: {}", e)))?;

        let top_docs = searcher
            .search(&query, &TopDocs::with_limit(k).order_by_score())
            .map_err(|e| IndexError::Read(format!("search: {}", e)))?;

        let mut hits = Vec::with_capacity(top_docs.len());
        for (score, doc_addr) in top_docs {
            if let Ok(doc) = searcher.doc::<TantivyDocument>(doc_addr) {
                let url = get_field_text(&doc, self.fields.url);
                let title = get_field_text(&doc, self.fields.title);
                let body = get_field_text(&doc, self.fields.body);
                let text_hash = get_field_text(&doc, self.fields.text_hash);
                let snippet = make_snippet(&body, query_str, 200);
                hits.push(IndexHit {
                    url,
                    title,
                    body,
                    snippet,
                    text_hash,
                    score,
                });
            }
        }
        Ok(hits)
    }

    /// Retrieve matching passages from a document body.
    /// Splits body into paragraphs, scores by term presence.
    pub fn retrieve_passages(
        body: &str,
        query_str: &str,
        top_k: usize,
        url: &str,
    ) -> Vec<RetrievedPassage> {
        let terms: Vec<String> = query_str
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect();

        // Build (score, paragraph_index, char_start, text) tuples
        let mut char_offset: usize = 0;
        let mut scored: Vec<(usize, u32, u32, &str)> = body
            .split('\n')
            .enumerate()
            .filter_map(|(para_idx, para)| {
                let start = char_offset;
                char_offset += para.len() + 1; // +1 for '\n'
                let trimmed = para.trim();
                if trimmed.is_empty() {
                    return None;
                }
                let lower = trimmed.to_lowercase();
                let score = terms.iter().filter(|t| lower.contains(&t[..])).count();
                if score == 0 {
                    return None;
                }
                Some((
                    score,
                    para_idx as u32,
                    start.min(u32::MAX as usize) as u32,
                    trimmed,
                ))
            })
            .collect();

        // Sort by descending score
        scored.sort_by(|a, b| b.0.cmp(&a.0));
        scored.truncate(top_k);

        scored
            .into_iter()
            .map(|(score, para_idx, char_start, passage)| RetrievedPassage {
                url: url.to_string(),
                passage: passage.to_string(),
                score,
                paragraph_index: Some(para_idx),
                char_start: Some(char_start),
            })
            .collect()
    }

    /// Return the number of documents in the index.
    pub fn doc_count(&self) -> usize {
        let Ok(reader) = self.make_reader() else {
            return 0;
        };
        reader.searcher().num_docs() as usize
    }

    /// Return the sandbox path of the index.
    pub fn index_path(&self) -> &Path {
        &self.index_path
    }

    // ── Private helpers ──────────────────────────────────────────

    fn make_reader(&self) -> Result<IndexReader, IndexError> {
        self.index
            .reader_builder()
            .reload_policy(ReloadPolicy::OnCommitWithDelay)
            .try_into()
            .map_err(|e| IndexError::Read(format!("reader: {}", e)))
    }

    fn make_writer(&self) -> Result<IndexWriter, IndexError> {
        self.index
            .writer(WRITER_HEAP_BYTES)
            .map_err(|e| IndexError::Write(format!("writer: {}", e)))
    }
}

// ─────────────────────────────────────────────────────────────────
// SCHEMA BUILDER
// ─────────────────────────────────────────────────────────────────

fn build_schema() -> (Schema, IndexFields) {
    let mut builder: SchemaBuilder = Schema::builder();

    let url = builder.add_text_field("url", STRING | STORED | FAST);
    let title = builder.add_text_field("title", TEXT | STORED);
    let body = builder.add_text_field("body", TEXT | STORED);
    let domain = builder.add_text_field("domain", STRING | FAST);
    let fetched_at = builder.add_i64_field("fetched_at", INDEXED | FAST);
    let text_hash = builder.add_text_field("text_hash", STRING | STORED | FAST);

    let schema = builder.build();
    let fields = IndexFields {
        url,
        title,
        body,
        domain,
        fetched_at,
        text_hash,
    };
    (schema, fields)
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/// True if the directory has no Tantivy index files yet.
fn index_is_empty(path: &Path) -> bool {
    let Ok(entries) = std::fs::read_dir(path) else {
        return true;
    };
    !entries
        .filter_map(|e| e.ok())
        .any(|e| e.file_name().to_string_lossy().starts_with("meta.json"))
}

/// Extract first text value of a field from a TantivyDocument.
fn get_field_text(doc: &TantivyDocument, field: Field) -> String {
    doc.get_first(field)
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string()
}

/// Make a brief snippet from body around matching terms.
fn make_snippet(body: &str, query: &str, max_len: usize) -> String {
    let terms: Vec<&str> = query.split_whitespace().collect();
    let lower = body.to_lowercase();
    // Find first match position
    let pos = terms
        .iter()
        .find_map(|t| lower.find(&t.to_lowercase()))
        .unwrap_or(0);
    let start = pos.saturating_sub(40).min(body.len());
    let end = (start + max_len).min(body.len());

    // Clip to valid char boundaries using a simple forward scan
    let start = body
        .char_indices()
        .map(|(i, _)| i)
        .find(|&i| i >= start)
        .unwrap_or(body.len());
    let end = body
        .char_indices()
        .map(|(i, _)| i)
        .filter(|&i| i <= end)
        .next_back()
        .unwrap_or(body.len());

    let snip = body[start..end].trim();
    if snip.len() < body.len() {
        format!("…{}…", snip)
    } else {
        snip.to_string()
    }
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn tmp_sandbox() -> PathBuf {
        let dir = std::env::temp_dir().join("titane_index_test").join(format!(
            "{:x}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .subsec_nanos()
        ));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn open_svc(sandbox: &Path) -> IndexService {
        IndexService::init_or_open(sandbox).expect("init_or_open failed")
    }

    // ── G_SANDBOX_INDEX_ONLY ──────────────────────────────────────

    #[test]
    fn g_sandbox_index_only() {
        let sandbox = tmp_sandbox();
        let svc = open_svc(&sandbox);
        let index_path = svc.index_path();
        let canonical_sandbox = sandbox.canonicalize().unwrap_or_else(|_| sandbox.clone());
        let canonical_index = index_path
            .canonicalize()
            .unwrap_or_else(|_| index_path.to_path_buf());
        assert!(
            canonical_index.starts_with(&canonical_sandbox),
            "Index path '{}' is outside sandbox '{}'",
            canonical_index.display(),
            canonical_sandbox.display()
        );
    }

    // ── G_INDEX_WRITE_AND_QUERY ───────────────────────────────────

    #[test]
    fn g_index_write_and_query() {
        let sandbox = tmp_sandbox();
        let svc = open_svc(&sandbox);

        let result = svc
            .index_document(
                "https://example.com/test",
                "Test Document",
                "The quick brown fox jumps over the lazy dog",
                "example.com",
                0,
                "aaabbbccc111",
            )
            .unwrap();
        assert!(matches!(result, IndexWriteResult::Written));

        let hits = svc.search("fox", None).unwrap();
        assert!(
            !hits.is_empty(),
            "Expected search results for 'fox', got none"
        );
        assert_eq!(hits[0].url, "https://example.com/test");
    }

    // ── G_INDEX_DEDUP ─────────────────────────────────────────────

    #[test]
    fn g_index_dedup() {
        let sandbox = tmp_sandbox();
        let svc = open_svc(&sandbox);

        let r1 = svc
            .index_document(
                "https://dedup.example.com/page",
                "Dedup Test",
                "Unique content here",
                "dedup.example.com",
                0,
                "hash_unique_001",
            )
            .unwrap();
        assert!(matches!(r1, IndexWriteResult::Written));

        // Second index with same hash → SkippedDuplicate
        let r2 = svc
            .index_document(
                "https://dedup.example.com/page",
                "Dedup Test",
                "Unique content here",
                "dedup.example.com",
                0,
                "hash_unique_001",
            )
            .unwrap();
        assert!(
            matches!(r2, IndexWriteResult::SkippedDuplicate),
            "Expected SkippedDuplicate on second write of same hash"
        );

        // Doc count should still be 1
        assert_eq!(svc.doc_count(), 1);
    }

    // ── G_REPRODUCIBILITY_LOCAL_X3 ────────────────────────────────

    #[test]
    fn g_reproducibility_local_x3() {
        let sandbox = tmp_sandbox();
        let svc = open_svc(&sandbox);

        svc.index_document(
            "https://repro.example.com/a",
            "Reproducibility Test A",
            "TITANE research engine local index test document alpha",
            "repro.example.com",
            0,
            "repro_hash_a",
        )
        .unwrap();
        svc.index_document(
            "https://repro.example.com/b",
            "Reproducibility Test B",
            "TITANE research engine local index test document beta",
            "repro.example.com",
            0,
            "repro_hash_b",
        )
        .unwrap();

        let r1 = svc.search("TITANE research", None).unwrap();
        let r2 = svc.search("TITANE research", None).unwrap();
        let r3 = svc.search("TITANE research", None).unwrap();

        assert_eq!(r1.len(), r2.len(), "run1 != run2 count");
        assert_eq!(r2.len(), r3.len(), "run2 != run3 count");

        let urls1: Vec<&str> = r1.iter().map(|h| h.url.as_str()).collect();
        let urls2: Vec<&str> = r2.iter().map(|h| h.url.as_str()).collect();
        let urls3: Vec<&str> = r3.iter().map(|h| h.url.as_str()).collect();
        assert_eq!(urls1, urls2, "run1 urls != run2 urls");
        assert_eq!(urls2, urls3, "run2 urls != run3 urls");
    }

    // ── G_RETRIEVE_PASSAGES ───────────────────────────────────────

    #[test]
    fn g_retrieve_passages() {
        let body = "TITANE is a research engine.\nIt uses a local lexical index.\nBM25 scoring is applied.\nThis line is unrelated.";
        let passages = IndexService::retrieve_passages(body, "lexical index", 3, "https://x.com/p");
        assert!(
            !passages.is_empty(),
            "Expected passages for 'lexical index'"
        );
        assert!(passages[0].score > 0);
        let found = passages.iter().any(|p| p.passage.contains("lexical index"));
        assert!(found, "Expected passage containing 'lexical index'");
    }

    // ── G_QUERY_EMPTY ─────────────────────────────────────────────

    #[test]
    fn g_query_empty_index() {
        let sandbox = tmp_sandbox();
        let svc = open_svc(&sandbox);
        let hits = svc.search("nothing here", None).unwrap();
        assert!(hits.is_empty(), "Expected empty results on empty index");
    }
}
