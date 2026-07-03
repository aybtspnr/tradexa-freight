import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CarrierLayout } from "@/components/layout/CarrierLayout";
import { ShipperLayout } from "@/components/layout/ShipperLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Helmet } from "react-helmet-async";

/* ── Lazy-loaded public pages ──────────────────────────── */
const Home = lazy(() => import("@/app/(public)/Home").then(m => ({ default: m.Home })));
const ComoFunciona = lazy(() => import("@/app/(public)/ComoFunciona").then(m => ({ default: m.ComoFunciona })));
const Planos = lazy(() => import("@/app/(public)/Planos").then(m => ({ default: m.Planos })));
const Contato = lazy(() => import("@/app/(public)/Contato").then(m => ({ default: m.Contato })));
const Login = lazy(() => import("@/app/(public)/Login").then(m => ({ default: m.Login })));
const Cadastro = lazy(() => import("@/app/(public)/Cadastro").then(m => ({ default: m.Cadastro })));
const Privacidade = lazy(() => import("@/app/(public)/Privacidade").then(m => ({ default: m.Privacidade })));
const Termos = lazy(() => import("@/app/(public)/Termos").then(m => ({ default: m.Termos })));
const Ajuda = lazy(() => import("@/app/(public)/Ajuda").then(m => ({ default: m.Ajuda })));
const PortalMotorista = lazy(() => import("@/app/(public)/PortalMotorista").then(m => ({ default: m.PortalMotorista })));

/* ── Lazy-loaded carrier pages ─────────────────────────── */
const CarrierDashboard = lazy(() => import("@/app/(carrier)/dashboard").then(m => ({ default: m.Dashboard })));
const Rotas = lazy(() => import("@/app/(carrier)/rotas").then(m => ({ default: m.Rotas })));
const Tabelas = lazy(() => import("@/app/(carrier)/tabelas").then(m => ({ default: m.Tabelas })));
const Frota = lazy(() => import("@/app/(carrier)/frota").then(m => ({ default: m.Frota })));
const Motoristas = lazy(() => import("@/app/(carrier)/motoristas").then(m => ({ default: m.Motoristas })));
const CarrierCotacoes = lazy(() => import("@/app/(carrier)/cotacoes").then(m => ({ default: m.Cotacoes })));
const CarrierFretes = lazy(() => import("@/app/(carrier)/fretes").then(m => ({ default: m.Fretes })));
const CarrierNotificacoes = lazy(() => import("@/app/(carrier)/notificacoes").then(m => ({ default: m.Notificacoes })));
const CarrierRelatorios = lazy(() => import("@/app/(carrier)/relatorios").then(m => ({ default: m.Relatorios })));
const CarrierIndicar = lazy(() => import("@/app/(carrier)/indicar").then(m => ({ default: m.Indicar })));
const CarrierContratos = lazy(() => import("@/app/(carrier)/contratos").then(m => ({ default: m.Contratos })));
const CarrierIntegracoes = lazy(() => import("@/app/(carrier)/integracoes").then(m => ({ default: m.Integracoes })));
const CarrierConfig = lazy(() => import("@/app/(carrier)/config").then(m => ({ default: m.Config })));

/* ── Lazy-loaded shipper pages ─────────────────────────── */
const ShipperDashboard = lazy(() => import("@/app/(shipper)/dashboard").then(m => ({ default: m.Dashboard })));
const ShipperCotacoes = lazy(() => import("@/app/(shipper)/cotacoes").then(m => ({ default: m.Cotacoes })));
const ShipperFretes = lazy(() => import("@/app/(shipper)/fretes").then(m => ({ default: m.Fretes })));
const Cotar = lazy(() => import("@/app/(shipper)/cotar").then(m => ({ default: m.Cotar })));
const ShipperNotificacoes = lazy(() => import("@/app/(shipper)/notificacoes").then(m => ({ default: m.Notificacoes })));
const ShipperRelatorios = lazy(() => import("@/app/(shipper)/relatorios").then(m => ({ default: m.Relatorios })));
const ShipperIndicar = lazy(() => import("@/app/(shipper)/indicar").then(m => ({ default: m.Indicar })));
const ShipperContratos = lazy(() => import("@/app/(shipper)/contratos").then(m => ({ default: m.Contratos })));
const ShipperIntegracoes = lazy(() => import("@/app/(shipper)/integracoes").then(m => ({ default: m.Integracoes })));
const ShipperConfig = lazy(() => import("@/app/(shipper)/config").then(m => ({ default: m.Config })));

