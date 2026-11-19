/** Paleta alinhada ao portal legado (até API de categorias existir). */
export const CATEGORY_META = {
  work: { key: "work", label: "Uso de trabalho", color: "var(--color-work)" },
  personal: { key: "personal", label: "Uso pessoal", color: "var(--color-personal)" },
  unapproved: { key: "unapproved", label: "Uso pessoal não aprovado", color: "var(--color-unapproved)" },
  unclassified: { key: "unclassified", label: "Não classificado", color: "var(--color-unclassified)" },
  idle: { key: "idle", label: "Tempo ocioso", color: "var(--color-idle)" },
};

export function focusToCategorySlices(apps, activity) {
  const active = Number(activity?.activeSec) || 0;
  const idle = Number(activity?.idleSec) || 0;
  const total = active + idle || 1;
  const classifiedMin =
    (apps || []).reduce((s, a) => s + (Number(a.durationMinutes) || 0), 0) * 60;
  const workSec = Math.min(active, classifiedMin);
  const unclassifiedSec = Math.max(0, active - workSec);
  return [
    { name: CATEGORY_META.work.label, value: workSec, fill: CATEGORY_META.work.color },
    { name: CATEGORY_META.unclassified.label, value: unclassifiedSec, fill: CATEGORY_META.unclassified.color },
    { name: CATEGORY_META.idle.label, value: idle, fill: CATEGORY_META.idle.color },
  ].filter((s) => s.value > 0);
}