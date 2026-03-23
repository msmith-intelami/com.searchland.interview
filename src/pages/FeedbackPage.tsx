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
        className="h-fit rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]"
      >
        <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">{editingId ? "Edit" : "New"} feedback</p>
        <div className="mt-6 space-y-4">
          <Field label="Author">
            <input
              required
              value={form.author}
              onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
              className="w-full rounded-md border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400"
              placeholder="Alicia"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-md border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400"
              placeholder="alicia@example.com"
            />
          </Field>
          <Field label="Message">
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="w-full rounded-md border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400"
              placeholder="The onboarding flow felt..."
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as FormState["status"] }))
              }
              className="w-full rounded-md border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
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
            className="rounded-md bg-emerald-600 px-5 py-3 font-semibold text-emerald-50 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
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
              className="rounded-md border border-[var(--border-strong)] px-5 py-3 text-slate-700 transition hover:bg-white"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">Feedback list</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Live records from Postgres</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-sm border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{auth.user?.email}</span>
            <span className="rounded-sm border border-[var(--border-soft)] bg-white px-4 py-2 text-sm text-slate-600">
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
            <article key={item.id} className="rounded-md border border-[var(--border-soft)] bg-white p-5 shadow-[0_18px_40px_rgba(31,58,55,0.05)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{item.author}</h3>
                    <span className="rounded-sm bg-emerald-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-800">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                </div>
                <p className="text-sm text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </div>

              <p className="mt-4 text-slate-700">{item.message}</p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteFeedback.mutate({ id: item.id })}
                  className="rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
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
      <span className="mb-2 block text-sm font-medium text-slate-700">{props.label}</span>
      {props.children}
    </label>
  );
}

function EmptyState(props: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-emerald-100 bg-emerald-50/60 p-6 text-center text-slate-500">
      {props.label}
    </div>
  );
}
