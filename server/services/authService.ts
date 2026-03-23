import jwt from "jsonwebtoken";
import { injectable } from "inversify";
import type { AuthUser, LoginInput } from "../models/auth.js";

type AuthTokenPayload = AuthUser;

const DEFAULT_USER = {
  id: "demo-user",
  email: "admin@example.com",
  name: "Demo Admin",
  password: "password123",
};

@injectable()
export class AuthService {
  public login(input: LoginInput) {
    const configuredUser = this.getConfiguredUser();

    if (input.email !== configuredUser.email || input.password !== configuredUser.password) {
      return null;
    }

    const user: AuthUser = {
      id: configuredUser.id,
      email: configuredUser.email,
      name: configuredUser.name,
    };

    const token = jwt.sign(user, this.getJwtSecret(), {
      expiresIn: "12h",
    });

    return { token, user };
  }

  public verifyToken(token: string): AuthUser | null {
    try {
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

  private getConfiguredUser() {
    return {
      id: process.env.AUTH_USER_ID ?? DEFAULT_USER.id,
      email: process.env.AUTH_USER_EMAIL ?? DEFAULT_USER.email,
      name: process.env.AUTH_USER_NAME ?? DEFAULT_USER.name,
      password: process.env.AUTH_USER_PASSWORD ?? DEFAULT_USER.password,
    };
  }

  private getJwtSecret() {
    return process.env.AUTH_JWT_SECRET ?? "change-me-in-production";
  }
}

export const authService = new AuthService();
