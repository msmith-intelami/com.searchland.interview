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
  // Centralising token extraction and verification prevents controller decorators,
  // auth endpoints, and tRPC context creation from drifting apart over time.
  const token = getBearerToken(request);
  return token ? authService.verifyToken(token) : null;
}
