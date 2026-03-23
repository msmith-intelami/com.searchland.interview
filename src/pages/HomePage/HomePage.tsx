import { Link } from "react-router-dom";
import { IncludedList } from "./components/IncludedList";

export function HomePage() {
  return (
      <section className="grid gap-6 md:grid-cols-[1.45fr_1fr]">
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">
            Stage 1 Submission
          </p>

          <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-slate-900 md:text-2xl">
            A small, structured React + TypeScript app ready to extend in a live session.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Built with a focus on clarity, sensible structure, and real-world patterns.
            Includes a simple feedback CRUD flow wired end-to-end using tRPC, Drizzle, and Postgres,
            so we can iterate quickly during the interview without reworking foundations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
                to="/feedback"
                className="inline-flex rounded-md bg-emerald-600 px-5 py-3 font-semibold text-emerald-50 transition hover:bg-emerald-700"
            >
              Open feedback manager
            </Link>

          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
          <h3 className="text-lg font-semibold text-slate-900">Included</h3>
          <IncludedList />
        </div>
      </section>
  );
}
