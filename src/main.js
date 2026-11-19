import { registerRoute, startRouter } from "./router.js";
import { bindChrome } from "./layout/shell.js";
import { renderLogin } from "./pages/login.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderStations, renderStationDetail } from "./pages/stations.js";
import { renderTimeline } from "./pages/timeline.js";
import { renderScreenshots } from "./pages/screenshots.js";
import { renderActivity } from "./pages/activity.js";
import { renderWorkday } from "./pages/workday.js";
import { renderReports } from "./pages/reports.js";
import { renderCategories } from "./pages/categories.js";
import { renderMonitored } from "./pages/monitored.js";
import { renderAdmin } from "./pages/admin.js";

registerRoute("login", (main) => renderLogin(main));
registerRoute("dashboard", renderDashboard);
registerRoute("stations", (main, param) => (param ? renderStationDetail(main, param) : renderStations(main)));
registerRoute("timeline", renderTimeline);
registerRoute("screenshots", renderScreenshots);
registerRoute("activity", renderActivity);
registerRoute("workday", renderWorkday);
registerRoute("reports", renderReports);
registerRoute("categories", renderCategories);
registerRoute("monitored", renderMonitored);
registerRoute("admin", renderAdmin);

bindChrome();

if (import.meta.env.DEV && !import.meta.env.VITE_ADMIN_API_KEY) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    "<p class='banner-warn'>Dev: defina VITE_ADMIN_API_KEY em .env.local. Produção: proxy nginx + ADMIN_API_KEY.</p>",
  );
}

startRouter().catch(console.error);