import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CarrierLayout } from "@/components/layout/CarrierLayout";
import { ShipperLayout } from "@/components/layout/ShipperLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Helmet } from "react-helmet-async";

/* Lazy-loaded public pages */
const Home = lazy(() => import("@/app/(public)/Home").then(m => ({ default: m.Home })));
const ComoFunciona = lazy(() => import("@/app/(public)/ComoFunciona").then(m => ({ default: m.ComoFunciona })));
const Planos = lazy(() => import("@/app/(public)/Planos").then(m => ({ default: m.Planos })));
const Contato = lazy(() => import("@/app/(public)/Contato").then(m => ({ default: m.Contato })));
const Login = lazy(() => import("@/app/(public)/Login").then(m => ({ default: m.Login })));
const Cadastro = lazy(() => import("@/app/(public)/Cadastro").then(m => ({ default: m.Cadastro })));
const Privacidade = lazy(() => import("@/app/(public)/Privacidade").then(m => ({ default: m.Privacidade })));
const Termos = lazy(() => import("@/app/(public)/Termos").then(m => ({ default: m.Termos })));

/* Lazy-loaded carrier pages */
const CarrierDashboard = lazy(() => import("@/app/(carrier)/dashboard").then(m => ({ default: m.Dashboard })));
const Rotas = lazy(() => import("@/app/(carrier)/rotas").then(m => ({ default: m.Rotas })));
const Tabelas = lazy(() => import("@/app/(carrier)/tabelas").then(m => ({ default: m.Tabelas })));
const Frota = lazy(() => import("@/app/(carrier)/frota").then(m => ({ default: m.Frota })));
const Motoristas = lazy(() => import("@/app/(carrier)/motoristas").then(m => ({ default: m.Motoristas })));

/* Lazy-loaded shipper pages */
const ShipperDashboard = lazy(() => import("@/app/(shipper)/dashboard").then(m => ({ default: m.Dashboard })));
const ShipperCotacoes = lazy(() => import("@/app/(shipper)/cotacoes").then(m => ({ default: m.Cotacoes })));
const ShipperFretes = lazy(() => import("@/app/(shipper)/fretes").then(m => ({ default: m.Fretes })));
const Cotar = lazy(() => import("@/app/(shipper)/cotar").then(m => ({ default: m.Cotar })));

/* Lazy-loaded carrier new pages */
const CarrierCotacoes = lazy(() => import("@/app/(carrier)/cotacoes").then(m => ({ default: m.Cotacoes })));
const CarrierFretes = lazy(() => import("@/app/(carrier)/fretes").then(m => ({ default: m.Fretes })));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes (with header/footer) ─────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="/como-funciona" element={<Suspense fallback={<PageLoader />}><ComoFunciona /></Suspense>} />
          <Route path="/planos" element={<Suspense fallback={<PageLoader />}><Planos /></Suspense>} />
          <Route path="/contato" element={<Suspense fallback={<PageLoader />}><Contato /></Suspense>} />
          <Route path="/privacidade" element={<Suspense fallback={<PageLoader />}><Privacidade /></Suspense>} />
          <Route path="/termos" element={<Suspense fallback={<PageLoader />}><Termos /></Suspense>} />
        </Route>

        {/* ── Auth routes (standalone) ── */}
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
        <Route path="/cadastro" element={<Suspense fallback={<PageLoader />}><Cadastro /></Suspense>} />

        {/* ── Carrier routes (protected) ────────────────── */}
        <Route
          element={
            <AuthGuard requiredRole="carrier">
              <CarrierLayout />
            </AuthGuard>
          }
        >
          <Route path="/carrier" element={<Suspense fallback={<PageLoader />}><CarrierDashboard /></Suspense>} />
          <Route path="/carrier/rotas" element={<Suspense fallback={<PageLoader />}><Rotas /></Suspense>} />
          <Route path="/carrier/tabelas" element={<Suspense fallback={<PageLoader />}><Tabelas /></Suspense>} />
          <Route path="/carrier/frota" element={<Suspense fallback={<PageLoader />}><Frota /></Suspense>} />
          <Route path="/carrier/motoristas" element={<Suspense fallback={<PageLoader />}><Motoristas /></Suspense>} />
          <Route path="/carrier/cotacoes" element={<Suspense fallback={<PageLoader />}><CarrierCotacoes /></Suspense>} />
          <Route path="/carrier/fretes" element={<Suspense fallback={<PageLoader />}><CarrierFretes /></Suspense>} />
          <Route path="/carrier/documentos" element={<Placeholder title="Documentos" />} />
          <Route path="/carrier/financeiro" element={<Placeholder title="Financeiro" />} />
          <Route path="/carrier/config" element={<Placeholder title="Configurações" />} />
        </Route>

        {/* ── Shipper routes (protected) ────────────────── */}
        <Route
          element={
            <AuthGuard requiredRole="shipper">
              <ShipperLayout />
            </AuthGuard>
          }
        >
          <Route path="/shipper" element={<Suspense fallback={<PageLoader />}><ShipperDashboard /></Suspense>} />
          <Route path="/shipper/cotacoes" element={<Suspense fallback={<PageLoader />}><ShipperCotacoes /></Suspense>} />
          <Route path="/shipper/cotar" element={<Suspense fallback={<PageLoader />}><Cotar /></Suspense>} />
          <Route path="/shipper/fretes" element={<Suspense fallback={<PageLoader />}><ShipperFretes /></Suspense>} />
        </Route>

        {/* ── Fallback ──────────────────────────────────── */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <Helmet>
                <title>Página não encontrada — TradeXa Fretes</title>
                <meta name="description" content="Página não encontrada (Erro 404). A página que você procura não existe, foi movida ou o link está quebrado. Volte para a página inicial da TradeXa Fretes." />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="keywords" content="erro 404, página não encontrada, TradeXa Fretes" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Página não encontrada — TradeXa Fretes" />
                <meta property="og:description" content="Página não encontrada. A página que você procura não existe ou foi movida." />
                <meta property="og:image" content="https://www.tradexafretes.com.br/og-image.webp" />
                <meta property="og:image:secure_url" content="https://www.tradexafretes.com.br/og-image.webp" />
                <meta property="og:image:type" content="image/webp" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Página não encontrada — TradeXa Fretes" />
                <meta property="og:url" content="https://www.tradexafretes.com.br" />
                <meta property="og:site_name" content="TradeXa Fretes" />
                <meta property="og:locale" content="pt_BR" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@tradexafretes" />
                <meta name="twitter:domain" content="www.tradexafretes.com.br" />
                <meta name="twitter:title" content="Página não encontrada — TradeXa Fretes" />
                <meta name="twitter:description" content="Página não encontrada. A página que você procura não existe ou foi movida." />
                <meta name="twitter:image" content="https://www.tradexafretes.com.br/og-image.webp" />
                <meta name="twitter:image:alt" content="Página não encontrada — TradeXa Fretes" />
              </Helmet>
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-text">404</h1>
                  <p className="mt-2 text-text-muted">Página não encontrada</p>
                </div>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="mt-2 text-text-muted">Em construção</p>
      </div>
    </div>
  );
}

export default App;
