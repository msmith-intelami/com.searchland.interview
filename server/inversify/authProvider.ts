import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { interfaces } from "inversify-express-utils";
import { resolveRequestUser } from "../auth/resolveRequestUser.js";
import type { AuthUser } from "../models/auth.js";

@injectable()
export class AppAuthProvider implements interfaces.AuthProvider {
  public async getUser(req: Request, _res: Response, _next: NextFunction): Promise<interfaces.Principal<AuthUser | null>> {
    const user = resolveRequestUser(req);

    return {
      details: user,
      isAuthenticated: async () => user !== null,
      isInRole: async (_role: string) => false,
      isResourceOwner: async (_resourceId: unknown) => false,
    };
  }
}
