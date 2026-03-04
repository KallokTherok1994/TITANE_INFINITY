# Support Bundle Export Playbook

**Purpose:** Collect sanitized logs and system state for remote troubleshooting without exposing secrets.

**Audience:** Support teams, remote debugging, incident root-cause analysis

---

## Overview

Support bundles package:
- Application logs (sanitized)
- Git state (commit, branch, status)
- System info (OS, kernel, ports)
- Configuration metadata (no secrets)

**Safety:** All tokens, API keys, credentials are **redacted** before export.

---

## Step 1: Prepare Bundle Directory

```bash
# Create unique bundle directory
BUNDLE_ID="$(date +%Y%m%d_%H%M%S)_$(whoami)"
BUNDLE_DIR="/tmp/titane_support_bundle_$BUNDLE_ID"
mkdir -p "$BUNDLE_DIR"

echo "Bundle directory: $BUNDLE_DIR"
```

---

## Step 2: Gather Logs & State

### 2a. Application Logs
```bash
# App logs directory
APP_LOG_DIR="$HOME/.local/share/titane-infinity"

if [ -d "$APP_LOG_DIR" ]; then
  cp "$APP_LOG_DIR"/*.log "$BUNDLE_DIR/" 2>/dev/null || echo "[INFO] No logs found"
  ls -lh "$APP_LOG_DIR/"/*.log 2>/dev/null | tee "$BUNDLE_DIR/app_log_manifest.txt"
else
  echo "[INFO] App logs directory not found: $APP_LOG_DIR"
fi
```

### 2b. Git State
```bash
# Capture git state (no secrets expected here)
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

git status --porcelain=v1 > "$BUNDLE_DIR/git_status.txt"
git log -10 --oneline > "$BUNDLE_DIR/git_recent.txt"
git rev-parse HEAD > "$BUNDLE_DIR/git_head.txt"
git branch --show-current > "$BUNDLE_DIR/git_branch.txt"
git remote -v > "$BUNDLE_DIR/git_remote.txt"

# Optional: last commit diff (if small)
git show --stat > "$BUNDLE_DIR/git_last_commit.txt" 2>/dev/null || true
```

### 2c. System Info
```bash
# Save system information
{
  echo "=== SYSTEM INFO ==="
  uname -a
  echo ""
  echo "=== KERNEL ==="
  uname -r
  echo ""
  echo "=== DISK USAGE ==="
  df -h
  echo ""
  echo "=== MEMORY ==="
  free -h
  echo ""
  echo "=== OPEN PORTS ==="
  netstat -ltn 2>/dev/null | head -20 || ss -ltn | head -20
} > "$BUNDLE_DIR/system_info.txt"
```

### 2d. Process State
```bash
# Capture running processes
ps aux | grep -E "titane|Titan" > "$BUNDLE_DIR/ps_titane.txt" || true

# Check for dev servers (debugging aid)
{
  echo "=== PORTS POSSIBLY IN USE ==="
  netstat -ltn 2>/dev/null | grep -E "5173|3000|8080|9000" || echo "[INFO] No dev ports detected"
} > "$BUNDLE_DIR/dev_ports_check.txt"
```

---

## Step 3: Sanitize (Remove Secrets)

```bash
# Remove any tokens/keys (whitelist approach)
for f in "$BUNDLE_DIR"/*; do
  if [ -f "$f" ]; then
    # Redact environment variables that look like tokens
    sed -i 's/GO_FOR_PROD_[^ ]*=[^ ]*/[REDACTED_TOKEN]/g' "$f"
    sed -i 's/\(GITHUB_TOKEN\|API[_KEY]*\|SECRET\)[^ ]*=[^ ]*/\1=[REDACTED]/g' "$f"
    sed -i 's/password=[^ ]*/password=[REDACTED]/G' "$f"
  fi
done

echo "✓ Sanitization complete"
```

---

## Step 4: Compress & Export

```bash
# Create tarball
BUNDLE_FILE="$BUNDLE_DIR.tar.gz"
tar czf "$BUNDLE_FILE" "$BUNDLE_DIR" 2>/dev/null

# Report
echo "✓ Bundle created: $BUNDLE_FILE"
echo "  Size: $(du -h "$BUNDLE_FILE" | awk '{print $1}')"
echo "  Files: $(tar tzf "$BUNDLE_FILE" | wc -l)"

# Optional: Create SHA256 checksum
sha256sum "$BUNDLE_FILE" > "${BUNDLE_FILE}.sha256"
cat "${BUNDLE_FILE}.sha256"
```

