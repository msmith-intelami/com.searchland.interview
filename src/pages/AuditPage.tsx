import { useAuth } from "../auth/AuthProvider";
import { trpc } from "../main";

export function AuditPage() {
  const auth = useAuth();
  const auditQuery = trpc.audit.listMine.useQuery();

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Audit trail</p>
          <h2 className="mt-2 text-2xl font-semibold">Your processed audit events</h2>
        </div>
        <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">{auth.user?.email}</span>
      </div>

      <div className="mt-6 space-y-4">
        {auditQuery.isLoading ? <AuditEmpty label="Loading audit events..." /> : null}
        {auditQuery.isError ? <AuditEmpty label="Failed to load audit events." /> : null}
        {!auditQuery.isLoading && !auditQuery.isError && (auditQuery.data?.length ?? 0) === 0 ? (
          <AuditEmpty label="No processed audit events yet. Create, update, or delete feedback to generate some." />
        ) : null}

        {auditQuery.data?.map((event) => (
          <article key={`${event.routingKey}-${event.entityId}-${event.timestamp}`} className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{event.action}</h3>
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
                    {event.entity} #{event.entityId}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Actor: {event.actor?.email ?? "unknown"}</p>
              </div>
              <p className="text-sm text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
            </div>

            <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              {JSON.stringify(event.metadata ?? {}, null, 2)}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}

function AuditEmpty(props: { label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-slate-400">
      {props.label}
    </div>
  );
}
