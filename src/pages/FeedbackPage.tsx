import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { trpc } from "../main";

type FormState = {
  author: string;
  email: string;
  message: string;
  status: "new" | "reviewed";
};

const emptyForm: FormState = {
  author: "",
  email: "",
  message: "",
  status: "new",
};

export function FeedbackPage() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const feedbackQuery = trpc.feedback.list.useQuery();
  const createFeedback = trpc.feedback.create.useMutation({
    onSuccess: async () => {
      setForm(emptyForm);
      await utils.feedback.list.invalidate();
    },
  });
  const updateFeedback = trpc.feedback.update.useMutation({
    onSuccess: async () => {
      setEditingId(null);
      setForm(emptyForm);
      await utils.feedback.list.invalidate();
    },
  });
  const deleteFeedback = trpc.feedback.delete.useMutation({
    onSuccess: async () => {
      await utils.feedback.list.invalidate();
    },
  });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const sortedFeedback = [...(feedbackQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const isSaving = createFeedback.isPending || updateFeedback.isPending;

  const submitLabel = editingId ? "Update feedback" : "Create feedback";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      updateFeedback.mutate({ id: editingId, ...form });
      return;
    }

    createFeedback.mutate(form);
  }

  function startEdit(item: {
    id: number;
    author: string;
    email: string;
    message: string;
    status: string;
  }) {
    setEditingId(item.id);
    setForm({
      author: item.author,
      email: item.email,
      message: item.message,
      status: item.status === "reviewed" ? "reviewed" : "new",
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{editingId ? "Edit" : "New"} feedback</p>
        <div className="mt-6 space-y-4">
          <Field label="Author">
            <input
              required
              value={form.author}
              onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500"
              placeholder="Alicia"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500"
              placeholder="alicia@example.com"
            />
          </Field>
          <Field label="Message">
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500"
              placeholder="The onboarding flow felt..."
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as FormState["status"] }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            >
              <option value="new">new</option>
              <option value="reviewed">reviewed</option>
            </select>
          </Field>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-900"
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-full border border-white/10 px-5 py-3 text-slate-200 transition hover:bg-slate-800"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Feedback list</p>
            <h2 className="mt-2 text-2xl font-semibold">Live records from Postgres</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">{auth.user?.email}</span>
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
              {sortedFeedback.length} items
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {feedbackQuery.isLoading ? <EmptyState label="Loading feedback..." /> : null}
          {feedbackQuery.isError ? <EmptyState label="Failed to load feedback." /> : null}
          {!feedbackQuery.isLoading && !feedbackQuery.isError && sortedFeedback.length === 0 ? (
            <EmptyState label="No feedback yet. Create the first record from the form." />
          ) : null}

          {sortedFeedback.map((item) => (
            <article key={item.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{item.author}</h3>
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{item.email}</p>
                </div>
                <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>

              <p className="mt-4 text-slate-200">{item.message}</p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteFeedback.mutate({ id: item.id })}
                  className="rounded-full border border-rose-400/30 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-950/40"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field(props: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{props.label}</span>
      {props.children}
    </label>
  );
}

function EmptyState(props: { label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-slate-400">
      {props.label}
    </div>
  );
}
