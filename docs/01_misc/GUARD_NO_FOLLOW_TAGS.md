# GUARD: Never push tags with --follow-tags

Allowed patterns:
- git push origin <branch>
- git push origin <tagname>
- git push origin HEAD

FORBIDDEN:
- git push --follow-tags
- git push -u --follow-tags

If unintended tag appears on remote:
1. STOP all operations
2. Delete remote tag: git push origin :refs/tags/<tagname>
3. Fetch/prune: git fetch --tags --prune
4. Verify deletion: git ls-remote --tags origin | grep <tagname>
5. Append incident to registry (append-only only)
6. Document guard violation
