# V70 Rollback

If the GitHub release must be reverted:

1. Delete the GitHub release:
   - gh release delete v27.2.0-v69-sealed-20260313 --repo KallokTherok1994/TITANE_INFINITY --yes
2. Delete the remote tag:
   - git push origin :refs/tags/v27.2.0-v69-sealed-20260313
3. Delete the local tag:
   - git tag -d v27.2.0-v69-sealed-20260313
4. If needed, revert the proof-pack commit on MAIN with a normal revert commit:
   - git revert <release-proof-commit>

Constraints:
- No history rewrite required.
- Artifacts in deployment/latest remain unchanged by rollback.
