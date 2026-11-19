import { placeholderPage } from "../components/placeholder.js";

export async function renderCategories(main) {
  main.innerHTML = placeholderPage("Categorias de aplicativos", [
    "Produtivo / neutro / bloqueado",
    "Regras por processo ou domínio",
    "Relatórios agregados por categoria",
  ]);
}