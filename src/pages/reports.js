import { api, rangeQuery, summarizePayload } from "../api/client.js";
import { mountDateFilters } from "../components/filters.js";
import { getSelectedDeviceId, setSelectedDeviceId } from "../state/device.js";

let lastFocusRows = [];

export async function renderReports(main) {
  main.innerHTML = `
    <header class="page-header"><h2>Relatórios</h2></header>
    <label>Estação <select id="deviceSelect"></select></label>
    <div id="reportFilters"></div>
    <button type="button" id="exportFocusCsv">Exportar CSV (foco)</button>
    <table id="focusTable"><thead><tr><th>App</th><th>Min</th><th>Trechos</th></tr></thead><tbody></tbody></table>
    <p id="focusMeta" class="meta"></p>
    <h3>Timeline (amostra)</h3>
    <table id="eventsTable"><thead><tr><th>Hora</th><th>Tipo</th><th>Resumo</th></tr></thead><tbody></tbody></table>
  `;
  const devices = await api("/admin/v1/devices?tenant=lab");
  const sel = document.getElementById("deviceSelect");
  for (const d of devices.devices) {
    const o = document.createElement("option");
    o.value = d.deviceId;
    o.textContent = `${d.hostname} (v${d.agentVersion || "?"})`;
    sel.appendChild(o);
  }
  const stored = getSelectedDeviceId();
  if (stored) sel.value = stored;
  let from;
  let to;
  const load = async () => {
    const id = sel.value;
    setSelectedDeviceId(id);
    const rq = rangeQuery(from, to);
    const [focus, events] = await Promise.all([
      api(`/admin/v1/devices/${id}/focus-summary${rq}`),
      api(`/admin/v1/devices/${id}/events?limit=80${rq ? `&${rq.slice(1)}` : ""}`),
    ]);
    lastFocusRows = focus.apps || [];
    const tbody = document.querySelector("#focusTable tbody");
    tbody.innerHTML = lastFocusRows.length
      ? lastFocusRows
          .map(
            (a) => `<tr><td>${a.processName}</td><td>${a.durationMinutes}</td><td>${a.focusSegments ?? "—"}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="3">(sem dados)</td></tr>`;
    document.getElementById("focusMeta").textContent = `Fonte: ${focus.source || "—"} · Total: ${focus.totalDurationMinutes ?? "—"} min`;
    const evBody = document.querySelector("#eventsTable tbody");
    evBody.innerHTML = (events.events || [])
      .map(
        (ev) =>
          `<tr><td>${new Date(ev.occurredAt).toLocaleString()}</td><td>${ev.eventType}</td><td>${summarizePayload(ev)}</td></tr>`,
      )
      .join("");
  };
  ({ from, to } = mountDateFilters(document.getElementById("reportFilters"), () => load()));
  sel.addEventListener("change", () => load());
  document.getElementById("exportFocusCsv").onclick = () => {
    if (!lastFocusRows.length) return;
    const lines = ["processName,durationMinutes,focusSegments"];
    for (const a of lastFocusRows) lines.push(`${JSON.stringify(a.processName)},${a.durationMinutes},${a.focusSegments ?? ""}`);
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `focus-${sel.value}.csv`;
    a.click();
  };
  await load();
}