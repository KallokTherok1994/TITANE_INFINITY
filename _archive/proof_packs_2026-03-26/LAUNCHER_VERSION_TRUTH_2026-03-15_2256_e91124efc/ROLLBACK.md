# ROLLBACK

If this launcher truth fix must be reverted:

git restore -- scripts/update-desktop-icon.sh titane-infinity.desktop scripts/autoheal/autoheal_rules.jsonl
rm -f ~/.local/share/applications/titane-infinity.desktop ~/.local/share/applications/TITANE-Infinity.desktop

Then regenerate local desktop entries from the previous repo state if needed:

bash scripts/update-desktop-icon.sh
