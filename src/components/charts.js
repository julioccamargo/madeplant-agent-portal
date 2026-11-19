export function barChart(container, items, { labelKey, valueKey, unit = "" }) {
  container.innerHTML = "";
  if (!items?.length) {
    container.innerHTML = "<p class='muted'>(sem dados)</p>";
    return;
  }
  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);
  for (const item of items) {
    const row = document.createElement("div");
    row.className = "bar-row";
    const val = Number(item[valueKey]) || 0;
    const pct = Math.round((val / max) * 100);
    row.innerHTML = `
      <span class="bar-label">${item[labelKey]}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
      <span class="bar-value">${val}${unit}</span>
    `;
    container.appendChild(row);
  }
}