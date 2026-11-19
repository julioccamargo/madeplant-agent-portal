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
    throw new Error(`${res.status} — ${body.slice(0, 160)}`);
  }
  return res.json();
}

export function summarizePayload(ev) {
  try {
    const p = typeof ev.payload === "string" ? JSON.parse(ev.payload) : ev.payload;
    if (!p) return "";
    if (ev.eventType === "input.activity") {
      return `Teclado ${p.keyboardEventCount} · Cliques ${p.mouseClickCount} · Ativo ${p.activeSec}s`;
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

export function toIsoFromLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function buildRangeQuery(from, to) {
  const q = new URLSearchParams();
  const f = toIsoFromLocal(from);
  const t = toIsoFromLocal(to);
  if (f) q.set("from", f);
  if (t) q.set("to", t);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function defaultRangeHours(hours = 24) {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const local = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { from: local(start), to: local(end) };
}