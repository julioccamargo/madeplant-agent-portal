import { api, rangeQuery } from "../api/client.js";
import { mountDateFilters } from "../components/filters.js";
import { barChart } from "../components/charts.js";
import { getSelectedDeviceId, setSelectedDeviceId } from "../state/device.js";

export async function renderDashboard(main) {
  main.innerHTML = `
    <header class="page-header"><h2>Summary</h2></header>
    <div id="dashFilters"></div>
    <div class="grid-2">
      <section><h3>Tempo por aplicativo</h3><div id="dashFocus"></div></section>
      <section><h3>Atividade agregada</h3><div id="dashActivity"></div></section>
    </div>
  `;
  let from;
  let to;
  const load = async () => {
    let deviceId = getSelectedDeviceId();
    if (!deviceId) {
      const devices = await api("/admin/v1/devices?tenant=lab");
      deviceId = devices.devices[0]?.deviceId;
      if (deviceId) setSelectedDeviceId(deviceId);
    }
    if (!deviceId) {
      document.getElementById("dashFocus").innerHTML = "<p class='muted'>Nenhuma estação.</p>";
      return;
    }
    const rq = rangeQuery(from, to);
    const [focus, activity] = await Promise.all([
      api(`/admin/v1/devices/${deviceId}/focus-summary${rq}`),
      api(`/admin/v1/devices/${deviceId}/activity-summary${rq}`),
    ]);
    barChart(
      document.getElementById("dashFocus"),
      (focus.apps || []).slice(0, 8).map((a) => ({
        processName: a.processName,
        durationMinutes: a.durationMinutes,
      })),
      { labelKey: "processName", valueKey: "durationMinutes", unit: " min" },
    );
    document.getElementById("dashActivity").innerHTML = `
      <p>Buckets: <strong>${activity.bucketCount}</strong></p>
      <p>Teclado: <strong>${activity.keyboardEvents}</strong> · Cliques: <strong>${activity.mouseClicks}</strong></p>
      <p>Ativo: <strong>${activity.activeSec}s</strong> · Idle: <strong>${activity.idleSec}s</strong></p>
    `;
  };
  ({ from, to } = mountDateFilters(document.getElementById("dashFilters"), () => load()));
  await load();
}