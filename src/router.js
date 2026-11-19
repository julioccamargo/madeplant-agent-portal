const routes = new Map();

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  if (!raw || raw === "login") return { path: raw || "dashboard", param: undefined };
  const parts = raw.split("/").filter(Boolean);
  const path = parts[0] || "dashboard";
  const param = parts.slice(1).join("/") || undefined;
  if (path === "admin" && !param) return { path: "admin", param: "tenant" };
  return { path, param };
}

export async function navigate(path, param) {
  const suffix = param ? `/${param}` : "";
  const hash = `#/${path}${suffix}`;
  if (location.hash !== hash) location.hash = hash;
  else await render();
}

export async function render() {
  const { path, param } = parseHash();
  const handler = routes.get(path);
  const main = document.getElementById("page");
  const sidebar = document.getElementById("sidebar");
  if (!main) return;

  const isLogin = path === "login";
  document.getElementById("app")?.classList.toggle("login-layout", isLogin);
  if (sidebar) sidebar.hidden = isLogin;

  if (!isLogin) {
    const { ensureAuth, mountShell } = await import("./layout/shell.js");
    if (!ensureAuth()) return;
    mountShell();
  }

  main.innerHTML = "<p class='muted'>Carregando…</p>";
  try {
    if (handler) await handler(main, param);
    else main.innerHTML = "<p class='muted'>Rota não encontrada.</p>";
    if (isLogin) {
      const { bindLoginForm } = await import("./layout/shell.js");
      bindLoginForm();
    }
  } catch (err) {
    console.error(err);
    main.innerHTML = `<p class='banner-warn'>Erro: ${err.message}</p>`;
  }
}

export function startRouter() {
  if (!location.hash || location.hash === "#") location.hash = "#/dashboard";
  window.addEventListener("hashchange", () => render().catch(console.error));
  return render();
}