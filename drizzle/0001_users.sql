CREATE TABLE IF NOT EXISTS "users" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(120) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
