import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function RequireAuth(props: { children: ReactElement }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isReady) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 text-slate-300">Checking session...</div>
    );
  }

  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return props.children;
}
