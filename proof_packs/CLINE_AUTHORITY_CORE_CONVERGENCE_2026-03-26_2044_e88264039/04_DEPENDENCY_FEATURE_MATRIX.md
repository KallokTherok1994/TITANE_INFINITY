# DEPENDENCY AND FEATURE TRIAGE MATRIX

## package.json — Production Dependencies

| Item | Role | Used by Core? | Recommendation |
|---|---|---|---|
| react, react-dom | UI framework | YES | KEEP |
| react-router-dom | Routing | YES | KEEP |
| zustand | State management | YES | KEEP |
| @tauri-apps/api | Tauri IPC | YES | KEEP |
| @tauri-apps/plugin-* | Tauri plugins | YES | KEEP |
| framer-motion | Animations | YES | KEEP |
| zod | Validation | YES | KEEP |
| react-markdown, remark-gfm | Markdown rendering | YES | KEEP |
| sonner | Toast notifications | YES | KEEP |
| lucide-react | Icons | YES | KEEP |
| date-fns | Date utilities | YES | KEEP |
| dompurify | Sanitization | YES | KEEP |
| eventemitter3 | Events | YES | KEEP |
| clsx | Class names | YES | KEEP |
| react-i18next, i18next | Internationalization | YES | KEEP |
| recharts | Charts | UNKNOWN | REVIEW_REQUIRED |
| three, @types/three | 3D graphics | LABS (Quantum/Aura) | FEATURE_FLAG |
| @xenova/transformers | ML inference | UNKNOWN | REVIEW_REQUIRED |
| better-sqlite3 | SQLite frontend | UNKNOWN (Rust has rusqlite) | REVIEW_REQUIRED |
| react-chrono | Timeline | LABS (TimePage) | KEEP |
| react-d3-tree | Tree viz | LABS (Memory) | KEEP |
| web-vitals | Perf metrics | YES | KEEP |

## Cargo.toml — Key Dependencies

| Item | Role | Used by Core? | Recommendation |
|---|---|---|---|
| tauri 2.0 | Desktop runtime | YES | KEEP |
| tokio 1.35 | Async runtime | YES | KEEP |
| serde, serde_json | Serialization | YES | KEEP |
| reqwest 0.11 | HTTP client | YES | KEEP |
| rusqlite 0.37 | SQLite backend | YES | KEEP |
| hnsw_rs 0.3 | Vector index | YES (Memory OS) | KEEP |
| tantivy 0.22 | BM25 lexical index | UNKNOWN | REVIEW_REQUIRED |
| cpal 0.15 | Audio capture | UNKNOWN (optional) | FEATURE_FLAG |
| ort 2.0 | ONNX Runtime | UNKNOWN (optional) | FEATURE_FLAG |
| image 0.25 | Image processing | UNKNOWN | REVIEW_REQUIRED |
| ndarray 0.17 | Numerical arrays | UNKNOWN | REVIEW_REQUIRED |
| rustfft 6.2 | FFT spectral | UNKNOWN (voice?) | REVIEW_REQUIRED |
| ed25519-dalek 2.1 | Crypto signing | UNKNOWN | REVIEW_REQUIRED |
| instant-distance 0.6 | Vector distance | UNKNOWN | REVIEW_REQUIRED |

## Cargo.toml — Features

| Feature | Description | Default? | Recommendation |
|---|---|---|---|
| custom-protocol | Tauri protocol | YES (default) | KEEP |
| mock | Mock backend mode | YES (default) | KEEP |
| full | Full backend mode | NO | KEEP |
| ollama | Ollama integration | NO | KEEP |
| audio-capture | Real-time audio (cpal) | NO | KEEP (optional) |
| onnx | ONNX Runtime (ort) | NO | KEEP (optional) |

## Summary

- Core dependencies: well-defined, KEEP
- Labs dependencies (three, @xenova/transformers): FEATURE_FLAG or LAZY
- Unknown dependencies (tantivy, ndarray, rustfft, ed25519-dalek, instant-distance): REVIEW_REQUIRED
- Default features are conservative (custom-protocol + mock only): GOOD