import { NavLink, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { RequireAuth } from "./auth/RequireAuth";
import { AuditPage } from "./pages/AuditPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-slate-800",
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <header className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Searchland Interview App</p>
            <h1 className="mt-2 text-3xl font-semibold">Feedback workspace</h1>
          </div>
          <nav className="flex gap-3">
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
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
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
