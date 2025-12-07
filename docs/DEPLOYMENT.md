# Deployment Guide

## Build Process

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build:prod
```

This runs:

1. Type checking (`tsc`)
2. Linting (`eslint`)
3. Tests
4. Tauri build

## Platform-Specific Builds

### Linux

```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### macOS

```bash
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target aarch64-apple-darwin  # Apple Silicon
```

### Windows

```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

## Release Process

1. Update version in `package.json` and `Cargo.toml`
2. Update `CHANGELOG.md`
3. Commit: `git commit -m "chore: release v1.0.0"`
4. Tag: `git tag v1.0.0`
5. Push: `git push origin main --tags`

GitHub Actions will automatically:

- Run all tests
- Build for all platforms
- Create GitHub Release
- Upload artifacts

## Configuration

### Environment Variables

```bash
VITE_API_URL=https://api.example.com
RUST_LOG=info
```

### Config Files

- `config/development.toml` - Dev settings
- `config/production.toml` - Prod settings
- `config/security.toml` - Security defaults

## Monitoring

### Logs

```bash
# View logs
tail -f ~/.local/share/titane/logs/app.log

# View audit logs
tail -f ~/.local/share/titane/logs/audit.log
```

### Metrics

Available in DevTools (Ctrl+Shift+I in dev mode):

- Performance metrics
- Memory usage
- Network activity
- Security events

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
npm run clean
npm install
cargo clean
npm run build
```

### Tests Fail

```bash
# Run specific test
npm test -- Component.test.tsx
cargo test test_name -- --exact

# Debug mode
npm test -- --verbose
cargo test -- --nocapture
```

### Performance Issues

```bash
# Run benchmarks
npm run benchmark
cargo bench
```
