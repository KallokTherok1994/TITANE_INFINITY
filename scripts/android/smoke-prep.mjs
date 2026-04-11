console.log('ANDROID_SMOKE_PREP');
console.log('1. corepack pnpm run android:artifact:check');
console.log('2. adb devices');
console.log('3. adb install -r <debug-apk-path>');
console.log('4. adb shell am start -n com.titane.infinity/.MainActivity');
console.log('5. Set OLLAMA_BASE_URL in the launch shell before starting Android dev/build commands');
console.log('6. Verify provider state in UI: no silent fallback, explicit success/error, LAN Ollama reachable');
console.log('7. Verify storage path via app_data_dir-backed flows and confirm visible error if backend is unreachable');
console.log('8. If only unsigned release APK exists, signing/deployment remains LOCAL_ONLY and BLOCKED for GitHub release');
