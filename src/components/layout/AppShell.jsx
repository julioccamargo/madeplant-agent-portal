import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  AppWindow,
  Camera,
  Clock,
  LayoutDashboard,
  LogOut,
  Monitor,
  FileBarChart,
  Settings,
} from "lucide-react";
import { canAccess, displayName, getRoleId, logout, ROLES, setRoleId } from "../../lib/auth";

const NAV = [
  { id: "dashboard", to: "/", label: "Summary", icon: LayoutDashboard },
  { id: "stations", to: "/stations", label: "Estações", icon: Monitor },
  { id: "timeline", to: "/timeline", label: "Timeline", icon: Clock },
  { id: "screenshots", to: "/screenshots", label: "Screenshots", icon: Camera },
  { id: "activity", to: "/activity", label: "Teclado / mouse", icon: Activity },
  { id: "reports", to: "/reports", label: "Relatórios", icon: FileBarChart },
  { id: "workday", to: "/workday", label: "Jornada", icon: AppWindow },
  { id: "admin", to: "/admin", label: "Administração", icon: Settings },
];

export function AppShell() {
  const navigate = useNavigate();
  const roleId = getRoleId();

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-white px-3 py-5">
        <button
          type="button"
          className="mb-6 flex items-center gap-2 rounded-xl px-2 py-1 text-left"
          onClick={() => navigate("/")}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            M
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-900">Madeplant</span>
            <span className="block text-xs text-slate-500">Monitoramento</span>
          </span>
        </button>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.filter((n) => canAccess(n.id)).map(({ id, to, label, icon: Icon }) => (
            <NavLink
              key={id}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs">
          <p className="px-2 text-slate-600">
            {displayName()}
            <span className="block text-slate-400">{ROLES[roleId]?.label}</span>
          </p>
          <select
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            {Object.values(ROLES).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} (preview)
              </option>
            ))}
          </select>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-slate-600 hover:bg-slate-50"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}