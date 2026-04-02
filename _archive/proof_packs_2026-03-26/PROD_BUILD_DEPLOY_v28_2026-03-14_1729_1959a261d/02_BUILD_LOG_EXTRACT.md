# BUILD LOG EXTRACT

## Étapes clés

```
> pnpm run build:production
lint: PASS (eslint src/)
format:check: PASS (All matched files use Prettier code style!)
ollama:bundle: PASS
  ✓ Bundled Ollama SHA256: b128a368ebcfd35c16df4a3c3d7ea7d20340479f737148565f7d2a0db3c3db59
  ✓ Ollama bundled at: src-tauri/resources/ollama/ollama

vite v7.3.1 building client environment for production...
✓ 3458 modules transformed.
[...brotli compressed...]

   Compiling titane-infinity v27.2.0 (src-tauri)
   Finished `release` profile [optimized] target(s) in 5m 51s

    Bundling TITANE-Infinity_27.2.0_amd64.deb
    Bundling TITANE-Infinity-27.2.0-1.x86_64.rpm
    Bundling TITANE-Infinity_27.2.0_amd64.AppImage
    Finished 3 bundles at:
        src-tauri/target/release/bundle/deb/TITANE-Infinity_27.2.0_amd64.deb
        src-tauri/target/release/bundle/rpm/TITANE-Infinity-27.2.0-1.x86_64.rpm
        src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.2.0_amd64.AppImage

✅ Post-Build terminé
```

## Sortie complète

Log complet archivé dans: /tmp/prod_build_log.txt (490 lignes)
