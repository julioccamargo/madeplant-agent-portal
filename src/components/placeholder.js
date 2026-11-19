export function placeholderPage(title, bullets) {
  const ul = bullets.map((b) => `<li>${b}</li>`).join("");
  return `
    <header class="page-header"><h2>${title}</h2><span class="badge">API futura</span></header>
    <p class="muted">Estrutura de navegação pronta; dados virão da Agent API / Postgres.</p>
    <ul class="bullets">${ul}</ul>
  `;
}