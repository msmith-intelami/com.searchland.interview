import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { loginWithPassword } from "../lib/authApi";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginWithPassword({ email, password });
      auth.login(result.token, result.user);
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/feedback";
      navigate(redirectTo, { replace: true });
    } catch {
      setError("Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
      <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">Authentication</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">Sign in</h2>
      <p className="mt-3 text-slate-600">Use the configured app credentials to access protected feedback routes.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            className="w-full rounded-md border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            className="w-full rounded-md border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-emerald-600 px-5 py-3 font-semibold text-emerald-50 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}
