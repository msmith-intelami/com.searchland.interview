import { useAuth } from "../../shared/auth/AuthProvider";
import { trpc } from "../../shared/api/trpc";
import { AuditEmpty } from "./components/AuditEmpty";

export function AuditPage() {
  const auth = useAuth();
  const auditQuery = trpc.audit.listMine.useQuery();

  return (
    <section className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">Audit trail</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your processed audit events</h2>
        </div>
        <span className="rounded-sm border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {auth.user?.email}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {auditQuery.isLoading ? <AuditEmpty label="Loading audit events..." /> : null}
        {auditQuery.isError ? <AuditEmpty label="Failed to load audit events." /> : null}
        {!auditQuery.isLoading && !auditQuery.isError && (auditQuery.data?.length ?? 0) === 0 ? (
          <AuditEmpty label="No processed audit events yet. Create, update, or delete feedback to generate some." />
        ) : null}

        {auditQuery.data?.map((event) => (
          <article
            key={`${event.routingKey}-${event.entityId}-${event.timestamp}`}
            className="rounded-md border border-[var(--border-soft)] bg-white p-5 shadow-[0_18px_40px_rgba(31,58,55,0.05)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{event.action}</h3>
                  <span className="rounded-sm bg-emerald-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-800">
                    {event.entity} #{event.entityId}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Actor: {event.actor?.email ?? "unknown"}</p>
              </div>
              <p className="text-sm text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
            </div>

            <pre className="mt-4 overflow-x-auto rounded-md border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-slate-700">
              {JSON.stringify(event.metadata ?? {}, null, 2)}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
