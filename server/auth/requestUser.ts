import type { Request } from "express";
import type { AuthUser } from "../models/auth.js";

export function getRequestUser(request: Request): AuthUser {
  if (!request.user) {
    throw new Error("Authenticated user is missing from the request.");
  }

  return request.user;
}
