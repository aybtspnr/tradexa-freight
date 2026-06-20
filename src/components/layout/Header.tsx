import { Link } from "react-router-dom";

const navLinks = [
  { to: "/como-funciona", label: "Como Funciona" },
  { to: "/planos", label: "Planos" },
  { to: "/contato", label: "Contato" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img
            src="/logo-fretes.png"
            alt="TradeXa Fretes"
            className="h-9 w-auto"
          />
        </Link>

        {/* Nav (desktop) */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-text-muted no-underline transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text no-underline transition-colors hover:bg-surface"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline shadow-sm transition-colors hover:bg-primary-dark"
          >
            Cadastrar
          </Link>
        </div>
      </div>
    </header>
  );
}
