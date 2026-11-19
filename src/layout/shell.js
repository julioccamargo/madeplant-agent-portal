import { canAccess, getRole, ROLES, setRole } from "../auth/roles.js";
import { currentUser, isAuthenticated, login, logout } from "../auth/session.js";
import { navigate, parseHash } from "../router.js";

const NAV = [
  { id: "dashboard", hash: "dashboard", label: "Summary" },
  { id: "stations", hash: "stations", label: "Estações" },
  { id: "timeline", hash: "timeline", label: "Timeline" },
  { id: "screenshots", hash: "screenshots", label: "Screenshots" },
  { id: "activity", hash: "activity", label: "Teclado / mouse" },
  { id: "workday", hash: "workday", label: "Jornada" },
  { id: "reports", hash: "reports", label: "Relatórios" },
  { id: "categories", hash: "categories", label: "Categorias" },
  { id: "monitored", hash: "monitored", label: "Monitorados" },
  { id: "admin_tenant", hash: "admin/tenant", label: "Admin tenant" },
  { id: "admin_platform", hash: "admin/platform", label: "Super admin" },
];

export function mountShell() {
  const role = getRole();
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  for (const item of NAV) {
    if (!canAccess(item.id, role)) continue;
    const a = document.createElement("a");
    a.href = `#/${item.hash}`;
    a.textContent = item.label;
    a.dataset.nav = item.id;
    nav.appendChild(a);
  }

  const user = currentUser();
  document.getElementById("userLabel").textContent = `${user.name} · ${user.role.label}`;

  const roleSelect = document.getElementById("roleSelect");
  roleSelect.innerHTML = "";
  for (const r of Object.values(ROLES)) {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.label;
    opt.selected = r.id === role.id;
    roleSelect.appendChild(opt);
  }
}

export function bindChrome() {
  document.getElementById("roleSelect").addEventListener("change", (e) => {
    setRole(e.target.value);
    mountShell();
    const { path, param } = parseHash();
    navigate(path, param);
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    logout();
    location.hash = "#/login";
  });
}

export function ensureAuth() {
  const path = location.hash.replace(/^#\/?/, "").split("/")[0];
  if (path === "login") return;
  if (!isAuthenticated()) {
    location.hash = "#/login";
    return false;
  }
  return true;
}

export function bindLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("loginName").value.trim();
    login(name || "Lab");
    location.hash = "#/dashboard";
  });
  if (import.meta.env.PROD && !import.meta.env.VITE_ADMIN_API_KEY) {
    document.getElementById("loginHint").textContent =
      "Produção: proxy nginx autentica na API. Clique Entrar para continuar.";
  }
}