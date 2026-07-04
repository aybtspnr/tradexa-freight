import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard, MapPin, Table, Truck, Users,
  DollarSign, Package, FileText, Bell, BarChart3,
  Share2, FileSignature, Link2, Settings, LogOut,
  ChevronDown, Menu, X, MoreHorizontal,
} from "lucide-react";

const sidebarLinks = [
  { to: "/carrier/missoes",   label: "Missões",       icon: LayoutDashboard },
  { to: "/carrier/rotas",     label: "Rotas",         icon: MapPin },
  { to: "/carrier/tabelas",   label: "Tabelas",       icon: Table },
  { to: "/carrier/frota",     label: "Frota",         icon: Truck },
  { to: "/carrier/motoristas",label: "Motoristas",     icon: Users },
  { to: "/carrier/cotacoes",  label: "Cotações",      icon: DollarSign },
  { to: "/carrier/fretes",    label: "Fretes",         icon: Package },
  { to: "/carrier/contratos", label: "Contratos",      icon: FileSignature },
  { to: "/carrier/notificacoes", label: "Notificações", icon: Bell },
  { to: "/carrier/relatorios",label: "Relatórios",     icon: BarChart3 },
  { to: "/carrier/indicar",   label: "Indicar",        icon: Share2 },
  { to: "/carrier/integracoes",label: "Integrações",   icon: Link2 },
  { to: "/carrier/documentos",label: "Documentos",     icon: FileText },
  { to: "/carrier/config",    label: "Configurações",  icon: Settings },
];

/* Top 5 items for the bottom nav */
const bottomNavItems = sidebarLinks.slice(0, 5);
const moreItems = sidebarLinks.slice(5);

export function CarrierLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const isActive = (to: string) => {
    if (to === "/carrier/missoes") return location.pathname === "/carrier" || location.pathname === "/carrier/missoes";
    if (to === "/carrier") return location.pathname === "/carrier";
    return location.pathname.startsWith(to);
  };

  const initials = (profile?.name ?? "T").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-[#0F111A] text-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-6">
          <img
            src="/logo-fretes.png"
            alt="TradeXa Fretes"
            width={74}
            height={32}
            className="h-8 w-auto brightness-0 invert"
          />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all ${
                  active
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-white/40"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] text-sm font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-white">{profile?.name ?? "Transportadora"}</p>
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

      {/* ===== MOBILE TOP HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-[#e2e8f0] bg-white px-4 lg:hidden">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 hover:bg-gray-100">
          {mobileMenuOpen ? <X className="h-5 w-5 text-[#475569]" /> : <Menu className="h-5 w-5 text-[#475569]" />}
        </button>
        <img src="/logo-fretes.png" alt="TradeXa" width={92} height={31} className="h-7 w-auto" />
        <button onClick={handleLogout} className="rounded-lg p-2 hover:bg-gray-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white">
            {initials}
          </div>
        </button>
      </header>

      {/* ===== MOBILE DRAWER MENU ===== */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-72 overflow-y-auto bg-[#0F111A] p-4 text-white lg:hidden">
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium no-underline transition-all ${
                      active
                        ? "bg-[#2563eb] text-white shadow-sm"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-white/40"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Desktop top header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-end gap-4 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-xl px-6 lg:flex">
          <div className="flex items-center gap-2 text-sm text-[#5E6278]">
            <span>TradeXa Fretes</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </header>

        {/* Page content with padding for mobile header + bottom nav */}
        <main className="flex-1 px-4 pb-20 pt-16 lg:pb-0 lg:pt-0 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#e2e8f0] bg-white px-2 pb-safe lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {bottomNavItems.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium no-underline transition-colors ${
                active ? "text-[#2563eb]" : "text-gray-400"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-[#2563eb]" : "text-gray-400"}`} />
              <span className="truncate max-w-[60px] text-center leading-tight">{link.label}</span>
            </Link>
          );
        })}

        {/* "Mais" button */}
        <div className="relative">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors ${moreOpen ? "text-[#2563eb]" : "text-gray-400"}`}
          >
            <MoreHorizontal className={`h-5 w-5 ${moreOpen ? "text-[#2563eb]" : "text-gray-400"}`} />
            <span>Mais</span>
          </button>
          {moreOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
              <div className="absolute bottom-full right-0 z-20 mb-2 w-48 rounded-xl border border-border bg-white p-2 shadow-xl">
                {moreItems.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                        active ? "bg-[#2563eb]/10 text-[#2563eb]" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-[#2563eb]" : "text-gray-400"}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
