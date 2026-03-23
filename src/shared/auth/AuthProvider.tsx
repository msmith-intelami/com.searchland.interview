import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchAuthenticatedUser } from "../services/authApi";
import { clearStoredToken, readStoredToken, storeToken, type AuthState, type AuthUser } from "./storage";

type AuthContextValue = AuthState & {
  isReady: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ token: null, user: null });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = readStoredToken();

    if (!token) {
      setIsReady(true);
      return;
    }

    setAuthState((current) => ({ ...current, token }));
  }, []);

  useEffect(() => {
    if (!authState.token) {
      setIsReady(true);
      return;
    }

    let cancelled = false;

    void fetchAuthenticatedUser(authState.token)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setAuthState((current) => ({ ...current, user: result.user }));
        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearStoredToken();
        setAuthState({ token: null, user: null });
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authState.token]);

  function login(token: string, user: AuthUser) {
    storeToken(token);
    setAuthState({ token, user });
    setIsReady(true);
  }

  function logout() {
    clearStoredToken();
    setAuthState({ token: null, user: null });
    setIsReady(true);
  }

  return (
    <AuthContext.Provider value={{ ...authState, isReady, login, logout }}>{props.children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
