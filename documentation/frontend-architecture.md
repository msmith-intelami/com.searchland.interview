# Frontend Architecture

## Goals

The frontend is organised to support fast changes during collaborative sessions:

- pages are easy to find
- page-specific UI stays close to the page
- shared concerns are separated so they do not leak into every screen

## Folder structure

### `src/app`

Contains the application shell:

- global routing
- layout
- navigation

`App.tsx` is intentionally small. It composes shared providers and maps routes to page folders.

### `src/pages`

Each page is a folder:

- `PageName/PageName.tsx`
- `PageName/components/*`
- `PageName/index.ts`

This keeps page-specific UI local to the page instead of pushing everything into a generic shared component bucket too early.

Current pages:

- `HomePage`
- `LoginPage`
- `FeedbackPage`
- `AuditPage`

### `src/shared`

Contains cross-page concerns:

- `auth`
  - auth context
  - session bootstrap
  - route guarding
  - token persistence
- `api`
  - tRPC client setup
- `services`
  - frontend-side API helpers that are not page-owned

## Auth flow

1. `AuthProvider` exposes auth state to the app.
2. `useAuthSession` restores a stored token on page load.
3. The hook calls the server to resolve the current user for that token.
4. `RequireAuth` blocks protected pages until auth is ready.
5. The tRPC client reads the latest token from storage for each request.

Why this split exists:

- `AuthProvider` stays simple
- the session logic is testable and easier to reason about
- token persistence is isolated from page components

## Data flow

The frontend currently uses tRPC for the main authenticated application flow:

- feedback list/create/update/delete
- audit list
- auth session lookups

Benefits:

- type-safe procedure contracts
- less manual client-side request shaping
- shared validation expectations between frontend and server

## Why not over-share components

Shared components are useful only when reuse is real. For this scaffold, most UI is page-specific. Keeping those components inside each page folder avoids:

- accidental coupling between unrelated pages
- premature abstractions
- generic component APIs that are harder to evolve live
