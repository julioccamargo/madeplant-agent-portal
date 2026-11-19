import { useCallback, useEffect, useState } from "react";
import { Grid3x3, Monitor, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, buildRangeQuery, defaultRangeHours } from "../lib/api";
import { focusToCategorySlices, CATEGORY_META } from "../lib/categories";
import { getSelectedDeviceId, setSelectedDeviceId } from "../lib/deviceStore";
import { Card } from "../components/ui/Card";
import { KpiCard } from "../components/ui/KpiCard";
import { FilterBar } from "../components/filters/FilterBar";

function formatMinutes(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function DashboardPage() {
  const [range, setRange] = useState(() => defaultRangeHours(24));
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(getSelectedDeviceId());
  const [focus, setFocus] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const devRes = await api("/admin/v1/devices?tenant=lab");
      const list = devRes.devices || [];
      setDevices(list);
      let id = deviceId || list[0]?.deviceId;
      if (!id) {
        setLoading(false);
        return;
      }
      if (id !== deviceId) setDeviceId(id);
      setSelectedDeviceId(id);
      const rq = buildRangeQuery(range.from, range.to);
      const [f, a] = await Promise.all([
        api(`/admin/v1/devices/${id}/focus-summary${rq}`),
        api(`/admin/v1/devices/${id}/activity-summary${rq}`),
      ]);
      setFocus(f);
      setActivity(a);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId, range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  const pieData = focusToCategorySlices(focus?.apps, activity);
  const topApps = (focus?.apps || []).slice(0, 10).map((a) => ({
    name: a.processName,
    hours: Number(a.durationMinutes) / 60,
    fill: CATEGORY_META.work.color,
  }));

  const kpiApps = focus?.appCount ?? focus?.apps?.length ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Summary</h1>
        <p className="mt-1 text-sm text-slate-500">Visão consolidada — inspirada no portal legado, dados da Agent API.</p>
      </header>

      <FilterBar
        from={range.from}
        to={range.to}
        onFrom={(v) => setRange((r) => ({ ...r, from: v }))}
        onTo={(v) => setRange((r) => ({ ...r, to: v }))}
        onPreset={(h) => setRange(defaultRangeHours(h))}
        onApply={load}
        devices={devices}
        deviceId={deviceId}
        onDevice={(id) => {
          setDeviceId(id);
          setSelectedDeviceId(id);
        }}
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={Monitor} value={devices.length} label="Estações de trabalho" />
        <KpiCard icon={Grid3x3} value={kpiApps} label="Aplicações" />
        <KpiCard icon={Users} value="—" label="Pessoas (API futura)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Atividades categorizadas">
          {loading ? (
            <p className="text-sm text-slate-500">Carregando…</p>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Math.round(v / 60)} min`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Categorias reais virão do módulo de classificação; hoje: foco + ocioso da API.
          </p>
        </Card>

        <Card title="Resumo de atividade">
          {activity ? (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <dt className="text-slate-500">Teclado</dt>
              <dd className="text-xl font-semibold text-slate-900">{activity.keyboardEvents}</dd>
              <dt className="text-slate-500">Cliques</dt>
              <dd className="text-xl font-semibold text-slate-900">{activity.mouseClicks}</dd>
              <dt className="text-slate-500">Tempo ativo</dt>
              <dd className="text-xl font-semibold text-slate-900">{formatMinutes(activity.activeSec / 60)}</dd>
              <dt className="text-slate-500">Tempo ocioso</dt>
              <dd className="text-xl font-semibold text-slate-900">{formatMinutes(activity.idleSec / 60)}</dd>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">Sem dados</p>
          )}
        </Card>
      </div>

      <Card title="Top 10 aplicações mais utilizadas">
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topApps} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" unit="h" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(2)} h`, "Tempo"]} />
              <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={18}>
                {topApps.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}