import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard, DollarSign, Package, Plus,
  Bell, BarChart3, Share2, FileSignature,
  Link2, Settings, LogOut, ChevronDown,
} from "lucide-react";

const sidebarLinks = [
  { to: "/shipper", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shipper/cotar", label: "Nova Cotação", icon: Plus },
  { to: "/shipper/cotacoes", label: "Cotações", icon: DollarSign },
  { to: "/shipper/fretes", label: "Fretes", icon: Package },
  { to: "/shipper/contratos", label: "Contratos", icon: FileSignature },
  { to: "/shipper/notificacoes", label: "Notificações", icon: Bell },
  { to: "/shipper/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/shipper/indicar", label: "Indicar", icon: Share2 },
  { to: "/shipper/integracoes", label: "Integrações", icon: Link2 },
  { to: "/shipper/config", label: "Configurações", icon: Settings },
];

export function ShipperLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0F111A] text-white">
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-6">
          <img
            src="/logo-fretes.jpg"
            alt="TradeXa Fretes"
            width={74}
            height={32}
            className="h-8 w-auto brightness-0 invert"
            loading="lazy"
          />
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.to === "/shipper"
                ? location.pathname === "/shipper"
                : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all ${
                  isActive
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-white/40"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] text-sm font-bold text-white">
              {(profile?.name ?? "C").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-white">{profile?.name ?? "Cliente"}</p>
              <p className="truncate text-xs text-white/40">{profile?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-2 text-sm text-[#5E6278]">
            <LanguageSwitcher />
            <span>TradeXa Fretes</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function LanguageSwitcher() {
  return (
    <select
      className="rounded-lg border border-[#e2e8f0] bg-white px-2 py-1 text-xs font-medium text-[#5E6278] outline-none"
      defaultValue="pt"
      onChange={(e) => {
        document.documentElement.lang = e.target.value;
      }}
    >
      <option value="pt">🇧🇷 PT</option>
      <option value="en">🇺🇸 EN</option>
      <option value="es">🇪🇸 ES</option>
    </select>
  );
}
