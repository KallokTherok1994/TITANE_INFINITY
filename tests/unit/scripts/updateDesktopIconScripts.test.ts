import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const updateDesktopIconScript = fs.readFileSync(
  path.join(rootDir, 'scripts/update-desktop-icon.sh'),
  'utf8'
);
const postBuildDesktopIconsScript = fs.readFileSync(
  path.join(rootDir, 'scripts/post-build/update-desktop-icons.sh'),
  'utf8'
);

describe('desktop icon refresh scripts', () => {
  it('publishes multiple icon resolutions for local and system launchers', () => {
    expect(updateDesktopIconScript).toContain('ICON_RESOLUTIONS=(128 256 512)');
    expect(updateDesktopIconScript).toContain(
      'copy_icon_resolution "$LOCAL_ICON_ROOT" "$resolution"'
    );
    expect(updateDesktopIconScript).toContain(
      'sync_system_icon_resolution "$resolution"'
    );
  });

  it('preserves the invoking user home when the launcher is regenerated under sudo', () => {
    expect(updateDesktopIconScript).toContain(
      'TARGET_USER_HOME="$(resolve_target_user_home)"'
    );
    expect(updateDesktopIconScript).toContain('getent passwd "$SUDO_USER" | cut -d: -f6');
    expect(updateDesktopIconScript).toContain('mkdir -p "$TARGET_CONFIG_DIR/logs"');
    expect(updateDesktopIconScript).toContain(
      'Exec=gnome-terminal -- tail -f $TARGET_CONFIG_DIR/logs/titane.log'
    );
    expect(updateDesktopIconScript).toContain('Exec=xdg-open $TARGET_CONFIG_DIR/');
  });

  it('refreshes the post-build system icons with gtk-update-icon-cache', () => {
    expect(postBuildDesktopIconsScript).toContain('ICON_RESOLUTIONS=(128 256 512)');
    expect(postBuildDesktopIconsScript).toContain(
      'install_system_icon_resolution "$resolution"'
    );
    expect(postBuildDesktopIconsScript).toContain(
      'run_with_root_if_available gtk-update-icon-cache -f -t /usr/share/icons/hicolor'
    );
    expect(postBuildDesktopIconsScript).not.toContain('update-icon-caches');
  });
});
