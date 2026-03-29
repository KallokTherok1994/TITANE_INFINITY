# Drift Capture

Groups captured:

- GROUP 1 (Direct seal authority): package.json, src-tauri/Cargo.toml, src-tauri/tauri.conf.json, titane-infinity.desktop
  - Captured in: package.diff, raw_diff_main.txt
- GROUP 2 (Tracked frontend): src/**
  - Captured in: src.diff, raw_diff_main.txt
- GROUP 3 (Tracked backend/runtime): src-tauri/src/** and src-tauri/tests/**
  - Captured in: src-tauri.diff, raw_diff_main.txt
- GROUP 4 (Governance/tooling/docs): docs/**, .github/**, scripts/**, .clinerules/**
  - Captured in: governance_and_tooling.diff, raw_diff_main.txt
- GROUP 5 (Untracked files): inventories in untracked_files.txt

Long outputs stored as files listed above.
