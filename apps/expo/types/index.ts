// ToonNotes shared type definitions.
//
// These types now live in the shared @toonnotes/types package so the expo app
// and the web apps cannot drift apart. This file re-exports them so the app's
// existing `@/types` import path keeps working unchanged.
//
// Add or change domain types in packages/types/src/index.ts, not here.
export * from '@toonnotes/types';
