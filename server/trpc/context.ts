import type { db } from "../db/client.js";
import type { AuthUser } from "../models/auth.js";

export type Context = {
  db: typeof db;
  user: AuthUser | null;
};
