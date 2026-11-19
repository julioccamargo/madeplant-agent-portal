export function mountDateFilters(container, onChange) {
  container.innerHTML = `
    <div class="filters">
      <label>De <input type="datetime-local" id="filterFrom" /></label>
      <label>Até <input type="datetime-local" id="filterTo" /></label>
      <button type="button" id="preset24h">24 h</button>
      <button type="button" id="preset7d">7 dias</button>
      <button type="button" class="primary" id="applyFilters">Aplicar</button>
    </div>
  `;
  const from = container.querySelector("#filterFrom");
  const to = container.querySelector("#filterTo");
  const pad = (n) => String(n).padStart(2, "0");
  const toLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const setHours = (h) => {
    const end = new Date();
    const start = new Date(end.getTime() - h * 3600 * 1000);
    to.value = toLocal(end);
    from.value = toLocal(start);
  };
  setHours(24);
  container.querySelector("#preset24h").onclick = () => setHours(24);
  container.querySelector("#preset7d").onclick = () => setHours(24 * 7);
  container.querySelector("#applyFilters").onclick = () => onChange(from, to);
  return { from, to };
}