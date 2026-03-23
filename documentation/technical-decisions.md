# Technical Decisions

## Why both controllers and tRPC exist

This codebase intentionally supports both:

- decorator-based REST controllers
- tRPC procedures

Reason:

- the controller layer demonstrates the preferred backend style for extension
- tRPC gives the frontend a fast, typed integration path

This is a pragmatic interview tradeoff rather than a pure minimalism decision.

## Why auth is centralised

Token parsing and verification were centralised into one helper so that all server entry points use the same rules.

Without that, drift becomes likely:

- one path may accept a token format another rejects
- one path may attach different user data
- bugs become harder to diagnose because behavior changes by transport

## Why the audit system is optional

RabbitMQ and MongoDB are useful for demonstrating asynchronous integration patterns, but they are not required for the core CRUD workflow.

Making the audit system opt-in provides two benefits:

1. The app remains runnable with only Postgres.
2. Developers can enable the full event pipeline when they actually need to exercise it.

## Why audit data hides internal record ids

Audit output is meant to communicate domain-relevant changes to users and developers without leaking internal relational identifiers into the UI.

That keeps the audit view cleaner and avoids teaching the frontend to depend on implementation details of the primary database.

## Why page folders own local components

This frontend structure was chosen because the app is small and evolving.

It is easier to maintain when:

- page-specific components are co-located with the page
- shared code is reserved for truly cross-cutting concerns

This avoids the common failure mode where a `components/` folder becomes a grab-bag of unrelated UI with unclear ownership.
