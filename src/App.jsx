import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { isAuthenticated } from "./lib/auth";
import { DashboardPage } from "./pages/DashboardPage";
import {
  ActivityPage,
  ReportsPage,
  ScreenshotsPage,
  StationsPage,
  TimelinePage,
} from "./pages/DataPages";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

function RequireAuth({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="stations" element={<StationsPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="screenshots" element={<ScreenshotsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="workday"
          element={
            <PlaceholderPage
              title="Jornada"
              bullets={["Horário contratual", "Comparativo ativo vs jornada", "Alertas de desvio"]}
            />
          }
        />
        <Route
          path="admin"
          element={
            <PlaceholderPage title="Administração" bullets={["Usuários e tenants", "Políticas de coleta", "Enroll"]} />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}