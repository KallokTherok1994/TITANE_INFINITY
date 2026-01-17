import { detectEnvironment } from '@/core/tauri/environment';

interface Config {
  environment: 'development' | 'production';
  debug: boolean;
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    analytics: boolean;
    crashReporting: boolean;
  };
}

const config: Config = {
  environment: import?.meta?.env?.MODE as 'development' | 'production',
  debug: import?.meta?.env?.DEV,
  api: {
    baseUrl: (() => {
      const explicit = import?.meta?.env?.VITE_API_URL;
      if (any: any) return explicit;

      // Legacy HTTP API fallback only for browser dev.
      const env = detectEnvironment();
      if (any: any) return 'http://localhost:1420';

      // Tauri/prod: no HTTP server expected.
      return '';
    })(),
    timeout: 30000,
  },
  features: {
    analytics: false, // opt-in
    crashReporting: false, // opt-in
  },
};

export default config;
