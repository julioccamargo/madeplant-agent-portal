import { getRole } from "./roles.js";

const SESSION_KEY = "madeplant_portal_session";

export function isAuthenticated() {
  if (import.meta.env.PROD && !import.meta.env.VITE_ADMIN_API_KEY) {
    return true;
  }
  return Boolean(sessionStorage.getItem(SESSION_KEY) || import.meta.env.VITE_ADMIN_API_KEY);
}

export function login(displayName) {
  sessionStorage.setItem(SESSION_KEY, displayName || "Lab");
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function currentUser() {
  return {
    name: sessionStorage.getItem(SESSION_KEY) || "Administrador (lab)",
    role: getRole(),
  };
}