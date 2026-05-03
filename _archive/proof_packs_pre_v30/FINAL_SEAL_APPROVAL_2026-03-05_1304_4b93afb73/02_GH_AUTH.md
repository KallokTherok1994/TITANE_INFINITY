# GH AUTH

```bash
$ gh --version || true
gh version 2.85.0 (2026-01-14)
https://github.com/cli/cli/releases/tag/v2.85.0

$ gh auth status || true
github.com
	✓ Logged in to github.com account KallokTherok1994 (keyring)
	- Active account: true
	- Git operations protocol: https
	- Token scopes: 'gist', 'read:org', 'repo', 'workflow'

$ gh repo view --json nameWithOwner,defaultBranchRef || true
{"defaultBranchRef":{"name":"MAIN"},"nameWithOwner":"KallokTherok1994/TITANE_INFINITY"}
```

Status: `PASS`
