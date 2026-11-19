const SESSION_KEY = "madeplant_portal_session";
const ROLE_KEY = "madeplant_portal_role";

export const ROLES = {
  super_admin: { id: "super_admin", label: "Super admin" },
  tenant_admin: { id: "tenant_admin", label: "Admin do tenant" },
  manager: { id: "manager", label: "Gestor" },
  viewer: { id: "viewer", label: "Visualização" },
};

const MENUS = {
  super_admin: ["dashboard", "stations", "timeline", "screenshots", "activity", "reports", "workday", "admin"],
  tenant_admin: ["dashboard", "stations", "timeline", "screenshots", "activity", "reports", "workday"],
  manager: ["dashboard", "stations", "timeline", "screenshots", "activity", "reports"],
  viewer: ["dashboard", "stations", "timeline", "reports"],
};

export function getRoleId() {
  return localStorage.getItem(ROLE_KEY) || "tenant_admin";
}

export function setRoleId(id) {
  if (ROLES[id]) localStorage.setItem(ROLE_KEY, id);
}

export function canAccess(menuId) {
  const role = getRoleId();
  return (MENUS[role] || MENUS.tenant_admin).includes(menuId);
}

export function isAuthenticated() {
  if (import.meta.env.PROD && !import.meta.env.VITE_ADMIN_API_KEY) return true;
  return Boolean(sessionStorage.getItem(SESSION_KEY) || import.meta.env.VITE_ADMIN_API_KEY);
}

export function login(name) {
  sessionStorage.setItem(SESSION_KEY, name || "Lab");
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function displayName() {
  return sessionStorage.getItem(SESSION_KEY) || "Administrador (lab)";
}