import { RotateCcw } from "lucide-react";

export function FilterBar({ from, to, onFrom, onTo, onPreset, onApply, devices, deviceId, onDevice, children }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm shadow-slate-200/50">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Período — de
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => onFrom(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          até
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => onTo(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        {devices && (
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
            Estação
            <select
              value={deviceId}
              onChange={(e) => onDevice(e.target.value)}
              className="min-w-[180px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.hostname}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPreset(24)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hoje / 24h
          </button>
          <button
            type="button"
            onClick={() => onPreset(24 * 7)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            7 dias
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => onPreset(24)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-500 hover:text-brand-600"
            title="Limpar filtros"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}