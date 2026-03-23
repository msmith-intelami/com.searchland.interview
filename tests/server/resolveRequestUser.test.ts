import assert from "node:assert/strict";
import { mock } from "node:test";
import test from "node:test";
import type { Request } from "express";
import { getBearerToken, resolveRequestUser } from "../../server/auth/resolveRequestUser.ts";
import { authService } from "../../server/services/authService.ts";

function createRequest(authorization?: string) {
  return {
    header(name: string) {
      return name === "authorization" ? authorization : undefined;
    },
  } as Request;
}

test("getBearerToken returns null when the authorization header is missing", () => {
  assert.equal(getBearerToken(createRequest()), null);
});

test("getBearerToken returns the bearer token value", () => {
  assert.equal(getBearerToken(createRequest("Bearer abc123")), "abc123");
});

test("resolveRequestUser returns null when no bearer token is present", () => {
  assert.equal(resolveRequestUser(createRequest()), null);
});

test("resolveRequestUser delegates token verification to AuthService", () => {
  let receivedToken: string | null = null;

  const restoreVerifyToken = mock.method(authService, "verifyToken", (token: string) => {
    receivedToken = token;
    return {
      id: "99",
      email: "admin@example.com",
      name: "Admin User",
    };
  });

  const result = resolveRequestUser(createRequest("Bearer signed-token"));

  assert.equal(receivedToken, "signed-token");
  assert.deepEqual(result, {
    id: "99",
    email: "admin@example.com",
    name: "Admin User",
  });

  restoreVerifyToken.mock.restore();
});
