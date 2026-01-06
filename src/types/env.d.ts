/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_PROVIDER_READINESS_POLLING_ENABLED?: string;
  readonly DEV?: boolean;
  readonly MODE?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
