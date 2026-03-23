import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { injectable } from "inversify";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import type { AuthUser, LoginInput } from "../models/auth.js";

type AuthTokenPayload = AuthUser;

@injectable()
export class AuthService {
  public async login(input: LoginInput) {
    // Authentication is database-backed so the app can evolve beyond a demo user
    // without changing the controller or frontend contracts.
    const [userRecord] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

    if (!userRecord) {
      return null;
    }

    const matches = await compare(input.password, userRecord.passwordHash);

    if (!matches) {
      return null;
    }

    const user: AuthUser = {
      id: String(userRecord.id),
      email: userRecord.email,
      name: userRecord.name,
    };

    const token = jwt.sign(user, this.getJwtSecret(), {
      expiresIn: "12h",
    });

    return { token, user };
  }

  public verifyToken(token: string): AuthUser | null {
    try {
      // Only the fields the app actually needs are carried in the token payload.
      const payload = jwt.verify(token, this.getJwtSecret()) as AuthTokenPayload;

      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      };
    } catch {
      return null;
    }
  }

  private getJwtSecret() {
    return process.env.AUTH_JWT_SECRET ?? "change-me-in-production";
  }
}

export const authService = new AuthService();
