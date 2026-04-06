# 03 ARTIFACT SIZE MATRIX

| artifact | size | expected? | suspicious? | probable cause | action |
|---|---:|---|---|---|---|
| TITANE-Infinity_28.0.0_amd64.AppImage | 90M | yes | no | self-contained runtime incl. GTK/WebKit libs | none |
| TITANE-Infinity_28.0.0_amd64.deb | 21M | yes | no | distro package links system deps differently | none |
| titane-infinity (ELF) | 40M | yes | low | release binary includes debug info (not stripped) | monitor |

## Checksums
- AppImage: 63ae6d3c53650d6e987cf5711906c052342b00e83e424069f6e4a30dffe9f6cf
- DEB: 4c8dff75bd537954aa70bce7d73eec626395d1cb2649c153a0e4f3c5a58992d4
- ELF: fc57a8f1d0316f587c952cb01c6530fd126bfa019543dcb1416853e452f350a9

## Internal AppImage evidence (extracted)
- usr/lib/libwebkit2gtk-4.1.so.0 ~87M
- usr/lib/libjavascriptcoregtk-4.1.so.0 ~31M
- usr/lib/libicudata.so.74 ~30M
- usr/bin/titane-infinity ~41M
- app dist payload ~8.7M

Conclusion: size is dominated by embedded Linux runtime libraries, not by front-end payload duplication.
