import type { AuthUser } from "../domain/models/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
    }
  }
}

export {};
