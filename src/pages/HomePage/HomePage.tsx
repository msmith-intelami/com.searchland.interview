import { Link } from "react-router-dom";
import { IncludedList } from "./components/IncludedList";

export function HomePage() {
  return (
    <section className="grid gap-6 md:grid-cols-[1.45fr_1fr]">
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
        <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">Searchland Style</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
          Clean, bright product surfaces with confident green accents and soft editorial spacing.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          This is intentionally small but complete, so you can add features quickly during a live session without
          reworking the foundations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/feedback"
            className="inline-flex rounded-md bg-emerald-600 px-5 py-3 font-semibold text-emerald-50 transition hover:bg-emerald-700"
          >
            Open feedback manager
          </Link>
          <div className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800">
            Searchland-inspired theme applied
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
        <h3 className="text-lg font-semibold text-slate-900">Included</h3>
        <IncludedList />
      </div>
    </section>
  );
}
