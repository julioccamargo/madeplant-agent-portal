const apiBase = import.meta.env.VITE_API_BASE || "";
const adminKey = import.meta.env.VITE_ADMIN_API_KEY || "";

let lastFocusRows = [];

function headers() {
  return { "X-Admin-Key": adminKey };
}

function toIsoLocalInput(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function localInputToIso(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function rangeQuery() {
  const from = localInputToIso(fromInput.value);
  const to = localInputToIso(toInput.value);
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function api(pathWithQuery) {
  const res = await fetch(`${apiBase}${pathWithQuery}`, { headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${pathWithQuery} — ${body.slice(0, 120)}`);
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
const fromInput = document.getElementById("fromInput");
const toInput = document.getElementById("toInput");
const refreshBtn = document.getElementById("refreshBtn");
const preset24h = document.getElementById("preset24h");
const preset7d = document.getElementById("preset7d");
const exportFocusCsv = document.getElementById("exportFocusCsv");
const rangeHint = document.getElementById("rangeHint");
const focusTableBody = document.querySelector("#focusTable tbody");
const focusMeta = document.getElementById("focusMeta");
const activityCard = document.getElementById("activityCard");
const eventsTable = document.querySelector("#eventsTable tbody");
const eventType = document.getElementById("eventType");
const shots = document.getElementById("shots");
const shotsEmpty = document.getElementById("shotsEmpty");

function setPresetHours(hours) {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  toInput.value = toIsoLocalInput(end);
  fromInput.value = toIsoLocalInput(start);
}

async function loadDevices() {
  const data = await api("/admin/v1/devices?tenant=lab");
  deviceSelect.innerHTML = "";
  for (const d of data.devices) {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = `${d.hostname} (v${d.agentVersion || "?"})`;
    deviceSelect.appendChild(opt);
  }
  if (data.devices.length) {
    await refreshAll();
  }
}

function renderFocus(focus) {
  lastFocusRows = focus.apps || [];
  focusTableBody.innerHTML = "";
  for (const a of lastFocusRows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${a.processName}</td><td>${a.durationMinutes}</td><td>${a.focusSegments ?? "—"}</td>`;
    focusTableBody.appendChild(tr);
  }
  if (!lastFocusRows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="3">(sem dados de foco no período)</td>`;
    focusTableBody.appendChild(tr);
  }
  const totalMin = focus.totalDurationMinutes ?? focus.totalMinutes;
  focusMeta.textContent = [
    focus.source ? `Fonte: ${focus.source}` : "",
    totalMin != null ? `Total: ${totalMin} min` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function exportFocusCsvClick() {
  if (!lastFocusRows.length) return;
  const lines = ["processName,durationMinutes,focusSegments"];
  for (const a of lastFocusRows) {
    lines.push(`${JSON.stringify(a.processName)},${a.durationMinutes},${a.focusSegments ?? ""}`);
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `focus-${deviceSelect.value}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function refreshAll() {
  const id = deviceSelect.value;
  if (!id) return;

  rangeHint.textContent = `Período: ${fromInput.value || "—"} → ${toInput.value || "agora"}`;

  const rq = rangeQuery();
  const evQ = `/admin/v1/devices/${id}/events?limit=120${
    eventType.value ? `&eventType=${encodeURIComponent(eventType.value)}` : ""
  }${rq ? `&${rq.slice(1)}` : ""}`;

  const [focus, activity, events, screenshots] = await Promise.all([
    api(`/admin/v1/devices/${id}/focus-summary${rq}`),
    api(`/admin/v1/devices/${id}/activity-summary${rq}`),
    api(evQ),
    api(`/admin/v1/devices/${id}/screenshots?limit=24${rq ? `&${rq.slice(1)}` : ""}`),
  ]);

  renderFocus(focus);

  activityCard.textContent = `Buckets: ${activity.bucketCount}\nTeclado: ${activity.keyboardEvents}\nCliques: ${activity.mouseClicks}\nAtivo: ${activity.activeSec}s · Idle: ${activity.idleSec}s`;

  eventsTable.innerHTML = "";
  for (const ev of events.events) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${new Date(ev.occurredAt).toLocaleString()}</td><td>${ev.eventType}</td><td>${summarizePayload(ev)}</td>`;
    eventsTable.appendChild(tr);
  }

  shots.innerHTML = "";
  const list = screenshots.screenshots || [];
  shotsEmpty.hidden = list.length > 0;
  for (const s of list) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = s.capturedAt;
    img.title = new Date(s.capturedAt).toLocaleString();
    const path = s.contentUrl?.startsWith("http") ? s.contentUrl : `${apiBase || ""}${s.contentUrl}`;
    try {
      const res = await fetch(path, { headers: headers() });
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

deviceSelect.addEventListener("change", () => refreshAll().catch(showError));
eventType.addEventListener("change", () => refreshAll().catch(showError));
refreshBtn.addEventListener("click", () => refreshAll().catch(showError));
preset24h.addEventListener("click", () => {
  setPresetHours(24);
  refreshAll().catch(showError);
});
preset7d.addEventListener("click", () => {
  setPresetHours(24 * 7);
  refreshAll().catch(showError);
});
exportFocusCsv.addEventListener("click", exportFocusCsvClick);

function showError(err) {
  console.error(err);
  activityCard.textContent = `Erro: ${err.message}`;
}

if (import.meta.env.DEV && !adminKey) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    "<p class='banner-warn'>Dev: defina VITE_ADMIN_API_KEY em .env.local. Produção (Docker): use proxy nginx + ADMIN_API_KEY no container.</p>",
  );
}

setPresetHours(24);
loadDevices().catch(showError);