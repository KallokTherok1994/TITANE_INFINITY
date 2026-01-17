// Allows editor/typecheck to resolve "@/test-utils" even when tests are excluded
// from the main tsconfig program (inferred projects won't use tsconfig paths).

declare module '@/test-utils' {
  export * from '../test-utils';
}
