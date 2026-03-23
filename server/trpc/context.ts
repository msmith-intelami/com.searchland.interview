import type { db } from "../db/client.js";

export type Context = {
  db: typeof db;
};
