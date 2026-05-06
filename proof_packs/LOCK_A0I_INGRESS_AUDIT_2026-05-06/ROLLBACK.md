# ROLLBACK — Lock A0I
# Date: 2026-05-06

## Rollback Procedure

This lock only adds docs and updates the program status file. No runtime code touched.

```bash
# Revert A0I commit
git revert HEAD

# Or restore individual files
git restore docs/roadmap/A0_INGRESS_AUDIT.md
git restore docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
```

## Impact of Rollback

- Program status loses v6 column additions (minor)
- A0I ingress audit record removed (minor — can be recreated)
- No runtime impact
- No validator regression (A0I adds no validator gates)
