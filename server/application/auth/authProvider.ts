import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { interfaces } from "inversify-express-utils";
import { getBearerToken } from "../../shared/auth/token.js";
import { authService } from "../services/authService.js";
import type { AuthUser } from "../../domain/models/auth.js";

@injectable()
export class AppAuthProvider implements interfaces.AuthProvider {
  public async getUser(req: Request, _res: Response, _next: NextFunction): Promise<interfaces.Principal<AuthUser | null>> {
    const token = getBearerToken(req);
    const user = token ? authService.verifyToken(token) : null;

    return {
      details: user,
      isAuthenticated: async () => user !== null,
      isInRole: async (_role: string) => false,
      isResourceOwner: async (_resourceId: unknown) => false,
    };
  }
}
