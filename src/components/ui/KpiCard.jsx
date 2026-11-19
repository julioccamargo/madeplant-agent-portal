export function KpiCard({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-white px-6 py-5 text-center shadow-sm shadow-slate-200/50">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}