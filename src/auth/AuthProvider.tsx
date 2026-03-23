import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { clearStoredToken, readStoredToken, storeToken, type AuthState, type AuthUser } from "../lib/auth";
import { trpc } from "../main";

type AuthContextValue = AuthState & {
  isReady: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ token: null, user: null });
  const [isReady, setIsReady] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(authState.token),
    retry: false,
  });

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

    if (meQuery.data?.user) {
      setAuthState((current) => ({ ...current, user: meQuery.data.user }));
      setIsReady(true);
      return;
    }

    if (meQuery.isError) {
      clearStoredToken();
      setAuthState({ token: null, user: null });
      setIsReady(true);
    }
  }, [authState.token, meQuery.data, meQuery.isError]);

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
