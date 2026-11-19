export const ROLES = {
  super_admin: {
    id: "super_admin",
    label: "Super admin",
    menus: [
      "dashboard",
      "stations",
      "timeline",
      "screenshots",
      "activity",
      "workday",
      "reports",
      "categories",
      "monitored",
      "admin_tenant",
      "admin_platform",
    ],
  },
  tenant_admin: {
    id: "tenant_admin",
    label: "Admin do tenant",
    menus: [
      "dashboard",
      "stations",
      "timeline",
      "screenshots",
      "activity",
      "workday",
      "reports",
      "categories",
      "monitored",
      "admin_tenant",
    ],
  },
  manager: {
    id: "manager",
    label: "Gestor",
    menus: ["dashboard", "stations", "timeline", "activity", "workday", "reports"],
  },
  viewer: {
    id: "viewer",
    label: "Visualização",
    menus: ["dashboard", "stations", "timeline", "reports"],
  },
};

const STORAGE_KEY = "madeplant_portal_role";

export function getRole() {
  return ROLES[localStorage.getItem(STORAGE_KEY)] || ROLES.tenant_admin;
}

export function setRole(roleId) {
  if (ROLES[roleId]) localStorage.setItem(STORAGE_KEY, roleId);
}

export function canAccess(menuId, role = getRole()) {
  return role.menus.includes(menuId);
}