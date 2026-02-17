# P3-1 ROLLBACK

If P3-1 needs to be reverted:

1) Revert commit:
   git revert <commit_sha>

2) Or restore docs (non-destructive):
   git restore -- docs

Proof pack is append-only and should not be deleted.
