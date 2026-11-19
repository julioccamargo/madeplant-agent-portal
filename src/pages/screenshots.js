import { api, headers, rangeQuery } from "../api/client.js";
import { mountDateFilters } from "../components/filters.js";
import { getSelectedDeviceId, setSelectedDeviceId } from "../state/device.js";

const apiBase = import.meta.env.VITE_API_BASE || "";

export async function renderScreenshots(main) {
  main.innerHTML = `
    <header class="page-header"><h2>Screenshots</h2></header>
    <label>Estação <select id="deviceSelect"></select></label>
    <div id="shotFilters"></div>
    <p id="shotsEmpty" class="muted" hidden>Nenhum print no período.</p>
    <div id="shots" class="shots"></div>
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
    const data = await api(`/admin/v1/devices/${id}/screenshots?limit=48${rq ? `&${rq.slice(1)}` : ""}`);
    const list = data.screenshots || [];
    const empty = document.getElementById("shotsEmpty");
    const wrap = document.getElementById("shots");
    wrap.innerHTML = "";
    empty.hidden = list.length > 0;
    for (const s of list) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = s.capturedAt;
      img.title = new Date(s.capturedAt).toLocaleString();
      const path = s.contentUrl?.startsWith("http") ? s.contentUrl : `${apiBase}${s.contentUrl}`;
      try {
        const res = await fetch(path, { headers: headers() });
        if (res.ok) img.src = URL.createObjectURL(await res.blob());
      } catch (e) {
        console.warn(e);
      }
      wrap.appendChild(img);
    }
  };
  ({ from, to } = mountDateFilters(document.getElementById("shotFilters"), () => load()));
  sel.addEventListener("change", () => load());
  await load();
}