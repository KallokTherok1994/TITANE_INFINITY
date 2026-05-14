/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

// ✨ Rule 13 - Build-time version constant injected by vite.config.ts define
declare const __APP_VERSION__: string;

// ✨ v34.0.13 - Build timestamp constant for SurfaceTruthBadge (stale-pages diagnostic)
declare const __BUILD_TIMESTAMP__: string;
