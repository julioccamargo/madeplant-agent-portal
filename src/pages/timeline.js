import { api, rangeQuery, summarizePayload } from "../api/client.js";
import { mountDateFilters } from "../components/filters.js";
import { getSelectedDeviceId, setSelectedDeviceId } from "../state/device.js";

export async function renderTimeline(main) {
  main.innerHTML = `
    <header class="page-header"><h2>Timeline</h2></header>
    <label>Estação <select id="deviceSelect"></select></label>
    <label>Tipo
      <select id="eventType">
        <option value="">(todos)</option>
        <option value="window.focus">window.focus</option>
        <option value="window.focus.end">window.focus.end</option>
        <option value="input.activity">input.activity</option>
        <option value="agent.online">agent.online</option>
      </select>
    </label>
    <div id="tlFilters"></div>
    <table id="eventsTable"><thead><tr><th>Hora</th><th>Tipo</th><th>Resumo</th></tr></thead><tbody></tbody></table>
  `;
  const devices = await api("/admin/v1/devices?tenant=lab");
  const sel = document.getElementById("deviceSelect");
  for (const d of devices.devices) {
    const o = document.createElement("option");
    o.value = d.deviceId;
    o.textContent = d.hostname;
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
    const evQ = `/admin/v1/devices/${id}/events?limit=120${document.getElementById("eventType").value ? `&eventType=${encodeURIComponent(document.getElementById("eventType").value)}` : ""}${rq ? `&${rq.slice(1)}` : ""}`;
    const events = await api(evQ);
    document.querySelector("#eventsTable tbody").innerHTML = (events.events || [])
      .map(
        (ev) =>
          `<tr><td>${new Date(ev.occurredAt).toLocaleString()}</td><td>${ev.eventType}</td><td>${summarizePayload(ev)}</td></tr>`,
      )
      .join("");
  };
  ({ from, to } = mountDateFilters(document.getElementById("tlFilters"), () => load()));
  sel.addEventListener("change", () => load());
  document.getElementById("eventType").addEventListener("change", () => load());
  await load();
}