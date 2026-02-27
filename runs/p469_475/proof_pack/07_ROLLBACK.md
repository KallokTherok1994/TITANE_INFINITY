]633;E;{   echo '# ROLLBACK'\x3b   echo '- git revert <commit_sha> && git push origin MAIN'\x3b   echo '- if tag: git tag -d <tag> && git push --delete origin <tag>'\x3b } > "$PACK_DIR/07_ROLLBACK.md";e99512ee-eb41-47ad-ba70-e987d0e9646e]633;C# ROLLBACK
- git revert <commit_sha> && git push origin MAIN
- if tag: git tag -d <tag> && git push --delete origin <tag>
