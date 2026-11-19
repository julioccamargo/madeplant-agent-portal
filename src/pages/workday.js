import { placeholderPage } from "../components/placeholder.js";

export async function renderWorkday(main) {
  main.innerHTML = placeholderPage("Jornada de trabalho", [
    "Horário contratual e tolerâncias por tenant",
    "Comparativo tempo ativo vs jornada",
    "Alertas de sub/sobre jornada",
  ]);
}