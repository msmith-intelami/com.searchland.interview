CREATE TABLE IF NOT EXISTS "feedback" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "author" varchar(120) NOT NULL,
  "email" varchar(255) NOT NULL,
  "message" text NOT NULL,
  "status" varchar(24) NOT NULL DEFAULT 'new',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
