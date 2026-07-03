import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { usePlan } from "@/hooks/usePlan";
import { PlanBadge } from "@/components/plan/PlanBadge";

interface NavLink {
  to: string;
  label: string;
  icon: string;
  roles?: ("shipper" | "carrier")[];
  adminOnly?: boolean;
}

const allNavLinks: NavLink[] = [
  { to: "/app", label: "Dashboard", icon: "📊" },
  { to: "/app/cotacoes", label: "Cotações", icon: "📦" },
  { to: "/app/meus-lances", label: "Meus lances", icon: "📋", roles: ["carrier"] },
  { to: "/app/pedidos", label: "Pedidos", icon: "📋" },
  { to: "/app/documentos", label: "Documentos", icon: "📄" },
  { to: "/app/notificacoes", label: "Notificações", icon: "🔔" },
  { to: "/app/rotas", label: "Rotas", icon: "🛣️", roles: ["carrier"] },
  { to: "/app/tabela-precos", label: "Tabela de Preços", icon: "💰", roles: ["carrier"] },
  { to: "/app/frota", label: "Frota", icon: "🚚", roles: ["carrier"] },
  { to: "/app/tradexa", label: "Tradexa", icon: "🔗" },
  { to: "/app/integracoes", label: "Integrações", icon: "🔗" },
  { to: "/app/relatorios", label: "Relatórios", icon: "📊" },
  { to: "/app/indicar", label: "Indicar", icon: "🤝" },
  { to: "/app/perfil", label: "Perfil", icon: "👤" },
  { to: "/app/admin", label: "Admin", icon: "🔧", adminOnly: true },
];

export function AuthLayout() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("shipper");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        supabase.from("profiles").select("role").eq("id", u.id).single().then(({ data }) => {
          if (data?.role) setRole(data.role);
        });
        // Load unread notifications count
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", u.id)
          .eq("read", false)
          .then(({ count }) => setUnreadCount(count ?? 0));
      }
    });
  }, []);

  const navLinks = allNavLinks.filter(
    (l) => (!l.roles || l.roles.includes(role as any)) && (!l.adminOnly || role === "admin")
  );
  const { plan: currentPlan } = usePlan();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform dark:border-gray-700 dark:bg-gray-900 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-700">
          <Link to="/app" className="flex items-center gap-2 no-underline">
            <img src="/logo-fretes.png" alt="Tradexa Fretes" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-3">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
            role === "carrier" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
          }`}>
            {role === "carrier" ? "🚛 Transportadora" : "📦 Embarcador"}
          </span>
          <span className="ml-2">
            <PlanBadge plan={currentPlan} />
          </span>
        </div>

        <nav className="mt-3 space-y-1 px-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 no-underline transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-light"
              onClick={() => setSidebarOpen(false)}
            >
              <span>{link.icon}</span>
              {link.label}
              {link.to === "/app/notificacoes" && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-3 truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden dark:border-gray-700 dark:bg-gray-900">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <img src="/logo-fretes.png" alt="Tradexa Fretes" className="h-7 w-auto" />

          {/* Dark mode toggle in mobile header */}
          <button
            onClick={toggle}
            className="ml-auto rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </header>

        {/* Desktop dark mode toggle */}
        <header className="hidden h-16 items-center justify-end gap-4 border-b border-gray-200 bg-white px-6 lg:flex dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
