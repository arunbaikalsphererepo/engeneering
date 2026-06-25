interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function Field({ label, error, children, fullWidth }: FieldProps) {
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <label className="block mb-1.5">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
          {error && <span className="ml-2 text-red-500 normal-case font-medium tracking-normal">{error}</span>}
        </span>
        <div className="mt-1">{children}</div>
      </label>
    </div>
  );
}
