# Searchland Feedback App

Small full-stack interview scaffold:

- React + TypeScript + Vite frontend
- Tailwind CSS
- React Router for multi-page navigation
- Node + Express API
- Inversify controller-based REST endpoints
- Token-based user authentication with hashed passwords in Postgres
- RabbitMQ audit publishing for feedback CRUD writes
- RabbitMQ audit consumer with MongoDB document storage
- tRPC for end-to-end typesafe procedures
- Drizzle ORM with Postgres
- Basic feedback CRUD

## Quick start

1. Copy `.env.example` to `.env`
2. Create a Postgres database matching `DATABASE_URL`
3. Install dependencies with `npm install`
4. Apply the schema with `npm run db:push` or run the SQL in `drizzle/0000_initial.sql` and `drizzle/0001_users.sql`
5. Seed the initial login with `npm run db:seed-user`
6. Start both apps with `npm run dev`

Frontend runs on `http://localhost:5173`.
API runs on `http://localhost:3001`.

## Notes

- Tailwind is configured with the first-party Vite plugin.
- Set `CLIENT_ORIGIN` if the frontend runs on a different host or port.
- REST controllers live under `server/controllers`.
- Protected routes require a bearer token.
- Login users are stored in Postgres and passwords are verified against a bcrypt hash.
- The seed command uses `SEED_USER_NAME`, `SEED_USER_EMAIL`, and `SEED_USER_PASSWORD` .
- If `RABBITMQ_URL` is set, feedback create, update, and delete operations publish audit messages to the configured exchange and queue.
- If both `RABBITMQ_URL` and `MONGODB_URL` are set, the server consumes audit messages and stores them in MongoDB.
- Authenticated users can view only their own processed audit documents from the Audit page.
- Set `AUDIT_DEBUG=true` to log RabbitMQ publish/consume and Mongo persistence activity in the server console.
