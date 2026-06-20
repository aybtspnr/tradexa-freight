import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/", label: "Início" },
  { to: "/como-funciona", label: "Como Funciona" },
  { to: "/planos", label: "Planos" },
  { to: "/contato", label: "Contato" },
  { to: "/termos", label: "Termos de Uso" },
  { to: "/privacidade", label: "Privacidade" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img
              src="/logo-fretes.png"
              alt="TradeXa Fretes"
              className="h-8 w-auto"
            />
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-text-muted no-underline transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-text-muted">
          &copy; {year} TradeXa Fretes. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
