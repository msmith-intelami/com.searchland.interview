import type { db } from "../../infrastructure/persistence/postgres.js";
import type { AuthUser } from "../../domain/models/auth.js";

export type Context = {
  db: typeof db;
  user: AuthUser | null;
};
