# ROOT CAUSE — MERMAID_HASH_REGISTRY.json

## Catégorie

- C3 — Hash instable (normalisation absente)

## Preuves

- `B_verify_drift_head.txt` montre que le script utilisait `sha256sum` brut sans normalisation CRLF/LF, et écrivait un JSON non garanti deterministe.
- `B_registry_full.txt` montre des entrées avec timestamp généré, donc modification possible à chaque mise a jour.
- `B_sources_sha256sum.txt` confirme les hashes actuels mais ne garantit pas la stabilite inter-plateforme.

## Verdict

Process bug. La procedure etait non deterministe et pouvait modifier le registry sans changement semantique reel.

## Action

- Nouvelle source de verite deterministe: `scripts/verify/mermaid-hash-registry.sh`.
- Normalisation des contenus avant hash.
- Append-only via `history[]`.
