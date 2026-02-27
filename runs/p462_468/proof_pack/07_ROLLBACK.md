]633;E;{   echo "# ROLLBACK"\x3b   echo "- If commit created: git revert <commit_sha> && git push origin MAIN"\x3b   echo "- If tag created: git tag -d <tag> && git push --delete origin <tag>"\x3b   echo "- Baseline HEAD before publication stage: ${PRE_HEAD}"\x3b } > "$PACK_DIR/07_ROLLBACK.md";c05eaf66-f80b-415d-8654-ee0b62769b90]633;C# ROLLBACK
- If commit created: git revert <commit_sha> && git push origin MAIN
- If tag created: git tag -d <tag> && git push --delete origin <tag>
- Baseline HEAD before publication stage: 989ee8ee
