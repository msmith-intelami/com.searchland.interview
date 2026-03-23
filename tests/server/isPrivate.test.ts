import assert from "node:assert/strict";
import { mock } from "node:test";
import test from "node:test";
import type { Request, Response } from "express";
import { authService } from "../../server/services/authService.ts";
import { isPrivate } from "../../server/decorators/isPrivate.ts";

function createRequest(authorization?: string) {
  return {
    header(name: string) {
      return name === "authorization" ? authorization : undefined;
    },
  } as Request;
}

function createResponse() {
  let statusCode = 200;
  let jsonBody: unknown;

  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      jsonBody = payload;
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get jsonBody() {
      return jsonBody;
    },
  } as Response & { statusCode: number; jsonBody: unknown };
}

test("isPrivate rejects the request when the token cannot be resolved", () => {
  const descriptor = {
    value(_req: Request, _res: Response) {
      throw new Error("handler should not be called");
    },
  };

  isPrivate()(null, "handler", descriptor);

  const request = createRequest();
  const response = createResponse();

  descriptor.value(request, response);

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.jsonBody, { error: "Unauthorized" });
});

test("isPrivate attaches req.user and calls the original handler for valid tokens", () => {
  const restoreVerifyToken = mock.method(authService, "verifyToken", () => ({
    id: "7",
    email: "admin@example.com",
    name: "Admin User",
  }));

  let receivedUser: unknown;

  const descriptor = {
    value(req: Request, res: Response) {
      receivedUser = req.user;
      res.json({ ok: true });
    },
  };

  isPrivate()(null, "handler", descriptor);

  const request = createRequest("Bearer valid-token");
  const response = createResponse();

  descriptor.value(request, response);

  assert.deepEqual(receivedUser, {
    id: "7",
    email: "admin@example.com",
    name: "Admin User",
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.jsonBody, { ok: true });

  restoreVerifyToken.mock.restore();
});
