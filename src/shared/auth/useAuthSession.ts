import { useEffect, useState } from "react";
import { fetchAuthenticatedUser } from "../services/authApi";
import { clearStoredToken, readStoredToken, storeToken, type AuthState, type AuthUser } from "./storage";

type AuthSessionState = AuthState & {
  isReady: boolean;
};

function getInitialAuthSessionState(): AuthSessionState {
  const token = readStoredToken();

  return {
    token,
    user: null,
    isReady: token === null,
  };
}

export function useAuthSession() {
  const [authState, setAuthState] = useState<AuthSessionState>(getInitialAuthSessionState);

  useEffect(() => {
    if (!authState.token) {
      setAuthState((current) => (current.isReady ? current : { ...current, isReady: true }));
      return;
    }

    let cancelled = false;

    void fetchAuthenticatedUser(authState.token)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setAuthState((current) => ({
          ...current,
          user: result.user,
          isReady: true,
        }));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearStoredToken();
        setAuthState({
          token: null,
          user: null,
          isReady: true,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authState.token]);

  function login(token: string, user: AuthUser) {
    storeToken(token);
    setAuthState({
      token,
      user,
      isReady: true,
    });
  }

  function logout() {
    clearStoredToken();
    setAuthState({
      token: null,
      user: null,
      isReady: true,
    });
  }

  return {
    ...authState,
    login,
    logout,
  };
}
