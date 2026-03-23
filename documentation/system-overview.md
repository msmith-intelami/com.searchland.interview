# System Overview

## Purpose

This application is a small full-stack scaffold for live product and engineering sessions. It is designed to be easy to extend quickly while still demonstrating production-style patterns:

- React frontend with clear page-level boundaries
- Node/Express server with decorator-based controllers
- tRPC for typed browser-to-server calls
- Postgres for core relational data
- optional RabbitMQ plus MongoDB for audit processing

## High-level flow

1. A user signs in from the frontend.
2. The server validates the credentials against the `users` table in Postgres.
3. The browser stores the returned JWT.
4. Protected frontend pages call tRPC with that token.
5. The server resolves the authenticated user once per request.
6. Feedback CRUD operations read and write Postgres through the `FeedbackService`.
7. If audit is enabled, feedback writes also publish audit messages to RabbitMQ.
8. A background consumer reads those messages and stores processed audit documents in MongoDB.
9. The frontend audit page loads only the current user's stored audit documents.

## Current runtime boundaries

### Frontend

- `src/app`
  - app shell and routing
- `src/pages`
  - page folders and page-specific components
- `src/shared`
  - auth, API client setup, and cross-page services

### Server

- `server/controllers`
  - HTTP controllers using decorators
- `server/services`
  - business logic and infrastructure orchestration
- `server/db`
  - Postgres and MongoDB connection helpers and schema
- `server/trpc`
  - typed procedures used by the frontend
- `server/auth`, `server/decorators`, `server/inversify`
  - request authentication and controller wiring

## Modes of operation

### Base mode

With only Postgres running, the application still supports:

- login
- feedback create, read, update, delete
- protected frontend routes

This is controlled by:

```env
AUDIT_ENABLED=false
```

### Full audit mode

With RabbitMQ and MongoDB running, the application also supports:

- audit event publishing
- background audit processing
- persisted per-user audit history

This is controlled by:

```env
AUDIT_ENABLED=true
```
