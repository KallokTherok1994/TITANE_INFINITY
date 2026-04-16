import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function loadScript(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8');
}

describe('desktop launcher scripts', () => {
  it('discovers the latest deployment AppImage dynamically instead of hardcoding an old version', () => {
    const launcherScript = loadScript('launch-titane.sh');

    expect(launcherScript).toContain(
      'latest_deploy_appimages=("$ROOT_DIR"/deployment/latest/*.AppImage)'
    );
    expect(launcherScript).not.toContain('Titan-Stable_29.0.0_amd64.AppImage');
  });

  it('writes desktop launchers that execute the selected binary path', () => {
    const desktopScript = loadScript('scripts/update-desktop-icon.sh');

    expect(desktopScript).toContain('MAIN_EXEC="$EXEC_BASE"');
    expect(desktopScript).toContain("dpkg-query -W -f='${Version}\\n' titane-infinity");
    expect(desktopScript).toContain(
      'APP_VERSION="$(extract_installed_package_version "$BINARY_PATH")"'
    );
    expect(desktopScript).toContain('Icon=$ICON_VALUE');
    expect(desktopScript).toContain('rm -f "$DESKTOP_INSTALL_DIR/TITANE-Infinity.desktop"');
    expect(desktopScript).not.toContain('Exec=$LAUNCHER_SCRIPT');
  });

  it('makes the post-build launcher sync reuse the dynamic desktop generator', () => {
    const postBuildScript = loadScript('scripts/post-build/update-desktop-icons.sh');

    expect(postBuildScript).toContain('bash "$ROOT_DIR/scripts/update-desktop-icon.sh"');
    expect(postBuildScript).toContain(
      'SYSTEM_DESKTOP_DST1="$SYSTEM_DESKTOP_DIR/titane-infinity.desktop"'
    );
    expect(postBuildScript).toContain('sudo rm -f "$SYSTEM_DESKTOP_DIR/TITANE-Infinity.desktop"');
    expect(postBuildScript).toContain('SYSTEM_ICON_DST="$SYSTEM_ICON_DIR/titane-infinity.png"');
    expect(postBuildScript).not.toContain('SYSTEM_DESKTOP_DST2=');
    expect(postBuildScript).not.toContain('DESKTOP_SRC1=');
    expect(postBuildScript).toContain('cmp -s "$BIN_SRC" "$BIN_DST"');
  });
});
