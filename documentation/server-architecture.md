# Server Architecture

## Goals

The server is structured to keep three concerns separate:

- transport and HTTP handling
- business logic
- persistence and integration boundaries

It also preserves the controller and decorator style requested for the interview environment.

## Main runtime path

### `server/index.ts`

This is the composition root.

Responsibilities:

- load environment configuration
- create the Express server
- wire Inversify controllers
- attach request-level auth resolution
- mount tRPC
- start the optional audit consumer

Important point:

The authenticated user is resolved once at the request boundary and stored on `req.user`. That same request state is then available to:

- REST controllers
- auth decorators
- tRPC context

## Controllers

`server/controllers` contains decorator-based REST endpoints.

They should stay thin and focus on:

- parsing request input
- translating validation failures into HTTP responses
- delegating business logic to services

Current controllers:

- `AuthController`
- `FeedbackController`

## Services

`server/services` contains application behavior.

### `AuthService`

- verifies credentials against Postgres
- signs JWTs
- verifies JWTs

### `FeedbackService`

- reads and writes the `feedback` table
- triggers audit publication after writes

### `AuditService`

- publishes audit events to RabbitMQ when audit is enabled

### `AuditConsumerService`

- subscribes to RabbitMQ
- processes audit messages
- delegates persistence to `AuditLogService`

### `AuditLogService`

- stores audit documents in MongoDB
- returns audit history for the authenticated user

## Authentication model

The shared helper in `server/auth/resolveRequestUser.ts` is the canonical auth resolver.

That is important because it prevents auth logic drift between:

- controller decorators
- REST auth endpoints
- Inversify auth provider integration
- tRPC context creation

## Data stores

### Postgres

Primary operational data:

- `users`
- `feedback`

### MongoDB

Derived audit document storage:

- processed audit events only

This split is intentional:

- Postgres remains the source of truth for transactional application data
- MongoDB stores denormalised audit documents that are convenient to query and render

## Audit toggle

The audit system is optional and controlled with:

```env
AUDIT_ENABLED=true|false
```

When disabled:

- audit publish calls become no-ops
- RabbitMQ consumer startup becomes a no-op
- MongoDB audit reads return empty results

That keeps local setup simple when message broker and document database infrastructure are not needed.
