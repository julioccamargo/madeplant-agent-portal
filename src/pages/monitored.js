import { placeholderPage } from "../components/placeholder.js";

export async function renderMonitored(main) {
  main.innerHTML = placeholderPage("Pessoas monitoradas", [
    "Hierarquia gestor → equipe",
    "Vincular device a colaborador",
    "Opt-in e políticas LGPD",
  ]);
}