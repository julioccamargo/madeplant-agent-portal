import { api } from "../api/client.js";
import { setSelectedDeviceId } from "../state/device.js";
import { navigate } from "../router.js";

export async function renderStations(main) {
  main.innerHTML = `<header class="page-header"><h2>Estações monitoradas</h2></header><div id="stationsTable"></div>`;
  const data = await api("/admin/v1/devices?tenant=lab");
  const wrap = document.getElementById("stationsTable");
  if (!data.devices.length) {
    wrap.innerHTML = "<p class='muted'>Nenhum device enrollado.</p>";
    return;
  }
  const rows = data.devices
    .map(
      (d) => `<tr data-id="${d.deviceId}">
        <td>${d.hostname}</td>
        <td>${d.agentVersion || "—"}</td>
        <td>${d.lastHeartbeatAt ? new Date(d.lastHeartbeatAt).toLocaleString() : "—"}</td>
        <td><button type="button" class="linkish" data-open="${d.deviceId}">Abrir</button></td>
      </tr>`,
    )
    .join("");
  wrap.innerHTML = `<table><thead><tr><th>Host</th><th>Agent</th><th>Heartbeat</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  wrap.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSelectedDeviceId(btn.dataset.open);
      navigate("stations", btn.dataset.open);
    });
  });
}

export async function renderStationDetail(main, deviceId) {
  setSelectedDeviceId(deviceId);
  main.innerHTML = `
    <header class="page-header"><h2>Estação</h2></header>
    <p class="muted mono">${deviceId}</p>
    <ul class="bullets">
      <li><a href="#/timeline">Timeline</a></li>
      <li><a href="#/screenshots">Screenshots</a></li>
      <li><a href="#/activity">Teclado / mouse</a></li>
      <li><a href="#/reports">Relatórios e CSV</a></li>
    </ul>
  `;
}