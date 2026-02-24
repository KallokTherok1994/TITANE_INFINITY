# AUDIT_STORAGE

## Sandbox Guard
All services validate paths: no ".." traversal, no absolute paths outside sandbox.

## Data Paths
| Service          | Path                        | Content              |
|------------------|-----------------------------|----------------------|
| CacheService     | data/research/cache/        | HTTP response cache  |
| IndexService     | data/research/index/        | BM25/TF-IDF index    |
| SeedPackService  | data/research/seeds/        | JSON seed packs (P12)|
| VectorIndex      | data/research/vector/       | BLOCKED (P11.1)      |

## No User-PII Storage
Research pipeline stores only URL/content data from public web.
No user credentials, messages, or profile data stored in research paths.
