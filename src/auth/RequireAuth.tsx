import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function RequireAuth(props: { children: ReactElement }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isReady) {
    return (
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-slate-600 shadow-[var(--shadow-soft)]">
        Checking session...
      </div>
    );
  }

  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return props.children;
}
