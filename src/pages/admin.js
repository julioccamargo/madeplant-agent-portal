import { placeholderPage } from "../components/placeholder.js";

export async function renderAdmin(main, scope) {
  if (scope === "platform") {
    main.innerHTML = placeholderPage("Super admin (plataforma)", [
      "CRUD tenants e quotas",
      "Chaves de API e webhooks",
      "Versões do agent e rollout",
    ]);
    return;
  }
  main.innerHTML = placeholderPage("Admin do tenant", [
    "Usuários e convites",
    "Políticas de screenshot e input",
    "Enroll de estações",
  ]);
}