---

## Step 5: Transfer to Support Portal

```bash
# Upload instructions (example for common tools)

# Option A: scp
# scp "$BUNDLE_FILE" support@example.com:/incoming/

# Option B: curl with multipart upload
# curl -F "bundle=@$BUNDLE_FILE" https://support.example.com/upload

# Option C: AWS S3 (if configured)
# aws s3 cp "$BUNDLE_FILE" s3://support-buckets/

# Option D: GitHub issue attachment (if <25MB)
# (attach via web UI)

echo "Bundle ready for transfer: $BUNDLE_FILE"
```

---

## Complete Automated Script

Save as `export_support_bundle.sh`:

```bash
#!/bin/bash
set -e

BUNDLE_ID="$(date +%Y%m%d_%H%M%S)_$(whoami)"
BUNDLE_DIR="/tmp/titane_support_bundle_$BUNDLE_ID"
mkdir -p "$BUNDLE_DIR"

echo "Gathering support bundle..."

# Logs
APP_LOG_DIR="$HOME/.local/share/titane-infinity"
[ -d "$APP_LOG_DIR" ] && cp "$APP_LOG_DIR"/*.log "$BUNDLE_DIR/" 2>/dev/null || true

# Git
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git status --porcelain=v1 > "$BUNDLE_DIR/git_status.txt"
git log -10 --oneline > "$BUNDLE_DIR/git_recent.txt"
git rev-parse HEAD > "$BUNDLE_DIR/git_head.txt"

# System
{
  uname -a
  echo ""
  df -h
  echo ""
  netstat -ltn | head -20 || ss -ltn | head -20
} > "$BUNDLE_DIR/system_info.txt"

# Process
ps aux | grep -E "titane|Titan" > "$BUNDLE_DIR/ps_titane.txt" 2>/dev/null || true

echo "Sanitizing..."
for f in "$BUNDLE_DIR"/*; do
  [ -f "$f" ] && sed -i 's/GO_FOR_PROD[^ ]*=[^ ]*/[REDACTED]/g' "$f"
done

# Compress
BUNDLE_FILE="$BUNDLE_DIR.tar.gz"
tar czf "$BUNDLE_FILE" "$BUNDLE_DIR"
sha256sum "$BUNDLE_FILE" > "${BUNDLE_FILE}.sha256"

echo "✓ Bundle: $BUNDLE_FILE"
cat "${BUNDLE_FILE}.sha256"
```

**Usage:**
```bash
chmod +x export_support_bundle.sh
./export_support_bundle.sh
```

---

## Verification Checklist

Before sending bundle:

- [ ] Tar file created and compressed
- [ ] No plaintext tokens/passwords visible (`grep -r "GO_FOR_PROD" $BUNDLE_DIR || echo OK`)
- [ ] Checksum generated
- [ ] Size reasonable (<50MB recommended)
- [ ] All files readable

```bash
# Quick verify
tar tzf support_bundle_*.tar.gz | head -20
grep -r "GO_FOR_PROD\|GITHUB_TOKEN" /tmp/titane_support_bundle_* || echo "✓ No exposed secrets"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission denied on logs | Run with appropriate permissions or use `sudo` |
| Logs directory doesn't exist | App may not have run; create with `mkdir -p` |
| Bundle too large | Limit `git log` to `-5` entries, compress more aggressively |
| Transfer fails | Verify network, try `--retry` flags or alternate upload method |

---

## On-Call Reference

**For support teams:**
1. Ask user to run `./export_support_bundle.sh`
2. User uploads resulting `.tar.gz` + `.sha256`
3. Verify checksum: `sha256sum -c *.sha256`
4. Extract and review: `tar xzf *.tar.gz && ls -la`
5. Analyze logs, identify root cause

**Privacy Note:** Bundles are sanitized but may contain audit/config info. Handle per your data policy.

---

**Last Updated:** 2026-02-17  
**Version:** 1.0
