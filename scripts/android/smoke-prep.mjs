console.log('ANDROID_SMOKE_PREP');
console.log('1. corepack pnpm run android:env:check');
console.log('2. corepack pnpm run android:artifact:check');
console.log('3. adb devices');
console.log(
  '4. adb wait-for-device && adb shell getprop sys.boot_completed && adb shell pm path android'
);
console.log(
  '5. node scripts/android/install-latest-apk.mjs --dry-run   # show the preferred APK'
);
console.log(
  '6. corepack pnpm run android:install:latest              # install the preferred APK once boot-ready'
);
console.log(
  '7. Set OLLAMA_BASE_URL in the launch shell before starting Android dev/build commands'
);
console.log('8. adb shell am start -n com.titane.infinity/.MainActivity');
console.log(
  '9. Verify provider state in UI: no silent fallback, explicit success/error, LAN Ollama reachable'
);
console.log(
  '10. Verify storage path via app_data_dir-backed flows and confirm visible error if backend is unreachable'
);
console.log(
  '11. If only unsigned release APK exists, signing/deployment remains LOCAL_ONLY and BLOCKED for GitHub release'
);
