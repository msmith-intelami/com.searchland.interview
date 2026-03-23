export const AUTH_TOKEN_STORAGE_KEY = "searchland.auth.token";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

export function readStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function storeToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
