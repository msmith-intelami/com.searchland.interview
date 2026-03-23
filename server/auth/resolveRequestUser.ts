import type { Request } from "express";
import { authService } from "../services/authService.js";

export function getBearerToken(request: Request) {
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export function resolveRequestUser(request: Request) {
  const token = getBearerToken(request);
  return token ? authService.verifyToken(token) : null;
}
