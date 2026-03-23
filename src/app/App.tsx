import { NavLink, Route, Routes } from "react-router-dom";
import { AuditPage } from "../pages/AuditPage";
import { FeedbackPage } from "../pages/FeedbackPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { AuthProvider, useAuth } from "../shared/auth/AuthProvider";
import { RequireAuth } from "../shared/auth/RequireAuth";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-emerald-600 text-emerald-50 shadow-[0_16px_32px_rgba(21,164,111,0.22)]"
      : "text-slate-600 hover:bg-white/80 hover:text-slate-900",
  ].join(" ");

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(120,214,178,0.22),_transparent_32%),linear-gradient(180deg,_#f7fcf7_0%,_#eef8f1_52%,_#fbfdf8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="mb-10 flex flex-col gap-6 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">Searchland Interview App</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Feedback workspace</h1>
          </div>
          <nav className="flex flex-wrap gap-3">
            <NavLink to="/" className={navClassName} end>
              Home
            </NavLink>
            {auth.token ? (
              <>
                <NavLink to="/feedback" className={navClassName}>
                  Feedback
                </NavLink>
                <NavLink to="/audit" className={navClassName}>
                  Audit
                </NavLink>
                <button
                  type="button"
                  onClick={auth.logout}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/80 hover:text-slate-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navClassName}>
                Login
              </NavLink>
            )}
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/feedback"
              element={
                <RequireAuth>
                  <FeedbackPage />
                </RequireAuth>
              }
            />
            <Route
              path="/audit"
              element={
                <RequireAuth>
                  <AuditPage />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
