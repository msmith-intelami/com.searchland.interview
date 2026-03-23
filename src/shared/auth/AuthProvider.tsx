import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { AuthState, AuthUser } from "./storage";
import { useAuthSession } from "./useAuthSession";

type AuthContextValue = AuthState & {
  isReady: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  // The provider is deliberately thin: session bootstrap and token persistence
  // live in a hook so the context stays focused on dependency injection for React.
  const authSession = useAuthSession();

  return <AuthContext.Provider value={authSession}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
