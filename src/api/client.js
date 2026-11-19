const apiBase = import.meta.env.VITE_API_BASE || "";
const adminKey = import.meta.env.VITE_ADMIN_API_KEY || "";

export function headers() {
  const h = {};
  if (adminKey) h["X-Admin-Key"] = adminKey;
  return h;
}

export async function api(pathWithQuery) {
  const res = await fetch(`${apiBase}${pathWithQuery}`, { headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${pathWithQuery} — ${body.slice(0, 160)}`);
  }
  return res.json();
}

export function summarizePayload(ev) {
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

export function rangeQuery(fromInput, toInput) {
  const toIso = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };
  const from = toIso(fromInput?.value);
  const to = toIso(toInput?.value);
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const s = q.toString();
  return s ? `?${s}` : "";
}