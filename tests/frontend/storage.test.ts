import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearStoredToken,
  readStoredToken,
  storeToken,
} from "../../src/shared/auth/storage.ts";

function installWindowStorageMock() {
  const values = new Map<string, string>();

  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: {
        getItem(key: string) {
          return values.has(key) ? values.get(key)! : null;
        },
        setItem(key: string, value: string) {
          values.set(key, value);
        },
        removeItem(key: string) {
          values.delete(key);
        },
      },
    },
    configurable: true,
  });
}

test("storage helpers persist and clear the auth token", () => {
  installWindowStorageMock();

  assert.equal(readStoredToken(), null);

  storeToken("session-token");
  assert.equal(readStoredToken(), "session-token");

  clearStoredToken();
  assert.equal(readStoredToken(), null);
});

test("storage helpers use the shared auth token key", () => {
  assert.equal(AUTH_TOKEN_STORAGE_KEY, "searchland.auth.token");
});
