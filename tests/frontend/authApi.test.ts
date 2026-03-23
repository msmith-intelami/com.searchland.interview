import assert from "node:assert/strict";
import { mock } from "node:test";
import test from "node:test";
import { fetchAuthenticatedUser, loginWithPassword } from "../../src/shared/services/authApi.ts";

test("loginWithPassword posts credentials to the auth login endpoint", async () => {
  const restoreFetch = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "http://localhost:3001/auth/login");
    assert.equal(init?.method, "POST");
    assert.deepEqual(init?.headers, {
      "content-type": "application/json",
    });
    assert.equal(init?.body, JSON.stringify({ email: "admin@example.com", password: "password123" }));

    return new Response(
      JSON.stringify({
        token: "jwt-token",
        user: {
          id: "1",
          email: "admin@example.com",
          name: "Admin User",
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });

  const result = await loginWithPassword({
    email: "admin@example.com",
    password: "password123",
  });

  assert.deepEqual(result, {
    token: "jwt-token",
    user: {
      id: "1",
      email: "admin@example.com",
      name: "Admin User",
    },
  });

  restoreFetch.mock.restore();
});

test("fetchAuthenticatedUser sends the bearer token to the auth me endpoint", async () => {
  const restoreFetch = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "http://localhost:3001/auth/me");
    assert.deepEqual(init?.headers, {
      authorization: "Bearer session-token",
    });

    return new Response(
      JSON.stringify({
        user: {
          id: "1",
          email: "admin@example.com",
          name: "Admin User",
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });

  const result = await fetchAuthenticatedUser("session-token");

  assert.deepEqual(result, {
    user: {
      id: "1",
      email: "admin@example.com",
      name: "Admin User",
    },
  });

  restoreFetch.mock.restore();
});
