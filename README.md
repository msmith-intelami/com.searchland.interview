# Searchland Feedback App

Small full-stack interview scaffold:

- React + TypeScript + Vite frontend
- Tailwind CSS
- React Router for multi-page navigation
- Node + Express API
- Inversify controller-based REST endpoints
- Token-based user authentication
- tRPC for end-to-end typesafe procedures
- Drizzle ORM with Postgres
- Basic feedback CRUD

## Quick start

1. Copy `.env.example` to `.env`
2. Create a Postgres database matching `DATABASE_URL`
3. Install dependencies with `npm install`
4. Apply the schema with `npm run db:push` or run the SQL in `drizzle/0000_initial.sql`
5. Start both apps with `npm run dev`

Frontend runs on `http://localhost:5173`.
API runs on `http://localhost:3001`.

## Notes

- Tailwind is configured with the first-party Vite plugin.
- Set `CLIENT_ORIGIN` if the frontend runs on a different host or port.
- REST controllers live under `server/controllers`.
- Protected routes require a bearer token.
- Default demo login is `admin@example.com` / `password123` unless overridden in `.env`.
