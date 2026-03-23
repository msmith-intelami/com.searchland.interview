type LoginFieldProps = {
  label: string;
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
};

export function LoginField({ label, type, value, onChange }: LoginFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required
        className="w-full rounded-md border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
      />
    </label>
  );
}
