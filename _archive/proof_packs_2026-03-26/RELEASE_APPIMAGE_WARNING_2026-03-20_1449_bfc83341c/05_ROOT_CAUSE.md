# 05 ROOT CAUSE

The warning is channel-level advisory from GitHub push for a large binary object, not a build failure.

Technical size driver is expected AppImage self-contained packaging:
- bundled desktop runtime libs (webkit/jscore/icu)
- embedded application binary
- relatively small frontend dist payload

No proven packaging-bloat defect requiring immediate code/config change.
