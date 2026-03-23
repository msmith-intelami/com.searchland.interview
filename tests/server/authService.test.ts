import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import { authService } from "../../server/services/authService.ts";

test("verifyToken returns the decoded auth user for a valid JWT", () => {
  const expectedUser = {
    id: "42",
    email: "admin@example.com",
    name: "Admin User",
  };

  const token = jwt.sign(expectedUser, "change-me-in-production", {
    expiresIn: "1h",
  });

  assert.deepEqual(authService.verifyToken(token), expectedUser);
});

test("verifyToken returns null for an invalid JWT", () => {
  assert.equal(authService.verifyToken("not-a-real-token"), null);
});