/* ── Admin ──────────────────────────────────────────────── */
const Admin = lazy(() => import("@/app/admin").then(m => ({ default: m.Admin })));

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
        {/* ── Public routes (with header/footer) ─────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="/como-funciona" element={<Suspense fallback={<PageLoader />}><ComoFunciona /></Suspense>} />
          <Route path="/planos" element={<Suspense fallback={<PageLoader />}><Planos /></Suspense>} />
          <Route path="/contato" element={<Suspense fallback={<PageLoader />}><Contato /></Suspense>} />
          <Route path="/privacidade" element={<Suspense fallback={<PageLoader />}><Privacidade /></Suspense>} />
          <Route path="/termos" element={<Suspense fallback={<PageLoader />}><Termos /></Suspense>} />
          <Route path="/ajuda" element={<Suspense fallback={<PageLoader />}><Ajuda /></Suspense>} />
          <Route path="/portal-motorista" element={<Suspense fallback={<PageLoader />}><PortalMotorista /></Suspense>} />
        </Route>

        {/* ── Auth routes (standalone) ──────────────── */}
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
        <Route path="/cadastro" element={<Suspense fallback={<PageLoader />}><Cadastro /></Suspense>} />

        {/* ── Admin (protected) ─────────────────────── */}
        <Route
          element={
            <AuthGuard requiredRole="admin">
              <CarrierLayout />
            </AuthGuard>
          }
        >
          <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
        </Route>

        {/* ── Carrier routes (protected) ───────────── */}
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
          <Route path="/carrier/notificacoes" element={<Suspense fallback={<PageLoader />}><CarrierNotificacoes /></Suspense>} />
          <Route path="/carrier/relatorios" element={<Suspense fallback={<PageLoader />}><CarrierRelatorios /></Suspense>} />
          <Route path="/carrier/indicar" element={<Suspense fallback={<PageLoader />}><CarrierIndicar /></Suspense>} />
          <Route path="/carrier/contratos" element={<Suspense fallback={<PageLoader />}><CarrierContratos /></Suspense>} />
          <Route path="/carrier/integracoes" element={<Suspense fallback={<PageLoader />}><CarrierIntegracoes /></Suspense>} />
          <Route path="/carrier/config" element={<Suspense fallback={<PageLoader />}><CarrierConfig /></Suspense>} />
          <Route path="/carrier/documentos" element={<Placeholder title="Documentos" />} />
          <Route path="/carrier/financeiro" element={<Placeholder title="Financeiro" />} />
        </Route>

        {/* ── Shipper routes (protected) ───────────── */}
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
          <Route path="/shipper/notificacoes" element={<Suspense fallback={<PageLoader />}><ShipperNotificacoes /></Suspense>} />
          <Route path="/shipper/relatorios" element={<Suspense fallback={<PageLoader />}><ShipperRelatorios /></Suspense>} />
          <Route path="/shipper/indicar" element={<Suspense fallback={<PageLoader />}><ShipperIndicar /></Suspense>} />
          <Route path="/shipper/contratos" element={<Suspense fallback={<PageLoader />}><ShipperContratos /></Suspense>} />
          <Route path="/shipper/integracoes" element={<Suspense fallback={<PageLoader />}><ShipperIntegracoes /></Suspense>} />
          <Route path="/shipper/config" element={<Suspense fallback={<PageLoader />}><ShipperConfig /></Suspense>} />
        </Route>

        {/* ── Fallback ─────────────────────────────── */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <Helmet>
                <title>Página não encontrada — TradeXa Fretes</title>
                <meta name="description" content="Página não encontrada (Erro 404). A página que você procura não existe, foi movida ou o link está quebrado. Volte para a página inicial da TradeXa Fretes." />
                <meta name="robots" content="noindex, nofollow" />
              </Helmet>
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="mt-2 text-gray-500">Página não encontrada</p>
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
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-500">Em construção</p>
      </div>
    </div>
  );
}

export default App;
