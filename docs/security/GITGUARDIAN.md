# GitGuardian Integration Guide

## Overview

TITANE∞ uses GitGuardian to scan for secrets, API keys, and credentials in the codebase. This helps prevent accidental exposure of sensitive information.

## Features

- ✅ **Pre-commit scanning**: Blocks commits containing secrets
- ✅ **CI/CD scanning**: Automated scans on push, pull request, and daily schedule
- ✅ **350+ secret types**: Detects various API keys, tokens, passwords, and credentials
- ✅ **Custom configuration**: Tailored ignore patterns for TITANE∞
- ✅ **Zero-config defaults**: Works out of the box with sensible defaults

## Setup

### 1. GitHub Secrets Configuration

For the CI/CD workflow to work, you need to add a GitGuardian API key to your GitHub repository secrets:

1. Get a GitGuardian API key:
   - Sign up at https://dashboard.gitguardian.com/
   - Navigate to API > Personal Access Tokens
   - Create a new token with `scan` scope

2. Add to GitHub repository:
   - Go to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `GITGUARDIAN_API_KEY`
   - Value: Your GitGuardian API token

### 2. Local Development Setup

Install GitGuardian CLI (ggshield):

```bash
# Using pip (recommended)
pip install ggshield

# Or using pipx (isolated installation)
pipx install ggshield

# Verify installation
ggshield --version
```

### 3. Authentication (Optional for Local)

For local development, you can optionally configure GitGuardian authentication:

```bash
# Set API key as environment variable
export GITGUARDIAN_API_KEY="your-api-key-here"

# Or login interactively
ggshield auth login
```

**Note:** Local scanning works without authentication but with reduced features.

## Usage

### Pre-commit Hook

GitGuardian automatically runs on every commit via the pre-commit hook:

```bash
# Normal commit (GitGuardian runs automatically)
git commit -m "feat: add new feature"

# Skip GitGuardian scan (NOT RECOMMENDED)
COPILOT_XS_SKIP_GITGUARDIAN=1 git commit -m "feat: add new feature"
```

### Manual Scanning

Run GitGuardian scan manually:

```bash
# Scan staged files (pre-commit)
pnpm run copilot-xs:gitguardian

# Or using ggshield directly
ggshield secret scan pre-commit

# Scan specific files
ggshield secret scan path /path/to/file.ts

# Scan entire repository
ggshield secret scan repo .

# Scan commit range
ggshield secret scan commit-range HEAD~10..HEAD
```

### CI/CD Workflow

The GitGuardian workflow runs automatically:

- **On push**: Scans new commits to MAIN, main, dev, stable-runtime branches
- **On pull request**: Scans changes in PRs to MAIN, main branches
- **Daily**: Full repository scan at 4 AM UTC
- **Manual**: Can be triggered via workflow_dispatch

View workflow results in the "Actions" tab on GitHub.

## Configuration

### .gitguardian.yml

The repository includes a `.gitguardian.yml` configuration file with:

- **Ignored paths**: node_modules/, dist/, target/, lock files, etc.
- **Excluded files**: .env.example, test fixtures, etc.
- **Scan settings**: Sensible defaults for TITANE∞

Edit `.gitguardian.yml` to customize:

```yaml
# Add custom ignore patterns
paths-ignore:
  - custom/path/to/ignore/

# Add specific files to exclude
exclude:
  - path/to/specific/file.ts
```

### Environment Variables

Control GitGuardian behavior with environment variables:

- `GITGUARDIAN_API_KEY`: API key for authentication (required for CI/CD)
- `COPILOT_XS_SKIP_GITGUARDIAN`: Set to `1` to skip pre-commit scan
- `GITGUARDIAN_CONFIG`: Path to custom config file (default: `.gitguardian.yml`)

## Handling False Positives

If GitGuardian flags a false positive:

### Option 1: Use Ignore Comments

Add a comment to ignore specific lines:

```typescript
// ggignore: example or test data
const fakeApiKey = "not-a-real-key-just-an-example";
```

### Option 2: Add to .gitguardian.yml

Add the file or path to exclude list:

```yaml
exclude:
  - path/to/file/with/false/positive.ts
```

### Option 3: Use Allowlist

For specific detector bypasses, configure in `.gitguardian.yml`:

```yaml
# Disable specific detectors
detectors:
  - name: Generic Password
    enabled: false
```

## Best Practices

1. **Never commit real secrets**: Use environment variables
2. **Use .env.example**: Template files for configuration
3. **Rotate exposed secrets immediately**: If a secret is detected
4. **Review scan results**: Don't blindly skip GitGuardian warnings
5. **Keep ggshield updated**: `pip install --upgrade ggshield`

## Troubleshooting

### "ggshield not found"

Install ggshield:
```bash
pip install ggshield
# or
pip3 install --user ggshield
```

### "Authentication failed"

Check your GITGUARDIAN_API_KEY:
```bash
# Test authentication
ggshield auth status

# Re-authenticate
ggshield auth login
```

### "Scan taking too long"

Optimize `.gitguardian.yml` by adding more ignore patterns for large directories.

### "False positive blocking commit"

Temporarily bypass (use sparingly):
```bash
COPILOT_XS_SKIP_GITGUARDIAN=1 git commit -m "your message"
```

Then address the false positive properly using methods above.

## CI/CD Workflow Details

The `.github/workflows/gitguardian.yml` workflow:

- **Timeout**: 15 minutes
- **Permissions**: contents:read, security-events:write, issues:write
- **Full history**: Fetches complete git history for comprehensive scanning
- **Summary report**: Adds scan results to GitHub Actions summary

## Integration with Other Security Tools

GitGuardian complements existing TITANE∞ security tools:

- **CodeQL**: Code security analysis (`.github/workflows/codeql.yml`)
- **pnpm audit**: NPM dependency vulnerabilities (`security-scan.js`)
- **cargo-audit**: Rust dependency vulnerabilities (`security-scan.js`)
- **COPILOT-XS validation**: Repository-specific rules (`validate.js`)

All security tools run in parallel for comprehensive protection.

## Resources

- [GitGuardian Documentation](https://docs.gitguardian.com/)
- [ggshield CLI Reference](https://docs.gitguardian.com/ggshield-docs/reference)
- [GitGuardian GitHub Action](https://github.com/GitGuardian/ggshield-action)
- [Secret Detection Guide](https://docs.gitguardian.com/internal-repositories-monitoring/secrets-detection/detectors)

## Support

- **Issues**: Report in GitHub Issues with `security` label
- **Questions**: Refer to GitGuardian documentation
- **Escalation**: Contact repository maintainers for TITANE∞-specific questions

---

**Last Updated**: 2026-01-13  
**TITANE∞ Version**: v26.3.0
