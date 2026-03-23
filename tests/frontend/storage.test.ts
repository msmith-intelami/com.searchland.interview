import { describe, expect, it } from "vitest";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearStoredToken,
  readStoredToken,
  storeToken,
} from "../../src/shared/auth/storage";

describe("storage", () => {
  it("persists and clears the auth token", () => {
    window.localStorage.clear();

    expect(readStoredToken()).toBeNull();

    storeToken("session-token");
    expect(readStoredToken()).toBe("session-token");

    clearStoredToken();
    expect(readStoredToken()).toBeNull();
  });

  it("uses the shared auth token storage key", () => {
    expect(AUTH_TOKEN_STORAGE_KEY).toBe("searchland.auth.token");
  });
});
