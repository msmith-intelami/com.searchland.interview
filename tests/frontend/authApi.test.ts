import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAuthenticatedUser, loginWithPassword } from "../../src/shared/services/authApi";

describe("authApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts credentials to the auth login endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          token: "jwt-token",
          user: {
            id: "1",
            email: "admin@example.com",
            name: "Admin User",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await loginWithPassword({
      email: "admin@example.com",
      password: "password123",
    });

    expect(globalThis.fetch).toHaveBeenCalledWith("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "admin@example.com", password: "password123" }),
    });

    expect(result).toEqual({
      token: "jwt-token",
      user: {
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
      },
    });
  });

  it("sends the bearer token to the auth me endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: "1",
            email: "admin@example.com",
            name: "Admin User",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await fetchAuthenticatedUser("session-token");

    expect(globalThis.fetch).toHaveBeenCalledWith("http://localhost:3001/auth/me", {
      headers: {
        authorization: "Bearer session-token",
      },
    });

    expect(result).toEqual({
      user: {
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
      },
    });
  });
});
