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
  environment: import.meta.env.MODE as 'development' | 'production',
  debug: import.meta.env.DEV,
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:1420',
    timeout: 30000,
  },
  features: {
    analytics: false, // opt-in
    crashReporting: false, // opt-in
  },
};

export default config;
