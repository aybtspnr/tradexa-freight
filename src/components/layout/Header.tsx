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
      className="relative z-50"
      style={{
        borderBottom: "1px solid #e2e8f0",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline shrink-0" aria-label="Página inicial TradeXa Fretes">
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
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  color: isActive ? "#2563eb" : "#475569",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.15s",
                }}
                aria-current={isActive ? "page" : undefined}
                className="hover:text-[#2563eb]"
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            style={{
              color: "#475569",
              textDecoration: "none",
              fontSize: 14,
            }}
            className="hover:text-[#2563eb]"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              padding: "7px 18px",
              borderRadius: 8,
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Cadastrar
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="w-5 h-5 text-[#475569]" />
          ) : (
            <Menu className="w-5 h-5 text-[#475569]" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sm:hidden border-t border-[#e2e8f0] bg-white"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex flex-col py-2" style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 24px" }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    color: isActive ? "#2563eb" : "#1e293b",
                    textDecoration: "none",
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 400,
                    padding: "12px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                color: "#1e293b",
                textDecoration: "none",
                fontSize: 15,
                padding: "12px 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              onClick={() => setMenuOpen(false)}
              className="mt-3 mb-2 text-center"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                padding: "12px 18px",
                borderRadius: 10,
              }}
            >
              Cadastrar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
