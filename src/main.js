const apiBase = import.meta.env.VITE_API_BASE || "";
const adminKey = import.meta.env.VITE_ADMIN_API_KEY || "";

function headers() {
  return { "X-Admin-Key": adminKey };
}

async function api(path) {
  const res = await fetch(`${apiBase}${path}`, { headers: headers() });
  if (!res.ok) {
    throw new Error(`${res.status} ${path}`);
  }
  return res.json();
}

function summarizePayload(ev) {
  try {
    const p = typeof ev.payload === "string" ? JSON.parse(ev.payload) : ev.payload;
    if (!p) return "";
    if (ev.eventType === "input.activity") {
      return `kbd ${p.keyboardEventCount} · cliques ${p.mouseClickCount} · ativo ${p.activeSec}s`;
    }
  if (ev.eventType.startsWith("window.focus")) {
      const host = p.host ? ` · ${p.host}` : "";
      return `${p.processName || ""} · ${(p.windowTitle || "").slice(0, 80)}${host}`;
    }
    return JSON.stringify(p).slice(0, 120);
  } catch {
    return String(ev.payload || "").slice(0, 120);
  }
}

const deviceSelect = document.getElementById("deviceSelect");
const focusCard = document.getElementById("focusCard");
const activityCard = document.getElementById("activityCard");
const eventsTable = document.querySelector("#eventsTable tbody");
const eventType = document.getElementById("eventType");
const shots = document.getElementById("shots");

async function loadDevices() {
  const data = await api("/admin/v1/devices?tenant=lab");
  deviceSelect.innerHTML = "";
  for (const d of data.devices) {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = `${d.hostname} (${d.agentVersion || "?"})`;
    deviceSelect.appendChild(opt);
  }
  if (data.devices.length) {
    await refreshAll();
  }
}

async function refreshAll() {
  const id = deviceSelect.value;
  if (!id) return;

  const [focus, activity, events, screenshots] = await Promise.all([
    api(`/admin/v1/devices/${id}/focus-summary`),
    api(`/admin/v1/devices/${id}/activity-summary`),
    api(
      `/admin/v1/devices/${id}/events?limit=80${
        eventType.value ? `&eventType=${encodeURIComponent(eventType.value)}` : ""
      }`,
    ),
    api(`/admin/v1/devices/${id}/screenshots?limit=12`),
  ]);

  focusCard.textContent = focus.apps
    .map((a) => `${a.processName}: ${a.durationMinutes} min`)
    .join("\n") || "(sem dados de foco)";

  activityCard.textContent = `Buckets: ${activity.bucketCount}\nTeclado: ${activity.keyboardEvents}\nCliques: ${activity.mouseClicks}\nAtivo: ${activity.activeSec}s · Idle: ${activity.idleSec}s`;

  eventsTable.innerHTML = "";
  for (const ev of events.events) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${new Date(ev.occurredAt).toLocaleString()}</td><td>${ev.eventType}</td><td>${summarizePayload(ev)}</td>`;
    eventsTable.appendChild(tr);
  }

  shots.innerHTML = "";
  for (const s of screenshots.screenshots) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = s.capturedAt;
    img.title = new Date(s.capturedAt).toLocaleString();
    try {
      const res = await fetch(`${apiBase}${s.contentUrl}`, { headers: headers() });
      if (res.ok) {
        const blob = await res.blob();
        img.src = URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn(e);
    }
    shots.appendChild(img);
  }
}

deviceSelect.addEventListener("change", () => refreshAll().catch(console.error));
eventType.addEventListener("change", () => refreshAll().catch(console.error));

if (!adminKey) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    "<p style='background:#fecaca;padding:8px'>Defina VITE_ADMIN_API_KEY no .env.local</p>",
  );
}

loadDevices().catch((err) => {
  console.error(err);
  focusCard.textContent = `Erro: ${err.message}`;
});