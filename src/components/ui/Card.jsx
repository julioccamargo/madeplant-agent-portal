export function Card({ title, children, className = "", action }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm shadow-slate-200/60 ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}