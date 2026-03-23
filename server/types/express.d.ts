import type { AuthUser } from "../models/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
    }
  }
}

export {};
