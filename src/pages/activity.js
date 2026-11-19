import { api, rangeQuery, summarizePayload } from "../api/client.js";
import { mountDateFilters } from "../components/filters.js";
import { barChart } from "../components/charts.js";
import { getSelectedDeviceId, setSelectedDeviceId } from "../state/device.js";

export async function renderActivity(main) {
  main.innerHTML = `
    <header class="page-header"><h2>Teclado / mouse</h2></header>
    <label>Estação <select id="deviceSelect"></select></label>
    <div id="actFilters"></div>
    <div class="grid-2">
      <section class="card" id="summaryCard">Carregando…</section>
      <section><h3>Buckets (eventos input.activity)</h3><div id="bucketChart"></div></section>
    </div>
    <h3>Últimos buckets</h3>
    <table id="inputTable"><thead><tr><th>Hora</th><th>Teclado</th><th>Cliques</th><th>Ativo (s)</th></tr></thead><tbody></tbody></table>
  `;
  const devices = await api("/admin/v1/devices?tenant=lab");
  const sel = document.getElementById("deviceSelect");
  for (const d of devices.devices) {
    const o = document.createElement("option");
    o.value = d.deviceId;
    o.textContent = d.hostname;
    sel.appendChild(o);
  }
  if (getSelectedDeviceId()) sel.value = getSelectedDeviceId();
  let from;
  let to;
  const load = async () => {
    const id = sel.value;
    setSelectedDeviceId(id);
    const rq = rangeQuery(from, to);
    const [summary, events] = await Promise.all([
      api(`/admin/v1/devices/${id}/activity-summary${rq}`),
      api(`/admin/v1/devices/${id}/events?limit=80&eventType=input.activity${rq ? `&${rq.slice(1)}` : ""}`),
    ]);
    document.getElementById("summaryCard").innerHTML = `
      <p>Buckets: <strong>${summary.bucketCount}</strong></p>
      <p>Teclado: <strong>${summary.keyboardEvents}</strong></p>
      <p>Cliques: <strong>${summary.mouseClicks}</strong></p>
      <p>Ativo: <strong>${summary.activeSec}s</strong> · Idle: <strong>${summary.idleSec}s</strong></p>
    `;
    const buckets = (events.events || []).slice(0, 12).map((ev) => {
      try {
        const p = typeof ev.payload === "string" ? JSON.parse(ev.payload) : ev.payload;
        return {
          label: new Date(ev.occurredAt).toLocaleTimeString(),
          keyboard: p?.keyboardEventCount ?? 0,
          clicks: p?.mouseClickCount ?? 0,
        };
      } catch {
        return { label: "?", keyboard: 0, clicks: 0 };
      }
    });
    barChart(
      document.getElementById("bucketChart"),
      buckets.map((b) => ({ processName: b.label, durationMinutes: b.keyboard + b.clicks })),
      { labelKey: "processName", valueKey: "durationMinutes", unit: " ev" },
    );
    document.querySelector("#inputTable tbody").innerHTML = (events.events || [])
      .map((ev) => {
        const parts = summarizePayload(ev).split(" · ");
        return `<tr><td>${new Date(ev.occurredAt).toLocaleString()}</td><td>${parts[0] || ""}</td><td>${parts[1] || ""}</td><td>${parts[2] || ""}</td></tr>`;
      })
      .join("");
  };
  ({ from, to } = mountDateFilters(document.getElementById("actFilters"), () => load()));
  sel.addEventListener("change", () => load());
  await load();
}