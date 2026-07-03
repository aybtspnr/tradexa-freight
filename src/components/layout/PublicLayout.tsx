import type { ReactNode } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user, profile } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip to content – acessibilidade */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-[#2563eb] focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-bold"
      >
        Pular para o conteúdo principal
      </a>
      <Header />
      {user && profile && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-2">
            <p className="text-sm text-text-muted">
              Logado como{" "}
              <span className="font-medium text-text">{profile.name}</span>
              {profile.role === "carrier" && " — Transportadora"}
              {profile.role === "shipper" && " — Cliente"}
            </p>
            <Link
              to={profile.role === "carrier" ? "/carrier" : "/shipper"}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white no-underline transition-colors hover:bg-primary-dark"
            >
              Ir para o Painel
            </Link>
          </div>
        </div>
      )}
      <main id="main-content" className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
