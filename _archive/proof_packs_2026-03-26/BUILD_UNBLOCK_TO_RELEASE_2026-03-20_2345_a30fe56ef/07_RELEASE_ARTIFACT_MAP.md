# 07 RELEASE ARTIFACT MAP

## Artifact inventory

| File                                     | SHA256                                                           |
| ---------------------------------------- | ---------------------------------------------------------------- |
| src-tauri/target/release/titane-infinity | 663f577bdef212309f490db7937b8e97d145a600c0e9f1c8f4e24a2f6f5a1702 |
| TITANE-Infinity_28.5.0_amd64.AppImage    | f8bb16668ad1ef26f3ce2e8019f7df7c2e197b111f7e3c1794d90ef2f9178781 |
| TITANE-Infinity_28.5.0_amd64.deb         | fce01999a344714c15d56fabdbda4054461125088edf32143441591b6eda5d9a |
| TITANE-Infinity-28.5.0-1.x86_64.rpm      | e806eccbd5116853eb13633e760522fd9ab4ee616313986858b6a1693ff37ff3 |

## Verification command

sha256sum -c RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt
Result: all 4 artifacts → "Réussi" (OK)

## Version coherence in filenames

All artifacts contain "28.5.0" in filename — coherent with tauri.conf.json + Cargo.toml + CHANGELOG

G_RELEASE_ARTIFACTS_READY=PASS
G_CHECKSUMS_READY=PASS
