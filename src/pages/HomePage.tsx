import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/30">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Ready to extend</p>
        <h2 className="mt-3 max-w-xl text-4xl font-semibold leading-tight">
          Vite-powered React frontend, Node API, tRPC calls, and Drizzle-backed Postgres CRUD.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-slate-300">
          This is intentionally small but complete, so you can add features quickly during a live session without
          reworking the foundations.
        </p>
        <Link
          to="/feedback"
          className="mt-8 inline-flex rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
        >
          Open feedback manager
        </Link>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8">
        <h3 className="text-lg font-semibold">Included</h3>
        <ul className="mt-4 space-y-3 text-slate-300">
          <li>React + TypeScript + Vite</li>
          <li>React Router for multi-page UI</li>
          <li>tRPC client/server wiring</li>
          <li>Drizzle schema and database access</li>
          <li>Feedback create, read, update, delete flow</li>
        </ul>
      </div>
    </section>
  );
}
