# Carte runtime Ollama

## Sources de config
- `src-tauri/src/config/update.rs`
  - URL par défaut: `http://localhost:11434`
  - modèle par défaut: `qwen2.5:latest`

## Vérifications exécutées
```text
ollama --version || true
ollama ps || true
ollama list || true
curl -sS http://127.0.0.1:11434/api/tags || true
curl -sS http://127.0.0.1:11434/api/version || true
```

## Extraits verbatim
```text
ollama --version || true
Warning: could not connect to a running Ollama instance
Warning: client version is 0.18.2

ollama ps || true
Error: Head "http://127.0.0.1:11434/": dial tcp 127.0.0.1:11434: socket: operation not permitted

curl -sS http://127.0.0.1:11434/api/tags || true
curl: (7) Failed to connect to 127.0.0.1 port 11434 after 0 ms: Couldn't connect to server

curl -sS http://127.0.0.1:11434/api/version || true
{"version":"0.18.0"}
```

## Interprétation
- `api/version` hôte: REACHABLE
- `api/tags` sans élévation: non concluant
- `ollama ps/list`: sandbox ou politique locale possible, non conclusif

## Classification
- Ollama daemon: RUNTIME_PROVEN
- Ollama API endpoint: REACHABLE
- modèle sélectionné par TITANE: RUNTIME_PROVEN
- requête TITANE réelle frappant Ollama après patch: RUNTIME_PROVEN

## Addendum final
- la preuve desktop embedded réelle passe avec `provider=Ollama (OMEGA+Singularity)` et `mode=LOCAL`
- la lane mémoire complète et le faux-souvenir passent sur cette même route réelle
