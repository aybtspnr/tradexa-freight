import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/como-funciona", label: "Como Funciona" },
  { to: "/planos", label: "Planos" },
  { to: "/contato", label: "Contato" },
];

export function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Navegação principal"
      className="relative z-50 border-b border-[#e2e8f0] bg-white"
    >
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 no-underline" aria-label="Página inicial TradeXa Fretes">
          <img
            src="/logo-fretes.png"
            alt="TradeXa Fretes"
            width={220}
            height={73}
            className="h-12 w-auto"
            loading="eager"
            fetchPriority="high"
          />
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm no-underline transition-colors hover:text-[#2563eb] ${
                  isActive ? "font-semibold text-[#2563eb]" : "font-normal text-[#475569]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            className="text-sm text-[#475569] no-underline transition-colors hover:text-[#2563eb]"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="rounded-lg bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-[18px] py-[7px] text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
          >
            Cadastrar
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 sm:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="h-5 w-5 text-[#475569]" />
          ) : (
            <Menu className="h-5 w-5 text-[#475569]" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute left-0 right-0 top-full z-50 border-t border-[#e2e8f0] bg-white shadow-lg sm:hidden"
        >
          <div className="mx-auto flex max-w-[1100px] flex-col px-6 py-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`border-b border-[#f1f5f9] py-3 text-[15px] no-underline ${
                    isActive ? "font-semibold text-[#2563eb]" : "font-normal text-[#1e293b]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#f1f5f9] py-3 text-[15px] text-[#1e293b] no-underline"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              onClick={() => setMenuOpen(false)}
              className="my-3 mb-2 rounded-lg bg-gradient-to-r from-[#2563eb] to-[#3b82f6] py-3 text-center text-[15px] font-semibold text-white no-underline"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
