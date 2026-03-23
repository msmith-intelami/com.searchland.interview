type EmptyStateProps = {
  label: string;
};

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-emerald-100 bg-emerald-50/60 p-6 text-center text-slate-500">
      {label}
    </div>
  );
}
