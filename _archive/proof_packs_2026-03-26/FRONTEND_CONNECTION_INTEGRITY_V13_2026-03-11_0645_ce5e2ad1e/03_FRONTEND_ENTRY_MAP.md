# 03 Frontend Entry Map

Entrypoint chain:

1. `index.html` bootstraps frontend.
2. `src/main.tsx` initializes Tauri protection modules and renders `<App />`.
3. `src/App.tsx` provides providers, router, shell, and route graph.

Proof:

- `raw/07_entry_chain_main.txt`
