import { useCallback, useEffect, useState } from "react";
import { api, buildRangeQuery, defaultRangeHours, headers, summarizePayload } from "../lib/api";
import { getSelectedDeviceId, setSelectedDeviceId } from "../lib/deviceStore";
import { Card } from "../components/ui/Card";
import { FilterBar } from "../components/filters/FilterBar";

const apiBase = import.meta.env.VITE_API_BASE || "";

function useDeviceData(loader) {
  const [range, setRange] = useState(() => defaultRangeHours(24));
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(getSelectedDeviceId());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const devRes = await api("/admin/v1/devices?tenant=lab");
      const list = devRes.devices || [];
      setDevices(list);
      const id = deviceId || list[0]?.deviceId;
      if (!id) return;
      if (id !== deviceId) setDeviceId(id);
      setSelectedDeviceId(id);
      const rq = buildRangeQuery(range.from, range.to);
      setData(await loader(id, rq));
    } catch (e) {
      setError(e.message);
    }
    // loader estável por página; não incluir em deps para evitar loop
  }, [deviceId, range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  return { range, setRange, devices, deviceId, setDeviceId, data, error, load };
}

function PageFrame({ title, children, hooks }) {
  const { range, setRange, devices, deviceId, setDeviceId, error, load } = hooks;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <FilterBar
        from={range.from}
        to={range.to}
        onFrom={(v) => setRange((r) => ({ ...r, from: v }))}
        onTo={(v) => setRange((r) => ({ ...r, to: v }))}
        onPreset={(h) => setRange(defaultRangeHours(h))}
        onApply={load}
        devices={devices}
        deviceId={deviceId}
        onDevice={setDeviceId}
      />
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {children}
    </div>
  );
}

export function StationsPage() {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/admin/v1/devices?tenant=lab")
      .then((d) => setDevices(d.devices || []))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Estações</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-3 pr-4">Host</th>
                <th className="pb-3 pr-4">Agent</th>
                <th className="pb-3">Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d) => (
                <tr key={d.deviceId} className="text-slate-700">
                  <td className="py-3 pr-4 font-medium">{d.hostname}</td>
                  <td className="py-3 pr-4">{d.agentVersion || "—"}</td>
                  <td className="py-3">{d.lastHeartbeatAt ? new Date(d.lastHeartbeatAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function TimelinePage() {
  const hooks = useDeviceData(async (id, rq) => {
    const q = `/admin/v1/devices/${id}/events?limit=100${rq ? `&${rq.slice(1)}` : ""}`;
    return api(q);
  });
  const events = hooks.data?.events || [];

  return (
    <PageFrame title="Timeline" hooks={hooks}>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-2 text-left">Hora</th>
                <th className="pb-2 text-left">Tipo</th>
                <th className="pb-2 text-left">Resumo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((ev) => (
                <tr key={ev.id || `${ev.occurredAt}-${ev.eventType}`}>
                  <td className="py-2 pr-3 whitespace-nowrap text-slate-600">
                    {new Date(ev.occurredAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-brand-700">{ev.eventType}</td>
                  <td className="py-2 text-slate-700">{summarizePayload(ev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageFrame>
  );
}

export function ReportsPage() {
  const hooks = useDeviceData(async (id, rq) => api(`/admin/v1/devices/${id}/focus-summary${rq}`));
  const apps = hooks.data?.apps || [];

  return (
    <PageFrame title="Relatórios" hooks={hooks}>
      <Card title="Tempo por aplicativo">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="pb-2 text-left">App</th>
              <th className="pb-2 text-left">Min</th>
              <th className="pb-2 text-left">Trechos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apps.map((a) => (
              <tr key={a.processName}>
                <td className="py-2">{a.processName}</td>
                <td className="py-2">{a.durationMinutes}</td>
                <td className="py-2">{a.focusSegments ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageFrame>
  );
}

export function ActivityPage() {
  const hooks = useDeviceData(async (id, rq) => api(`/admin/v1/devices/${id}/activity-summary${rq}`));
  const a = hooks.data;

  return (
    <PageFrame title="Teclado / mouse" hooks={hooks}>
      <Card>
        {a ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Buckets", a.bucketCount],
              ["Teclado", a.keyboardEvents],
              ["Cliques", a.mouseClicks],
              ["Ativo (s)", a.activeSec],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{l}</p>
                <p className="text-2xl font-semibold text-slate-900">{v}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Sem dados</p>
        )}
      </Card>
    </PageFrame>
  );
}

export function ScreenshotsPage() {
  const hooks = useDeviceData(async (id, rq) =>
    api(`/admin/v1/devices/${id}/screenshots?limit=24${rq ? `&${rq.slice(1)}` : ""}`),
  );
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const list = hooks.data?.screenshots || [];
    if (!list.length) {
      setUrls([]);
      return undefined;
    }
    (async () => {
      const out = [];
      for (const s of list) {
        const path = s.contentUrl?.startsWith("http") ? s.contentUrl : `${apiBase}${s.contentUrl}`;
        try {
          const res = await fetch(path, { headers: headers() });
          if (res.ok) out.push({ src: URL.createObjectURL(await res.blob()), at: s.capturedAt });
        } catch {
          /* skip */
        }
      }
      if (!cancelled) setUrls(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [hooks.data]);

  return (
    <PageFrame title="Screenshots" hooks={hooks}>
      <Card>
        {urls.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum print no período.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {urls.map((u) => (
              <img
                key={u.src}
                src={u.src}
                alt={u.at}
                title={new Date(u.at).toLocaleString()}
                className="rounded-xl border border-slate-200 shadow-sm"
              />
            ))}
          </div>
        )}
      </Card>
    </PageFrame>
  );
}