import type * as express from "express";
import { inject } from "inversify";
import { controller, httpGet, httpPost, interfaces } from "inversify-express-utils";
import { getBearerToken } from "../auth/resolveRequestUser.js";
import { loginInputSchema } from "../models/auth.js";
import { AuthService } from "../services/authService.js";

@controller("/auth")
export class AuthController implements interfaces.Controller {
  public constructor(@inject(AuthService) private readonly authService: AuthService) {}

  @httpPost("/login")
  public async login(req: express.Request, res: express.Response): Promise<void> {
    const parsed = loginInputSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const result = await this.authService.login(parsed.data);

    if (!result) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    res.json(result);
  }

  @httpGet("/me")
  public async me(req: express.Request, res: express.Response): Promise<void> {
    const token = getBearerToken(req);

    if (!token) {
      res.status(401).json({ error: "Missing bearer token." });
      return;
    }

    const user = this.authService.verifyToken(token);

    if (!user) {
      res.status(401).json({ error: "Invalid or expired token." });
      return;
    }

    res.json({ user });
  }
}
