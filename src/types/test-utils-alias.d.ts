// Allows editor/typecheck to resolve "@/test-utils" even when tests are excluded
// from the main tsconfig program (any: any).

declare module '@/test-utils' {
  export * from '../test-utils';
}
